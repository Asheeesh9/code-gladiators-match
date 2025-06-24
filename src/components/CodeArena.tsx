
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { 
  Clock, User, Trophy, CheckCircle, XCircle, 
  Play, Code, Target, Zap, Crown, Home 
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

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
  const [language, setLanguage] = useState('python');
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

  // Report match result when game status changes
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

      // Verify user is part of this match
      if (room.player1_id !== userId && room.player2_id !== userId) {
        toast({
          title: "Error",
          description: "You are not part of this match",
          variant: "destructive",
        });
        onGameEnd();
        return;
      }

      // Fetch opponent data
      const opponentId = room.player1_id === userId ? room.player2_id : room.player1_id;
      await fetchOpponentData(opponentId);

      // Fetch problem
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
      // Insert match result
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

      // Update user stats using RPC function
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

      // Update match room status
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

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSubmit = () => {
    setSubmissions(prev => prev + 1);
    
    // Simulate test results based on problem
    const mockResults = problem?.test_cases.slice(0, 3).map((_, index) => ({
      case: index + 1,
      passed: Math.random() > 0.3,
      expected: JSON.stringify(problem.test_cases[index]?.output || ""),
      actual: JSON.stringify(problem.test_cases[index]?.output || "")
    })) || [];
    
    setTestResults(mockResults);
    
    // Check if all tests passed
    if (mockResults.every(result => result.passed)) {
      setTimeout(() => setGameStatus('won'), 1000);
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

  if (gameStatus === 'lost') {
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
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white">
      {/* Header */}
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

      <div className="container mx-auto px-4 py-6">
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Problem Statement */}
          <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center text-white">
                <Code className="h-5 w-5 mr-2 text-cyan-400" />
                {problem.title}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-300 leading-relaxed">
                {problem.description}
              </p>
              
              <div>
                <h4 className="font-semibold text-white mb-2">Examples:</h4>
                <div className="space-y-3">
                  {problem.test_cases.slice(0, 2).map((testCase, idx) => (
                    <div key={idx} className="bg-slate-900/50 p-3 rounded border border-slate-600">
                      <div className="text-sm font-mono space-y-1">
                        <div><span className="text-cyan-400">Input:</span> <span className="text-gray-300">{JSON.stringify(testCase.input)}</span></div>
                        <div><span className="text-green-400">Output:</span> <span className="text-gray-300">{JSON.stringify(testCase.output)}</span></div>
                        <div className="text-gray-400 text-xs mt-2">{testCase.explanation}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {testResults.length > 0 && (
                <div>
                  <h4 className="font-semibold text-white mb-2">Test Results:</h4>
                  <div className="space-y-2">
                    {testResults.map((result, idx) => (
                      <div key={idx} className={`flex items-center justify-between p-2 rounded text-sm ${
                        result.passed ? 'bg-green-500/20 border border-green-500/50' : 'bg-red-500/20 border border-red-500/50'
                      }`}>
                        <div className="flex items-center">
                          {result.passed ? 
                            <CheckCircle className="h-4 w-4 text-green-400 mr-2" /> :
                            <XCircle className="h-4 w-4 text-red-400 mr-2" />
                          }
                          <span className="text-white">Test Case {result.case}</span>
                        </div>
                        <span className={result.passed ? 'text-green-400' : 'text-red-400'}>
                          {result.passed ? 'PASS' : 'FAIL'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Code Editor */}
          <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center text-white">
                  <Zap className="h-5 w-5 mr-2 text-purple-400" />
                  Code Editor
                </CardTitle>
                <div className="flex items-center space-x-2">
                  <Badge variant="secondary" className="bg-purple-500/20 text-purple-400">
                    Python
                  </Badge>
                  <Badge variant="outline" className="text-cyan-400 border-cyan-400">
                    Submissions: {submissions}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="min-h-[300px] font-mono text-sm bg-slate-900/50 border-slate-600 text-white resize-none"
                placeholder="Write your solution here..."
              />
              
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-400">
                  Lines: {code.split('\n').length} | Characters: {code.length}
                </div>
                <Button 
                  onClick={handleSubmit}
                  className="bg-gradient-to-r from-green-500 to-cyan-500 hover:from-green-600 hover:to-cyan-600"
                >
                  <Play className="mr-2 h-4 w-4" />
                  Submit Solution
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CodeArena;
