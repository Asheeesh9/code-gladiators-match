
-- Create RPC function to update user stats after a match
CREATE OR REPLACE FUNCTION public.update_user_stats(winner_id UUID, loser_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Update winner's stats
  UPDATE public.profiles 
  SET 
    wins = wins + 1,
    total_matches = total_matches + 1,
    rating = rating + 25,
    updated_at = NOW()
  WHERE id = winner_id;
  
  -- Update loser's stats
  UPDATE public.profiles 
  SET 
    losses = losses + 1,
    total_matches = total_matches + 1,
    rating = GREATEST(rating - 25, 0),
    updated_at = NOW()
  WHERE id = loser_id;
END;
$$;
