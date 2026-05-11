import { useState, useEffect, useRef, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export const useTypingIndicator = (
  roomId: string | undefined,
  playerNumber: 1 | 2,
  playerName: string,
) => {
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);
  const typingRef  = useRef(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!roomId) return;
    const key = `player${playerNumber}`;
    const ch = supabase.channel(`typing-${roomId}`, {
      config: { presence: { key } },
    });
    channelRef.current = ch;
    ch.subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [roomId, playerNumber]);

  const setTyping = useCallback((isTyping: boolean) => {
    if (!channelRef.current || typingRef.current === isTyping) return;
    typingRef.current = isTyping;
    channelRef.current.track({ playerName, playerNumber, isTyping, ts: Date.now() });
  }, [playerName, playerNumber]);

  const onKeyStroke = useCallback(() => {
    setTyping(true);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => setTyping(false), 2500);
  }, [setTyping]);

  const stopTyping = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setTyping(false);
  }, [setTyping]);

  return { onKeyStroke, stopTyping };
};

export const usePartnerTyping = (
  roomId: string | undefined,
  myPlayerNumber: 1 | 2,
): boolean => {
  const partnerNum = myPlayerNumber === 1 ? 2 : 1;
  const [isPartnerTyping, setIsPartnerTyping] = useState(false);

  useEffect(() => {
    if (!roomId) return;

    const ch = supabase.channel(`typing-${roomId}`);

    ch.on("presence", { event: "sync" }, () => {
      const state = ch.presenceState<{ playerNumber: number; isTyping: boolean }>();
      const partnerKey = `player${partnerNum}`;
      const list = state[partnerKey];
      const p = list?.[0];
      setIsPartnerTyping(p?.isTyping === true);
    });

    ch.subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [roomId, partnerNum]);

  return isPartnerTyping;
};
