import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Upload, Film, FileText, Tag, Sparkles, Check, Image, Video, X, Zap } from 'lucide-react';
import { LoadingDots } from '../Components/Common/LoadingIndicator';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { videoService } from '../api/services/video.service';
import { compressVideo } from '../utils/compressVideo';
import Header from '../Components/Header';
import Sidebar from '../Components/Sidebar';

export default function UploadVideo() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    tags: '',
    videoFile: null,
    thumbnail: null
  });
  const [previews, setPreviews] = useState({ video: null, thumbnail: null });
  const [uploadProgress, setUploadProgress] = useState({ percent: 0, loaded: 0, total: 0, eta: null, startTime: null });
  const [isCompressing, setIsCompressing] = useState(false);
  const [compressionProgress, setCompressionProgress] = useState({ percent: 0, label: '', originalMB: 0, compressedMB: 0 });

  const uploadMutation = useMutation({
    mutationFn: async (data) => {
      const formDataToSend = new FormData();
      formDataToSend.append('title', data.title);
      formDataToSend.append('description', data.description);
      formDataToSend.append('tags', data.tags);
      formDataToSend.append('videoFile', data.videoFile);
      if (data.thumbnail) {
        formDataToSend.append('thumbnail', data.thumbnail);
      }

      // Track upload progress with ETA
      const startTime = Date.now();
      console.log('Starting video upload...');
      return await videoService.publishVideo(formDataToSend, (progressEvent) => {
        const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        const elapsed = (Date.now() - startTime) / 1000; // seconds
        const uploadSpeed = progressEvent.loaded / elapsed; // bytes per second
        const remaining = progressEvent.total - progressEvent.loaded;
        const eta = remaining / uploadSpeed; // seconds

        console.log(`Upload Progress: ${percentCompleted}% (${progressEvent.loaded}/${progressEvent.total} bytes)`);

        setUploadProgress({
          percent: percentCompleted,
          loaded: progressEvent.loaded,
          total: progressEvent.total,
          eta: eta,
          startTime: startTime
        });
      });
    },
    onSuccess: () => {
      toast.success('🎬 Video uploaded! AI is generating your transcript...');
      queryClient.invalidateQueries(['videos']);
      queryClient.invalidateQueries(['my-videos']);
      queryClient.invalidateQueries(['dashboard-stats']);
      setUploadProgress({ percent: 0, loaded: 0, total: 0, eta: null, startTime: null });
      navigate('/dashboard');
    },
    onError: (error) => {
      console.error('Upload error:', error);
      let errorMessage = error.message || 'Upload failed. Please try again.';

      // More specific error matching to avoid false positives
      if (error.message?.includes('File too large') || error.message?.toLowerCase().includes('exceeds maximum')) {
        errorMessage = 'Video file is too large. Maximum size is 2GB';
      } else if (error.message?.includes('Invalid file type') || error.message?.includes('format')) {
        errorMessage = 'Invalid video format. Please use MP4, AVI, or MOV.';
      } else if (error.message?.includes('title') && error.message?.includes('required')) {
        errorMessage = 'Video title is required.';
      } else if (error.message?.includes('Network') || error.message?.includes('timeout')) {
        errorMessage = 'Upload failed due to network issue. Please check your connection.';
      }

      toast.error(errorMessage);
      setUploadProgress({ percent: 0, loaded: 0, total: 0, eta: null, startTime: null });
    }
  });

  const handleVideoChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 200 * 1024 * 1024) {
      toast.error('Video file must be less than 200MB');
      return;
    }

    const originalMB = file.size / (1024 * 1024);
    const url = URL.createObjectURL(file);
    // Show original immediately so user can see it
    setFormData(prev => ({ ...prev, videoFile: file }));
    setPreviews(prev => ({ ...prev, video: url }));

    // Files under 50MB skip compression
    if (originalMB < 50) {
      return;
    }

    // Run quick first-pass compression
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
      console.warn('Compression failed, using original:', err);
      toast('Using original file — compression failed', { icon: '⚠️' });
    } finally {
      setIsCompressing(false);
    }
  };

  const handleThumbnailChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Thumbnail must be less than 5MB');
        return;
      }
      setFormData({ ...formData, thumbnail: file });
      const url = URL.createObjectURL(file);
      setPreviews({ ...previews, thumbnail: url });
    }
  };

  const handleRemoveVideo = () => {
    setFormData({ ...formData, videoFile: null });
    setPreviews({ ...previews, video: null });
    setIsCompressing(false);
    setCompressionProgress({ percent: 0, label: '', originalMB: 0, compressedMB: 0 });
  };

  const handleRemoveThumbnail = () => {
    setFormData({ ...formData, thumbnail: null });
    setPreviews({ ...previews, thumbnail: null });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      toast.error('Please enter a title');
      return;
    }
    if (!formData.videoFile) {
      toast.error('Please select a video file');
      return;
    }

    uploadMutation.mutate(formData);
  };

  return (
    <div className="min-h-screen bg-[#050505]">
      <Header />
      <Sidebar />

      <div className="lg:pl-72 lg:pr-72 pt-24 pb-20 px-4 md:px-8">
        <div className="max-w-5xl mx-auto">

          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
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

          {/* Upload Form */}
          <motion.form
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            onSubmit={handleSubmit}
            className="space-y-6"
          >

            {/* Video Upload Section */}
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-indigo-500/20 flex items-center justify-center">
                  <Video className="w-5 h-5 text-indigo-400" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Video File</h3>
                  <p className="text-sm text-zinc-500">Upload your video (max 200MB)</p>
                </div>
              </div>

              {!formData.videoFile ? (
                <label className="block cursor-pointer">
                  <input
                    type="file"
                    accept="video/*,.mkv,.avi,.mov,.wmv,.flv,.webm,.mp4,.mpeg,.mpg,.3gp,.m4v,.ts"
                    onChange={handleVideoChange}
                    className="hidden"
                    disabled={uploadMutation.isPending}
                  />
                  <div className="border-2 border-dashed border-zinc-700 hover:border-indigo-500/50 rounded-xl p-12 text-center transition-colors group">
                    <div className="w-16 h-16 rounded-full bg-indigo-500/10 flex items-center justify-center mx-auto mb-4 group-hover:bg-indigo-500/20 transition-colors">
                      <Upload className="w-8 h-8 text-indigo-400" />
                    </div>
                    <p className="text-white font-semibold mb-1">Click to upload video</p>
                    <p className="text-sm text-zinc-500">All video formats supported (max 200MB)</p>
                  </div>
                </label>
              ) : (
                <div className="border border-zinc-700 rounded-xl p-4 bg-zinc-900/50">
                  <div className="flex items-start gap-4">
                    {previews.video && (
                      <video
                        src={previews.video}
                        className="w-40 h-24 rounded-lg object-cover border border-zinc-700"
                        controls
                      />
                    )}
                    <div className="flex-1">
                      <p className="text-white font-semibold mb-1">{formData.videoFile.name}</p>
                      <p className="text-sm text-zinc-500">
                        {(formData.videoFile.size / (1024 * 1024)).toFixed(2)} MB
                        {compressionProgress.originalMB > 0 && compressionProgress.compressedMB > 0 && (
                          <span className="ml-2 text-emerald-400 font-medium">
                            (compressed from {compressionProgress.originalMB.toFixed(0)}MB)
                          </span>
                        )}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={handleRemoveVideo}
                      className="p-2 rounded-lg hover:bg-red-500/10 text-red-400 transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Title */}
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
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Enter video title..."
                disabled={uploadMutation.isPending}
                className="w-full px-4 py-3 bg-zinc-900 border border-zinc-700 rounded-xl text-white placeholder-zinc-500 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all disabled:opacity-50"
                maxLength={100}
              />
              <p className="text-xs text-zinc-600 mt-2">{formData.title.length}/100 characters</p>
            </div>

            {/* Description */}
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
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe your video..."
                disabled={uploadMutation.isPending}
                className="w-full px-4 py-3 bg-zinc-900 border border-zinc-700 rounded-xl text-white placeholder-zinc-500 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all disabled:opacity-50 resize-none"
                rows={5}
                maxLength={500}
              />
              <p className="text-xs text-zinc-600 mt-2">{formData.description.length}/500 characters</p>
            </div>

            {/* Tags */}
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
                onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                placeholder="gaming, tutorial, vlog..."
                disabled={uploadMutation.isPending}
                className="w-full px-4 py-3 bg-zinc-900 border border-zinc-700 rounded-xl text-white placeholder-zinc-500 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all disabled:opacity-50"
              />
            </div>

            {/* Thumbnail Upload (Optional) */}
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-rose-500/20 flex items-center justify-center">
                  <Image className="w-5 h-5 text-rose-400" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-white">Thumbnail (Optional)</h3>
                  <p className="text-sm text-zinc-500">AI will auto-generate if not provided</p>
                </div>
                <span className="px-3 py-1 text-xs font-bold bg-indigo-500/20 text-indigo-400 rounded-full border border-indigo-500/30 flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  AI Fallback
                </span>
              </div>

              {!formData.thumbnail ? (
                <label className="block cursor-pointer">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleThumbnailChange}
                    className="hidden"
                    disabled={uploadMutation.isPending}
                  />
                  <div className="border-2 border-dashed border-zinc-700 hover:border-rose-500/50 rounded-xl p-8 text-center transition-colors group">
                    <div className="w-12 h-12 rounded-full bg-rose-500/10 flex items-center justify-center mx-auto mb-3 group-hover:bg-rose-500/20 transition-colors">
                      <Upload className="w-6 h-6 text-rose-400" />
                    </div>
                    <p className="text-white font-semibold mb-1 text-sm">Upload custom thumbnail</p>
                    <p className="text-xs text-zinc-500">JPG, PNG (max 5MB)</p>
                  </div>
                </label>
              ) : (
                <div className="border border-zinc-700 rounded-xl p-4 bg-zinc-900/50">
                  <div className="flex items-start gap-4">
                    {previews.thumbnail && (
                      <img
                        src={previews.thumbnail}
                        alt="Thumbnail preview"
                        className="w-40 h-24 rounded-lg object-cover border border-zinc-700"
                      />
                    )}
                    <div className="flex-1">
                      <p className="text-white font-semibold mb-1">{formData.thumbnail.name}</p>
                      <p className="text-sm text-zinc-500">
                        {(formData.thumbnail.size / (1024 * 1024)).toFixed(2)} MB
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={handleRemoveThumbnail}
                      className="p-2 rounded-lg hover:bg-red-500/10 text-red-400 transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Compression Progress */}
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

            {/* Upload Progress Bar */}
            {uploadMutation.isPending && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-lg bg-indigo-500/20 flex items-center justify-center">
                    <Upload className="w-5 h-5 text-indigo-400 animate-pulse" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-sm font-bold text-white">Uploading Video</h4>
                      <span className="text-xl font-bold text-indigo-400">{uploadProgress.percent || 0}%</span>
                    </div>

                    {/* Progress Bar */}
                    <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${uploadProgress.percent || 0}%` }}
                        transition={{ duration: 0.3, ease: 'easeOut' }}
                        className="h-full bg-indigo-500"
                      />
                    </div>

                    {/* Upload Stats */}
                    <div className="flex items-center justify-between mt-2 text-xs text-zinc-500">
                      <span>
                        {uploadProgress.total > 0 ? (
                          <>
                            {(uploadProgress.loaded / (1024 * 1024)).toFixed(1)} MB / {(uploadProgress.total / (1024 * 1024)).toFixed(1)} MB
                          </>
                        ) : (
                          'Preparing upload...'
                        )}
                      </span>
                      {uploadProgress.eta && uploadProgress.eta < 300 && uploadProgress.eta > 1 && (
                        <span>
                          {Math.floor(uploadProgress.eta / 60) > 0 && `${Math.floor(uploadProgress.eta / 60)}m `}
                          {Math.floor(uploadProgress.eta % 60)}s remaining
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Submit Buttons */}
            <div className="flex gap-4 pt-4">
              <button
                type="button"
                onClick={() => navigate('/dashboard')}
                disabled={uploadMutation.isPending || isCompressing}
                className="flex-1 px-6 py-4 rounded-xl border border-zinc-700 text-white hover:bg-zinc-800 transition-colors font-bold disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={uploadMutation.isPending || isCompressing || !formData.videoFile || !formData.title.trim()}
                className="flex-1 px-6 py-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isCompressing ? (
                  <>
                    <Zap className="w-5 h-5 animate-pulse" />
                    Compressing {compressionProgress.percent}%...
                  </>
                ) : uploadMutation.isPending ? (
                  <>
                    <LoadingDots size="md" />
                    {uploadProgress.percent > 0 ? `Uploading ${uploadProgress.percent}%` : 'Preparing...'}
                  </>
                ) : (
                  <>
                    <Upload className="w-5 h-5" />
                    Upload Video
                  </>
                )}
              </button>
            </div>

            {/* AI Features Info */}
            <div className="bg-indigo-500/10 border border-indigo-500/30 rounded-2xl p-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-indigo-500/20 flex items-center justify-center shrink-0">
                  <Sparkles className="w-6 h-6 text-indigo-400" />
                </div>
                <div>
                  <h4 className="text-white font-bold mb-2 flex items-center gap-2">
                    AI-Powered Features
                    <span className="px-2 py-0.5 text-xs font-bold bg-indigo-500/20 text-indigo-400 rounded-full">
                      Auto
                    </span>
                  </h4>
                  <ul className="space-y-2 text-sm text-zinc-400">
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>Automatic transcript generation</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>AI thumbnail generation (if not provided)</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>Smart video optimization</span>
                    </li>
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
