'use client';

import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import MissionMetricsContactDetailsTab from '@/components/mission-metrics/workspace-tabs/MissionMetricsContactDetailsTab';
import { Contact } from '@/lib/types';

const mapToContactDetails = (contact: Contact) => ({
  id: contact.id,
  firstName: contact.first_name || '',
  lastName: contact.last_name || '',
  email: contact.email || '',
  phone: contact.phone || '',
  website: contact.website || '',
  jobTitle: contact.job_title || '',
  companyName: contact.organization_name || '',
  country: contact.country || '',
  num_employees: contact.num_employees || '',
  industry: contact.industry || '',
  keywords: contact.keywords || '',
  person_linkedin_url: contact.person_linkedin_url || '',
  company_linkedin_url: contact.company_linkedin_url || '',
  facebook_url: contact.facebook_url || '',
  twitter_url: contact.twitter_url || '',
  address: contact.address || '',
  city: contact.city || '',
  state: contact.state || '',
  annual_revenue: contact.annual_revenue || '',
  tags: contact.tags || [],
  customFields: []
});

export default function ContactDetailsSheet({ contact, isOpen, onOpenChange }: { contact: Contact | null, isOpen: boolean, onOpenChange: (open: boolean) => void }) {
  if (!contact) return null;

  const details = mapToContactDetails(contact);

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-xl overflow-y-auto">
        <SheetHeader className="mb-4">
          <SheetTitle>{details.firstName} {details.lastName}</SheetTitle>
          <SheetDescription>{details.companyName}</SheetDescription>
        </SheetHeader>
        <MissionMetricsContactDetailsTab 
            contactDetails={details} 
            isLoading={false} 
            customFieldDefs={[]} 
        />
      </SheetContent>
    </Sheet>
  );
}
