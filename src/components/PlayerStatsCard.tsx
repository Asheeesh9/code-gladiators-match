
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Crown } from "lucide-react";

interface UserProfile {
  username: string;
  wins: number;
  losses: number;
  total_matches: number;
  rating: number;
}

interface PlayerStatsCardProps {
  profile: UserProfile;
}

const PlayerStatsCard: React.FC<PlayerStatsCardProps> = ({ profile }) => {
  return (
    <Card className="max-w-md mx-auto mb-16 bg-slate-800/50 border-slate-700 backdrop-blur-sm">
      <CardHeader className="text-center">
        <div className="flex items-center justify-center mb-2">
          <Crown className="h-6 w-6 text-yellow-400 mr-2" />
          <CardTitle className="text-white">{profile.username}</CardTitle>
        </div>
        <CardDescription className="text-gray-400">Your Arena Stats</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex justify-center space-x-8">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-400">{profile.wins}</div>
            <p className="text-gray-400 text-sm">Victories</p>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-400">{profile.losses}</div>
            <p className="text-gray-400 text-sm">Defeats</p>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-cyan-400">
              {profile.total_matches > 0 ? Math.round((profile.wins / profile.total_matches) * 100) : 0}%
            </div>
            <p className="text-gray-400 text-sm">Win Rate</p>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-400">{profile.rating}</div>
            <p className="text-gray-400 text-sm">Rating</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PlayerStatsCard;
