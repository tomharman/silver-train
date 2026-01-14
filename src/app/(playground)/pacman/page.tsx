"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import type { UIState, GameState } from "./types/game";
import { GameEngine } from "./game/engine";

export default function PacmanPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<GameEngine | null>(null);
  const [uiState, setUIState] = useState<UIState>({
    score: 0,
    lives: 3,
    level: 1,
    state: "initializing" as GameState,
    fps: 0,
  });
  const [isGameStarted, setIsGameStarted] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Initialize game engine
    const engine = new GameEngine(canvas);
    engineRef.current = engine;

    // Set up UI update callback
    engine.onUIUpdate((newUIState) => {
      setUIState(newUIState);
    });

    // Initial render
    setUIState((prev) => ({ ...prev, state: "ready" as GameState }));

    // Cleanup on unmount
    return () => {
      if (engineRef.current) {
        engineRef.current.destroy();
      }
    };
  }, []);

  const handleStart = () => {
    setIsGameStarted(true);
    if (engineRef.current) {
      engineRef.current.start();
    }
  };

  const handlePause = () => {
    setIsGameStarted(false);
    if (engineRef.current) {
      engineRef.current.pause();
    }
  };

  const handleRestart = () => {
    setIsGameStarted(false);
    if (engineRef.current) {
      engineRef.current.reset();
      setUIState({
        score: 0,
        lives: 3,
        level: 1,
        state: "ready" as GameState,
        fps: 0,
      });
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-8">
      {/* Header */}
      <div className="mb-6 text-center">
        <h1 className="text-4xl font-bold mb-2">Pacman</h1>
        <div className="flex gap-8 justify-center text-lg">
          <div>Score: <span className="font-bold">{uiState.score}</span></div>
          <div>Lives: <span className="font-bold">{uiState.lives}</span></div>
          <div>Level: <span className="font-bold">{uiState.level}</span></div>
        </div>
      </div>

      {/* Canvas */}
      <div className="relative border-4 border-primary rounded-lg overflow-hidden mb-6 bg-black">
        <canvas ref={canvasRef} className="block" />

        {/* Overlay for game states */}
        {uiState.state === "ready" && !isGameStarted && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50">
            <div className="text-white text-2xl font-bold">READY!</div>
          </div>
        )}

        {uiState.state === "paused" && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50">
            <div className="text-white text-2xl font-bold">PAUSED</div>
          </div>
        )}

        {uiState.state === "game_over" && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50">
            <div className="text-white text-2xl font-bold">GAME OVER</div>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="flex gap-4">
        {!isGameStarted ? (
          <Button onClick={handleStart} size="lg">
            {uiState.score > 0 ? "Resume" : "Start Game"}
          </Button>
        ) : (
          <Button onClick={handlePause} size="lg" variant="secondary">
            Pause
          </Button>
        )}
        <Button onClick={handleRestart} size="lg" variant="outline">
          Restart
        </Button>
      </div>

      {/* Instructions */}
      <div className="mt-8 text-center text-sm text-muted-foreground max-w-md">
        <p className="mb-2">Use arrow keys or WASD to move Pacman</p>
        <p>Collect all dots while avoiding ghosts. Eat power pellets to turn the tables!</p>
      </div>

      {/* Debug Info (development only) */}
      {process.env.NODE_ENV === "development" && (
        <div className="mt-4 text-xs text-muted-foreground">
          FPS: {uiState.fps} | State: {uiState.state}
        </div>
      )}
    </div>
  );
}
