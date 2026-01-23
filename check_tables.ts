import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!; // Use service role to bypass RLS for check
const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
  console.log('Checking pipelines table...');
  const { data, error } = await supabase.from('pipelines').select('*').limit(1);
  if (error) {
    console.error('Error accessing pipelines:', error);
  } else {
    console.log('Pipelines table exists. Rows:', data?.length);
  }

  console.log('Checking opportunities table...');
  const { data: opps, error: oppError } = await supabase.from('opportunities').select('*').limit(1);
  if (oppError) {
    console.error('Error accessing opportunities:', oppError);
  } else {
    console.log('Opportunities table exists. Rows:', opps?.length);
  }
}

check();
