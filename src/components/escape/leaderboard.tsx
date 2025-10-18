'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface Score {
  fullName: string;
  score: number;
}

interface LeaderboardProps {
  refreshKey: number;
}

export default function Leaderboard({ refreshKey }: LeaderboardProps) {
  const [scores, setScores] = useState<Score[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchScores = async () => {
      setIsLoading(true);
      try {
        const response = await fetch('/api/snake-scores');
        if (response.ok) {
          const data = await response.json();
          setScores(data);
        }
      } catch (error) {
        console.error('Failed to fetch scores:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchScores();
  }, [refreshKey]);

  return (
    <Card className="bg-black border-2 border-gray-700 shadow-inner shadow-gray-900">
      <CardHeader>
        <CardTitle className="text-lg font-bold text-center text-red-400/80 font-mono tracking-widest">
          HIGH SCORES
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="text-center font-mono text-red-400/80">Loading...</div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="border-gray-700">
                <TableHead className="text-red-400/80 font-mono">Rank</TableHead>
                <TableHead className="text-red-400/80 font-mono">Name</TableHead>
                <TableHead className="text-right text-red-400/80 font-mono">Score</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {scores.map((score, index) => (
                <TableRow key={index} className="border-gray-800">
                  <TableCell className="font-medium font-mono text-red-500 scoreboard-text">{index + 1}</TableCell>
                  <TableCell className="font-mono text-red-500 scoreboard-text">{score.fullName}</TableCell>
                  <TableCell className="text-right font-mono text-red-500 scoreboard-text">{score.score}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
