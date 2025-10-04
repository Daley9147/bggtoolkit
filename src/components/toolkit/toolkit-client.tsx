'use client';

import { useState, useMemo } from 'react';
import type { SectionData, ContentSection, ProgramSection, IconName } from '@/lib/types';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import * as icons from 'lucide-react';
import ProgramsTable from './programs-table';
import BookmarkButton from './bookmark-button';
import AiRefinementDialog from './ai-refinement-dialog';
import ReactMarkdown from 'react-markdown';
import DynamicIcon from '../common/dynamic-icon';

interface ToolkitClientProps {
  sections: SectionData[];
}

export default function ToolkitClient({ sections }: ToolkitClientProps) {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredSections = useMemo(() => {
    if (!searchTerm) return sections;

    const lowercasedFilter = searchTerm.toLowerCase();

    return sections
      .map((section) => {
        if (section.id === 'programs') {
          const programSection = section as ProgramSection;
          const isMatch = 
            programSection.title.toLowerCase().includes(lowercasedFilter) ||
            programSection.description.toLowerCase().includes(lowercasedFilter) ||
            programSection.features.some(
              (f) =>
                f.feature.toLowerCase().includes(lowercasedFilter) ||
                String(f.elevate).toLowerCase().includes(lowercasedFilter) ||
                String(f.intensive).toLowerCase().includes(lowercasedFilter) ||
                String(f.boardroom).toLowerCase().includes(lowercasedFilter)
            );
          return isMatch ? section : null;
        }

        const contentSection = section as ContentSection;
        const filteredContent = contentSection.content.filter(
          (item) =>
            item.summary.toLowerCase().includes(lowercasedFilter) ||
            item.details.toLowerCase().includes(lowercasedFilter)
        );

        if (filteredContent.length > 0) {
          return { ...section, content: filteredContent };
        }
        
        if (section.title.toLowerCase().includes(lowercasedFilter)) {
            return section;
        }

        return null;
      })
      .filter(Boolean) as SectionData[];
  }, [searchTerm, sections]);

  return (
    <div className="container mx-auto max-w-4xl py-8 px-4">
      <div className="relative mb-8">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search across all sections (e.g., 'ROI', 'Boardroom', 'Lee’s background')"
          className="w-full pl-10 h-12 text-base"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="space-y-4">
        {filteredSections.map((section) => (
          <CardWithAccordion key={section.id} section={section} />
        ))}
        {filteredSections.length === 0 && (
          <div className="text-center py-12">
            <h3 className="font-headline text-xl">No results found</h3>
            <p className="text-muted-foreground">Try adjusting your search terms.</p>
          </div>
        )}
      </div>
    </div>
  );
}

function CardWithAccordion({ section }: { section: SectionData }) {
    return (
        <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
            <Accordion type="single" collapsible>
                <AccordionItem value={section.id} className="border-b-0">
                    <AccordionTrigger className="p-6 text-lg hover:no-underline">
                        <div className="flex items-center gap-4">
                            <DynamicIcon name={section.icon} className="h-6 w-6 text-primary" />
                            <h2 className="font-headline text-xl font-semibold">{section.title}</h2>
                        </div>
                    </AccordionTrigger>
                    <AccordionContent className="px-6 pb-6">
                        {section.id === 'programs' ? (
                            <ProgramsTable section={section as ProgramSection} />
                        ) : (
                            <ContentList section={section as ContentSection} />
                        )}
                    </AccordionContent>
                </AccordionItem>
            </Accordion>
        </div>
    );
}


function ContentList({ section }: { section: ContentSection }) {
    return (
      <Accordion type="multiple" className="w-full space-y-2">
        {section.content.map((item) => (
          <div key={item.id} className="rounded-md border bg-background/50">
             <AccordionItem value={item.id} className="border-b-0">
                <AccordionTrigger className="px-4 py-3 text-left hover:no-underline">
                    {item.summary}
                </AccordionTrigger>
                <AccordionContent className="px-4 pb-3">
                   <div className="prose prose-sm max-w-none border-t pt-3">
                    <ReactMarkdown>{item.details}</ReactMarkdown>
                   </div>
                   <div className="mt-2 flex items-center justify-end gap-2">
                      <AiRefinementDialog content={`${item.summary}\n\n${item.details}`} />
                      <BookmarkButton item={{ ...item, sectionTitle: section.title }} />
                   </div>
                </AccordionContent>
            </AccordionItem>
          </div>
        ))}
      </Accordion>
    );
}