'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function deleteCompany(formData: FormData) {
  const companyId = formData.get('companyId') as string;
  const supabase = createClient();
  
  await supabase.from('companies').delete().eq('id', companyId);
  
  revalidatePath('/saved');
}
