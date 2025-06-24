
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Users, Clock, X, Swords } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface MatchmakingQueueProps {
  onMatchFound: (roomCode: string) => void;
  onCancel: () => void;
}

interface QueueEntry {
  id: string;
  user_id: string;
  user_profile: {
    username: string;
    rating: number;
  };
  created_at: string;
}

interface MatchRoom {
  id: string;
  room_code: string;
  player1_id: string;
  player2_id: string;
  problem_id: string;
  status: string;
}

const MatchmakingQueue: React.FC<MatchmakingQueueProps> = ({ onMatchFound, onCancel }) => {
  const [queueTime, setQueueTime] = useState(0);
  const [playersInQueue, setPlayersInQueue] = useState(0);
  const [matchingStatus, setMatchingStatus] = useState<'searching' | 'found' | 'connecting'>('searching');
  const [inQueue, setInQueue] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    initializeMatchmaking();
    return () => {
      if (inQueue && currentUserId) {
        leaveQueue();
      }
    };
  }, []);

  useEffect(() => {
    if (matchingStatus === 'searching' && inQueue) {
      const timer = setInterval(() => {
        setQueueTime(prev => prev + 1);
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [matchingStatus, inQueue]);

  const initializeMatchmaking = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Error",
          description: "You must be logged in to join the queue",
          variant: "destructive",
        });
        onCancel();
        return;
      }

      setCurrentUserId(user.id);
      await joinQueue(user.id);
      setupRealtimeSubscriptions(user.id);
    } catch (error) {
      console.error('Error initializing matchmaking:', error);
      toast({
        title: "Error",
        description: "Failed to join matchmaking queue",
        variant: "destructive",
      });
    }
  };

  const joinQueue = async (userId: string) => {
    try {
      // Get user profile
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('username, rating')
        .eq('id', userId)
        .single();

      if (profileError) throw profileError;

      // Join the queue
      const { error: insertError } = await supabase
        .from('matchmaking_queue')
        .insert({
          user_id: userId,
          user_profile: {
            username: profile.username,
            rating: profile.rating
          }
        });

      if (insertError) throw insertError;

      setInQueue(true);
      console.log('Successfully joined matchmaking queue');

      // Try to create a match immediately
      await tryCreateMatch();
    } catch (error) {
      console.error('Error joining queue:', error);
      toast({
        title: "Error",
        description: "Failed to join queue",
        variant: "destructive",
      });
    }
  };

  const leaveQueue = async () => {
    if (!currentUserId) return;

    try {
      const { error } = await supabase
        .from('matchmaking_queue')
        .delete()
        .eq('user_id', currentUserId);

      if (error) throw error;
      
      setInQueue(false);
      console.log('Left matchmaking queue');
    } catch (error) {
      console.error('Error leaving queue:', error);
    }
  };

  const tryCreateMatch = async () => {
    try {
      const { error } = await supabase.rpc('create_match_from_queue');
      if (error) throw error;
    } catch (error) {
      console.error('Error creating match:', error);
    }
  };

  const setupRealtimeSubscriptions = (userId: string) => {
    // Listen for queue changes
    const queueChannel = supabase
      .channel('matchmaking_queue_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'matchmaking_queue'
        },
        async (payload) => {
          console.log('Queue change:', payload);
          
          // Update queue count
          const { data: queueData } = await supabase
            .from('matchmaking_queue')
            .select('*');
          setPlayersInQueue(queueData?.length || 0);

          // Try to create match when new player joins
          if (payload.eventType === 'INSERT') {
            setTimeout(() => tryCreateMatch(), 1000);
          }
        }
      )
      .subscribe();

    // Listen for match room creation
    const matchChannel = supabase
      .channel('match_rooms_changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'match_rooms'
        },
        (payload) => {
          console.log('New match room:', payload);
          const matchRoom = payload.new as MatchRoom;
          
          // Check if current user is in this match
          if (matchRoom.player1_id === userId || matchRoom.player2_id === userId) {
            setMatchingStatus('found');
            setTimeout(() => {
              setMatchingStatus('connecting');
              setTimeout(() => {
                onMatchFound(matchRoom.room_code);
              }, 2000);
            }, 1500);
          }
        }
      )
      .subscribe();

    // Cleanup function
    return () => {
      supabase.removeChannel(queueChannel);
      supabase.removeChannel(matchChannel);
    };
  };

  const handleCancel = async () => {
    await leaveQueue();
    onCancel();
  };

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
              <span className="text-gray-400">Matching system</span>
              <Badge variant="outline" className="text-cyan-400 border-cyan-400">Real-time</Badge>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Skill matching</span>
              <Badge variant="outline" className="text-purple-400 border-purple-400">Active</Badge>
            </div>
          </div>

          {matchingStatus === 'searching' && (
            <Button 
              onClick={handleCancel}
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
