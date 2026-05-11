import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";

interface Reaction {
  emoji: string;
  id: string;
}

export const useEmojiReactions = (roomId: string | undefined, playerNumber: 1 | 2) => {
  const [incomingReaction, setIncomingReaction] = useState<Reaction | null>(null);
  const lastSentRef = useRef(0);

  useEffect(() => {
    if (!roomId) return;

    const channel = supabase
      .channel(`reactions-${roomId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "game_reactions",
          filter: `room_id=eq.${roomId}`,
        },
        (payload) => {
          const row = payload.new as any;
          // Only show reactions from the OTHER player
          if (row.player_number !== playerNumber) {
            setIncomingReaction({ emoji: row.emoji, id: row.id });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [roomId, playerNumber]);

  const sendReaction = useCallback(
    async (emoji: string) => {
      if (!roomId) return;
      // Rate limit: 1 per 500ms
      const now = Date.now();
      if (now - lastSentRef.current < 500) return;
      lastSentRef.current = now;

      await supabase.from("game_reactions").insert({
        room_id: roomId,
        player_number: playerNumber,
        emoji,
      });
    },
    [roomId, playerNumber]
  );

  return { incomingReaction, sendReaction };
};
