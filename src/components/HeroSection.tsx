
import React from 'react';
import { Button } from "@/components/ui/button";
import { Swords, Play } from "lucide-react";

interface HeroSectionProps {
  user: any;
  onJoinQueue: () => void;
}

const HeroSection: React.FC<HeroSectionProps> = ({ user, onJoinQueue }) => {
  return (
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
        onClick={onJoinQueue}
        size="lg" 
        className="bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 text-white px-8 py-6 text-lg font-semibold rounded-lg transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-cyan-500/25"
      >
        <Play className="mr-2 h-5 w-5" />
        {user ? 'Enter Arena' : 'Sign In to Play'}
      </Button>
    </div>
  );
};

export default HeroSection;
