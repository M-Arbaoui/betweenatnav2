import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "@/i18n/LanguageContext";
import { usePartnerTyping } from "@/hooks/useTypingIndicator";

interface WaitingForPartnerScreenProps {
  playerName: string;
  partnerName: string;
  playerNumber: 1 | 2;
  roomId?: string;
  roundNumber: number;
  totalRounds: number;
}

const WaitingForPartnerScreen = ({
  playerName, partnerName, playerNumber, roomId, roundNumber, totalRounds,
}: WaitingForPartnerScreenProps) => {
  const { lang, isRTL } = useLanguage();
  const ar = lang === "ar";
  const isPartnerTyping = usePartnerTyping(roomId, playerNumber);

  const p1color = "hsl(var(--primary))";
  const p2color = "hsl(var(--secondary))";
  const partnerColor = playerNumber === 1 ? p2color : p1color;
  const myColor = playerNumber === 1 ? p1color : p2color;

  return (
    <div className="relative min-h-[100dvh] flex flex-col items-center justify-center overflow-hidden bg-background px-5">
      <div className="orb-primary" style={{ top: "-20%", right: "-15%", opacity: 0.5 }} />
      <div className="orb-secondary" style={{ bottom: "-20%", left: "-12%", opacity: 0.4 }} />

      <div className="relative z-10 w-full max-w-sm space-y-6">

        {/* Round badge */}
        <div className="flex justify-center">
          <span className="badge-pill">
            {ar ? `جولة ${roundNumber}/${totalRounds}` : `Round ${roundNumber}/${totalRounds}`}
          </span>
        </div>

        {/* Avatar duel */}
        <div className={`flex items-center justify-center gap-6 ${isRTL ? "flex-row-reverse" : ""}`}>
          {/* Me — answered */}
          <div className="flex flex-col items-center gap-2">
            <div className="w-14 h-14 rounded-full flex items-center justify-center text-lg font-bold text-white relative"
              style={{ background: myColor, boxShadow: `0 0 0 3px ${myColor}30` }}>
              {playerName[0]?.toUpperCase()}
              {/* Checkmark overlay */}
              <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-green-500 flex items-center justify-center"
                style={{ border: "2px solid hsl(var(--background))" }}>
                <span className="text-[9px] font-black text-white">✓</span>
              </div>
            </div>
            <span className="text-[12px] font-semibold text-foreground/70 max-w-[80px] text-center truncate">{playerName}</span>
          </div>

          {/* VS */}
          <div className="flex flex-col items-center gap-1">
            <div className="h-px w-8 bg-border/50" />
            <span className="text-[10px] font-mono text-muted-foreground/40 uppercase tracking-wider">vs</span>
            <div className="h-px w-8 bg-border/50" />
          </div>

          {/* Partner — typing indicator */}
          <div className="flex flex-col items-center gap-2">
            <div className="w-14 h-14 rounded-full flex items-center justify-center text-lg font-bold text-white relative"
              style={{
                background: partnerColor,
                boxShadow: isPartnerTyping ? `0 0 0 4px ${partnerColor}35, 0 0 20px ${partnerColor}20` : `0 0 0 2px ${partnerColor}20`,
                transition: "box-shadow 0.4s ease",
              }}>
              {partnerName[0]?.toUpperCase()}
            </div>
            <span className="text-[12px] font-semibold text-foreground/70 max-w-[80px] text-center truncate">{partnerName}</span>
          </div>
        </div>

        {/* Status card */}
        <div className="glass-card-elevated rounded-2xl p-5 text-center space-y-3">
          <AnimatePresence mode="wait">
            {isPartnerTyping ? (
              <motion.div key="typing"
                initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.25 }}
                className="space-y-3">
                <div className="flex items-center justify-center gap-2">
                  <div className="flex gap-1">
                    {[0, 1, 2].map(i => (
                      <motion.div key={i} className="w-2 h-2 rounded-full"
                        style={{ background: partnerColor }}
                        animate={{ y: [0, -5, 0], opacity: [0.4, 1, 0.4] }}
                        transition={{ delay: i * 0.15, duration: 0.7, repeat: Infinity, ease: "easeInOut" }} />
                    ))}
                  </div>
                </div>
                <p className={`text-[15px] font-bold text-foreground ${ar ? "font-arabic" : ""}`}
                  dir={isRTL ? "rtl" : "ltr"}>
                  {ar ? `${partnerName} عم يكتب...` : `${partnerName} is typing...`}
                </p>
                <p className={`text-[12px] text-muted-foreground ${ar ? "font-arabic" : ""}`}
                  dir={isRTL ? "rtl" : "ltr"}>
                  {ar ? "هيا يقدر يكون مثيراً 👀" : "This might be interesting 👀"}
                </p>
              </motion.div>
            ) : (
              <motion.div key="waiting"
                initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.25 }}
                className="space-y-2">
                <motion.p
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                  className={`text-[15px] font-bold text-foreground ${ar ? "font-arabic" : ""}`}
                  dir={isRTL ? "rtl" : "ltr"}>
                  {ar ? `كنتسناو ${partnerName}...` : `Waiting for ${partnerName}...`}
                </motion.p>
                <p className={`text-[12px] text-muted-foreground ${ar ? "font-arabic" : ""}`}
                  dir={isRTL ? "rtl" : "ltr"}>
                  {ar ? "جوابك تصيفط ✓" : "Your answer is in ✓"}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Fun fact while waiting */}
        <motion.p
          initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          transition={{ delay: 3, duration: 1 }}
          className={`text-center text-[11px] text-muted-foreground/40 leading-relaxed ${ar ? "font-arabic" : ""}`}
          dir={isRTL ? "rtl" : "ltr"}>
          {ar
            ? "الأجوبة سرية — ما تشوف جواب صاحبك حتى كيجيو الاثنين"
            : "Answers are sealed until both are submitted"}
        </motion.p>
      </div>
    </div>
  );
};

export default WaitingForPartnerScreen;
