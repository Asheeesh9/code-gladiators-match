
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Copy, Check, Users } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface CreateRoomDialogProps {
  user: any;
  onRoomCreated: (roomCode: string) => void;
}

const CreateRoomDialog: React.FC<CreateRoomDialogProps> = ({ user, onRoomCreated }) => {
  const [roomCode, setRoomCode] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();

  const createRoom = async () => {
    if (!user) return;

    setIsCreating(true);
    try {
      const { data, error } = await supabase.rpc('create_private_room', {
        user_id_param: user.id
      });

      if (error) throw error;

      setRoomCode(data);
      toast({
        title: "Room Created!",
        description: "Share the room code with your friend to start playing together.",
      });
    } catch (error: any) {
      console.error('Error creating room:', error);
      toast({
        title: "Error",
        description: "Failed to create room. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  };

  const copyRoomCode = async () => {
    if (!roomCode) return;

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

  const handleWaitForFriend = () => {
    if (roomCode) {
      onRoomCreated(roomCode);
      setIsOpen(false);
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    setRoomCode(null);
    setCopied(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          size="lg" 
          className="border-purple-500/50 text-purple-400 hover:bg-purple-500/20"
          onClick={() => setIsOpen(true)}
        >
          <Users className="mr-2 h-5 w-5" />
          Challenge a Friend
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-slate-800 border-slate-700 text-white">
        <DialogHeader>
          <DialogTitle className="text-2xl text-center text-cyan-400">
            Challenge a Friend
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          {!roomCode ? (
            <div className="text-center space-y-4">
              <p className="text-gray-300">
                Create a private room and invite your friend to compete!
              </p>
              <Button 
                onClick={createRoom}
                disabled={isCreating}
                className="bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600"
              >
                {isCreating ? 'Creating Room...' : 'Create Room'}
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="text-center">
                <p className="text-gray-300 mb-4">
                  Share this room code with your friend:
                </p>
                <div className="bg-slate-700 rounded-lg p-4 flex items-center justify-between">
                  <code className="text-2xl font-mono text-cyan-400 tracking-wider">
                    {roomCode}
                  </code>
                  <Button
                    onClick={copyRoomCode}
                    variant="ghost"
                    size="sm"
                    className="ml-2"
                  >
                    {copied ? <Check className="h-4 w-4 text-green-400" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
              
              <div className="flex space-x-3">
                <Button 
                  onClick={handleWaitForFriend}
                  className="flex-1 bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600"
                >
                  Wait for Friend
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
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CreateRoomDialog;
