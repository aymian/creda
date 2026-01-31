"use client"

import React from "react"
import { motion } from "framer-motion"
import {
    Play,
    Brain,
    Settings,
    Clock,
    Shield,
    Leaf,
    Plus,
    Heart
} from "lucide-react"

export default function Home() {
    return (
        <div className="relative min-h-screen bg-[#0C0C0C] overflow-hidden">
            {/* Background Glow Orbs */}
            <div className="absolute top-1/2 left-0 -translate-y-1/2 w-[500px] h-[500px] bg-cyber-pink/20 rounded-full blur-[120px] -z-10 animate-pulse" />
            <div className="absolute top-1/2 right-0 -translate-y-1/2 w-[500px] h-[500px] bg-cyber-cyan/10 rounded-full blur-[120px] -z-10 animate-pulse delay-700" />

            <div className="max-w-[1440px] mx-auto px-6 py-12 lg:py-24">
                <div className="grid lg:grid-cols-2 gap-12 items-center">

                    {/* Left Column: Content */}
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8 }}
                        className="flex flex-col items-start gap-8"
                    >
                        {/* Badge */}
                        <div className="bg-cyber-pink/20 border border-cyber-pink/30 px-4 py-1.5 rounded-full">
                            <span className="text-cyber-pink text-xs font-black tracking-widest uppercase">2026 Focus Revolution</span>
                        </div>

                        {/* Headline */}
                        <h1 className="text-6xl md:text-8xl font-black text-white leading-[0.9] tracking-tighter text-left">
                            STOP SCROLLING.<br />
                            <span className="text-white/90">START WINNING.</span>
                        </h1>

                        {/* Subheadline */}
                        <p className="text-white/40 text-lg md:text-xl max-w-lg leading-relaxed font-medium text-left">
                            The only social network designed to make you focused, not distracted.
                            Join the 2026 focus revolution and take back your attention.
                        </p>

                        {/* CTA */}
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="bg-white text-black px-10 py-5 rounded-full font-black text-lg shadow-[0_20px_40px_rgba(255,255,255,0.1)] hover:bg-[#F0F0F0] transition-all"
                        >
                            Get Started — It's Free
                        </motion.button>

                        {/* Social Proof */}
                        <div className="flex items-center gap-4">
                            <div className="flex -space-x-4">
                                {[1, 2, 3].map((i) => (
                                    <div key={i} className="w-10 h-10 rounded-full border-2 border-[#0C0C0C] bg-gradient-to-br from-white/10 to-white/5 overflow-hidden ring-2 ring-cyber-pink/20">
                                        <img
                                            src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${i + 20}`}
                                            alt="User avatar"
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                ))}
                            </div>
                            <span className="text-white/40 font-bold text-sm tracking-tight">12k users joined today</span>
                        </div>
                    </motion.div>

                    {/* Right Column: Visual Mockup */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8, rotate: 10 }}
                        animate={{ opacity: 1, scale: 1, rotate: 0 }}
                        transition={{ duration: 1, ease: "easeOut" }}
                        className="relative flex justify-center"
                    >
                        {/* Main Floating Card */}
                        <motion.div
                            animate={{
                                y: [0, -20, 0],
                                rotate: [-2, 2, -2]
                            }}
                            transition={{
                                duration: 6,
                                repeat: Infinity,
                                ease: "easeInOut"
                            }}
                            className="relative w-[380px] h-[520px] bg-white/[0.03] border border-white/10 rounded-[40px] p-6 backdrop-blur-3xl shadow-2xl overflow-hidden"
                        >
                            {/* Internal Mockup UI */}
                            <div className="flex flex-col h-full gap-4">
                                <div className="flex justify-between items-center px-2">
                                    <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center">
                                        <Heart className="w-4 h-4 text-white/40" />
                                    </div>
                                    <Settings className="w-5 h-5 text-white/40" />
                                </div>

                                <div className="flex-1 relative rounded-3xl overflow-hidden group text-left">
                                    <img
                                        src="/deep_work_ui_mockup.png"
                                        alt="Deep Work Session"
                                        className="w-full h-full object-cover grayscale-[0.2] group-hover:grayscale-0 transition-all duration-700"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />

                                    {/* Play Button Overlay */}
                                    <motion.div
                                        whileHover={{ scale: 1.1 }}
                                        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 bg-cyber-cyan rounded-full flex items-center justify-center shadow-[0_0_40px_rgba(0,242,255,0.4)] cursor-pointer"
                                    >
                                        <Play className="w-8 h-8 text-black fill-black ml-1" />
                                    </motion.div>
                                </div>

                                <div className="px-2 pb-2 text-left">
                                    <h3 className="text-2xl font-black text-white italic">Deep Work Session</h3>
                                    <p className="text-white/40 text-sm font-medium">Ambient Mix • Phase 04</p>

                                    <div className="mt-6 flex items-center justify-between">
                                        <div className="flex gap-4">
                                            <div className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center text-white/40 hover:text-white transition-colors cursor-pointer">
                                                <Plus className="w-5 h-5" />
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className="w-2 h-2 rounded-full bg-cyber-cyan animate-pulse" />
                                            <span className="text-cyber-cyan text-xs font-black tracking-widest uppercase">Live Tracking</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>

                        {/* Decorative Elements */}
                        <div className="absolute -top-10 -right-10 w-32 h-32 bg-cyber-pink/20 rounded-full blur-3xl -z-10" />
                        <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-cyber-cyan/20 rounded-full blur-3xl -z-10" />
                    </motion.div>
                </div>

                {/* Footer Integration Section */}
                <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5, duration: 0.8 }}
                    className="mt-24 lg:mt-32 border border-white/10 bg-white/[0.02] rounded-[32px] p-8 md:p-12 flex flex-col items-center gap-10 backdrop-blur-sm"
                >
                    <p className="text-white/40 font-bold uppercase tracking-[0.2em] text-sm">Seamlessly integrates with 500+ focus apps</p>

                    <div className="flex flex-wrap justify-center gap-12 md:gap-20">
                        {[
                            { icon: Brain, label: "Neural Flow" },
                            { icon: Settings, label: "Core Sync" },
                            { icon: Clock, label: "Time Lab" },
                            { icon: Shield, label: "Guard Mode" },
                            { icon: Leaf, label: "Pure Focus" }
                        ].map((item, idx) => (
                            <motion.div
                                key={idx}
                                whileHover={{ y: -5, color: "var(--cyber-cyan)" }}
                                className="flex flex-col items-center gap-3 text-white/20 group cursor-pointer"
                            >
                                <item.icon className="w-10 h-10 stroke-[1.5px] transition-colors group-hover:text-white" />
                            </motion.div>
                        ))}
                    </div>
                </motion.div>
            </div>
        </div>
    )
}
