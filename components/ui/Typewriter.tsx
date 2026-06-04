"use client";

import { motion } from "framer-motion";

export function TypewriterEffect({ 
  text, 
  delay = 0, 
  className = "",
  cursor = true
}: { 
  text: string; 
  delay?: number;
  className?: string;
  cursor?: boolean;
}) {
  const characters = text.split("");

  return (
    <span className={`inline-block select-none ${className}`}>
      {characters.map((char, index) => (
        <motion.span
          key={index}
          initial={{ opacity: 0, display: "none" }}
          animate={{ opacity: 1, display: "inline-block" }}
          transition={{
            duration: 0.1,
            delay: delay + index * 0.1,
          }}
        >
          {char === " " ? "\u00A0" : char}
        </motion.span>
      ))}
      {cursor && (
        <motion.span
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 1, 0] }}
          transition={{ 
            duration: 0.8, 
            repeat: Infinity,
            delay: delay + characters.length * 0.1
          }}
          className="inline-block w-[0.08em] h-[0.9em] bg-[var(--color-primary)] ml-2 align-middle"
        />
      )}
    </span>
  );
}
