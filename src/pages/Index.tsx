
import React, { useState, useEffect } from 'react';
import { Swords } from "lucide-react";
import { useNavigate } from 'react-router-dom';
import { supabase } from "@/integrations/supabase/client";
import { User as SupabaseUser, Session } from '@supabase/supabase-js';
import { useToast } from "@/hooks/use-toast";
import MatchmakingQueue from "@/components/MatchmakingQueue";
import CodeArena from "@/components/CodeArena";
import AppHeader from "@/components/AppHeader";
import HeroSection from "@/components/HeroSection";
import StatsSection from "@/components/StatsSection";
import PlayerStatsCard from "@/components/PlayerStatsCard";
import HowItWorksSection from "@/components/HowItWorksSection";

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
  const [currentRoomCode, setCurrentRoomCode] = useState<string | null>(null);
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
      setCurrentRoomCode(null);
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

  const handleMatchFound = (roomCode: string) => {
    setCurrentRoomCode(roomCode);
    setGameState('arena');
  };

  const handleReturnHome = () => {
    setGameState('landing');
    setCurrentRoomCode(null);
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
    return <CodeArena 
      onGameEnd={handleReturnHome} 
      roomCode={currentRoomCode}
      playerData={profile ? {
        name: profile.username,
        wins: profile.wins,
        losses: profile.losses
      } : { name: 'Player', wins: 0, losses: 0 }} 
    />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white">
      {/* Header with Auth */}
      <AppHeader user={user} profile={profile} onSignOut={handleSignOut} />

      {/* Hero Section */}
      <div className="container mx-auto px-4 py-8">
        <HeroSection user={user} onJoinQueue={handleJoinQueue} />

        {/* Stats Section */}
        <StatsSection />

        {/* Player Stats - Only show if user is logged in */}
        {user && profile && (
          <PlayerStatsCard profile={profile} />
        )}

        {/* How It Works Section */}
        <HowItWorksSection />
      </div>
    </div>
  );
};

export default Index;
