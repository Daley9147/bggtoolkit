'use client';

import { useState, useEffect, useCallback } from 'react';

const BOARD_SIZE = 20;
const INITIAL_SNAKE_POSITION = [{ x: 10, y: 10 }];
const INITIAL_FOOD_POSITION = { x: 15, y: 15 };
const GAME_SPEED = 200;

type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';

const createEmptyBoard = () => Array.from({ length: BOARD_SIZE }, () => Array(BOARD_SIZE).fill(0));

export const useSnake = () => {
  const [board, setBoard] = useState(createEmptyBoard());
  const [snake, setSnake] = useState(INITIAL_SNAKE_POSITION);
  const [food, setFood] = useState(INITIAL_FOOD_POSITION);
  const [direction, setDirection] = useState<Direction>('RIGHT');
  const [isGameOver, setIsGameOver] = useState(true);
  const [score, setScore] = useState(0);

  const startGame = () => {
    setSnake(INITIAL_SNAKE_POSITION);
    setFood(INITIAL_FOOD_POSITION);
    setDirection('RIGHT');
    setIsGameOver(false);
    setScore(0);
  };

  const moveSnake = useCallback(() => {
    if (isGameOver) return;

    setSnake(prevSnake => {
      const newSnake = [...prevSnake];
      const head = { ...newSnake[0] };

      switch (direction) {
        case 'UP': head.y -= 1; break;
        case 'DOWN': head.y += 1; break;
        case 'LEFT': head.x -= 1; break;
        case 'RIGHT': head.x += 1; break;
      }

      // Check for wall collision
      if (head.x < 0 || head.x >= BOARD_SIZE || head.y < 0 || head.y >= BOARD_SIZE) {
        setIsGameOver(true);
        return prevSnake;
      }

      // Check for self collision
      for (let i = 1; i < newSnake.length; i++) {
        if (head.x === newSnake[i].x && head.y === newSnake[i].y) {
          setIsGameOver(true);
          return prevSnake;
        }
      }

      newSnake.unshift(head);

      // Check for food collision
      if (head.x === food.x && head.y === food.y) {
        setScore(prev => prev + 10);
        // Generate new food
        let newFoodPosition;
        do {
          newFoodPosition = {
            x: Math.floor(Math.random() * BOARD_SIZE),
            y: Math.floor(Math.random() * BOARD_SIZE),
          };
        } while (newSnake.some(segment => segment.x === newFoodPosition.x && segment.y === newFoodPosition.y));
        setFood(newFoodPosition);
      } else {
        newSnake.pop();
      }

      return newSnake;
    });
  }, [direction, food, isGameOver]);

  useEffect(() => {
    const gameLoop = setInterval(moveSnake, GAME_SPEED);
    return () => clearInterval(gameLoop);
  }, [moveSnake]);

  const handleKeyDown = (e: KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowUp':
        setDirection(prev => (prev !== 'DOWN' ? 'UP' : prev));
        break;
      case 'ArrowDown':
        setDirection(prev => (prev !== 'UP' ? 'DOWN' : prev));
        break;
      case 'ArrowLeft':
        setDirection(prev => (prev !== 'RIGHT' ? 'LEFT' : prev));
        break;
      case 'ArrowRight':
        setDirection(prev => (prev !== 'LEFT' ? 'RIGHT' : prev));
        break;
    }
  };

  useEffect(() => {
    if (isGameOver && score > 0) {
      fetch('/api/snake-scores', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ score }),
      });
    }
  }, [isGameOver, score]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return { board, snake, food, isGameOver, score, startGame };
};
