"use client";

import { useRef } from "react";
import { motion, useMotionTemplate, useMotionValue, useSpring, useTransform } from "framer-motion";
import { cn } from "@/lib/utils";

interface GlareCardProps {
  children: React.ReactNode;
  className?: string;
}

export const GlareCard = ({ children, className }: GlareCardProps) => {
  const ref = useRef<HTMLDivElement>(null);

  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseX = useSpring(x, { stiffness: 400, damping: 90 });
  const mouseY = useSpring(y, { stiffness: 400, damping: 90 });

  function onMouseMove({ currentTarget, clientX, clientY }: React.MouseEvent<HTMLDivElement>) {
    const { left, top, width, height } = currentTarget.getBoundingClientRect();
    const localX = clientX - left;
    const localY = clientY - top;
    x.set(localX);
    y.set(localY);
  }

  function onMouseLeave() {
    x.set(ref.current?.getBoundingClientRect().width ? ref.current?.getBoundingClientRect().width / 2 : 0);
    y.set(ref.current?.getBoundingClientRect().height ? ref.current?.getBoundingClientRect().height / 2 : 0);
  }

  // Glare effect follows the mouse
  const background = useMotionTemplate`radial-gradient(400px circle at ${mouseX}px ${mouseY}px, rgba(255,255,255,0.2), transparent 80%)`;

  return (
    <div
      ref={ref}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
      className={cn("relative group perspective-[1000px]", className)}
    >
      <motion.div
        className="pointer-events-none absolute inset-0 z-10 opacity-0 transition-opacity duration-500 group-hover:opacity-100 rounded-full"
        style={{
          background,
          mixBlendMode: "overlay",
        }}
      />
      {children}
    </div>
  );
};
