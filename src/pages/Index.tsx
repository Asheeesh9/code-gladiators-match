import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Code, Zap, Trophy, Users, Swords, Play, Crown, LogOut, User } from "lucide-react";
import { useNavigate } from 'react-router-dom';
import { supabase } from "@/integrations/supabase/client";
import { User as SupabaseUser, Session } from '@supabase/supabase-js';
import { useToast } from "@/hooks/use-toast";
import MatchmakingQueue from "@/components/MatchmakingQueue";
import CodeArena from "@/components/CodeArena";

interface UserProfile {
  id: string;
  username: string;
  display_name: string | null;
  wins: number;
  losses: number;
  total_matches: number;
  rating: number;
}

const Index = () => {
  const [gameState, setGameState] = useState<'landing' | 'queue' | 'arena'>('landing');
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          setTimeout(() => {
            fetchUserProfile(session.user.id);
          }, 0);
        } else {
          setProfile(null);
          setLoading(false);
        }
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        fetchUserProfile(session.user.id);
      } else {
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;
      setProfile(data);
    } catch (error: any) {
      console.error('Error fetching profile:', error);
      toast({
        title: "Error",
        description: "Failed to load user profile",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      setUser(null);
      setSession(null);
      setProfile(null);
      setGameState('landing');
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleJoinQueue = () => {
    if (!user) {
      navigate('/auth');
      return;
    }
    setGameState('queue');
  };

  const handleMatchFound = () => {
    setGameState('arena');
  };

  const handleReturnHome = () => {
    setGameState('landing');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white flex items-center justify-center">
        <div className="text-center">
          <Swords className="h-12 w-12 text-cyan-400 animate-pulse mx-auto mb-4" />
          <p className="text-gray-300">Loading Algo Arena...</p>
        </div>
      </div>
    );
  }

  if (gameState === 'queue') {
    return <MatchmakingQueue onMatchFound={handleMatchFound} onCancel={handleReturnHome} />;
  }

  if (gameState === 'arena') {
    return <CodeArena onGameEnd={handleReturnHome} playerData={profile ? {
      name: profile.username,
      wins: profile.wins,
      losses: profile.losses
    } : { name: 'Player', wins: 0, losses: 0 }} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white">
      {/* Header with Auth */}
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <Swords className="h-8 w-8 text-cyan-400 mr-2" />
            <h1 className="text-2xl font-bold text-white">Algo Arena</h1>
          </div>
          <div className="flex items-center space-x-4">
            {user ? (
              <>
                <div className="flex items-center space-x-2 text-sm">
                  <User className="h-4 w-4 text-cyan-400" />
                  <span className="text-white">{profile?.username || 'Loading...'}</span>
                </div>
                <Button
                  onClick={handleSignOut}
                  variant="outline"
                  size="sm"
                  className="border-red-500/50 text-red-400 hover:bg-red-500/20"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign Out
                </Button>
              </>
            ) : (
              <Button
                onClick={() => navigate('/auth')}
                variant="outline"
                size="sm"
                className="border-cyan-500/50 text-cyan-400 hover:bg-cyan-500/20"
              >
                Sign In
              </Button>
            )}
          </div>
        </div>
      </div>

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
            {user ? 'Enter Arena' : 'Sign In to Play'}
          </Button>
        </div>

        {/* ... keep existing code (stats section) */}
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

        {/* Player Stats - Only show if user is logged in */}
        {user && profile && (
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
        )}

        {/* ... keep existing code (how it works section) */}
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
