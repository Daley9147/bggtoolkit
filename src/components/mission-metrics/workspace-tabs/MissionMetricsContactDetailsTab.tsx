'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { RefreshCcw } from 'lucide-react';

interface ContactDetails {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  mobilePhone?: string;
  corporatePhone?: string;
  otherPhone?: string;
  listName?: string;
  website: string;
  jobTitle?: string;
  companyName?: string;
  country?: string;
  num_employees?: string;
  industry?: string;
  keywords?: string;
  person_linkedin_url?: string;
  company_linkedin_url?: string;
  facebook_url?: string;
  twitter_url?: string;
  address?: string;
  city?: string;
  state?: string;
  annual_revenue?: string;
  tags: string[];
  source?: string;
  customFields?: { id: string; value: string | number }[];
}

interface CustomField {
  id: string;
  name: string;
  value: string | number;
}

interface MissionMetricsContactDetailsTabProps {
  contactDetails: ContactDetails | null;
  isLoading: boolean;
  customFieldDefs: CustomField[];
  onRetry?: () => void;
}

export default function MissionMetricsContactDetailsTab({
  contactDetails,
  isLoading,
  customFieldDefs,
  onRetry,
}: MissionMetricsContactDetailsTabProps) {
  const customFieldMap = new Map(
    customFieldDefs.map((field) => [field.id, field.name])
  );

  if (isLoading) {
    return (
      <Card className="mt-4">
        <CardContent className="p-6 space-y-4">
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-4 w-1/3" />
          <Skeleton className="h-4 w-1/4" />
        </CardContent>
      </Card>
    );
  }

  if (!contactDetails) {
    return (
      <div className="flex flex-col items-center justify-center p-8 mt-4 border rounded-lg bg-muted/10">
        <p className="text-muted-foreground mb-4">No contact details found.</p>
        {onRetry && (
          <Button variant="outline" size="sm" onClick={onRetry} className="gap-2">
            <RefreshCcw className="h-3 w-3" />
            Retry Loading
          </Button>
        )}
      </div>
    );
  }

  return (
    <Card className="mt-4">
      <CardContent className="p-6 space-y-4">
        {contactDetails.listName && (
             <div className="mb-4 p-2 bg-blue-50/50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900 rounded-md">
                 <p className="text-xs text-blue-600 dark:text-blue-400 font-medium">List: {contactDetails.listName}</p>
             </div>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div className="space-y-2">
            <p><strong>Email:</strong> {contactDetails.email || 'N/A'}</p>
            
            <div className="space-y-1 pt-2 pb-2">
                <p className="text-muted-foreground text-xs font-semibold uppercase tracking-wider">Phones</p>
                {contactDetails.mobilePhone && <p><strong>Mobile:</strong> {contactDetails.mobilePhone}</p>}
                {contactDetails.corporatePhone && <p><strong>Corporate:</strong> {contactDetails.corporatePhone}</p>}
                {contactDetails.otherPhone && <p><strong>Other:</strong> {contactDetails.otherPhone}</p>}
                {!contactDetails.mobilePhone && !contactDetails.corporatePhone && !contactDetails.otherPhone && (
                    <p><strong>Phone:</strong> {contactDetails.phone || 'N/A'}</p>
                )}
            </div>

            <p><strong>Job Title:</strong> {contactDetails.jobTitle || 'N/A'}</p>
            <p><strong>Company:</strong> {contactDetails.companyName || 'N/A'}</p>
            <p><strong>Website:</strong> {contactDetails.website || 'N/A'}</p>
          </div>
          <div className="space-y-2">
            <p><strong>Industry:</strong> {contactDetails.industry || 'N/A'}</p>
            <p><strong>Employees:</strong> {contactDetails.num_employees || 'N/A'}</p>
            <p><strong>Annual Revenue:</strong> {contactDetails.annual_revenue || 'N/A'}</p>
            <p><strong>Country:</strong> {contactDetails.country || 'N/A'}</p>
            <p><strong>City/State:</strong> {contactDetails.city || 'N/A'}, {contactDetails.state || 'N/A'}</p>
          </div>
        </div>

        <div className="pt-4 border-t space-y-2 text-sm">
          <p><strong>Person LinkedIn:</strong> {contactDetails.person_linkedin_url ? <a href={contactDetails.person_linkedin_url} target="_blank" className="text-blue-600 hover:underline">View Profile</a> : 'N/A'}</p>
          <p><strong>Company LinkedIn:</strong> {contactDetails.company_linkedin_url ? <a href={contactDetails.company_linkedin_url} target="_blank" className="text-blue-600 hover:underline">View Company</a> : 'N/A'}</p>
          <p><strong>Keywords:</strong> {contactDetails.keywords || 'N/A'}</p>
        </div>

        {contactDetails.customFields && contactDetails.customFields.length > 0 && (
          <div className="pt-4 border-t">
            {contactDetails.customFields.map((field) => {
              const fieldName = customFieldMap.get(field.id);
              return field.value && fieldName ? (
                <p key={field.id} className="text-sm">
                  <strong>{fieldName}:</strong> {String(field.value)}
                </p>
              ) : null;
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}