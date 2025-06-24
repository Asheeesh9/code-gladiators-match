
import React from 'react';
import { Button } from "@/components/ui/button";
import { Swords, LogOut, User } from "lucide-react";
import { useNavigate } from 'react-router-dom';

interface UserProfile {
  username: string;
}

interface AppHeaderProps {
  user: any;
  profile: UserProfile | null;
  onSignOut: () => void;
}

const AppHeader: React.FC<AppHeaderProps> = ({ user, profile, onSignOut }) => {
  const navigate = useNavigate();

  return (
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
                onClick={onSignOut}
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
  );
};

export default AppHeader;
