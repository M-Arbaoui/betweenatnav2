import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, ArrowLeft, RefreshCw, Check } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";

interface TruthOrDareScreenProps {
  loserName: string;
  winnerName: string;
  compatibilityScore: number;
  roundNumber: number;
  onComplete: () => void;
}

// Escalating dare pools — soft (rounds 1-3), medium (4-6), hard (7-10)
const DARES_AR_SOFT = [
  "قلد شخصية مشهورة بصوتها لمدة جملتين",
  "اعمل صوت حيوان من اختيار {winner}",
  "خد صورة بوجه مضحك وخليها صورة واتساب ديالك 10 دقائق",
  "ابعث 'أنا خايب/ة' لآخر شخص في محادثاتك",
  "غن 30 ثانية من أي أغنية بصوت عالي",
];
const DARES_AR_MED = [
  "ابعث لآخر شخص كلمتو رسالة: 'كنت حق' — بلا تشرح",
  "قول لصاحبك اللي قدامك نقطة ضعفك الكبرى — بصدق",
  "اعترف بأكبر كذبة قلتيها هذا الأسبوع",
  "قول اسم الشخص اللي تخاف يقرأ محادثاتك",
  "ارسل صورة selfie غير photoshop لأقرب صاحب/ة ليك",
];
const DARES_AR_HARD = [
  "قول لـ {winner} أصعب حاجة عندك تقولها ليه/لها — دابا، بلا ما تفكر",
  "قول للشخص اللي معك شيء كنت تفكر فيه بس ما قلتيهوش أبداً",
  "قول بصدق — واش سبق ليك تكذب على هذا الشخص؟ فشنو بالضبط؟",
  "ابعث رسالة صوتية لشخص ما كلمتيهوش بزاف — ومن ليك السبب",
  "اعترف بشيء عملتيه وتتمنى {winner} ما يعرفوش أبداً",
];
const DARES_AR = [...DARES_AR_SOFT, ...DARES_AR_MED, ...DARES_AR_HARD];

const TRUTHS_AR = [
  "أصعب شيء واجهتو هذا الشهر — الحقيقة مش الرواية الاجتماعية",
  "آخر مرة بكيت وعلاش؟",
  "شنو اللي تتمنى يعرفه {winner} عليك بدون ما تخبره/ها؟",
  "شنو أكثر قرار ندمت عليه في حياتك؟",
  "واش عندك سر ما قلتيه لحتى واحد؟ قوله دابا",
  "شنو اللي تحكم فيه الناس من غير ما تقول؟",
  "من آخر شخص أزعل منك؟ وعلاش؟",
  "واش سبق ليك تتظاهر بشيء ما كنتيش تحس به؟",
];

const DARES_EN = [
  "Text the last person you spoke to: 'You were right' — no explanation",
  "Tell {winner} the one thing you find hardest to admit",
  "Take a genuinely ugly selfie and set it as your WhatsApp pic for 10 minutes",
  "Confess the biggest lie you told this week",
  "Tell the person in front of you something you've always thought but never said",
  "Name the person whose texts you'd be most embarrassed to show right now",
  "Do a voice impression of a celebrity chosen by {winner}",
  "Send 'I was wrong about everything' to the last person you argued with",
  "Honestly — have you ever lied to this person? About what?",
];

const TRUTHS_EN = [
  "What's the hardest thing you dealt with this month — real answer, not the social version",
  "When was the last time you cried and why?",
  "What do you wish {winner} knew about you without you having to say it?",
  "What decision do you most regret?",
  "Do you have a secret nobody knows? Say it now.",
  "What do you silently judge people for?",
];

const ease = [0.22, 1, 0.36, 1];

const TruthOrDareScreen = ({ loserName, winnerName, compatibilityScore, roundNumber, onComplete }: TruthOrDareScreenProps) => {
  const { lang, isRTL } = useLanguage();
  const ar = lang === "ar";
  const Arr = isRTL ? ArrowLeft : ArrowRight;

  const [mode, setMode] = useState<"choose" | "truth" | "dare" | "done">("choose");
  const [currentChallenge, setCurrentChallenge] = useState("");
  const [rerolls, setRerolls] = useState(2);

  const getChallenge = (type: "truth" | "dare") => {
    let pool: string[];
    if (type === "dare") {
      if (ar) {
        pool = roundNumber <= 3 ? DARES_AR_SOFT
             : roundNumber <= 6 ? DARES_AR_MED
             : DARES_AR_HARD;
      } else {
        pool = roundNumber <= 3 ? DARES_EN.slice(0, 3)
             : roundNumber <= 6 ? DARES_EN.slice(3, 6)
             : DARES_EN.slice(6);
        if (pool.length === 0) pool = DARES_EN;
      }
    } else {
      pool = ar ? TRUTHS_AR : TRUTHS_EN;
    }
    const raw = pool[Math.floor(Math.random() * pool.length)];
    return raw.replace("{winner}", winnerName);
  };

  const pick = (type: "truth" | "dare") => {
    setMode(type);
    setCurrentChallenge(getChallenge(type));
  };

  const reroll = () => {
    if (rerolls <= 0) return;
    setCurrentChallenge(getChallenge(mode as "truth" | "dare"));
    setRerolls(r => r - 1);
  };

  // score color
  const scoreColor = "hsl(var(--destructive))";

  return (
    <div className="relative min-h-[100dvh] flex flex-col items-center justify-center overflow-hidden bg-background px-4">
      <div className="orb-primary" style={{ top: "-20%", right: "-15%", opacity: 0.6 }} />
      <div className="orb-secondary" style={{ bottom: "-20%", left: "-12%", opacity: 0.5 }} />

      <div className="relative z-10 w-full max-w-sm space-y-4">

        <AnimatePresence mode="wait">

          {/* CHOOSE */}
          {mode === "choose" && (
            <motion.div key="choose"
              initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }} transition={{ duration: 0.45, ease }}
              className="space-y-4">

              {/* Header */}
              <div className="text-center space-y-2">
                <motion.div
                  animate={{ rotate: [0, -3, 3, -3, 0] }}
                  transition={{ delay: 0.3, duration: 0.6 }}
                  className="text-4xl mb-2">🎰</motion.div>
                <h2 className={`text-2xl font-black tracking-tight ${ar ? "font-arabic" : ""}`}
                  style={{ color: scoreColor }}
                  dir={isRTL ? "rtl" : "ltr"}>
                  {ar ? `${loserName} خسر!` : `${loserName} lost!`}
                </h2>
                <p className={`text-[15px] text-muted-foreground ${ar ? "font-arabic" : ""}`}
                  dir={isRTL ? "rtl" : "ltr"}>
                  {ar
                    ? `${compatibilityScore}% — ${ar ? "هذا الحال يستاهل تحدي. اختار:" : "Time for a challenge. Choose:"}`
                    : `${compatibilityScore}% compatibility — that calls for a challenge. Choose:`}
                </p>
              </div>

              {/* Loser badge */}
              <div className="card-interactive p-4 text-center"
                style={{ borderColor: "hsl(var(--destructive) / 0.3)", background: "hsl(var(--destructive) / 0.04)" }}>
                <p className="text-[11px] font-mono uppercase tracking-widest text-muted-foreground mb-1">
                  {ar ? "المتحدي" : "challenger"}
                </p>
                <p className="text-xl font-black text-foreground">{loserName}</p>
                <p className="text-[11px] text-muted-foreground mt-1">
                  {ar ? `الجولة ${roundNumber} · ${compatibilityScore}%` : `Round ${roundNumber} · ${compatibilityScore}%`}
                </p>
              </div>

              {/* Truth / Dare buttons */}
              <div className="grid grid-cols-2 gap-3">
                <motion.button whileTap={{ scale: 0.96 }} whileHover={{ scale: 1.02 }}
                  onClick={() => pick("truth")}
                  className="h-[80px] rounded-2xl flex flex-col items-center justify-center gap-1.5 font-bold text-[15px] border-2 transition-all"
                  style={{
                    background: "hsl(var(--card))",
                    borderColor: "hsl(270 65% 50% / 0.5)",
                    color: "hsl(270 65% 50%)",
                  }}>
                  <span className="text-2xl">🧠</span>
                  <span className={ar ? "font-arabic text-[14px]" : ""}>{ar ? "صدق" : "Truth"}</span>
                </motion.button>

                <motion.button whileTap={{ scale: 0.96 }} whileHover={{ scale: 1.02 }}
                  onClick={() => pick("dare")}
                  className="h-[80px] rounded-2xl flex flex-col items-center justify-center gap-1.5 font-bold text-[15px] border-2 transition-all"
                  style={{
                    background: "hsl(var(--card))",
                    borderColor: "hsl(345 82% 52% / 0.5)",
                    color: "hsl(345 82% 52%)",
                  }}>
                  <span className="text-2xl">🎯</span>
                  <span className={ar ? "font-arabic text-[14px]" : ""}>{ar ? "جرأة" : "Dare"}</span>
                </motion.button>
              </div>

              {/* Skip */}
              <button onClick={onComplete}
                className="w-full text-[13px] text-muted-foreground/50 hover:text-muted-foreground transition-colors py-2">
                <span className={ar ? "font-arabic" : ""}>{ar ? "تخطى — مش شجاع بزاف 😂" : "Skip — too scared 😂"}</span>
              </button>
            </motion.div>
          )}

          {/* CHALLENGE CARD */}
          {(mode === "truth" || mode === "dare") && (
            <motion.div key="challenge"
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.45, ease }}
              className="space-y-4">

              {/* Type badge */}
              <div className="flex items-center justify-center gap-2">
                <span className="text-xl">{mode === "truth" ? "🧠" : "🎯"}</span>
                <span className="badge-pill" style={{
                  color: mode === "truth" ? "hsl(270 65% 55%)" : "hsl(345 82% 55%)",
                  borderColor: mode === "truth" ? "hsl(270 65% 55% / 0.3)" : "hsl(345 82% 55% / 0.3)",
                  background: mode === "truth" ? "hsl(270 65% 55% / 0.08)" : "hsl(345 82% 55% / 0.08)",
                }}>
                  {mode === "truth" ? (ar ? "صدق" : "Truth") : (ar ? "جرأة" : "Dare")}
                </span>
              </div>

              {/* Challenge text */}
              <motion.div
                key={currentChallenge}
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                className="card-interactive p-6 text-center"
                style={{
                  borderColor: mode === "truth" ? "hsl(270 65% 50% / 0.3)" : "hsl(345 82% 52% / 0.3)",
                  background: mode === "truth" ? "hsl(270 65% 50% / 0.04)" : "hsl(345 82% 52% / 0.04)",
                }}>
                <p className="text-[11px] font-mono uppercase tracking-widest text-muted-foreground mb-4">
                  {ar ? `يا ${loserName}...` : `${loserName}...`}
                </p>
                <p className={`text-[17px] font-bold leading-relaxed text-foreground ${ar ? "font-arabic" : ""}`}
                  dir={isRTL ? "rtl" : "ltr"}>
                  {currentChallenge}
                </p>
              </motion.div>

              {/* Reroll */}
              {rerolls > 0 && (
                <button onClick={reroll}
                  className={`w-full flex items-center justify-center gap-2 text-[13px] text-muted-foreground/60 hover:text-muted-foreground transition-colors py-1.5 ${isRTL ? "flex-row-reverse" : ""}`}>
                  <RefreshCw size={13} />
                  <span className={ar ? "font-arabic" : ""}>
                    {ar ? `تبديل (${rerolls} باقي)` : `Reroll (${rerolls} left)`}
                  </span>
                </button>
              )}

              {/* Done */}
              <motion.button whileTap={{ scale: 0.97 }} whileHover={{ scale: 1.02 }}
                onClick={onComplete}
                className={`w-full h-[52px] rounded-xl font-bold text-sm text-primary-foreground flex items-center justify-center gap-2 shimmer ${isRTL ? "flex-row-reverse" : ""}`}
                style={{ background: "var(--gradient-accent)", boxShadow: "var(--shadow-accent)" }}>
                <Check size={16} />
                <span className={ar ? "font-arabic" : ""}>{ar ? "خلصت التحدي ✓" : "Challenge complete ✓"}</span>
              </motion.button>

              {/* Back */}
              <button onClick={() => { setMode("choose"); setRerolls(2); }}
                className="w-full text-[13px] text-muted-foreground/50 hover:text-muted-foreground transition-colors py-1">
                <span className={ar ? "font-arabic" : ""}>{ar ? "رجع للاختيار" : "back to choose"}</span>
              </button>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  );
};

export default TruthOrDareScreen;
