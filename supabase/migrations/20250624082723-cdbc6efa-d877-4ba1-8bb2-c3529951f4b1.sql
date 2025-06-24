
-- Create a matchmaking queue table
CREATE TABLE public.matchmaking_queue (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  user_profile JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create a match_rooms table to store active matches
CREATE TABLE public.match_rooms (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  room_code TEXT NOT NULL UNIQUE,
  player1_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  player2_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  problem_id UUID NOT NULL REFERENCES public.problems(id),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'abandoned')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for matchmaking queue
ALTER TABLE public.matchmaking_queue ENABLE ROW LEVEL SECURITY;

-- Create policies for matchmaking queue
CREATE POLICY "Users can view all queue entries" 
  ON public.matchmaking_queue 
  FOR SELECT 
  USING (true);

CREATE POLICY "Users can insert their own queue entry" 
  ON public.matchmaking_queue 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own queue entry" 
  ON public.matchmaking_queue 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Enable RLS for match rooms
ALTER TABLE public.match_rooms ENABLE ROW LEVEL SECURITY;

-- Create policies for match rooms
CREATE POLICY "Players can view their own matches" 
  ON public.match_rooms 
  FOR SELECT 
  USING (auth.uid() = player1_id OR auth.uid() = player2_id);

CREATE POLICY "System can insert match rooms" 
  ON public.match_rooms 
  FOR INSERT 
  WITH CHECK (true);

CREATE POLICY "Players can update their own matches" 
  ON public.match_rooms 
  FOR UPDATE 
  USING (auth.uid() = player1_id OR auth.uid() = player2_id);

-- Enable realtime for matchmaking queue and match rooms
ALTER TABLE public.matchmaking_queue REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.matchmaking_queue;

ALTER TABLE public.match_rooms REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.match_rooms;

-- Create a function to handle matchmaking
CREATE OR REPLACE FUNCTION public.create_match_from_queue()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  player1_record RECORD;
  player2_record RECORD;
  selected_problem_id UUID;
  new_room_code TEXT;
BEGIN
  -- Get the two oldest players in queue
  SELECT * INTO player1_record 
  FROM public.matchmaking_queue 
  ORDER BY created_at ASC 
  LIMIT 1;
  
  IF NOT FOUND THEN
    RETURN;
  END IF;
  
  SELECT * INTO player2_record 
  FROM public.matchmaking_queue 
  WHERE user_id != player1_record.user_id
  ORDER BY created_at ASC 
  LIMIT 1;
  
  IF NOT FOUND THEN
    RETURN;
  END IF;
  
  -- Select a random problem
  SELECT id INTO selected_problem_id 
  FROM public.problems 
  ORDER BY RANDOM() 
  LIMIT 1;
  
  -- Generate unique room code
  new_room_code := 'room_' || substr(gen_random_uuid()::text, 1, 8);
  
  -- Create match room
  INSERT INTO public.match_rooms (room_code, player1_id, player2_id, problem_id)
  VALUES (new_room_code, player1_record.user_id, player2_record.user_id, selected_problem_id);
  
  -- Remove players from queue
  DELETE FROM public.matchmaking_queue 
  WHERE user_id IN (player1_record.user_id, player2_record.user_id);
END;
$$;
