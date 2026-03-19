import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Upload, Film, FileText, Tag, Sparkles, Check, Image, Video, X, Zap } from 'lucide-react';
import toast from 'react-hot-toast';
import { compressVideo } from '../utils/compressVideo';
import { useUpload } from '../context/UploadContext';

export default function UploadVideo() {
  const navigate = useNavigate();
  const { startUpload } = useUpload();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    tags: '',
    videoFile: null,
    thumbnail: null
  });
  const [previews, setPreviews] = useState({ video: null, thumbnail: null });
  const [isCompressing, setIsCompressing] = useState(false);
  const [compressionProgress, setCompressionProgress] = useState({ percent: 0, label: '', originalMB: 0, compressedMB: 0 });
  const [isDraggingVideo, setIsDraggingVideo] = useState(false);
  const [isDraggingThumb, setIsDraggingThumb] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploadingLocal, setIsUploadingLocal] = useState(false);
  const [localProgress, setLocalProgress] = useState(0);
  // ─── File processors ────────────────────────────────────────────────────────

  const processVideoFile = useCallback(async (file) => {
    if (!file) return;

    if (file.size > 200 * 1024 * 1024) {
      toast.error('Video file must be less than 200MB');
      return;
    }

    const originalMB = file.size / (1024 * 1024);
    const url = URL.createObjectURL(file);
    setFormData(prev => ({ ...prev, videoFile: file }));
    setPreviews(prev => ({ ...prev, video: url }));

    setIsCompressing(true);
    setCompressionProgress({ percent: 0, label: 'Starting compression...', originalMB, compressedMB: 0 });

    try {
      const compressed = await compressVideo(file, (percent, label) => {
        setCompressionProgress(prev => ({ ...prev, percent, label }));
      });
      const compressedMB = compressed.size / (1024 * 1024);
      const saved = ((1 - compressed.size / file.size) * 100).toFixed(0);
      setFormData(prev => ({ ...prev, videoFile: compressed }));
      setCompressionProgress(prev => ({ ...prev, percent: 100, label: `Saved ${saved}%`, originalMB, compressedMB }));
      if (compressed !== file) {
        toast.success(`Compressed: ${originalMB.toFixed(0)}MB → ${compressedMB.toFixed(0)}MB (${saved}% smaller)`);
      }
    } catch (err) {
      toast('Using original file — compression failed', { icon: '⚠️' });
    } finally {
      setIsCompressing(false);
    }
  }, []);

  const processThumbnailFile = useCallback((file) => {
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { toast.error('Thumbnail must be less than 5MB'); return; }
    setFormData(prev => ({ ...prev, thumbnail: file }));
    setPreviews(prev => ({ ...prev, thumbnail: URL.createObjectURL(file) }));
  }, []);

  // ─── Input handlers ──────────────────────────────────────────────────────────

  const handleVideoChange = (e) => processVideoFile(e.target.files[0]);
  const handleThumbnailChange = (e) => processThumbnailFile(e.target.files[0]);

  const handleRemoveVideo = () => {
    if (previews.video) URL.revokeObjectURL(previews.video);
    setFormData(prev => ({ ...prev, videoFile: null }));
    setPreviews(prev => ({ ...prev, video: null }));
    setIsCompressing(false);
    setCompressionProgress({ percent: 0, label: '', originalMB: 0, compressedMB: 0 });
  };

  const handleRemoveThumbnail = () => {
    if (previews.thumbnail) URL.revokeObjectURL(previews.thumbnail);
    setFormData(prev => ({ ...prev, thumbnail: null }));
    setPreviews(prev => ({ ...prev, thumbnail: null }));
  };

  // ─── Drag-and-drop — Video ───────────────────────────────────────────────────

  const onVideoDragEnter = (e) => { e.preventDefault(); e.stopPropagation(); setIsDraggingVideo(true); };
  const onVideoDragOver  = (e) => { e.preventDefault(); e.stopPropagation(); };
  const onVideoDragLeave = (e) => { e.preventDefault(); e.stopPropagation(); if (!e.currentTarget.contains(e.relatedTarget)) setIsDraggingVideo(false); };
  const onVideoDrop = (e) => {
    e.preventDefault(); e.stopPropagation(); setIsDraggingVideo(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('video/')) processVideoFile(file);
    else toast.error('Please drop a valid video file');
  };

  // ─── Drag-and-drop — Thumbnail ───────────────────────────────────────────────

  const onThumbDragEnter = (e) => { e.preventDefault(); e.stopPropagation(); setIsDraggingThumb(true); };
  const onThumbDragOver  = (e) => { e.preventDefault(); e.stopPropagation(); };
  const onThumbDragLeave = (e) => { e.preventDefault(); e.stopPropagation(); if (!e.currentTarget.contains(e.relatedTarget)) setIsDraggingThumb(false); };
  const onThumbDrop = (e) => {
    e.preventDefault(); e.stopPropagation(); setIsDraggingThumb(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) processThumbnailFile(file);
    else toast.error('Please drop a valid image file');
  };

  // ─── Submit ──────────────────────────────────────────────────────────────────

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) { toast.error('Please enter a title'); return; }
    if (!formData.videoFile) { toast.error('Please select a video file'); return; }
    if (isCompressing) { toast.error('Please wait for compression to finish'); return; }

    setIsSubmitting(true);
    
    // Start the global background upload
    const uploadId = await startUpload(formData, {
      title: formData.title,
      thumbnailUrl: previews.thumbnail || null,
    });

    // Show 1.5s "feel good" local progress before navigating
    setIsUploadingLocal(true);
    let progress = 0;
    const interval = setInterval(() => {
      progress += 5;
      setLocalProgress(Math.min(progress, 100));
    }, 50);

    setTimeout(() => {
      clearInterval(interval);
      navigate(`/uploading/${uploadId}`);
    }, 1500);
  };

  if (isUploadingLocal) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full bg-zinc-900/50 border border-zinc-800 rounded-2xl p-8 text-center"
        >
          <div className="w-20 h-20 rounded-full bg-indigo-500/20 flex items-center justify-center mx-auto mb-6 relative">
             <Upload className="w-10 h-10 text-indigo-400 animate-bounce" />
             <svg className="absolute inset-0 w-full h-full -rotate-90">
                <circle cx="40" cy="40" r="38" className="stroke-zinc-800 transition-all duration-300" strokeWidth="4" fill="none" />
                <circle cx="40" cy="40" r="38" className="stroke-indigo-500 transition-all duration-100" strokeWidth="4" fill="none" strokeDasharray="238.76" strokeDashoffset={238.76 - (localProgress / 100) * 238.76} />
             </svg>
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Starting Upload...</h2>
          <p className="text-zinc-400 mb-6">Preparing your video for the cinematic universe</p>
          <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
             <motion.div 
                className="h-full bg-indigo-500"
                initial={{ width: 0 }}
                animate={{ width: `${localProgress}%` }}
                transition={{ duration: 0.1 }}
             />
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505]">
      <div className="lg:pl-72 lg:pr-72 pt-24 pb-20 px-4 md:px-8">
        <div className="max-w-5xl mx-auto">

          {/* Page Header */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
            <button
              onClick={() => navigate('/dashboard')}
              className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors mb-6 group"
            >
              <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
              <span>Back to Dashboard</span>
            </button>

            <div className="flex items-center gap-4 mb-3">
              <div className="w-16 h-16 rounded-2xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center">
                <Upload className="w-8 h-8 text-indigo-400" />
              </div>
              <div>
                <h1 className="text-4xl font-black text-white">Upload Video</h1>
                <p className="text-zinc-400 mt-1">Share your content with the world</p>
              </div>
            </div>
          </motion.div>

          {/* Form */}
          <motion.form
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            onSubmit={handleSubmit}
            className="space-y-6"
          >

            {/* ── Video Upload Section ── */}
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-indigo-500/20 flex items-center justify-center">
                  <Video className="w-5 h-5 text-indigo-400" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Video File</h3>
                  <p className="text-sm text-zinc-500">Upload or drag-and-drop your video (max 200MB)</p>
                </div>
              </div>

              {!formData.videoFile ? (
                <div
                  className="relative"
                  onDragEnter={onVideoDragEnter}
                  onDragOver={onVideoDragOver}
                  onDragLeave={onVideoDragLeave}
                  onDrop={onVideoDrop}
                >
                  <label className="block cursor-pointer">
                    <input
                      type="file"
                      accept="video/*,.mkv,.avi,.mov,.wmv,.flv,.webm,.mp4,.mpeg,.mpg,.3gp,.m4v,.ts"
                      onChange={handleVideoChange}
                      className="hidden"
                    />
                    <div className={`border-2 border-dashed rounded-xl p-12 text-center transition-all ${isDraggingVideo ? 'border-indigo-400 bg-indigo-500/10 scale-[1.01]' : 'border-zinc-700 hover:border-indigo-500/50'} group`}>
                      <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 transition-colors ${isDraggingVideo ? 'bg-indigo-500/30' : 'bg-indigo-500/10 group-hover:bg-indigo-500/20'}`}>
                        <Upload className={`w-8 h-8 ${isDraggingVideo ? 'text-indigo-300' : 'text-indigo-400'}`} />
                      </div>
                      <p className="text-white font-semibold mb-1">
                        {isDraggingVideo ? '⚡ Drop to upload' : 'Click or drag to upload video'}
                      </p>
                      <p className="text-sm text-zinc-500">All video formats supported · max 200MB</p>
                    </div>
                  </label>

                  {/* Drag overlay text */}
                  <AnimatePresence>
                    {isDraggingVideo && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 flex items-center justify-center rounded-xl pointer-events-none"
                      >
                        <p className="text-2xl font-black text-indigo-300 tracking-tight drop-shadow-lg">Drop to upload</p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <div className="border border-zinc-700 rounded-xl p-3 sm:p-4 bg-zinc-900/50">
                  <div className="flex items-start gap-3 sm:gap-4">
                    {previews.video && (
                      <video src={previews.video} className="w-24 h-16 sm:w-40 sm:h-24 rounded-lg object-cover border border-zinc-700 shrink-0" controls />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-semibold mb-1 truncate text-sm sm:text-base" title={formData.videoFile.name}>{formData.videoFile.name}</p>
                      <div className="text-xs sm:text-sm text-zinc-500">
                        {(formData.videoFile.size / (1024 * 1024)).toFixed(2)} MB
                        {compressionProgress.originalMB > 0 && compressionProgress.compressedMB > 0 && (
                          <span className="block sm:inline sm:ml-2 text-emerald-400 font-medium mt-0.5 sm:mt-0">
                            (compressed from {compressionProgress.originalMB.toFixed(0)}MB)
                          </span>
                        )}
                      </div>
                    </div>
                    <button type="button" onClick={handleRemoveVideo} className="p-1.5 sm:p-2 rounded-lg hover:bg-red-500/10 text-red-400 transition-colors shrink-0">
                      <X className="w-4 h-4 sm:w-5 sm:h-5" />
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* ── Title ── */}
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-indigo-500/20 flex items-center justify-center">
                  <Film className="w-5 h-5 text-indigo-400" />
                </div>
                <div>
                  <label className="text-lg font-bold text-white">Title</label>
                  <p className="text-sm text-zinc-500">Give your video a catchy title</p>
                </div>
              </div>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Enter video title..."
                className="w-full px-4 py-3 bg-zinc-900 border border-zinc-700 rounded-xl text-white placeholder-zinc-500 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all"
                maxLength={100}
              />
              <p className="text-xs text-zinc-600 mt-2">{formData.title.length}/100 characters</p>
            </div>

            {/* ── Description ── */}
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                  <FileText className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <label className="text-lg font-bold text-white">Description</label>
                  <p className="text-sm text-zinc-500">Tell viewers about your video</p>
                </div>
              </div>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Describe your video..."
                className="w-full px-4 py-3 bg-zinc-900 border border-zinc-700 rounded-xl text-white placeholder-zinc-500 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all resize-none"
                rows={5}
                maxLength={500}
              />
              <p className="text-xs text-zinc-600 mt-2">{formData.description.length}/500 characters</p>
            </div>

            {/* ── Tags ── */}
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-amber-500/20 flex items-center justify-center">
                  <Tag className="w-5 h-5 text-amber-400" />
                </div>
                <div>
                  <label className="text-lg font-bold text-white">Tags</label>
                  <p className="text-sm text-zinc-500">Add tags separated by commas</p>
                </div>
              </div>
              <input
                type="text"
                value={formData.tags}
                onChange={(e) => setFormData(prev => ({ ...prev, tags: e.target.value }))}
                placeholder="gaming, tutorial, vlog..."
                className="w-full px-4 py-3 bg-zinc-900 border border-zinc-700 rounded-xl text-white placeholder-zinc-500 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all"
              />
            </div>

            {/* ── Thumbnail ── */}
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-rose-500/20 flex items-center justify-center">
                  <Image className="w-5 h-5 text-rose-400" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-white">Thumbnail <span className="text-sm font-normal text-zinc-500">(Optional)</span></h3>
                  <p className="text-sm text-zinc-500">AI will auto-generate if not provided</p>
                </div>
                <span className="px-3 py-1 text-xs font-bold bg-indigo-500/20 text-indigo-400 rounded-full border border-indigo-500/30 flex items-center gap-1">
                  <Sparkles className="w-3 h-3" /> AI Fallback
                </span>
              </div>

              {!formData.thumbnail ? (
                <div
                  className="relative"
                  onDragEnter={onThumbDragEnter}
                  onDragOver={onThumbDragOver}
                  onDragLeave={onThumbDragLeave}
                  onDrop={onThumbDrop}
                >
                  <label className="block cursor-pointer">
                    <input type="file" accept="image/*" onChange={handleThumbnailChange} className="hidden" />
                    <div className={`border-2 border-dashed rounded-xl p-8 text-center transition-all ${isDraggingThumb ? 'border-rose-400 bg-rose-500/10 scale-[1.01]' : 'border-zinc-700 hover:border-rose-500/50'} group`}>
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3 transition-colors ${isDraggingThumb ? 'bg-rose-500/30' : 'bg-rose-500/10 group-hover:bg-rose-500/20'}`}>
                        <Upload className={`w-6 h-6 ${isDraggingThumb ? 'text-rose-300' : 'text-rose-400'}`} />
                      </div>
                      <p className="text-white font-semibold mb-1 text-sm">
                        {isDraggingThumb ? '⚡ Drop image here' : 'Upload or drag custom thumbnail'}
                      </p>
                      <p className="text-xs text-zinc-500">JPG, PNG, WebP · max 5MB</p>
                    </div>
                  </label>
                </div>
              ) : (
                <div className="border border-zinc-700 rounded-xl p-3 sm:p-4 bg-zinc-900/50">
                  <div className="flex items-start gap-3 sm:gap-4">
                    {previews.thumbnail && (
                      <img src={previews.thumbnail} alt="Thumbnail preview" className="w-24 h-16 sm:w-40 sm:h-24 rounded-lg object-cover border border-zinc-700 shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-semibold mb-1 truncate text-sm sm:text-base" title={formData.thumbnail.name}>{formData.thumbnail.name}</p>
                      <p className="text-xs sm:text-sm text-zinc-500">{(formData.thumbnail.size / (1024 * 1024)).toFixed(2)} MB</p>
                    </div>
                    <button type="button" onClick={handleRemoveThumbnail} className="p-1.5 sm:p-2 rounded-lg hover:bg-red-500/10 text-red-400 transition-colors shrink-0">
                      <X className="w-4 h-4 sm:w-5 sm:h-5" />
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* ── Compression Progress ── */}
            {isCompressing && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-zinc-900/50 border border-amber-500/30 rounded-2xl p-6"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-lg bg-amber-500/20 flex items-center justify-center">
                    <Zap className="w-5 h-5 text-amber-400 animate-pulse" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-sm font-bold text-white">Quick Compression</h4>
                      <span className="text-xl font-bold text-amber-400">{compressionProgress.percent}%</span>
                    </div>
                    <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${compressionProgress.percent}%` }}
                        transition={{ duration: 0.3, ease: 'easeOut' }}
                        className="h-full bg-gradient-to-r from-amber-500 to-orange-400"
                      />
                    </div>
                    <p className="text-xs text-zinc-500 mt-2">{compressionProgress.label}</p>
                  </div>
                </div>
              </motion.div>
            )}

            {/* ── Submit Buttons ── */}
            <div className="flex flex-col-reverse sm:flex-row gap-3 sm:gap-4 pt-4">
              <button
                type="button"
                onClick={() => navigate('/dashboard')}
                disabled={isSubmitting || isCompressing}
                className="w-full sm:flex-1 px-6 py-4 rounded-xl border border-zinc-700 text-white hover:bg-zinc-800 transition-colors font-bold disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || isCompressing || !formData.videoFile || !formData.title.trim()}
                className="w-full sm:flex-1 px-6 py-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isCompressing ? (
                  <><Zap className="w-5 h-5 animate-pulse" /> Compressing {compressionProgress.percent}%...</>
                ) : isSubmitting ? (
                  <><Upload className="w-5 h-5 animate-bounce" /> Starting upload...</>
                ) : (
                  <><Upload className="w-5 h-5" /> Upload Video</>
                )}
              </button>
            </div>

            {/* ── AI Info ── */}
            <div className="bg-indigo-500/10 border border-indigo-500/30 rounded-2xl p-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-indigo-500/20 flex items-center justify-center shrink-0">
                  <Sparkles className="w-6 h-6 text-indigo-400" />
                </div>
                <div>
                  <h4 className="text-white font-bold mb-2 flex items-center gap-2">
                    AI-Powered Features
                    <span className="px-2 py-0.5 text-xs font-bold bg-indigo-500/20 text-indigo-400 rounded-full">Auto</span>
                  </h4>
                  <ul className="space-y-2 text-sm text-zinc-400">
                    <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400 shrink-0" /> Automatic transcript generation</li>
                    <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400 shrink-0" /> AI thumbnail generation (if not provided)</li>
                    <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400 shrink-0" /> Smart video optimization</li>
                  </ul>
                </div>
              </div>
            </div>

          </motion.form>
        </div>
      </div>
    </div>
  );
}
