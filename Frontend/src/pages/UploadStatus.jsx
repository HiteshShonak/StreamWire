import { useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Upload, CheckCircle, AlertTriangle, RefreshCw, Film, ExternalLink, Zap } from 'lucide-react';
import { useUpload } from '../context/UploadContext';

export default function UploadStatus() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { pendingUploads, retryUpload, dismissUpload } = useUpload();
  
  // Find the current upload by ID
  const upload = pendingUploads.find(u => u.id === parseInt(id));

  const hasRedirected = useRef(false);

  // If we arrive here and the ID doesn't exist (e.g., hard refresh or dismissed), bounce back to dashboard
  useEffect(() => {
    if (!upload && !hasRedirected.current) {
      navigate('/dashboard', { replace: true });
    } else if (upload?.status === 'done' && upload.videoId && !hasRedirected.current) {
      hasRedirected.current = true;
      // Auto-redirect to the video as soon as upload succeeds
      const timer = setTimeout(() => {
        navigate(`/cinema/${upload.videoId}`, { replace: true });
        // Delay dismissal slightly so the redirect has time to execute without unmounting
        setTimeout(() => dismissUpload(upload.id), 200);
      }, 500); // Quick 500ms delay to show the checkmark briefly
      return () => clearTimeout(timer);
    }
  }, [upload, navigate, dismissUpload]);

  if (!upload) return null; // Wait for redirect

  const isDone = upload.status === 'done';
  const isError = upload.status === 'error';
  const isCanceled = upload.status === 'canceled';
  const isQueued = upload.status === 'queued';
  const isUploading = upload.status === 'uploading';
  const needsReselect = Boolean(upload.requiresFileReselect);

  // Format bytes helper
  const formatBytes = (bytes) => {
    if (!bytes || bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  // Format ETA helper
  const formatETA = (seconds) => {
    if (!seconds || seconds === Infinity) return 'Calculating...';
    if (seconds < 60) return `${Math.ceil(seconds)}s left`;
    return `${Math.floor(seconds / 60)}m ${Math.ceil(seconds % 60)}s left`;
  };

  return (
    <div className="min-h-screen bg-[#050505] relative overflow-hidden flex items-center justify-center p-4">
      
      {/* Dynamic Background Blur */}
      {upload.thumbnailUrl && (
        <div className="absolute inset-0 z-0">
          <img 
            src={upload.thumbnailUrl} 
            alt="" 
            className="w-full h-full object-cover opacity-20 scale-110 blur-3xl saturate-200"
          />
          <div className="absolute inset-0 bg-linear-to-b from-[#050505]/50 via-[#050505]/80 to-[#050505]" />
        </div>
      )}

      {/* Main Container */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 w-full max-w-lg bg-zinc-900/50 backdrop-blur-xl border border-zinc-800 rounded-3xl p-8 shadow-2xl overflow-hidden"
      >
        {/* Top bar */}
        <button
          onClick={() => navigate('/dashboard')}
          className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors mb-8 group text-sm font-medium"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Back to Dashboard
        </button>

        {/* Status Circular Graphic */}
        <div className="flex justify-center mb-8 relative">
          <div className={`w-36 h-36 rounded-full flex items-center justify-center relative shadow-2xl
            ${isDone ? 'bg-indigo-600 shadow-indigo-500/20' : 
              isError ? 'bg-red-500/10 shadow-red-500/20' : 
              isCanceled ? 'bg-zinc-700/40 shadow-zinc-700/20' :
              isQueued ? 'bg-zinc-700/40 shadow-zinc-700/20' :
              'bg-zinc-800/50 shadow-black/50'}
          `}>
            
            {/* SVG Progress Ring */}
            {(isUploading || isQueued) && (
              <svg className="absolute inset-0 w-full h-full -rotate-90">
                <circle cx="72" cy="72" r="70" className="stroke-zinc-800" strokeWidth="4" fill="none" />
                <motion.circle 
                  cx="72" cy="72" r="70" 
                  className={isQueued ? "stroke-zinc-500" : "stroke-indigo-500"} 
                  strokeWidth="4" fill="none" strokeLinecap="round"
                  strokeDasharray="439.8" 
                  initial={{ strokeDashoffset: 439.8 }}
                  animate={{ strokeDashoffset: 439.8 - (upload.progress / 100) * 439.8 }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                />
              </svg>
            )}

            {/* Center Icon */}
            {isDone ? (
              <CheckCircle className="w-16 h-16 text-white" />
            ) : isError ? (
              <AlertTriangle className="w-16 h-16 text-red-500" />
            ) : isCanceled ? (
              <div className="text-center mt-1">
                <AlertTriangle className="w-8 h-8 text-zinc-300 mx-auto mb-1" />
                <span className="text-sm font-bold text-zinc-200">Canceled</span>
              </div>
            ) : isQueued ? (
              <div className="text-center mt-1">
                <Upload className="w-8 h-8 text-zinc-300 mx-auto mb-1 animate-pulse" />
                <span className="text-sm font-bold text-zinc-200">Queued</span>
              </div>
            ) : (
              <div className="text-center">
                <span className="text-3xl font-black text-white">{upload.progress}%</span>
                <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider mt-1">Uploading</p>
              </div>
            )}
          </div>
        </div>

        {/* Text Details */}
        <div className="text-center mb-10">
          <h1 className="text-2xl font-black text-white mb-2 line-clamp-1 truncate px-4" title={upload.title}>
            {upload.title}
          </h1>
          
          {isDone ? (
            <p className="text-indigo-300 font-medium">Successfully published! AI is generating transcripts.</p>
          ) : isError ? (
            <div className="space-y-1">
              <p className="text-red-400 font-medium">
                {upload.errorMessage || 'Upload failed. Check your file format, size, or connection and retry.'}
              </p>
              {needsReselect ? (
                <p className="text-sm text-zinc-500 font-medium">Reselect file to resume this upload after refresh.</p>
              ) : null}
            </div>
          ) : isCanceled ? (
            <div className="space-y-1">
              <p className="text-zinc-300 font-medium">{upload.cancelReason || upload.errorMessage || 'Upload canceled.'}</p>
              <p className="text-sm text-zinc-500 font-medium">You can retry this upload anytime.</p>
            </div>
          ) : isQueued ? (
            <div className="space-y-1">
              <p className="text-zinc-300 font-medium flex items-center justify-center gap-2">
                <Upload className="w-4 h-4 animate-pulse" />
                Waiting to start upload...
              </p>
              <p className="text-sm text-zinc-500 font-medium">Hold on, preparing your file.</p>
            </div>
          ) : (
            <div className="space-y-1">
              <>
                <p className="text-indigo-400 font-medium flex items-center justify-center gap-2">
                  <Zap className="w-4 h-4" /> 
                  {formatETA(upload.eta)}
                </p>
                <p className="text-sm text-zinc-500 font-medium">
                  {formatBytes(upload.loaded)} / {formatBytes(upload.total)} at {formatBytes(upload.speed)}/s
                </p>
              </>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="space-y-3">
          {isDone ? null : isError || isCanceled ? (
            <>
              {needsReselect ? (
                <button
                  onClick={() => navigate('/upload')}
                  className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold transition-colors flex items-center justify-center gap-2"
                >
                  <Upload className="w-5 h-5" /> Reselect File to Resume
                </button>
              ) : (
                <button
                  onClick={() => retryUpload(upload.id)}
                  className="w-full py-4 bg-red-600 hover:bg-red-500 text-white rounded-xl font-bold transition-colors flex items-center justify-center gap-2"
                >
                  <RefreshCw className="w-5 h-5" /> Retry Upload
                </button>
              )}
              <button
                onClick={() => {
                  dismissUpload(upload.id, 'Upload canceled from status page.');
                  navigate('/dashboard');
                }}
                className="w-full py-4 border border-zinc-700 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-xl font-bold transition-colors"
              >
                Back to Dashboard
              </button>
            </>
          ) : (
            <button
              onClick={() => navigate('/dashboard')}
              className="w-full py-4 border border-indigo-500/30 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 rounded-xl font-bold transition-colors flex items-center justify-center gap-2"
            >
              <ExternalLink className="w-5 h-5" /> Continue in Background
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
}
