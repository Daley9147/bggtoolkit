'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import OpportunityWorkspace from '@/components/ghl/opportunity-workspace';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import OpportunityCard from './opportunity-card';

// ... (interfaces remain the same)
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

interface OutreachPlan {
  // Define the structure of your outreach plan here
  [key: string]: unknown;
}


export default function OpportunitiesClient() {
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [pipelines, setPipelines] = useState<Pipeline[]>([]);
  const [selectedPipelineId, setSelectedPipelineId] = useState<string>('all');
  const [selectedStage, setSelectedStage] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [selectedOpp, setSelectedOpp] = useState<Opportunity | null>(null);
  const [isWorkspaceOpen, setIsWorkspaceOpen] = useState(false);
  const [outreachPlans, setOutreachPlans] = useState<Record<string, OutreachPlan>>({});
  
  const fetchOpportunities = useCallback(async (pipelineId: string = 'all', stageId: string = 'all', query: string = '') => {
    setIsLoading(true);
    try {
      const url = new URL('/api/ghl/opportunities', window.location.origin);
      if (pipelineId !== 'all') url.searchParams.append('pipelineId', pipelineId);
      if (stageId !== 'all') url.searchParams.append('pipelineStageId', stageId);
      if (query) url.searchParams.append('query', query);
      
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
      
      // If an opportunity is selected, find its updated version in the new list
      if (selectedOpp) {
        const updatedOpp = data.find((opp: Opportunity) => opp.id === selectedOpp.id);
        if (updatedOpp) {
          setSelectedOpp(updatedOpp);
        }
      }

      setIsConnected(true);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(message);
    }
  finally {
      setIsLoading(false);
    }
  }, []);

  const fetchPipelines = useCallback(async () => {
    try {
      const response = await fetch('/api/ghl/pipelines');
      if (!response.ok) throw new Error('Failed to fetch pipelines');
      const data = await response.json();
      setPipelines(data);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(message);
    }
  }, []);

  useEffect(() => {
    const savedPipelineId = localStorage.getItem('selectedPipelineId');
    if (savedPipelineId) {
      setSelectedPipelineId(savedPipelineId);
    }
    fetchPipelines();
  }, [fetchPipelines]);

  useEffect(() => {
    const handler = setTimeout(() => {
      fetchOpportunities(selectedPipelineId, selectedStage, searchTerm);
    }, 500); // 500ms debounce delay

    return () => {
      clearTimeout(handler);
    };
  }, [selectedPipelineId, selectedStage, searchTerm, fetchOpportunities]);

  const handlePipelineChange = (pipelineId: string) => {
    setSelectedPipelineId(pipelineId);
    setSelectedStage('all'); // Reset stage when pipeline changes
    localStorage.setItem('selectedPipelineId', pipelineId);
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

  const handlePlanGenerated = useCallback((opportunityId: string, plan: OutreachPlan) => {
    setOutreachPlans(prevPlans => ({
      ...prevPlans,
      [opportunityId]: plan,
    }));
  }, []);

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
      <div className="border rounded-lg overflow-hidden">
        <div className="bg-primary text-primary-foreground p-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <h2 className="font-headline text-xl font-semibold text-primary-foreground">GHL Opportunities</h2>
            <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
              <Input
                placeholder="Search opportunities..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-white text-gray-900 w-full"
              />
              <Select onValueChange={handlePipelineChange} value={selectedPipelineId}>
                <SelectTrigger className="bg-white text-gray-900 w-full">
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
                <SelectTrigger className="bg-white text-gray-900 w-full">
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
        </div>
        <div className="p-6 space-y-4">
          {opportunities.length > 0 && pipelines.length > 0 ? (
            opportunities.map((opp) => (
              <Card key={opp.id} className="bg-secondary">
                <CardContent className="p-4">
                  <OpportunityCard 
                    opp={opp}
                    pipelines={pipelines}
                    handleOppClick={handleOppClick}
                  />
                </CardContent>
              </Card>
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
        onOpportunityUpdate={() => fetchOpportunities(selectedPipelineId, selectedStage, searchTerm)}
        pipelines={pipelines}
        outreachPlan={selectedOpp ? outreachPlans[selectedOpp.id] : null}
        onPlanGenerated={handlePlanGenerated}
      />
    </>
  );
}
