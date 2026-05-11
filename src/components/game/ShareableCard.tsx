import { useRef, useState } from "react";
import { motion } from "framer-motion";
import { Download, Share2 } from "lucide-react";
import html2canvas from "html2canvas";
import { useLanguage } from "@/i18n/LanguageContext";
import type { FinalResult } from "@/types/game";

interface ShareableCardProps {
  player1Name: string;
  player2Name: string;
  result: FinalResult;
}

const ShareableCard = ({ player1Name, player2Name, result }: ShareableCardProps) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [generating, setGenerating] = useState(false);
  const { t, isRTL } = useLanguage();

  const generateImage = async () => {
    if (!cardRef.current) return;
    setGenerating(true);
    try {
      const canvas = await html2canvas(cardRef.current, { backgroundColor: null, scale: 2, useCORS: true });
      const url = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.download = `betweenatna-${player1Name}-${player2Name}.png`;
      link.href = url;
      link.click();
    } catch {} finally { setGenerating(false); }
  };

  const handleShare = async () => {
    if (!cardRef.current) return;
    setGenerating(true);
    try {
      const canvas = await html2canvas(cardRef.current, { backgroundColor: null, scale: 2, useCORS: true });
      canvas.toBlob(async (blob) => {
        if (!blob) return;
        const file = new File([blob], "betweenatna-result.png", { type: "image/png" });
        if (navigator.share && navigator.canShare({ files: [file] })) {
          await navigator.share({ files: [file], title: "betweenatna Results" });
        } else {
          const url = URL.createObjectURL(blob);
          const link = document.createElement("a");
          link.download = `betweenatna-${player1Name}-${player2Name}.png`;
          link.href = url;
          link.click();
          URL.revokeObjectURL(url);
        }
      });
    } catch {} finally { setGenerating(false); }
  };

  return (
    <div className="w-full max-w-md z-10 space-y-2.5">
      <div
        ref={cardRef}
        style={{
          background: "linear-gradient(160deg, #0C0C12 0%, #151520 50%, #1A1230 100%)",
          color: "#F5F5F7",
          fontFamily: "'Tajawal', 'Outfit', sans-serif",
          direction: isRTL ? "rtl" : "ltr",
          borderRadius: "16px",
          padding: "28px 24px",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div style={{ position: "absolute", top: "-40px", right: "-40px", width: "140px", height: "140px", borderRadius: "50%", background: "radial-gradient(circle, rgba(224,51,103,0.12) 0%, transparent 70%)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", bottom: "-30px", left: "-30px", width: "100px", height: "100px", borderRadius: "50%", background: "radial-gradient(circle, rgba(124,58,237,0.1) 0%, transparent 70%)", pointerEvents: "none" }} />

        <div style={{ textAlign: "center", marginBottom: "20px" }}>
          <p style={{ fontSize: "10px", letterSpacing: "0.2em", textTransform: "uppercase", color: "#71717A", marginBottom: "10px", fontWeight: 600 }}>betweenatna</p>
          <p style={{ fontSize: "16px", fontWeight: 700 }}>
            {player1Name} <span style={{ color: "#E03367", margin: "0 4px" }}>&times;</span> {player2Name}
          </p>
        </div>

        <div style={{ textAlign: "center", padding: "12px 0" }}>
          <p style={{ fontSize: "52px", fontWeight: 900, lineHeight: 1, background: "linear-gradient(135deg, #E03367, #7C3AED)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            {result.finalScore}%
          </p>
          <p style={{ fontSize: "11px", color: "#71717A", marginTop: "6px", fontWeight: 500 }}>{t("share.compatibility")}</p>
        </div>

        <p style={{ textAlign: "center", fontSize: "14px", fontWeight: 600, color: "#F5F5F7", marginBottom: "16px" }}>{result.title}</p>

        {result.awards?.slice(0, 3).map((award, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 10px", marginBottom: "4px", borderRadius: "10px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)", fontSize: "12px" }}>
            <span>{award.emoji} {award.name}</span>
            <span style={{ color: "#71717A" }}>{award.winner}</span>
          </div>
        ))}

        <p style={{ textAlign: "center", fontSize: "9px", color: "rgba(113,113,122,0.4)", marginTop: "16px", letterSpacing: "0.1em" }}>betweenatna.lovable.app</p>
      </div>

      <div className="flex gap-2">
        <motion.button whileTap={{ scale: 0.97 }} onClick={generateImage} disabled={generating}
          className="flex-1 h-10 text-[12px] font-semibold rounded-xl border border-border/40 text-muted-foreground hover:text-foreground hover:bg-muted/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50">
          <Download size={14} />{generating ? t("share.saving") : t("share.saveImage")}
        </motion.button>
        <motion.button whileTap={{ scale: 0.97 }} onClick={handleShare} disabled={generating}
          className="flex-1 h-10 text-[12px] font-bold bg-gradient-accent text-primary-foreground rounded-xl flex items-center justify-center gap-2 glow-accent disabled:opacity-50 shimmer">
          <Share2 size={14} />{t("share.share")}
        </motion.button>
      </div>
    </div>
  );
};

export default ShareableCard;
