'use client';

import { useState, useMemo, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ReactMarkdown from 'react-markdown';
import dynamic from 'next/dynamic';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';

interface OutreachPlan {
  insights: string;
  email: string;
  subjectLines: string[];
  linkedinConnectionNote: string;
  linkedinFollowUpDm: string;
  coldCallScript: string;
}

interface OutreachPlanTabProps {
  outreachPlan: OutreachPlan | null;
  contactId: string;
  emailSignature: string;
  onPlanGenerated: (plan: any) => void;
  initialHomepageUrl: string;
}

export default function OutreachPlanTab({
  outreachPlan,
  contactId,
  emailSignature,
  onPlanGenerated,
  initialHomepageUrl,
}: OutreachPlanTabProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncSuccess, setSyncSuccess] = useState(false);
  const [syncError, setSyncError] = useState<string | null>(null);
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [sendEmailSuccess, setSendEmailSuccess] = useState(false);
  const [sendEmailError, setSendEmailError] = useState<string | null>(null);
  const [homepageUrl, setHomepageUrl] = useState(initialHomepageUrl);
  const [caseStudyUrl, setCaseStudyUrl] = useState('');
  const [isRerunningResearch, setIsRerunningResearch] = useState(false);
  const [editableEmailBody, setEditableEmailBody] = useState('');
  const [selectedSubject, setSelectedSubject] = useState<string>('');

  const JoditEditor = useMemo(() => dynamic(() => import('jodit-react'), { ssr: false }), []);

  const setAndCombineEmail = (aiEmail: string, signature: string) => {
    const formattedAiEmail = aiEmail.replace(/\\n/g, '<br>');
    setEditableEmailBody(`${formattedAiEmail}<br><br>${signature}`);
  };

  useEffect(() => {
    if (outreachPlan?.email) {
      setAndCombineEmail(outreachPlan.email, emailSignature);
    }
    if (outreachPlan?.subjectLines && outreachPlan.subjectLines.length > 0) {
      setSelectedSubject(outreachPlan.subjectLines[0]);
    }
  }, [outreachPlan, emailSignature]);

  const handleRunResearch = async () => {
    if (!contactId) {
      setError('Contact ID is missing.');
      return;
    }
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/ghl/generate-outreach', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contactId, homepageUrl, caseStudyUrl }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate outreach plan');
      }

      const plan = await response.json();
      onPlanGenerated(plan);
      setAndCombineEmail(plan.email, emailSignature);
      if (plan.subjectLines && plan.subjectLines.length > 0) {
        setSelectedSubject(plan.subjectLines[0]);
      }
      setIsRerunningResearch(false);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSyncNotes = async () => {
    if (!contactId || !outreachPlan?.insights) return;
    setIsSyncing(true);
    setSyncSuccess(false);
    setSyncError(null);

    try {
      const response = await fetch('/api/ghl/add-note', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contactId: contactId,
          note: outreachPlan.insights,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to sync notes');
      }
      setSyncSuccess(true);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'An unknown error occurred';
      setSyncError(message);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleSendEmail = async () => {
    if (!contactId || !editableEmailBody || !selectedSubject) return;
    setIsSendingEmail(true);
    setSendEmailSuccess(false);
    setSendEmailError(null);

    try {
      const response = await fetch('/api/ghl/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contactId: contactId,
          body: editableEmailBody,
          subject: selectedSubject,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to send email');
      }
      setSendEmailSuccess(true);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'An unknown error occurred';
      setSendEmailError(message);
    } finally {
      setIsSendingEmail(false);
    }
  };

  if (isLoading) {
    return <div className="text-center mt-4">Generating outreach plan... (This can take up to 30 seconds)</div>;
  }

  if (error) {
    return <div className="text-center text-red-500 p-4 border border-red-200 bg-red-50 rounded-lg mt-4">{error}</div>;
  }

  if (!outreachPlan || isRerunningResearch) {
    return (
      <div className="text-center space-y-4 mt-4">
        <Input
          type="url"
          placeholder="Company Homepage URL (Optional, will use contact's default if blank)"
          value={homepageUrl}
          onChange={(e) => setHomepageUrl(e.target.value)}
        />
        <Input
          type="url"
          placeholder="Specific URL (Case Study, News, etc.)"
          value={caseStudyUrl}
          onChange={(e) => setCaseStudyUrl(e.target.value)}
        />
        <Button onClick={handleRunResearch}>
          Run Research & Generate Outreach Plan
        </Button>
      </div>
    );
  }

  return (
    <>
      <Tabs defaultValue="insights" className="w-full mt-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="insights">Insights</TabsTrigger>
          <TabsTrigger value="email">Email</TabsTrigger>
          <TabsTrigger value="linkedin">LinkedIn</TabsTrigger>
          <TabsTrigger value="call">Call Script</TabsTrigger>
        </TabsList>
        <TabsContent value="insights" className="mt-4">
          <div className="prose max-w-none">
            <ReactMarkdown>{outreachPlan.insights}</ReactMarkdown>
          </div>
          <div className="mt-6 flex gap-4">
            <Button onClick={handleSyncNotes} disabled={isSyncing || syncSuccess}>
              {isSyncing ? 'Syncing...' : syncSuccess ? 'Synced!' : 'Sync Notes to GHL'}
            </Button>
          </div>
        </TabsContent>
        <TabsContent value="email" className="mt-4 prose-sm max-w-none">
          <div className="space-y-2 mb-4">
            <Label htmlFor="subject-select">Subject Line</Label>
            <Select id="subject-select" value={selectedSubject} onValueChange={setSelectedSubject}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a subject line..." />
              </SelectTrigger>
              <SelectContent>
                {outreachPlan.subjectLines && Array.isArray(outreachPlan.subjectLines) && outreachPlan.subjectLines.map((subject, index) => (
                  <SelectItem key={index} value={subject}>
                    {subject}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <JoditEditor
            value={editableEmailBody}
            onBlur={(newContent) => setEditableEmailBody(newContent)}
            config={{ readonly: false, height: 300 }}
          />
          <div className="mt-6">
            <Button onClick={handleSendEmail} disabled={isSendingEmail || sendEmailSuccess}>
              {isSendingEmail ? 'Sending...' : sendEmailSuccess ? 'Sent!' : 'Send Email via GHL'}
            </Button>
            {sendEmailError && <p className="text-red-500 text-sm mt-2">{sendEmailError}</p>}
          </div>
        </TabsContent>
        <TabsContent value="linkedin" className="mt-4 prose max-w-none">
          <h4 className="font-semibold mb-2 not-prose">Request DM</h4>
          <ReactMarkdown>{outreachPlan.linkedinConnectionNote}</ReactMarkdown>
          <hr className="my-4" />
          <h4 className="font-semibold mb-2 not-prose">Connection DM</h4>
          <ReactMarkdown>{outreachPlan.linkedinFollowUpDm}</ReactMarkdown>
        </TabsContent>
        <TabsContent value="call" className="mt-4 prose max-w-none">
          <ReactMarkdown>{outreachPlan.coldCallScript}</ReactMarkdown>
        </TabsContent>
      </Tabs>
      <div className="mt-6 text-center">
        <Button variant="link" onClick={() => setIsRerunningResearch(true)}>
          Rerun Research
        </Button>
      </div>
    </>
  );
}
