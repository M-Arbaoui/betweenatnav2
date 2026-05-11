import { useState, useCallback, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useGameRoom, clearSession, type RejoinResult } from "@/hooks/useGameRoom";
import { useLanguage } from "@/i18n/LanguageContext";
import { getDisplayName } from "@/lib/nameUtils";
import WelcomeScreen from "@/components/game/WelcomeScreen";
import AnswerScreen from "@/components/game/AnswerScreen";
import RoundResultScreen from "@/components/game/RoundResultScreen";
import FinalResultScreen from "@/components/game/FinalResultScreen";
import TruthOrDareScreen from "@/components/game/TruthOrDareScreen";
import LoadingScreen from "@/components/game/LoadingScreen";
import RoomLobby from "@/components/game/RoomLobby";
import ThemeSelector from "@/components/game/ThemeSelector";
import OfflineBanner from "@/components/game/OfflineBanner";
import LanguageToggle from "@/components/game/LanguageToggle";
import SplashScreen from "@/components/game/SplashScreen";
import WaitingForPartnerScreen from "@/components/game/WaitingForPartnerScreen";
import type { PlayerScores, RoundResult, FinalResult } from "@/types/game";

const TOTAL_ROUNDS = 10;

type AppPhase =
  | "welcome" | "create-room" | "join-room" | "waiting-for-host"
  | "player-answer" | "waiting-for-partner" | "analyzing" | "round-result" | "truth-or-dare" | "final"
  | "rejoining";

const slide = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  exit:    { opacity: 0, y: -16 },
  transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1] },
};

const Index = () => {
  const [showSplash, setShowSplash] = useState(true);
  const [phase, setPhase] = useState<AppPhase>("rejoining");
  const [player1Name, setPlayer1Name] = useState("");
  const [player2Name, setPlayer2Name] = useState("");
  const [currentRound, setCurrentRound] = useState(1);
  const [currentQuestion, setCurrentQuestion] = useState("");
  const [questionMood, setQuestionMood] = useState("🔥");
  const [allRoundResults, setAllRoundResults] = useState<RoundResult[]>([]);
  const [currentRoundAnswers, setCurrentRoundAnswers] = useState<{p1:string;p2:string}|null>(null);
  const [currentRoundScores, setCurrentRoundScores] = useState<{
    player1:PlayerScores; player2:PlayerScores; coupleVerdict:string; compatibilityScore:number;
  }|null>(null);
  const [finalResult, setFinalResult] = useState<FinalResult|null>(null);
  const [dareLoser, setDareLoser] = useState<{ name: string; score: number; round: number } | null>(null);
  const [loading, setLoading] = useState(false);
  const [createRoomName, setCreateRoomName] = useState("");
  const [initialJoinCode, setInitialJoinCode] = useState("");
  const [rejoinError, setRejoinError] = useState<RejoinResult["error"] | null>(null);

  const { lang } = useLanguage();

  const {
    room, playerNumber, isOnline, rejoinStep,
    tryRejoin, createRoom, joinRoom, updateRoom,
    submitAnswer, waitForBothAnswers, fetchRoundAnswers,
    saveRoundResult, saveFinalResult,
    waitForRoundResult, waitForFinalResult,
    leaveRoom,
  } = useGameRoom();

  // ── Display names (Arabic if lang=ar) ────────────────────────────────────
  const dp1 = getDisplayName(player1Name, lang);
  const dp2 = getDisplayName(player2Name, lang);

  // ── Rejoin on mount ───────────────────────────────────────────────────────
  const doRejoin = useCallback(async () => {
    setRejoinError(null);
    const params = new URLSearchParams(window.location.search);
    const joinCode = params.get("join");
    if (joinCode && joinCode.length >= 4) {
      // Keep invite param in URL for the join screen to display
      const invite = params.get("invite");
      const newParams = new URLSearchParams();
      if (invite) newParams.set("invite", invite);
      const newSearch = newParams.toString() ? `?${newParams.toString()}` : "";
      window.history.replaceState({}, "", window.location.pathname + newSearch);
      setInitialJoinCode(joinCode.toUpperCase());
      setPhase("join-room");
      return;
    }

    const result = await tryRejoin();
    if (!result.success) {
      if (result.error) setRejoinError(result.error);
      else setPhase("welcome");
      return;
    }

    const { phase: roomPhase, round, question, mood } = result;
    setPlayer1Name(room?.player1_name || "");
    setPlayer2Name(room?.player2_name || "");
    setCurrentRound(round || 1);
    setCurrentQuestion(question || "");
    setQuestionMood(mood || "🔥");

    toast.success(lang === "ar" ? "رجعت للعبة! 🔥" : "Session restored! 🔥");

    if (roomPhase === "waiting" || roomPhase === "ready") {
      setPhase(playerNumber === 1 ? "create-room" : "waiting-for-host");
    } else if (roomPhase === "answering") {
      setPhase("player-answer");
    } else if (roomPhase === "round-result") {
      // Fetch round result scores from DB to avoid blank screen
      try {
        const { data: rr } = await supabase
          .from("game_round_results")
          .select("*")
          .eq("room_id", result.success ? (await (async () => { const s = (await import("@/hooks/useGameRoom")).loadSession(); return s?.roomId || ""; })()) : "")
          .eq("round_number", round || 1)
          .maybeSingle();
        if (rr) {
          setCurrentRoundScores({
            player1: rr.player1_scores as unknown as PlayerScores,
            player2: rr.player2_scores as unknown as PlayerScores,
            coupleVerdict: rr.couple_verdict,
            compatibilityScore: rr.compatibility_score,
          });
        }
      } catch {}
      const answers = await fetchRoundAnswers(round || 1);
      if (answers) setCurrentRoundAnswers(answers);
      setPhase("round-result");
    } else if (roomPhase === "final") {
      const { data } = await supabase.from("game_final_results").select("*").eq("room_id", room!.id).maybeSingle();
      if (data) {
        setFinalResult({ finalScore: data.final_score, title: data.title, summary: data.summary, awards: (data.awards as any[]) || [], advice: data.advice });
        setPhase("final");
      } else setPhase("welcome");
    } else setPhase("welcome");
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lang]);

  useEffect(() => { doRejoin(); }, []);

  // ── Realtime sync ─────────────────────────────────────────────────────────
  useEffect(() => {
    if (!isOnline || !room) return;
    if (playerNumber === 1 && phase === "create-room" && room.player2_name) setPlayer2Name(room.player2_name);
    if (playerNumber === 2 && phase === "waiting-for-host" && room.phase === "answering" && room.current_question) {
      setPlayer1Name(room.player1_name); setPlayer2Name(room.player2_name || "");
      setCurrentQuestion(room.current_question); setQuestionMood(room.question_mood || "🔥");
      setCurrentRound(room.current_round); setPhase("player-answer");
    }
    if (playerNumber === 2 && (phase === "round-result" || phase === "waiting-for-partner")) {
      if (room.phase === "answering" && room.current_round > currentRound) {
        setCurrentQuestion(room.current_question || ""); setQuestionMood(room.question_mood || "🔥");
        setCurrentRound(room.current_round); setPhase("player-answer");
      }
    }
  }, [room, isOnline, playerNumber, phase, currentRound]);

  useEffect(() => {
    if (phase === "round-result" && !currentRoundAnswers && room?.id) {
      fetchRoundAnswers(currentRound).then(a => { if (a) setCurrentRoundAnswers(a); });
    }
  }, [phase, currentRoundAnswers, currentRound, room?.id, fetchRoundAnswers]);

  const callAI = useCallback(async (body: Record<string, unknown>) => {
    const { data, error } = await supabase.functions.invoke("couples-game", {
      body: { ...body, language: lang, relationshipType: "discovery" }
    });
    if (error) throw new Error(error.message);
    if (data?.error) throw new Error(data.error);
    return data;
  }, [lang]);

  const handleCreateRoom = async (name: string) => {
    setCreateRoomName(name); setPlayer1Name(name);
    const code = await createRoom(name, "discovery");
    if (code) setPhase("create-room");
  };

  const handleJoinSubmit = async (code: string, name: string) => {
    const ok = await joinRoom(code, name);
    if (ok) { setPlayer2Name(name); setPhase("waiting-for-host"); toast.success(lang === "ar" ? "دخلتي! 🎉" : "Joined! 🎉"); }
  };

  const handleOnlineStart = async () => {
    if (!room?.player1_name || !room?.player2_name) return;
    setPlayer1Name(room.player1_name); setPlayer2Name(room.player2_name);
    setCurrentRound(1); setAllRoundResults([]); setLoading(true);
    try {
      const data = await callAI({
        action: "generate_question", player1Name: room.player1_name, player2Name: room.player2_name,
        previousQuestions: [], roundNumber: 1, totalRounds: TOTAL_ROUNDS, gameMode: "Mixed", allAnswers: [],
      });
      await updateRoom({
        phase: "answering", current_question: data.question, current_question_b: data.question,
        question_mood: data.mood || "🔥", current_surprise: data.surprise || "",
        current_round: 1, previous_questions: [data.question],
      });
      setCurrentQuestion(data.question); setQuestionMood(data.mood || "🔥"); setPhase("player-answer");
    } catch (e: any) { toast.error(e.message || "Error"); } finally { setLoading(false); }
  };

  const handleSubmitAnswer = async (answer: string) => {
    if (!isOnline) return;
    await submitAnswer(currentRound, answer);
    setPhase("waiting-for-partner"); setLoading(true);

    if (playerNumber === 1) {
      const answers = await waitForBothAnswers(currentRound);
      if (!answers) { toast.error(lang === "ar" ? "انتهى الوقت" : "Timed out"); setLoading(false); return; }
      setCurrentRoundAnswers(answers);
      try {
        const data = await callAI({
          action: "analyze_answers", player1Name, player2Name,
          player1Answer: answers.p1, player2Answer: answers.p2,
          previousQuestions: room?.previous_questions || [],
          roundNumber: currentRound, totalRounds: TOTAL_ROUNDS, gameMode: "Mixed", allAnswers: allRoundResults,
        });
        await saveRoundResult(currentRound, data);
        await updateRoom({ phase: "round-result" });
        const rr: RoundResult = {
          question: currentQuestion, player1Answer: answers.p1, player2Answer: answers.p2,
          player1Scores: data.player1, player2Scores: data.player2,
          coupleVerdict: data.coupleVerdict, compatibilityScore: data.compatibilityScore,
        };
        setCurrentRoundScores({ player1: data.player1, player2: data.player2, coupleVerdict: data.coupleVerdict, compatibilityScore: data.compatibilityScore });
        setAllRoundResults(prev => [...prev, rr]);
        // Truth or Dare: trigger if compatibility < 30%
        if (data.compatibilityScore < 30) {
          const p1Total = Object.values(data.player1 as Record<string,number>).filter(v => typeof v === "number" && v <= 100).reduce((a,b) => a+b, 0);
          const p2Total = Object.values(data.player2 as Record<string,number>).filter(v => typeof v === "number" && v <= 100).reduce((a,b) => a+b, 0);
          const loser = p1Total <= p2Total ? player1Name : player2Name;
          setDareLoser({ name: loser, score: data.compatibilityScore, round: currentRound });
          setPhase("truth-or-dare");
        } else {
          setPhase("round-result");
        }
      } catch (e: any) { toast.error(e.message || "Error"); setPhase("player-answer"); }
    } else {
      const result = await waitForRoundResult(currentRound);
      if (!result) { toast.error(lang === "ar" ? "انتهى الوقت" : "Timed out"); setLoading(false); return; }
      const answers = await fetchRoundAnswers(currentRound);
      if (answers) setCurrentRoundAnswers(answers);
      setCurrentRoundScores({
        player1: result.player1_scores as unknown as PlayerScores,
        player2: result.player2_scores as unknown as PlayerScores,
        coupleVerdict: result.couple_verdict, compatibilityScore: result.compatibility_score,
      });
      setAllRoundResults(prev => [...prev, {
        question: currentQuestion, player1Answer: answers?.p1 || "", player2Answer: answers?.p2 || "",
        player1Scores: result.player1_scores as unknown as PlayerScores,
        player2Scores: result.player2_scores as unknown as PlayerScores,
        coupleVerdict: result.couple_verdict, compatibilityScore: result.compatibility_score,
      }]);
      if (result.compatibility_score < 30) {
        setPhase("truth-or-dare");
      } else {
        setPhase("round-result");
      }
    }
    setLoading(false);
  };

  const handleNextRound = async () => {
    if (currentRound >= TOTAL_ROUNDS) {
      if (playerNumber === 1) {
        setPhase("analyzing"); setLoading(true);
        try {
          const data = await callAI({ action: "final_analysis", player1Name, player2Name, allAnswers: allRoundResults, gameMode: "Mixed", totalRounds: TOTAL_ROUNDS });
          await saveFinalResult(data); await updateRoom({ phase: "final" });
          setFinalResult(data); setPhase("final");
          clearSession(); // ← auto-clear on final
        } catch (e: any) { toast.error(e.message || "Error"); } finally { setLoading(false); }
      } else {
        setPhase("analyzing"); setLoading(true);
        const result = await waitForFinalResult();
        if (result) {
          setFinalResult({ finalScore: result.final_score, title: result.title, summary: result.summary, awards: (result.awards as any[]) || [], advice: result.advice });
          setPhase("final");
          clearSession(); // ← auto-clear on final
        }
        setLoading(false);
      }
    } else {
      if (playerNumber === 1) {
        const next = currentRound + 1;
        setCurrentRound(next); setLoading(true);
        try {
          const prevQ = [...(room?.previous_questions || [])];
          const data = await callAI({
            action: "generate_question", player1Name, player2Name,
            previousQuestions: prevQ, roundNumber: next, totalRounds: TOTAL_ROUNDS, gameMode: "Mixed", allAnswers: allRoundResults,
          });
          await updateRoom({
            phase: "answering", current_question: data.question, current_question_b: data.question,
            question_mood: data.mood || "🔥", current_surprise: data.surprise || "",
            current_round: next, previous_questions: [...prevQ, data.question],
          });
          setCurrentQuestion(data.question); setQuestionMood(data.mood || "🔥"); setPhase("player-answer");
        } catch (e: any) { toast.error(e.message || "Error"); } finally { setLoading(false); }
      }
    }
  };

  const handleRestart = () => {
    setPhase("welcome"); setPlayer1Name(""); setPlayer2Name(""); setCurrentRound(1);
    setAllRoundResults([]); setFinalResult(null); setCurrentRoundScores(null); setCurrentRoundAnswers(null);
    clearSession(); // ← auto-clear on restart
    leaveRoom();
  };

  const handleLeaveRoom = () => {
    clearSession(); // ← auto-clear on leave
    leaveRoom();
    setPhase("welcome");
  };

  const loadingMsg = phase === "analyzing"
    ? (lang === "ar" ? "كنحضرو التقرير النهائي..." : "Preparing the final report...")
    : phase === "waiting-for-partner"
    ? (lang === "ar" ? "كنتسناو صاحبك..." : "Waiting for your partner...")
    : (lang === "ar" ? "كنحضرو السؤال..." : "Preparing the question...");


  // ── REJOINING state ───────────────────────────────────────────────────────
  if (phase === "rejoining") {
    return (
      <>
        <AnimatePresence>
          {showSplash && <SplashScreen onDone={() => setShowSplash(false)} />}
        </AnimatePresence>
        {!showSplash && (
          <LoadingScreen
            isRejoining
            rejoinStep={rejoinStep}
            rejoinError={rejoinError}
            onRetry={() => { setRejoinError(null); doRejoin(); }}
            onStartFresh={() => { clearSession(); setRejoinError(null); setPhase("welcome"); }}
          />
        )}
      </>
    );
  }

  if (loading && phase !== "waiting-for-partner") return (
    <>
      <AnimatePresence>
        {showSplash && <SplashScreen onDone={() => setShowSplash(false)} />}
      </AnimatePresence>
      {!showSplash && <LoadingScreen message={loadingMsg} />}
    </>
  );

  return (
    <div className="min-h-[100dvh] relative">
      <AnimatePresence>
        {showSplash && <SplashScreen onDone={() => setShowSplash(false)} />}
      </AnimatePresence>
      <OfflineBanner />
      {/* Room pill */}
      {room && !["welcome","create-room","join-room"].includes(phase) && (
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
          className="fixed top-3 left-1/2 -translate-x-1/2 z-40 pointer-events-none">
          <div className="glass flex items-center gap-2 px-3 py-1.5 rounded-full backdrop-blur-sm"
            style={{ background: "hsl(var(--card)/0.8)", border: "1px solid hsl(var(--border)/0.4)" }}>
            <span className="font-black text-[11px] text-primary" style={{ fontFamily: "'JetBrains Mono'" }}>{room.room_code}</span>
            <span className="text-muted-foreground/40">·</span>
            <span className="font-mono text-[10px] text-muted-foreground">{currentRound}/{TOTAL_ROUNDS}</span>
          </div>
        </motion.div>
      )}

      <AnimatePresence mode="wait">
        {phase === "welcome" && (
          <motion.div key="welcome" {...slide} className="min-h-[100dvh]">
            <WelcomeScreen onCreateRoom={handleCreateRoom} onJoinRoom={() => setPhase("join-room")} />
          </motion.div>
        )}
        {phase === "create-room" && (
          <motion.div key="create" {...slide} className="min-h-[100dvh]">
            {!createRoomName
              ? <RoomLobby mode="join" onBack={handleLeaveRoom} playerName=""
                  onJoin={(_, name) => { if (name.trim()) { setCreateRoomName(name); setPlayer1Name(name); createRoom(name, "discovery"); } }} />
              : <RoomLobby mode="create" roomCode={room?.room_code} playerName={createRoomName}
                  partnerName={room?.player2_name} onBack={handleLeaveRoom} onStart={handleOnlineStart} />
            }
          </motion.div>
        )}
        {phase === "join-room" && (
          <motion.div key="join" {...slide} className="min-h-[100dvh]">
            <RoomLobby mode="join" onBack={() => { setPhase("welcome"); setInitialJoinCode(""); }}
              playerName="" onJoin={handleJoinSubmit} initialCode={initialJoinCode} />
          </motion.div>
        )}
        {phase === "waiting-for-host" && (
          <motion.div key="waiting" {...slide} className="min-h-[100dvh]">
            <RoomLobby mode="waiting-for-host" roomCode={room?.room_code} playerName={player2Name}
              partnerName={room?.player1_name} onBack={handleLeaveRoom} />
          </motion.div>
        )}
        {phase === "player-answer" && (
          <motion.div key={`ans-${currentRound}-${playerNumber}`} {...slide} className="min-h-[100dvh]">
            <AnswerScreen
              playerName={playerNumber === 1 ? dp1 : dp2}
              playerNumber={playerNumber}
              roundNumber={currentRound} totalRounds={TOTAL_ROUNDS}
              question={currentQuestion} questionMood={questionMood}
              onSubmit={handleSubmitAnswer} roomId={room?.id} />
          </motion.div>
        )}
        {phase === "waiting-for-partner" && (
          <motion.div key={`waiting-${currentRound}`} {...slide} className="min-h-[100dvh]">
            <WaitingForPartnerScreen
              playerName={playerNumber === 1 ? dp1 : dp2}
              partnerName={playerNumber === 1 ? dp2 : dp1}
              playerNumber={playerNumber}
              roomId={room?.id}
              roundNumber={currentRound}
              totalRounds={TOTAL_ROUNDS}
            />
          </motion.div>
        )}
        {phase === "round-result" && currentRoundScores && (
          <motion.div key={`res-${currentRound}`} {...slide} className="min-h-[100dvh]">
            <RoundResultScreen
              roundNumber={currentRound}
              player1Name={dp1} player2Name={dp2}
              player1Scores={currentRoundScores.player1} player2Scores={currentRoundScores.player2}
              coupleVerdict={currentRoundScores.coupleVerdict} compatibilityScore={currentRoundScores.compatibilityScore}
              onNext={handleNextRound} isLastRound={currentRound >= TOTAL_ROUNDS}
              question={currentQuestion}
              player1Answer={currentRoundAnswers?.p1} player2Answer={currentRoundAnswers?.p2}
              playerNumber={playerNumber} />
          </motion.div>
        )}
        {phase === "truth-or-dare" && dareLoser && (
          <motion.div key="dare" {...slide} className="min-h-[100dvh]">
            <TruthOrDareScreen
              loserName={dareLoser.name}
              winnerName={dareLoser.name === player1Name ? player2Name : player1Name}
              compatibilityScore={dareLoser.score}
              roundNumber={dareLoser.round}
              onComplete={() => setPhase("round-result")}
            />
          </motion.div>
        )}
        {phase === "final" && finalResult && (
          <motion.div key="final" {...slide} className="min-h-[100dvh]">
            <FinalResultScreen
              player1Name={dp1} player2Name={dp2}
              result={finalResult} allRoundResults={allRoundResults}
              onRestart={handleRestart} />
          </motion.div>
        )}
      </AnimatePresence>

      <ThemeSelector />
      <LanguageToggle />
    </div>
  );
};

export default Index;
