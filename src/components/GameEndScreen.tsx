
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trophy, XCircle, Home } from "lucide-react";

interface Problem {
  title: string;
}

interface OpponentData {
  username: string;
}

interface GameEndScreenProps {
  gameStatus: 'won' | 'lost';
  gameTime: number;
  submissions: number;
  problem: Problem;
  opponentData: OpponentData | null;
  onGameEnd: () => void;
}

const GameEndScreen: React.FC<GameEndScreenProps> = ({
  gameStatus,
  gameTime,
  submissions,
  problem,
  opponentData,
  onGameEnd
}) => {
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (gameStatus === 'won') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-green-900 to-slate-900 text-white flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-slate-800/50 border-green-500/50 backdrop-blur-sm">
          <CardHeader className="text-center">
            <Trophy className="h-16 w-16 text-yellow-400 mx-auto mb-4 animate-bounce" />
            <CardTitle className="text-3xl text-green-400">Victory!</CardTitle>
            <p className="text-gray-300">You solved it first!</p>
          </CardHeader>
          <CardContent className="space-y-4 text-center">
            <div className="bg-green-500/20 p-4 rounded-lg">
              <p className="text-green-400 font-semibold">Time: {formatTime(gameTime)}</p>
              <p className="text-gray-300">Submissions: {submissions}</p>
              <p className="text-gray-300">Problem: {problem.title}</p>
            </div>
            <Button onClick={onGameEnd} className="w-full bg-gradient-to-r from-cyan-500 to-purple-500">
              <Home className="mr-2 h-4 w-4" />
              Return to Arena
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-red-900 to-slate-900 text-white flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-slate-800/50 border-red-500/50 backdrop-blur-sm">
        <CardHeader className="text-center">
          <XCircle className="h-16 w-16 text-red-400 mx-auto mb-4" />
          <CardTitle className="text-3xl text-red-400">Defeat</CardTitle>
          <p className="text-gray-300">{opponentData?.username || 'Your opponent'} solved it first!</p>
        </CardHeader>
        <CardContent className="space-y-4 text-center">
          <div className="bg-red-500/20 p-4 rounded-lg">
            <p className="text-red-400 font-semibold">Time: {formatTime(gameTime)}</p>
            <p className="text-gray-300">Better luck next time!</p>
            <p className="text-gray-300">Problem: {problem.title}</p>
          </div>
          <Button onClick={onGameEnd} className="w-full bg-gradient-to-r from-cyan-500 to-purple-500">
            <Home className="mr-2 h-4 w-4" />
            Return to Arena
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default GameEndScreen;
