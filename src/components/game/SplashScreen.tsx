import { useEffect } from "react";
import { motion } from "framer-motion";

const WORDMARK = "betweenatna";
const GRADIENT_START = 7;
const ease = [0.22, 1, 0.36, 1];

interface SplashScreenProps {
  onDone: () => void;
}

const SplashScreen = ({ onDone }: SplashScreenProps) => {
  useEffect(() => {
    // Total animation: letters stagger 0–770ms, hold 400ms, fade out
    const t = setTimeout(onDone, 1800);
    return () => clearTimeout(t);
  }, [onDone]);

  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ duration: 0.4, ease }}
      className="fixed inset-0 z-[999] flex flex-col items-center justify-center bg-background overflow-hidden">

      {/* Ambient orbs */}
      <div className="orb-primary" style={{ top: "-20%", right: "-15%" }} />
      <div className="orb-secondary" style={{ bottom: "-20%", left: "-12%" }} />

      <div className="relative z-10 flex flex-col items-center gap-5">
        {/* Wordmark */}
        <div
          className="flex items-end select-none"
          dir="ltr"
          style={{ direction: "ltr" }}>
          {WORDMARK.split("").map((letter, i) => (
            <motion.span
              key={i}
              initial={{ opacity: 0, y: 30, filter: "blur(8px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              transition={{ delay: i * 0.07, duration: 0.55, ease }}
              className="font-black"
              style={{
                fontFamily: "'Outfit', sans-serif",
                fontSize: "clamp(32px, 8vw, 64px)",
                letterSpacing: "-0.05em",
                lineHeight: 1,
                ...(i >= GRADIENT_START
                  ? {
                      background: "var(--gradient-accent)",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                      backgroundClip: "text",
                    }
                  : { color: "hsl(var(--foreground))" }),
              }}>
              {letter}
            </motion.span>
          ))}
        </div>

        {/* Tagline fades in after letters */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.0, duration: 0.5 }}
          className="text-[13px] text-muted-foreground font-medium tracking-wide"
          dir="ltr">
          Answer. Compare. Get roasted.
        </motion.p>

        {/* Loading dots */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.1 }}
          className="flex gap-1.5">
          {[0, 1, 2].map(i => (
            <motion.div
              key={i}
              className="w-1.5 h-1.5 rounded-full"
              style={{ background: "hsl(var(--primary))" }}
              animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1, 0.8] }}
              transition={{ delay: i * 0.18, duration: 1, repeat: Infinity, ease: "easeInOut" }}
            />
          ))}
        </motion.div>
      </div>
    </motion.div>
  );
};

export default SplashScreen;
