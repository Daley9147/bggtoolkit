'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import OpportunityWorkspace from '@/components/ghl/opportunity-workspace';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import OpportunityCard from './opportunity-card';
import { OpportunitiesBoard } from './opportunities-board';
import { LayoutGrid, List } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

// ... (interfaces remain the same)
interface Opportunity {
  id: string;
  name: string;
  monetaryValue: number;
  pipelineId: string;
  pipelineStageId: string;
  contactId: string;
  lastStageChangeAt: string;
  contact?: {
    name?: string;
    companyName?: string;
    email?: string;
    phone?: string;
  };
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
  const [isFetching, setIsFetching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [selectedOpp, setSelectedOpp] = useState<Opportunity | null>(null);
  const [isWorkspaceOpen, setIsWorkspaceOpen] = useState(false);
  const [outreachPlans, setOutreachPlans] = useState<Record<string, OutreachPlan>>({});
  const [viewMode, setViewMode] = useState<'list' | 'board'>('list');
  const { toast } = useToast();
  
    const fetchOpportunities = useCallback(async (pipelineId: string = 'all', stageId: string = 'all', query: string = '') => {
      setIsFetching(true);
      // Only set initial loading on first load, not on subsequent refreshes to keep UI stable
      if (opportunities.length === 0) setIsLoading(true);
  
      try {
        const url = new URL('/api/ghl/opportunities', window.location.origin);
        if (pipelineId !== 'all') url.searchParams.append('pipelineId', pipelineId);
        
        // If in board mode, force fetching all stages for the pipeline (caller should handle logic, but we double check)
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
        setIsConnected(true);
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'An unknown error occurred';
        setError(message);
      }
      finally {
        setIsLoading(false);
        setIsFetching(false);
      }
    }, []); // Dependencies removed to prevent re-creation on state changes
  
    // Sync selectedOpp when opportunities list updates
    useEffect(() => {
      if (selectedOpp) {
        const updatedOpp = opportunities.find((opp) => opp.id === selectedOpp.id);
        // Only update if we found a match and it's actually different to avoid infinite loops
        if (updatedOpp && JSON.stringify(updatedOpp) !== JSON.stringify(selectedOpp)) {
          setSelectedOpp(updatedOpp);
        }
      }
    }, [opportunities, selectedOpp]);
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
      // In board mode, always fetch all stages for the pipeline
      const stageToFetch = viewMode === 'board' ? 'all' : selectedStage;
      fetchOpportunities(selectedPipelineId, stageToFetch, searchTerm);
    }, 500); // 500ms debounce delay

    return () => {
      clearTimeout(handler);
    };
  }, [selectedPipelineId, selectedStage, searchTerm, fetchOpportunities, viewMode]);

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

  const handleUpdateStage = async (opportunityId: string, newStageId: string) => {
    // Optimistic update
    const previousOpportunities = [...opportunities];
    setOpportunities((prev) =>
      prev.map((opp) =>
        opp.id === opportunityId ? { ...opp, pipelineStageId: newStageId } : opp
      )
    );

    try {
      const response = await fetch('/api/ghl/update-opportunity-stage', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          opportunityId,
          pipelineId: selectedPipelineId,
          pipelineStageId: newStageId,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update stage');
      }
      
      toast({
        title: "Stage Updated",
        description: "Opportunity moved successfully.",
      });

    } catch (error) {
      console.error('Failed to update stage:', error);
      // Revert optimistic update
      setOpportunities(previousOpportunities);
      toast({
        title: "Update Failed",
        description: "Could not move opportunity. Please try again.",
        variant: "destructive",
      });
    }
  };


  const handlePlanGenerated = useCallback((opportunityId: string, plan: OutreachPlan) => {
    setOutreachPlans(prevPlans => ({
      ...prevPlans,
      [opportunityId]: plan,
    }));
  }, []);

  const selectedPipeline = pipelines.find(p => p.id === selectedPipelineId);
  const currentStages = selectedPipeline?.stages || [];

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
      <div className="border rounded-lg flex flex-col h-full">
        <div className="bg-primary text-primary-foreground p-6 shrink-0">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <h2 className="font-headline text-xl font-semibold text-primary-foreground">
              GHL Opportunities
              {isFetching && <span className="text-sm font-normal ml-2 opacity-75">(Updating...)</span>}
            </h2>
            <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto items-center">
              <div className="bg-background/10 p-1 rounded-md flex gap-1">
                <Button
                  variant={viewMode === 'list' ? 'secondary' : 'ghost'}
                  size="icon"
                  onClick={() => setViewMode('list')}
                  className={viewMode === 'list' ? "bg-white text-primary hover:bg-white/90" : "text-white hover:bg-white/20 hover:text-white"}
                  title="List View"
                >
                  <List className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === 'board' ? 'secondary' : 'ghost'}
                  size="icon"
                  onClick={() => setViewMode('board')}
                  className={viewMode === 'board' ? "bg-white text-primary hover:bg-white/90" : "text-white hover:bg-white/20 hover:text-white"}
                  title="Board View"
                >
                  <LayoutGrid className="h-4 w-4" />
                </Button>
              </div>

              <Input
                placeholder="Search opportunities..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-white text-gray-900 w-full md:w-64"
              />
              <Select onValueChange={handlePipelineChange} value={selectedPipelineId}>
                <SelectTrigger className="bg-white text-gray-900 w-full md:w-64">
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
              {viewMode === 'list' && (
                <Select onValueChange={setSelectedStage} value={selectedStage} disabled={selectedPipelineId === 'all'}>
                  <SelectTrigger className="bg-white text-gray-900 w-full md:w-48">
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
              )}
            </div>
          </div>
        </div>
        
        {viewMode === 'board' ? (
          <div className="p-6 overflow-x-auto flex-1 bg-background/50 min-w-0">
             {selectedPipelineId === 'all' ? (
                 <div className="text-center p-8 text-muted-foreground border-2 border-dashed rounded-lg">
                    Please select a specific pipeline to view the board.
                 </div>
             ) : (
                <OpportunitiesBoard
                    opportunities={opportunities}
                    stages={currentStages}
                    pipelines={pipelines}
                    onUpdateStage={handleUpdateStage}
                    onOpportunityClick={handleOppClick}
                />
             )}
          </div>
        ) : (
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
        )}
      </div>
      <OpportunityWorkspace 
        opportunity={selectedOpp}
        isOpen={isWorkspaceOpen}
        onOpenChange={handleWorkspaceClose}
        onOpportunityUpdate={() => {
             const stageToFetch = viewMode === 'board' ? 'all' : selectedStage;
             fetchOpportunities(selectedPipelineId, stageToFetch, searchTerm);
        }}
        pipelines={pipelines}
      />
    </>
  );
}
