
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Copy, Check, Users, ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface PrivateRoomWaitingProps {
  roomCode: string;
  onMatchFound: (roomCode: string) => void;
  onCancel: () => void;
}

const PrivateRoomWaiting: React.FC<PrivateRoomWaitingProps> = ({ 
  roomCode, 
  onMatchFound, 
  onCancel 
}) => {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Listen for when someone joins the private room
    const channel = supabase
      .channel('private-room-updates')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'private_rooms',
          filter: `room_code=eq.${roomCode}`
        },
        (payload) => {
          console.log('Private room updated:', payload);
          if (payload.new.status === 'active') {
            onMatchFound(roomCode);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [roomCode, onMatchFound]);

  const copyRoomCode = async () => {
    try {
      await navigator.clipboard.writeText(roomCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast({
        title: "Copied!",
        description: "Room code copied to clipboard.",
      });
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white flex items-center justify-center">
      <Card className="w-full max-w-md bg-slate-800/50 border-slate-700/50 backdrop-blur-sm">
        <CardHeader className="text-center">
          <Users className="h-16 w-16 text-purple-400 mx-auto mb-4 animate-pulse" />
          <CardTitle className="text-3xl text-purple-400">Waiting for Friend</CardTitle>
          <p className="text-gray-300">Share this room code with your friend</p>
        </CardHeader>
        <CardContent className="space-y-6 text-center">
          <div className="bg-slate-700/50 rounded-lg p-6">
            <p className="text-sm text-gray-400 mb-2">Room Code</p>
            <div className="flex items-center justify-center space-x-2">
              <code className="text-3xl font-mono text-cyan-400 tracking-wider">
                {roomCode}
              </code>
              <Button
                onClick={copyRoomCode}
                variant="ghost"
                size="sm"
                className="ml-2"
              >
                {copied ? <Check className="h-5 w-5 text-green-400" /> : <Copy className="h-5 w-5" />}
              </Button>
            </div>
          </div>

          <div className="space-y-3">
            <p className="text-gray-400 text-sm">
              Once your friend joins, the match will start automatically!
            </p>
            
            <Button 
              onClick={onCancel}
              variant="outline"
              className="w-full border-slate-600 text-gray-300 hover:bg-slate-700"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Menu
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PrivateRoomWaiting;
