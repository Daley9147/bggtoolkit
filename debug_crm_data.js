const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error("Missing Supabase credentials.");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function debug() {
  console.log('Fetching one contact...');
  const { data: contact, error } = await supabase
    .from('contacts')
    .select('*')
    .limit(1)
    .single();

  if (error) {
    console.error('Error fetching contact:', error);
  } else {
    console.log('Contact found:', contact);
  }
}

debug();
