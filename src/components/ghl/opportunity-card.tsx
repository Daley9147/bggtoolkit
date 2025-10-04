'use client';

import { useState, useEffect } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { Link as LinkIcon } from 'lucide-react';

export default function OpportunityCard({ opp, pipelines, handleOppClick }) {
  const [contact, setContact] = useState(null);
  const [stageName, setStageName] = useState('No Stage');

  useEffect(() => {
    const fetchContact = async () => {
      if (opp.contactId) {
        try {
          const response = await fetch(`/api/ghl/contact/${opp.contactId}`);
          if (response.ok) {
            const data = await response.json();
            setContact(data);
          }
        } catch (error) {
          console.error('Failed to fetch contact details for card:', error);
        }
      }
    };

    const findStageName = () => {
      const pipeline = pipelines.find(p => p.id === opp.pipelineId);
      if (pipeline) {
        const stage = pipeline.stages.find(s => s.id === opp.pipelineStageId);
        if (stage) {
          setStageName(stage.name);
        }
      }
    };

    fetchContact();
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
          <h3 className="font-semibold">{contact?.companyName || opp.name}</h3>
        </div>
        <div className="flex justify-between items-center text-sm text-muted-foreground mt-1">
          <span>{contact?.name || opp.name || 'No Contact'}</span>
          <span>{stageName}</span>
        </div>
      </div>
      <div className="flex justify-between items-center text-xs text-muted-foreground mt-1">
        {opp.lastStageChangeAt ? (
          <span>Last update: {formatDistanceToNow(new Date(opp.lastStageChangeAt))} ago</span>
        ) : (
          <span />
        )}
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
      </div>
    </div>
  );
}
