import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Zap } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";
import { useSoundEffects } from "@/hooks/useSoundEffects";
import { useTypingIndicator, usePartnerTyping } from "@/hooks/useTypingIndicator";

interface AnswerScreenProps {
  playerName: string; playerNumber: 1 | 2;
  roundNumber: number; totalRounds: number;
  question: string; questionMood?: string;
  onSubmit: (answer: string) => void;
  roomId?: string;
}

const MIN_CHARS = 10;

const MOOD_LABELS: Record<string, { ar: string; en: string; color: string }> = {
  "🔥": { ar: "موضوع ساخن", en: "Hot topic",     color: "hsl(22 90% 55%)" },
  "😬": { ar: "محرج شوية",  en: "Uncomfortable", color: "hsl(345 82% 52%)" },
  "💀": { ar: "لا رجعة",    en: "No going back", color: "hsl(270 65% 50%)" },
  "🤔": { ar: "فكر مزيان",  en: "Think hard",    color: "hsl(220 70% 55%)" },
  "💭": { ar: "ذكريات",     en: "Memories",      color: "hsl(200 70% 50%)" },
  "🎯": { ar: "مباشر",      en: "Direct",        color: "hsl(160 65% 42%)" },
  "😏": { ar: "الله يستر",  en: "Uh oh...",      color: "hsl(345 82% 52%)" },
  "🧠": { ar: "واش عارف؟",  en: "Do you know?",  color: "hsl(270 65% 50%)" },
  "💔": { ar: "يجرح شوية",  en: "Might sting",   color: "hsl(350 80% 50%)" },
  "🎲": { ar: "حظك",        en: "Your luck",     color: "hsl(280 65% 55%)" },
};

const getMoodLabel = (mood: string, ar: boolean) => {
  const m = MOOD_LABELS[mood];
  return m ? { label: ar ? m.ar : m.en, color: m.color } : null;
};

const ease = [0.25, 0.46, 0.45, 0.94];

const AnswerScreen = ({
  playerName, playerNumber, roundNumber, totalRounds,
  question, questionMood = "🤔", onSubmit, roomId,
}: AnswerScreenProps) => {
  const [answer, setAnswer] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [focused, setFocused] = useState(false);
  const [nudgeVisible, setNudgeVisible] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { lang, isRTL } = useLanguage();
  const ar = lang === "ar";
  const isP2 = playerNumber === 2;
  const sounds = useSoundEffects();

  // Speed round: last 3 rounds = 20s, else 90s
  const isSpeedRound = roundNumber >= totalRounds - 2;
  const TIMER = isSpeedRound ? 20 : 90;
  const [timeLeft, setTimeLeft] = useState(TIMER);

  // Typing indicator
  const { onKeyStroke, stopTyping } = useTypingIndicator(roomId, playerNumber, playerName);
  const isPartnerTyping = usePartnerTyping(roomId, playerNumber);

  useEffect(() => { setTimeout(() => textareaRef.current?.focus(), 300); }, []);

  useEffect(() => {
    if (timeLeft <= 0 && answer.trim()) { handleSubmit(); return; }
    if (timeLeft <= 10 && timeLeft > 0 && !submitted) sounds.playUrgent();
    const t = setInterval(() => setTimeLeft(p => Math.max(0, p - 1)), 1000);
    return () => clearInterval(t);
  }, [timeLeft]);

  const handleSubmit = () => {
    if (!answer.trim() || submitted) return;
    if (answer.trim().length < MIN_CHARS) { setNudgeVisible(true); setTimeout(() => setNudgeVisible(false), 2000); return; }
    stopTyping();
    sounds.playSubmit();
    setSubmitted(true);
    onSubmit(answer.trim());
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setAnswer(e.target.value);
    onKeyStroke();
  };

  const pct = timeLeft / TIMER;
  const timerColor = timeLeft <= 10
    ? "hsl(var(--destructive))"
    : timeLeft <= 30 && !isSpeedRound
    ? "hsl(38 90% 55%)"
    : "hsl(var(--primary))";

  const charPct = Math.min(answer.length / 500, 1);
  const moodInfo = getMoodLabel(questionMood, ar);
  const p1color = "hsl(var(--primary))";
  const p2color = "hsl(var(--secondary))";
  const myColor = isP2 ? p2color : p1color;
  const partnerColor = isP2 ? p1color : p2color;

  return (
    <div className="relative min-h-[100dvh] flex flex-col overflow-hidden bg-background">
      <div className="orb-primary" style={{ top: "-25%", right: "-15%", opacity: 0.5 }} />

      {/* Speed round announcement */}
      <AnimatePresence>
        {isSpeedRound && timeLeft === TIMER && (
          <motion.div
            key="speed"
            initial={{ y: -60 }} animate={{ y: 0 }} exit={{ y: -60 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            onAnimationComplete={() => sounds.playAlert()}
            className="fixed top-0 left-0 right-0 z-50 flex items-center justify-center gap-2 py-3 px-4 font-bold text-[13px] text-white"
            style={{ background: "var(--gradient-accent)" }}>
            <Zap size={14} />
            <span className={ar ? "font-arabic" : ""}>{ar ? "⚡ الجولات السريعة بدات! 💀 عندك 20 ثانية" : "⚡ Speed rounds! 💀 20 seconds"}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Timer bar */}
      <div className={`fixed left-0 right-0 z-50 h-[3px] bg-muted/50 ${isSpeedRound && timeLeft === TIMER ? "top-[48px]" : "top-0"}`}>
        <motion.div className="h-full rounded-full"
          style={{ background: timerColor, transformOrigin: "left" }}
          animate={{ scaleX: pct }}
          transition={{ duration: 0.7, ease: "linear" }} />
      </div>

      {/* Header */}
      <div className="relative z-10 pt-safe px-4 md:px-5 flex items-center justify-between mt-1">
        <div className={`flex items-center gap-2 ${isRTL ? "flex-row-reverse" : ""}`}>
          <span className="badge-pill">{ar ? `جولة ${roundNumber}/${totalRounds}` : `Round ${roundNumber}/${totalRounds}`}</span>
          <div className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white"
            style={{ background: myColor }}>
            {playerName[0]?.toUpperCase()}
          </div>
        </div>

        <div className={`flex items-center gap-2 ${isRTL ? "flex-row-reverse" : ""}`}>
          {/* Partner typing indicator */}
          <AnimatePresence>
            {isPartnerTyping && !submitted && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8, x: isRTL ? -8 : 8 }}
                animate={{ opacity: 1, scale: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full ${isRTL ? "flex-row-reverse" : ""}`}
                style={{ background: "hsl(var(--muted))", border: `1px solid ${partnerColor}30` }}>
                <div className="flex gap-0.5">
                  {[0, 1, 2].map(i => (
                    <motion.div key={i} className="w-1 h-1 rounded-full"
                      style={{ background: partnerColor }}
                      animate={{ y: [0, -3, 0], opacity: [0.4, 1, 0.4] }}
                      transition={{ delay: i * 0.15, duration: 0.7, repeat: Infinity, ease: "easeInOut" }} />
                  ))}
                </div>
                <span className="text-[10px] font-medium" style={{ color: partnerColor }}>
                  {ar ? "عم يكتب..." : "typing..."}
                </span>
              </motion.div>
            )}
          </AnimatePresence>

          <motion.span
            key={timeLeft}
            animate={timeLeft <= 10 ? { scale: [1, 1.3, 1] } : {}}
            transition={{ duration: 0.2 }}
            className="font-black tabular-nums"
            style={{ fontFamily: "'JetBrains Mono'", fontSize: 15, color: timerColor }}>
            {isSpeedRound
              ? <>{timeLeft}s</>
              : <>{String(Math.floor(timeLeft / 60)).padStart(2, "0")}:{String(timeLeft % 60).padStart(2, "0")}</>
            }
          </motion.span>
        </div>
      </div>

      {/* Progress bar */}
      <div className={`relative z-10 px-4 md:px-5 mt-2 mb-4 flex gap-1.5 ${isRTL ? "flex-row-reverse" : ""}`}>
        {Array.from({ length: totalRounds }).map((_, i) => (
          <div key={i} className="h-1 flex-1 rounded-full overflow-hidden bg-muted">
            {i < roundNumber - 1
              ? <div className="h-full w-full" style={{ background: "var(--gradient-accent)" }} />
              : i === roundNumber - 1
              ? <motion.div className="h-full" style={{ background: myColor }}
                  initial={{ width: 0 }} animate={{ width: "55%" }} transition={{ duration: 0.7 }} />
              : null}
          </div>
        ))}
      </div>

      <div className="relative z-10 flex-1 flex flex-col px-4 md:px-5 gap-3 max-w-lg mx-auto w-full">
        {/* Question card */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease }}
          className="card-interactive p-4 md:p-5">
          {/* Mood label */}
          {moodInfo && (
            <div className={`flex items-center gap-1.5 mb-3 ${isRTL ? "flex-row-reverse" : ""}`}>
              <span className="text-xl leading-none">{questionMood}</span>
              <span className="text-[11px] font-bold uppercase tracking-[0.1em]"
                style={{ color: moodInfo.color }}>
                {moodInfo.label}
              </span>
            </div>
          )}
          <p className={`text-[17px] font-bold leading-snug text-foreground ${ar ? "font-arabic text-right" : ""}`}
            style={{ fontFamily: ar ? "'Tajawal'" : "'Outfit', sans-serif", letterSpacing: ar ? 0 : "-0.01em" }}
            dir={isRTL ? "rtl" : "ltr"}>
            {question}
          </p>
        </motion.div>

        {/* Answer textarea */}
        <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.14, duration: 0.5, ease }}
          className={`flex-1 card-interactive flex flex-col overflow-hidden transition-all ${focused ? "ring-2 ring-primary/20 border-primary/40" : ""}`}
          style={{ minHeight: 180 }}>
          <textarea
            ref={textareaRef}
            value={answer}
            onChange={handleChange}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            placeholder={ar ? "كتب هنا..." : "Write your answer..."}
            maxLength={500}
            dir={isRTL ? "rtl" : "ltr"}
            className={`flex-1 bg-transparent resize-none outline-none text-[15px] font-medium leading-relaxed text-foreground placeholder:text-muted-foreground/40 p-4 ${ar ? "font-arabic text-right" : ""}`}
          />

          {/* Footer */}
          <div className={`flex items-center justify-between px-4 pb-3 pt-1 border-t border-border/30 ${isRTL ? "flex-row-reverse" : ""}`}>
            {/* Nudge for short answers */}
            <AnimatePresence>
              {nudgeVisible ? (
                <motion.p key="nudge"
                  initial={{ opacity: 0, x: isRTL ? 8 : -8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}
                  className={`text-[11px] font-semibold text-primary ${ar ? "font-arabic" : ""}`}>
                  {ar ? "قول أكثر من هيك 😏" : "Say a bit more 😏"}
                </motion.p>
              ) : (
                <p className={`text-[11px] text-muted-foreground/40 ${ar ? "font-arabic" : ""}`}>
                  {answer.length < MIN_CHARS
                    ? (ar ? `${MIN_CHARS - answer.length} حرف باقيين` : `${MIN_CHARS - answer.length} more chars`)
                    : (ar ? "✓ جاهز" : "✓ ready")}
                </p>
              )}
            </AnimatePresence>

            {/* Arc progress */}
            <div className="flex items-center gap-1.5">
              <svg width="20" height="20" viewBox="0 0 20 20">
                <circle cx="10" cy="10" r="7" fill="none" stroke="hsl(var(--muted))" strokeWidth="2" />
                <circle cx="10" cy="10" r="7" fill="none"
                  stroke={charPct > 0.85 ? "hsl(var(--destructive))" : myColor}
                  strokeWidth="2"
                  strokeDasharray={`${charPct * 44} 44`}
                  strokeLinecap="round"
                  transform="rotate(-90 10 10)"
                  style={{ transition: "stroke-dasharray 0.3s ease" }} />
              </svg>
              <span className="font-mono text-[10px] text-muted-foreground/40">{answer.length}</span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Submit */}
      <div className="relative z-10 px-4 md:px-5 pb-safe pt-3 max-w-lg mx-auto w-full">
        <motion.button
          whileTap={{ scale: 0.97 }} whileHover={{ scale: 1.01 }}
          onClick={handleSubmit}
          disabled={answer.trim().length < 1 || submitted}
          className={`w-full h-[52px] rounded-xl font-bold text-[14px] text-primary-foreground flex items-center justify-center gap-2 shimmer disabled:opacity-35 transition-all ${isRTL ? "flex-row-reverse" : ""}`}
          style={{ background: "var(--gradient-accent)", boxShadow: answer.trim().length >= MIN_CHARS ? "var(--shadow-accent)" : "none" }}>
          <AnimatePresence mode="wait">
            {submitted
              ? <motion.span key="sent" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
                  className={ar ? "font-arabic" : ""}>{ar ? "✓ تصيفط" : "✓ Submitted"}</motion.span>
              : <motion.span key="go" className={`flex items-center gap-2 ${isRTL ? "flex-row-reverse" : ""}`}>
                  <span className={ar ? "font-arabic" : ""}>{ar ? "صيفط الجواب" : "Submit Answer"}</span>
                  <Send size={14} />
                </motion.span>
            }
          </AnimatePresence>
        </motion.button>
        <p className={`text-center text-[11px] text-muted-foreground/40 mt-2 ${ar ? "font-arabic" : ""}`}
          dir={isRTL ? "rtl" : "ltr"}>
          {ar ? `دورك يا ${playerName}` : `Your turn, ${playerName}`}
        </p>
      </div>
    </div>
  );
};

export default AnswerScreen;
