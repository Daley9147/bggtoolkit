'use client';

import { useState, useEffect } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { Link as LinkIcon } from 'lucide-react';

interface OpportunityCardProps {
  opp: any;
  pipelines: any[];
  handleOppClick: (opp: any) => void;
}

export default function OpportunityCard({ 
  opp, 
  pipelines, 
  handleOppClick,
}: OpportunityCardProps) {
  const [stageName, setStageName] = useState('No Stage');

  useEffect(() => {
    const findStageName = () => {
      const pipeline = pipelines.find(p => p.id === opp.pipelineId);
      if (pipeline) {
        const stage = pipeline.stages.find(s => s.id === opp.pipelineStageId);
        if (stage) {
          setStageName(stage.name);
        }
      }
    };

    findStageName();
  }, [opp, pipelines]);

  return (
    <div 
      key={opp.id} 
      className="p-4 hover:bg-muted/50"
    >
      <div 
        className="cursor-pointer"
        onClick={() => handleOppClick(opp)}
      >
        <div className="flex justify-between items-center">
          <h3 className="font-semibold">{opp.contact?.companyName || opp.name}</h3>
        </div>
        <div className="flex justify-between items-center text-sm text-muted-foreground mt-1">
          <span>{opp.contact?.name || opp.name || 'No Contact'}</span>
          <span>{stageName}</span>
        </div>
      </div>
      <div className="flex justify-between items-center text-xs text-muted-foreground mt-1">
        {opp.lastStageChangeAt ? (
          <span>Last update: {formatDistanceToNow(new Date(opp.lastStageChangeAt))} ago</span>
        ) : (
          <span />
        )}
        {/* We can't access website from just opp.contact usually, unless we expand or fetch. 
            For now, let's remove the website link to save the fetch, or rely on it if it exists. 
            The opp.contact object from search usually has name, company, email, phone, tags. 
            Website is often on the full contact object. 
            Given the goal is to stop the N+1 fetch, we will remove this conditional link unless the data is present.
        */}
        {/* 
        {contact?.website && (
          <a 
            href={contact.website} 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center gap-1 hover:underline"
            onClick={(e) => e.stopPropagation()}
          >
            <LinkIcon className="h-3 w-3" />
            Website
          </a>
        )}
        */}
      </div>
    </div>
  );
}
