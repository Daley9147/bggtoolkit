'use client';

import React, { useState } from 'react';
import OpportunityCard from '@/components/ghl/opportunity-card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

interface Opportunity {
  id: string;
  name: string;
  monetaryValue: number;
  pipelineId: string;
  pipelineStageId: string;
  contactId: string;
  lastStageChangeAt: string;
  [key: string]: any; 
}

interface Pipeline {
  id: string;
  name: string;
  stages: {
    id: string;
    name: string;
  }[];
}

interface OpportunitiesBoardProps {
  opportunities: Opportunity[];
  stages: { id: string; name: string }[];
  pipelines: Pipeline[];
  onUpdateStage: (opportunityId: string, newStageId: string) => Promise<void>;
  onOpportunityClick: (opp: Opportunity) => void;
}

export function OpportunitiesBoard({
  opportunities,
  stages,
  pipelines,
  onUpdateStage,
  onOpportunityClick,
}: OpportunitiesBoardProps) {
  const [draggedOppId, setDraggedOppId] = useState<string | null>(null);
  const [dragOverStageId, setDragOverStageId] = useState<string | null>(null);

  const handleDragStart = (e: React.DragEvent, oppId: string) => {
    setDraggedOppId(oppId);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', oppId);
  };

  const handleDragOver = (e: React.DragEvent, stageId: string) => {
    e.preventDefault();
    if (dragOverStageId !== stageId) {
      setDragOverStageId(stageId);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    // Optional
  };

  const handleDrop = async (e: React.DragEvent, stageId: string) => {
    e.preventDefault();
    setDragOverStageId(null);
    const oppId = draggedOppId;
    setDraggedOppId(null);

    if (oppId) {
      const opp = opportunities.find((o) => o.id === oppId);
      if (opp && opp.pipelineStageId !== stageId) {
        await onUpdateStage(oppId, stageId);
      }
    }
  };

  return (
    <div className="flex h-[calc(100vh-220px)] gap-4">
      {stages.map((stage) => {
        const stageOpps = opportunities.filter((op) => op.pipelineStageId === stage.id);

        return (
          <div
            key={stage.id}
            className={cn(
              "flex-shrink-0 w-80 flex flex-col rounded-lg border bg-secondary/30 transition-colors",
              dragOverStageId === stage.id ? "bg-primary/10 border-primary/50" : "border-transparent"
            )}
            onDragOver={(e) => handleDragOver(e, stage.id)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, stage.id)}
          >
            <div className="p-3 font-semibold text-sm uppercase tracking-wider text-muted-foreground bg-secondary/50 rounded-t-lg flex justify-between items-center">
              <span>{stage.name}</span>
              <span className="bg-background text-foreground text-xs px-2 py-0.5 rounded-full border">
                {stageOpps.length}
              </span>
            </div>
            
            <ScrollArea className="flex-1 p-2">
              <div className="space-y-3">
                {stageOpps.map((opp) => (
                  <div
                    key={opp.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, opp.id)}
                    className={cn(
                      "cursor-grab active:cursor-grabbing hover:shadow-md transition-shadow",
                      draggedOppId === opp.id && "opacity-50"
                    )}
                  >
                     <div
                      className="bg-card rounded-md border shadow-sm cursor-grab active:cursor-grabbing hover:shadow-md transition-all"
                    >
                      <OpportunityCard 
                        opp={opp}
                        pipelines={pipelines}
                        handleOppClick={onOpportunityClick}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
        );
      })}
    </div>
  );
}
