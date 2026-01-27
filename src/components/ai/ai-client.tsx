'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import ReactMarkdown from 'react-markdown';
import { MissionMetricsOutput } from '@/lib/ai/mission-metrics.types';

export default function AiClient() {
  const [regionType, setRegionType] = useState<'uk-charity' | 'us-nonprofit'>('uk-charity');
  const [identifier, setIdentifier] = useState('');
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [specificUrl, setSpecificUrl] = useState('');
  const [userInsight, setUserInsight] = useState('');
  const [contactFirstName, setContactFirstName] = useState('');
  
  const [missionMetricsReport, setMissionMetricsReport] = useState<MissionMetricsOutput | null>(null);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [generationError, setGenerationError] = useState<string | null>(null);
  
  const { toast } = useToast();

  const handleGenerateReport = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!websiteUrl) {
      setGenerationError('Website URL is required.');
      return;
    }

    setIsGeneratingReport(true);
    setGenerationError(null);
    setMissionMetricsReport(null);

    const country = regionType === 'uk-charity' ? 'UK' : 'US';

    const body = {
        identifier,
        country,
        websiteUrl,
        specificUrl,
        userInsight,
        contactFirstName
    };

    try {
      const response = await fetch('/api/mission-metrics/generate-standalone', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate report.');
      }

      const data: MissionMetricsOutput = await response.json();
      setMissionMetricsReport(data);
      toast({
        title: 'Mission Insights Generated',
        description: 'The AI report has been successfully generated.',
      });
    } catch (err: any) {
      console.error("Error generating Mission Metrics report:", err);
      setGenerationError(err.message || 'An unknown error occurred during generation.');
      toast({
        title: 'Generation Failed',
        description: err.message || 'An unexpected error occurred.',
        variant: 'destructive',
      });
    } finally {
      setIsGeneratingReport(false);
    }
  };

  const handleCopyToClipboard = (text: string, title: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: 'Copied to clipboard',
      description: `${title} has been copied to your clipboard.`,
    });
  };

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">AI Mission Insights</h1>
        <p className="text-muted-foreground">
          Generate custom Mission Metrics strategies and outreach for organisations that aren't yet leads.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-8">
        <div className="bg-card border rounded-xl shadow-sm overflow-hidden">
          <div className="bg-primary text-primary-foreground p-6">
            <h2 className="text-xl font-semibold">Organisation Details</h2>
            <p className="text-primary-foreground/80 text-sm">Enter details to generate a custom outreach strategy.</p>
          </div>
          
          <div className="p-6">
            {!missionMetricsReport ? (
              <form onSubmit={handleGenerateReport} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <Label className="text-base font-semibold">Region / Type</Label>
                    <RadioGroup 
                        defaultValue="uk-charity" 
                        value={regionType} 
                        onValueChange={(val) => setRegionType(val as 'uk-charity' | 'us-nonprofit')}
                        className="flex flex-col space-y-2"
                    >
                        <div className="flex items-center space-x-2 bg-muted/50 p-3 rounded-lg border cursor-pointer hover:bg-muted transition-colors">
                            <RadioGroupItem value="uk-charity" id="uk-charity" />
                            <Label htmlFor="uk-charity" className="cursor-pointer font-medium">UK Registered Charity</Label>
                        </div>
                        <div className="flex items-center space-x-2 bg-muted/50 p-3 rounded-lg border cursor-pointer hover:bg-muted transition-colors">
                            <RadioGroupItem value="us-nonprofit" id="us-nonprofit" />
                            <Label htmlFor="us-nonprofit" className="cursor-pointer font-medium">USA Non-Profit (501c3)</Label>
                        </div>
                    </RadioGroup>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName" className="font-semibold">Contact First Name</Label>
                      <Input
                          id="firstName"
                          placeholder="e.g., John (for personalized emails)"
                          value={contactFirstName}
                          onChange={(e) => setContactFirstName(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="identifier" className="font-semibold">Registration Number</Label>
                      <Input
                          id="identifier"
                          placeholder={regionType === 'uk-charity' ? "Charity Number (e.g., 123456)" : "EIN (e.g., 12-3456789)"}
                          value={identifier}
                          onChange={(e) => setIdentifier(e.target.value)}
                      />
                      <p className="text-xs text-muted-foreground italic">Optional but recommended for financial context.</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="websiteUrl" className="font-semibold">Organisation Website URL</Label>
                    <Input
                      id="websiteUrl"
                      placeholder="https://example.org"
                      value={websiteUrl}
                      onChange={(e) => setWebsiteUrl(e.target.value)}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="specificUrl" className="font-semibold">Specific Article/Case Study URL</Label>
                    <Input
                      id="specificUrl"
                      placeholder="Optional link to a specific project or news article"
                      value={specificUrl}
                      onChange={(e) => setSpecificUrl(e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="userInsight" className="font-semibold">Your Key Insights</Label>
                    <Textarea
                      id="userInsight"
                      placeholder="Add any specific context you have about this organisation..."
                      value={userInsight}
                      onChange={(e) => setUserInsight(e.target.value)}
                      rows={4}
                    />
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <Button type="submit" size="lg" className="w-full md:w-auto" disabled={isGeneratingReport}>
                    {isGeneratingReport ? (
                      <span className="flex items-center gap-2">
                        <span className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full" />
                        Generating Insights...
                      </span>
                    ) : 'Generate Mission Insights'}
                  </Button>
                  {generationError && (
                    <p className="text-red-500 text-sm mt-3 p-3 bg-red-50 border border-red-100 rounded-lg">
                      Error: {generationError}
                    </p>
                  )}
                </div>
              </form>
            ) : (
              <div className="space-y-6">
                <div className="flex justify-between items-center bg-muted/30 p-4 rounded-lg border">
                  <div>
                    <h3 className="font-bold text-lg">Report for: {websiteUrl}</h3>
                    <p className="text-sm text-muted-foreground">Generated Strategy & Outreach</p>
                  </div>
                  <Button 
                    variant="outline" 
                    onClick={() => {
                        if (confirm('Start a new report? Current results will be lost.')) {
                            setMissionMetricsReport(null);
                        }
                    }}
                  >
                    New Report
                  </Button>
                </div>

                <Tabs defaultValue="strategy" className="w-full">
                  <TabsList className="grid w-full grid-cols-2 md:grid-cols-5 mb-8">
                    <TabsTrigger value="strategy">Strategy</TabsTrigger>
                    <TabsTrigger value="email">Email</TabsTrigger>
                    <TabsTrigger value="followup">Follow Up</TabsTrigger>
                    <TabsTrigger value="linkedin">LinkedIn</TabsTrigger>
                    <TabsTrigger value="call">Call</TabsTrigger>
                  </TabsList>

                  <TabsContent value="strategy" className="mt-0">
                    <div className="bg-background border rounded-xl p-6 shadow-sm">
                      <div className="flex justify-between items-center mb-4 border-b pb-4">
                        <h3 className="text-xl font-bold">Mission Strategy</h3>
                        <Button variant="ghost" size="sm" onClick={() => handleCopyToClipboard(missionMetricsReport.insights, 'Strategy')}>Copy</Button>
                      </div>
                      <div className="prose prose-sm dark:prose-invert max-w-none">
                        <ReactMarkdown>{missionMetricsReport.insights}</ReactMarkdown>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="email" className="mt-0 space-y-4">
                    <div className="bg-muted/50 p-4 rounded-xl border">
                      <h4 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-3">Recommended Subject Lines</h4>
                      <ul className="space-y-2">
                        {missionMetricsReport.emailSubjectLines.map((subject, index) => (
                          <li key={index} className="bg-background p-3 rounded-lg border flex justify-between items-center group">
                            <span className="font-medium text-sm">{subject}</span>
                            <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => handleCopyToClipboard(subject, 'Subject Line')}>
                              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>
                            </Button>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="bg-background border rounded-xl p-6 shadow-sm">
                      <div className="flex justify-between items-center mb-4 border-b pb-4">
                        <h3 className="text-xl font-bold">Email Outreach</h3>
                        <Button variant="ghost" size="sm" onClick={() => handleCopyToClipboard(missionMetricsReport.emailBody, 'Email Body')}>Copy Body</Button>
                      </div>
                      <div className="whitespace-pre-wrap text-sm font-sans leading-relaxed">
                        {missionMetricsReport.emailBody}
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="followup" className="mt-0 space-y-4">
                    <div className="bg-muted/50 p-4 rounded-xl border">
                      <h4 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-3">Recommended Follow-up Subject Lines</h4>
                      <ul className="space-y-2">
                        {missionMetricsReport.followUpSubjectLines.map((subject, index) => (
                          <li key={index} className="bg-background p-3 rounded-lg border flex justify-between items-center group">
                            <span className="font-medium text-sm">{subject}</span>
                            <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => handleCopyToClipboard(subject, 'Subject Line')}>
                              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>
                            </Button>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="bg-background border rounded-xl p-6 shadow-sm">
                      <div className="flex justify-between items-center mb-4 border-b pb-4">
                        <h3 className="text-xl font-bold">Follow-up Outreach</h3>
                        <Button variant="ghost" size="sm" onClick={() => handleCopyToClipboard(missionMetricsReport.followUpBody, 'Follow-up Body')}>Copy Body</Button>
                      </div>
                      <div className="whitespace-pre-wrap text-sm font-sans leading-relaxed">
                        {missionMetricsReport.followUpBody}
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="linkedin" className="mt-0">
                    <div className="bg-background border rounded-xl p-6 shadow-sm">
                      <div className="flex justify-between items-center mb-4 border-b pb-4">
                        <h3 className="text-xl font-bold">LinkedIn Outreach</h3>
                        <Button variant="ghost" size="sm" onClick={() => handleCopyToClipboard(missionMetricsReport.linkedinMessages, 'LinkedIn Messages')}>Copy</Button>
                      </div>
                      <div className="prose prose-sm dark:prose-invert max-w-none">
                        <ReactMarkdown>{missionMetricsReport.linkedinMessages}</ReactMarkdown>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="call" className="mt-0">
                    <div className="bg-background border rounded-xl p-6 shadow-sm">
                      <div className="flex justify-between items-center mb-4 border-b pb-4">
                        <h3 className="text-xl font-bold">Call Script</h3>
                        <Button variant="ghost" size="sm" onClick={() => handleCopyToClipboard(missionMetricsReport.callScript, 'Call Script')}>Copy</Button>
                      </div>
                      <div className="prose prose-sm dark:prose-invert max-w-none">
                        <ReactMarkdown>{missionMetricsReport.callScript}</ReactMarkdown>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
            )}
          </div>
        </div>
        
        {!missionMetricsReport && !isGeneratingReport && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-muted/30 p-4 rounded-lg border border-dashed flex flex-col items-center text-center">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-3">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>
              </div>
              <h4 className="font-semibold text-sm">Registry Lookups</h4>
              <p className="text-xs text-muted-foreground mt-1">Automatically fetches financial history from Charity Commission or ProPublica.</p>
            </div>
            <div className="bg-muted/30 p-4 rounded-lg border border-dashed flex flex-col items-center text-center">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-3">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>
              </div>
              <h4 className="font-semibold text-sm">Website Analysis</h4>
              <p className="text-xs text-muted-foreground mt-1">Deep dives into organisation websites to understand their mission and programmes.</p>
            </div>
            <div className="bg-muted/30 p-4 rounded-lg border border-dashed flex flex-col items-center text-center">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-3">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
              </div>
              <h4 className="font-semibold text-sm">Personalized Outreach</h4>
              <p className="text-xs text-muted-foreground mt-1">Generates tailored emails, LinkedIn messages, and call scripts for your prospects.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}