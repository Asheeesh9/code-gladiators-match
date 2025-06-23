
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Code, Zap, Trophy, Users, Swords, Play, Crown } from "lucide-react";
import MatchmakingQueue from "@/components/MatchmakingQueue";
import CodeArena from "@/components/CodeArena";

const Index = () => {
  const [gameState, setGameState] = useState<'landing' | 'queue' | 'arena'>('landing');
  const [playerData, setPlayerData] = useState({
    name: `Player${Math.floor(Math.random() * 9999)}`,
    wins: Math.floor(Math.random() * 50),
    losses: Math.floor(Math.random() * 30)
  });

  const handleJoinQueue = () => {
    setGameState('queue');
  };

  const handleMatchFound = () => {
    setGameState('arena');
  };

  const handleReturnHome = () => {
    setGameState('landing');
  };

  if (gameState === 'queue') {
    return <MatchmakingQueue onMatchFound={handleMatchFound} onCancel={handleReturnHome} />;
  }

  if (gameState === 'arena') {
    return <CodeArena onGameEnd={handleReturnHome} playerData={playerData} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-16">
          <div className="flex items-center justify-center mb-6">
            <Swords className="h-12 w-12 text-cyan-400 mr-4" />
            <h1 className="text-6xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
              Algo Arena
            </h1>
            <Swords className="h-12 w-12 text-cyan-400 ml-4 scale-x-[-1]" />
          </div>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Enter the ultimate competitive coding battleground. Face off against developers worldwide 
            in real-time algorithm duels. Code fast, think faster.
          </p>
          <Button 
            onClick={handleJoinQueue}
            size="lg" 
            className="bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 text-white px-8 py-6 text-lg font-semibold rounded-lg transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-cyan-500/25"
          >
            <Play className="mr-2 h-5 w-5" />
            Enter Arena
          </Button>
        </div>

        {/* Stats Section */}
        <div className="grid md:grid-cols-3 gap-6 mb-16">
          <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm hover:bg-slate-800/70 transition-all duration-300">
            <CardHeader className="text-center">
              <Users className="h-8 w-8 text-cyan-400 mx-auto mb-2" />
              <CardTitle className="text-white">Live Players</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-cyan-400 text-center">1,247</div>
              <p className="text-gray-400 text-center text-sm">Currently online</p>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm hover:bg-slate-800/70 transition-all duration-300">
            <CardHeader className="text-center">
              <Zap className="h-8 w-8 text-purple-400 mx-auto mb-2" />
              <CardTitle className="text-white">Active Matches</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-purple-400 text-center">89</div>
              <p className="text-gray-400 text-center text-sm">Battles in progress</p>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm hover:bg-slate-800/70 transition-all duration-300">
            <CardHeader className="text-center">
              <Trophy className="h-8 w-8 text-yellow-400 mx-auto mb-2" />
              <CardTitle className="text-white">Problems Solved</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-yellow-400 text-center">15,432</div>
              <p className="text-gray-400 text-center text-sm">This week</p>
            </CardContent>
          </Card>
        </div>

        {/* Player Stats */}
        <Card className="max-w-md mx-auto mb-16 bg-slate-800/50 border-slate-700 backdrop-blur-sm">
          <CardHeader className="text-center">
            <div className="flex items-center justify-center mb-2">
              <Crown className="h-6 w-6 text-yellow-400 mr-2" />
              <CardTitle className="text-white">{playerData.name}</CardTitle>
            </div>
            <CardDescription className="text-gray-400">Your Arena Stats</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex justify-center space-x-8">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-400">{playerData.wins}</div>
                <p className="text-gray-400 text-sm">Victories</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-400">{playerData.losses}</div>
                <p className="text-gray-400 text-sm">Defeats</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-cyan-400">
                  {Math.round((playerData.wins / (playerData.wins + playerData.losses)) * 100)}%
                </div>
                <p className="text-gray-400 text-sm">Win Rate</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* How It Works */}
        <div className="text-center">
          <h2 className="text-3xl font-bold mb-8 text-white">How It Works</h2>
          <div className="grid md:grid-cols-4 gap-6">
            <div className="bg-slate-800/30 p-6 rounded-lg border border-slate-700">
              <div className="bg-cyan-500/20 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-cyan-400 font-bold text-lg">1</span>
              </div>
              <h3 className="font-semibold mb-2 text-white">Join Queue</h3>
              <p className="text-gray-400 text-sm">Enter matchmaking and wait for an opponent</p>
            </div>
            <div className="bg-slate-800/30 p-6 rounded-lg border border-slate-700">
              <div className="bg-purple-500/20 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-purple-400 font-bold text-lg">2</span>
              </div>
              <h3 className="font-semibold mb-2 text-white">Get Problem</h3>
              <p className="text-gray-400 text-sm">Both players receive the same coding challenge</p>
            </div>
            <div className="bg-slate-800/30 p-6 rounded-lg border border-slate-700">
              <div className="bg-yellow-500/20 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-yellow-400 font-bold text-lg">3</span>
              </div>
              <h3 className="font-semibold mb-2 text-white">Code & Submit</h3>
              <p className="text-gray-400 text-sm">Write your solution and submit for testing</p>
            </div>
            <div className="bg-slate-800/30 p-6 rounded-lg border border-slate-700">
              <div className="bg-green-500/20 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-green-400 font-bold text-lg">4</span>
              </div>
              <h3 className="font-semibold mb-2 text-white">First to Win</h3>
              <p className="text-gray-400 text-sm">First correct solution takes victory</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
