
ALTER TABLE public.game_rooms ADD COLUMN IF NOT EXISTS current_question_b text;

CREATE TABLE IF NOT EXISTS public.player_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  player_name text NOT NULL,
  honesty text DEFAULT 'unknown',
  humor text DEFAULT 'unknown',
  loyalty text DEFAULT 'unknown',
  jealousy text DEFAULT 'unknown',
  drama text DEFAULT 'unknown',
  boldness text DEFAULT 'unknown',
  traits jsonb DEFAULT '{}'::jsonb,
  games_played integer DEFAULT 0,
  last_played_at timestamp with time zone DEFAULT now(),
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  updated_at timestamp with time zone DEFAULT now() NOT NULL
);

ALTER TABLE public.player_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view profiles" ON public.player_profiles FOR SELECT USING (true);
CREATE POLICY "Anyone can insert profiles" ON public.player_profiles FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update profiles" ON public.player_profiles FOR UPDATE USING (true);
