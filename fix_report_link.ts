
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '.env') });
dotenv.config({ path: path.resolve(__dirname, '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function fixReportLink() {
  const correctContactId = '0e47243a-2090-4f80-b5a5-e7023622c5e5';
  const reportId = 'd5cfd16d-b723-436e-a638-74dcf1b35121';

  console.log(`Updating report ${reportId} to point to contact ${correctContactId}...`);

  const { error } = await supabase
    .from('mission_metrics_reports')
    .update({ contact_id: correctContactId })
    .eq('id', reportId);

  if (error) {
    console.error('Error updating report:', error);
  } else {
    console.log('Successfully updated report link.');
  }
}

fixReportLink();
