const getCtx = (() => {
  let ctx: AudioContext | null = null;
  return () => {
    if (!ctx && typeof window !== "undefined") {
      ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    return ctx;
  };
})();

function tone(freq: number, dur: number, type: OscillatorType = "sine", vol = 0.07, delay = 0) {
  const ctx = getCtx();
  if (!ctx) return;
  if (ctx.state === "suspended") ctx.resume();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, ctx.currentTime + delay);
  gain.gain.setValueAtTime(0.001, ctx.currentTime + delay);
  gain.gain.linearRampToValueAtTime(vol, ctx.currentTime + delay + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + delay + dur);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(ctx.currentTime + delay);
  osc.stop(ctx.currentTime + delay + dur + 0.01);
}

const vibe = (p: number | number[]) => { try { navigator.vibrate?.(p); } catch {} };

export const useSoundEffects = () => ({
  // Tap feedback
  playTap: () => { tone(900, 0.06, "sine", 0.04); vibe(8); },

  // Answer submitted
  playSubmit: () => {
    tone(480, 0.1, "sine", 0.06);
    tone(720, 0.14, "sine", 0.07, 0.08);
    tone(960, 0.18, "sine", 0.05, 0.18);
    vibe([12, 20, 12]);
  },

  // Card flip / whoosh for answer reveal
  playReveal: () => {
    // Whoosh: white noise sim with rapid freq sweep
    tone(200, 0.06, "sawtooth", 0.03);
    tone(400, 0.08, "triangle", 0.05, 0.04);
    tone(600, 0.1,  "triangle", 0.06, 0.09);
    tone(880, 0.18, "triangle", 0.07, 0.16);
    vibe([10, 30, 15]);
  },

  // Second card reveal — slightly higher
  playReveal2: () => {
    tone(300, 0.06, "sawtooth", 0.03);
    tone(550, 0.08, "triangle", 0.05, 0.04);
    tone(780, 0.1,  "triangle", 0.06, 0.09);
    tone(1040, 0.18, "triangle", 0.07, 0.16);
    vibe([10, 30, 15]);
  },

  // Slot machine tick for score counting
  playTick: () => { tone(1400, 0.03, "square", 0.025); },

  // Score locked in
  playScoreLock: () => {
    tone(330, 0.08, "triangle", 0.05);
    tone(440, 0.1,  "triangle", 0.06, 0.07);
    tone(550, 0.14, "triangle", 0.07, 0.15);
    vibe(20);
  },

  // Final result boom — dramatic chord
  playFinalBoom: () => {
    // Power chord: root + fifth + octave
    tone(130, 0.6, "triangle", 0.08);        // C3
    tone(196, 0.6, "triangle", 0.07, 0.02);  // G3
    tone(261, 0.8, "triangle", 0.09, 0.04);  // C4
    tone(392, 0.9, "triangle", 0.06, 0.08);  // G4
    tone(523, 1.0, "sine",     0.05, 0.15);  // C5 (rises)
    vibe([30, 40, 30, 60, 80]);
  },

  // Confetti burst — ascending arpeggio
  playConfetti: () => {
    [523, 659, 784, 988, 1047].forEach((f, i) =>
      tone(f, 0.22, "triangle", 0.05, i * 0.07)
    );
    vibe([10, 15, 10, 15, 20, 30]);
  },

  // Dare / speed round alert
  playAlert: () => {
    tone(440, 0.12, "sawtooth", 0.04);
    tone(440, 0.12, "sawtooth", 0.04, 0.18);
    tone(660, 0.22, "sawtooth", 0.06, 0.38);
    vibe([30, 50, 30, 50, 60]);
  },

  // Timer urgent (last 10s)
  playUrgent: () => {
    tone(700, 0.08, "sawtooth", 0.035);
    vibe(15);
  },

  // Typing indicator ping
  playTypingPing: () => { tone(1100, 0.06, "sine", 0.025); },
});
