"use client"

import React from "react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

interface LogoProps {
  className?: string
  size?: number
}

/**
 * Creda 2026 "Aura" Logo + Brandmark
 * Features an ultra-premium typographic treatment paired with the Aura icon.
 */
export function CredaLogo({ className, size = 50 }: LogoProps) {
  return (
    <motion.div
      initial={{ rotate: -6 }}
      whileHover={{ rotate: 0, scale: 1.05 }}
      className={cn(
        "relative cursor-pointer flex items-center gap-4 group",
        className
      )}
    >
      <div style={{ width: size, height: size }}>
        <svg
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full drop-shadow-[0_0_15px_rgba(255,45,108,0.3)] group-hover:drop-shadow-[0_0_20px_rgba(0,242,255,0.5)] transition-all duration-500"
        >
          <defs>
            <linearGradient id="aura-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#00F2FF" />
              <stop offset="50%" stopColor="#8C4BFF" />
              <stop offset="100%" stopColor="#FF2D6C" />
            </linearGradient>

            <filter id="neon-blur" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="2.5" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Outer Kinetic Ring */}
          <motion.path
            d="M85 50C85 69.33 69.33 85 50 85C30.67 85 15 69.33 15 50C15 30.67 30.67 15 50 15"
            stroke="url(#aura-gradient)"
            strokeWidth="8"
            strokeLinecap="round"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 1.5, ease: "easeInOut" }}
          />

          {/* Inner Focus Core */}
          <motion.path
            d="M70 50C70 61.0457 61.0457 70 50 70C38.9543 70 30 61.0457 30 50C30 38.9543 38.9543 30 50 30"
            stroke="white"
            strokeWidth="4"
            strokeLinecap="round"
            strokeDasharray="1 12"
            animate={{ rotate: 360 }}
            transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
          />

          {/* The "Spark" Bolt */}
          <motion.path
            d="M50 20L55 45L80 45L60 60L70 85L50 70L30 85L40 60L20 45L45 45L50 20Z"
            fill="url(#aura-gradient)"
            initial={{ scale: 0 }}
            animate={{ scale: 0.4 }}
            style={{ transformOrigin: "center" }}
          />

          {/* Central Pulse Point */}
          <circle cx="50" cy="50" r="4" fill="white" className="animate-pulse" />
        </svg>
      </div>

      {/* Premium Brand Text */}
      <motion.div
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.2, duration: 0.8 }}
        className="flex flex-col"
      >
        <span className="text-3xl font-black italic tracking-tighter text-white leading-none">
          CREDA<span className="text-cyber-pink">.</span>
        </span>
        <span className="text-[8px] font-black uppercase tracking-[0.4em] text-white/30 leading-none mt-1">
          Focus Ecosystem
        </span>
      </motion.div>
    </motion.div>
  )
}

export default CredaLogo;