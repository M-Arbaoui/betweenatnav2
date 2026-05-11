import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sun, Moon, Globe } from "lucide-react";

const ThemeSelector = () => {
  const [isDark, setIsDark] = useState(() => {
    const s = localStorage.getItem("btna-theme");
    return s ? s === "dark" : window.matchMedia("(prefers-color-scheme: dark)").matches;
  });
  const [flashing, setFlashing] = useState(false);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDark);
    localStorage.setItem("btna-theme", isDark ? "dark" : "light");
  }, [isDark]);

  const toggle = () => {
    setFlashing(true);
    setTimeout(() => { setIsDark(p => !p); setFlashing(false); }, 200);
  };

  return (
    <>
      {/* Cinematic flash */}
      <AnimatePresence>
        {flashing && (
          <motion.div className="fixed inset-0 z-[100] pointer-events-none"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            style={{ background: "radial-gradient(circle, rgba(255,255,255,0.15), transparent)" }} />
        )}
      </AnimatePresence>

      <motion.button whileTap={{ scale: 0.88 }} onClick={toggle}
        className="fixed bottom-5 left-5 z-50 w-9 h-9 rounded-full border border-border/50 flex items-center justify-center bg-card/80 backdrop-blur-sm shadow-sm transition-colors hover:border-border"
        aria-label="Toggle theme">
        <AnimatePresence mode="wait">
          {isDark
            ? <motion.div key="sun" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.18 }}>
                <Sun size={14} className="text-muted-foreground" />
              </motion.div>
            : <motion.div key="moon" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.18 }}>
                <Moon size={14} className="text-muted-foreground" />
              </motion.div>
          }
        </AnimatePresence>
      </motion.button>
    </>
  );
};

export default ThemeSelector;
