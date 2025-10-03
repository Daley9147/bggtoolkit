'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function deleteCompany(formData: FormData) {
  const companyId = formData.get('companyId') as string;

  if (!companyId) {
    return { error: 'Company ID is required.' }
  }

  const supabase = createClient()

  // First, delete associated outreach templates due to foreign key constraint
  const { error: templateError } = await supabase
    .from('outreach_templates')
    .delete()
    .eq('company_id', companyId)

  if (templateError) {
    console.error('Error deleting outreach templates:', templateError)
    return { error: 'Failed to delete outreach templates.' }
  }

  // Then, delete the company
  const { error: companyError } = await supabase
    .from('companies')
    .delete()
    .eq('id', companyId)

  if (companyError) {
    console.error('Error deleting company:', companyError)
    return { error: 'Failed to delete company.' }
  }

  revalidatePath('/saved')
  return { success: true }
}
