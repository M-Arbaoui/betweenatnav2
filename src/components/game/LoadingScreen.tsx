import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertCircle, RefreshCw } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";
import type { RejoinStep } from "@/hooks/useGameRoom";

const LINES_AR = [
  "كنحضرو السؤال... 🎲",
  "كنحلل الأجوبة... 🔍",
  "كنصاوب التقرير... 📋",
  "الحقيقة كتطلع دابا... 😬",
  "واحد فيكم مش صادق 👀",
];
const LINES_EN = [
  "Preparing the question... 🎲",
  "Analysing your answers... 🔍",
  "Building the report... 📋",
  "Truth incoming... 😬",
  "One of you is definitely lying 👀",
];

const REJOIN_STEPS_AR = [
  { key: "checking", label: "كنشوفو الجلسة..." },
  { key: "room",     label: "كنرجعو للغرفة..." },
  { key: "results",  label: "كنحملو نتائج الجولة..." },
  { key: "answers",  label: "كنحملو الأجوبة..." },
  { key: "done",     label: "راه كمل ✓" },
];
const REJOIN_STEPS_EN = [
  { key: "checking", label: "Checking session..." },
  { key: "room",     label: "Restoring room..." },
  { key: "results",  label: "Loading round results..." },
  { key: "answers",  label: "Loading answers..." },
  { key: "done",     label: "Done ✓" },
];

interface LoadingScreenProps {
  message?: string;
  isRejoining?: boolean;
  rejoinStep?: RejoinStep;
  rejoinError?: "not_found" | "finished" | "name_mismatch" | "unknown" | null;
  onRetry?: () => void;
  onStartFresh?: () => void;
}

// Wordmark split — "between" in foreground, "atna" in gradient
const WORDMARK_PARTS = [
  { text: "between", gradient: false },
  { text: "atna",    gradient: true  },
];

const LoadingScreen = ({ message, isRejoining, rejoinStep, rejoinError, onRetry, onStartFresh }: LoadingScreenProps) => {
  const { lang, isRTL } = useLanguage();
  const [idx, setIdx] = useState(0);
  const lines = lang === "ar" ? LINES_AR : LINES_EN;
  const rejoinSteps = lang === "ar" ? REJOIN_STEPS_AR : REJOIN_STEPS_EN;
  const stepOrder: RejoinStep[] = ["checking", "room", "results", "answers", "done"];
  const currentStepIdx = rejoinStep ? stepOrder.indexOf(rejoinStep) : 0;

  useEffect(() => {
    if (isRejoining || rejoinError) return;
    const t = setInterval(() => setIdx(i => (i + 1) % lines.length), 2600);
    return () => clearInterval(t);
  }, [lines.length, isRejoining, rejoinError]);

  const errorMessages: Record<string, { title: string; sub: string }> = {
    not_found: {
      title: lang === "ar" ? "ما لقيناش الغرفة 😕" : "Room not found 😕",
      sub:   lang === "ar" ? "الغرفة ما زالت موجودة أو انتهت مدتها" : "The room no longer exists or has expired",
    },
    finished: {
      title: lang === "ar" ? "اللعبة خلصات 🏁" : "Game already finished 🏁",
      sub:   lang === "ar" ? "هاد الجلسة خلصات — ابدا لعبة جديدة" : "This session ended — start a new game",
    },
    name_mismatch: {
      title: lang === "ar" ? "الاسم ما تطابقش ⚠️" : "Name mismatch ⚠️",
      sub:   lang === "ar" ? "الاسم المحفوظ ما تطابقش مع الغرفة" : "Your saved name no longer matches the room",
    },
    unknown: {
      title: lang === "ar" ? "وقعت مشكلة 😤" : "Something went wrong 😤",
      sub:   lang === "ar" ? "ماشي مزيان — حاول مرة أخرى" : "Something went wrong — please try again",
    },
  };

  const err = rejoinError ? errorMessages[rejoinError] : null;

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 0.95, filter: "blur(8px)" }}
      transition={{ duration: 0.4 }}
      className="fixed inset-0 flex flex-col items-center justify-center z-50 bg-background overflow-hidden">

      <div className="orb-primary" style={{ top: "-20%", right: "-15%" }} />
      <div className="orb-secondary" style={{ bottom: "-20%", left: "-12%" }} />

      <div className="relative z-10 flex flex-col items-center gap-6 w-full max-w-sm px-6">

        {/* Wordmark — always LTR, always Latin */}
        <div
          className="flex items-end select-none"
          dir="ltr"
          style={{ direction: "ltr", unicodeBidi: "bidi-override" }}>
          {WORDMARK_PARTS.map((part) =>
            part.text.split("").map((letter, li) => {
              // Global index for stagger
              const globalIdx = part.gradient
                ? 7 + li  // "atna" starts at index 7
                : li;
              return (
                <motion.span
                  key={`${part.text}-${li}`}
                  animate={rejoinError ? {} : {
                    y: [0, -8, 0],
                    opacity: [0.4, 1, 0.4],
                  }}
                  transition={{
                    delay: globalIdx * 0.07,
                    duration: 1.2,
                    repeat: rejoinError ? 0 : Infinity,
                    ease: "easeInOut",
                  }}
                  className="font-black"
                  style={{
                    fontFamily: "'Outfit', sans-serif",
                    fontSize: "1.4rem",
                    letterSpacing: "-0.04em",
                    lineHeight: 1,
                    ...(part.gradient
                      ? { background: "var(--gradient-accent)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }
                      : { color: "hsl(var(--foreground))" }),
                  }}>
                  {letter}
                </motion.span>
              );
            })
          )}
        </div>

        {/* Content: error | rejoin steps | normal loading */}
        <AnimatePresence mode="wait">

          {/* ERROR */}
          {rejoinError && err && (
            <motion.div key="error"
              initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="w-full glass-card-elevated rounded-2xl p-5 text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-destructive/10 border border-destructive/20 flex items-center justify-center mx-auto">
                <AlertCircle size={22} className="text-destructive" />
              </div>
              <div>
                <h3 className={`font-black text-lg text-foreground mb-1 ${isRTL ? "font-arabic" : ""}`}
                  dir={isRTL ? "rtl" : "ltr"}>{err.title}</h3>
                <p className={`text-[13px] text-muted-foreground leading-relaxed ${isRTL ? "font-arabic" : ""}`}
                  dir={isRTL ? "rtl" : "ltr"}>{err.sub}</p>
              </div>
              <div className="space-y-2.5">
                {onRetry && (
                  <motion.button whileTap={{ scale: 0.97 }} onClick={onRetry}
                    className="w-full h-11 rounded-xl font-bold text-sm text-primary-foreground flex items-center justify-center gap-2 shimmer"
                    style={{ background: "var(--gradient-accent)", boxShadow: "var(--shadow-accent)" }}>
                    <RefreshCw size={14} />
                    <span className={isRTL ? "font-arabic" : ""}>{lang === "ar" ? "حاول مرة أخرى" : "Try again"}</span>
                  </motion.button>
                )}
                {onStartFresh && (
                  <button onClick={onStartFresh}
                    className="w-full h-10 rounded-xl text-[13px] text-muted-foreground/70 hover:text-foreground hover:bg-muted/20 transition-all font-medium">
                    <span className={isRTL ? "font-arabic" : ""}>{lang === "ar" ? "ابدا من جديد" : "Start fresh"}</span>
                  </button>
                )}
              </div>
            </motion.div>
          )}

          {/* REJOIN STEPS */}
          {!rejoinError && isRejoining && (
            <motion.div key="rejoin"
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="w-full glass-card-elevated rounded-2xl p-5 space-y-3">
              <p className={`text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground mb-4 ${isRTL ? "text-right font-arabic" : ""}`}>
                {lang === "ar" ? "جاري الاستعادة..." : "Restoring session..."}
              </p>
              {rejoinSteps.map((step, i) => {
                const isDone   = i < currentStepIdx;
                const isActive = i === currentStepIdx;
                const isPend   = i > currentStepIdx;
                return (
                  <motion.div key={step.key}
                    initial={{ opacity: 0, x: isRTL ? 10 : -10 }}
                    animate={{ opacity: isPend ? 0.3 : 1, x: 0 }}
                    transition={{ delay: i * 0.08 }}
                    className={`flex items-center gap-3 ${isRTL ? "flex-row-reverse" : ""}`}>
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 transition-all ${
                      isDone   ? "bg-primary text-primary-foreground" :
                      isActive ? "border-2 border-primary" :
                                 "border border-border/50"
                    }`}>
                      {isDone
                        ? <span className="text-[10px] font-bold">✓</span>
                        : isActive
                        ? <motion.div className="w-2 h-2 rounded-full bg-primary"
                            animate={{ scale: [1, 1.4, 1] }} transition={{ duration: 0.8, repeat: Infinity }} />
                        : <div className="w-1.5 h-1.5 rounded-full bg-border/50" />
                      }
                    </div>
                    <span className={`text-[13px] font-medium ${isActive ? "text-foreground" : "text-muted-foreground"} ${isRTL ? "font-arabic" : ""}`}>
                      {step.label}
                    </span>
                  </motion.div>
                );
              })}
            </motion.div>
          )}

          {/* NORMAL LOADING */}
          {!rejoinError && !isRejoining && (
            <motion.div key="normal"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="flex flex-col items-center gap-4">
              <div className="h-6 flex items-center overflow-hidden px-2">
                <AnimatePresence mode="wait">
                  <motion.p key={message || idx}
                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                    className={`text-[15px] font-medium text-muted-foreground text-center ${isRTL ? "font-arabic" : ""}`}
                    dir={isRTL ? "rtl" : "ltr"}>
                    {message || lines[idx]}
                  </motion.p>
                </AnimatePresence>
              </div>
              <div className="w-48 h-0.5 bg-muted rounded-full overflow-hidden">
                <motion.div className="h-full rounded-full"
                  style={{ background: "var(--gradient-accent)" }}
                  animate={{ x: ["-100%", "100%"] }}
                  transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }} />
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default LoadingScreen;
