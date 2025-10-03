'use client';

import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, Building, Briefcase, Trash, Globe, Sparkles } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { deleteCompany } from '@/app/saved/actions';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useRouter, useSearchParams } from 'next/navigation';

// Helper function to parse insights
const parseInsights = (insights) => {
  const getVal = (regex) => {
    const match = insights?.match(regex);
    // Clean up leading/trailing asterisks and whitespace
    return match?.[1]?.replace(/^\s*\*\*/, '')
                     .replace(/\*\*\s*$/, '')
                     .trim() || 'N/A';
  };
  return {
    industry: getVal(/\*\*Industry:\*\*\s*(.*)/),
    summary: getVal(/\*\*Summary:\*\*\s*([\s\S]*?)(?=\*\*Recent Developments:\*\*)/),
    developments: getVal(/\*\*Recent Developments:\*\*\s*([\s\S]*?)(?=\*\*How Business Growth Global Could Help:\*\*)/),
    howBGGCanHelp: getVal(/\*\*How Business Growth Global Could Help:\*\*\s*([\s\S]*?)(?=\*\*Outreach Hook Example:\*\*)/),
  };
};

export default function SavedClient({ companies, count, industries }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const page = Number(searchParams.get('page')) || 1;
  const industry = searchParams.get('industry') || '';
  const searchTerm = searchParams.get('search') || '';

  const [inputValue, setInputValue] = useState(searchTerm);

  const ITEMS_PER_PAGE = 10;
  const totalPages = Math.ceil(count / ITEMS_PER_PAGE);

  const handleUrlUpdate = (params) => {
    const current = new URLSearchParams(Array.from(searchParams.entries()));
    for (const key in params) {
      if (params[key]) {
        current.set(key, params[key]);
      } else {
        current.delete(key);
      }
    }
    // Reset page to 1 when filters or search change
    if (params.industry !== undefined || params.search !== undefined) {
      current.set('page', '1');
    }
    
    const search = current.toString();
    const query = search ? `?${search}` : '';
    router.push(`/saved${query}`);
  };

  useEffect(() => {
    const handler = setTimeout(() => {
      if (inputValue !== searchTerm) {
        handleUrlUpdate({ search: inputValue });
      }
    }, 500); // 500ms debounce

    return () => {
      clearTimeout(handler);
    };
  }, [inputValue, searchTerm]);

  const handleIndustryChange = (value) => {
    handleUrlUpdate({ industry: value === 'all' ? '' : value });
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      handleUrlUpdate({ page: newPage });
    }
  };

  return (
    <div className="container mx-auto max-w-4xl py-8 px-4">
      <div className="flex gap-4 mb-8">
        <div className="relative flex-grow">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search by company or industry..."
            className="w-full pl-10 h-12 text-base"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
          />
        </div>
        <Select onValueChange={handleIndustryChange} value={industry || 'all'}>
          <SelectTrigger className="w-[220px] h-12">
            <SelectValue placeholder="Filter by Industry" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Industries</SelectItem>
            {industries.map(ind => <SelectItem key={ind} value={ind}>{ind}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-6">
        {companies.map((company) => (
          <CompanyCard key={company.id} company={company} />
        ))}
        {companies.length === 0 && (
          <div className="text-center py-12">
            <h3 className="font-headline text-xl">No results found</h3>
            <p className="text-muted-foreground">Try adjusting your search or filters.</p>
          </div>
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-4 mt-8">
          <Button onClick={() => handlePageChange(page - 1)} disabled={page <= 1}>
            Previous
          </Button>
          <span>Page {page} of {totalPages}</span>
          <Button onClick={() => handlePageChange(page + 1)} disabled={page >= totalPages}>
            Next
          </Button>
        </div>
      )}
    </div>
  );
}

function CompanyCard({ company }) {
  const { industry, summary, developments, howBGGCanHelp } = parseInsights(company.outreach_templates?.[0]?.insights);
  const cleanedCompanyName = company.name?.replace(/\*\*/g, '');

  return (
    <Card>
      <Accordion type="single" collapsible>
        <AccordionItem value="item-1" className="border-0">
          <AccordionTrigger className="p-6">
            <div className="flex flex-row items-start justify-between w-full">
              <div>
                <CardTitle className="flex items-center gap-3 font-headline text-2xl">
                  <Building className="h-7 w-7 text-primary" />
                  {cleanedCompanyName}
                </CardTitle>
                <div className="text-sm text-muted-foreground mt-2 flex items-center gap-4">
                  <span>{industry}</span>
                  <a href={company.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:underline">
                    <Globe className="h-4 w-4" />
                    Website
                  </a>
                </div>
              </div>
            </div>
          </AccordionTrigger>
          <AccordionContent className="p-6 pt-0">
            <div className="flex items-center justify-end">
              <form action={deleteCompany}>
                <input type="hidden" name="companyId" value={company.id} />
                <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive">
                  <Trash className="h-5 w-5" />
                  <span className="sr-only">Delete company</span>
                </Button>
              </form>
            </div>
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold mb-2">Summary</h3>
                <div className="prose prose-sm max-w-none text-muted-foreground">
                  <ReactMarkdown>{summary}</ReactMarkdown>
                </div>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Recent Developments</h3>
                <div className="prose prose-sm max-w-none text-muted-foreground">
                  <ReactMarkdown>{developments}</ReactMarkdown>
                </div>
              </div>
              <div className="rounded-md border border-amber-200 bg-amber-50 p-4">
                  <h3 className="font-semibold mb-2 flex items-center gap-2 text-amber-900">
                      <Sparkles className="h-5 w-5 text-amber-500" />
                      How We Can Help
                  </h3>
                  <div className="prose prose-sm max-w-none text-amber-800">
                      <ReactMarkdown>{howBGGCanHelp}</ReactMarkdown>
                  </div>
              </div>
              {company.outreach_templates.map(template => (
                <TemplateTabs key={template.id} template={template} />
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </Card>
  );
}

function TemplateTabs({ template }) {
  return (
    <div className="pt-4">
       <h3 className="font-semibold mb-4 flex items-center gap-2">
         <Briefcase className="h-5 w-5 text-muted-foreground" />
         <span>{template.contact_first_name} - {template.job_title}</span>
       </h3>
      <Tabs defaultValue="email">
        <TabsList>
          <TabsTrigger value="email">Email</TabsTrigger>
          <TabsTrigger value="linkedin">LinkedIn</TabsTrigger>
          <TabsTrigger value="call">Cold Call</TabsTrigger>
        </TabsList>
        <TabsContent value="email" className="prose prose-sm max-w-none border rounded-md p-4 mt-2">
          <ReactMarkdown>{template.email}</ReactMarkdown>
        </TabsContent>
        <TabsContent value="linkedin" className="space-y-4">
            <div className="prose prose-sm max-w-none border rounded-md p-4">
                <h4 className="font-semibold">Connection Note</h4>
                <ReactMarkdown>{template.linkedin_connection_note}</ReactMarkdown>
            </div>
            <div className="prose prose-sm max-w-none border rounded-md p-4">
                <h4 className="font-semibold">Follow-Up DM</h4>
                <ReactMarkdown>{template.linkedin_follow_up_dm}</ReactMarkdown>
            </div>
        </TabsContent>
        <TabsContent value="call" className="prose prose-sm max-w-none border rounded-md p-4 mt-2">
          <ReactMarkdown>{template.cold_call_script}</ReactMarkdown>
        </TabsContent>
      </Tabs>
    </div>
  );
}