import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface GameRoom {
  id: string;
  room_code: string;
  player1_name: string;
  player2_name: string | null;
  phase: string;
  current_round: number;
  current_question: string | null;
  current_question_b: string | null;
  question_mood: string | null;
  current_surprise: string | null;
  previous_questions: string[];
  relationship_type: string;
}

// ─── Session ─────────────────────────────────────────────────────────────────
const SESSION_KEY = "btna_session";
export interface StoredSession {
  roomId: string;
  roomCode: string;
  playerNumber: 1 | 2;
  playerName: string;
  savedAt: number;
}

export const saveSession = (s: StoredSession) =>
  localStorage.setItem(SESSION_KEY, JSON.stringify(s));

export const loadSession = (): StoredSession | null => {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const s: StoredSession = JSON.parse(raw);
    if (Date.now() - s.savedAt > 4 * 60 * 60 * 1000) { localStorage.removeItem(SESSION_KEY); return null; }
    return s;
  } catch { return null; }
};

export const clearSession = () => localStorage.removeItem(SESSION_KEY);

// ─── Rejoin result types ──────────────────────────────────────────────────────
export type RejoinStep = "checking" | "room" | "results" | "answers" | "done";

export interface RejoinResult {
  success: boolean;
  phase?: string;
  round?: number;
  question?: string;
  mood?: string;
  error?: "not_found" | "finished" | "name_mismatch" | "unknown";
}

// ─── Utils ────────────────────────────────────────────────────────────────────
const generateRoomCode = () => {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  return Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
};

const parseRoom = (data: any): GameRoom => ({
  ...data,
  previous_questions: (data.previous_questions as string[] | null) || [],
  relationship_type: data.relationship_type || "discovery",
});

// ─── Hook ─────────────────────────────────────────────────────────────────────
export const useGameRoom = () => {
  const [room, setRoom] = useState<GameRoom | null>(null);
  const [playerNumber, setPlayerNumber] = useState<1 | 2>(1);
  const [playerName, setPlayerName] = useState("");
  const [isOnline, setIsOnline] = useState(false);
  const [rejoinStep, setRejoinStep] = useState<RejoinStep>("checking");
  const pollRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Realtime + polling ──────────────────────────────────────────────────
  useEffect(() => {
    if (!room?.id) return;
    const roomId = room.id;
    const channel = supabase
      .channel(`room-${roomId}`)
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "game_rooms", filter: `id=eq.${roomId}` },
        (payload) => setRoom(parseRoom(payload.new)))
      .subscribe();

    const poll = async () => {
      try {
        const { data } = await supabase.from("game_rooms").select("*").eq("id", roomId).maybeSingle();
        if (data) setRoom(prev => {
          const parsed = parseRoom(data);
          return JSON.stringify(prev) !== JSON.stringify(parsed) ? parsed : prev;
        });
      } catch {}
      pollRef.current = setTimeout(poll, 3000);
    };
    pollRef.current = setTimeout(poll, 3000);
    return () => { supabase.removeChannel(channel); if (pollRef.current) clearTimeout(pollRef.current); };
  }, [room?.id]);

  // ── Try rejoin ───────────────────────────────────────────────────────────
  const tryRejoin = useCallback(async (): Promise<RejoinResult> => {
    const session = loadSession();
    if (!session) return { success: false };

    try {
      // Step 1: Restore room
      setRejoinStep("room");
      await new Promise(r => setTimeout(r, 400));

      const { data } = await supabase.from("game_rooms").select("*").eq("id", session.roomId).maybeSingle();

      if (!data) { clearSession(); return { success: false, error: "not_found" }; }
      if (data.phase === "finished") { clearSession(); return { success: false, error: "finished" }; }

      // Verify player name still matches server state
      const serverName = session.playerNumber === 1 ? data.player1_name : data.player2_name;
      if (serverName && serverName !== session.playerName) {
        clearSession();
        return { success: false, error: "name_mismatch" };
      }

      const parsed = parseRoom(data);

      // Step 2: Load round results if needed
      if (["round-result", "answering"].includes(data.phase)) {
        setRejoinStep("results");
        await new Promise(r => setTimeout(r, 350));
      }

      // Step 3: Load answers
      if (data.phase === "round-result" || data.phase === "answering") {
        setRejoinStep("answers");
        await new Promise(r => setTimeout(r, 350));
      }

      setRejoinStep("done");
      setRoom(parsed);
      setPlayerNumber(session.playerNumber);
      setPlayerName(session.playerName);
      setIsOnline(true);
      saveSession({ ...session, savedAt: Date.now() });

      return {
        success: true,
        phase: data.phase,
        round: data.current_round,
        question: data.current_question || "",
        mood: data.question_mood || "🔥",
      };
    } catch {
      clearSession();
      return { success: false, error: "unknown" };
    }
  }, []);

  // ── Create room ──────────────────────────────────────────────────────────
  const createRoom = useCallback(async (name: string, relationshipType = "discovery"): Promise<string | null> => {
    const roomCode = generateRoomCode();
    const { data, error } = await supabase.from("game_rooms").insert({
      room_code: roomCode, player1_name: name,
      phase: "waiting", relationship_type: relationshipType,
    }).select().single();
    if (error || !data) { toast.error("Error creating room"); return null; }
    const parsed = parseRoom(data);
    setRoom(parsed); setPlayerNumber(1); setPlayerName(name); setIsOnline(true);
    saveSession({ roomId: data.id, roomCode, playerNumber: 1, playerName: name, savedAt: Date.now() });
    return roomCode;
  }, []);

  // ── Join room ────────────────────────────────────────────────────────────
  const joinRoom = useCallback(async (roomCode: string, name: string): Promise<boolean> => {
    let { data } = await supabase.from("game_rooms").select("*")
      .eq("room_code", roomCode.toUpperCase()).eq("phase", "waiting").maybeSingle();

    if (!data) {
      // Check if this player is rejoining their own game
      const { data: existing } = await supabase.from("game_rooms").select("*")
        .eq("room_code", roomCode.toUpperCase())
        .in("phase", ["ready", "answering", "round-result", "final"])
        .maybeSingle();

      if (existing) {
        if (existing.player2_name === name) {
          setRoom(parseRoom(existing)); setPlayerNumber(2); setPlayerName(name); setIsOnline(true);
          saveSession({ roomId: existing.id, roomCode, playerNumber: 2, playerName: name, savedAt: Date.now() });
          return true;
        }
        toast.error("This game is already in progress");
        return false;
      }
      toast.error("Room not found or game already started");
      return false;
    }

    const { error } = await supabase.from("game_rooms")
      .update({ player2_name: name, phase: "ready" }).eq("id", data.id);
    if (error) { toast.error("Error joining room"); return false; }
    setRoom(parseRoom({ ...data, player2_name: name, phase: "ready" }));
    setPlayerNumber(2); setPlayerName(name); setIsOnline(true);
    saveSession({ roomId: data.id, roomCode, playerNumber: 2, playerName: name, savedAt: Date.now() });
    return true;
  }, []);

  const updateRoom = useCallback(async (updates: Record<string, unknown>) => {
    if (!room?.id) return;
    await supabase.from("game_rooms").update(updates).eq("id", room.id);
  }, [room?.id]);

  const submitAnswer = useCallback(async (roundNumber: number, answer: string) => {
    if (!room?.id) return;
    await supabase.from("game_answers").upsert({
      room_id: room.id, round_number: roundNumber, player_number: playerNumber, answer,
    }, { onConflict: "room_id,round_number,player_number" });
  }, [room?.id, playerNumber]);

  const waitForBothAnswers = useCallback(async (roundNumber: number): Promise<{ p1: string; p2: string } | null> => {
    if (!room?.id) return null;
    for (let i = 0; i < 60; i++) {
      const { data } = await supabase.from("game_answers").select("*").eq("room_id", room.id).eq("round_number", roundNumber);
      if (data && data.length >= 2) {
        const p1 = data.find((d: any) => d.player_number === 1);
        const p2 = data.find((d: any) => d.player_number === 2);
        if (p1 && p2) return { p1: p1.answer, p2: p2.answer };
      }
      await new Promise(r => setTimeout(r, 2000));
    }
    return null;
  }, [room?.id]);

  const fetchRoundAnswers = useCallback(async (roundNumber: number) => {
    if (!room?.id) return null;
    const { data } = await supabase.from("game_answers").select("*").eq("room_id", room.id).eq("round_number", roundNumber);
    if (data && data.length >= 2) {
      const p1 = data.find((d: any) => d.player_number === 1);
      const p2 = data.find((d: any) => d.player_number === 2);
      if (p1 && p2) return { p1: p1.answer, p2: p2.answer };
    }
    return null;
  }, [room?.id]);

  const saveRoundResult = useCallback(async (roundNumber: number, result: any) => {
    if (!room?.id) return;
    await supabase.from("game_round_results").upsert({
      room_id: room.id, round_number: roundNumber,
      player1_scores: result.player1, player2_scores: result.player2,
      couple_verdict: result.coupleVerdict, compatibility_score: result.compatibilityScore,
    }, { onConflict: "room_id,round_number" });
  }, [room?.id]);

  const saveFinalResult = useCallback(async (result: any) => {
    if (!room?.id) return;
    await supabase.from("game_final_results").upsert({
      room_id: room.id, final_score: result.finalScore, title: result.title,
      summary: result.summary, awards: result.awards || [], advice: result.advice,
    }, { onConflict: "room_id" });
  }, [room?.id]);

  const waitForRoundResult = useCallback(async (roundNumber: number) => {
    if (!room?.id) return null;
    for (let i = 0; i < 60; i++) {
      const { data } = await supabase.from("game_round_results").select("*")
        .eq("room_id", room.id).eq("round_number", roundNumber).maybeSingle();
      if (data) return data;
      await new Promise(r => setTimeout(r, 2000));
    }
    return null;
  }, [room?.id]);

  const waitForFinalResult = useCallback(async () => {
    if (!room?.id) return null;
    for (let i = 0; i < 60; i++) {
      const { data } = await supabase.from("game_final_results").select("*")
        .eq("room_id", room.id).maybeSingle();
      if (data) return data;
      await new Promise(r => setTimeout(r, 2000));
    }
    return null;
  }, [room?.id]);

  const leaveRoom = useCallback(() => {
    setRoom(null); setIsOnline(false); setPlayerNumber(1); setPlayerName("");
    clearSession();
    if (pollRef.current) clearTimeout(pollRef.current);
  }, []);

  return {
    room, playerNumber, playerName, isOnline, rejoinStep,
    tryRejoin, createRoom, joinRoom, updateRoom,
    submitAnswer, waitForBothAnswers, fetchRoundAnswers,
    saveRoundResult, saveFinalResult,
    waitForRoundResult, waitForFinalResult,
    leaveRoom,
  };
};
