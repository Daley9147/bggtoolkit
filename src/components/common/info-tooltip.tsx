'use client';

import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Info } from 'lucide-react';

interface InfoTooltipProps {
  children: React.ReactNode;
}

export function InfoTooltip({ children }: InfoTooltipProps) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Info className="h-4 w-4 text-muted-foreground ml-1 cursor-pointer" />
        </TooltipTrigger>
        <TooltipContent>
          <p className="max-w-xs">{children}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
