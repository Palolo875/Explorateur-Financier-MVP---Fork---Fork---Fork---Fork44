import React from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../../context/ThemeContext';
export function RevealAnimation() {
  const {
    themeColors
  } = useTheme();
  return <motion.div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80" initial={{
    opacity: 0
  }} animate={{
    opacity: 1
  }} exit={{
    opacity: 0
  }}>
      <motion.div className="relative" initial={{
      scale: 0.8,
      opacity: 0
    }} animate={{
      scale: 1,
      opacity: 1
    }} exit={{
      scale: 1.2,
      opacity: 0
    }} transition={{
      duration: 0.5
    }}>
        <div className={`w-24 h-24 rounded-lg bg-gradient-to-r ${themeColors.primary}`}>
          <motion.div className="absolute inset-0 flex items-center justify-center" initial={{
          opacity: 0
        }} animate={{
          opacity: 1
        }} transition={{
          delay: 0.3,
          duration: 0.5
        }}>
            <svg width="60" height="60" viewBox="0 0 100 100">
              <motion.circle cx="50" cy="50" r="30" stroke="white" strokeWidth="5" fill="none" initial={{
              pathLength: 0
            }} animate={{
              pathLength: 1
            }} transition={{
              duration: 1,
              ease: 'easeInOut'
            }} />
              <motion.path d="M30,50 L45,65 L70,35" stroke="white" strokeWidth="5" fill="none" strokeLinecap="round" strokeLinejoin="round" initial={{
              pathLength: 0
            }} animate={{
              pathLength: 1
            }} transition={{
              delay: 0.8,
              duration: 0.5,
              ease: 'easeInOut'
            }} />
            </svg>
          </motion.div>
        </div>
        <motion.div className="absolute -inset-4" initial={{
        opacity: 0
      }} animate={{
        opacity: 1
      }} transition={{
        delay: 0.2,
        duration: 0.8
      }}>
          <div className={`w-full h-full rounded-2xl bg-gradient-to-r ${themeColors.primary} opacity-30 animate-pulse-glow`}></div>
        </motion.div>
      </motion.div>
      <motion.div className="absolute bottom-10 text-center" initial={{
      opacity: 0,
      y: 20
    }} animate={{
      opacity: 1,
      y: 0
    }} transition={{
      delay: 0.5,
      duration: 0.5
    }}>
        <h2 className="text-xl font-bold mb-2">Analyse en cours...</h2>
        <p className="text-sm text-gray-300">
          Nous préparons vos insights personnalisés
        </p>
      </motion.div>
    </motion.div>;
}