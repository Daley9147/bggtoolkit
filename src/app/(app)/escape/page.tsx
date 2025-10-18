import SnakeClient from '@/components/escape/snake-client';

export default function EscapePage() {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6 text-center">Escape</h1>
      <SnakeClient />
    </div>
  );
}
