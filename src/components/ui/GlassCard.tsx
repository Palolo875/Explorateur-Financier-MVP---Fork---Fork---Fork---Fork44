import React from 'react';
import { motion } from 'framer-motion';
interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  animate?: boolean;
  hover?: boolean;
  onClick?: () => void;
}
export function GlassCard({
  children,
  className = '',
  animate = false,
  hover = false,
  onClick
}: GlassCardProps) {
  const baseClasses = 'glass-card';
  if (!animate) {
    return <div className={`${baseClasses} ${hover ? 'hover-lift' : ''} ${className}`} onClick={onClick}>
        {children}
      </div>;
  }
  return <motion.div className={`${baseClasses} ${hover ? 'hover-lift' : ''} ${className}`} initial={{
    opacity: 0,
    y: 20
  }} animate={{
    opacity: 1,
    y: 0
  }} transition={{
    duration: 0.4
  }} onClick={onClick}>
      {children}
    </motion.div>;
}