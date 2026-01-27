import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '.env') });
dotenv.config({ path: path.resolve(__dirname, '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase credentials in .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkReports() {
  console.log('Fetching mission_metrics_reports...');
  const { data: reports, error } = await supabase
    .from('mission_metrics_reports')
    .select('*');

  if (error) {
    console.error('Error fetching reports:', error);
    return;
  }

  console.log(`Found ${reports.length} reports.`);
  reports.forEach(r => {
    console.log(`- Report ID: ${r.id}`);
    console.log(`  Contact ID: ${r.contact_id}`);
    console.log(`  User ID: ${r.user_id}`);
    console.log(`  Charity No: ${r.charity_number}`);
    console.log(`  Website: ${r.website_url}`);
    console.log('---');
  });

  console.log('\nFetching contacts...');
  const { data: contacts, error: contactError } = await supabase
    .from('contacts')
    .select('id, organisation_name, email');

    if (contactError) {
        console.error('Error fetching contacts:', contactError);
        return;
    }

    console.log(`Found ${contacts.length} contacts.`);
    contacts.forEach(c => {
        const matchingReport = reports.find(r => r.contact_id === c.id);
        console.log(`- Contact: ${c.organisation_name} (${c.email})`);
        console.log(`  ID: ${c.id}`);
        console.log(`  Has Report? ${matchingReport ? 'YES' : 'NO'}`);
        if (matchingReport) {
            console.log(`     -> Report User ID: ${matchingReport.user_id}`);
        }
    });

}

checkReports();
