'use client';

import { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Inbox, Send, Loader2, RefreshCw, Plus, ArrowLeft } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import dynamic from 'next/dynamic';

interface EmailMessage {
    id: number;
    seq: number;
    subject: string;
    from: string;
    date: string;
    body: string;
    html?: string;
}

export default function EmailClient() {
  const JoditEditor = useMemo(() => dynamic(() => import('jodit-react'), { ssr: false }), []);
  const [messages, setMessages] = useState<EmailMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMessage, setSelectedMessage] = useState<EmailMessage | null>(null);
  const [view, setView] = useState<'inbox' | 'compose' | 'read'>('inbox');
  const [currentFolder, setCurrentFolder] = useState('INBOX');
  const [composeData, setComposeData] = useState({ to: '', subject: '', body: '' });
  const [sending, setSending] = useState(false);
  const [signature, setSignature] = useState('');
  
  // Contact Search State
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  
  const { toast } = useToast();
  
  const editorConfig = useMemo(() => ({
    readonly: false,
    height: 400,
    uploader: {
      url: '/api/user/signature/upload', // Reusing existing upload endpoint if needed
      format: 'json',
      filesVariableName: () => 'files[]',
      isSuccess: (resp: any) => resp.success,
      process: (resp: any) => {
        return {
          files: resp.files.map((f: any) => f.url), 
          path: '',
          baseurl: '',
          error: resp.error,
          msg: resp.error
        };
      },
    }
  }), []);

  useEffect(() => {
    fetchMessages();
    fetchSignature();
  }, [currentFolder]); // Re-fetch when folder changes

  // Debounced search
  useEffect(() => {
      const timer = setTimeout(async () => {
          if (composeData.to.length < 2 || !view || view !== 'compose') {
              setSuggestions([]);
              return;
          }
          // Only search if it doesn't look like a full email yet or if we want to autocomplete names
          // Simple check: if it contains @, maybe we stop searching or refining? 
          // Actually, searching while typing email is fine too.
          
          try {
              const res = await fetch(`/api/mission-metrics/contacts?query=${encodeURIComponent(composeData.to)}`);
              if (res.ok) {
                  const data = await res.json();
                  setSuggestions(data.slice(0, 5)); // Limit to 5
                  setShowSuggestions(true);
              }
          } catch (e) {
              console.error(e);
          }
      }, 300);
      
      return () => clearTimeout(timer);
  }, [composeData.to, view]);

  const selectContact = (contact: any) => {
      const name = `${contact.first_name || ''} ${contact.last_name || ''}`.trim();
      const emailStr = name ? `"${name}" <${contact.email}>` : contact.email;
      setComposeData({ ...composeData, to: emailStr });
      setShowSuggestions(false);
  };

  const fetchSignature = async () => {
      try {
          const res = await fetch('/api/user/profile');
          if (res.ok) {
              const profile = await res.json();
              if (profile?.email_signature) {
                  setSignature(profile.email_signature);
              }
          }
      } catch (e) {
          console.error('Failed to fetch signature', e);
      }
  };

  const handleCompose = () => {
      const initialBody = signature ? `\n\n\n${signature}` : '';
      setComposeData({ to: '', subject: '', body: initialBody });
      setView('compose');
      setSuggestions([]);
  };

  const fetchMessages = async () => {
    setLoading(true);
    try {
        const res = await fetch(`/api/email/messages?folder=${currentFolder}`); // Use currentFolder
        const data = await res.json();
        if (res.ok) {
            setMessages(data);
        } else {
            // Assume 404 or error means no config
            if (data.error && data.error.includes('settings not configured')) {
                toast({ title: 'Setup Required', description: 'Please configure your email settings in Profile or ask an Admin.' });
            } else {
                console.error(data.error);
            }
        }
    } catch (error) {
        console.error(error);
    } finally {
        setLoading(false);
    }
  };

  const handleSend = async () => {
      if (!composeData.to || !composeData.subject) return;
      setSending(true);
      try {
          const res = await fetch('/api/email/send', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                  to: composeData.to,
                  subject: composeData.subject,
                  html: composeData.body // Already HTML from Jodit
              })
          });
          
          if (!res.ok) throw new Error('Failed to send');
          
          toast({ title: 'Sent', description: 'Email sent successfully.' });
          setView('inbox');
          setComposeData({ to: '', subject: '', body: '' });
      } catch (error) {
          toast({ title: 'Error', description: 'Failed to send email.', variant: 'destructive' });
      } finally {
          setSending(false);
      }
  };

  return (
    <div className="flex h-full border rounded-lg overflow-hidden bg-background">
      {/* Sidebar */}
      <div className="w-64 border-r bg-muted/20 p-4 flex flex-col gap-2">
        <Button className="w-full justify-start gap-2 mb-4" onClick={handleCompose}>
            <Plus className="h-4 w-4" /> Compose
        </Button>
        <Button 
            variant={view === 'inbox' && currentFolder === 'INBOX' && !selectedMessage ? 'secondary' : 'ghost'} 
            className="w-full justify-start gap-2" 
            onClick={() => { setView('inbox'); setCurrentFolder('INBOX'); setSelectedMessage(null); }}
        >
            <Inbox className="h-4 w-4" /> Inbox
        </Button>
        <Button 
            variant={view === 'inbox' && currentFolder === 'INBOX.Sent' && !selectedMessage ? 'secondary' : 'ghost'} 
            className="w-full justify-start gap-2"
            onClick={() => { setView('inbox'); setCurrentFolder('INBOX.Sent'); setSelectedMessage(null); }}
        >
            <Send className="h-4 w-4" /> Sent
        </Button>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {view === 'compose' ? (
            <div className="p-6 space-y-4 max-w-2xl mx-auto w-full relative">
                <div className="flex items-center gap-2 mb-4">
                    <Button variant="ghost" size="sm" onClick={() => setView('inbox')}>
                        <ArrowLeft className="h-4 w-4" /> Back
                    </Button>
                    <h2 className="text-xl font-bold">New Message</h2>
                </div>
                
                <div className="relative z-10">
                    <Input 
                        placeholder="To (Name or Email)" 
                        value={composeData.to} 
                        onChange={e => {
                            setComposeData({...composeData, to: e.target.value});
                            if (e.target.value.length < 2) setShowSuggestions(false);
                        }}
                        onFocus={() => {
                             if (suggestions.length > 0) setShowSuggestions(true);
                        }}
                        onBlur={() => {
                             // Delay hiding to allow click event to register
                             setTimeout(() => setShowSuggestions(false), 200);
                        }}
                        autoComplete="off"
                    />
                    {showSuggestions && suggestions.length > 0 && (
                        <div className="absolute top-full left-0 right-0 bg-popover border rounded-md shadow-lg mt-1 max-h-60 overflow-y-auto">
                            {suggestions.map((contact) => (
                                <div 
                                    key={contact.id} 
                                    className="p-2 hover:bg-muted cursor-pointer text-sm"
                                    onClick={() => selectContact(contact)}
                                >
                                    <div className="font-medium">
                                        {contact.first_name} {contact.last_name}
                                        {contact.organization_name && <span className="text-muted-foreground ml-2">({contact.organization_name})</span>}
                                    </div>
                                    <div className="text-xs text-muted-foreground">{contact.email}</div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <Input placeholder="Subject" value={composeData.subject} onChange={e => setComposeData({...composeData, subject: e.target.value})} />
                <JoditEditor
                    value={composeData.body}
                    config={editorConfig}
                    onBlur={newContent => setComposeData({...composeData, body: newContent})}
                />
                <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setView('inbox')}>Discard</Button>
                    <Button onClick={handleSend} disabled={sending}>
                        {sending ? 'Sending...' : 'Send'} <Send className="ml-2 h-4 w-4" />
                    </Button>
                </div>
            </div>
        ) : selectedMessage ? (
            <div className="flex flex-col h-full">
                 <div className="p-4 border-b flex items-center gap-2">
                    <Button variant="ghost" size="icon" onClick={() => setSelectedMessage(null)}>
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <h2 className="font-semibold text-lg truncate">{selectedMessage.subject}</h2>
                </div>
                <div className="p-6 overflow-y-auto flex-1 bg-white">
                    <div className="mb-6 flex justify-between items-start">
                        <div>
                            <p className="font-bold">{selectedMessage.from}</p>
                            <p className="text-xs text-muted-foreground">{new Date(selectedMessage.date).toLocaleString()}</p>
                        </div>
                    </div>
                    <div className="prose max-w-none">
                        {selectedMessage.html ? (
                            <div dangerouslySetInnerHTML={{ __html: selectedMessage.html }} />
                        ) : (
                            <pre className="whitespace-pre-wrap font-sans text-sm">{selectedMessage.body}</pre>
                        )}
                    </div>
                </div>
            </div>
        ) : (
            <div className="flex flex-col h-full">                <div className="p-4 border-b flex justify-between items-center bg-background/50 backdrop-blur">
                    <h2 className="font-semibold">{currentFolder === 'INBOX' ? 'Inbox' : 'Sent'}</h2>
                    <Button variant="ghost" size="icon" onClick={fetchMessages} disabled={loading}>
                        <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                    </Button>
                </div>
                <div className="flex-1 overflow-y-auto p-0">
                    {loading && messages.length === 0 ? (
                        <div className="flex justify-center p-8"><Loader2 className="animate-spin text-muted-foreground" /></div>
                    ) : messages.length === 0 ? (
                        <div className="text-center p-8 text-muted-foreground">No messages found.</div>
                    ) : (
                        <div className="divide-y">
                            {messages.map(msg => (
                                <div 
                                    key={msg.id} 
                                    className="p-4 hover:bg-muted/50 cursor-pointer flex gap-4 items-center transition-colors"
                                    onClick={() => setSelectedMessage(msg)}
                                >
                                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold shrink-0">
                                        {msg.from.charAt(0).toUpperCase()}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-baseline mb-1">
                                            <p className="font-medium truncate pr-2">{msg.from}</p>
                                            <span className="text-xs text-muted-foreground whitespace-nowrap">
                                                {formatDistanceToNow(new Date(msg.date), { addSuffix: true })}
                                            </span>
                                        </div>
                                        <p className="text-sm font-medium truncate">{msg.subject}</p>
                                        <p className="text-xs text-muted-foreground truncate opacity-70">
                                            {msg.body.substring(0, 100)}...
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        )}
      </div>
    </div>
  );
}
