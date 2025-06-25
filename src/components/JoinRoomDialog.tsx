
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { UserPlus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface JoinRoomDialogProps {
  user: any;
  onRoomJoined: (roomCode: string) => void;
}

const JoinRoomDialog: React.FC<JoinRoomDialogProps> = ({ user, onRoomJoined }) => {
  const [roomCode, setRoomCode] = useState('');
  const [isJoining, setIsJoining] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();

  const joinRoom = async () => {
    if (!user || !roomCode.trim()) return;

    setIsJoining(true);
    try {
      const { error } = await supabase.rpc('join_private_room', {
        room_code_param: roomCode.trim(),
        joiner_id: user.id
      });

      if (error) throw error;

      toast({
        title: "Room Joined!",
        description: "Starting match with your friend...",
      });
      
      onRoomJoined(roomCode.trim());
      setIsOpen(false);
      setRoomCode('');
    } catch (error: any) {
      console.error('Error joining room:', error);
      let errorMessage = "Failed to join room. Please check the room code.";
      
      if (error.message.includes('Room not found')) {
        errorMessage = "Room not found or already started.";
      } else if (error.message.includes('Cannot join your own room')) {
        errorMessage = "You cannot join your own room.";
      }
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsJoining(false);
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    setRoomCode('');
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          size="lg" 
          className="border-green-500/50 text-green-400 hover:bg-green-500/20"
          onClick={() => setIsOpen(true)}
        >
          <UserPlus className="mr-2 h-5 w-5" />
          Join Room
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-slate-800 border-slate-700 text-white">
        <DialogHeader>
          <DialogTitle className="text-2xl text-center text-cyan-400">
            Join Friend's Room
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          <div className="space-y-4">
            <p className="text-gray-300 text-center">
              Enter the room code your friend shared with you:
            </p>
            
            <Input
              value={roomCode}
              onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
              placeholder="Enter room code..."
              className="bg-slate-700 border-slate-600 text-white text-center text-lg font-mono tracking-wider"
              maxLength={11}
            />
          </div>
          
          <div className="flex space-x-3">
            <Button 
              onClick={joinRoom}
              disabled={isJoining || !roomCode.trim()}
              className="flex-1 bg-gradient-to-r from-green-500 to-cyan-500 hover:from-green-600 hover:to-cyan-600"
            >
              {isJoining ? 'Joining...' : 'Join Room'}
            </Button>
            <Button 
              onClick={handleClose}
              variant="outline"
              className="flex-1 border-slate-600 text-gray-300 hover:bg-slate-700"
            >
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default JoinRoomDialog;
