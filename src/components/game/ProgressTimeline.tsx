import { motion } from "framer-motion";

interface ProgressTimelineProps {
  currentRound: number;
  totalRounds: number;
  scores?: number[]; // compatibility scores per completed round
}

const ProgressTimeline = ({ currentRound, totalRounds, scores = [] }: ProgressTimelineProps) => {
  const getColor = (score: number) => {
    if (score >= 75) return "bg-emerald-500";
    if (score >= 50) return "bg-amber-500";
    return "bg-destructive";
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center gap-1 px-2"
    >
      {Array.from({ length: totalRounds }, (_, i) => {
        const roundNum = i + 1;
        const isCompleted = roundNum < currentRound;
        const isCurrent = roundNum === currentRound;
        const score = scores[i];

        return (
          <div key={i} className="flex items-center">
            <motion.div
              initial={isCurrent ? { scale: 0 } : {}}
              animate={isCurrent ? { scale: [1, 1.3, 1] } : { scale: 1 }}
              transition={isCurrent ? { duration: 1.5, repeat: Infinity, ease: "easeInOut" } : { duration: 0.3 }}
              className={`rounded-full transition-all duration-300 ${
                isCurrent
                  ? "w-2.5 h-2.5 bg-gradient-accent ring-2 ring-primary/20"
                  : isCompleted
                  ? `w-2 h-2 ${score !== undefined ? getColor(score) : "bg-primary/60"}`
                  : "w-1.5 h-1.5 bg-muted-foreground/15"
              }`}
              title={isCompleted && score !== undefined ? `${score}%` : undefined}
            />
            {i < totalRounds - 1 && (
              <div
                className={`w-1.5 h-px mx-0.5 transition-colors duration-300 ${
                  roundNum < currentRound ? "bg-primary/30" : "bg-muted-foreground/10"
                }`}
              />
            )}
          </div>
        );
      })}
    </motion.div>
  );
};

export default ProgressTimeline;
