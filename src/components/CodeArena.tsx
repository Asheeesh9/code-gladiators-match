
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

interface PlayerData {
  name: string;
  wins: number;
  losses: number;
}

interface CodeArenaProps {
  onGameEnd: () => void;
  playerData: PlayerData;
}

const CodeArena: React.FC<CodeArenaProps> = ({ onGameEnd, playerData }) => {
  const [gameTime, setGameTime] = useState(0);
  const [code, setCode] = useState('# Write your solution here\ndef solve(nums):\n    pass');
  const [language, setLanguage] = useState('python');
  const [submissions, setSubmissions] = useState(0);
  const [gameStatus, setGameStatus] = useState<'active' | 'won' | 'lost'>('active');
  const [testResults, setTestResults] = useState<Array<{case: number, passed: boolean, expected: string, actual: string}>>([]);
  
  const opponentName = "CodeMaster42";
  const problem = {
    title: "Two Sum",
    difficulty: "Easy",
    description: "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.",
    examples: [
      {
        input: "nums = [2,7,11,15], target = 9",
        output: "[0,1]",
        explanation: "Because nums[0] + nums[1] == 9, we return [0, 1]."
      }
    ],
    constraints: [
      "2 ≤ nums.length ≤ 10⁴",
      "-10⁹ ≤ nums[i] ≤ 10⁹",
      "Only one valid answer exists."
    ]
  };

  useEffect(() => {
    if (gameStatus === 'active') {
      const timer = setInterval(() => {
        setGameTime(prev => prev + 1);
        
        // Simulate opponent winning after some time
        if (gameTime > 30 && Math.random() < 0.05) {
          setGameStatus('lost');
        }
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [gameTime, gameStatus]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSubmit = () => {
    setSubmissions(prev => prev + 1);
    
    // Simulate test results
    const mockResults = [
      { case: 1, passed: Math.random() > 0.3, expected: "[0,1]", actual: "[0,1]" },
      { case: 2, passed: Math.random() > 0.4, expected: "[1,2]", actual: "[1,2]" },
      { case: 3, passed: Math.random() > 0.5, expected: "[0,3]", actual: "[2,3]" },
    ];
    
    setTestResults(mockResults);
    
    // Check if all tests passed
    if (mockResults.every(result => result.passed)) {
      setTimeout(() => setGameStatus('won'), 1000);
    }
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
            <p className="text-gray-300">{opponentName} solved it first!</p>
          </CardHeader>
          <CardContent className="space-y-4 text-center">
            <div className="bg-red-500/20 p-4 rounded-lg">
              <p className="text-red-400 font-semibold">Time: {formatTime(gameTime)}</p>
              <p className="text-gray-300">Better luck next time!</p>
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
            </div>
            
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-2">
                <User className="h-4 w-4 text-cyan-400" />
                <span className="text-cyan-400">{playerData.name}</span>
              </div>
              <div className="text-gray-400">VS</div>
              <div className="flex items-center space-x-2">
                <User className="h-4 w-4 text-purple-400" />
                <span className="text-purple-400">{opponentName}</span>
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
                <h4 className="font-semibold text-white mb-2">Example:</h4>
                <div className="bg-slate-900/50 p-3 rounded border border-slate-600">
                  <div className="text-sm font-mono space-y-1">
                    <div><span className="text-cyan-400">Input:</span> <span className="text-gray-300">{problem.examples[0].input}</span></div>
                    <div><span className="text-green-400">Output:</span> <span className="text-gray-300">{problem.examples[0].output}</span></div>
                    <div className="text-gray-400 text-xs mt-2">{problem.examples[0].explanation}</div>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-white mb-2">Constraints:</h4>
                <ul className="text-sm text-gray-300 space-y-1">
                  {problem.constraints.map((constraint, idx) => (
                    <li key={idx} className="font-mono">• {constraint}</li>
                  ))}
                </ul>
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
