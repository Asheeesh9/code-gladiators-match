
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Users, Clock, X, Swords } from "lucide-react";

interface MatchmakingQueueProps {
  onMatchFound: () => void;
  onCancel: () => void;
}

const MatchmakingQueue: React.FC<MatchmakingQueueProps> = ({ onMatchFound, onCancel }) => {
  const [queueTime, setQueueTime] = useState(0);
  const [playersInQueue, setPlayersInQueue] = useState(12);
  const [matchingStatus, setMatchingStatus] = useState<'searching' | 'found' | 'connecting'>('searching');

  useEffect(() => {
    const timer = setInterval(() => {
      setQueueTime(prev => prev + 1);
      
      // Simulate queue dynamics
      if (Math.random() < 0.1) {
        setPlayersInQueue(prev => Math.max(1, prev + (Math.random() > 0.5 ? 1 : -1)));
      }
      
      // Simulate match found after 8-15 seconds
      if (queueTime > 8 && Math.random() < 0.15) {
        setMatchingStatus('found');
        setTimeout(() => {
          setMatchingStatus('connecting');
          setTimeout(() => {
            onMatchFound();
          }, 2000);
        }, 1500);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [queueTime, onMatchFound]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-slate-800/50 border-slate-700 backdrop-blur-sm">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center mb-4">
            {matchingStatus === 'searching' && <Loader2 className="h-8 w-8 text-cyan-400 animate-spin" />}
            {matchingStatus === 'found' && <Swords className="h-8 w-8 text-green-400 animate-pulse" />}
            {matchingStatus === 'connecting' && <Users className="h-8 w-8 text-purple-400 animate-bounce" />}
          </div>
          <CardTitle className="text-2xl text-white">
            {matchingStatus === 'searching' && 'Searching for Opponent'}
            {matchingStatus === 'found' && 'Match Found!'}
            {matchingStatus === 'connecting' && 'Connecting to Arena'}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-cyan-400 mb-2">
              {formatTime(queueTime)}
            </div>
            <p className="text-gray-400">Queue Time</p>
          </div>

          <div className="flex items-center justify-between bg-slate-700/50 p-3 rounded-lg">
            <div className="flex items-center">
              <Users className="h-5 w-5 text-cyan-400 mr-2" />
              <span className="text-white">Players in Queue</span>
            </div>
            <Badge variant="secondary" className="bg-cyan-500/20 text-cyan-400">
              {playersInQueue}
            </Badge>
          </div>

          {matchingStatus === 'found' && (
            <div className="bg-green-500/20 border border-green-500/50 p-4 rounded-lg text-center">
              <p className="text-green-400 font-semibold">Opponent Found!</p>
              <p className="text-gray-300 text-sm mt-1">Preparing arena...</p>
            </div>
          )}

          {matchingStatus === 'connecting' && (
            <div className="bg-purple-500/20 border border-purple-500/50 p-4 rounded-lg text-center">
              <p className="text-purple-400 font-semibold">Entering Arena...</p>
              <p className="text-gray-300 text-sm mt-1">Get ready to code!</p>
            </div>
          )}

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Average wait time</span>
              <span className="text-white">~45s</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Skill matching</span>
              <Badge variant="outline" className="text-cyan-400 border-cyan-400">Active</Badge>
            </div>
          </div>

          {matchingStatus === 'searching' && (
            <Button 
              onClick={onCancel}
              variant="outline" 
              className="w-full border-red-500/50 text-red-400 hover:bg-red-500/20"
            >
              <X className="mr-2 h-4 w-4" />
              Cancel Search
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default MatchmakingQueue;
