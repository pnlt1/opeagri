"use client";

import { ReactNode } from "react";
import { motion } from "framer-motion";

interface ScrollRevealProps {
  children: ReactNode;
  delay?: number;
  className?: string;
  direction?: "up" | "down" | "left" | "right" | "none";
  amount?: number | "some" | "all";
}

export function ScrollReveal({ 
  children, 
  delay = 0, 
  className = "", 
  direction = "up",
  amount = 0.3 
}: ScrollRevealProps) {
  
  const getVariants = () => {
    switch(direction) {
      case "up": return { hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0 } };
      case "down": return { hidden: { opacity: 0, y: -30 }, visible: { opacity: 1, y: 0 } };
      case "left": return { hidden: { opacity: 0, x: 30 }, visible: { opacity: 1, x: 0 } };
      case "right": return { hidden: { opacity: 0, x: -30 }, visible: { opacity: 1, x: 0 } };
      case "none": return { hidden: { opacity: 0 }, visible: { opacity: 1 } };
    }
  };

  return (
    <motion.div
      variants={getVariants()}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: amount as any }}
      transition={{ 
        duration: 0.8, 
        delay: delay, 
        ease: [0.16, 1, 0.3, 1] // Custom cubic-bezier for premium feel
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
