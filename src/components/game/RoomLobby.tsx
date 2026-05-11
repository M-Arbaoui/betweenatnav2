import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Zap, Copy, Share2, ArrowRight, ArrowLeft, Check } from "lucide-react";
import PlayerAvatar from "./PlayerAvatar";
import { toast } from "sonner";
import { useLanguage } from "@/i18n/LanguageContext";

interface RoomLobbyProps {
  mode: "create" | "join" | "waiting-for-host";
  roomCode?: string;
  playerName: string;
  partnerName?: string | null;
  onBack?: () => void;
  onStart?: () => void;
  onJoin?: (code: string, name: string) => void;
  initialCode?: string;
}

const ease = [0.25, 0.46, 0.45, 0.94];



const RoomLobby = ({ mode, roomCode, playerName, partnerName, onBack, onStart, onJoin, initialCode }: RoomLobbyProps) => {
  const { lang, isRTL } = useLanguage();
  const ar = lang === "ar";
  const [joinName, setJoinName] = useState("");
  const [codeVal, setCodeVal] = useState(initialCode || "");
  const [copied, setCopied] = useState(false);
  const Arr = isRTL ? ArrowLeft : ArrowRight;
  const Back = isRTL ? ArrowRight : ArrowLeft;

  useEffect(() => { if (initialCode) setCodeVal(initialCode); }, [initialCode]);

  const copyCode = async () => {
    if (!roomCode) return;
    await navigator.clipboard.writeText(roomCode);
    setCopied(true); toast.success(ar ? "تكوبا الكود! ✓" : "Code copied! ✓");
    setTimeout(() => setCopied(false), 2000);
  };

  const copyLink = async () => {
    const url = `${window.location.origin}?join=${roomCode}&invite=${encodeURIComponent(playerName)}`;
    await navigator.clipboard.writeText(url);
    toast.success(ar ? "تكوبا اللينك!" : "Link copied!");
  };

  const shareNative = async () => {
    const url = `${window.location.origin}?join=${roomCode}&invite=${encodeURIComponent(playerName)}`;
    const shareText = ar ? `يلا نلعبو betweenatna! الكود: ${roomCode}` : `Let's play betweenatna! Code: ${roomCode}`;

    // 1. Try native Web Share API (works on mobile)
    if (typeof navigator.share === "function") {
      try {
        await navigator.share({ title: "betweenatna 🔥", text: shareText, url });
        return;
      } catch (e: any) {
        // User cancelled — don't fall through to copy
        if (e?.name === "AbortError") return;
      }
    }

    // 2. Try clipboard API
    if (typeof navigator.clipboard?.writeText === "function") {
      try {
        await navigator.clipboard.writeText(url);
        toast.success(ar ? "تكوبا اللينك! 🔗" : "Link copied! 🔗");
        return;
      } catch {}
    }

    // 3. Fallback: select a hidden input
    try {
      const el = document.createElement("textarea");
      el.value = url;
      el.style.position = "fixed";
      el.style.opacity = "0";
      document.body.appendChild(el);
      el.focus(); el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
      toast.success(ar ? "تكوبا اللينك! 🔗" : "Link copied! 🔗");
    } catch {
      // Last resort: show URL for manual copy
      toast.info(url, { duration: 8000, description: ar ? "انسخ اللينك يدوياً" : "Copy this link manually" });
    }
  };

  const BackBtn = ({ label }: { label: string }) => (
    <motion.button whileTap={{ scale: 0.97 }} onClick={onBack}
      className={`w-full flex items-center justify-center gap-2 text-[13px] text-muted-foreground/60 hover:bg-muted/20 rounded-xl py-2.5 transition-all ${isRTL ? "flex-row-reverse" : ""}`}>
      <Back size={13} /><span className={isRTL ? "font-arabic" : ""}>{label}</span>
    </motion.button>
  );

  /* ── CREATE ── */
  if (mode === "create") return (
    <div className="relative min-h-[100dvh] flex items-center justify-center px-4 overflow-hidden">
      <div className="orb-primary" style={{ top: "-20%", right: "-15%" }} />
      <div className="orb-secondary" style={{ bottom: "-20%", left: "-12%" }} />

      <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease }}
        className="glass-card-elevated rounded-3xl p-6 md:p-8 w-full max-w-md relative z-10">

        {/* Header badge */}
        <div className={`flex items-center gap-2 mb-6 ${isRTL ? "flex-row-reverse" : ""}`}>
          <span className="badge-pill flex items-center gap-1.5">
            <Sparkles size={11} className="text-primary" />
            {ar ? "الغرفة جاهزة" : "Room Ready"}
          </span>
        </div>

        <h2 className={`text-2xl font-black tracking-tight text-foreground mb-5 ${isRTL ? "font-arabic text-right" : ""}`}
          dir={isRTL ? "rtl" : "ltr"}>
          {ar ? "شارك الكود" : "Share the code"}
        </h2>

        {/* Room code boxes */}
        <div className="mb-2">
          <div className={`flex gap-2 justify-center mb-2 ${isRTL ? "flex-row-reverse" : ""}`}>
            {(roomCode || "------").split("").map((char, i) => (
              <motion.div key={i}
                initial={{ rotateX: -90, opacity: 0 }}
                animate={{ rotateX: 0, opacity: 1 }}
                transition={{ delay: i * 0.08, type: "spring", stiffness: 300, damping: 20 }}
                className="w-10 h-12 md:w-12 md:h-14 rounded-xl border border-border/50 bg-muted/30 flex items-center justify-center font-black text-xl md:text-2xl text-foreground"
                style={{ fontFamily: "'JetBrains Mono', monospace", transformOrigin: "center" }}>
                {char}
              </motion.div>
            ))}
          </div>
          <p className={`text-[11px] text-muted-foreground/60 text-center font-medium ${isRTL ? "font-arabic" : ""}`}>
            {ar ? "اضغط لنسخ الكود" : "tap to copy code"}
          </p>
        </div>

        {/* Share grid */}
        <div className="grid grid-cols-2 gap-2.5 mb-5">
          <motion.button whileTap={{ scale: 0.97 }} onClick={copyCode}
            className={`h-11 rounded-xl border border-border/40 text-[13px] font-semibold text-muted-foreground hover:text-foreground hover:bg-muted/20 flex items-center justify-center gap-2 transition-all ${isRTL ? "flex-row-reverse" : ""}`}>
            <AnimatePresence mode="wait">
              {copied
                ? <motion.span key="c" initial={{ scale: 0 }} animate={{ scale: 1 }}><Check size={14} className="text-primary" /></motion.span>
                : <motion.span key="cp" initial={{ scale: 0 }} animate={{ scale: 1 }}><Copy size={14} /></motion.span>
              }
            </AnimatePresence>
            <span className={isRTL ? "font-arabic" : ""}>{ar ? "نسخ الكود" : "Copy Code"}</span>
          </motion.button>
          <motion.button whileTap={{ scale: 0.97 }} onClick={shareNative}
            className={`h-11 rounded-xl border border-border/40 text-[13px] font-semibold text-muted-foreground hover:text-foreground hover:bg-muted/20 flex items-center justify-center gap-2 transition-all ${isRTL ? "flex-row-reverse" : ""}`}>
            <Share2 size={14} />
            <span className={isRTL ? "font-arabic" : ""}>{ar ? "مشاركة" : "Share"}</span>
          </motion.button>
        </div>

        {/* Avatars */}
        <div className="flex items-center justify-center gap-6 py-4 mb-5">
          <PlayerAvatar name={playerName} variant="p1" delay={0.3} />
          <div className="flex flex-col items-center gap-1">
            <div className="h-px w-10 bg-gradient-to-r from-primary/40 to-secondary/40" />
            <span className="text-[10px] text-muted-foreground/50 font-mono uppercase tracking-widest">vs</span>
            <div className="h-px w-10 bg-gradient-to-r from-secondary/40 to-primary/40" />
          </div>
          {partnerName
            ? <PlayerAvatar name={partnerName} variant="p2" delay={0.4} />
            : <PlayerAvatar name="" variant="empty" delay={0.4} />
          }
        </div>

        {/* Start CTA */}
        <AnimatePresence>
          {partnerName && (
            <motion.button
              initial={{ opacity: 0, y: 12, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ type: "spring", stiffness: 200, damping: 18 }}
              whileTap={{ scale: 0.97 }} whileHover={{ scale: 1.02 }}
              onClick={onStart}
              className={`w-full h-[52px] rounded-xl font-bold text-sm text-primary-foreground flex items-center justify-center gap-2 shimmer mb-3 ${isRTL ? "flex-row-reverse" : ""}`}
              style={{ background: "var(--gradient-accent)", boxShadow: "var(--shadow-accent)" }}>
              <span className={isRTL ? "font-arabic" : ""}>{ar ? "يلا نبداو 🔥" : "Let's Start 🔥"}</span>
              <Arr size={16} />
            </motion.button>
          )}
        </AnimatePresence>

        <BackBtn label={ar ? "رجع" : "go back"} />
      </motion.div>
    </div>
  );

  /* ── WAITING FOR HOST ── */
  if (mode === "waiting-for-host") return (
    <div className="relative min-h-[100dvh] flex items-center justify-center px-4 overflow-hidden">
      <div className="orb-primary" style={{ top: "-20%", right: "-15%" }} />
      <div className="orb-secondary" style={{ bottom: "-20%", left: "-12%" }} />

      <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease }}
        className="glass-card-elevated rounded-3xl p-6 md:p-8 w-full max-w-md relative z-10 text-center">

        <span className="badge-pill inline-flex mb-6">{ar ? "في انتظار المضيف" : "Waiting for host"}</span>

        <div className="flex items-center justify-center gap-6 py-5 mb-5">
          {partnerName && <PlayerAvatar name={partnerName} variant="p1" delay={0} />}
          <div className="flex gap-1.5">
            {[0,1,2].map(i => (
              <div key={i} className="w-2 h-2 rounded-full bg-primary/60 pulse-dot" style={{ animationDelay: `${i * 0.2}s` }} />
            ))}
          </div>
          <PlayerAvatar name="" variant="empty" />
        </div>

        <h2 className={`text-xl font-black tracking-tight text-foreground mb-2 ${isRTL ? "font-arabic" : ""}`}
          dir={isRTL ? "rtl" : "ltr"}>
          {ar ? `كنتسناو ${partnerName || "المضيف"}...` : `Waiting for ${partnerName || "host"}...`}
        </h2>
        <p className={`text-[15px] text-muted-foreground mb-6 ${isRTL ? "font-arabic" : ""}`}>
          {ar ? "اللعبة غادي تبدا قريباً" : "The game will start soon"}
        </p>

        <div className="bg-muted/30 border border-border/40 rounded-2xl p-4 mb-5">
          <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground mb-2">{ar ? "الغرفة" : "room code"}</p>
          <p className="font-black text-2xl text-foreground" style={{ fontFamily: "'JetBrains Mono'", letterSpacing: "0.15em" }}>{roomCode}</p>
        </div>

        <BackBtn label={ar ? "خروج" : "leave room"} />
      </motion.div>
    </div>
  );

  /* ── JOIN ── */
  return (
    <div className="relative min-h-[100dvh] flex items-center justify-center px-4 overflow-hidden">
      <div className="orb-primary" style={{ top: "-20%", right: "-15%" }} />
      <div className="orb-secondary" style={{ bottom: "-20%", left: "-12%" }} />

      <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease }}
        className="glass-card-elevated rounded-3xl p-6 md:p-8 w-full max-w-sm relative z-10">

        <div className={`flex items-center gap-2 mb-6 ${isRTL ? "flex-row-reverse" : ""}`}>
          <span className="badge-pill flex items-center gap-1.5">
            <Zap size={11} className="text-primary" />
            {ar ? "دخل غرفة" : "Join Room"}
          </span>
        </div>

        <h2 className={`text-2xl font-black tracking-tight text-foreground mb-5 ${isRTL ? "font-arabic text-right" : ""}`}
          dir={isRTL ? "rtl" : "ltr"}>
          {ar ? "دخل للعبة" : "Jump in"}
        </h2>

        <div className="space-y-4 mb-6">
          <div>
            <label className={`block text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground mb-2 ${isRTL ? "text-right" : ""}`}>
              {ar ? "سميتك" : "Your name"}
            </label>
            <input type="text" value={joinName} onChange={e => setJoinName(e.target.value)}
              placeholder={ar ? "سميتك..." : "Your name..."}
              maxLength={20} dir={isRTL ? "rtl" : "ltr"}
              className={`w-full h-12 rounded-xl px-4 text-[15px] font-medium bg-muted/20 border border-input focus:border-primary/40 focus:ring-1 focus:ring-primary/20 outline-none transition-all text-foreground placeholder:text-muted-foreground/60 ${isRTL ? "font-arabic text-right" : ""}`} />
          </div>
          <div>
            <label className={`block text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground mb-2 ${isRTL ? "text-right" : ""}`}>
              {ar ? "كود الغرفة" : "Room code"}
            </label>
            <input type="text" value={codeVal}
              onChange={e => setCodeVal(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ""))}
              onKeyDown={e => e.key === "Enter" && onJoin?.(codeVal.trim(), joinName.trim())}
              placeholder="XXXXXX" maxLength={6}
              className="w-full h-14 rounded-xl px-4 text-2xl font-black text-center tracking-[0.4em] bg-muted/20 border border-input focus:border-primary/40 focus:ring-1 focus:ring-primary/20 outline-none transition-all text-foreground placeholder:text-muted-foreground/30"
              style={{ fontFamily: "'JetBrains Mono', monospace" }} />
          </div>
        </div>

        <div className="space-y-3">
          <motion.button whileTap={{ scale: 0.97 }} whileHover={{ scale: 1.02 }}
            onClick={() => onJoin?.(codeVal.trim(), joinName.trim())}
            disabled={codeVal.trim().length < 4 || joinName.trim().length < 2}
            className={`w-full h-[52px] rounded-xl font-bold text-sm text-primary-foreground flex items-center justify-center gap-2 shimmer disabled:opacity-40 transition-all ${isRTL ? "flex-row-reverse" : ""}`}
            style={{ background: "var(--gradient-accent)", boxShadow: "var(--shadow-accent)" }}>
            <span className={isRTL ? "font-arabic" : ""}>{ar ? "دخل" : "Join"}</span>
            <Arr size={16} />
          </motion.button>
          <BackBtn label={ar ? "رجع" : "go back"} />
        </div>
      </motion.div>
    </div>
  );
};

export default RoomLobby;
