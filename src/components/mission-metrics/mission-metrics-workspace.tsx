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
import { MissionMetricsOutput } from '@/lib/ai/generate-mission-metrics';
import { useToast } from '@/hooks/use-toast';

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
  const [notes, setNotes] = useState<{ id: string; body: string; dateAdded: string }[]>([]);
  
  // AI Generation State
  const [orgType, setOrgType] = useState<'charity' | 'non-charity'>('charity');
  const [charityNumber, setCharityNumber] = useState('');
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [specificUrl, setSpecificUrl] = useState('');
  const [userInsight, setUserInsight] = useState('');
  const [missionMetricsReport, setMissionMetricsReport] = useState<MissionMetricsOutput | null>(null);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [generationError, setGenerationError] = useState<string | null>(null);
  
  const { toast } = useToast();

  const fetchAllData = async () => {
    if (!opportunity) return;
    setIsInitialLoading(true);
    setStageUpdateError(null);

    try {
      const [
        fieldsResponse,
        contactResponse,
        notesResponse,
      ] = await Promise.all([
        fetch('/api/mission-metrics/custom-fields'),
        fetch(`/api/mission-metrics/contact/${opportunity.contact.id}`),
        fetch(`/api/mission-metrics/notes/${opportunity.contact.id}`),
      ]);

      if (fieldsResponse.ok) {
        setCustomFieldDefs(await fieldsResponse.json());
      }
      if (contactResponse.ok) {
        const contactData = await contactResponse.json();
        setContactDetails(contactData);
        // Set initial website URL if available from contact details
        if (contactData?.website) {
          setWebsiteUrl(contactData.website);
        }
      }
      if (notesResponse.ok) {
        setNotes(await notesResponse.json());
      }
    } catch (error) {
      console.error("Failed to fetch Mission Metrics workspace data:", error);
    } finally {
      setIsInitialLoading(false);
    }
  };

  useEffect(() => {
    if (opportunity) {
      setSelectedStage(opportunity.pipelineStageId);
      setMissionMetricsReport(null); // Clear report on opportunity change
      setGenerationError(null);
      // Attempt to pre-fill websiteUrl from contact if available
      if (contactDetails?.website) {
        setWebsiteUrl(contactDetails.website);
      }
    }
  }, [opportunity, contactDetails]);

  useEffect(() => {
    if (isOpen && opportunity) {
      fetchAllData();
    }
  }, [isOpen, opportunity]);

  const handleGenerateReport = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (orgType === 'charity' && !charityNumber) {
        setGenerationError('Charity Number is required for Registered Charities.');
        return;
    }
    if (!websiteUrl) {
      setGenerationError('Website URL is required.');
      return;
    }

    setIsGeneratingReport(true);
    setGenerationError(null);
    setMissionMetricsReport(null);

    const endpoint = orgType === 'charity' 
        ? '/api/mission-metrics/generate' 
        : '/api/mission-metrics/generate-non-charity';

    const body = orgType === 'charity' ? {
        contactId: opportunity!.contact.id,
        charityNumber,
        websiteUrl,
        specificUrl,
        userInsight,
    } : {
        contactId: opportunity!.contact.id,
        websiteUrl,
        specificUrl,
        userInsight,
    };

    try {
      const response = await fetch(endpoint, {
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
    const notesResponse = await fetch(`/api/mission-metrics/notes/${opportunity.contact.id}`);
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
                  <form onSubmit={handleGenerateReport} className="space-y-4">
                    
                    <div className="space-y-2">
                        <Label>Organization Type</Label>
                        <RadioGroup 
                            defaultValue="charity" 
                            value={orgType} 
                            onValueChange={(val) => setOrgType(val as 'charity' | 'non-charity')}
                            className="flex space-x-4"
                        >
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="charity" id="charity" />
                                <Label htmlFor="charity">UK Registered Charity</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="non-charity" id="non-charity" />
                                <Label htmlFor="non-charity">Other (CIC, Association, etc.)</Label>
                            </div>
                        </RadioGroup>
                    </div>

                    {orgType === 'charity' && (
                        <Input
                        placeholder="Charity Number (e.g., 123456)"
                        value={charityNumber}
                        onChange={(e) => setCharityNumber(e.target.value)}
                        required
                        />
                    )}
                    
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

                  {missionMetricsReport ? (
                    <div className="mt-6 space-y-4 text-sm">
                      <h3 className="text-lg font-semibold">Generated Report:</h3>
                      <div className="prose dark:prose-invert max-w-none">
                        <p><strong>Mission Brief:</strong></p>
                        <p>{missionMetricsReport.insights.split('Strategic Analysis')[0]?.replace('**Mission Brief**\n', '').trim()}</p>
                        <p><strong>Strategic Analysis:</strong></p>
                        <p>{missionMetricsReport.insights.split('Strategic Analysis')[1]?.split('The Solution')[0]?.replace('**Strategic Analysis**\n', '').trim()}</p>
                        <p><strong>The Solution:</strong></p>
                        <p>{missionMetricsReport.insights.split('The Solution')[1]?.replace('**The Solution**\n', '').trim()}</p>
                      </div>

                      <h4 className="font-semibold mt-4">Email Subject Lines:</h4>
                      <ul className="list-disc pl-5">
                        {missionMetricsReport.emailSubjectLines.map((subject, index) => (
                          <li key={index}>{subject}</li>
                        ))}
                      </ul>

                      <h4 className="font-semibold mt-4">Email Body:</h4>
                      <p className="whitespace-pre-wrap">{missionMetricsReport.emailBody}</p>

                      <h4 className="font-semibold mt-4">LinkedIn Outreach:</h4>
                      <p className="whitespace-pre-wrap">{missionMetricsReport.linkedinMessages}</p>

                      <h4 className="font-semibold mt-4">Cold Call Script:</h4>
                      <p className="whitespace-pre-wrap">{missionMetricsReport.callScript}</p>

                      <h4 className="font-semibold mt-4">Follow-Up Email Subject Lines:</h4>
                      <ul className="list-disc pl-5">
                        {missionMetricsReport.followUpSubjectLines.map((subject, index) => (
                          <li key={index}>{subject}</li>
                        ))}
                      </ul>

                      <h4 className="font-semibold mt-4">Follow-Up Email Body:</h4>
                      <p className="whitespace-pre-wrap">{missionMetricsReport.followUpBody}</p>

                    </div>
                  ) : (
                    <p className="text-sm text-gray-500 mt-4">Enter details and click 'Generate' to get Mission Insights.</p>
                  )}
                </div>
              </TabsContent>
              <TabsContent value="contact">
                <MissionMetricsContactDetailsTab
                  contactDetails={contactDetails}
                  isLoading={isInitialLoading}
                  customFieldDefs={customFieldDefs}
                />
              </TabsContent>
              <TabsContent value="notes">
                <MissionMetricsNotesTab
                  notes={notes}
                  isLoading={isInitialLoading}
                  contactId={opportunity.contact.id}
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