import { motion, AnimatePresence } from "framer-motion";
import { WifiOff, Wifi } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";
import { useOfflineDetection } from "@/hooks/useOfflineDetection";

const OfflineBanner = () => {
  const { isOffline, wasOffline } = useOfflineDetection();
  const { lang, isRTL } = useLanguage();
  const ar = lang === "ar";

  return (
    <AnimatePresence>
      {isOffline && (
        <motion.div
          key="offline"
          initial={{ y: -48, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -48, opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 28 }}
          className={`fixed top-0 left-0 right-0 z-[200] flex items-center justify-center gap-2 py-2 px-4 text-[12px] font-semibold ${isRTL ? "flex-row-reverse" : ""}`}
          style={{ background: "hsl(var(--destructive))", color: "white" }}>
          <WifiOff size={13} />
          <span className={ar ? "font-arabic" : ""}>{ar ? "انقطع الاتصال — كنحاولو نرجعو..." : "Connection lost — reconnecting..."}</span>
        </motion.div>
      )}
      {!isOffline && wasOffline && (
        <motion.div
          key="back"
          initial={{ y: -48, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -48, opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 28 }}
          onAnimationComplete={() => setTimeout(() => {}, 2500)}
          className={`fixed top-0 left-0 right-0 z-[200] flex items-center justify-center gap-2 py-2 px-4 text-[12px] font-semibold ${isRTL ? "flex-row-reverse" : ""}`}
          style={{ background: "#22c55e", color: "white" }}>
          <Wifi size={13} />
          <span className={ar ? "font-arabic" : ""}>{ar ? "رجع الاتصال ✓" : "Connection restored ✓"}</span>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default OfflineBanner;
