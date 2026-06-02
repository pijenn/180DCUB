"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import Image from "next/image";

interface ImageRevealProps {
  src: string;
  alt: string;
  children?: React.ReactNode;
  className?: string;
}

export function ImageReveal({ src, alt, children, className = "" }: ImageRevealProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-10%" });

  return (
    <motion.div 
      ref={ref} 
      className={`group relative overflow-hidden block cursor-pointer ${className}`}
      initial={{ opacity: 0, y: 40 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
    >
      {/* Background Image with Reveal Animation */}
      <motion.div
        className="absolute inset-0 z-0"
        initial={{ scale: 1.2, clipPath: "inset(10% 10% 10% 10%)" }}
        animate={isInView ? { scale: 1, clipPath: "inset(0% 0% 0% 0%)" } : {}}
        transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
      >
        <Image
          src={src}
          alt={alt}
          fill
          className="object-cover transition-transform duration-1000 ease-out group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-black/60 group-hover:bg-black/20 transition-colors duration-700 ease-out" />
      </motion.div>

      {/* Content */}
      <div className="relative z-10 p-8 flex flex-col h-full justify-end h-[400px]">
        {children}
      </div>
    </motion.div>
  );
}
