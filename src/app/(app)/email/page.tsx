import EmailClient from '@/components/email/email-client';

export default function EmailPage() {
  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] p-4 md:p-6">
        <EmailClient />
    </div>
  );
}
