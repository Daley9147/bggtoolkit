'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CalendarDays, DollarSign, User } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Opportunity } from './mission-metrics-workspace';

interface Pipeline {
  id: string;
  name: string;
  stages: {
    id: string;
    name: string;
  }[];
}

interface OpportunityCardProps {
  opp: Opportunity;
  pipelines: Pipeline[];
  handleOppClick: (opp: Opportunity) => void;
}

export default function OpportunityCard({ opp, pipelines, handleOppClick }: OpportunityCardProps) {
  const pipeline = pipelines.find((p) => p.id === opp.pipelineId);
  const stage = pipeline?.stages.find((s) => s.id === opp.pipelineStageId);

  return (
    <Card 
      className="hover:shadow-md transition-shadow cursor-pointer border-l-4 border-l-primary"
      onClick={() => handleOppClick(opp)}
    >
      <CardHeader className="p-4 pb-2 space-y-0">
        <div className="flex justify-between items-start">
          <CardTitle className="text-sm font-medium leading-tight line-clamp-2">
            {opp.name}
          </CardTitle>
        </div>
        {opp.contact?.companyName && (
            <p className="text-xs text-muted-foreground truncate">{opp.contact.companyName}</p>
        )}
      </CardHeader>
      <CardContent className="p-4 pt-2">
        <div className="flex flex-col gap-2 mt-2">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            {opp.lastStageChangeAt && (
                <div className="flex items-center gap-1" title={`Updated ${new Date(opp.lastStageChangeAt).toLocaleString()}`}>
                    <CalendarDays className="h-3 w-3" />
                    <span>{formatDistanceToNow(new Date(opp.lastStageChangeAt), { addSuffix: true })}</span>
                </div>
            )}
          </div>
          
          <div className="flex items-center gap-2 mt-1">
             <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-5 font-normal">
                {stage?.name || 'Unknown Stage'}
             </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
