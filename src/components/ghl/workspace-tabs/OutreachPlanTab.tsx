'use client';

import { useState, useMemo, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ReactMarkdown from 'react-markdown';
import dynamic from 'next/dynamic';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { InfoTooltip } from '@/components/common/info-tooltip';
import { Separator } from '@/components/ui/separator';

interface OutreachPlan {
  insights: string;
  email: string;
  subjectLines: string[];
  linkedinConnectionNote: string;
  linkedinFollowUpDm: string;
  coldCallScript: string;
  followUpEmailSubjectLines: string[];
  followUpEmailBody: string;
}

interface EmailTemplate {
  id: string;
  template_name: string;
  subject_line: string;
  body: string;
}

interface OutreachPlanTabProps {
  outreachPlan: OutreachPlan | null;
  contactId: string;
  emailSignature: string;
  onPlanGenerated: () => void;
  initialHomepageUrl: string;
}

interface GhlContact {
  customFields?: { id: string; value: string | number }[];
}

interface CustomField {
  id: string;
  name: string;
}

const renderers = {
  p: ({ node, ...props }: any) => {
    const textContent = node.children.map((child: any) => child.value || '').join('');
    if (textContent.includes('Program Expense Ratio:')) {
      return (
        <p {...props} className="flex items-center">
          {textContent}
          <InfoTooltip>
            The Program Expense Ratio shows what percentage of a non-profit's spending goes directly to its mission-related programs, versus administrative or fundraising costs. A higher ratio is generally better.
          </InfoTooltip>
        </p>
      );
    }
    return <p {...props} />;
  },
};


const parseInsights = (insightsText: string) => {
  const sections: { [key: string]: string } = {};
  const headers = [
    "Industry", "Full Company Name", "Summary", "Recent Developments", 
    "Strategic Goals & Challenges", "How Business Growth Global Could Help", 
    "Outreach Hook Example", "Case Study to Reference", "Contact Information", 
    "Referenced URLs", "Key Financials (Annual)", "Stated Mission Objectives", 
    "Operational Challenges", "Funding Stage & Amount", "Lead Investors", 
    "Stated Purpose of Funds", "Implied Pressures & Challenges", "Firm Name",
    "Firm's Investment Thesis", "Stated Value-Add", "Partner's Focus",
    "Synergy Angle", "Target Portfolio Challenge", "The Offer"
  ];

  let remainingText = insightsText;

  headers.forEach((header, index) => {
    const regex = new RegExp(`\\*\\*${header}:\\*\\*\\s*`);
    const nextHeader = headers[index + 1] ? new RegExp(`\\*\\*${headers[index + 1]}:\\*\\*`) : null;
    
    const match = remainingText.match(regex);
    if (match) {
      const startIndex = match.index! + match[0].length;
      let endIndex = remainingText.length;
      
      if (nextHeader) {
        const nextMatch = remainingText.match(nextHeader);
        if (nextMatch) {
          endIndex = nextMatch.index!;
        }
      }
      
      const key = header.toLowerCase().replace(/[^a-zA-Z0-9]+(.)?/g, (m, chr) => chr ? chr.toUpperCase() : '');
      sections[key] = remainingText.substring(startIndex, endIndex).trim();
    }
  });

  return sections;
};


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
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [sendEmailSuccess, setSendEmailSuccess] = useState(false);
  const [sendEmailError, setSendEmailError] = useState<string | null>(null);
  const [homepageUrl, setHomepageUrl] = useState(initialHomepageUrl);
  const [caseStudyUrl, setCaseStudyUrl] = useState('');
  const [organizationType, setOrganizationType] = useState('for-profit');
  const [nonProfitIdentifier, setNonProfitIdentifier] = useState('');
  const [fundingAnnouncementUrl, setFundingAnnouncementUrl] = useState('');
  const [leadVc, setLeadVc] = useState('');
  const [firmWebsiteUrl, setFirmWebsiteUrl] = useState('');
  const [partnerLinkedInUrl, setPartnerLinkedInUrl] = useState('');
  const [recentInvestmentArticleUrl, setRecentInvestmentArticleUrl] = useState('');
  const [userInsight, setUserInsight] = useState('');
  const [isRerunningResearch, setIsRerunningResearch] = useState(false);
  const [editableEmailBody, setEditableEmailBody] = useState('');
  const [selectedSubject, setSelectedSubject] = useState<string>('');
  const [editableFollowUpBody, setEditableFollowUpBody] = useState('');
  const [selectedFollowUpSubject, setSelectedFollowUpSubject] = useState<string>('');
  const [isSendingFollowUp, setIsSendingFollowUp] = useState(false);
  const [sendFollowUpSuccess, setSendFollowUpSuccess] = useState(false);
  const [sendFollowUpError, setSendFollowUpError] = useState<string | null>(null);
  const [parsedInsights, setParsedInsights] = useState<{ [key: string]: string }>({});
  const [contactDetails, setContactDetails] = useState<GhlContact | null>(null);
  const [customFieldDefs, setCustomFieldDefs] = useState<CustomField[]>([]);
  const [emailTemplates, setEmailTemplates] = useState<EmailTemplate[]>([]);
  const [isPopulating, setIsPopulating] = useState(false);

  const [localOutreachPlan, setLocalOutreachPlan] = useState(outreachPlan);

  const JoditEditor = useMemo(() => dynamic(() => import('jodit-react'), { ssr: false }), []);

  const setAndCombineEmail = (aiEmail: string, signature: string) => {
    const formattedAiEmail = aiEmail.replace(/\\n/g, '<br>');
    setEditableEmailBody(`${formattedAiEmail}<br><br>${signature}`);
  };

  const setAndCombineFollowUpEmail = (aiFollowUpEmail: string, signature: string) => {
    const formattedAiFollowUpEmail = aiFollowUpEmail.replace(/\\n/g, '<br>');
    setEditableFollowUpBody(`${formattedAiFollowUpEmail}<br><br>${signature}`);
  };

  useEffect(() => {
    if (localOutreachPlan?.insights && organizationType !== 'non-profit') {
      setParsedInsights(parseInsights(localOutreachPlan.insights));
    }
    if (localOutreachPlan?.email) {
      setAndCombineEmail(localOutreachPlan.email, emailSignature);
    }
    if (localOutreachPlan?.subjectLines && localOutreachPlan.subjectLines.length > 0) {
      setSelectedSubject(localOutreachPlan.subjectLines[0]);
    }
    if (localOutreachPlan?.followUpEmailBody) {
      setAndCombineFollowUpEmail(localOutreachPlan.followUpEmailBody, emailSignature);
    }
    if (localOutreachPlan?.followUpEmailSubjectLines && localOutreachPlan.followUpEmailSubjectLines.length > 0) {
      setSelectedFollowUpSubject(localOutreachPlan.followUpEmailSubjectLines[0]);
    }
  }, [localOutreachPlan, emailSignature, organizationType]);

  useEffect(() => {
    const fetchContactData = async () => {
      if (contactId) {
        try {
          const [contactResponse, fieldsResponse, templatesResponse] = await Promise.all([
            fetch(`/api/ghl/contact/${contactId}`),
            fetch('/api/ghl/custom-fields'),
            fetch('/api/email-templates'),
          ]);

          if (contactResponse.ok) {
            setContactDetails(await contactResponse.json());
          }
          if (fieldsResponse.ok) {
            setCustomFieldDefs(await fieldsResponse.json());
          }
          if (templatesResponse.ok) {
            setEmailTemplates(await templatesResponse.json());
          }
        } catch (error) {
          console.error("Failed to fetch contact data:", error);
        }
      }
    };
    fetchContactData();
  }, [contactId]);

  const handlePopulateTemplate = async (templateId: string) => {
    const template = emailTemplates.find(t => t.id === templateId);
    if (!template || !localOutreachPlan?.insights) return;

    setIsPopulating(true);
    try {
      const response = await fetch('/api/ai/populate-template', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          templateBody: template.body,
          insights: localOutreachPlan.insights,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to populate template');
      }

      const { populatedBody } = await response.json();
      setSelectedSubject(template.subject_line);
      setAndCombineEmail(populatedBody, emailSignature);

    } catch (error) {
      console.error('Error populating template:', error);
    } finally {
      setIsPopulating(false);
    }
  };

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
        body: JSON.stringify({
          contactId,
          homepageUrl,
          caseStudyUrl,
          nonProfitIdentifier,
          organizationType,
          userInsight,
          fundingAnnouncementUrl,
          leadVc,
          firmWebsiteUrl,
          partnerLinkedInUrl,
          recentInvestmentArticleUrl,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate outreach plan');
      }

      const plan = await response.json();
      setLocalOutreachPlan(plan); // Update the local state
      onPlanGenerated();
      setIsRerunningResearch(false);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSyncNotes = async () => {
    if (!contactId || !localOutreachPlan?.insights) return;
    setIsSyncing(true);
    setSyncSuccess(false);

    try {
      const response = await fetch('/api/ghl/add-note', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contactId: contactId,
          note: localOutreachPlan.insights,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to sync notes');
      }
      setSyncSuccess(true);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'An unknown error occurred';
      // In a real app, you might want to set an error state here
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

  const handleSendFollowUpEmail = async () => {
    if (!contactId || !editableFollowUpBody || !selectedFollowUpSubject) return;
    setIsSendingFollowUp(true);
    setSendFollowUpSuccess(false);
    setSendFollowUpError(null);

    try {
      const response = await fetch('/api/ghl/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contactId: contactId,
          body: editableFollowUpBody,
          subject: selectedFollowUpSubject,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to send follow-up email');
      }
      setSendFollowUpSuccess(true);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'An unknown error occurred';
      setSendFollowUpError(message);
    } finally {
      setIsSendingFollowUp(false);
    }
  };

  const customFieldMap = new Map(
    customFieldDefs.map((field) => [field.id, field.name])
  );

  if (isLoading) {
    return <div className="text-center mt-4">Generating outreach plan... (This can take up to 30 seconds)</div>;
  }

  if (error) {
    return <div className="text-center text-red-500 p-4 border border-red-200 bg-red-50 rounded-lg mt-4">{error}</div>;
  }

  if (!localOutreachPlan || isRerunningResearch) {
    return (
      <div className="text-center space-y-4 mt-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2 text-left">
            <Label htmlFor="organization-type">Organization Type</Label>
            <Select value={organizationType} onValueChange={setOrganizationType}>
              <SelectTrigger id="organization-type">
                <SelectValue placeholder="Select organization type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="for-profit">For-Profit</SelectItem>
                <SelectItem value="non-profit">Non-Profit</SelectItem>
                <SelectItem value="vc-backed">VC-Backed Startup</SelectItem>
                <SelectItem value="partnership">Partnership</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {organizationType === 'non-profit' && (
            <div className="space-y-2 text-left">
              <Label htmlFor="non-profit-identifier">Organization Name or EIN</Label>
              <Input
                id="non-profit-identifier"
                type="text"
                placeholder="Enter organization name or EIN"
                value={nonProfitIdentifier}
                onChange={(e) => setNonProfitIdentifier(e.target.value)}
              />
            </div>
          )}
          {organizationType === 'vc-backed' && (
            <>
              <div className="space-y-2 text-left">
                <Label htmlFor="funding-announcement-url">Funding Announcement URL</Label>
                <Input
                  id="funding-announcement-url"
                  type="url"
                  placeholder="e.g., TechCrunch, press release"
                  value={fundingAnnouncementUrl}
                  onChange={(e) => setFundingAnnouncementUrl(e.target.value)}
                />
              </div>
              <div className="space-y-2 text-left">
                <Label htmlFor="lead-vc">Lead VC Firm (Optional)</Label>
                <Input
                  id="lead-vc"
                  type="text"
                  placeholder="e.g., Sequoia, Andreessen Horowitz"
                  value={leadVc}
                  onChange={(e) => setLeadVc(e.target.value)}
                />
              </div>
            </>
          )}
          {organizationType === 'partnership' && (
            <>
              <div className="space-y-2 text-left">
                <Label htmlFor="firm-website-url">Firm Website URL</Label>
                <Input
                  id="firm-website-url"
                  type="url"
                  placeholder="e.g., VC, Private Equity firm"
                  value={firmWebsiteUrl}
                  onChange={(e) => setFirmWebsiteUrl(e.target.value)}
                />
              </div>
              <div className="space-y-2 text-left">
                <Label htmlFor="partner-linkedin-url">Partner's LinkedIn Profile URL (Optional)</Label>
                <Input
                  id="partner-linkedin-url"
                  type="url"
                  placeholder="LinkedIn profile for personalization"
                  value={partnerLinkedInUrl}
                  onChange={(e) => setPartnerLinkedInUrl(e.target.value)}
                />
              </div>
              <div className="space-y-2 text-left">
                <Label htmlFor="recent-investment-article-url">Recent Investment Article URL (Optional)</Label>
                <Input
                  id="recent-investment-article-url"
                  type="url"
                  placeholder="Article for hyper-personalization"
                  value={recentInvestmentArticleUrl}
                  onChange={(e) => setRecentInvestmentArticleUrl(e.target.value)}
                />
              </div>
            </>
          )}
        </div>
        {organizationType !== 'partnership' && (
          <>
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
          </>
        )}
        <Textarea
          placeholder="Your Key Insight (Optional). Add a crucial piece of info you already know. The AI will build its analysis around this."
          value={userInsight}
          onChange={(e) => setUserInsight(e.target.value)}
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
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="insights">Insights</TabsTrigger>
          <TabsTrigger value="email">Email</TabsTrigger>
          <TabsTrigger value="follow-up">Follow-up</TabsTrigger>
          <TabsTrigger value="linkedin">LinkedIn</TabsTrigger>
          <TabsTrigger value="call">Call Script</TabsTrigger>
        </TabsList>
        <TabsContent value="insights" className="mt-4">
          <Card>
            <CardContent className="p-6 space-y-4">
              {organizationType === 'non-profit' ? (
                <div className="prose max-w-none text-muted-foreground">
                  <ReactMarkdown components={renderers}>{localOutreachPlan.insights}</ReactMarkdown>
                </div>
              ) : (
                Object.entries(parsedInsights).map(([key, value]) => {
                  const title = key.replace(/([A-Z])/g, ' $1').replace(/^./, (str) => str.toUpperCase());
                  return (
                    value && (
                      <div key={key}>
                        <h4 className="font-semibold text-lg mb-2">{title}</h4>
                        <div className="prose max-w-none text-muted-foreground">
                          <ReactMarkdown components={renderers}>{value}</ReactMarkdown>
                        </div>
                        <Separator className="mt-4" />
                      </div>
                    )
                  );
                })
              )}
            </CardContent>
          </Card>
          <div className="mt-6 flex gap-4">
            <Button onClick={handleSyncNotes} disabled={isSyncing || syncSuccess}>
              {isSyncing ? 'Syncing...' : syncSuccess ? 'Synced!' : 'Sync Notes to GHL'}
            </Button>
          </div>
        </TabsContent>
        <TabsContent value="email" className="mt-4">
          <Card>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="space-y-2">
                  <Label htmlFor="subject-select">Subject Line</Label>
                  <Select id="subject-select" value={selectedSubject} onValueChange={setSelectedSubject}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a subject line..." />
                    </SelectTrigger>
                    <SelectContent>
                      {localOutreachPlan.subjectLines && Array.isArray(localOutreachPlan.subjectLines) && localOutreachPlan.subjectLines.filter(Boolean).map((subject, index) => (
                        <SelectItem key={index} value={subject}>
                          {subject}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="template-select">Use a Template</Label>
                  <Select onValueChange={handlePopulateTemplate} disabled={isPopulating}>
                    <SelectTrigger id="template-select">
                      <SelectValue placeholder={isPopulating ? "Populating..." : "Select a template"} />
                    </SelectTrigger>
                    <SelectContent>
                      {emailTemplates.map((template) => (
                        <SelectItem key={template.id} value={template.id}>
                          {template.template_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
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
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="follow-up" className="mt-4">
          <Card>
            <CardContent className="p-6">
              <div className="space-y-2 mb-4">
                <Label htmlFor="follow-up-subject-select">Follow-up Subject Line</Label>
                <Select id="follow-up-subject-select" value={selectedFollowUpSubject} onValueChange={setSelectedFollowUpSubject}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a subject line..." />
                  </SelectTrigger>
                  <SelectContent>
                    {localOutreachPlan.followUpEmailSubjectLines && Array.isArray(localOutreachPlan.followUpEmailSubjectLines) && localOutreachPlan.followUpEmailSubjectLines.filter(Boolean).map((subject, index) => (
                      <SelectItem key={index} value={subject}>
                        {subject}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <JoditEditor
                value={editableFollowUpBody}
                onBlur={(newContent) => setEditableFollowUpBody(newContent)}
                config={{ readonly: false, height: 200 }}
              />
              <div className="mt-6">
                <Button onClick={handleSendFollowUpEmail} disabled={isSendingFollowUp || sendFollowUpSuccess}>
                  {isSendingFollowUp ? 'Sending...' : sendFollowUpSuccess ? 'Sent!' : 'Send Follow-up Email'}
                </Button>
                {sendFollowUpError && <p className="text-red-500 text-sm mt-2">{sendFollowUpError}</p>}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="linkedin" className="mt-4">
          <Card>
            <CardContent className="prose max-w-none p-6">
              <div className="flex space-x-2 mb-4">
                {contactDetails?.customFields?.map((field) => {
                  const fieldName = customFieldMap.get(field.id)?.toLowerCase();
                  if (fieldName === 'person linkedin' && field.value) {
                    return (
                      <a
                        key={field.id}
                        href={String(field.value)}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Button variant="outline">Personal LinkedIn</Button>
                      </a>
                    );
                  }
                  if (fieldName === 'company linkedin' && field.value) {
                    return (
                      <a
                        key={field.id}
                        href={String(field.value)}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Button variant="outline">Company LinkedIn</Button>
                      </a>
                    );
                  }
                  return null;
                })}
              </div>
              <h4 className="font-semibold mb-2 not-prose">Request DM</h4>
              <ReactMarkdown>{localOutreachPlan.linkedinConnectionNote}</ReactMarkdown>
              <hr className="my-4" />
              <h4 className="font-semibold mb-2 not-prose">Connection DM</h4>
              <ReactMarkdown>{localOutreachPlan.linkedinFollowUpDm}</ReactMarkdown>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="call" className="mt-4">
          <Card>
            <CardContent className="prose max-w-none p-6">
              <ReactMarkdown>{localOutreachPlan.coldCallScript}</ReactMarkdown>
            </CardContent>
          </Card>
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
