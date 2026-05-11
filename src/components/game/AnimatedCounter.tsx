import { useEffect, useState } from "react";
import { motion, useMotionValue, useTransform, animate } from "framer-motion";

interface AnimatedCounterProps {
  value: number;
  duration?: number;
  delay?: number;
  className?: string;
  suffix?: string;
}

const AnimatedCounter = ({ value, duration = 1.2, delay = 0, className = "", suffix = "%" }: AnimatedCounterProps) => {
  const count = useMotionValue(0);
  const rounded = useTransform(count, (v) => Math.round(v));
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    const timeout = setTimeout(() => {
      const controls = animate(count, value, {
        duration,
        ease: [0.22, 1, 0.36, 1],
      });
      return () => controls.stop();
    }, delay * 1000);
    return () => clearTimeout(timeout);
  }, [value, duration, delay, count]);

  useEffect(() => {
    const unsubscribe = rounded.on("change", (v) => setDisplay(v));
    return unsubscribe;
  }, [rounded]);

  return (
    <span className={className}>
      {display}{suffix}
    </span>
  );
};

export default AnimatedCounter;
