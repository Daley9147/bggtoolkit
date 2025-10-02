'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ReactMarkdown from 'react-markdown';
import { CaseStudy, caseStudies } from '@/lib/case-studies';
import { useToast } from '@/hooks/use-toast';

export default function AiClient() {
  const [url, setUrl] = useState('');
  const [specificUrl, setSpecificUrl] = useState('');
  const [contactFirstName, setContactFirstName] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [insights, setInsights] = useState('');
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [caseStudy, setCaseStudy] = useState<CaseStudy | null>(null);
  const [caseStudyExplanation, setCaseStudyExplanation] = useState('');
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setInsights('');
    setEmail('');
    setCaseStudy(null);
    setCaseStudyExplanation('');

    try {
      const res = await fetch('/api/talking-points', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url, specificUrl, contactFirstName, jobTitle }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Failed to generate talking points');
      }
      
      const data = await res.json();
      const { insights: insightsOutput, email: emailOutput } = data;

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

    } catch (error: any) {
      console.error('Error generating talking points:', error);
      setInsights('An error occurred while generating insights.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyToClipboard = () => {
    navigator.clipboard.writeText(email);
    toast({
      title: 'Copied to clipboard!',
      description: 'The email content has been copied to your clipboard.',
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
                <Button onClick={handleCopyToClipboard} size="sm">
                  Copy
                </Button>
              </CardHeader>
              <CardContent>
                <div className="prose dark:prose-invert max-w-none whitespace-pre-wrap">
                  <ReactMarkdown>{email}</ReactMarkdown>
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
