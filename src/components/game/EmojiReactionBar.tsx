import { motion } from "framer-motion";
import { useSoundEffects } from "@/hooks/useSoundEffects";

interface EmojiReactionBarProps {
  onSend: (emoji: string) => void;
}

const EMOJIS = ["😂", "🔥", "💀", "😍", "🥰", "😱", "🤡", "💅"];

const EmojiReactionBar = ({ onSend }: EmojiReactionBarProps) => {
  const { playTap } = useSoundEffects();

  const handleTap = (emoji: string) => {
    playTap();
    onSend(emoji);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 flex items-center gap-1.5 bg-card/80 backdrop-blur-xl border border-border/40 rounded-full px-3 py-2 shadow-lg"
    >
      {EMOJIS.map((emoji) => (
        <motion.button
          key={emoji}
          whileTap={{ scale: 1.4 }}
          whileHover={{ scale: 1.15 }}
          onClick={() => handleTap(emoji)}
          className="text-xl w-9 h-9 flex items-center justify-center rounded-full hover:bg-muted/30 transition-colors active:bg-muted/50"
        >
          {emoji}
        </motion.button>
      ))}
    </motion.div>
  );
};

export default EmojiReactionBar;
