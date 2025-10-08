'use client';

import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ContactDetailsTab from './workspace-tabs/ContactDetailsTab';
import NotesTab from './workspace-tabs/NotesTab';
import OutreachPlanTab from './workspace-tabs/OutreachPlanTab';
import TasksTab from './workspace-tabs/TasksTab';

// ... (interfaces remain the same)
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


import { useToast } from '@/hooks/use-toast';

export default function OpportunityWorkspace({
  opportunity,
  isOpen,
  onOpenChange,
  onOpportunityUpdate,
  pipelines,
  outreachPlan,
  onPlanGenerated,
}: OpportunityWorkspaceProps) {
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [selectedStage, setSelectedStage] = useState<string | undefined>(undefined);
  const [isUpdatingStage, setIsUpdatingStage] = useState(false);
  const [stageUpdateError, setStageUpdateError] = useState<string | null>(null);
  const [contactDetails, setContactDetails] = useState<GhlContact | null>(null);
  const [customFieldDefs, setCustomFieldDefs] = useState<CustomField[]>([]);
  const [notes, setNotes] = useState<{ id: string; body: string; dateAdded: string }[]>([]);
  const [emailSignature, setEmailSignature] = useState('');
  const { toast } = useToast();

  // This effect syncs the local stage state when the parent passes a new opportunity prop
  useEffect(() => {
    if (opportunity) {
      setSelectedStage(opportunity.pipelineStageId);
    }
  }, [opportunity]);

  useEffect(() => {
    if (isOpen && opportunity) {
      setIsInitialLoading(true);
      setStageUpdateError(null); // Reset on open

      const fetchAllData = async () => {
        try {
          const [
            sigResponse,
            planResponse,
            fieldsResponse,
            contactResponse,
            notesResponse,
          ] = await Promise.all([
            fetch('/api/user/signature'),
            fetch(`/api/outreach-plan/${opportunity.contact.id}`),
            fetch('/api/ghl/custom-fields'),
            fetch(`/api/ghl/contact/${opportunity.contact.id}`),
            fetch(`/api/ghl/notes/${opportunity.contact.id}`),
          ]);

          if (sigResponse.ok) {
            const sigData = await sigResponse.json();
            setEmailSignature(sigData.email_signature || '');
          }
          if (planResponse.ok) {
            const planData = await planResponse.json();
            if (planData && planData.email) {
              onPlanGenerated(opportunity.id, planData);
            }
          }
          if (fieldsResponse.ok) {
            setCustomFieldDefs(await fieldsResponse.json());
          }
          if (contactResponse.ok) {
            setContactDetails(await contactResponse.json());
          }
          if (notesResponse.ok) {
            setNotes(await notesResponse.json());
          }
        } catch (error) {
          console.error("Failed to fetch workspace data:", error);
        } finally {
          setIsInitialLoading(false);
        }
      };

      fetchAllData();
    }
  }, [isOpen, opportunity, onPlanGenerated]);

  const handleStageChange = async (stageId: string) => {
    if (!opportunity) return;
    setIsUpdatingStage(true);
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
      toast({
        title: 'Stage Updated',
        description: 'The opportunity stage has been successfully updated.',
      });
      onOpportunityUpdate(); // Directly call the refresh function
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'An unknown error occurred';
      setStageUpdateError(message);
    } finally {
      setIsUpdatingStage(false);
    }
  };

  const handleNoteAdded = async () => {
    if (!opportunity) return;
    const notesResponse = await fetch(`/api/ghl/notes/${opportunity.contact.id}`);
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
            <Tabs defaultValue="outreach" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="outreach">Outreach Plan</TabsTrigger>
                <TabsTrigger value="tasks">Tasks</TabsTrigger>
                <TabsTrigger value="contact">Contact Details</TabsTrigger>
                <TabsTrigger value="notes">Notes</TabsTrigger>
              </TabsList>
              <TabsContent value="outreach">
                <OutreachPlanTab
                  outreachPlan={outreachPlan}
                  contactId={opportunity.contact.id}
                  emailSignature={emailSignature}
                  onPlanGenerated={(plan) => onPlanGenerated(opportunity.id, plan)}
                  initialHomepageUrl={contactDetails?.website || ''}
                />
              </TabsContent>
              <TabsContent value="tasks">
                <TasksTab opportunity={opportunity} />
              </TabsContent>
              <TabsContent value="contact">
                <ContactDetailsTab
                  contactDetails={contactDetails}
                  isLoading={isInitialLoading}
                  customFieldDefs={customFieldDefs}
                />
              </TabsContent>
              <TabsContent value="notes">
                <NotesTab
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
