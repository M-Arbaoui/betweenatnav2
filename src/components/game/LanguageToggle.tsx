import { motion } from "framer-motion";
import { useLanguage } from "@/i18n/LanguageContext";

const LanguageToggle = () => {
  const { lang, setLang } = useLanguage();
  return (
    <motion.button whileTap={{ scale: 0.88 }}
      onClick={() => setLang(lang === "ar" ? "en" : "ar")}
      className="fixed bottom-5 right-5 z-50 h-9 px-3.5 rounded-full border border-border/50 bg-card/80 backdrop-blur-sm text-[11px] font-bold text-muted-foreground hover:text-foreground transition-colors shadow-sm"
      style={{ fontFamily: "'JetBrains Mono', monospace", letterSpacing: "0.08em" }}>
      {lang === "ar" ? "EN" : "عر"}
    </motion.button>
  );
};

export default LanguageToggle;
