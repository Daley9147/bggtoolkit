'use client';

import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import MissionMetricsContactDetailsTab from './workspace-tabs/MissionMetricsContactDetailsTab';
import MissionMetricsNotesTab from './workspace-tabs/MissionMetricsNotesTab';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { MissionMetricsOutput } from '@/lib/ai/mission-metrics.types';
import { useToast } from '@/hooks/use-toast';
import ReactMarkdown from 'react-markdown';

interface Opportunity {
  id: string;
  name: string;
  monetaryValue: number;
  pipelineId: string;
  pipelineStageId: string;
  pipelineStage: {
    name: string;
  };
  contactId: string;
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

interface MissionMetricsWorkspaceProps {
  opportunity: Opportunity | null;
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onOpportunityUpdate: () => void;
  pipelines: Pipeline[];
}

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

const fetchWithTimeout = async (resource: string, options: RequestInit = {}) => {
  return await fetch(resource, options);
};


export default function MissionMetricsWorkspace({
  opportunity,
  isOpen,
  onOpenChange,
  onOpportunityUpdate,
  pipelines,
}: MissionMetricsWorkspaceProps) {
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [selectedStage, setSelectedStage] = useState<string | undefined>(undefined);
  const [isUpdatingStage, setIsUpdatingStage] = useState(false);
  const [stageUpdateError, setStageUpdateError] = useState<string | null>(null);
  const [contactDetails, setContactDetails] = useState<GhlContact | null>(null);
  const [customFieldDefs, setCustomFieldDefs] = useState<CustomField[]>([]);
  const [notes, setNotes] = useState<{ id: string; body: string; dateAdded: string; author?: string }[]>([]);
  
  // AI Generation State
  const [regionType, setRegionType] = useState<'uk-charity' | 'us-nonprofit'>('uk-charity');
  const [identifier, setIdentifier] = useState('');
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [specificUrl, setSpecificUrl] = useState('');
  const [userInsight, setUserInsight] = useState('');
  const [missionMetricsReport, setMissionMetricsReport] = useState<MissionMetricsOutput | null>(null);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [generationError, setGenerationError] = useState<string | null>(null);
  
  // Editable State
  const [editedEmailBody, setEditedEmailBody] = useState('');
  const [editedFollowUpBody, setEditedFollowUpBody] = useState('');
  const [isSavingEdits, setIsSavingEdits] = useState(false);
  
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen && opportunity) {
        fetchAllData();
    }
  }, [isOpen, opportunity]);

  // Sync edited state when report loads
  useEffect(() => {
    if (missionMetricsReport) {
        setEditedEmailBody(missionMetricsReport.emailBody);
        setEditedFollowUpBody(missionMetricsReport.followUpBody);
    }
  }, [missionMetricsReport]);

  const fetchAllData = async () => {
    if (!opportunity) return;
    
    // Clear previous state to prevent leakage
    setMissionMetricsReport(null);
    setContactDetails(null);
    setNotes([]);
    setIdentifier('');
    setWebsiteUrl('');
    setSpecificUrl('');
    setUserInsight('');
    setEditedEmailBody('');
    setEditedFollowUpBody('');
    
    setIsInitialLoading(true);
    setStageUpdateError(null);

    // Robust ID extraction
    const contactId = opportunity.contactId || (opportunity.contact && opportunity.contact.id);
    
    console.log("Fetching data for Contact ID:", contactId); 

    if (!contactId) {
        console.warn("No contact ID found for opportunity:", opportunity);
        setIsInitialLoading(false);
        setContactDetails(null); // Ensure we don't show stale data
        return;
    }

    // 1. Fetch Contact Details (Critical)
    const contactPromise = fetchWithTimeout(`/api/mission-metrics/contact/${contactId}`, { cache: 'no-store' })
        .then(async (res) => {
            if (res.ok) {
                const data = await res.json();
                setContactDetails(data);
                if (data.website) setWebsiteUrl(data.website);
                if (data.identifier) setIdentifier(data.identifier);
                if (data.country === 'US') setRegionType('us-nonprofit');
                else setRegionType('uk-charity');
            } else {
                throw new Error("Failed to load contact");
            }
        })
        .catch((e) => {
            console.error("Contact fetch error:", e);
            toast({ title: "Error", description: "Could not load contact details.", variant: "destructive" });
        })
        .finally(() => {
            // Stop loading spinner as soon as contact attempt finishes (success or fail)
            setIsInitialLoading(false);
        });

    // 2. Fetch Other Data (Non-critical - Background)
    const notesUrl = new URL('/api/mission-metrics/notes', window.location.origin);
    if (contactId) notesUrl.searchParams.append('contactId', contactId);
    if (opportunity.id) notesUrl.searchParams.append('opportunityId', opportunity.id);

    Promise.allSettled([
      fetchWithTimeout('/api/mission-metrics/custom-fields').then(async (res) => { if (res.ok) setCustomFieldDefs(await res.json()); }),
      fetchWithTimeout(notesUrl.toString()).then(async (res) => { if (res.ok) setNotes(await res.json()); }),
      fetchWithTimeout(`/api/mission-metrics/report/${contactId}`).then(async (res) => {
        if (res.ok) {
          const data = await res.json();
          if (data) {
            setMissionMetricsReport(data.report);
            setIdentifier(data.metadata?.charityNumber || '');
            setWebsiteUrl(data.metadata?.websiteUrl || '');
            setSpecificUrl(data.metadata?.specificUrl || '');
          }
        }
      })
    ]);
  };
// ...
  const handleSaveChanges = async () => {
      if (!opportunity) return;
      setIsSavingEdits(true);
      const contactId = opportunity.contactId || (opportunity.contact && opportunity.contact.id);

      try {
          const response = await fetch(`/api/mission-metrics/report/${contactId}/update`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                  emailBody: editedEmailBody,
                  followUpBody: editedFollowUpBody,
              }),
          });

          if (!response.ok) throw new Error('Failed to save changes');

          // Update local state
          if (missionMetricsReport) {
              setMissionMetricsReport({
                  ...missionMetricsReport,
                  emailBody: editedEmailBody,
                  followUpBody: editedFollowUpBody,
              });
          }

          toast({ title: 'Saved', description: 'Your edits have been saved.' });
      } catch (error) {
          console.error('Error saving edits:', error);
          toast({ title: 'Error', description: 'Failed to save changes.', variant: 'destructive' });
      } finally {
          setIsSavingEdits(false);
      }
  };

  const handleGenerateReport = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!websiteUrl) {
      setGenerationError('Website URL is required.');
      return;
    }

    setIsGeneratingReport(true);
    setGenerationError(null);
    setMissionMetricsReport(null);

    const country = regionType === 'uk-charity' ? 'UK' : 'US';

    const contactId = opportunity!.contactId || opportunity!.contact.id;

    const body = {
        contactId: contactId,
        identifier,
        country,
        websiteUrl,
        specificUrl,
        userInsight,
    };

    try {
      const response = await fetch('/api/mission-metrics/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate report.');
      }

      const data: MissionMetricsOutput = await response.json();
      setMissionMetricsReport(data);
      toast({
        title: 'Mission Insights Generated',
        description: 'The AI report has been successfully generated.',
      });
    } catch (err: any) {
      console.error("Error generating Mission Metrics report:", err);
      setGenerationError(err.message || 'An unknown error occurred during generation.');
      toast({
        title: 'Generation Failed',
        description: err.message || 'An unexpected error occurred.',
        variant: 'destructive',
      });
    } finally {
      setIsGeneratingReport(false);
    }
  };

  const handleStageChange = async (stageId: string) => {
    if (!opportunity) return;
    setIsUpdatingStage(true);
    setStageUpdateError(null);
    try {
      const response = await fetch('/api/mission-metrics/update-opportunity-stage', {
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
      toast({
        title: 'Stage Updated',
        description: 'The Mission Metrics opportunity stage has been successfully updated.',
      });
      onOpportunityUpdate();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'An unknown error occurred';
      setStageUpdateError(message);
    } finally {
      setIsUpdatingStage(false);
    }
  };

  const handleNoteAdded = async () => {
    if (!opportunity) return;
    const contactId = opportunity.contactId || (opportunity.contact && opportunity.contact.id);
    
    const notesUrl = new URL('/api/mission-metrics/notes', window.location.origin);
    if (contactId) notesUrl.searchParams.append('contactId', contactId);
    if (opportunity.id) notesUrl.searchParams.append('opportunityId', opportunity.id);

    const notesResponse = await fetchWithTimeout(notesUrl.toString());
    if (notesResponse.ok) {
      setNotes(await notesResponse.json());
    }
  };

  if (!opportunity) {
    return null;
  }

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-2xl overflow-y-auto p-0">
        <SheetHeader className="bg-primary text-primary-foreground p-6 border-b border-white/20">
          <SheetTitle className="text-primary-foreground">{opportunity.name}</SheetTitle>
          <SheetDescription className="text-primary-foreground/80">
            {opportunity.contact?.name || 'No Contact'}
          </SheetDescription>
          <div className="pt-4">
            <Select onValueChange={handleStageChange} value={selectedStage}>
              <SelectTrigger className="w-[180px] bg-white text-gray-900">
                <SelectValue placeholder="Change Stage" />
              </SelectTrigger>
              <SelectContent>
                {pipelines
                  .find((p) => p.id === opportunity.pipelineId)
                  ?.stages.map((stage) => (
                    <SelectItem key={stage.id} value={stage.id}>
                      {stage.name}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
            {isUpdatingStage && <p className="text-sm text-primary-foreground/80 mt-2">Updating stage...</p>}
            {stageUpdateError && <p className="text-sm text-red-400 mt-2">{stageUpdateError}</p>}
          </div>
        </SheetHeader>
        <div className="p-6">
          {isInitialLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : (
            <Tabs defaultValue="insights" className="w-full">
              <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3">
                <TabsTrigger value="insights">Mission Insights</TabsTrigger>
                <TabsTrigger value="contact">Contact Details</TabsTrigger>
                <TabsTrigger value="notes">Notes</TabsTrigger>
              </TabsList>
              <TabsContent value="insights">
                <div className="mt-4 p-4 border rounded-lg">
                  {!missionMetricsReport ? (
                    <form onSubmit={handleGenerateReport} className="space-y-4 mb-6">
                      
                      <div className="space-y-2">
                          <Label>Region / Type</Label>
                          <RadioGroup 
                              defaultValue="uk-charity" 
                              value={regionType} 
                              onValueChange={(val) => setRegionType(val as 'uk-charity' | 'us-nonprofit')}
                              className="flex space-x-4"
                          >
                              <div className="flex items-center space-x-2">
                                  <RadioGroupItem value="uk-charity" id="uk-charity" />
                                  <Label htmlFor="uk-charity">UK Registered Charity</Label>
                              </div>
                              <div className="flex items-center space-x-2">
                                  <RadioGroupItem value="us-nonprofit" id="us-nonprofit" />
                                  <Label htmlFor="us-nonprofit">USA Non-Profit (501c3)</Label>
                              </div>
                          </RadioGroup>
                      </div>

                      <Input
                          placeholder={regionType === 'uk-charity' ? "Charity Number (e.g., 123456) (Optional)" : "EIN (e.g., 12-3456789) (Optional)"}
                          value={identifier}
                          onChange={(e) => setIdentifier(e.target.value)}
                      />
                      
                      <Input
                        placeholder="Organization Website URL (e.g., https://example.org)"
                        value={websiteUrl}
                        onChange={(e) => setWebsiteUrl(e.target.value)}
                        required
                      />
                      <Input
                        placeholder="Specific Article/Case Study URL (Optional)"
                        value={specificUrl}
                        onChange={(e) => setSpecificUrl(e.target.value)}
                      />
                      <Textarea
                        placeholder="Your key insight or notes about this organization (Optional)"
                        value={userInsight}
                        onChange={(e) => setUserInsight(e.target.value)}
                        rows={3}
                      />
                      <Button type="submit" disabled={isGeneratingReport}>
                        {isGeneratingReport ? 'Generating...' : 'Generate Mission Insights'}
                      </Button>
                      {generationError && (
                        <p className="text-red-500 text-sm mt-2">Error: {generationError}</p>
                      )}
                    </form>
                  ) : null}

                  {missionMetricsReport ? (
                    <div className="mt-6 pt-6">
                      <div className="flex justify-between items-center mb-4">
                         <h3 className="text-lg font-semibold">Generated Strategy & Outreach</h3>
                         {/* Button to show inputs again (Regenerate) */}
                      </div>
                      
                      <Tabs defaultValue="strategy" className="w-full">
                        <TabsList className="grid w-full grid-cols-5 mb-4 overflow-x-auto">
                          <TabsTrigger value="strategy">Strategy</TabsTrigger>
                          <TabsTrigger value="email">Email</TabsTrigger>
                          <TabsTrigger value="followup">Follow Up</TabsTrigger>
                          <TabsTrigger value="linkedin">LinkedIn</TabsTrigger>
                          <TabsTrigger value="call">Call</TabsTrigger>
                        </TabsList>

                        <TabsContent value="strategy" className="bg-muted/30 p-4 rounded-md">
                          <div className="prose dark:prose-invert max-w-none text-sm">
                            <ReactMarkdown>{missionMetricsReport.insights}</ReactMarkdown>
                          </div>
                        </TabsContent>

                        <TabsContent value="email" className="space-y-4">
                          <div className="bg-muted p-3 rounded-md">
                            <h4 className="text-sm font-semibold mb-2">Subject Lines:</h4>
                            <ul className="list-disc pl-5 text-sm space-y-1">
                              {missionMetricsReport.emailSubjectLines.map((subject, index) => (
                                <li key={index}>{subject}</li>
                              ))}
                            </ul>
                          </div>
                          <div className="bg-background border p-4 rounded-md">
                            <Textarea 
                                value={editedEmailBody}
                                onChange={(e) => setEditedEmailBody(e.target.value)}
                                className="min-h-[300px] font-mono text-sm border-none focus-visible:ring-0 p-0 resize-none"
                            />
                            <div className="flex justify-end mt-2">
                                <Button size="sm" onClick={handleSaveChanges} disabled={isSavingEdits}>
                                    {isSavingEdits ? 'Saving...' : 'Save Changes'}
                                </Button>
                            </div>
                          </div>
                        </TabsContent>

                        <TabsContent value="followup" className="space-y-4">
                          <div className="bg-muted p-3 rounded-md">
                            <h4 className="text-sm font-semibold mb-2">Subject Lines:</h4>
                            <ul className="list-disc pl-5 text-sm space-y-1">
                              {missionMetricsReport.followUpSubjectLines.map((subject, index) => (
                                <li key={index}>{subject}</li>
                              ))}
                            </ul>
                          </div>
                          <div className="bg-background border p-4 rounded-md">
                             <Textarea 
                                value={editedFollowUpBody}
                                onChange={(e) => setEditedFollowUpBody(e.target.value)}
                                className="min-h-[300px] font-mono text-sm border-none focus-visible:ring-0 p-0 resize-none"
                            />
                            <div className="flex justify-end mt-2">
                                <Button size="sm" onClick={handleSaveChanges} disabled={isSavingEdits}>
                                    {isSavingEdits ? 'Saving...' : 'Save Changes'}
                                </Button>
                            </div>
                          </div>
                        </TabsContent>

                        <TabsContent value="linkedin" className="bg-background border p-4 rounded-md text-sm whitespace-pre-wrap">
                          <ReactMarkdown>{missionMetricsReport.linkedinMessages}</ReactMarkdown>
                        </TabsContent>

                        <TabsContent value="call" className="bg-background border p-4 rounded-md text-sm whitespace-pre-wrap">
                          <ReactMarkdown>{missionMetricsReport.callScript}</ReactMarkdown>
                        </TabsContent>
                      </Tabs>
                      
                      <div className="mt-8 border-t pt-4">
                        <Button 
                            variant="destructive" 
                            onClick={() => {
                                if (confirm('Are you sure? This will delete the current report and allow you to generate a new one.')) {
                                    setMissionMetricsReport(null);
                                }
                            }}
                        >
                            Regenerate Report
                        </Button>
                        <p className="text-xs text-muted-foreground mt-2">
                            Regenerating will discard the current insights and let you update the input details.
                        </p>
                      </div>
                    </div>
                  ) : (
                    !isGeneratingReport && (
                        <div className="text-center py-10 text-muted-foreground border-2 border-dashed rounded-lg">
                        <p>Enter organization details and click 'Generate' to create a custom Mission Metrics strategy.</p>
                        </div>
                    )
                  )}
                </div>
              </TabsContent>
              <TabsContent value="contact">
                <MissionMetricsContactDetailsTab
                  contactDetails={contactDetails}
                  isLoading={isInitialLoading}
                  customFieldDefs={customFieldDefs}
                  onRetry={fetchAllData}
                />
              </TabsContent>
              <TabsContent value="notes">
                <MissionMetricsNotesTab
                  notes={notes}
                  isLoading={isInitialLoading}
                  contactId={opportunity.contactId || (opportunity.contact && opportunity.contact.id)}
                  opportunityId={opportunity.id}
                  onNoteAdded={handleNoteAdded}
                />
              </TabsContent>
            </Tabs>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}