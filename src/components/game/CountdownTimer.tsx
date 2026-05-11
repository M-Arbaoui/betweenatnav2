import { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";
import { useSoundEffects } from "@/hooks/useSoundEffects";

interface CountdownTimerProps {
  seconds: number;
  onTimeUp: () => void;
  paused?: boolean;
}

const CountdownTimer = ({ seconds, onTimeUp, paused = false }: CountdownTimerProps) => {
  const [remaining, setRemaining] = useState(seconds);
  const { playTick, playUrgent } = useSoundEffects();
  const calledRef = useRef(false);

  useEffect(() => {
    if (paused) return;
    if (remaining <= 0) {
      if (!calledRef.current) {
        calledRef.current = true;
        playUrgent();
        onTimeUp();
      }
      return;
    }
    const timer = setInterval(() => {
      setRemaining((prev) => {
        const next = prev - 1;
        if (next <= 10 && next > 0) playTick();
        return next;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [remaining, paused, onTimeUp, playTick, playUrgent]);

  const progress = (remaining / seconds) * 100;
  const isLow = remaining <= 10;
  const mins = Math.floor(remaining / 60);
  const secs = remaining % 60;

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-md"
    >
      <div className="flex items-center gap-3">
        <div className="flex-1 h-1.5 bg-muted/25 rounded-full overflow-hidden">
          <motion.div
            className={`h-full rounded-full transition-colors duration-300 ${
              isLow ? "bg-destructive" : "bg-gradient-accent"
            }`}
            initial={{ width: "100%" }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
        <motion.span
          animate={isLow ? { scale: [1, 1.15, 1], opacity: [1, 0.7, 1] } : {}}
          transition={isLow ? { duration: 0.8, repeat: Infinity } : {}}
          className={`font-mono text-xs font-bold tabular-nums min-w-[2.5rem] text-right ${
            isLow ? "text-destructive" : "text-muted-foreground/50"
          }`}
        >
          {mins}:{secs.toString().padStart(2, "0")}
        </motion.span>
      </div>
    </motion.div>
  );
};

export default CountdownTimer;
