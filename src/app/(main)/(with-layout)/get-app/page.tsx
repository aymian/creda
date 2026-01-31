"use client"

import React from "react"
import { motion } from "framer-motion"
import {
    Smartphone,
    Apple,
    Play,
    Globe,
    ShieldCheck,
    Zap,
    QrCode,
    ChevronRight,
    ArrowRight,
    Star,
    Heart,
    Brain,
    PlayCircle
} from "lucide-react"

export default function GetAppPage() {
    return (
        <div className="relative min-h-screen bg-[#0C0C0C] pt-32 pb-24 overflow-hidden">
            {/* Background Decorative Elements */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-cyber-pink/10 rounded-full blur-[120px] -z-10 opacity-50" />
            <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-cyber-cyan/5 rounded-full blur-[120px] -z-10" />

            <div className="max-w-7xl mx-auto px-6">
                <div className="grid lg:grid-cols-2 gap-20 items-center">

                    {/* Left Column: Value Proposition */}
                    <motion.div
                        initial={{ opacity: 0, x: -40 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        className="flex flex-col items-start gap-8"
                    >
                        <div className="inline-flex items-center gap-2 bg-cyber-pink/20 border border-cyber-pink/30 px-4 py-1.5 rounded-full">
                            <span className="text-cyber-pink text-xs font-black tracking-widest uppercase">Mobile Interface 2.0</span>
                        </div>

                        <h1 className="text-6xl md:text-8xl font-black text-white leading-[0.9] tracking-tighter">
                            CREDA IN YOUR <br />
                            <span className="text-cyber-pink italic">POCKET.</span>
                        </h1>

                        <p className="text-white/40 text-lg md:text-xl max-w-lg leading-relaxed font-medium">
                            Take the focus revolution with you. Real-time neural sync, zero-latency notifications, and elite performance on the go.
                        </p>

                        <div className="flex flex-wrap gap-4 mt-4">
                            {/* Official-style App Store Button */}
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="flex items-center gap-3 bg-black border border-white/20 text-white px-6 py-3 rounded-xl transition-all shadow-xl hover:bg-[#111] hover:border-white/40"
                            >
                                <Apple className="w-8 h-8 fill-current" />
                                <div className="flex flex-col items-start leading-none -mt-1">
                                    <span className="text-[10px] font-medium opacity-80 mb-1">Download on the</span>
                                    <span className="text-xl font-bold font-sans tracking-tight">App Store</span>
                                </div>
                            </motion.button>

                            {/* Official-style Play Store Button */}
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="flex items-center gap-3 bg-black border border-white/20 text-white px-6 py-3 rounded-xl transition-all shadow-xl hover:bg-[#111] hover:border-white/40"
                            >
                                <div className="w-8 h-8 flex items-center justify-center">
                                    <svg viewBox="0 0 24 24" className="w-full h-full fill-current">
                                        <path d="M3.609 1.814L13.792 12l-10.183 10.186c-.19.186-.445.29-.711.29-.553 0-1-.447-1-1V2.104c0-.266.104-.52.29-.711.19-.186.445-.29.711-.29s.52.104.711.29zM14.5 12.708l3.053 3.054-13.044 7.429c-.276.157-.594.157-.87 0-.19-.108-.34-.27-.42-.46L14.5 12.708zm4.729-2.001l3.167 1.805c.276.157.445.452.445.768a.88.88 0 01-.445.768l-3.21 1.83-3.239-3.239 3.282-1.932zm-4.729-.707L3.712 2.571c.19-.108.411-.166.637-.166.226 0 .445.058.637.166l13.044 7.429L14.5 10z" />
                                    </svg>
                                </div>
                                <div className="flex flex-col items-start leading-none -mt-1">
                                    <span className="text-[10px] font-medium opacity-80 mb-1">GET IT ON</span>
                                    <span className="text-xl font-bold font-sans tracking-tight">Google Play</span>
                                </div>
                            </motion.button>
                        </div>

                        {/* QR Code Section */}
                        <div className="flex items-center gap-6 mt-8 p-6 bg-white/[0.02] border border-white/5 rounded-[32px] backdrop-blur-sm">
                            <div className="w-24 h-24 bg-white p-2 rounded-2xl shadow-[0_0_30px_rgba(255,255,255,0.1)]">
                                <QrCode className="w-full h-full text-black" />
                            </div>
                            <div className="flex flex-col gap-1">
                                <span className="text-white font-bold uppercase tracking-widest text-xs">Scan to Sync</span>
                                <span className="text-white/30 text-xs max-w-[140px] leading-tight">Point your camera to download instantly</span>
                            </div>
                        </div>
                    </motion.div>

                    {/* Right Column: Visual Mockup (Site Preview) */}
                    <div className="relative">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.8, y: 40 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
                            className="relative z-10"
                        >
                            {/* Main Phone Mockup */}
                            <div className="relative mx-auto w-[320px] h-[640px] bg-[#050505] rounded-[60px] border-[10px] border-[#1A1A1A] overflow-hidden shadow-[0_60px_100px_rgba(0,0,0,0.8)] ring-1 ring-white/10">
                                {/* Notch */}
                                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-7 bg-[#1A1A1A] rounded-b-3xl z-40" />

                                {/* Inner Screen Content: Site Preview */}
                                <div className="h-full w-full bg-[#0C0C0C] relative flex flex-col pt-12 overflow-hidden">
                                    {/* Mobile Header */}
                                    <div className="px-6 flex justify-between items-center mb-10">
                                        <div className="w-10 h-10 bg-cyber-pink rounded-xl flex items-center justify-center">
                                            <Zap className="w-6 h-6 text-white fill-white" />
                                        </div>
                                        <div className="w-8 h-8 rounded-full bg-white/10" />
                                    </div>

                                    {/* Mobile Site Preview */}
                                    <div className="px-8 flex flex-col gap-4 text-left">
                                        <div className="inline-block bg-cyber-pink/20 border border-cyber-pink/30 px-3 py-1 rounded-full w-fit">
                                            <span className="text-cyber-pink text-[8px] font-black tracking-widest uppercase">Focus Region</span>
                                        </div>
                                        <h2 className="text-4xl font-black text-white leading-tight tracking-tighter">
                                            STOP SCROLLING. <br />
                                            <span className="text-white/60">START WINNING.</span>
                                        </h2>
                                        <p className="text-white/40 text-xs font-medium leading-relaxed">
                                            The social network that makes you focused, not distracted.
                                        </p>
                                        <div className="w-full h-12 bg-cyber-pink rounded-2xl mt-4 flex items-center justify-center shadow-[0_10px_20px_rgba(255,45,108,0.2)]">
                                            <span className="text-white font-black text-sm uppercase">Quick Entry</span>
                                        </div>
                                    </div>

                                    {/* Preview Feed Cards */}
                                    <div className="mt-12 px-6 flex flex-col gap-4 opacity-40">
                                        <div className="w-full h-32 bg-white/5 border border-white/5 rounded-3xl p-4 flex flex-col justify-end">
                                            <div className="w-20 h-2 bg-white/10 rounded-full" />
                                        </div>
                                        <div className="w-full h-32 bg-white/5 border border-white/5 rounded-3xl p-4 flex flex-col justify-end">
                                            <div className="w-20 h-2 bg-white/10 rounded-full" />
                                        </div>
                                    </div>

                                    <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-[#0C0C0C] to-transparent z-30" />

                                    {/* Floating Stats Overlay */}
                                    <motion.div
                                        animate={{ y: [0, -10, 0] }}
                                        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                                        className="absolute bottom-16 -right-6 bg-black/80 backdrop-blur-3xl border border-white/10 p-4 rounded-2xl shadow-2xl flex items-center gap-3 z-40"
                                    >
                                        <div className="w-10 h-10 rounded-xl bg-cyber-pink/20 flex items-center justify-center">
                                            <Zap className="w-5 h-5 text-cyber-pink" />
                                        </div>
                                        <div>
                                            <div className="text-[10px] font-black uppercase text-cyber-pink">Neural Sync</div>
                                            <div className="text-white font-black">ACTIVE</div>
                                        </div>
                                    </motion.div>
                                </div>
                            </div>

                            {/* Background Glow */}
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-cyber-cyan/10 rounded-full blur-[100px] -z-10" />
                        </motion.div>
                    </div>
                </div>

                {/* Features Section */}
                <div className="grid md:grid-cols-3 gap-8 mt-40">
                    {[
                        {
                            icon: ShieldCheck,
                            title: "Secure Node",
                            desc: "End-to-end encrypted sessions synced across all devices.",
                            color: "text-cyber-pink"
                        },
                        {
                            icon: Globe,
                            title: "Global Mesh",
                            desc: "Distributed server architecture for zero-delay interactions.",
                            color: "text-cyber-cyan"
                        },
                        {
                            icon: Zap,
                            title: "Neural Push",
                            desc: "Smart notification filtering designed for deep work flow.",
                            color: "text-amber-400"
                        }
                    ].map((feature, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: idx * 0.2 }}
                            className="p-8 rounded-[40px] bg-white/[0.02] border border-white/5 hover:border-white/10 transition-all group"
                        >
                            <div className={`w-14 h-14 rounded-2xl bg-white/[0.03] flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                                <feature.icon className={`w-7 h-7 ${feature.color}`} />
                            </div>
                            <h3 className="text-xl font-black text-white uppercase tracking-wider mb-4">{feature.title}</h3>
                            <p className="text-white/30 font-medium leading-relaxed">
                                {feature.desc}
                            </p>
                        </motion.div>
                    ))}
                </div>

                {/* Final CTA */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    className="mt-40 p-12 md:p-20 rounded-[64px] bg-gradient-to-br from-cyber-pink to-[#FF2D6C] text-center flex flex-col items-center gap-8 relative overflow-hidden"
                >
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10" />
                    <h2 className="text-4xl md:text-6xl font-black text-white leading-tight uppercase tracking-tighter relative z-10">
                        Join the future <br />
                        of mobile focus.
                    </h2>
                    <motion.button
                        whileHover={{ scale: 1.05, boxShadow: "0 20px 40px rgba(0,0,0,0.3)" }}
                        whileTap={{ scale: 0.95 }}
                        className="bg-white text-black px-12 py-6 rounded-full font-black text-xl flex items-center gap-3 relative z-10"
                    >
                        Initialize Download
                        <ArrowRight className="w-6 h-6" />
                    </motion.button>
                </motion.div>
            </div>
        </div>
    )
}
