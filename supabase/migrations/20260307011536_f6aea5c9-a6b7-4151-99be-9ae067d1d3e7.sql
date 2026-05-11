-- Auto-cleanup function for old game rooms (24h+)
CREATE OR REPLACE FUNCTION public.cleanup_old_game_rooms()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM public.game_answers WHERE room_id IN (
    SELECT id FROM public.game_rooms WHERE created_at < now() - interval '24 hours'
  );
  DELETE FROM public.game_round_results WHERE room_id IN (
    SELECT id FROM public.game_rooms WHERE created_at < now() - interval '24 hours'
  );
  DELETE FROM public.game_final_results WHERE room_id IN (
    SELECT id FROM public.game_rooms WHERE created_at < now() - interval '24 hours'
  );
  DELETE FROM public.game_rooms WHERE created_at < now() - interval '24 hours';
END;
$$;

-- Allow DELETE on tables for cleanup
CREATE POLICY "Allow cleanup deletes on answers"
ON public.game_answers FOR DELETE
USING (room_id IN (SELECT id FROM public.game_rooms WHERE created_at < now() - interval '24 hours'));

CREATE POLICY "Allow cleanup deletes on round_results"
ON public.game_round_results FOR DELETE
USING (room_id IN (SELECT id FROM public.game_rooms WHERE created_at < now() - interval '24 hours'));

CREATE POLICY "Allow cleanup deletes on final_results"
ON public.game_final_results FOR DELETE
USING (room_id IN (SELECT id FROM public.game_rooms WHERE created_at < now() - interval '24 hours'));

CREATE POLICY "Allow cleanup deletes on rooms"
ON public.game_rooms FOR DELETE
USING (created_at < now() - interval '24 hours');