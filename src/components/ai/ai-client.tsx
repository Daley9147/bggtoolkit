'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ReactMarkdown from 'react-markdown';
import { CaseStudy, caseStudies } from '@/lib/case-studies';
import { useToast } from '@/hooks/use-toast';

import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function AiClient() {
  const [url, setUrl] = useState('');
  const [specificUrl, setSpecificUrl] = useState('');
  const [contactFirstName, setContactFirstName] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [organizationType, setOrganizationType] = useState('for-profit');
  const [nonProfitIdentifier, setNonProfitIdentifier] = useState('');
  const [insights, setInsights] = useState('');
  const [email, setEmail] = useState('');
  const [emailSubjects, setEmailSubjects] = useState<string[]>([]);
  const [selectedSubject, setSelectedSubject] = useState('');
  const [customSubject, setCustomSubject] = useState('');
  const [linkedinConnectionNote, setLinkedinConnectionNote] = useState('');
  const [linkedinFollowUpDm, setLinkedinFollowUpDm] = useState('');
  const [coldCallScript, setColdCallScript] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [caseStudy, setCaseStudy] = useState<CaseStudy | null>(null);
  const [caseStudyExplanation, setCaseStudyExplanation] = useState('');
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setInsights('');
    setEmail('');
    setEmailSubjects([]);
    setSelectedSubject('');
    setCustomSubject('');
    setLinkedinConnectionNote('');
    setLinkedinFollowUpDm('');
    setColdCallScript('');
    setCaseStudy(null);
    setCaseStudyExplanation('');

    try {
      const res = await fetch('/api/talking-points', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url,
          specificUrl,
          contactFirstName,
          jobTitle,
          organizationType,
          nonProfitIdentifier,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Failed to generate talking points');
      }
      
      const data = await res.json();
      const { insights: insightsOutput, email: emailOutput, subjectLines: subjectsOutput, linkedinConnectionNote: connOutput, linkedinFollowUpDm: dmOutput, coldCallScript: scriptOutput } = data;

      // Extract the case study reference from the insights
      const caseStudyRegex = /\*\*Case Study to Reference:\*\* \[?(Case Study #(\d+))\]?([\s\S]*)/;
      const match = insightsOutput.match(caseStudyRegex);

      if (match) {
        const caseStudyId = parseInt(match[2], 10);
        const explanation = match[3].trim();
        const recommendedCaseStudy = caseStudies.find(cs => cs.id === caseStudyId);
        if (recommendedCaseStudy) {
          setCaseStudy(recommendedCaseStudy);
          setCaseStudyExplanation(explanation);
        }
        // Remove the case study section from the main result
        setInsights(insightsOutput.replace(caseStudyRegex, '').trim());
      } else {
        setInsights(insightsOutput);
      }
      
      // Normalize newlines to ensure consistent paragraph spacing
      const cleanedEmail = emailOutput.replace(/\n\s*\n/g, '\n\n');
      setEmail(cleanedEmail);
      setEmailSubjects(subjectsOutput || []);
      setSelectedSubject(subjectsOutput?.[0] || '');
      setLinkedinConnectionNote(connOutput);
      setLinkedinFollowUpDm(dmOutput);
      setColdCallScript(scriptOutput);

    } catch (error: any) {
      console.error('Error generating talking points:', error);
      setInsights('An error occurred while generating insights.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyToClipboard = (textToCopy: string, type: string) => {
    let contentToCopy = textToCopy;
    if (type === 'email content') {
      const subject = selectedSubject === 'custom' ? customSubject : selectedSubject;
      contentToCopy = `Subject: ${subject}\n\n${textToCopy}`;
    }
    navigator.clipboard.writeText(contentToCopy);
    toast({
      title: 'Copied to clipboard!',
      description: `The ${type} has been copied to your clipboard.`,
    });
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">AI Sales Assistant</h1>
      <p className="mb-4">
        Enter a company's website URL to generate talking points and insights for
        cold outreach. (AI can misinterpret and make mistakes, double checking results is advised)
      </p>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4 mb-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            type="text"
            placeholder="Contact First Name (Optional)"
            value={contactFirstName}
            onChange={(e) => setContactFirstName(e.target.value)}
          />
          <Input
            type="text"
            placeholder="Job Title (Optional)"
            value={jobTitle}
            onChange={(e) => setJobTitle(e.target.value)}
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="organization-type">Organization Type</Label>
            <Select value={organizationType} onValueChange={setOrganizationType}>
              <SelectTrigger id="organization-type">
                <SelectValue placeholder="Select organization type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="for-profit">For-Profit</SelectItem>
                <SelectItem value="non-profit">Non-Profit</SelectItem>
                <SelectItem value="vc-backed">VC-Backed Startup</SelectItem>
                <SelectItem value="partnership">Partnership/VC</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {organizationType === 'non-profit' && (
            <div className="space-y-2">
              <Label htmlFor="non-profit-identifier">Organization Name or EIN</Label>
              <Input
                id="non-profit-identifier"
                type="text"
                placeholder="Enter EIN for best results"
                value={nonProfitIdentifier}
                onChange={(e) => setNonProfitIdentifier(e.target.value)}
              />
            </div>
          )}
        </div>
        <Input
          type="url"
          placeholder="Company Website URL (e.g., https://example.com)"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          required
        />
        <Input
          type="url"
          placeholder="Specific Initiative URL (e.g., product page, news article)"
          value={specificUrl}
          onChange={(e) => setSpecificUrl(e.target.value)}
        />
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Generating...' : 'Generate'}
        </Button>
      </form>

      {(insights || email) && (
        <Tabs defaultValue="insights" className="w-full">
          <TabsList>
            <TabsTrigger value="insights">Insights</TabsTrigger>
            <TabsTrigger value="email">Email</TabsTrigger>
            <TabsTrigger value="linkedin">LinkedIn</TabsTrigger>
            <TabsTrigger value="coldcall">Cold Call</TabsTrigger>
          </TabsList>
          <TabsContent value="insights">
            <Card>
              <CardHeader>
                <CardTitle>Generated Insights</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose dark:prose-invert max-w-none">
                  <ReactMarkdown>{insights}</ReactMarkdown>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="email">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Email Outreach</CardTitle>
                <Button onClick={() => handleCopyToClipboard(email, 'email content')} size="sm">
                  Copy
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="subject-line">Subject Line</Label>
                    <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                      <SelectTrigger id="subject-line">
                        <SelectValue placeholder="Select a subject line" />
                      </SelectTrigger>
                      <SelectContent>
                        {emailSubjects.map((subject, index) => (
                          <SelectItem key={index} value={subject}>
                            {subject}
                          </SelectItem>
                        ))}
                        <SelectItem value="custom">Custom</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  {selectedSubject === 'custom' && (
                    <div className="space-y-2">
                      <Label htmlFor="custom-subject">Custom Subject</Label>
                      <Input
                        id="custom-subject"
                        type="text"
                        placeholder="Enter your custom subject line"
                        value={customSubject}
                        onChange={(e) => setCustomSubject(e.target.value)}
                      />
                    </div>
                  )}
                </div>
                <div className="prose dark:prose-invert max-w-none whitespace-pre-wrap mt-4">
                  <ReactMarkdown>{email}</ReactMarkdown>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="linkedin">
            <div className="space-y-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>Connection Note</CardTitle>
                  <Button onClick={() => handleCopyToClipboard(linkedinConnectionNote, 'connection note')} size="sm">
                    Copy
                  </Button>
                </CardHeader>
                <CardContent>
                  <div className="prose dark:prose-invert max-w-none whitespace-pre-wrap">
                    <ReactMarkdown>{linkedinConnectionNote}</ReactMarkdown>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>Follow-Up DM</CardTitle>
                  <Button onClick={() => handleCopyToClipboard(linkedinFollowUpDm, 'follow-up DM')} size="sm">
                    Copy
                  </Button>
                </CardHeader>
                <CardContent>
                  <div className="prose dark:prose-invert max-w-none whitespace-pre-wrap">
                    <ReactMarkdown>{linkedinFollowUpDm}</ReactMarkdown>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          <TabsContent value="coldcall">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Cold Call Script</CardTitle>
                <Button onClick={() => handleCopyToClipboard(coldCallScript, 'cold call script')} size="sm">
                  Copy
                </Button>
              </CardHeader>
              <CardContent>
                <div className="prose dark:prose-invert max-w-none whitespace-pre-wrap">
                  <ReactMarkdown>{coldCallScript}</ReactMarkdown>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}

      {caseStudy && (
        <Card className="mt-4">
          <CardHeader>
            <CardTitle>Recommended Case Study</CardTitle>
          </CardHeader>
          <CardContent>
            {caseStudyExplanation && (
              <div className="prose dark:prose-invert max-w-none mb-4">
                <ReactMarkdown>{caseStudyExplanation}</ReactMarkdown>
              </div>
            )}
            <h3 className="font-bold">{caseStudy.headline}</h3>
            <p className="text-sm text-muted-foreground">{caseStudy.industry}</p>
            <div className="prose dark:prose-invert max-w-none mt-2">
              <ReactMarkdown>{caseStudy.story}</ReactMarkdown>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
