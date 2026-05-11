
CREATE TABLE public.game_reactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id uuid REFERENCES public.game_rooms(id) ON DELETE CASCADE NOT NULL,
  player_number integer NOT NULL,
  emoji text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.game_reactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert reactions" ON public.game_reactions FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can read reactions" ON public.game_reactions FOR SELECT USING (true);

ALTER PUBLICATION supabase_realtime ADD TABLE public.game_reactions;
