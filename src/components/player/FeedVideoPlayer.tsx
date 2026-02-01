"use client"

import React, { useState, useRef, useEffect } from 'react';
import {
    Play,
    Pause,
    Volume2,
    VolumeX,
    Maximize,
    Minimize,
    Loader2,
    Settings,
    Check,
    RotateCcw,
    RotateCw,
    X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface FeedVideoPlayerProps {
    src: string;
    poster?: string;
}

type Quality = 'auto' | '1080p' | '720p' | '480p' | '360p' | '240p' | '144p';

// Global state for volume across all instances
let globalMuted = true;
const globalListeners = new Set<(muted: boolean) => void>();

const setGlobalMuted = (muted: boolean) => {
    globalMuted = muted;
    globalListeners.forEach(listener => listener(muted));
};

export function FeedVideoPlayer({ src, poster }: FeedVideoPlayerProps) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    const [isPlaying, setIsPlaying] = useState(false);
    const [isMuted, setIsMuted] = useState(globalMuted);
    const [progress, setProgress] = useState(0);
    const [isHovering, setIsHovering] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [isMetadataLoaded, setIsMetadataLoaded] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);

    // Quality Selection State
    const [quality, setQuality] = useState<Quality>('auto');
    const [showQualityMenu, setShowQualityMenu] = useState(false);
    const [currentSrc, setCurrentSrc] = useState<string | null>(null);

    // Sync with global mute state
    useEffect(() => {
        const listener = (muted: boolean) => {
            setIsMuted(muted);
            if (videoRef.current) videoRef.current.muted = muted;
        };
        globalListeners.add(listener);
        return () => { globalListeners.delete(listener); };
    }, []);

    // Dynamic Quality Logic
    useEffect(() => {
        if (!src.includes('res.cloudinary.com')) {
            setCurrentSrc(src);
            return;
        }

        let transform = 'q_auto,f_auto';
        if (quality === 'auto') {
            // @ts-ignore
            const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
            if (connection) {
                const speed = connection.downlink;
                if (speed < 0.5) transform = 'q_auto:low,w_256';
                else if (speed < 1.0) transform = 'q_auto:eco,w_426';
                else if (speed < 1.5) transform = 'q_auto:eco,w_640';
                else if (speed < 3.0) transform = 'q_auto:good,w_854';
                else if (speed < 6.0) transform = 'q_auto:good,w_1280';
                else transform = 'q_auto:best,w_1920';
            }
        } else {
            switch (quality) {
                case '1080p': transform = 'q_auto:best,w_1920'; break;
                case '720p': transform = 'q_auto:good,w_1280'; break;
                case '480p': transform = 'q_auto:good,w_854'; break;
                case '360p': transform = 'q_auto:eco,w_640'; break;
                case '240p': transform = 'q_auto:low,w_426'; break;
                case '144p': transform = 'q_auto:low,w_256'; break;
            }
        }

        // Precise Cloudinary URL injection
        let newSrc = src;
        if (src.includes('res.cloudinary.com')) {
            // Find the /upload/ part and insert transformation after it, but before the version/id
            const uploadPart = '/upload/';
            const parts = src.split(uploadPart);
            if (parts.length === 2) {
                newSrc = `${parts[0]}${uploadPart}${transform}/${parts[1]}`;
            }
        }

        const currentTime = videoRef.current?.currentTime || 0;
        setCurrentSrc(newSrc);

        if (videoRef.current) {
            const handleLoaded = () => {
                if (videoRef.current) {
                    videoRef.current.currentTime = currentTime;
                    if (isPlaying) videoRef.current.play().catch(() => { });
                    videoRef.current.removeEventListener('loadeddata', handleLoaded);
                }
            };
            videoRef.current.addEventListener('loadeddata', handleLoaded);
        }
    }, [quality, src]);

    // Intersection Observer for Autoplay
    useEffect(() => {
        if (isFullscreen) return;
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    const video = videoRef.current;
                    if (!video) return;
                    if (entry.isIntersecting) {
                        video.muted = globalMuted;
                        setIsMuted(globalMuted);
                        video.play().catch(() => {
                            video.muted = true;
                            setIsMuted(true);
                            video.play().catch(() => setIsPlaying(false));
                        });
                    } else {
                        video.pause();
                        setIsPlaying(false);
                    }
                });
            },
            { threshold: 0.4 }
        );
        if (containerRef.current) observer.observe(containerRef.current);
        return () => observer.disconnect();
    }, [src, isFullscreen]);

    const handleTogglePlay = (e?: React.MouseEvent) => {
        if (e) e.stopPropagation();
        const video = videoRef.current;
        if (!video) return;
        if (video.paused) {
            video.play().catch(() => {
                video.muted = true;
                setGlobalMuted(true);
                video.play();
            });
        } else {
            video.pause();
        }
    };

    const toggleMute = (e: React.MouseEvent) => {
        e.stopPropagation();
        const video = videoRef.current;
        if (!video) return;
        const newMuteState = !video.muted;
        video.muted = newMuteState;
        video.volume = 1;
        setGlobalMuted(newMuteState);
    };

    const toggleFullscreen = (e: React.MouseEvent) => {
        e.stopPropagation();
        setIsFullscreen(!isFullscreen);
    };

    const skip = (e: React.MouseEvent, seconds: number) => {
        e.stopPropagation();
        const video = videoRef.current;
        if (!video) return;
        video.currentTime = Math.max(0, Math.min(video.duration, video.currentTime + seconds));
    };

    const handleProgressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        e.stopPropagation();
        const video = videoRef.current;
        if (!video) return;
        const newTime = (parseFloat(e.target.value) / 100) * video.duration;
        video.currentTime = newTime;
        setProgress(parseFloat(e.target.value));
    };

    return (
        <div
            ref={containerRef}
            className={`group transition-all duration-500 ${isFullscreen
                ? 'fixed inset-0 z-[9999] bg-black flex items-center justify-center p-0 md:p-12'
                : 'relative w-full h-full'
                }`}
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => { setIsHovering(false); setShowQualityMenu(false); }}
        >
            {/* Backdrop for Maximize Mode */}
            {isFullscreen && (
                <div
                    className="absolute inset-0 bg-black/95 backdrop-blur-2xl -z-10 cursor-pointer"
                    onClick={() => setIsFullscreen(false)}
                />
            )}

            <div className={`relative w-full h-full flex items-center justify-center overflow-hidden transition-all duration-500 ${isFullscreen ? 'max-w-6xl aspect-[16/9] md:aspect-video rounded-3xl shadow-[0_0_100px_rgba(0,0,0,0.8)] border border-white/10' : ''
                }`}>
                {/* Skeleton Loading */}
                {!isMetadataLoaded && (
                    <div className="absolute inset-0 bg-[#0a0a0a] animate-pulse flex items-center justify-center z-10">
                        <Loader2 className="w-10 h-10 text-cyber-pink animate-spin opacity-20" />
                    </div>
                )}

                {currentSrc && (
                    <video
                        ref={videoRef}
                        src={currentSrc}
                        poster={poster || (src.includes('res.cloudinary.com') ? src.replace(/\.[^/.]+$/, ".jpg") : undefined)}
                        playsInline
                        loop
                        muted={isMuted}
                        autoPlay
                        preload="auto"
                        onTimeUpdate={() => {
                            const video = videoRef.current;
                            if (video && video.duration > 0) {
                                setProgress((video.currentTime / video.duration) * 100);
                            }
                        }}
                        onLoadedMetadata={() => {
                            setIsMetadataLoaded(true);
                            setIsLoading(false);
                        }}
                        onWaiting={() => setIsLoading(true)}
                        onCanPlay={() => {
                            setIsLoading(false);
                            setIsMetadataLoaded(true);
                        }}
                        onPlay={() => setIsPlaying(true)}
                        onPause={() => setIsPlaying(false)}
                        className={`w-full h-full ${isFullscreen ? 'object-contain' : 'object-cover'} transition-opacity duration-500 ${isMetadataLoaded ? 'opacity-100' : 'opacity-0'}`}
                        onClick={() => handleTogglePlay()}
                    />
                )}

                {/* Buffer Overlay */}
                {isLoading && isMetadataLoaded && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/20 z-20 pointer-events-none">
                        <Loader2 className="w-8 h-8 text-cyber-pink animate-spin" />
                    </div>
                )}

                {/* UI Overlay Controls */}
                <div
                    className={`absolute inset-0 z-40 flex flex-col justify-between p-6 transition-all duration-500 bg-gradient-to-b from-black/60 via-transparent to-black/80 ${isHovering || !isPlaying ? 'opacity-100' : 'opacity-0 pointer-events-none'
                        }`}
                >
                    {/* Header: Timestamp and Close */}
                    <div className="flex justify-between items-start pointer-events-auto">
                        <div className="bg-black/40 backdrop-blur-md border border-white/10 rounded-2xl px-3 py-1.5 text-[11px] font-black uppercase tracking-[0.2em] text-white/80">
                            {progress.toFixed(0)}% • {Math.floor(videoRef.current?.currentTime || 0)}s
                        </div>
                        {isFullscreen && (
                            <button
                                onClick={(e) => { e.stopPropagation(); setIsFullscreen(false); }}
                                className="w-12 h-12 flex items-center justify-center rounded-full bg-white/10 hover:bg-cyber-pink/20 hover:text-cyber-pink hover:border-cyber-pink/50 backdrop-blur-md transition-all text-white border border-white/20 shadow-lg"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        )}
                    </div>

                    {/* Middle: Skip and Primary Play */}
                    <div className="flex items-center justify-center gap-12 pointer-events-auto">
                        <button onClick={(e) => skip(e, -10)} className="p-4 text-white hover:text-cyber-pink transition-all transform active:scale-90 bg-white/5 rounded-full border border-white/10 hover:bg-white/10">
                            <RotateCcw className="w-6 h-6" />
                        </button>
                        <button
                            onClick={handleTogglePlay}
                            className="w-20 h-20 flex items-center justify-center rounded-full bg-cyber-pink/10 backdrop-blur-md border border-cyber-pink/40 text-cyber-pink shadow-[0_0_30px_rgba(255,45,108,0.2)] hover:scale-110 transition-transform"
                        >
                            {isPlaying ? <Pause className="w-10 h-10 fill-cyber-pink" /> : <Play className="w-10 h-10 fill-cyber-pink ml-2" />}
                        </button>
                        <button onClick={(e) => skip(e, 10)} className="p-4 text-white hover:text-cyber-pink transition-all transform active:scale-90 bg-white/5 rounded-full border border-white/10 hover:bg-white/10">
                            <RotateCw className="w-6 h-6" />
                        </button>
                    </div>

                    {/* Footer: Timeline and Secondary Controls */}
                    <div className="space-y-6 pointer-events-auto">
                        {/* THE TIMELINE (SCREDRUBBER) */}
                        <div className="group/progress relative h-1.5 flex items-center cursor-pointer">
                            <div className="absolute inset-0 bg-white/10 rounded-full" />
                            <div
                                className="absolute inset-y-0 left-0 bg-cyber-pink rounded-full shadow-[0_0_15px_rgba(255,45,108,0.6)]"
                                style={{ width: `${progress}%` }}
                            />
                            <input
                                type="range"
                                min="0"
                                max="100"
                                value={isNaN(progress) ? 0 : progress}
                                step="0.1"
                                onChange={handleProgressChange}
                                onClick={(e) => e.stopPropagation()}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                            />
                            {/* Draggable head */}
                            <div
                                className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full border-2 border-cyber-pink shadow-xl opacity-0 group-hover/progress:opacity-100 transition-opacity"
                                style={{ left: `calc(${progress}% - 8px)` }}
                            />
                        </div>

                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-7">
                                <button onClick={toggleMute} className="p-3 text-white hover:text-cyber-pink transition-all bg-black/40 backdrop-blur-md border border-white/10 rounded-2xl">
                                    {isMuted ? <VolumeX className="w-6 h-6" /> : <Volume2 className="w-6 h-6" />}
                                </button>
                                <div className="relative">
                                    <button
                                        onClick={(e) => { e.stopPropagation(); setShowQualityMenu(!showQualityMenu); }}
                                        className={`p-3 rounded-2xl transition-all border border-white/10 backdrop-blur-md ${showQualityMenu ? 'bg-cyber-pink text-white border-cyber-pink' : 'bg-black/40 text-white'}`}
                                    >
                                        <Settings className="w-6 h-6" />
                                    </button>
                                    {showQualityMenu && (
                                        <div className="absolute bottom-[calc(100%+16px)] left-0 z-50 bg-black/90 backdrop-blur-xl border border-white/10 rounded-2xl p-2 min-w-[150px] shadow-2xl animate-in fade-in slide-in-from-bottom-2 origin-bottom-left" onClick={e => e.stopPropagation()}>
                                            {(['1080p', '720p', '480p', '360p', '240p', '144p', 'auto'] as Quality[]).map((q) => (
                                                <button
                                                    key={q}
                                                    onClick={() => { setQuality(q); setShowQualityMenu(false); }}
                                                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${quality === q ? 'bg-cyber-pink text-white shadow-lg' : 'text-white/40 hover:bg-white/5 hover:text-white'}`}
                                                >
                                                    <span>{q}</span>
                                                    {quality === q && <Check className="w-3.5 h-3.5" />}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {!isFullscreen && (
                                <button onClick={toggleFullscreen} className="p-3 text-white/60 hover:text-white bg-black/40 backdrop-blur-md border border-white/10 rounded-2xl transition-all">
                                    <Maximize className="w-6 h-6" />
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
