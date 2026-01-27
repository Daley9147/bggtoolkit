'use client';

import React, { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import OpportunityCard from '@/components/mission-metrics/opportunity-card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { Opportunity } from './mission-metrics-workspace';

interface Pipeline {
  id: string;
  name: string;
  stages: {
    id: string;
    name: string;
  }[];
}

interface MissionMetricsBoardProps {
  opportunities: Opportunity[];
  stages: { id: string; name: string }[];
  pipelines: Pipeline[];
  onUpdateStage: (opportunityId: string, newStageId: string) => Promise<void>;
  onOpportunityClick: (opp: Opportunity) => void;
}

export function MissionMetricsBoard({
  opportunities,
  stages,
  pipelines,
  onUpdateStage,
  onOpportunityClick,
}: MissionMetricsBoardProps) {
  const [draggedOppId, setDraggedOppId] = useState<string | null>(null);
  const [dragOverStageId, setDragOverStageId] = useState<string | null>(null);

  const handleDragStart = (e: React.DragEvent, oppId: string) => {
    setDraggedOppId(oppId);
    e.dataTransfer.effectAllowed = 'move';
    // Set data for compatibility, though we rely on state
    e.dataTransfer.setData('text/plain', oppId);
  };

  const handleDragOver = (e: React.DragEvent, stageId: string) => {
    e.preventDefault();
    if (dragOverStageId !== stageId) {
      setDragOverStageId(stageId);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    // Optional: could verify if we are actually leaving the column
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
            <div className="p-3 font-semibold text-sm uppercase tracking-wider text-primary-foreground bg-primary rounded-t-lg flex justify-between items-center">
              <span>{stage.name}</span>
              <span className="bg-white/20 text-white text-xs px-2 py-0.5 rounded-full border border-white/30">
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
                      "cursor-grab active:cursor-grabbing transition-shadow",
                      draggedOppId === opp.id && "opacity-50"
                    )}
                  >
                    <OpportunityCard 
                      opp={opp}
                      pipelines={pipelines}
                      handleOppClick={onOpportunityClick}
                    />
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
