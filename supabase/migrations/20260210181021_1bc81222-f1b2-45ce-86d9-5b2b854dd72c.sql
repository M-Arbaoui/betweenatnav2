
-- Game rooms for remote play
CREATE TABLE public.game_rooms (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  room_code TEXT NOT NULL UNIQUE,
  player1_name TEXT NOT NULL DEFAULT '',
  player2_name TEXT,
  phase TEXT NOT NULL DEFAULT 'waiting',
  current_round INTEGER NOT NULL DEFAULT 1,
  current_question TEXT,
  question_mood TEXT DEFAULT '🤔',
  current_surprise TEXT,
  previous_questions JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Answers for each round
CREATE TABLE public.game_answers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  room_id UUID NOT NULL REFERENCES public.game_rooms(id) ON DELETE CASCADE,
  round_number INTEGER NOT NULL,
  player_number INTEGER NOT NULL CHECK (player_number IN (1, 2)),
  answer TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(room_id, round_number, player_number)
);

-- Round results
CREATE TABLE public.game_round_results (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  room_id UUID NOT NULL REFERENCES public.game_rooms(id) ON DELETE CASCADE,
  round_number INTEGER NOT NULL,
  player1_scores JSONB NOT NULL,
  player2_scores JSONB NOT NULL,
  couple_verdict TEXT NOT NULL,
  compatibility_score INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(room_id, round_number)
);

-- Final results
CREATE TABLE public.game_final_results (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  room_id UUID NOT NULL REFERENCES public.game_rooms(id) ON DELETE CASCADE,
  final_score INTEGER NOT NULL,
  title TEXT NOT NULL,
  summary TEXT NOT NULL,
  awards JSONB DEFAULT '[]'::jsonb,
  advice TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(room_id)
);

-- Enable RLS (public game, no auth needed - allow all operations)
ALTER TABLE public.game_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.game_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.game_round_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.game_final_results ENABLE ROW LEVEL SECURITY;

-- Public policies (no auth required for casual game)
CREATE POLICY "Anyone can create rooms" ON public.game_rooms FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can view rooms" ON public.game_rooms FOR SELECT USING (true);
CREATE POLICY "Anyone can update rooms" ON public.game_rooms FOR UPDATE USING (true);

CREATE POLICY "Anyone can insert answers" ON public.game_answers FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can view answers" ON public.game_answers FOR SELECT USING (true);

CREATE POLICY "Anyone can insert results" ON public.game_round_results FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can view results" ON public.game_round_results FOR SELECT USING (true);

CREATE POLICY "Anyone can insert final results" ON public.game_final_results FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can view final results" ON public.game_final_results FOR SELECT USING (true);

-- Enable realtime for game_rooms
ALTER PUBLICATION supabase_realtime ADD TABLE public.game_rooms;
ALTER PUBLICATION supabase_realtime ADD TABLE public.game_answers;
ALTER PUBLICATION supabase_realtime ADD TABLE public.game_round_results;
ALTER PUBLICATION supabase_realtime ADD TABLE public.game_final_results;

-- Auto-update timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_game_rooms_updated_at
  BEFORE UPDATE ON public.game_rooms
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Auto-delete old rooms (older than 24h)
CREATE INDEX idx_game_rooms_created_at ON public.game_rooms(created_at);
CREATE INDEX idx_game_rooms_room_code ON public.game_rooms(room_code);
