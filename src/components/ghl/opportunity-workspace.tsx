'use client';

import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';

// This matches the Opportunity interface in toolkit-client.tsx
interface Opportunity {
  id: string;
  name: string;
  monetaryValue: number;
  pipelineId: string;
  pipelineStageId: string;
  pipelineStage: {
    name: string;
  };
  contact: {
    id: string;
    name: string;
  };
  lastStageChangeAt: string;
}

interface Pipeline {
  id: string;
  name: string;
  stages: {
    id: string;
    name: string;
  }[];
}

interface OpportunityWorkspaceProps {
  opportunity: Opportunity | null;
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onOpportunityUpdate: () => void;
  pipelines: Pipeline[];
  outreachPlan: any;
  onPlanGenerated: (opportunityId: string, plan: any) => void;
}

import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ReactMarkdown from 'react-markdown';
import { Skeleton } from '@/components/ui/skeleton';

// ... (imports and interfaces)

interface CustomField {
  id: string;
  name: string;
  value: string | number;
}

export default function OpportunityWorkspace({
  opportunity,
  isOpen,
  onOpenChange,
  onOpportunityUpdate,
  pipelines,
  outreachPlan,
  onPlanGenerated,
}: OpportunityWorkspaceProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncSuccess, setSyncSuccess] = useState(false);
  const [syncError, setSyncError] = useState<string | null>(null);
  const [selectedStage, setSelectedStage] = useState<string | undefined>(undefined);
  const [isUpdatingStage, setIsUpdatingStage] = useState(false);
  const [stageUpdateSuccess, setStageUpdateSuccess] = useState(false);
  const [stageUpdateError, setStageUpdateError] = useState<string | null>(null);
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [sendEmailSuccess, setSendEmailSuccess] = useState(false);
  const [sendEmailError, setSendEmailError] = useState<string | null>(null);
  const [callNotes, setCallNotes] = useState('');
  const [isLoggingCall, setIsLoggingCall] = useState(false);
  const [logCallSuccess, setLogCallSuccess] = useState(false);
  const [logCallError, setLogCallError] = useState<string | null>(null);
  const [contactDetails, setContactDetails] = useState<GhlContact | null>(null);
  const [isContactLoading, setIsContactLoading] = useState(false);
  const [customFieldDefs, setCustomFieldDefs] = useState<CustomField[]>([]);
  const [notes, setNotes] = useState<{ id: string; body: string; dateAdded: string }[]>([]);
  const [isNotesLoading, setIsNotesLoading] = useState(false);
  const [homepageUrl, setHomepageUrl] = useState('');
  const [caseStudyUrl, setCaseStudyUrl] = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isRerunningResearch, setIsRerunningResearch] = useState(false);

  const customFieldMap = new Map(customFieldDefs.map(field => [field.id, field.name]));

  const handleRunResearch = async () => {
    if (!opportunity?.contact?.id) {
      setError('Contact ID is missing for this opportunity.');
      return;
    }
    setIsLoading(true);
    setError(null);
    setSyncSuccess(false);
    setSyncError(null);
    setSaveSuccess(false);

    try {
      const response = await fetch('/api/ghl/generate-outreach', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contactId: opportunity.contact.id,
          homepageUrl,
          caseStudyUrl,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate outreach plan');
      }

      const plan = await response.json();
      onPlanGenerated(opportunity.id, plan);
      setSaveSuccess(true); // Auto-saved on generation
      setIsRerunningResearch(false); // Switch back to showing the plan
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSyncNotes = async () => {
    if (!opportunity?.contact?.id || !outreachPlan?.insights) return;
    setIsSyncing(true);
    setSyncSuccess(false);
    setSyncError(null);

    try {
      const response = await fetch('/api/ghl/add-note', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contactId: opportunity.contact.id,
          note: outreachPlan.insights
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to sync notes');
      }
      setSyncSuccess(true);
      fetchNotes(); // Re-fetch notes after adding a new one
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'An unknown error occurred';
      setSyncError(message);
    } finally {
      setIsSyncing(false);
    }
  };

  const fetchNotes = async () => {
    if (!opportunity?.contact?.id) return;
    setIsNotesLoading(true);
    try {
      const response = await fetch(`/api/ghl/notes/${opportunity.contact.id}`);
      if (!response.ok) throw new Error('Failed to fetch notes');
      const data = await response.json();
      setNotes(data);
    } catch (error) {
      console.error(error);
    } finally {
      setIsNotesLoading(false);
    }
  };

  // Reset state when the sheet is closed or the opportunity changes
  useEffect(() => {
    if (isOpen && opportunity) {
      setError(null);
      setIsLoading(false);
      setSyncSuccess(false);
      setSyncError(null);
      setSelectedStage(opportunity.pipelineStageId);
      setStageUpdateSuccess(false);
      setStageUpdateError(null);
      setContactDetails(null);
      setNotes([]);
      setHomepageUrl('');
      setCaseStudyUrl('');
      setSaveSuccess(false);
      setIsRerunningResearch(false);

      const fetchCustomFieldDefs = async () => {
        try {
          const response = await fetch('/api/ghl/custom-fields');
          if (!response.ok) throw new Error('Failed to fetch custom field definitions');
          const data = await response.json();
          setCustomFieldDefs(data);
        } catch (error) {
          console.error(error);
        }
      };

      const fetchContactDetails = async () => {
        if (!opportunity.contact?.id) return;
        setIsContactLoading(true);
        try {
          const response = await fetch(`/api/ghl/contact/${opportunity.contact.id}`);
          if (!response.ok) throw new Error('Failed to fetch contact details');
          const data = await response.json();
          setContactDetails(data);
          if (data.website) {
            setHomepageUrl(data.website);
          } 
        } catch (error) {
          console.error(error);
        } finally {
          setIsContactLoading(false);
        }
      };

      fetchCustomFieldDefs();
      fetchContactDetails();
      fetchNotes();
    }
  }, [isOpen, opportunity]);

  const handleStageChange = async (stageId: string) => {
    if (!opportunity) return;
    setIsUpdatingStage(true);
    setStageUpdateSuccess(false);
    setStageUpdateError(null);
    try {
      const response = await fetch('/api/ghl/update-opportunity-stage', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          opportunityId: opportunity.id,
          pipelineStageId: stageId,
          pipelineId: opportunity.pipelineId,
        }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update stage');
      }
      setSelectedStage(stageId);
      setStageUpdateSuccess(true);
      onOpportunityUpdate(); // Callback to refresh the opportunities list
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'An unknown error occurred';
      setStageUpdateError(message);
    } finally {
      setIsUpdatingStage(false);
    }
  };

  const handleSendEmail = async () => {
    if (!opportunity?.contact?.id || !outreachPlan?.email) return;
    setIsSendingEmail(true);
    setSendEmailSuccess(false);
    setSendEmailError(null);

    try {
      const response = await fetch('/api/ghl/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contactId: opportunity.contact.id,
          body: outreachPlan.email,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to send email');
      }
      setSendEmailSuccess(true);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'An unknown error occurred';
      setSendEmailError(message);
    } finally {
      setIsSendingEmail(false);
    }
  };

  const handleLogCall = async () => {
    if (!opportunity?.contact?.id || !callNotes) return;
    setIsLoggingCall(true);
    setLogCallSuccess(false);
    setLogCallError(null);

    try {
      const response = await fetch('/api/ghl/add-note', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contactId: opportunity.contact.id,
          note: `Call Log:\n${callNotes}`,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to log call');
      }
      setLogCallSuccess(true);
      setCallNotes(''); // Clear the textarea on success
      fetchNotes(); // Re-fetch notes after adding a new one
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'An unknown error occurred';
      setLogCallError(message);
    } finally {
      setIsLoggingCall(false);
    }
  };
  
  if (!opportunity) {
    return null;
  }

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-2xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{opportunity.name}</SheetTitle>
          <SheetDescription>
            {opportunity.contact?.name || 'No Contact'} | Stage: {opportunity.pipelineStage?.name || 'No Stage'}
          </SheetDescription>
          <div className="pt-4">
            <Select onValueChange={handleStageChange} value={selectedStage}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Change Stage" />
              </SelectTrigger>
              <SelectContent>
                {pipelines.find(p => p.id === opportunity.pipelineId)?.stages.map(stage => (
                  <SelectItem key={stage.id} value={stage.id}>
                    {stage.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {isUpdatingStage && <p className="text-sm text-gray-500 mt-2">Updating stage...</p>}
            {stageUpdateSuccess && <p className="text-sm text-green-500 mt-2">Stage updated successfully!</p>}
            {stageUpdateError && <p className="text-sm text-red-500 mt-2">{stageUpdateError}</p>}
          </div>
        </SheetHeader>
        <div className="py-8">
          <Tabs defaultValue="outreach" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="outreach">Outreach Plan</TabsTrigger>
              <TabsTrigger value="contact">Contact Details</TabsTrigger>
              <TabsTrigger value="notes">Notes</TabsTrigger>
            </TabsList>
            <TabsContent value="outreach" className="mt-4">
              {isLoading && <div className="text-center">Generating outreach plan... (This can take up to 30 seconds)</div>}
              {error && <div className="text-center text-red-500 p-4 border border-red-200 bg-red-50 rounded-lg">{error}</div>}
              {outreachPlan && !isRerunningResearch ? (
                <>
                  <Tabs defaultValue="insights" className="w-full">
                    <TabsList className="grid w-full grid-cols-4">
                      <TabsTrigger value="insights">Insights</TabsTrigger>
                      <TabsTrigger value="email">Email</TabsTrigger>
                      <TabsTrigger value="linkedin">LinkedIn</TabsTrigger>
                      <TabsTrigger value="call">Call Script</TabsTrigger>
                    </TabsList>
                    <TabsContent value="insights" className="mt-4">
                      <div className="prose max-w-none">
                        <ReactMarkdown>{outreachPlan.insights}</ReactMarkdown>
                      </div>
                      <div className="mt-6 flex gap-4">
                        <Button onClick={handleSyncNotes} disabled={isSyncing || syncSuccess}>
                          {isSyncing ? 'Syncing...' : syncSuccess ? 'Synced to GHL!' : 'Sync Notes to GHL'}
                        </Button>
                        <Button variant="outline" disabled>
                          {saveSuccess ? 'Saved to Toolkit!' : 'Save to Toolkit'}
                        </Button>
                        {syncError && <p className="text-red-500 text-sm mt-2">{syncError}</p>}
                      </div>
                    </TabsContent>
                    <TabsContent value="email" className="mt-4 prose max-w-none">
                      <div className="whitespace-pre-wrap font-sans">{outreachPlan.email}</div>
                      <div className="mt-6">
                        <Button onClick={handleSendEmail} disabled={isSendingEmail || sendEmailSuccess}>
                          {isSendingEmail ? 'Sending...' : sendEmailSuccess ? 'Sent via GHL!' : 'Send Email via GHL'}
                        </Button>
                        {sendEmailError && <p className="text-red-500 text-sm mt-2">{sendEmailError}</p>}
                      </div>
                    </TabsContent>
                    <TabsContent value="linkedin" className="mt-4 prose max-w-none">
                      <ReactMarkdown>{outreachPlan.linkedinConnectionNote}</ReactMarkdown>
                      <hr className="my-4" />
                      <ReactMarkdown>{outreachPlan.linkedinFollowUpDm}</ReactMarkdown>
                    </TabsContent>
                    <TabsContent value="call" className="mt-4 prose max-w-none">
                      <ReactMarkdown>{outreachPlan.coldCallScript}</ReactMarkdown>
                      <div className="mt-6 not-prose">
                        <h4 className="font-semibold mb-2">Log Call Notes</h4>
                        <Textarea 
                          value={callNotes}
                          onChange={(e) => setCallNotes(e.target.value)}
                          placeholder="Enter notes from your call..."
                          className="w-full"
                          rows={5}
                        />
                        <Button onClick={handleLogCall} disabled={isLoggingCall || logCallSuccess} className="mt-2">
                          {isLoggingCall ? 'Logging...' : logCallSuccess ? 'Logged to GHL!' : 'Log Call to GHL'}
                        </Button>
                        {logCallError && <p className="text-red-500 text-sm mt-2">{logCallError}</p>}
                      </div>
                    </TabsContent>
                  </Tabs>
                  <div className="mt-6 text-center">
                    <Button variant="link" onClick={() => setIsRerunningResearch(true)}>
                      Rerun Research
                    </Button>
                  </div>
                </>
              ) : (
                !isLoading && !error && (
                  <div className="text-center space-y-4">
                    <Input
                      type="url"
                      placeholder="Company Homepage URL (Optional, will use contact's default if blank)"
                      value={homepageUrl}
                      onChange={(e) => setHomepageUrl(e.target.value)}
                    />
                    <Input
                      type="url"
                      placeholder="Specific URL (Case Study, News, etc.)"
                      value={caseStudyUrl}
                      onChange={(e) => setCaseStudyUrl(e.target.value)}
                    />
                    <Button onClick={handleRunResearch}>
                      Run Research & Generate Outreach Plan
                    </Button>
                  </div>
                )
              )}
            </TabsContent>
            <TabsContent value="contact" className="mt-4">
              {isContactLoading ? (
                <div className="space-y-4">
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-4 w-1/3" />
                  <Skeleton className="h-4 w-1/4" />
                </div>
              ) : contactDetails ? (
                <div className="space-y-2">
                  <p><strong>Email:</strong> {contactDetails.email || 'N/A'}</p>
                  <p><strong>Phone:</strong> {contactDetails.phone || 'N/A'}</p>
                  <p><strong>Company:</strong> {contactDetails.companyName || 'N/A'}</p>
                  <p><strong>Website:</strong> {contactDetails.website || 'N/A'}</p>
                  <p><strong>Source:</strong> {contactDetails.source || 'N/A'}</p>
                  <p><strong>Tags:</strong> {contactDetails.tags?.join(', ') || 'N/A'}</p>
                  {contactDetails.customFields?.map((field) => {
                    const fieldName = customFieldMap.get(field.id);
                    return field.value && fieldName ? (
                      <p key={field.id}><strong>{fieldName}:</strong> {String(field.value)}</p>
                    ) : null;
                  })}
                </div>
              ) : (
                <p>No contact details found.</p>
              )}
            </TabsContent>
            <TabsContent value="notes" className="mt-4">
              {isNotesLoading ? (
                <p>Loading notes...</p>
              ) : notes.length > 0 ? (
                <div className="space-y-4">
                  {notes.sort((a, b) => new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime()).map(note => (
                    <div key={note.id} className="p-3 bg-gray-50 rounded-lg border">
                      <p className="text-sm text-gray-800 whitespace-pre-wrap">{note.body}</p>
                      <p className="text-xs text-gray-500 mt-2">{new Date(note.dateAdded).toLocaleString()}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p>No notes found for this contact.</p>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </SheetContent>
    </Sheet>
  );
}
