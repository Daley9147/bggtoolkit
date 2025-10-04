'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import OpportunityWorkspace from '@/components/ghl/opportunity-workspace';
import { formatDistanceToNow } from 'date-fns';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import OpportunityCard from './opportunity-card';

interface Opportunity {
  id: string;
  name: string;
  monetaryValue: number;
  pipelineId: string;
  pipelineStageId: string;
  contactId: string;
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

export default function OpportunitiesClient() {
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [pipelines, setPipelines] = useState<Pipeline[]>([]);
  const [selectedPipelineId, setSelectedPipelineId] = useState<string>('all');
  const [selectedStage, setSelectedStage] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [selectedOpp, setSelectedOpp] = useState<Opportunity | null>(null);
  const [isWorkspaceOpen, setIsWorkspaceOpen] = useState(false);
  const [outreachPlans, setOutreachPlans] = useState<Record<string, any>>({});

  const fetchOpportunities = async (pipelineId: string = 'all', stageId: string = 'all') => {
    setIsLoading(true);
    try {
      const url = new URL('/api/ghl/opportunities', window.location.origin);
      if (pipelineId !== 'all') {
        url.searchParams.append('pipelineId', pipelineId);
      }
      if (stageId !== 'all') {
        url.searchParams.append('pipelineStageId', stageId);
      }
      const response = await fetch(url.toString());
      if (response.status === 404) {
        setIsConnected(false);
        return;
      }
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch opportunities');
      }
      const data = await response.json();
      setOpportunities(data);
      setIsConnected(true);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchPipelines = async () => {
    try {
      const response = await fetch('/api/ghl/pipelines');
      if (!response.ok) {
        throw new Error('Failed to fetch pipelines');
      }
      const data = await response.json();
      setPipelines(data);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(message);
    }
  };

  useEffect(() => {
    fetchOpportunities(selectedPipelineId, selectedStage);
  }, [selectedPipelineId, selectedStage]);

  useEffect(() => {
    fetchPipelines();
  }, []);

  const handlePipelineChange = (pipelineId: string) => {
    setSelectedPipelineId(pipelineId);
    setSelectedStage('all'); // Reset stage when pipeline changes
  };

  const handleOppClick = (opp: Opportunity) => {
    setSelectedOpp(opp);
    setIsWorkspaceOpen(true);
  };

  const handleWorkspaceClose = (isOpen: boolean) => {
    setIsWorkspaceOpen(isOpen);
    if (!isOpen) {
      setSelectedOpp(null);
    }
  };

  const handlePlanGenerated = (opportunityId: string, plan: any) => {
    setOutreachPlans(prevPlans => ({
      ...prevPlans,
      [opportunityId]: plan,
    }));
  };

  const selectedPipeline = pipelines.find(p => p.id === selectedPipelineId);

  if (isLoading) {
    return <div className="text-center p-8">Loading GHL Opportunities...</div>;
  }

  if (!isConnected) {
    return (
      <div className="flex flex-col items-center justify-center p-8 border rounded-lg bg-card text-card-foreground">
        <p className="mb-4">Connect your GHL account to see your opportunities.</p>
        <Button asChild>
          <Link href="/api/oauth/redirect">Connect to GHL</Link>
        </Button>
      </div>
    );
  }
  
  if (error) {
    return <div className="text-center p-8 text-red-500">Error: {error}</div>;
  }

  return (
    <>
      <div className="border rounded-lg">
        <div className="flex justify-between items-center p-6">
          <h2 className="font-headline text-xl font-semibold">GHL Opportunities</h2>
          <div className="flex gap-4">
            <Button 
              variant="outline" 
              onClick={async () => {
                await fetch('/api/ghl/disconnect');
                window.location.reload();
              }}
            >
              Disconnect GHL
            </Button>
            <Select onValueChange={handlePipelineChange} value={selectedPipelineId}>
              <SelectTrigger className="w-[280px]">
                <SelectValue placeholder="Select a pipeline" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Pipelines</SelectItem>
                {pipelines.map((pipeline) => (
                  <SelectItem key={pipeline.id} value={pipeline.id}>
                    {pipeline.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select onValueChange={setSelectedStage} value={selectedStage} disabled={selectedPipelineId === 'all'}>
              <SelectTrigger className="w-[280px]">
                <SelectValue placeholder="Select a stage" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Stages</SelectItem>
                {selectedPipeline?.stages.map((stage) => (
                  <SelectItem key={stage.id} value={stage.id}>
                    {stage.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="divide-y">
          {opportunities.length > 0 ? (
            opportunities.map((opp) => (
              <OpportunityCard 
                key={opp.id}
                opp={opp}
                pipelines={pipelines}
                handleOppClick={handleOppClick}
              />
            ))
          ) : (
            <p className="p-4 text-center text-muted-foreground">No opportunities found.</p>
          )}
        </div>
      </div>
      <OpportunityWorkspace 
        opportunity={selectedOpp}
        isOpen={isWorkspaceOpen}
        onOpenChange={handleWorkspaceClose}
        onOpportunityUpdate={() => fetchOpportunities(selectedPipelineId, selectedStage)}
        pipelines={pipelines}
        outreachPlan={selectedOpp ? outreachPlans[selectedOpp.id] : null}
        onPlanGenerated={handlePlanGenerated}
      />
    </>
  );
}
