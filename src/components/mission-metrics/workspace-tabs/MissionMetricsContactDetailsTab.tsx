'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

interface GhlContact {
  id: string;
  locationId: string;
  contactName: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address1: string;
  city: string;
  state: string;
  postalCode: string;
  website: string;
  timezone: string;
  dnd: boolean;
  tags: string[];
  source: string;
  dateAdded: string;
  lastActivity: string;
  companyName?: string;
  customFields?: { id: string; value: string | number }[];
}

interface CustomField {
  id: string;
  name: string;
  value: string | number;
}

interface MissionMetricsContactDetailsTabProps {
  contactDetails: GhlContact | null;
  isLoading: boolean;
  customFieldDefs: CustomField[];
}

export default function MissionMetricsContactDetailsTab({
  contactDetails,
  isLoading,
  customFieldDefs,
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
    return <p className="mt-4">No contact details found for Mission Metrics.</p>;
  }

  return (
    <Card className="mt-4">
      <CardContent className="p-6 space-y-2">
        <p>
          <strong>Email:</strong> {contactDetails.email || 'N/A'}
        </p>
        <p>
          <strong>Phone:</strong> {contactDetails.phone || 'N/A'}
        </p>
        <p>
          <strong>Company:</strong> {contactDetails.companyName || 'N/A'}
        </p>
        <p>
          <strong>Website:</strong> {contactDetails.website || 'N/A'}
        </p>
        <p>
          <strong>Source:</strong> {contactDetails.source || 'N/A'}
        </p>
        <p>
          <strong>Tags:</strong> {contactDetails.tags?.join(', ') || 'N/A'}
        </p>
        {contactDetails.customFields?.map((field) => {
          const fieldName = customFieldMap.get(field.id);
          return field.value && fieldName ? (
            <p key={field.id}>
              <strong>{fieldName}:</strong> {String(field.value)}
            </p>
          ) : null;
        })}
      </CardContent>
    </Card>
  );
}
