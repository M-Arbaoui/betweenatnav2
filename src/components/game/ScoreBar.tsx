import { motion } from "framer-motion";

interface ScoreBarProps {
  label: string;
  score: number;
  variant?: "primary" | "secondary";
  delay?: number;
}

const ScoreBar = ({ label, score, variant = "primary", delay = 0 }: ScoreBarProps) => {
  const color = variant === "primary" ? "hsl(var(--primary))" : "hsl(var(--secondary))";
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <span className="text-[12px] font-semibold text-muted-foreground">{label}</span>
        <span className="text-[12px] font-bold font-mono" style={{ color }}>{score}</span>
      </div>
      <div className="h-1.5 rounded-full overflow-hidden bg-muted">
        <motion.div className="h-full rounded-full"
          initial={{ width: 0 }} animate={{ width: `${score}%` }}
          transition={{ delay, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          style={{ background: color }} />
      </div>
    </div>
  );
};

export default ScoreBar;
