"use client"

import React, { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
    Check,
    Zap,
    Crown,
    Star,
    ChevronRight,
    ExternalLink,
    Info,
    Layout,
    Shield,
    Activity,
    Users
} from "lucide-react"
import { cn } from "@/lib/utils"

const PLANS = [
    {
        id: "pro",
        name: "Pro",
        price: 8,
        description: "Everything in basic, and verified status.",
        features: [
            { icon: Check, label: "Verified checkmark" },
            { icon: Zap, label: "Unlimited Missions" },
            { icon: Activity, label: "Enhanced Stakes ($500+)" },
            { icon: Info, label: "Advanced Analytics" },
            { icon: Crown, label: "Pro Profile Badge" },
            { icon: Users, label: "Priority Support" }
        ],
        color: "white",
        icon: Star,
        buttonText: "Get Pro",
        highlight: true
    },
    {
        id: "premium",
        name: "Premium",
        price: 40,
        description: "The ultimate experience, fully ad-free and max power.",
        features: [
            { icon: Zap, label: "Everything in Pro, and" },
            { icon: Shield, label: "Zero Platform Fees" },
            { icon: Activity, label: "No Stake Limits ($10k+)" },
            { icon: Info, label: "Habits AI & Deep Insights" },
            { icon: Crown, label: "Exclusive 'C-Flame' Aura" },
            { icon: Users, label: "Direct 'Alpha' Access" }
        ],
        color: "cyber-pink",
        icon: Crown,
        buttonText: "Get Premium"
    }
]

const COMPARISON = [
    { feature: "Mission Entry", pro: "Unlimited", premium: "Unlimited" },
    { feature: "Stake Limits", pro: "$500 Maximum", premium: "No Limits" },
    { feature: "Platform Fee", pro: "1.5% Reduced", premium: "0% Zero" },
    { feature: "Analytics", pro: "Advanced", premium: "Deep AI + Habits" },
    { feature: "Support", pro: "Priority", premium: "Direct Alpha/Discord" },
]

export default function UpgradePage() {
    const [billingCycle, setBillingCycle] = useState<"monthly" | "annual">("monthly")
    const [selectedPlan, setSelectedPlan] = useState(PLANS[0]) // Default to Elite

    return (
        <div className="min-h-screen bg-black text-white selection:bg-cyber-pink/30 pb-40">
            {/* Header Area */}
            <div className="pt-20 pb-12 text-center">
                <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-8">
                    Get verified with Premium
                </h1>

                {/* Billing Toggle */}
                <div className="inline-flex p-1 bg-[#16181C] rounded-full border border-white/5 mb-12">
                    <button
                        onClick={() => setBillingCycle("annual")}
                        className={cn(
                            "px-8 py-2.5 rounded-full text-sm font-bold transition-all",
                            billingCycle === "annual" ? "bg-[#2F3336] text-white" : "text-white/40 hover:text-white"
                        )}
                    >
                        Annual
                    </button>
                    <button
                        onClick={() => setBillingCycle("monthly")}
                        className={cn(
                            "px-8 py-2.5 rounded-full text-sm font-bold transition-all",
                            billingCycle === "monthly" ? "bg-[#2F3336] text-white" : "text-white/40 hover:text-white"
                        )}
                    >
                        Monthly
                    </button>
                </div>
            </div>

            {/* Plan Cards Container */}
            <div className="max-w-4xl mx-auto px-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {PLANS.map((plan) => (
                        <div
                            key={plan.id}
                            onClick={() => setSelectedPlan(plan)}
                            className={cn(
                                "relative p-6 rounded-2xl border-2 cursor-pointer transition-all duration-300 flex flex-col min-h-[480px]",
                                selectedPlan.id === plan.id
                                    ? "border-white bg-black ring-1 ring-white/20 shadow-[0_0_30px_rgba(255,255,255,0.05)]"
                                    : "border-transparent bg-[#0C0F11] hover:bg-[#16181C]"
                            )}
                        >
                            {/* Selection Indicator */}
                            <div className="absolute top-6 right-6">
                                <div className={cn(
                                    "w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all",
                                    selectedPlan.id === plan.id
                                        ? "bg-white border-white text-black"
                                        : "border-white/20"
                                )}>
                                    {selectedPlan.id === plan.id && <Check className="w-4 h-4" strokeWidth={4} />}
                                </div>
                            </div>

                            <div className="mb-6">
                                <h3 className="text-xl font-black mb-2">{plan.name}</h3>
                                <div className="flex items-baseline gap-1">
                                    <span className="text-4xl font-black">${billingCycle === 'annual' ? Math.floor(plan.price * 0.8) : plan.price}</span>
                                    <span className="text-white/40 text-sm font-bold">/ month</span>
                                </div>
                            </div>

                            <p className="text-white/60 text-sm font-medium mb-8 leading-relaxed">
                                {plan.id === 'pro' ? plan.description : `Everything in Pro, and`}
                            </p>

                            <div className="space-y-5 flex-1">
                                {plan.features.map((feature, i) => (
                                    <div key={i} className="flex items-center gap-4 group">
                                        <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0 group-hover:bg-white/10 transition-colors">
                                            <feature.icon className="w-5 h-5 text-white" />
                                        </div>
                                        <span className="text-[15px] font-bold text-white/90">{feature.label}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Business Banner */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="mt-8 bg-gradient-to-r from-[#16181C] via-[#2F3336] to-[#16181C] rounded-2xl p-8 border border-white/5 flex flex-col md:flex-row items-center justify-between gap-6"
                >
                    <div className="flex items-center gap-6">
                        <div className="w-16 h-16 bg-[#FDB913]/10 rounded-2xl flex items-center justify-center border border-[#FDB913]/20 shrink-0">
                            <Crown className="w-8 h-8 text-[#FDB913]" />
                        </div>
                        <div>
                            <h4 className="text-xl font-black text-white mb-1">Are you a business?</h4>
                            <p className="text-white/40 font-bold">Gain credibility and grow faster with Premium Business</p>
                        </div>
                    </div>
                    <button className="bg-white text-black px-8 py-3 rounded-full font-black text-sm hover:opacity-90 transition-all whitespace-nowrap">
                        Explore Premium Business
                    </button>
                </motion.div>

                {/* Comparison Table */}
                <div className="mt-24 mb-32">
                    <h2 className="text-2xl font-black mb-8 px-4">Compare tiers & features</h2>
                    <div className="overflow-hidden border border-white/10 rounded-2xl bg-[#0C0F11]">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-white/10">
                                    <th className="p-6 text-sm font-black uppercase tracking-widest text-white/40 w-1/3 text-[10px]">Enhanced Experience</th>
                                    {PLANS.map(p => (
                                        <th key={p.id} className="p-6 text-sm font-black text-center">{p.name}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {COMPARISON.map((row, i) => (
                                    <tr key={i} className="hover:bg-white/[0.02] transition-colors">
                                        <td className="p-6 text-[15px] font-black">{row.feature}</td>
                                        <td className="p-6 text-center text-[14px] font-bold text-white/40">{row.pro}</td>
                                        <td className="p-6 text-center text-[14px] font-black text-cyber-pink">{row.premium}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Sticky Bottom Bar */}
            <div className="fixed bottom-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-xl border-t border-white/10 p-6 shadow-[0_-20px_40px_rgba(0,0,0,0.5)]">
                <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="text-left hidden md:block">
                        <h4 className="text-xl font-black">{selectedPlan.name}</h4>
                        <p className="text-white/40 font-bold">
                            ${billingCycle === 'annual' ? Math.floor(selectedPlan.price * 0.8) : selectedPlan.price} / month
                            <span className="ml-2 py-0.5 px-2 bg-white/5 rounded text-[10px] uppercase">Billed {billingCycle}ly</span>
                        </p>
                    </div>

                    <div className="flex flex-col items-center gap-4 w-full md:w-auto">
                        <button className="w-full md:w-[400px] h-14 bg-white text-black rounded-full font-black text-lg hover:opacity-90 transition-all flex items-center justify-center">
                            Subscribe & Pay
                        </button>
                        <p className="text-[10px] text-white/30 text-center max-w-sm font-bold uppercase tracking-wider leading-relaxed">
                            By subscribing, you agree to our <span className="text-white underline cursor-pointer">Purchaser Terms</span>.
                            Subscriptions auto-renew until you cancel. <span className="text-white underline cursor-pointer">Cancel anytime</span>.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}
