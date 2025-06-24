
import React from 'react';

const HowItWorksSection: React.FC = () => {
  return (
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
  );
};

export default HowItWorksSection;
