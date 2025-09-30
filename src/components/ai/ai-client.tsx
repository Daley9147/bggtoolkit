'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import ReactMarkdown from 'react-markdown';
import { CaseStudy, caseStudies } from '@/lib/case-studies';

export default function AiClient() {
  const [url, setUrl] = useState('');
  const [result, setResult] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [caseStudy, setCaseStudy] = useState<CaseStudy | null>(null);
  const [caseStudyExplanation, setCaseStudyExplanation] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setResult('');
    setCaseStudy(null);
    setCaseStudyExplanation('');

    try {
      const res = await fetch('/api/talking-points', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Failed to generate talking points');
      }

      const data = await res.json();
      const output = data.output;

      // Extract the case study reference from the output
      const caseStudyRegex = /\*\*Case Study to Reference:\*\* \[?(Case Study #(\d+))\]?([\s\S]*)/;
      const match = output.match(caseStudyRegex);

      if (match) {
        const caseStudyId = parseInt(match[2], 10);
        const explanation = match[3].trim();
        const recommendedCaseStudy = caseStudies.find(cs => cs.id === caseStudyId);
        if (recommendedCaseStudy) {
          setCaseStudy(recommendedCaseStudy);
          setCaseStudyExplanation(explanation);
        }
        // Remove the case study section from the main result
        setResult(output.replace(caseStudyRegex, '').trim());
      } else {
        setResult(output);
      }

    } catch (error: any) {
      console.error('Error generating talking points:', error);
      setResult('An error occurred while generating insights.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">AI Sales Assistant</h1>
      <p className="mb-4">
        Enter a company's website URL to generate talking points and insights for
        cold outreach. (AI can misinterpret and make mistakes, double checking results is advised)
      </p>
      <form onSubmit={handleSubmit} className="flex gap-2 mb-4">
        <Input
          type="url"
          placeholder="https://example.com"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          required
          className="flex-1"
        />
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Generating...' : 'Generate'}
        </Button>
      </form>

      {result && (
        <Card>
          <CardHeader>
            <CardTitle>Generated Insights</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="prose dark:prose-invert max-w-none">
              <ReactMarkdown>{result}</ReactMarkdown>
            </div>
          </CardContent>
        </Card>
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
