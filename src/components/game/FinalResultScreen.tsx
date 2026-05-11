import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { RefreshCw, Share2, ChevronDown, ChevronUp, Trophy, Download } from "lucide-react";
import confetti from "canvas-confetti";
import { useLanguage } from "@/i18n/LanguageContext";
import { useSoundEffects } from "@/hooks/useSoundEffects";
import type { FinalResult, RoundResult } from "@/types/game";

interface Props {
  player1Name: string; player2Name: string;
  result: FinalResult; allRoundResults: RoundResult[];
  onRestart: () => void;
}

const ease = [0.25, 0.46, 0.45, 0.94];

// Animated counter with dramatic pause before landing
const DramaticCounter = ({ value, onComplete }: { value: number; onComplete?: () => void }) => {
  const [displayed, setDisplayed] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    let current = 0;
    const pauseAt = Math.max(value - 8, 0);
    const step = 16;
    const fast = value / (1000 / step);
    const slow = 1;

    const timer = setInterval(() => {
      if (paused) return;
      if (current >= pauseAt && !paused && value > 10) {
        setPaused(true);
        setTimeout(() => {
          setPaused(false);
          // slow tick to final value
          let c = current;
          const fin = setInterval(() => {
            c += slow;
            setDisplayed(Math.min(c, value));
            if (c >= value) { clearInterval(fin); onComplete?.(); }
          }, 120);
        }, 900);
        clearInterval(timer);
        return;
      }
      current += fast;
      if (current >= value) {
        setDisplayed(value);
        clearInterval(timer);
        if (value <= 10) onComplete?.();
      } else {
        setDisplayed(Math.floor(current));
      }
    }, step);
    return () => clearInterval(timer);
  }, [value]);

  return <>{displayed}</>;
};

// Pure SVG/Canvas share card — no html2canvas
const generateShareCard = (
  p1: string, p2: string, score: number, title: string,
  awards: { name: string; winner: string; emoji: string }[],
  scoreColor: string
): string => {
  const w = 800, h = 450;
  const canvas = document.createElement("canvas");
  canvas.width = w; canvas.height = h;
  const ctx = canvas.getContext("2d")!;

  // Background
  const bg = ctx.createLinearGradient(0, 0, w, h);
  bg.addColorStop(0, "#1a0a1e");
  bg.addColorStop(0.5, "#0d0d1a");
  bg.addColorStop(1, "#120818");
  ctx.fillStyle = bg;
  ctx.roundRect(0, 0, w, h, 24);
  ctx.fill();

  // Gradient orb top-right
  const orb = ctx.createRadialGradient(w * 0.85, h * 0.1, 0, w * 0.85, h * 0.1, 220);
  orb.addColorStop(0, "rgba(200,80,150,0.18)");
  orb.addColorStop(1, "transparent");
  ctx.fillStyle = orb;
  ctx.fillRect(0, 0, w, h);

  // Orb bottom-left
  const orb2 = ctx.createRadialGradient(w * 0.12, h * 0.9, 0, w * 0.12, h * 0.9, 180);
  orb2.addColorStop(0, "rgba(120,60,200,0.14)");
  orb2.addColorStop(1, "transparent");
  ctx.fillStyle = orb2;
  ctx.fillRect(0, 0, w, h);

  // Branding
  ctx.font = "bold 12px monospace";
  ctx.fillStyle = "rgba(255,255,255,0.2)";
  ctx.fillText("betweenatna", 36, 44);

  // Names
  ctx.font = "bold 20px system-ui, sans-serif";
  ctx.fillStyle = "rgba(255,255,255,0.9)";
  ctx.fillText(`${p1}  ×  ${p2}`, 36, 88);

  // Score gradient text
  const scoreGrad = ctx.createLinearGradient(36, 100, 36 + 300, 220);
  scoreGrad.addColorStop(0, "#e03367");
  scoreGrad.addColorStop(1, "#9b3dd6");
  ctx.font = "900 110px system-ui, sans-serif";
  ctx.fillStyle = scoreGrad;
  ctx.fillText(`${score}%`, 36, 220);

  // Title
  ctx.font = "600 18px system-ui, sans-serif";
  ctx.fillStyle = "rgba(255,255,255,0.75)";
  ctx.fillText(title, 36, 256);

  // Divider
  ctx.beginPath();
  ctx.moveTo(36, 276); ctx.lineTo(w - 36, 276);
  ctx.strokeStyle = "rgba(255,255,255,0.08)"; ctx.lineWidth = 1;
  ctx.stroke();

  // Awards (up to 3)
  const topAwards = (awards || []).slice(0, 3);
  topAwards.forEach((a, i) => {
    const y = 296 + i * 38;
    ctx.font = "500 14px system-ui, sans-serif";
    ctx.fillStyle = "rgba(255,255,255,0.65)";
    ctx.fillText(`${a.emoji}  ${a.name}`, 36, y + 14);
    ctx.font = "700 13px monospace";
    ctx.fillStyle = "#c084fc";
    const tw = ctx.measureText(a.winner).width;
    ctx.fillText(a.winner, w - 36 - tw, y + 14);
  });

  // Footer
  ctx.font = "400 11px monospace";
  ctx.fillStyle = "rgba(255,255,255,0.15)";
  ctx.fillText("betweenatna.lovable.app", 36, h - 20);

  return canvas.toDataURL("image/png");
};

const FinalResultScreen = ({ player1Name, player2Name, result, allRoundResults, onRestart }: Props) => {
  const [showHistory, setShowHistory] = useState(false);
  const [phase, setPhase] = useState(0);
  const [sharing, setSharing] = useState(false);
  const { lang, isRTL } = useLanguage();
  const ar = lang === "ar";
  const sounds = useSoundEffects();
  const confettiFired = useRef(false);

  const scoreColor = result.finalScore >= 70 ? "#22c55e"
    : result.finalScore >= 45 ? "hsl(345,82%,52%)"
    : "hsl(0,72%,51%)";


  useEffect(() => {
    // Sequence: score → boom → confetti → awards → advice
    sounds.playFinalBoom();
    const t1 = setTimeout(() => setPhase(1), 1800);
    const t2 = setTimeout(() => setPhase(2), 2600);
    return () => [t1, t2].forEach(clearTimeout);
  }, []);

  const fireConfetti = () => {
    if (confettiFired.current) return;
    confettiFired.current = true;
    sounds.playConfetti();
    const opts = { colors: ["#e03367", "#9b3dd6", "#a855f7", "#ec4899", "#c084fc"], spread: 90, origin: { y: 0.6 } };
    confetti({ ...opts, particleCount: 80, angle: 60, origin: { x: 0.1, y: 0.6 } });
    confetti({ ...opts, particleCount: 80, angle: 120, origin: { x: 0.9, y: 0.6 } });
    setTimeout(() => confetti({ ...opts, particleCount: 40, angle: 90, origin: { y: 0.5 } }), 400);
  };

  const handleShare = async () => {
    setSharing(true);
    try {
      const dataUrl = generateShareCard(
        player1Name, player2Name, result.finalScore, result.title,
        result.awards, scoreColor
      );
      const blob = await (await fetch(dataUrl)).blob();
      const file = new File([blob], "betweenatna-result.png", { type: "image/png" });

      if (navigator.share && navigator.canShare({ files: [file] })) {
        await navigator.share({ files: [file], title: "betweenatna 🔥" });
      } else {
        const a = document.createElement("a");
        a.href = dataUrl;
        a.download = `betweenatna-${player1Name}-${player2Name}.png`;
        a.click();
      }
    } catch {} finally { setSharing(false); }
  };

  return (
    <div className="relative min-h-[100dvh] flex flex-col overflow-y-auto bg-background">
      <div className="orb-primary" style={{ top: "-20%", right: "-15%" }} />
      <div className="orb-secondary" style={{ bottom: "-20%", left: "-12%" }} />

      <div className="relative z-10 pt-safe px-4 md:px-5 mb-4">
        <div className={`flex items-center gap-2 ${isRTL ? "flex-row-reverse" : ""}`}>
          <Trophy size={18} className="text-primary" />
          <h1 className={`text-2xl font-black tracking-tight text-foreground ${ar ? "font-arabic" : ""}`}>
            {ar ? "النتائج النهائية" : "Final Results"}
          </h1>
        </div>
      </div>

      <div className="relative z-10 px-4 md:px-5 pb-10 space-y-3.5 max-w-2xl mx-auto w-full">

        {/* 1 — Score (dramatic entrance) */}
        <motion.div initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, type: "spring", stiffness: 140, damping: 14 }}
          className="card-interactive p-6 text-center border-gradient"
          style={{ background: "var(--gradient-subtle)" }}>
          <div className={`flex items-center justify-center gap-2 mb-3 ${isRTL ? "flex-row-reverse" : ""}`}>
            <span className="font-black text-foreground">{player1Name}</span>
            <span className="text-primary font-mono">×</span>
            <span className="font-black text-foreground">{player2Name}</span>
          </div>
          <div className="font-black score-display mb-2"
            style={{ fontSize: "clamp(72px,16vw,108px)", color: scoreColor, lineHeight: 1 }}>
            <DramaticCounter
              value={result.finalScore}
              onComplete={fireConfetti}
            />%
          </div>
          <p className={`text-[15px] font-bold text-foreground/80 ${ar ? "font-arabic" : ""}`}
            dir={isRTL ? "rtl" : "ltr"}>
            {result.title}
          </p>
        </motion.div>

        {/* 2 — Summary */}
        <AnimatePresence>
          {phase >= 1 && result.summary && (
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease }}
              className="card-interactive p-5">
              <p className={`text-[15px] font-medium leading-relaxed text-foreground ${ar ? "font-arabic text-right" : ""}`}
                dir={isRTL ? "rtl" : "ltr"}>{result.summary}</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 3 — Awards */}
        <AnimatePresence>
          {phase >= 1 && result.awards?.length > 0 && (
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.5, ease }}
              className="space-y-2">
              <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground px-0.5">
                {ar ? "الجوائز" : "Awards"}
              </p>
              {result.awards.map((award: any, i: number) => (
                <motion.div key={i}
                  initial={{ opacity: 0, x: i % 2 === 0 ? -20 : 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.15 + i * 0.07, duration: 0.4, ease }}
                  className={`card-interactive p-4 flex items-center gap-3 ${isRTL ? "flex-row-reverse" : ""}`}>
                  <span className="text-2xl flex-shrink-0">{award.emoji}</span>
                  <span className={`flex-1 text-[13px] font-bold text-foreground ${ar ? "font-arabic" : ""}`}>{award.name}</span>
                  <span className="text-[12px] font-bold text-gradient-accent">{award.winner}</span>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* 4 — Advice */}
        <AnimatePresence>
          {phase >= 2 && result.advice && (
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease }}
              className="card-interactive p-5 border-gradient">
              <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground mb-3">
                {ar ? "ملاحظة" : "Note"}
              </p>
              <p className={`text-[15px] font-medium leading-relaxed text-foreground ${ar ? "font-arabic text-right" : ""}`}
                dir={isRTL ? "rtl" : "ltr"}>{result.advice}</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 5 — Round history */}
        <AnimatePresence>
          {phase >= 2 && allRoundResults.length > 0 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }}>
              <button onClick={() => setShowHistory(!showHistory)}
                className={`w-full card-interactive p-4 flex items-center justify-between font-semibold text-[13px] text-muted-foreground hover:text-foreground transition-colors ${isRTL ? "flex-row-reverse" : ""}`}>
                <span className={ar ? "font-arabic" : ""}>{ar ? `كل الجولات (${num(allRoundResults.length)})` : `All Rounds (${allRoundResults.length})`}</span>
                {showHistory ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
              </button>
              <AnimatePresence>
                {showHistory && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }} className="overflow-hidden mt-2 space-y-2">
                    {allRoundResults.map((r, i) => (
                      <div key={i} className="card-interactive p-3.5">
                        <div className={`flex items-center justify-between mb-1.5 ${isRTL ? "flex-row-reverse" : ""}`}>
                          <span className="font-mono text-[11px] text-muted-foreground">{ar ? `جولة ${num(i+1)}` : `Round ${i+1}`}</span>
                          <span className="font-bold text-[12px]"
                            style={{ color: r.compatibilityScore >= 60 ? "hsl(var(--primary))" : "hsl(var(--destructive))" }}>
                            {r.compatibilityScore}%
                          </span>
                        </div>
                        <p className={`text-[12px] text-muted-foreground leading-relaxed ${ar ? "font-arabic text-right" : ""}`}
                          dir={isRTL ? "rtl" : "ltr"}>{r.question}</p>
                      </div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 6 — Actions */}
        <AnimatePresence>
          {phase >= 2 && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <motion.button whileTap={{ scale: 0.97 }} onClick={handleShare} disabled={sharing}
                  className={`h-12 rounded-xl font-bold text-sm text-primary-foreground flex items-center justify-center gap-2 shimmer disabled:opacity-50 ${isRTL ? "flex-row-reverse" : ""}`}
                  style={{ background: "var(--gradient-accent)", boxShadow: "var(--shadow-accent)" }}>
                  <Share2 size={14} />
                  <span className={ar ? "font-arabic" : ""}>{sharing ? "..." : (ar ? "شارك" : "Share")}</span>
                </motion.button>
                <motion.button whileTap={{ scale: 0.97 }} onClick={onRestart}
                  className={`h-12 rounded-xl font-semibold text-[13px] border border-border/50 text-muted-foreground hover:text-foreground hover:bg-muted/20 flex items-center justify-center gap-2 transition-all ${isRTL ? "flex-row-reverse" : ""}`}>
                  <RefreshCw size={13} />
                  <span className={ar ? "font-arabic" : ""}>{ar ? "نعاودو" : "Play again"}</span>
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
};

export default FinalResultScreen;
