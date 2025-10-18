'use client';

import { useSnake } from '@/hooks/use-snake';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import Leaderboard from './leaderboard';
import Scoreboard from './scoreboard';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

const BOARD_SIZE = 20;

const Board = ({ snake, food, isShaking }: { snake: { x: number; y: number }[]; food: { x: number; y: number }; isShaking: boolean }) => {
  const grid = Array.from({ length: BOARD_SIZE }, () => Array(BOARD_SIZE).fill(null));

  snake.forEach((segment, index) => {
    if (segment.x >= 0 && segment.x < BOARD_SIZE && segment.y >= 0 && segment.y < BOARD_SIZE) {
      grid[segment.y][segment.x] = { type: 'snake', index };
    }
  });

  if (food.x >= 0 && food.x < BOARD_SIZE && food.y >= 0 && food.y < BOARD_SIZE) {
    grid[food.y][food.x] = { type: 'food' };
  }

  return (
    <div
      className={cn(
        'grid bg-black border-4 border-gray-700 rounded-lg shadow-inner shadow-gray-900',
        'bg-[radial-gradient(#111_1px,transparent_1px)] [background-size:24px_24px]',
        isShaking && 'animate-shake'
      )}
      style={{
        gridTemplateColumns: `repeat(${BOARD_SIZE}, 1fr)`,
        gridTemplateRows: `repeat(${BOARD_SIZE}, 1fr)`,
        width: '480px',
        height: '480px',
      }}
    >
      {grid.map((row, y) =>
        row.map((cell, x) => {
          let content = null;
          if (cell?.type === 'snake') {
            const isHead = cell.index === 0;
            const opacity = 1 - (cell.index / snake.length) * 0.7;
            content = (
              <div
                className="w-full h-full rounded-sm relative"
                style={{ 
                  backgroundColor: `rgba(52, 211, 153, ${opacity})`,
                  boxShadow: `0 0 8px rgba(52, 211, 153, ${opacity * 0.8})`
                }}
              >
                {isHead && <div className="absolute w-1/3 h-1/3 bg-black rounded-full top-1/3 left-1/3" />}
              </div>
            );
          } else if (cell?.type === 'food') {
            content = (
              <div className="w-full h-full bg-red-500 rounded-full" style={{ animation: 'pulse 1s infinite', boxShadow: '0 0 8px #ef4444' }} />
            );
          }
          return (
            <div key={`${y}-${x}`} className="w-full h-full border border-gray-900/50">
              {content}
            </div>
          );
        })
      )}
    </div>
  );
};

export default function SnakeClient() {
  const { snake, food, isGameOver, score, startGame } = useSnake();
  const [refreshKey, setRefreshKey] = useState(0);
  const [isShaking, setIsShaking] = useState(false);

  useEffect(() => {
    if (isGameOver && score > 0) {
      setRefreshKey(prev => prev + 1);
      setIsShaking(true);
      const timer = setTimeout(() => setIsShaking(false), 820);
      return () => clearTimeout(timer);
    }
  }, [isGameOver, score]);

  return (
    <div className="flex items-center justify-center">
      <div className="relative p-8 rounded-xl bg-white/10 backdrop-blur-lg border border-white/20">
        <div className="flex gap-8 items-start">
          <Board snake={snake} food={food} isShaking={isShaking} />

          <div className="w-64">
            <ScrollArea className="h-[480px] pr-4">
              <div className="space-y-4">
                <Scoreboard score={score} />

                <Button
                  onClick={startGame}
                  className={cn(
                    "w-full bg-black hover:bg-gray-900 text-green-400 neon-green-text border border-green-700 shadow-lg shadow-green-500/10 text-lg",
                    isGameOver && "animate-pulse"
                  )}
                >
                  {isGameOver ? 'Start Game' : 'Restart'}
                </Button>

                <Leaderboard refreshKey={refreshKey} />
              </div>
            </ScrollArea>
          </div>
        </div>

        {isGameOver && score > 0 && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-xl">
            <div className="text-center text-white">
              <h2 className="text-4xl font-bold">Game Over</h2>
              <p>Your score: {score}</p>
              <Button 
                onClick={startGame} 
                className="mt-4 bg-black hover:bg-gray-900 text-green-400 neon-green-text border border-green-700 shadow-lg shadow-green-500/10"
              >
                Play Again
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
