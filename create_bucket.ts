
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

async function createBucket() {
  console.log('Creating "signatures" bucket...');

  const { data, error } = await supabase
    .storage
    .createBucket('signatures', {
      public: true,
      allowedMimeTypes: ['image/png', 'image/jpeg', 'image/gif', 'image/webp'],
      fileSizeLimit: 1024 * 1024 * 2 // 2MB
    });

  if (error) {
    if (error.message.includes('already exists')) {
        console.log('Bucket "signatures" already exists.');
    } else {
        console.error('Error creating bucket:', error);
    }
  } else {
    console.log('Bucket "signatures" created successfully.');
  }
}

createBucket();
