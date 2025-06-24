
-- Create a problems table for coding challenges
CREATE TABLE public.problems (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  difficulty TEXT NOT NULL CHECK (difficulty IN ('Easy', 'Medium', 'Hard')),
  test_cases JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add some sample problems
INSERT INTO public.problems (title, description, difficulty, test_cases) VALUES
(
  'Two Sum',
  'Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target. You may assume that each input would have exactly one solution, and you may not use the same element twice.',
  'Easy',
  '[
    {
      "input": {"nums": [2,7,11,15], "target": 9},
      "output": [0,1],
      "explanation": "Because nums[0] + nums[1] == 9, we return [0, 1]."
    },
    {
      "input": {"nums": [3,2,4], "target": 6},
      "output": [1,2],
      "explanation": "Because nums[1] + nums[2] == 6, we return [1, 2]."
    },
    {
      "input": {"nums": [3,3], "target": 6},
      "output": [0,1],
      "explanation": "Because nums[0] + nums[1] == 6, we return [0, 1]."
    }
  ]'::jsonb
),
(
  'Reverse Integer',
  'Given a signed 32-bit integer x, return x with its digits reversed. If reversing x causes the value to go outside the signed 32-bit integer range [-2^31, 2^31 - 1], then return 0.',
  'Medium',
  '[
    {
      "input": {"x": 123},
      "output": 321,
      "explanation": "The reverse of 123 is 321."
    },
    {
      "input": {"x": -123},
      "output": -321,
      "explanation": "The reverse of -123 is -321."
    },
    {
      "input": {"x": 120},
      "output": 21,
      "explanation": "The reverse of 120 is 021, which is just 21."
    }
  ]'::jsonb
),
(
  'Palindrome Number',
  'Given an integer x, return true if x is palindrome integer. An integer is a palindrome when it reads the same backward as forward.',
  'Easy',
  '[
    {
      "input": {"x": 121},
      "output": true,
      "explanation": "121 reads as 121 from left to right and from right to left."
    },
    {
      "input": {"x": -121},
      "output": false,
      "explanation": "From left to right, it reads -121. From right to left, it becomes 121-. Therefore it is not a palindrome."
    },
    {
      "input": {"x": 10},
      "output": false,
      "explanation": "Reads 01 from right to left. Therefore it is not a palindrome."
    }
  ]'::jsonb
);

-- Enable RLS for problems table (make it readable by everyone since these are public coding challenges)
ALTER TABLE public.problems ENABLE ROW LEVEL SECURITY;

-- Create policy to allow everyone to read problems
CREATE POLICY "Anyone can view problems" 
  ON public.problems 
  FOR SELECT 
  USING (true);
