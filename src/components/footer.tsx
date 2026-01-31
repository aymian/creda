"use client"

import React from "react"
import { motion } from "framer-motion"
import {
    Instagram,
    Twitter,
    Github,
    Youtube,
    ArrowRight,
    Globe,
    ShieldCheck,
    Zap,
    Star
} from "lucide-react"
import { CredaLogo } from "./logo"
import { cn } from "@/lib/utils"

const FOOTER_LINKS = [
    {
        title: "Platform",
        links: ["Live Stream", "Creator Hub", "Analytics", "Monetization"]
    },
    {
        title: "Company",
        links: ["Our Vision", "Careers", "Press Kit", "Contact"]
    },
    {
        title: "Support",
        links: ["Help Center", "Safety", "Community Guidelines", "API"]
    },
    {
        title: "Legal",
        links: ["Terms", "Privacy", "Cookie Policy", "Identity"]
    }
]

export function Footer() {
    return (
        <footer className="relative bg-[#0C0C0C] border-t border-white/5 pt-24 pb-12 overflow-hidden">
            {/* Background Decorative Elements */}
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-gradient-to-t from-cyber-pink/10 to-transparent blur-[120px] -z-10" />

            <div className="max-w-7xl mx-auto px-6">
                {/* Massive Conversion CTA Section */}
                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="relative group mb-24 p-12 md:p-16 rounded-[48px] bg-white/[0.02] border border-white/5 overflow-hidden flex flex-col items-center text-center"
                >
                    {/* Internal Glow */}
                    <div className="absolute inset-0 bg-gradient-to-br from-cyber-pink/5 via-transparent to-cyber-cyan/5 opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />

                    <div className="relative z-10 max-w-2xl">
                        <div className="inline-flex items-center gap-2 bg-cyber-pink/20 border border-cyber-pink/30 px-4 py-1.5 rounded-full mb-8">
                            <Star className="w-4 h-4 text-cyber-pink animate-star-pulse" fill="currentColor" />
                            <span className="text-cyber-pink text-xs font-black tracking-widest uppercase">The future belongs to you</span>
                        </div>

                        <h2 className="text-4xl md:text-6xl font-black text-white leading-[0.9] tracking-tighter mb-8">
                            READY TO <span className="text-cyber-pink italic">UNLEASH</span><br />
                            YOUR FULL POTENTIAL?
                        </h2>

                        <p className="text-white/40 text-lg md:text-xl font-medium mb-12">
                            Join 120,000+ top-tier creators who have seen a <span className="text-white">400% engagement increase</span> within their first month on Creda.
                        </p>

                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="w-full sm:w-auto bg-cyber-pink text-white px-10 py-5 rounded-full font-black text-lg shadow-[0_20px_40px_rgba(255,45,108,0.3)] hover:shadow-[0_25px_50px_rgba(255,45,108,0.5)] transition-all flex items-center justify-center gap-3"
                            >
                                Start Streaming Now
                                <ArrowRight className="w-6 h-6" />
                            </motion.button>

                            <div className="flex items-center gap-4 px-6 text-white/40 text-sm font-bold">
                                <div className="flex -space-x-2">
                                    {[1, 2, 3].map(i => (
                                        <div key={i} className="w-8 h-8 rounded-full border-2 border-[#0C0C0C] bg-white/10" />
                                    ))}
                                </div>
                                Trusted by the best
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Footer Navigation Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-12 mb-24">
                    {/* Logo and About Section */}
                    <div className="col-span-2 space-y-8">
                        <div className="flex items-center gap-4">
                            <CredaLogo size={50} />
                            <span className="text-2xl font-black tracking-tighter text-white">CREDA.</span>
                        </div>
                        <p className="text-white/40 font-medium leading-relaxed max-w-xs">
                            Designing the 2026 focus revolution. Where every interaction is an investment in your digital legacy.
                        </p>
                        <div className="flex items-center gap-4">
                            {[Instagram, Twitter, Github, Youtube].map((Icon, idx) => (
                                <motion.a
                                    key={idx}
                                    href="#"
                                    whileHover={{ y: -4, color: "#FF2D6C" }}
                                    className="p-3 rounded-2xl bg-white/[0.03] border border-white/5 text-white/40 transition-colors"
                                >
                                    <Icon className="w-5 h-5" />
                                </motion.a>
                            ))}
                        </div>
                    </div>

                    {/* Dynamic Link Groups */}
                    {FOOTER_LINKS.map((group, idx) => (
                        <div key={idx} className="space-y-6">
                            <h4 className="text-white text-sm font-black uppercase tracking-[0.2em]">{group.title}</h4>
                            <ul className="space-y-4">
                                {group.links.map((link, lIdx) => (
                                    <li key={lIdx}>
                                        <a href="#" className="text-white/30 hover:text-white font-medium transition-colors">
                                            {link}
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>

                {/* Bottom Bar: Quantitative Trust Signals */}
                <div className="border-t border-white/5 pt-12 flex flex-col lg:flex-row items-center justify-between gap-8">
                    <div className="flex flex-wrap items-center justify-center gap-8 text-[10px] font-black uppercase tracking-widest text-white/20">
                        <div className="flex items-center gap-2">
                            <Zap className="w-3 h-3 text-cyan-400" />
                            <span>99.99% Uptime SLA</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <ShieldCheck className="w-3 h-3 text-green-400" />
                            <span>AES-256 Encryption</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Globe className="w-3 h-3 text-cyber-pink" />
                            <span>Global 0.2ms Latency</span>
                        </div>
                    </div>

                    <p className="text-white/20 text-xs font-bold">
                        © 2026 Creda Technologies Inc. Designed with <span className="text-cyber-pink">♥</span> in the Future.
                    </p>
                </div>
            </div>
        </footer>
    )
}
