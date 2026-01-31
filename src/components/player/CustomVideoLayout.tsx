import { Controls, PlayButton, TimeSlider, Time, MuteButton, VolumeSlider, FullscreenButton, SeekButton, CaptionButton, Gesture } from '@vidstack/react';
import {
    Play,
    Pause,
    RotateCcw,
    RotateCw,
    Volume2,
    VolumeX,
    Settings,
    Maximize,
    Minimize,
    Subtitles
} from 'lucide-react';

export function CustomVideoLayout() {
    return (
        <>
            {/* Gestures for intuitive control */}
            <Gesture className="absolute inset-0 z-0 block h-full w-full" event="pointerup" action="toggle:paused" />
            <Gesture className="absolute inset-0 z-0 block h-full w-full" event="dblpointerup" action="toggle:fullscreen" />

            {/* Center Play Button Overlay */}
            <div className="absolute inset-0 z-0 flex items-center justify-center pointer-events-none">
                <div className="w-16 h-16 bg-black/50 rounded-full flex items-center justify-center backdrop-blur-sm opacity-0 data-[paused]:opacity-100 transition-opacity duration-200">
                    <Play className="w-8 h-8 fill-white text-white ml-1" />
                </div>
            </div>

            {/* Controls Layer - Always visible for now to ensure accessibility */}
            <Controls.Root className="absolute inset-0 z-20 flex flex-col justify-end bg-gradient-to-t from-black/80 via-black/20 to-transparent p-4 opacity-100 transition-opacity duration-200 data-[hidden]:opacity-0">

                {/* Top: Progress Bar */}
                <div className="w-full mb-4 group">
                    <TimeSlider.Root className="group relative flex h-2 w-full items-center cursor-pointer touch-none select-none">
                        <TimeSlider.Track className="relative h-[4px] w-full rounded-full bg-white/20 group-hover:h-[6px] transition-all">
                            {/* Buffer/Loaded Progress - Put BEHIND the playback fill */}
                            <TimeSlider.Progress className="absolute top-1/2 -translate-y-1/2 h-full rounded-full bg-white/40 will-change-[width] z-0" />
                            {/* Playback Progress - Pink - Put ON TOP */}
                            <TimeSlider.TrackFill className="absolute top-1/2 -translate-y-1/2 h-full rounded-full bg-[#FF2D6C] will-change-[width] z-10" />
                        </TimeSlider.Track>
                        <TimeSlider.Thumb className="absolute top-1/2 -translate-y-1/2 h-4 w-4 rounded-full bg-white shadow-lg ring-2 ring-black/20 z-20 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </TimeSlider.Root>
                </div>

                <div className="flex items-center justify-between w-full h-10">
                    {/* Left Controls */}
                    <div className="flex items-center gap-4">
                        <PlayButton className="group flex items-center justify-center outline-none ring-inset ring-cyber-pink focus:ring-2 rounded-sm cursor-pointer">
                            <Play className="w-7 h-7 fill-white text-white hidden data-[paused]:block" />
                            <Pause className="w-7 h-7 fill-white text-white hidden data-[playing]:block" />
                        </PlayButton>

                        <div className="flex items-center gap-3">
                            <SeekButton seconds={-10} className="group outline-none text-white/90 hover:text-cyber-pink transition-colors">
                                <div className="relative flex items-center justify-center">
                                    <RotateCcw className="w-5 h-5" />
                                    <span className="absolute text-[8px] font-bold mt-[1px]">10</span>
                                </div>
                            </SeekButton>
                            <SeekButton seconds={10} className="group outline-none text-white/90 hover:text-cyber-pink transition-colors">
                                <div className="relative flex items-center justify-center">
                                    <RotateCw className="w-5 h-5" />
                                    <span className="absolute text-[8px] font-bold mt-[1px]">10</span>
                                </div>
                            </SeekButton>
                        </div>

                        <div className="flex items-center gap-2 group/volume">
                            <MuteButton className="group outline-none text-white hover:text-cyber-pink transition-colors">
                                <Volume2 className="w-6 h-6 hidden data-[volume=high]:block" />
                                <Volume2 className="w-6 h-6 hidden data-[volume=low]:block" />
                                <VolumeX className="w-6 h-6 hidden data-[muted]:block" />
                            </MuteButton>
                        </div>

                        <div className="flex items-center gap-1 text-xs font-bold text-white/90 font-mono tracking-widest">
                            <Time type="current" />
                            <span className="text-white/50">/</span>
                            <Time type="duration" />
                        </div>
                    </div>

                    {/* Right Controls */}
                    <div className="flex items-center gap-4">
                        <CaptionButton className="group outline-none text-white/80 hover:text-white">
                            <Subtitles className="w-6 h-6 data-[active]:text-cyber-cyan" />
                        </CaptionButton>

                        <button className="text-white/80 hover:text-white">
                            <Settings className="w-5 h-5" />
                        </button>

                        <FullscreenButton className="group outline-none text-white/80 hover:text-white">
                            <Maximize className="w-5 h-5 block data-[active]:hidden" />
                            <Minimize className="w-5 h-5 hidden data-[active]:block" />
                        </FullscreenButton>
                    </div>
                </div>
            </Controls.Root>
        </>
    );
}
