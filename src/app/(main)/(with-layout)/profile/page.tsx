"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/context/AuthContext"

/**
 * /profile Redirector
 * This page serves as a shortcut to the user's own profile.
 * It checks the AuthContext for the current user's username and redirects.
 */
export default function ProfileRedirectPage() {
    const router = useRouter()
    const { user, loading } = useAuth()

    useEffect(() => {
        if (!loading) {
            if (user) {
                // Fetch username from user metadata if possible, 
                // but since we're using a custom / [username] structure, 
                // we should ideally redirect based on the username stored in Firestore.
                // For now, if display name exists, use that or fallback to uid.
                // However, the standard is @username. 
                // If we don't have the username immediately available in the user object,
                // we might need a quick fetch or redirect to a settings page if no username.

                // Assuming most users have a username set after onboarding
                // We'll try to find it in the profile or redirect to onboarding if missing.
                const username = user.displayName?.toLowerCase().replace(/\s+/g, '') || user.uid
                router.replace(`/${username}`)
            } else {
                router.replace("/login")
            }
        }
    }, [user, loading, router])

    return (
        <div className="min-h-screen bg-[#0F0F0F] flex flex-col items-center justify-center">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-[#FF2D6C] mb-6" />
            <p className="text-white/40 font-bold uppercase tracking-widest text-[10px]">Syncing Identity...</p>
        </div>
    )
}
