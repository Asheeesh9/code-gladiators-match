
-- Add a room_type column to match_rooms to distinguish between matchmaking and private rooms
ALTER TABLE public.match_rooms 
ADD COLUMN room_type TEXT NOT NULL DEFAULT 'matchmaking' CHECK (room_type IN ('matchmaking', 'private'));

-- Create a table to track private room invitations
CREATE TABLE public.private_rooms (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  room_code TEXT NOT NULL UNIQUE,
  creator_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  problem_id UUID NOT NULL REFERENCES public.problems(id),
  status TEXT NOT NULL DEFAULT 'waiting' CHECK (status IN ('waiting', 'active', 'completed', 'abandoned')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for private rooms
ALTER TABLE public.private_rooms ENABLE ROW LEVEL SECURITY;

-- Create policies for private rooms
CREATE POLICY "Anyone can view private rooms by room code" 
  ON public.private_rooms 
  FOR SELECT 
  USING (true);

CREATE POLICY "Users can create their own private rooms" 
  ON public.private_rooms 
  FOR INSERT 
  WITH CHECK (auth.uid() = creator_id);

CREATE POLICY "Creator can update their private rooms" 
  ON public.private_rooms 
  FOR UPDATE 
  USING (auth.uid() = creator_id);

-- Enable realtime for private rooms
ALTER TABLE public.private_rooms REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.private_rooms;

-- Function to create a private room
CREATE OR REPLACE FUNCTION public.create_private_room(user_id_param UUID)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  selected_problem_id UUID;
  new_room_code TEXT;
BEGIN
  -- Select a random problem
  SELECT id INTO selected_problem_id 
  FROM public.problems 
  ORDER BY RANDOM() 
  LIMIT 1;
  
  -- Generate unique room code (shorter for private rooms)
  new_room_code := 'priv_' || substr(gen_random_uuid()::text, 1, 6);
  
  -- Create private room
  INSERT INTO public.private_rooms (room_code, creator_id, problem_id)
  VALUES (new_room_code, user_id_param, selected_problem_id);
  
  RETURN new_room_code;
END;
$$;

-- Function to join a private room
CREATE OR REPLACE FUNCTION public.join_private_room(room_code_param TEXT, joiner_id UUID)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  private_room_record RECORD;
  new_match_room_id UUID;
BEGIN
  -- Get the private room
  SELECT * INTO private_room_record 
  FROM public.private_rooms 
  WHERE room_code = room_code_param AND status = 'waiting';
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Room not found or already started';
  END IF;
  
  -- Don't allow creator to join their own room
  IF private_room_record.creator_id = joiner_id THEN
    RAISE EXCEPTION 'Cannot join your own room';
  END IF;
  
  -- Create the actual match room
  INSERT INTO public.match_rooms (room_code, player1_id, player2_id, problem_id, room_type)
  VALUES (private_room_record.room_code, private_room_record.creator_id, joiner_id, private_room_record.problem_id, 'private')
  RETURNING id INTO new_match_room_id;
  
  -- Update private room status
  UPDATE public.private_rooms 
  SET status = 'active', updated_at = now()
  WHERE id = private_room_record.id;
  
  RETURN new_match_room_id;
END;
$$;
