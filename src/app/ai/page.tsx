import Header from '@/components/layout/header';
import AiClient from '@/components/ai/ai-client';

export default function AiPage() {
  return (
    <div className="flex min-h-screen w-full flex-col">
      <Header />
      <main className="flex-1">
        <AiClient />
      </main>
    </div>
  );
}
