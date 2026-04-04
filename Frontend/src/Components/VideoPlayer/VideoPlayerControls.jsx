import React, { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    Play, Pause, Volume2, VolumeX, Maximize, Minimize,
    SkipBack, SkipForward, PictureInPicture, Gauge, Check, Settings,
    Highlighter, Music
} from 'lucide-react'
import { LoadingDots } from '../Common/LoadingIndicator'
import { formatDuration } from '../../utils/formatters'

const QUALITY_OPTIONS = [
    { label: 'Auto', value: 'auto' },
    { label: '1080p', value: '1080' },
    { label: '720p', value: '720' },
    { label: '480p', value: '480' },
    { label: '240p', value: '240' },
    { label: 'Music', value: 'audio' }
]

const VideoPlayerControls = React.memo(({
    videoRef,
    isPlaying,
    togglePlay,
    volume,
    handleVolumeChange,
    isMuted,
    toggleMute,
    progress,
    handleProgressClick,
    currentTime,
    duration,
    isBuffering,
    showControls,
    setShowControls,
    isFullscreen,
    toggleFullscreen,
    skipTime: _skipTime,
    togglePiP,
    playbackSpeed,
    changePlaybackSpeed,
    showSettingsMenu,
    setShowSettingsMenu,
    video, // for thumbnail/source
    SPEED_OPTIONS
}) => {
    const [quality, setQuality] = useState('auto')
    const [activeTab, setActiveTab] = useState('speed') // 'speed' or 'quality' inside settings
    const [isChangingQuality, setIsChangingQuality] = useState(false); // Loading state for quality change

    // Scrub Preview State
    const [hoverTime, setHoverTime] = useState(0);
    const [hoverPos, setHoverPos] = useState(0); // in pixels
    const [showPreview, setShowPreview] = useState(false);

    // Dynamic source generation
    // Cloudinary allows on-the-fly transformations. We inject params into the URL.
    const videoSource = useMemo(() => {
        if (!video?.videoFile?.url) return null;
        if (quality === 'auto') return video.videoFile.url;

        // Transform logic: Inject params after '/upload/'
        // 1080p: q_auto:best,w_1920
        // 720p: q_auto:good,w_1280
        // 480p: q_auto:eco,w_854
        const transforms = {
            '1080': 'q_auto:best,w_1920',
            '720': 'q_auto:good,w_1280',
            '480': 'q_auto:eco,w_854',
            '240': 'q_auto:low,w_426',
            'audio': 'f_mp3' // Audio only
        }

        const params = transforms[quality];
        return video.videoFile.url.replace('/upload/', `/upload/${params}/`);
    }, [video, quality]);

    // Get URL for a specific quality
    const getQualityUrl = (q) => {
        if (!video?.videoFile?.url) return null;
        if (q === 'auto') return video.videoFile.url;

        const transforms = {
            '1080': 'q_auto:best,w_1920',
            '720': 'q_auto:good,w_1280',
            '480': 'q_auto:eco,w_854',
            '240': 'q_auto:low,w_426',
            'audio': 'f_mp3'
        };

        const params = transforms[q];
        return video.videoFile.url.replace('/upload/', `/upload/${params}/`);
    };

    // State for pending quality (preloading in background)
    const [pendingQuality, setPendingQuality] = useState(null);
    const preloadRef = React.useRef(null);

    // Handle quality change - seamlessly preload and switch when ready
    const handleQualityChange = (newQuality) => {
        if (!videoRef.current || quality === newQuality || pendingQuality === newQuality) return;

        setShowSettingsMenu(false);

        // If switching to auto, do it immediately (no transformation needed)
        if (newQuality === 'auto') {
            const savedTime = videoRef.current.currentTime;
            const wasPlaying = !videoRef.current.paused;
            setQuality('auto');
            setTimeout(() => {
                if (videoRef.current) {
                    videoRef.current.currentTime = savedTime;
                    if (wasPlaying) videoRef.current.play().catch(() => { });
                }
            }, 50);
            return;
        }

        // For other qualities, preload in background
        setPendingQuality(newQuality);

        const newUrl = getQualityUrl(newQuality);
        const preloadVideo = document.createElement('video');
        preloadVideo.preload = 'auto';
        preloadVideo.muted = true;
        preloadVideo.src = newUrl;
        preloadRef.current = preloadVideo;

        const savedTime = videoRef.current.currentTime;
        const wasPlaying = !videoRef.current.paused;

        // When preload has enough data, switch seamlessly
        const onCanPlay = () => {
            if (!videoRef.current) return;

            // Switch to the new quality
            setQuality(newQuality);
            setPendingQuality(null);

            setTimeout(() => {
                if (videoRef.current) {
                    videoRef.current.currentTime = savedTime;
                    if (wasPlaying) videoRef.current.play().catch(() => { });
                }
            }, 50);

            // Cleanup
            preloadVideo.remove();
            preloadRef.current = null;
        };

        const onError = () => {
            console.warn(`Quality ${newQuality} not available, staying on current`);
            setPendingQuality(null);
            preloadVideo.remove();
            preloadRef.current = null;
        };

        preloadVideo.addEventListener('canplay', onCanPlay, { once: true });
        preloadVideo.addEventListener('error', onError, { once: true });

        // Timeout: if preload takes too long, cancel silently
        setTimeout(() => {
            if (pendingQuality === newQuality && preloadRef.current) {
                console.warn(`Quality ${newQuality} timed out, staying on current`);
                setPendingQuality(null);
                preloadVideo.remove();
                preloadRef.current = null;
            }
        }, 15000); // 15 second timeout

        preloadVideo.load();
    }

    const handleTimelineMouseMove = (e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const percent = Math.max(0, Math.min(1, x / rect.width));
        const time = percent * duration;

        setHoverTime(time);
        // Clamp position to keep 160px preview within timeline (80px from each edge)
        const clampedX = Math.max(80, Math.min(x, rect.width - 80));
        setHoverPos(clampedX);
        setShowPreview(true);
    };

    const handleTimelineMouseLeave = () => {
        setShowPreview(false);
    };

    // Get preview URL (Cloudinary)
    const previewUrl = useMemo(() => {
        if (!video?.videoFile?.url || !showPreview) return null;
        // Build frame URL: .../upload/w_160,so_{time}/... .jpg
        // Note: Using 'q_auto:low' for faster preview loading
        const baseUrl = video.videoFile.url;
        const timeStr = Math.floor(hoverTime); // Use integer seconds for better cache hit rate
        const insertParams = `w_160,h_90,q_auto:low,so_${timeStr}`;

        // Simple replace for standard Cloudinary URLs
        // Replace .mp4/webm/mkv with .jpg
        let url = baseUrl.replace('/upload/', `/upload/${insertParams}/`);
        url = url.substring(0, url.lastIndexOf('.')) + '.jpg';
        return url;
    }, [video, hoverTime, showPreview]);

    const [hasPlayed, setHasPlayed] = useState(false); // Track if played to hide poster

    return (
        <div
            id="video-container"
            className="relative aspect-video bg-black rounded-xl overflow-hidden shadow-2xl border border-zinc-900 group select-none ring-1 ring-white/5"
            onMouseEnter={() => setShowControls(true)}
            onMouseLeave={() => !isPlaying && setShowControls(true)}
            onMouseMove={() => setShowControls(true)}
        >
            <video
                ref={videoRef}
                src={videoSource}
                className="w-full h-full object-contain cursor-pointer"
                onClick={togglePlay}
                poster={hasPlayed ? "" : video?.thumbnail?.url}
                playsInline
                autoPlay
                crossOrigin="anonymous"
                onPlay={() => {
                    !isPlaying && togglePlay();
                    setHasPlayed(true);
                }}
                onPause={() => isPlaying && togglePlay()}
                onError={(_e) => {
                    // If quality switch fails (Cloudinary transformation timeout), fallback to auto
                    if (quality !== 'auto') {
                        console.warn('Quality switch failed, falling back to auto');
                        setQuality('auto');
                        setIsChangingQuality(false);
                    }
                }}
            />

            {/* Buffering/loading overlay */}
            <AnimatePresence>
                {(isBuffering || isChangingQuality) && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 flex items-center justify-center bg-black/30 pointer-events-none z-20"
                    >
                        <div className="bg-white/10 p-5 rounded-full backdrop-blur-xl border border-white/20 shadow-2xl">
                            <LoadingDots size="lg" className="text-white" />
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Cinematic gradient overlays */}
            {/* Top Shadow for visibility */}
            <div className={`absolute inset-x-0 top-0 h-32 bg-linear-to-b from-black/80 to-transparent pointer-events-none transition-opacity duration-500 ${showControls ? 'opacity-100' : 'opacity-0'}`} />

            {/* Center Play Button (Modern Glass) */}
            <AnimatePresence>
                {!isPlaying && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        className="absolute inset-0 flex items-center justify-center bg-black/20 backdrop-blur-[2px]"
                        onClick={togglePlay}
                    >
                        <motion.button
                            whileHover={{ scale: 1.1, backgroundColor: "rgba(244, 63, 94, 0.9)" }}
                            whileTap={{ scale: 0.95 }}
                            className="w-24 h-24 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center border border-white/20 shadow-[0_0_50px_rgba(244,63,94,0.25)] group/play"
                        >
                            <Play className="w-10 h-10 text-white fill-white translate-x-1 transition-all group-hover/play:scale-110" />
                        </motion.button>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Controls bar */}
            <div className={`
                absolute inset-x-0 bottom-0 px-4 md:px-6 pb-4 md:pb-6 pt-24
                bg-linear-to-t from-black/95 via-black/80 to-transparent 
                transition-opacity duration-300 ease-out
                ${showControls || !isPlaying ? 'opacity-100' : 'opacity-0'}
            `}>

                {/* Progress Bar (Cinema Style) */}
                <div
                    className="group/timeline relative mb-4 cursor-pointer"
                    onClick={handleProgressClick}
                    onMouseMove={handleTimelineMouseMove}
                    onMouseLeave={handleTimelineMouseLeave}
                >
                    {/* Hover Preview Tooltip */}
                    <AnimatePresence>
                        {showPreview && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9, y: 10 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.9, y: 10 }}
                                className="absolute bottom-8 flex flex-col items-center z-30 pointer-events-none"
                                style={{ left: hoverPos, transform: 'translateX(-50%)' }}
                            >
                                <div className="w-40 h-22.5 bg-black rounded-lg border border-white/30 overflow-hidden shadow-2xl relative flex items-center justify-center">
                                    {previewUrl ? (
                                        <img
                                            src={previewUrl}
                                            alt="Preview"
                                            className="w-full h-full object-cover"
                                            onError={(e) => {
                                                e.target.style.display = 'none';
                                            }}
                                        />
                                    ) : (
                                        <div className="w-full h-full bg-zinc-900 flex items-center justify-center">
                                            <LoadingDots size="sm" className="text-white/40" />
                                        </div>
                                    )}
                                    <div className="absolute inset-0 bg-linear-to-t from-black/80 to-transparent" />
                                    <span className="absolute bottom-1.5 left-1/2 -translate-x-1/2 px-2 py-0.5 bg-black/90 rounded text-xs font-mono font-bold text-white shadow-lg">
                                        {formatDuration(hoverTime)}
                                    </span>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Hover Preview Area (Invisible but captures hover) */}
                    <div className="absolute -top-3 bottom-0 w-full h-6 z-10" />

                    {/* Background Track */}
                    <div className="w-full h-1 bg-white/20 rounded-full overflow-hidden group-hover/timeline:h-1.5 transition-all duration-300">
                        {/* Buffered (Static for now, could assume 100 or use buffered prop) */}
                        <div className="absolute inset-0 bg-white/5" />

                        {/* Progress Fill */}
                        <div
                            className="h-full bg-rose-500 relative"
                            style={{ width: `${progress}%` }}
                        >
                            {/* Glow Effect */}
                            <div className="absolute right-0 top-0 bottom-0 w-4 bg-rose-400 blur-xs" />
                        </div>
                    </div>

                    {/* Scrubber Knob - clamped to prevent overflow at edges */}
                    <div
                        className="absolute top-1/2 -mt-1.5 w-3 h-3 bg-white rounded-full shadow-lg opacity-0 group-hover/timeline:opacity-100 transition-opacity duration-200 pointer-events-none"
                        style={{ left: `clamp(6px, ${progress}%, calc(100% - 6px))`, transform: 'translateX(-50%)' }}
                    />
                </div>

                <div className="flex items-center justify-between">
                    {/* LEFT CONTROLS */}
                    <div className="flex items-center gap-4">
                        <button
                            onClick={togglePlay}
                            className="hover:text-rose-400 transition-colors"
                            aria-label={isPlaying ? "Pause video" : "Play video"}
                        >
                            {isPlaying ? <Pause className="w-8 h-8 fill-current" /> : <Play className="w-8 h-8 fill-current" />}
                        </button>

                        <div className="hidden sm:flex items-center gap-2 text-zinc-400 hover:text-white transition-colors group/volume">
                            <button onClick={toggleMute} aria-label={isMuted || volume === 0 ? "Unmute" : "Mute"}>
                                {isMuted || volume === 0 ? <VolumeX className="w-6 h-6" /> : <Volume2 className="w-6 h-6" />}
                            </button>
                            <div className="w-0 group-hover/volume:w-24 transition-all duration-300 overflow-hidden">
                                <input
                                    type="range" min="0" max="1" step="0.05"
                                    value={volume} onChange={handleVolumeChange}
                                    className="w-20 h-1 bg-white/20 rounded-lg appearance-none cursor-pointer accent-white"
                                />
                            </div>
                        </div>

                        <div className="text-sm font-medium font-mono text-zinc-300">
                            {formatDuration(currentTime)} <span className="text-zinc-600">/</span> {formatDuration(duration)}
                        </div>
                    </div>

                    {/* RIGHT CONTROLS */}
                    <div className="flex items-center gap-4">
                        {/* Settings Menu */}
                        <div className="relative">
                            <button
                                onClick={() => setShowSettingsMenu(!showSettingsMenu)}
                                className={`p-2 rounded-lg transition-all ${showSettingsMenu ? 'bg-white/20 rotate-45' : 'hover:bg-white/10'}`}
                            >
                                <Settings className="w-5 h-5" />
                            </button>

                            <AnimatePresence>
                                {showSettingsMenu && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: 20, scale: 0.95 }}
                                        className="absolute bottom-14 right-0 w-64 bg-[#0F0F0F]/95 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-50 flex flex-col"
                                    >
                                        {/* Menu Header / Tabs */}
                                        <div className="flex border-b border-white/5">
                                            <button
                                                onClick={() => setActiveTab('speed')}
                                                className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider transition-colors ${activeTab === 'speed' ? 'text-white bg-white/5' : 'text-zinc-500 hover:text-zinc-300'}`}
                                            >
                                                Speed
                                            </button>
                                            <button
                                                onClick={() => setActiveTab('quality')}
                                                className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider transition-colors ${activeTab === 'quality' ? 'text-white bg-white/5' : 'text-zinc-500 hover:text-zinc-300'}`}
                                            >
                                                Quality
                                            </button>
                                        </div>

                                        {/* Menu Content */}
                                        <div className="max-h-60 overflow-y-auto p-2 scrollbar-thin scrollbar-thumb-white/20">
                                            {activeTab === 'speed' && (
                                                <div className="space-y-1">
                                                    {SPEED_OPTIONS.map(speed => (
                                                        <button
                                                            key={speed}
                                                            onClick={() => changePlaybackSpeed(speed)}
                                                            className={`w-full px-3 py-2 rounded-lg text-sm flex items-center justify-between ${playbackSpeed === speed ? 'bg-white text-black' : 'text-zinc-400 hover:bg-white/10'}`}
                                                        >
                                                            <span>{speed === 1 ? 'Normal' : `${speed}x`}</span>
                                                            {playbackSpeed === speed && <Check className="w-4 h-4" />}
                                                        </button>
                                                    ))}
                                                </div>
                                            )}

                                            {activeTab === 'quality' && (
                                                <div className="space-y-1">
                                                    {QUALITY_OPTIONS.map(opt => (
                                                        <button
                                                            key={opt.value}
                                                            onClick={() => handleQualityChange(opt.value)}
                                                            className={`w-full px-3 py-2 rounded-lg text-sm flex items-center justify-between transition-colors ${quality === opt.value ? 'bg-rose-500 text-white' : pendingQuality === opt.value ? 'bg-rose-600/20 text-rose-400' : 'text-zinc-400 hover:bg-white/10'}`}
                                                        >
                                                            <span className="flex items-center gap-2">
                                                                {opt.value === 'audio' ? <Music className="w-3 h-3" /> : (opt.value !== 'auto' && <Highlighter className="w-3 h-3" />)}
                                                                {opt.label}
                                                            </span>
                                                            {quality === opt.value && <Check className="w-4 h-4" />}
                                                            {pendingQuality === opt.value && <LoadingDots size="xs" />}
                                                        </button>
                                                    ))}
                                                    <p className="text-[10px] text-zinc-600 px-3 mt-2 text-center">
                                                        {pendingQuality ? 'Processing new quality...' : 'Seamless quality switching'}
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* Standard Controls */}
                        <button onClick={togglePiP} className="p-2 hover:bg-white/10 rounded-lg hidden sm:block">
                            <PictureInPicture className="w-5 h-5" />
                        </button>

                        <button onClick={toggleFullscreen} className="p-2 hover:bg-white/10 rounded-lg" aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}>
                            {isFullscreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
})

export default VideoPlayerControls
