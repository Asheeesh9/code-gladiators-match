
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Zap, Trophy } from "lucide-react";

const StatsSection: React.FC = () => {
  return (
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
  );
};

export default StatsSection;
