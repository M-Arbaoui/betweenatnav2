import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";

interface EmojiReactionProps {
  emoji: string;
  trigger: boolean;
  count?: number;
}

const EmojiReaction = ({ emoji, trigger, count = 8 }: EmojiReactionProps) => {
  const [particles, setParticles] = useState<{ id: number; x: number; y: number }[]>([]);

  useEffect(() => {
    if (trigger) {
      const newParticles = Array.from({ length: count }, (_, i) => ({
        id: Date.now() + i,
        x: (Math.random() - 0.5) * 200,
        y: -(Math.random() * 200 + 100),
      }));
      setParticles(newParticles);
      const timer = setTimeout(() => setParticles([]), 2000);
      return () => clearTimeout(timer);
    }
  }, [trigger, count]);

  return (
    <div className="fixed inset-0 pointer-events-none flex items-center justify-center z-50">
      <AnimatePresence>
        {particles.map((p) => (
          <motion.div
            key={p.id}
            className="absolute text-3xl"
            initial={{ opacity: 1, x: 0, y: 0, scale: 0.5 }}
            animate={{ opacity: 0, x: p.x, y: p.y, scale: 1.5, rotate: Math.random() * 360 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.5, ease: "easeOut" }}
          >
            {emoji}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

export default EmojiReaction;
