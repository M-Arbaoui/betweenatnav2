import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, ArrowLeft, HelpCircle, X } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";

interface WelcomeScreenProps {
  onCreateRoom: (name: string) => void;
  onJoinRoom: () => void;
}

const WORDMARK = "betweenatna";
const GRADIENT_START = 7;
const ease = [0.22, 1, 0.36, 1];

const T = {
  ar: {
    ready: "يلا نبداو",
    howTo: "كيفاش كنلعبو؟",
    subline: "دخل سميتك وابدا اللعبة.",
    nameLabel: "سميتك",
    namePlaceholder: "...",
    createBtn: "صاوب غرفة",
    or: "أو",
    joinBtn: "عندي كود ديال غرفة",
    howTitle: "كيفاش كنلعبو؟",
    howSteps: [
      "صاوب غرفة وعطي الكود لصاحبك",
      "جاوبو على 10 أسئلة — كل واحد وحدو، بلا ما يشوف الآخر",
      "فالآخر، الأجوبة كتبان والحكم كيجي بلا رحمة",
    ],
    gotIt: "فهمت، يلا نبداو 🔥",
  },
  en: {
    ready: "Let's go",
    howTo: "How to play?",
    subline: "Enter your name and start the game.",
    nameLabel: "Your name",
    namePlaceholder: "What do they call you?",
    createBtn: "Create a room",
    or: "or",
    joinBtn: "I have a room code",
    howTitle: "How to play",
    howSteps: [
      "Create a room and share the code with your person",
      "Answer 10 questions independently — no peeking at each other",
      "Answers are revealed and the verdict comes with no mercy",
    ],
    gotIt: "Got it, let's go 🔥",
  },
};

const WelcomeScreen = ({ onCreateRoom, onJoinRoom }: WelcomeScreenProps) => {
  const [name, setName] = useState("");
  const [howOpen, setHowOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const { lang, isRTL } = useLanguage();
  const t = T[lang as keyof typeof T] || T.en;
  const Arr = isRTL ? ArrowLeft : ArrowRight;
  const dir = isRTL ? "rtl" : "ltr";
  const arabicClass = isRTL ? "font-arabic" : "";

  const submit = () => { if (name.trim().length >= 2) onCreateRoom(name.trim()); };

  return (
    <div className="relative min-h-[100dvh] flex flex-col md:flex-row overflow-hidden">
      <div className="orb-primary" style={{ top: "-15%", right: "-10%" }} />
      <div className="orb-secondary" style={{ bottom: "-15%", left: "-8%" }} />

      {/* ── LEFT: Brand ── */}
      <div className="relative z-10 flex flex-col items-center justify-center flex-1 px-6 pt-safe pb-6 md:pb-0 md:px-14 md:min-h-[100dvh]">
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
          <div className="w-72 h-72 rounded-full"
            style={{ background: "radial-gradient(circle, hsl(345 82% 52% / 0.10) 0%, transparent 65%)", filter: "blur(48px)" }} />
        </div>

        {/* Wordmark — always LTR always English */}
        <motion.div className="relative z-10 flex items-end mb-5 select-none"
          dir="ltr" style={{ direction: "ltr" }}
          initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          {WORDMARK.split("").map((l, i) => (
            <motion.span key={i}
              initial={{ opacity: 0, y: 28, filter: "blur(6px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              transition={{ delay: i * 0.065, duration: 0.55, ease }}
              className="font-black"
              style={{
                fontFamily: "'Outfit', sans-serif",
                fontSize: "clamp(36px, 7vw, 72px)",
                letterSpacing: "-0.05em",
                lineHeight: 1,
                ...(i >= GRADIENT_START
                  ? { background: "var(--gradient-accent)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }
                  : { color: "hsl(var(--foreground))" }),
              }}>
              {l}
            </motion.span>
          ))}
        </motion.div>

        {/* Tagline — always English */}
        <motion.p
          initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.85, duration: 0.5, ease }}
          className="relative z-10 text-[14px] text-muted-foreground font-medium tracking-wide"
          dir="ltr">
          Answer. Compare. Get roasted.
        </motion.p>
      </div>

      {/* ── RIGHT: Form ── */}
      <div className="relative z-10 flex items-center justify-center flex-1 px-4 pb-safe md:min-h-[100dvh] md:px-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.5, ease }}
          className="glass-card-elevated rounded-3xl p-6 md:p-8 w-full max-w-sm">

          {/* Header row */}
          <div className={`flex items-center justify-between mb-5 ${isRTL ? "flex-row-reverse" : ""}`}>
            <span className={`text-[15px] font-bold text-foreground ${arabicClass}`}>{t.ready}</span>
            <button onClick={() => setHowOpen(true)}
              className={`flex items-center gap-1.5 text-[12px] font-semibold text-muted-foreground hover:text-foreground transition-colors ${arabicClass} ${isRTL ? "flex-row-reverse" : ""}`}>
              <HelpCircle size={14} className="text-primary" />
              {t.howTo}
            </button>
          </div>

          <p className={`text-[14px] text-muted-foreground mb-6 leading-relaxed ${arabicClass} ${isRTL ? "text-right" : ""}`} dir={dir}>
            {t.subline}
          </p>

          {/* Name input */}
          <div className="space-y-2 mb-5">
            <label className={`block text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground ${arabicClass} ${isRTL ? "text-right" : ""}`}>
              {t.nameLabel}
            </label>
            <input
              ref={inputRef}
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              onKeyDown={e => e.key === "Enter" && submit()}
              placeholder={t.namePlaceholder}
              maxLength={20}
              dir={dir}
              autoFocus
              className={`w-full h-12 rounded-xl px-4 text-[15px] font-semibold bg-muted/30 border border-input focus:border-primary/50 focus:ring-2 focus:ring-primary/15 outline-none transition-all text-foreground placeholder:text-muted-foreground/30 ${arabicClass} ${isRTL ? "text-right" : ""}`}
            />
          </div>

          {/* CTAs */}
          <div className="space-y-2.5">
            <motion.button whileTap={{ scale: 0.97 }} whileHover={{ scale: 1.01 }}
              onClick={submit}
              disabled={name.trim().length < 2}
              className={`w-full h-[52px] rounded-xl font-bold text-[14px] text-primary-foreground flex items-center justify-center gap-2 shimmer disabled:opacity-35 transition-all ${arabicClass} ${isRTL ? "flex-row-reverse" : ""}`}
              style={{ background: "var(--gradient-accent)", boxShadow: name.trim().length >= 2 ? "var(--shadow-accent)" : "none" }}>
              <Arr size={15} />
              {t.createBtn}
            </motion.button>

            <div className="relative flex items-center gap-3">
              <div className="flex-1 h-px bg-border/50" />
              <span className={`text-[11px] font-medium text-muted-foreground/50 shrink-0 ${arabicClass}`}>{t.or}</span>
              <div className="flex-1 h-px bg-border/50" />
            </div>

            <motion.button whileTap={{ scale: 0.97 }} onClick={onJoinRoom}
              className={`w-full h-11 rounded-xl font-semibold text-[13px] text-muted-foreground border border-border/50 hover:border-border hover:text-foreground hover:bg-muted/20 transition-all ${arabicClass}`}>
              {t.joinBtn}
            </motion.button>
          </div>

          <p className="text-center text-[11px] text-muted-foreground/40 mt-5">
            Made by{" "}
            <a href="https://instagram.com/arbw_13" target="_blank" rel="noopener noreferrer"
              className="hover:text-muted-foreground transition-colors underline underline-offset-2">
              Mohammed
            </a>
          </p>
        </motion.div>
      </div>

      {/* ── How to play overlay ── */}
      <AnimatePresence>
        {howOpen && (
          <>
            <motion.div key="bd"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-40 bg-background/60 backdrop-blur-sm"
              onClick={() => setHowOpen(false)} />

            <motion.div key="card"
              initial={{ opacity: 0, scale: 0.92, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 20 }}
              transition={{ duration: 0.3, ease }}
              className="fixed z-50 left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[calc(100%-2rem)] max-w-sm glass-card-elevated rounded-3xl p-6">

              <div className={`flex items-center justify-between mb-5 ${isRTL ? "flex-row-reverse" : ""}`}>
                <h3 className={`text-[17px] font-black text-foreground ${arabicClass}`}>{t.howTitle}</h3>
                <button onClick={() => setHowOpen(false)}
                  className="w-8 h-8 rounded-xl flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/30 transition-colors">
                  <X size={15} />
                </button>
              </div>

              <div className="space-y-4" dir={dir}>
                {t.howSteps.map((step, i) => (
                  <motion.div key={i}
                    initial={{ opacity: 0, x: isRTL ? 12 : -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.05 + i * 0.07, ease }}
                    className={`flex items-start gap-3 ${isRTL ? "flex-row-reverse" : ""}`}>
                    <div className="w-7 h-7 rounded-xl flex items-center justify-center text-[11px] font-black flex-shrink-0 mt-0.5 text-white"
                      style={{ background: "var(--gradient-accent)" }}>
                      {i + 1}
                    </div>
                    <p className={`flex-1 text-[14px] font-medium text-foreground leading-relaxed ${arabicClass} ${isRTL ? "text-right" : ""}`}>
                      {step}
                    </p>
                  </motion.div>
                ))}
              </div>

              <motion.button whileTap={{ scale: 0.97 }}
                onClick={() => setHowOpen(false)}
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.35 }}
                className={`w-full h-11 rounded-xl font-bold text-[13px] text-primary-foreground mt-6 shimmer ${arabicClass}`}
                style={{ background: "var(--gradient-accent)" }}>
                {t.gotIt}
              </motion.button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default WelcomeScreen;
