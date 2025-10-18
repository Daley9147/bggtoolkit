'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface ScoreboardProps {
  score: number;
}

export default function Scoreboard({ score }: ScoreboardProps) {
  const formattedScore = score.toString().padStart(6, '0');

  return (
    <Card className="bg-black border-2 border-gray-700 shadow-inner shadow-gray-900">
      <CardHeader>
        <CardTitle className="text-sm font-medium text-center text-red-400/80 font-mono tracking-widest">
          SCORE
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-5xl font-bold text-center text-red-500 font-mono scoreboard-text">
          {formattedScore}
        </p>
      </CardContent>
    </Card>
  );
}
