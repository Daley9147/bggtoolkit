import imaps from 'imap-simple';
import nodemailer from 'nodemailer';
import { simpleParser } from 'mailparser';
import { createClient } from '@/lib/supabase/server';

export async function getEmailCredentials(userId: string) {
    const supabase = createClient();
    const { data } = await supabase
        .from('email_accounts')
        .select('*')
        .eq('user_id', userId)
        .single();
    
    if (!data) throw new Error('Email settings not configured.');
    return data;
}

export async function fetchEmails(userId: string, folder = 'INBOX', limit = 20) {
    const creds = await getEmailCredentials(userId);

    const config = {
        imap: {
            user: creds.imap_user,
            password: creds.imap_password,
            host: creds.imap_host,
            port: creds.imap_port,
            tls: true,
            tlsOptions: { rejectUnauthorized: false }, 
            authTimeout: 3000
        }
    };

    try {
        const connection = await imaps.connect(config);
        await connection.openBox(folder);

        const searchCriteria = ['ALL'];
        const fetchOptions = {
            bodies: [''], // Fetch the entire raw email
            markSeen: false,
            struct: true
        };
        
        const messages = await connection.search(searchCriteria, fetchOptions);
        
        // Sort descending
        messages.sort((a, b) => b.attributes.date.getTime() - a.attributes.date.getTime());
        
        const recent = messages.slice(0, limit);

        const parsedMessages = await Promise.all(recent.map(async (msg) => {
            const raw = msg.parts.find((part: any) => part.which === '')?.body;
            
            if (!raw) {
                return {
                    id: msg.attributes.uid,
                    seq: msg.seqno,
                    subject: '(No Content)',
                    from: 'Unknown',
                    date: msg.attributes.date,
                    body: '',
                    html: ''
                };
            }

            try {
                // Parse the raw email source
                const parsed = await simpleParser(raw);
                
                return {
                    id: msg.attributes.uid,
                    seq: msg.seqno,
                    subject: parsed.subject || '(No Subject)',
                    from: parsed.from?.text || 'Unknown',
                    date: msg.attributes.date,
                    body: parsed.text || '(No text content)',
                    html: parsed.html || parsed.textAsHtml || parsed.text // Fallback
                };
            } catch (err) {
                console.error('Parse error for msg', msg.seqno, err);
                return {
                    id: msg.attributes.uid,
                    seq: msg.seqno,
                    subject: '(Parse Error)',
                    from: 'Unknown',
                    date: msg.attributes.date,
                    body: 'Failed to parse email.',
                    html: ''
                };
            }
        }));

        connection.end();
        return parsedMessages;

    } catch (error: any) {
        console.error('IMAP Error:', error);
        throw new Error('Failed to fetch emails: ' + error.message);
    }
}

export async function sendEmail(userId: string, to: string, subject: string, html: string) {
    const creds = await getEmailCredentials(userId);

    const transporter = nodemailer.createTransport({
        host: creds.smtp_host,
        port: creds.smtp_port,
        secure: creds.smtp_port === 465, // true for 465, false for other ports
        auth: {
            user: creds.smtp_user,
            pass: creds.smtp_password
        },
        tls: {
            rejectUnauthorized: false
        }
    });

    const info = await transporter.sendMail({
        from: `"${creds.smtp_user}" <${creds.smtp_user}>`, 
        to,
        subject,
        html
    });

    console.log('Email sent info:', JSON.stringify(info, null, 2));

    // Append to Sent folder
    try {
        const config = {
            imap: {
                user: creds.imap_user,
                password: creds.imap_password,
                host: creds.imap_host,
                port: creds.imap_port,
                tls: true,
                tlsOptions: { rejectUnauthorized: false }, 
                authTimeout: 3000
            }
        };

        const connection = await imaps.connect(config);
        await connection.openBox('INBOX.Sent'); // cPanel standard

        // Construct a simple raw email message for appending
        // Note: Ideally we'd get the raw buffer from nodemailer, but reconstructing is often easier for simple cases.
        // A robust solution uses the 'mailcomposer' or 'nodemailer' build routines.
        // Here we will rely on nodemailer's MailComposer which is part of the package implicitly or explicitly.
        // To keep it simple without adding deps, we can try to use the mail object if possible, 
        // but we need to generate the raw MIME source.
        
        // Let's use a new MailComposer instance from nodemailer to generate the raw source
        const MailComposer = require('nodemailer/lib/mail-composer');
        const mail = new MailComposer({
            from: `"${creds.smtp_user}" <${creds.smtp_user}>`,
            to,
            subject,
            html
        });

        const message = await mail.compile().build();
        await connection.append(message, { mailbox: 'INBOX.Sent', flags: ['\\Seen'] });
        
        connection.end();
        console.log('Appended to Sent folder.');

    } catch (appendError) {
        console.error('Failed to append to Sent folder:', appendError);
        // Don't fail the whole request if just appending fails, but log it.
    }

    return info;
}
