import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(
  request: Request,
  props: { params: Promise<{ contactId: string }> }
) {
  const params = await props.params;
  const { contactId } = params;
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'User not authenticated.' }, { status: 401 });
  }

  if (!contactId) {
    return NextResponse.json({ error: 'Contact ID is required.' }, { status: 400 });
  }

  try {
    const { data: contact, error } = await supabase
      .from('contacts')
      .select('*')
      .eq('id', contactId)
      .eq('user_id', user.id)
      .single();

    if (error) {
      console.error('Error fetching contact:', error);
      return NextResponse.json({ error: 'Contact not found or access denied.' }, { status: 404 });
    }

    const formattedContact = {
      id: contact.id,
      firstName: contact.first_name,
      lastName: contact.last_name,
      jobTitle: contact.job_title,
      email: contact.email,
      phone: contact.phone,
      mobilePhone: contact.mobile_phone,
      corporatePhone: contact.corporate_phone,
      otherPhone: contact.other_phone,
      listName: contact.list_name,
      website: contact.website,
      identifier: contact.identifier,
      country: contact.country,
      num_employees: contact.num_employees,
      industry: contact.industry,
      keywords: contact.keywords,
      person_linkedin_url: contact.person_linkedin_url,
      company_linkedin_url: contact.company_linkedin_url,
      facebook_url: contact.facebook_url,
      twitter_url: contact.twitter_url,
      address: contact.address,
      city: contact.city,
      state: contact.state,
      annual_revenue: contact.annual_revenue,
      tags: contact.tags || [],
      companyName: contact.organisation_name,
    };

    return NextResponse.json(formattedContact);

  } catch (error) {
    console.error('Unexpected error fetching contact:', error);
    return NextResponse.json({ error: 'An unexpected error occurred.' }, { status: 500 });
  }
}