import React, { useState, useEffect } from 'react';
import { Code, XCircle, Home } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import ArenaHeader from "./ArenaHeader";
import ProblemStatement from "./ProblemStatement";
import CodeEditor from "./CodeEditor";
import GameEndScreen from "./GameEndScreen";

interface PlayerData {
  name: string;
  wins: number;
  losses: number;
}

interface CodeArenaProps {
  onGameEnd: () => void;
  playerData: PlayerData;
  roomCode: string | null;
}

interface Problem {
  id: string;
  title: string;
  description: string;
  difficulty: string;
  test_cases: Array<{
    input: any;
    output: any;
    explanation: string;
  }>;
}

interface MatchRoom {
  id: string;
  room_code: string;
  player1_id: string;
  player2_id: string;
  problem_id: string;
  status: string;
}

interface OpponentData {
  id: string;
  username: string;
  rating: number;
}

const CodeArena: React.FC<CodeArenaProps> = ({ onGameEnd, playerData, roomCode }) => {
  const [gameTime, setGameTime] = useState(0);
  const [code, setCode] = useState('# Write your solution here\ndef solve(nums):\n    pass');
  const [submissions, setSubmissions] = useState(0);
  const [gameStatus, setGameStatus] = useState<'active' | 'won' | 'lost'>('active');
  const [testResults, setTestResults] = useState<Array<{case: number, passed: boolean, expected: string, actual: string}>>([]);
  const [matchReported, setMatchReported] = useState(false);
  const [problem, setProblem] = useState<Problem | null>(null);
  const [loadingProblem, setLoadingProblem] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [opponentData, setOpponentData] = useState<OpponentData | null>(null);
  const [matchRoom, setMatchRoom] = useState<MatchRoom | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    initializeMatch();
  }, [roomCode]);

  useEffect(() => {
    if (gameStatus === 'active' && matchRoom) {
      const timer = setInterval(() => {
        setGameTime(prev => prev + 1);
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [gameTime, gameStatus, matchRoom]);

  useEffect(() => {
    const handleMatchEnd = async () => {
      if (!currentUserId || !matchRoom || matchReported) return;

      if (gameStatus === 'won') {
        await reportMatchResult(currentUserId, getOpponentId());
      } else if (gameStatus === 'lost') {
        await reportMatchResult(getOpponentId(), currentUserId);
      }
    };

    if (gameStatus !== 'active') {
      handleMatchEnd();
    }
  }, [gameStatus, currentUserId, matchRoom, matchReported]);

  const initializeMatch = async () => {
    if (!roomCode) {
      toast({
        title: "Error",
        description: "No room code provided",
        variant: "destructive",
      });
      onGameEnd();
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Error",
          description: "You must be logged in to play",
          variant: "destructive",
        });
        onGameEnd();
        return;
      }

      setCurrentUserId(user.id);
      await fetchMatchRoom(roomCode, user.id);
    } catch (error) {
      console.error('Error initializing match:', error);
      toast({
        title: "Error",
        description: "Failed to initialize match",
        variant: "destructive",
      });
      onGameEnd();
    }
  };

  const fetchMatchRoom = async (roomCode: string, userId: string) => {
    try {
      const { data: room, error: roomError } = await supabase
        .from('match_rooms')
        .select('*')
        .eq('room_code', roomCode)
        .single();

      if (roomError) throw roomError;

      setMatchRoom(room);

      if (room.player1_id !== userId && room.player2_id !== userId) {
        toast({
          title: "Error",
          description: "You are not part of this match",
          variant: "destructive",
        });
        onGameEnd();
        return;
      }

      const opponentId = room.player1_id === userId ? room.player2_id : room.player1_id;
      await fetchOpponentData(opponentId);
      await fetchProblem(room.problem_id);
    } catch (error) {
      console.error('Error fetching match room:', error);
      toast({
        title: "Error",
        description: "Failed to load match data",
        variant: "destructive",
      });
      onGameEnd();
    }
  };

  const fetchOpponentData = async (opponentId: string) => {
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('id, username, rating')
        .eq('id', opponentId)
        .single();

      if (error) throw error;

      setOpponentData({
        id: profile.id,
        username: profile.username,
        rating: profile.rating
      });
    } catch (error) {
      console.error('Error fetching opponent data:', error);
      setOpponentData({
        id: 'unknown',
        username: 'Unknown Player',
        rating: 1200
      });
    }
  };

  const fetchProblem = async (problemId: string) => {
    try {
      setLoadingProblem(true);
      
      const { data: problemData, error } = await supabase
        .from('problems')
        .select('*')
        .eq('id', problemId)
        .single();

      if (error) throw error;

      setProblem({
        id: problemData.id,
        title: problemData.title,
        description: problemData.description,
        difficulty: problemData.difficulty,
        test_cases: problemData.test_cases as Array<{
          input: any;
          output: any;
          explanation: string;
        }>
      });

      console.log('Loaded problem:', problemData.title);
    } catch (error) {
      console.error('Error fetching problem:', error);
      toast({
        title: "Error",
        description: "Failed to load problem",
        variant: "destructive",
      });
    } finally {
      setLoadingProblem(false);
    }
  };

  const getOpponentId = (): string => {
    if (!matchRoom || !currentUserId) return '';
    return matchRoom.player1_id === currentUserId ? matchRoom.player2_id : matchRoom.player1_id;
  };

  const reportMatchResult = async (winnerId: string, loserId: string) => {
    if (matchReported || !problem || !matchRoom) return;
    
    try {
      const { error: matchError } = await supabase
        .from('match_results')
        .insert({
          room_id: matchRoom.room_code,
          player1_id: matchRoom.player1_id,
          player2_id: matchRoom.player2_id,
          winner_id: winnerId,
          problem_id: problem.id
        });

      if (matchError) {
        console.error('Error saving match result:', matchError);
        toast({
          title: "Error",
          description: "Failed to save match result",
          variant: "destructive",
        });
        return;
      }

      const { error: statsError } = await supabase.rpc('update_user_stats', {
        winner_id: winnerId,
        loser_id: loserId
      });

      if (statsError) {
        console.error('Error updating user stats:', statsError);
        toast({
          title: "Error", 
          description: "Failed to update player stats",
          variant: "destructive",
        });
        return;
      }

      const { error: updateError } = await supabase
        .from('match_rooms')
        .update({ status: 'completed' })
        .eq('id', matchRoom.id);

      if (updateError) {
        console.error('Error updating match room:', updateError);
      }

      setMatchReported(true);
      console.log('Match result and stats updated successfully');
      
    } catch (error) {
      console.error('Unexpected error reporting match result:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    }
  };

  const handleSubmit = (results: Array<{case: number, passed: boolean, expected: string, actual: string}>) => {
    setSubmissions(prev => prev + 1);
    setTestResults(results);
    
    // Check if all test cases passed
    if (results.every(result => result.passed)) {
      setTimeout(() => setGameStatus('won'), 1000);
      toast({
        title: "Success!",
        description: "All test cases passed! You won the match!",
        variant: "default",
      });
    } else {
      const passedCount = results.filter(r => r.passed).length;
      toast({
        title: "Test Results",
        description: `${passedCount}/${results.length} test cases passed`,
        variant: passedCount > 0 ? "default" : "destructive",
      });
    }
  };

  if (loadingProblem) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white flex items-center justify-center">
        <div className="text-center">
          <Code className="h-12 w-12 text-cyan-400 animate-pulse mx-auto mb-4" />
          <p className="text-gray-300">Loading problem...</p>
        </div>
      </div>
    );
  }

  if (!problem) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-red-900 to-slate-900 text-white flex items-center justify-center">
        <Card className="w-full max-w-md bg-slate-800/50 border-red-500/50 backdrop-blur-sm">
          <CardHeader className="text-center">
            <XCircle className="h-16 w-16 text-red-400 mx-auto mb-4" />
            <CardTitle className="text-3xl text-red-400">Error</CardTitle>
            <p className="text-gray-300">Failed to load problem</p>
          </CardHeader>
          <CardContent className="space-y-4 text-center">
            <Button onClick={onGameEnd} className="w-full bg-gradient-to-r from-cyan-500 to-purple-500">
              <Home className="mr-2 h-4 w-4" />
              Return to Arena
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (gameStatus === 'won' || gameStatus === 'lost') {
    return (
      <GameEndScreen
        gameStatus={gameStatus}
        gameTime={gameTime}
        submissions={submissions}
        problem={problem}
        opponentData={opponentData}
        onGameEnd={onGameEnd}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white">
      <ArenaHeader
        gameTime={gameTime}
        problem={problem}
        roomCode={roomCode}
        playerData={playerData}
        opponentData={opponentData}
      />

      <div className="container mx-auto px-4 py-6">
        <div className="grid lg:grid-cols-2 gap-6">
          <ProblemStatement problem={problem} testResults={testResults} />
          <CodeEditor
            code={code}
            onCodeChange={setCode}
            onSubmit={handleSubmit}
            submissions={submissions}
            problem={problem!}
          />
        </div>
      </div>
    </div>
  );
};

export default CodeArena;
