import { motion } from "framer-motion";
import { getAvatar, getDisplayName } from "@/lib/nameUtils";
import { useLanguage } from "@/i18n/LanguageContext";

interface PlayerAvatarProps {
  name: string;
  variant?: "p1" | "p2" | "empty";
  size?: "sm" | "md" | "lg";
  delay?: number;
  showName?: boolean;
}

const SIZES = { sm: 36, md: 52, lg: 64 };
const FONT_SIZES = { sm: "1.1rem", md: "1.4rem", lg: "1.8rem" };

const PlayerAvatar = ({ name, variant = "p1", size = "md", delay = 0, showName = true }: PlayerAvatarProps) => {
  const { lang } = useLanguage();
  const { emoji, color } = getAvatar(name);
  const displayName = getDisplayName(name, lang);
  const px = SIZES[size];

  return (
    <motion.div
      initial={{ scale: 0, rotate: -20 }} animate={{ scale: 1, rotate: 0 }}
      transition={{ delay, type: "spring", stiffness: 200, damping: 15 }}
      className="flex flex-col items-center gap-2">
      <div
        className="rounded-full flex items-center justify-center flex-shrink-0 relative overflow-hidden"
        style={{
          width: px, height: px,
          background: variant === "empty"
            ? "hsl(var(--muted))"
            : variant === "p1"
            ? "linear-gradient(135deg, hsl(345 82% 56%), hsl(345 82% 40%))"
            : "linear-gradient(135deg, hsl(270 65% 58%), hsl(270 65% 40%))",
          boxShadow: variant !== "empty" ? `0 4px 16px ${color}40` : "none",
        }}>
        {variant === "empty" ? (
          <div className="flex gap-0.5">
            {[0,1,2].map(i => (
              <div key={i} className="w-1 h-1 rounded-full bg-muted-foreground/40 pulse-dot"
                style={{ animationDelay: `${i * 0.2}s` }} />
            ))}
          </div>
        ) : (
          <span style={{ fontSize: FONT_SIZES[size], lineHeight: 1 }}>{emoji}</span>
        )}
      </div>
      {showName && variant !== "empty" && (
        <span
          className="text-[12px] font-bold truncate max-w-[80px] text-center text-muted-foreground"
          dir={/[\u0600-\u06FF]/.test(displayName) ? "rtl" : "ltr"}
          style={{ fontFamily: /[\u0600-\u06FF]/.test(displayName) ? "'Tajawal', sans-serif" : "'Outfit', sans-serif" }}>
          {displayName}
        </span>
      )}
    </motion.div>
  );
};

export default PlayerAvatar;
