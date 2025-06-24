
import React from 'react';
import { Badge } from "@/components/ui/badge";
import { Clock, Target, User } from "lucide-react";

interface PlayerData {
  name: string;
}

interface OpponentData {
  username: string;
}

interface Problem {
  difficulty: string;
}

interface ArenaHeaderProps {
  gameTime: number;
  problem: Problem;
  roomCode: string | null;
  playerData: PlayerData;
  opponentData: OpponentData | null;
}

const ArenaHeader: React.FC<ArenaHeaderProps> = ({
  gameTime,
  problem,
  roomCode,
  playerData,
  opponentData
}) => {
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="border-b border-slate-700 bg-slate-800/50 backdrop-blur-sm">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-cyan-400" />
              <span className="text-2xl font-mono font-bold text-cyan-400">
                {formatTime(gameTime)}
              </span>
            </div>
            <Badge variant="outline" className="text-green-400 border-green-400">
              <Target className="h-3 w-3 mr-1" />
              {problem.difficulty}
            </Badge>
            {roomCode && (
              <Badge variant="outline" className="text-purple-400 border-purple-400">
                Room: {roomCode}
              </Badge>
            )}
          </div>
          
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-2">
              <User className="h-4 w-4 text-cyan-400" />
              <span className="text-cyan-400">{playerData.name}</span>
            </div>
            <div className="text-gray-400">VS</div>
            <div className="flex items-center space-x-2">
              <User className="h-4 w-4 text-purple-400" />
              <span className="text-purple-400">{opponentData?.username || 'Loading...'}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ArenaHeader;
