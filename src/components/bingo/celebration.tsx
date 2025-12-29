"use client";

import { useEffect } from "react";
import confetti from "canvas-confetti";

interface CelebrationProps {
  trigger: boolean;
  onComplete?: () => void;
}

export function Celebration({ trigger, onComplete }: CelebrationProps) {
  useEffect(() => {
    if (!trigger) return;

    const duration = 3000;
    const end = Date.now() + duration;

    const colors = ["#3B82F6", "#22C55E", "#A855F7", "#F97316"];

    const frame = () => {
      confetti({
        particleCount: 3,
        angle: 60,
        spread: 55,
        origin: { x: 0, y: 0.6 },
        colors,
      });
      confetti({
        particleCount: 3,
        angle: 120,
        spread: 55,
        origin: { x: 1, y: 0.6 },
        colors,
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      } else {
        onComplete?.();
      }
    };

    // Initial burst
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors,
    });

    frame();
  }, [trigger, onComplete]);

  return null;
}
