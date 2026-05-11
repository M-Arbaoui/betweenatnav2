import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, ArrowLeft, Trophy } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";
import { useSoundEffects } from "@/hooks/useSoundEffects";
import ScoreBar from "./ScoreBar";
import type { PlayerScores } from "@/types/game";

const SCORE_KEYS = [
  { key: "Drama",       en: "Drama",      ar: "الدراما" },
  { key: "Creativity",  en: "Creativity", ar: "الإبداع" },
  { key: "Romance",     en: "Romance",    ar: "الرومانسية" },
  { key: "Mischief",    en: "Mischief",   ar: "الشقاوة" },
  { key: "SharedBrain", en: "Sync",       ar: "التوافق" },
] as const;

const AnimatedCounter = ({ value, onTick }: { value: number; onTick?: () => void }) => {
  const [displayed, setDisplayed] = useState(0);
  useEffect(() => {
    let start = 0;
    const step = 16;
    const increment = value / (1400 / step);
    const timer = setInterval(() => {
      start += increment;
      if (start >= value) { setDisplayed(value); clearInterval(timer); }
      else { setDisplayed(Math.floor(start)); onTick?.(); }
    }, step);
    return () => clearInterval(timer);
  }, [value]);
  return <>{displayed}</>;
};

const TypewriterText = ({ text, isRTL }: { text: string; isRTL: boolean }) => {
  const [shown, setShown] = useState("");
  useEffect(() => {
    setShown(""); let i = 0;
    const t = setInterval(() => { setShown(text.slice(0, i)); i++; if (i > text.length) clearInterval(t); }, 18);
    return () => clearInterval(t);
  }, [text]);
  return (
    <p className={`text-[15px] font-medium leading-relaxed text-foreground ${isRTL ? "font-arabic text-right" : ""}`}
      dir={isRTL ? "rtl" : "ltr"}>
      {shown}
      <motion.span animate={{ opacity: [1, 0] }} transition={{ duration: 0.5, repeat: Infinity }}
        className="text-primary ml-0.5">|</motion.span>
    </p>
  );
};

interface Props {
  roundNumber: number; player1Name: string; player2Name: string;
  player1Scores: PlayerScores; player2Scores: PlayerScores;
  coupleVerdict: string; compatibilityScore: number;
  onNext: () => void; isLastRound: boolean; question: string;
  player1Answer?: string; player2Answer?: string;
  playerNumber?: 1 | 2;
}

const ease = [0.25, 0.46, 0.45, 0.94];

const RoundResultScreen = ({
  roundNumber, player1Name, player2Name,
  player1Scores, player2Scores, coupleVerdict, compatibilityScore,
  onNext, isLastRound, question, player1Answer, player2Answer, playerNumber = 1,
}: Props) => {
  const [showP1, setShowP1] = useState(false);
  const [showP2, setShowP2] = useState(false);
  const [showScore, setShowScore] = useState(false);
  const [showBars, setShowBars] = useState(false);
  const [showVerdict, setShowVerdict] = useState(false);
  const [showNext, setShowNext] = useState(false);
  const [lieVote, setLieVote] = useState<null | "p1" | "p2" | "both">(null);
  const [myLieVote, setMyLieVote] = useState(false);

  const { lang, isRTL } = useLanguage();
  const ar = lang === "ar";
  const Arr = isRTL ? ArrowLeft : ArrowRight;
  const sounds = useSoundEffects();

  useEffect(() => {
    const t1 = setTimeout(() => { sounds.playReveal();  setShowP1(true); }, 300);
    const t2 = setTimeout(() => { sounds.playReveal2(); setShowP2(true); }, 1600);
    const t3 = setTimeout(() => setShowScore(true),   2400);
    const t4 = setTimeout(() => setShowBars(true),    3200);
    const t5 = setTimeout(() => setShowVerdict(true), 4000);
    const t6 = setTimeout(() => setShowNext(true),    4600);
    return () => [t1,t2,t3,t4,t5,t6].forEach(clearTimeout);
  }, []);

  const scoreColor = compatibilityScore >= 70 ? "#22c55e"
    : compatibilityScore >= 45 ? "hsl(var(--primary))"
    : "hsl(var(--destructive))";

  const p1Verdict = (player1Scores as any)?.Verdict || null;
  const p2Verdict = (player2Scores as any)?.Verdict || null;

  const handleLieVote = () => {
    if (myLieVote) return;
    setMyLieVote(true);
    const other = playerNumber === 1 ? "p2" : "p1";
    setLieVote(prev => prev === other ? "both" : (playerNumber === 1 ? "p1" : "p2"));
  };

  return (
    <div className="relative min-h-[100dvh] flex flex-col overflow-y-auto bg-background">
      <div className="orb-primary" style={{ top: "-20%", right: "-15%", opacity: 0.5 }} />
      <div className="orb-secondary" style={{ bottom: "-20%", left: "-12%", opacity: 0.4 }} />

      {/* Header */}
      <div className="relative z-10 pt-safe px-4 md:px-5 flex items-center justify-between mb-4">
        <span className="badge-pill">
          {ar ? `جولة ${roundNumber} من 10` : `Round ${roundNumber} of 10`}
        </span>
        <AnimatePresence>
          {showScore && (
            <motion.div initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 260, damping: 18 }}
              className="font-black text-2xl score-display" style={{ color: scoreColor }}>
              <AnimatedCounter value={compatibilityScore} onTick={() => sounds.playTick()} />%
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="relative z-10 px-4 md:px-5 pb-8 space-y-3 max-w-lg mx-auto w-full">

        {/* Question text */}
        <p className={`text-[12px] font-semibold text-muted-foreground leading-relaxed ${isRTL ? "text-right font-arabic" : ""}`}
          dir={isRTL ? "rtl" : "ltr"}>
          {question}
        </p>

        {/* ── Player 1 answer card ── */}
        <AnimatePresence>
          {showP1 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease }}
              className="rounded-2xl border border-primary/20 overflow-hidden"
              style={{ background: "hsl(var(--card))" }}>
              {/* Name bar */}
              <div className={`flex items-center gap-2 px-4 py-2.5 border-b border-primary/10 ${isRTL ? "flex-row-reverse" : ""}`}
                style={{ background: "hsl(var(--primary) / 0.06)" }}>
                <div className="w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold text-white flex-shrink-0"
                  style={{ background: "hsl(var(--primary))" }}>
                  {player1Name[0]?.toUpperCase()}
                </div>
                <span className="text-[12px] font-bold" style={{ color: "hsl(var(--primary))" }}>{player1Name}</span>
              </div>
              {/* Answer */}
              <div className="px-4 py-3.5">
                <p className={`text-[15px] font-medium text-foreground leading-relaxed ${isRTL ? "font-arabic text-right" : ""}`}
                  dir={isRTL ? "rtl" : "ltr"}>
                  {player1Answer || "—"}
                </p>
                {p1Verdict && (
                  <p className={`text-[12px] text-muted-foreground/70 mt-2.5 pt-2.5 border-t border-border/30 leading-relaxed italic ${isRTL ? "font-arabic text-right" : ""}`}
                    dir={isRTL ? "rtl" : "ltr"}>
                    {p1Verdict}
                  </p>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Player 2 answer card ── */}
        <AnimatePresence>
          {showP2 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease }}
              className="rounded-2xl border border-secondary/20 overflow-hidden"
              style={{ background: "hsl(var(--card))" }}>
              {/* Name bar */}
              <div className={`flex items-center gap-2 px-4 py-2.5 border-b border-secondary/10 ${isRTL ? "flex-row-reverse" : ""}`}
                style={{ background: "hsl(var(--secondary) / 0.06)" }}>
                <div className="w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold text-white flex-shrink-0"
                  style={{ background: "hsl(var(--secondary))" }}>
                  {player2Name[0]?.toUpperCase()}
                </div>
                <span className="text-[12px] font-bold" style={{ color: "hsl(var(--secondary))" }}>{player2Name}</span>
              </div>
              {/* Answer */}
              <div className="px-4 py-3.5">
                <p className={`text-[15px] font-medium text-foreground leading-relaxed ${isRTL ? "font-arabic text-right" : ""}`}
                  dir={isRTL ? "rtl" : "ltr"}>
                  {player2Answer || "—"}
                </p>
                {p2Verdict && (
                  <p className={`text-[12px] text-muted-foreground/70 mt-2.5 pt-2.5 border-t border-border/30 leading-relaxed italic ${isRTL ? "font-arabic text-right" : ""}`}
                    dir={isRTL ? "rtl" : "ltr"}>
                    {p2Verdict}
                  </p>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Lie detector */}
        <AnimatePresence>
          {showP2 && !myLieVote && (
            <motion.button
              initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.4 }}
              onClick={handleLieVote}
              className={`w-full h-9 rounded-xl text-[12px] font-semibold border border-border/40 text-muted-foreground/60 hover:text-foreground hover:border-border hover:bg-muted/20 flex items-center justify-center gap-1.5 transition-all ${isRTL ? "flex-row-reverse" : ""}`}>
              🤥 <span className={ar ? "font-arabic" : ""}>{ar ? "كاذب/ة في الجواب" : "They're lying"}</span>
            </motion.button>
          )}
          {myLieVote && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className={`w-full h-9 rounded-xl text-[12px] font-semibold flex items-center justify-center gap-1.5`}
              style={{ background: lieVote === "both" ? "hsl(var(--destructive)/0.1)" : "hsl(var(--muted)/0.5)",
                color: lieVote === "both" ? "hsl(var(--destructive))" : "hsl(var(--muted-foreground))" }}>
              {lieVote === "both"
                ? <span className={ar ? "font-arabic" : ""}>{ar ? "💀 الاثنين حكمو ببعض كذابين!" : "💀 Mutual liar call!"}</span>
                : <span className={ar ? "font-arabic" : ""}>{ar ? "✓ صوتك تسجل" : "✓ Vote registered"}</span>}
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Compatibility score card ── */}
        <AnimatePresence>
          {showScore && (
            <motion.div initial={{ opacity: 0, scale: 0.92 }} animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.45, type: "spring", stiffness: 160, damping: 16 }}
              className="card-interactive p-5 text-center border-gradient"
              style={{ background: "var(--gradient-subtle)" }}>
              <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground mb-2">
                {ar ? "نسبة التوافق" : "Compatibility Score"}
              </p>
              <div className="font-black score-display mb-3" style={{ fontSize: "clamp(42px,9vw,64px)", color: scoreColor }}>
                <AnimatedCounter value={compatibilityScore} onTick={() => sounds.playTick()} />%
              </div>
              <div className="h-2 rounded-full overflow-hidden bg-muted mx-auto max-w-[180px]">
                <motion.div className="h-full rounded-full"
                  initial={{ width: 0 }} animate={{ width: `${compatibilityScore}%` }}
                  transition={{ delay: 0.3, duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
                  onAnimationComplete={() => sounds.playScoreLock()}
                  style={{ background: compatibilityScore >= 50 ? "var(--gradient-accent)" : "hsl(var(--destructive))" }} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Score bars — stacked on mobile, side by side on md+ ── */}
        <AnimatePresence>
          {showBars && (
            <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, ease }}>

              {/* Mobile: combined single card */}
              <div className="card-interactive p-4 md:hidden">
                {SCORE_KEYS.map(({ key, en, ar: arL }, i) => {
                  const s1 = (player1Scores as any)[key] ?? 0;
                  const s2 = (player2Scores as any)[key] ?? 0;
                  const label = ar ? arL : en;
                  return (
                    <div key={key} className={`mb-3 last:mb-0 ${isRTL ? "text-right" : ""}`}>
                      <div className={`flex items-center justify-between mb-1.5 text-[12px] ${isRTL ? "flex-row-reverse" : ""}`}>
                        <span className={`font-semibold text-muted-foreground ${ar ? "font-arabic" : ""}`}>{label}</span>
                        <div className={`flex items-center gap-2 font-mono ${isRTL ? "flex-row-reverse" : ""}`}>
                          <span style={{ color: "hsl(var(--primary))", fontWeight: 700 }}>{s1}</span>
                          <span className="text-muted-foreground/30">·</span>
                          <span style={{ color: "hsl(var(--secondary))", fontWeight: 700 }}>{s2}</span>
                        </div>
                      </div>
                      {/* Dual bar */}
                      <div className="flex gap-1 h-1.5">
                        <div className="flex-1 bg-muted rounded-full overflow-hidden">
                          <motion.div className="h-full rounded-full"
                            style={{ background: "hsl(var(--primary))", transformOrigin: isRTL ? "right" : "left" }}
                            initial={{ scaleX: 0 }} animate={{ scaleX: s1 / 100 }}
                            transition={{ delay: 0.05 * i, duration: 0.7, ease: [0.22, 1, 0.36, 1] }} />
                        </div>
                        <div className="flex-1 bg-muted rounded-full overflow-hidden">
                          <motion.div className="h-full rounded-full"
                            style={{ background: "hsl(var(--secondary))", transformOrigin: isRTL ? "right" : "left" }}
                            initial={{ scaleX: 0 }} animate={{ scaleX: s2 / 100 }}
                            transition={{ delay: 0.05 * i + 0.04, duration: 0.7, ease: [0.22, 1, 0.36, 1] }} />
                        </div>
                      </div>
                    </div>
                  );
                })}
                {/* Legend */}
                <div className={`flex items-center gap-4 mt-3 pt-3 border-t border-border/30 text-[11px] font-mono ${isRTL ? "flex-row-reverse" : ""}`}>
                  <span className="flex items-center gap-1.5" style={{ color: "hsl(var(--primary))" }}>
                    <span className="w-2 h-2 rounded-full inline-block" style={{ background: "hsl(var(--primary))" }} />
                    {player1Name}
                  </span>
                  <span className="flex items-center gap-1.5" style={{ color: "hsl(var(--secondary))" }}>
                    <span className="w-2 h-2 rounded-full inline-block" style={{ background: "hsl(var(--secondary))" }} />
                    {player2Name}
                  </span>
                </div>
              </div>

              {/* Desktop: two side-by-side cards */}
              <div className="hidden md:grid grid-cols-2 gap-3">
                {[
                  { name: player1Name, scores: player1Scores, variant: "primary" as const },
                  { name: player2Name, scores: player2Scores, variant: "secondary" as const },
                ].map(({ name, scores, variant }, pi) => (
                  <div key={pi} className="card-interactive p-4">
                    <div className={`flex items-center gap-2 mb-3 ${isRTL ? "flex-row-reverse" : ""}`}>
                      <div className="w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold text-white"
                        style={{ background: variant === "primary" ? "hsl(var(--primary))" : "hsl(var(--secondary))" }}>
                        {name[0]?.toUpperCase()}
                      </div>
                      <span className="text-[13px] font-bold text-foreground">{name}</span>
                    </div>
                    <div className="space-y-2.5">
                      {SCORE_KEYS.map(({ key, en, ar: arL }, i) => (
                        <ScoreBar key={key}
                          label={ar ? arL : en}
                          score={(scores as any)[key] ?? 0}
                          variant={variant}
                          delay={0.05 * i} />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Verdict ── */}
        <AnimatePresence>
          {showVerdict && coupleVerdict && (
            <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, ease }}
              className="card-interactive p-4 border-gradient">
              <div className={`flex items-center gap-2 mb-2.5 ${isRTL ? "flex-row-reverse" : ""}`}>
                <div className="w-3.5 h-3.5 rounded-full flex-shrink-0" style={{ background: "var(--gradient-accent)" }} />
                <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                  {ar ? "حكم الجولة" : "Round Verdict"}
                </p>
              </div>
              <TypewriterText text={coupleVerdict} isRTL={isRTL} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Next button ── */}
        <AnimatePresence>
          {showNext && (
            <motion.button initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35 }}
              whileTap={{ scale: 0.97 }} whileHover={{ scale: 1.01 }}
              onClick={() => { sounds.playTap(); onNext(); }}
              className={`w-full h-[52px] rounded-xl font-bold text-sm text-primary-foreground flex items-center justify-center gap-2 shimmer ${isRTL ? "flex-row-reverse" : ""}`}
              style={{ background: "var(--gradient-accent)", boxShadow: "var(--shadow-accent)" }}>
              {isLastRound
                ? <><Trophy size={16} /><span className={ar ? "font-arabic" : ""}>{ar ? "النتائج النهائية 🏆" : "Final Results 🏆"}</span></>
                : <><span className={ar ? "font-arabic" : ""}>{ar ? "الجولة التالية" : "Next Round"}</span><Arr size={16} /></>}
            </motion.button>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
};

export default RoundResultScreen;
