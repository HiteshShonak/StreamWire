import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Upload, Film, FileText, Tag, Loader2, Sparkles, Check } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { videoService } from '../api/services/video.service';

export default function VideoUploadForm({ isOpen, onClose }) {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    tags: '',
    videoFile: null,
    thumbnail: null
  });
  const [previews, setPreviews] = useState({ video: null, thumbnail: null });
  const [uploadProgress, setUploadProgress] = useState(0);

  const uploadMutation = useMutation({
    mutationFn: async (data) => {
      const formDataToSend = new FormData();
      formDataToSend.append('title', data.title);
      formDataToSend.append('description', data.description);
      formDataToSend.append('tags', data.tags);
      formDataToSend.append('videoFile', data.videoFile);
      // Thumbnail is optional - AI auto-generates from video if not provided
      if (data.thumbnail) {
        formDataToSend.append('thumbnail', data.thumbnail);
      }

      return await videoService.publishVideo(formDataToSend);
    },
    onSuccess: () => {
      toast.success('🎬 Video uploaded! AI is generating your transcript...');
      queryClient.invalidateQueries(['videos']);
      handleClose();
    },
    onError: (error) => {
      toast.error(error.message || 'Upload failed. Please try again.');
    }
  });

  const handleVideoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 500 * 1024 * 1024) { // 500MB limit
        toast.error('Video file must be less than 500MB');
        return;
      }
      setFormData({ ...formData, videoFile: file });
      const url = URL.createObjectURL(file);
      setPreviews({ ...previews, video: url });
    }
  };

  const handleThumbnailChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast.error('Thumbnail must be less than 5MB');
        return;
      }
      setFormData({ ...formData, thumbnail: file });
      const url = URL.createObjectURL(file);
      setPreviews({ ...previews, thumbnail: url });
    }
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
    // Thumbnail is optional - will be auto-generated if not provided

    uploadMutation.mutate(formData);
  };

  const handleClose = () => {
    setFormData({ title: '', description: '', tags: '', videoFile: null, thumbnail: null });
    setPreviews({ video: null, thumbnail: null });
    setUploadProgress(0);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
          >
            <div className="w-full max-w-3xl bg-[#0a0a0c] rounded-2xl shadow-2xl border border-zinc-800 overflow-hidden pointer-events-auto max-h-[90vh] flex flex-col">

              {/* Header */}
              <div className="relative px-6 py-5 border-b border-zinc-800 bg-indigo-950/30">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center">
                      <Film className="w-5 h-5 text-indigo-400" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-white">Upload to The Cinema</h2>
                      <p className="text-xs text-zinc-500">Share your vision with the world</p>
                    </div>
                  </div>
                  <button
                    onClick={handleClose}
                    className="p-2 text-zinc-500 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Form Content */}
              <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">

                {/* Video Upload */}
                <div>
                  <label className="flex text-sm font-bold text-white mb-3 items-center gap-2">
                    <Upload className="w-4 h-4 text-indigo-400" />
                    Video File *
                  </label>
                  <div className="relative">
                    <input
                      type="file"
                      accept="video/*"
                      onChange={handleVideoChange}
                      className="hidden"
                      id="video-upload"
                      disabled={uploadMutation.isPending}
                    />
                    <label
                      htmlFor="video-upload"
                      className={`
                        block w-full px-4 py-8 border-2 border-dashed rounded-xl text-center cursor-pointer
                        transition-all duration-300
                        ${formData.videoFile
                          ? 'border-indigo-500/50 bg-indigo-500/5'
                          : 'border-zinc-700 hover:border-indigo-500/50 hover:bg-indigo-500/5'
                        }
                        ${uploadMutation.isPending ? 'opacity-50 cursor-not-allowed' : ''}
                      `}
                    >
                      {formData.videoFile ? (
                        <div className="flex items-center justify-center gap-3">
                          <Check className="w-5 h-5 text-green-400" />
                          <span className="text-sm font-medium text-white">{formData.videoFile.name}</span>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <Upload className="w-8 h-8 text-zinc-500 mx-auto" />
                          <p className="text-sm text-zinc-400">Click to select video file</p>
                          <p className="text-xs text-zinc-600">MP4, MOV, AVI • Max 500MB</p>
                        </div>
                      )}
                    </label>
                  </div>
                </div>

                {/* Thumbnail Upload */}
                <div>
                  <label className="flex text-sm font-bold text-white mb-3 items-center gap-2">
                    <FileText className="w-4 h-4 text-indigo-400" />
                    Thumbnail
                    <span className="text-xs text-zinc-500 font-normal">(Optional - AI will auto-generate)</span>
                  </label>
                  <div className="relative">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleThumbnailChange}
                      className="hidden"
                      id="thumbnail-upload"
                      disabled={uploadMutation.isPending}
                    />
                    <label
                      htmlFor="thumbnail-upload"
                      className={`
                        block w-full aspect-video border-2 border-dashed rounded-xl overflow-hidden cursor-pointer
                        transition-all duration-300
                        ${formData.thumbnail
                          ? 'border-indigo-500/50'
                          : 'border-zinc-700 hover:border-indigo-500/50'
                        }
                        ${uploadMutation.isPending ? 'opacity-50 cursor-not-allowed' : ''}
                      `}
                    >
                      {previews.thumbnail ? (
                        <img src={previews.thumbnail} alt="Thumbnail preview" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center gap-2 bg-zinc-900/50">
                          <Upload className="w-8 h-8 text-zinc-500" />
                          <p className="text-sm text-zinc-400">Click to select thumbnail</p>
                          <p className="text-xs text-zinc-600">16:9 recommended • Max 5MB</p>
                        </div>
                      )}
                    </label>
                  </div>
                </div>

                {/* Title */}
                <div>
                  <label className="block text-sm font-bold text-white mb-3">Title *</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Enter a compelling title..."
                    disabled={uploadMutation.isPending}
                    className="w-full px-4 py-3 bg-zinc-900/50 border border-zinc-800 rounded-xl text-white placeholder:text-zinc-600 focus:outline-none focus:border-indigo-500/50 focus:bg-zinc-900 transition-colors disabled:opacity-50"
                    maxLength={100}
                  />
                  <p className="text-xs text-zinc-600 mt-1">{formData.title.length}/100</p>
                </div>

                {/* Description */}
                <div>
                  <label className="flex text-sm font-bold text-white mb-3 items-center gap-2">
                    Description
                    <span className="text-xs text-zinc-500 font-normal">(Optional - AI will generate)</span>
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Tell viewers what your video is about..."
                    disabled={uploadMutation.isPending}
                    rows={4}
                    className="w-full px-4 py-3 bg-zinc-900/50 border border-zinc-800 rounded-xl text-white placeholder:text-zinc-600 focus:outline-none focus:border-indigo-500/50 focus:bg-zinc-900 transition-colors resize-none disabled:opacity-50"
                    maxLength={500}
                  />
                  <p className="text-xs text-zinc-600 mt-1">{formData.description.length}/500</p>
                </div>

                {/* Tags */}
                <div>
                  <label className="flex text-sm font-bold text-white mb-3 items-center gap-2">
                    <Tag className="w-4 h-4 text-indigo-400" />
                    Tags
                  </label>
                  <input
                    type="text"
                    value={formData.tags}
                    onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                    placeholder="ai, tech, tutorial (comma-separated)"
                    disabled={uploadMutation.isPending}
                    className="w-full px-4 py-3 bg-zinc-900/50 border border-zinc-800 rounded-xl text-white placeholder:text-zinc-600 focus:outline-none focus:border-indigo-500/50 focus:bg-zinc-900 transition-colors disabled:opacity-50"
                  />
                  <p className="text-xs text-zinc-600 mt-1">Separate tags with commas</p>
                </div>

                {/* AI Feature Notice */}
                <div className="p-4 bg-indigo-500/10 border border-indigo-500/30 rounded-xl">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-indigo-500/20 flex items-center justify-center flex-shrink-0">
                      <Sparkles className="w-4 h-4 text-indigo-400" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white mb-1">AI-Powered Features</h4>
                      <p className="text-xs text-zinc-400 leading-relaxed">
                        Your video will be automatically analyzed to generate a searchable transcript and smart tags.
                        Skip the thumbnail and description - AI will generate them for you!
                      </p>
                    </div>
                  </div>
                </div>
              </form>

              {/* Footer Actions */}
              <div className="px-6 py-4 border-t border-zinc-800 bg-zinc-950/50 flex items-center justify-between">
                <button
                  type="button"
                  onClick={handleClose}
                  disabled={uploadMutation.isPending}
                  className="px-6 py-2.5 text-sm font-bold text-zinc-400 hover:text-white transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={uploadMutation.isPending || !formData.videoFile || !formData.title.trim()}
                  className="px-8 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {uploadMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4" />
                      Upload Video
                    </>
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
