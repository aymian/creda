"use client"

import React, { Suspense, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { motion } from "framer-motion"
import {
    ShieldCheck,
    ChevronLeft,
    Zap,
    Check,
    Loader2,
    Lock,
    Smartphone,
    Copy,
    CheckCircle2
} from "lucide-react"
import {
    PayPalScriptProvider,
    PayPalButtons,
    usePayPalScriptReducer
} from "@paypal/react-paypal-js"

const PAYPAL_CLIENT_ID = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || "AakMknFYXkirSboJsgf3Pv15vn0CiP5xdkRwVqypaygJ3Q2MreapnHiHYWC70Z5c42-WiOgUuUGgnTcd"

function PaymentContent() {
    const searchParams = useSearchParams()
    const router = useRouter()
    const [isSuccess, setIsSuccess] = useState(false)
    const [paymentMethod, setPaymentMethod] = useState<'paypal' | 'momo'>(() => {
        // Default to momo if there's a suspected PayPal issue, or stick to paypal
        return 'paypal'
    })
    const [copiedIndex, setCopiedIndex] = useState<number | null>(null)


    const planId = searchParams.get('id') || 'pro'
    const amount = searchParams.get('amount') || "40"
    const rwfAmount = Number(amount) * 1600
    const cycle = searchParams.get('cycle') || 'monthly'

    const planName = planId.charAt(0).toUpperCase() + planId.slice(1)

    const handleSuccess = (details: any) => {
        setIsSuccess(true)
        setTimeout(() => {
            router.push('/?premium=success')
        }, 3000)
    }

    if (isSuccess) {
        return (
            <div className="flex flex-col items-center justify-center space-y-8 py-20 px-6">
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center shadow-[0_0_40px_rgba(34,197,94,0.4)]"
                >
                    <Check className="w-12 h-12 text-white" strokeWidth={4} />
                </motion.div>
                <div className="text-center space-y-4">
                    <h2 className="text-4xl font-black text-white">Payment Successful!</h2>
                    <p className="text-white font-bold text-xl">You are now a premium member.</p>
                    <p className="text-white/40 font-bold italic">Welcome to the inner circle, Agent.</p>
                </div>
                <p className="text-cyber-pink font-black text-sm uppercase tracking-widest animate-pulse">
                    Redirecting to your new dashboard...
                </p>
            </div>
        )
    }

    return (
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-start">
            {/* Left Side: Summary */}
            <div className="space-y-8">
                <button
                    onClick={() => router.back()}
                    className="flex items-center gap-2 text-white/40 hover:text-white transition-all font-black text-xs uppercase tracking-widest group"
                >
                    <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                    Back to Upgrade
                </button>

                <div className="space-y-4">
                    <h1 className="text-5xl font-black text-white leading-tight">Secure <br />Verification</h1>
                    <p className="text-white/40 font-bold text-lg">Your journey to elite status starts here.</p>
                </div>

                <div className="p-10 rounded-[2.5rem] bg-[#0C0F11] border border-white/5 space-y-8 relative overflow-hidden shadow-2xl">
                    <div className="absolute top-0 right-0 w-48 h-48 bg-cyber-pink/5 rounded-full blur-3xl" />

                    <div className="flex items-center justify-between relative z-10">
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30 mb-2">Authenticated Plan</p>
                            <h3 className="text-3xl font-black text-white flex items-center gap-3">
                                {planName}
                                {planId === 'premium' && <Zap className="w-6 h-6 text-cyber-pink fill-cyber-pink shadow-lg" />}
                            </h3>
                        </div>
                        <div className="text-right">
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30 mb-2">Billing</p>
                            <p className="font-black text-white text-lg capitalize">{cycle}</p>
                        </div>
                    </div>

                    <div className="h-px bg-white/10" />

                    <div className="space-y-4 relative z-10">
                        <div className="flex justify-between text-base">
                            <span className="text-white/40 font-bold italic">Verification Fee</span>
                            <span className="font-black text-white">
                                {paymentMethod === 'paypal' ? `$${amount}.00` : `${rwfAmount.toLocaleString()} FRW`}
                            </span>
                        </div>
                        <div className="flex justify-between text-base">
                            <span className="text-white/40 font-bold italic">Network Access</span>
                            <span className="text-green-500 font-bold italic">Included</span>
                        </div>
                    </div>

                    <div className="h-px bg-white/10" />

                    <div className="flex justify-between items-center relative z-10">
                        <span className="text-xl font-black uppercase tracking-[0.3em] text-white/60">Total</span>
                        <div className="text-right flex flex-col items-end">
                            <span className="text-4xl font-black text-cyber-pink drop-shadow-[0_0_15px_rgba(255,45,108,0.3)]">
                                {paymentMethod === 'paypal' ? `$${amount}.00` : `${rwfAmount.toLocaleString()} FRW`}
                            </span>
                            {paymentMethod === 'momo' && (
                                <span className="text-[10px] font-black text-white/30 uppercase tracking-widest mt-1">
                                    fixed rate: 1 USD = 1600 FRW
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-6 p-6 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-sm">
                    <ShieldCheck className="w-12 h-12 text-cyber-pink p-2 bg-cyber-pink/10 rounded-2xl shadow-inner" />
                    <div>
                        <p className="font-black text-xs uppercase tracking-[0.2em] text-white">
                            {paymentMethod === 'paypal' ? 'Encrypted Transaction' : 'Manual Verification'}
                        </p>
                        <p className="text-[11px] text-white/40 font-bold italic">
                            {paymentMethod === 'paypal'
                                ? 'Processed securely via PayPal global network.'
                                : 'Pay using USSD codes and wait for manual approval.'}
                        </p>
                    </div>
                </div>
            </div>

            {/* Right Side: PayPal Integration */}
            <div className="p-10 rounded-[3rem] bg-white text-black space-y-10 shadow-[0_40px_100px_rgba(255,45,108,0.15)] relative">
                <div className="space-y-2">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-black uppercase tracking-widest">Checkout</h2>
                        <Lock className="w-4 h-4 opacity-20" />
                    </div>
                    <div className="h-1 w-12 bg-black rounded-full" />
                </div>

                <div className="flex bg-black/5 p-1 rounded-2xl">
                    <button
                        onClick={() => setPaymentMethod('paypal')}
                        className={`flex-1 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${paymentMethod === 'paypal' ? 'bg-white shadow-sm text-black' : 'text-black/40 hover:text-black'}`}
                    >
                        PayPal / Card
                    </button>
                    <button
                        onClick={() => setPaymentMethod('momo')}
                        className={`flex-1 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${paymentMethod === 'momo' ? 'bg-white shadow-sm text-black' : 'text-black/40 hover:text-black'}`}
                    >
                        Mobile Money
                    </button>
                </div>

                <div className="min-h-[350px] flex flex-col justify-start gap-6">
                    {paymentMethod === 'paypal' ? (
                        <PayPalScriptProvider options={{
                            "clientId": PAYPAL_CLIENT_ID,
                            currency: "USD",
                            intent: "capture",
                            "disable-card-billing-address": "true"
                        }}>
                            <PayPalButtonsWrapper
                                planName={planName}
                                cycle={cycle}
                                amount={amount}
                                handleSuccess={handleSuccess}
                            />
                        </PayPalScriptProvider>
                    ) : (
                        <div className="space-y-6">
                            <div className="p-6 rounded-3xl bg-black/5 border border-black/5 space-y-4">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-black rounded-xl">
                                        <Smartphone className="w-4 h-4 text-white" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black uppercase tracking-widest opacity-40 leading-none mb-1">Account Holder</p>
                                        <p className="font-black text-sm uppercase">Ishimwe Yves</p>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-3">
                                {[
                                    {
                                        label: "Airtel Money",
                                        code: `*182*1*1*0732539470*${rwfAmount}*mobile money pin#`,
                                        subtitle: "Dial this code to pay"
                                    },
                                    {
                                        label: "MTN Money",
                                        code: `*182*1*1*0792898287*${rwfAmount}*mobile money pin#`,
                                        subtitle: "Dial this code to pay"
                                    },
                                    {
                                        label: "MTN MoMo Code",
                                        code: `*182*8*1*1915918*${rwfAmount}*mobile money pin#`,
                                        subtitle: "Use Merchant Code"
                                    }
                                ].map((item, idx) => (
                                    <div key={idx} className="group relative">
                                        <button
                                            onClick={() => {
                                                navigator.clipboard.writeText(item.code)
                                                setCopiedIndex(idx)
                                                setTimeout(() => setCopiedIndex(null), 2000)
                                            }}
                                            className="w-full text-left p-5 rounded-[2rem] bg-black/5 border border-transparent hover:border-black/10 hover:bg-black/[0.07] transition-all group"
                                        >
                                            <div className="flex justify-between items-start mb-2">
                                                <span className="text-[10px] font-black uppercase tracking-widest text-black/40">{item.label}</span>
                                                {copiedIndex === idx ? (
                                                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                                                ) : (
                                                    <Copy className="w-4 h-4 text-black/20 group-hover:text-black/40 transition-colors" />
                                                )}
                                            </div>
                                            <p className="font-black text-xs break-all leading-relaxed pr-8">
                                                {item.code}
                                            </p>
                                        </button>
                                    </div>
                                ))}
                            </div>

                            <div className="p-6 rounded-3xl bg-cyber-pink/5 border border-cyber-pink/10">
                                <p className="text-[9px] font-black uppercase tracking-[0.1em] text-cyber-pink text-center">
                                    After payment, your status will be updated manually within 5 minutes.
                                </p>
                            </div>
                        </div>
                    )}
                </div>

                <div className="space-y-6 pt-4 border-t border-black/5">
                    <div className="flex items-center gap-3 opacity-40">
                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                        <span className="text-[10px] font-black uppercase tracking-[0.2em]">Secure Server Online</span>
                    </div>
                    <p className="text-[9px] font-bold uppercase tracking-widest opacity-30 leading-relaxed text-center">
                        Subscriptions are billed automatically. You can cancel your verified status at any time in your dashboard.
                    </p>
                </div>
            </div>
        </div>
    )
}

function PayPalButtonsWrapper({ planName, cycle, amount, handleSuccess }: any) {
    const [{ isPending, isRejected }] = usePayPalScriptReducer()

    if (isRejected) {
        return (
            <div className="flex flex-col items-center justify-center py-12 gap-4 text-center">
                <div className="p-4 bg-red-50 rounded-2xl">
                    <ShieldCheck className="w-8 h-8 text-red-500 opacity-50" />
                </div>
                <div className="space-y-1">
                    <p className="text-xs font-black uppercase tracking-widest text-red-600">Gateway Error</p>
                    <p className="text-[10px] font-bold text-black/40 px-6">
                        Failed to load PayPal. This may be due to regional restrictions or an invalid Client ID.
                        Please try Mobile Money instead.
                    </p>
                </div>
            </div>
        )
    }

    return (
        <>
            {isPending && (
                <div className="flex flex-col items-center justify-center py-12 gap-4">
                    <Loader2 className="w-8 h-8 animate-spin text-black/20" />
                    <p className="text-[10px] font-black uppercase tracking-widest opacity-20">Initializing Secure Gateway...</p>
                </div>
            )}
            <PayPalButtons
                style={{
                    layout: "vertical",
                    color: "black",
                    shape: "pill",
                    label: "pay",
                    height: 55
                }}
                createOrder={(data, actions) => {
                    return actions.order.create({
                        intent: "CAPTURE",
                        purchase_units: [{
                            description: `${planName} Subscription (${cycle})`,
                            amount: {
                                currency_code: "USD",
                                value: amount
                            },
                            items: [{
                                name: `${planName} Verified Status`,
                                unit_amount: {
                                    currency_code: "USD",
                                    value: amount
                                },
                                quantity: "1",
                                category: "DIGITAL_GOODS"
                            }]
                        }]
                    });
                }}
                onApprove={async (data, actions) => {
                    if (actions.order) {
                        const details = await actions.order.capture();
                        handleSuccess(details);
                        return Promise.resolve();
                    }
                }}
                onError={(err) => {
                    console.error("PayPal Error:", err);
                }}
            />
        </>
    )
}

export default function PaymentPage() {
    return (
        <div className="min-h-screen bg-black py-24 px-8">
            <Suspense fallback={
                <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6">
                    <Loader2 className="w-12 h-12 text-cyber-pink animate-spin opacity-20" />
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/20">Initializing Gateways...</p>
                </div>
            }>
                <PaymentContent />
            </Suspense>
        </div>
    )
}
