import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';


import { useSelector } from 'react-redux';
import { Film } from 'lucide-react';
import toast from 'react-hot-toast';

import Header from '../Components/Header';
import Sidebar from '../Components/Sidebar';
import { videoService } from '../api/services/video.service';
import { subscriptionService } from '../api/services/subscription.service';
import { likeService } from '../api/services/like.service';
import { commentService } from '../api/services/comment.service';
import { libraryService } from '../api/services/library.service';
import { toActionError } from '../utils/errorMessages';

// Modular Components
import VideoPlayerControls from '../Components/VideoPlayer/VideoPlayerControls';
import VideoInfo from '../Components/VideoPlayer/VideoInfo';
import AIFeatures from '../Components/VideoPlayer/AIFeatures';
import CommentsSection from '../Components/VideoPlayer/CommentsSection';
import RelatedVideos from '../Components/VideoPlayer/RelatedVideos';
import { VideoPlayerSkeleton } from '../Components/Common/Skeleton';

export default function VideoPlayer() {
  const { videoId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { userData } = useSelector((state) => state.auth);

  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [progress, setProgress] = useState(0);
  const [volume, setVolume] = useState(1);
  const [showDescription, setShowDescription] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isBuffering, setIsBuffering] = useState(false);
  const [copied, setCopied] = useState(false);

  // Comments state
  const [commentText, setCommentText] = useState('');
  const [isStealthComment, setIsStealthComment] = useState(false);
  const [showAllComments, setShowAllComments] = useState(false);
  const [showTranscript, setShowTranscript] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Playback speed & settings
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [showSettingsMenu, setShowSettingsMenu] = useState(false);
  const SPEED_OPTIONS = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2, 3, 4];

  // AI Features state
  const [showAISummary, setShowAISummary] = useState(false);
  const [aiSummary, setAISummary] = useState('');
  const [showAIChat, setShowAIChat] = useState(false);
  const [aiQuestion, setAIQuestion] = useState('');
  const [conversationHistory, setConversationHistory] = useState([]);
  const [chatMessages, setChatMessages] = useState([]);
  const chatEndRef = useRef(null);
  const progressSaveTimeoutRef = useRef(null);
  const pendingSeekRef = useRef(null);

  // Reset player state when changing videos
  useEffect(() => {
    setIsPlaying(false);
    setProgress(0);
    setCurrentTime(0);
    setDuration(0);
    setShowControls(true);
    setAISummary('');
    setShowAISummary(false);
    setShowAIChat(false);
    setChatMessages([]);
    pendingSeekRef.current = null;
  }, [videoId]);

  // Fetch video data
  const { data: video, isLoading } = useQuery({
    queryKey: ['video', videoId],
    queryFn: () => videoService.getVideoById(videoId),
    retry: 1,
    staleTime: 300000, // 5 minutes - video data rarely changes
  });

  // Fetch comments (Infinite Scroll)
  const {
    data: commentsData,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    status: commentsStatus
  } = useInfiniteQuery({
    queryKey: ['videoComments', videoId],
    queryFn: ({ pageParam = 1 }) => commentService.getVideoComments(videoId, { page: pageParam, limit: 20 }),
    getNextPageParam: (lastPage) => lastPage.hasNextPage ? lastPage.nextPage : undefined,
    enabled: !!videoId,
    staleTime: 30000, // 30 seconds - comments change frequently
  });

  const commentsLoading = commentsStatus === 'pending';

  // Fetch recommended videos
  const { data: recommendedData } = useQuery({
    queryKey: ['recommended-videos', video?.owner?._id],
    queryFn: () => videoService.getAllVideos({
      userId: video.owner._id,
      page: 1,
      limit: 9,
      sortBy: 'createdAt',
      sortType: 'desc'
    }),
    enabled: !!video?.owner?._id,
    staleTime: 300000, // 5 minutes - recommendations are stable
  });



  // Check if video is in watch later
  const { data: watchLaterStatus } = useQuery({
    queryKey: ['watchLaterStatus', videoId],
    queryFn: () => libraryService.checkWatchLater(videoId),
    enabled: !!videoId && !!userData,
    retry: false,
    staleTime: 60000, // 1 minute
  });

  // Fetch pinned comments
  const { data: pinnedCommentsData } = useQuery({
    queryKey: ['pinnedComments', videoId],
    queryFn: () => commentService.getPinnedComments(videoId),
    enabled: !!videoId,
    staleTime: 60000, // 1 minute
  });

  // Watch later mutation
  const watchLaterMutation = useMutation({
    mutationFn: () => libraryService.toggleWatchLater(videoId),
    onMutate: async () => {
      await queryClient.cancelQueries(['watchLaterStatus', videoId]);
      const previousStatus = queryClient.getQueryData(['watchLaterStatus', videoId]);

      queryClient.setQueryData(['watchLaterStatus', videoId], (old) => ({
        ...old,
        isInWatchLater: !old?.isInWatchLater
      }));

      return { previousStatus };
    },
    onError: (err, variables, context) => {
      queryClient.setQueryData(['watchLaterStatus', videoId], context.previousStatus);
      toast.error(toActionError(err, 'Could not update Watch Later. Please try again.', [
        { when: 'not found', message: 'Video not found' },
        { when: ['unauthorized', 'not authorized', 'login'], message: 'Please sign in to manage your Watch Later list' },
      ]));
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries(['watchLaterStatus', videoId]);
      queryClient.invalidateQueries(['watch-later']);
      toast.success(data.isInWatchLater ? 'Added to Watch Later' : 'Removed from Watch Later');
    }
  });

  // Like mutation
  const likeMutation = useMutation({
    mutationFn: () => likeService.toggleVideoLike(videoId),
    onMutate: async () => {
      await queryClient.cancelQueries(['video', videoId]);
      const previousVideo = queryClient.getQueryData(['video', videoId]);

      queryClient.setQueryData(['video', videoId], (old) => ({
        ...old,
        isLiked: !old.isLiked,
        likesCount: old.isLiked ? (old.likesCount || 0) - 1 : (old.likesCount || 0) + 1
      }));

      return { previousVideo };
    },
    onError: (err, vars, context) => {
      if (context?.previousVideo) {
        queryClient.setQueryData(['video', videoId], context.previousVideo);
      }
      toast.error(toActionError(err, 'Could not update like. Please try again.', [
        { when: 'not found', message: 'Video not found' },
        { when: ['unauthorized', 'not authorized', 'login'], message: 'Please sign in to like this video' },
      ]));
    },
    onSettled: () => {
      queryClient.invalidateQueries(['video', videoId]);
    }
  });

  // Subscribe mutation
  const subscribeMutation = useMutation({
    mutationFn: () => subscriptionService.toggleSubscription(video.owner._id),
    onSuccess: (data) => {
      queryClient.invalidateQueries(['video', videoId]);
      if (data.isPending) {
        toast.success('Subscription request sent!');
      } else if (data.isSubscribed) {
        toast.success('Subscribed!');
      } else {
        toast.success('Unsubscribed');
      }
    },
    onError: (err) => {
      toast.error(toActionError(err, 'Could not update subscription. Please try again.', [
        { when: 'not found', message: 'Channel not found' },
        { when: 'yourself', message: 'You cannot subscribe to your own channel' },
        { when: ['unauthorized', 'not authorized', 'login'], message: 'Please sign in to subscribe' },
      ]));
    }
  });

  // Add comment mutation
  const addCommentMutation = useMutation({
    mutationFn: ({ content, isStealthMode }) =>
      commentService.addComment(videoId, content, isStealthMode),
    onMutate: async (newComment) => {
      await queryClient.cancelQueries(['videoComments', videoId]);
      const previousComments = queryClient.getQueryData(['videoComments', videoId]);

      // Optimistic update — infinite query stores data as { pages: [...], pageParams: [...] }
      queryClient.setQueryData(['videoComments', videoId], (old) => {
        if (!old?.pages?.length) return old;
        const optimisticComment = {
          _id: 'temp-' + Date.now(),
          content: newComment.content,
          isStealthMode: newComment.isStealthMode,
          owner: {
            _id: userData?._id,
            fullName: newComment.isStealthMode ? 'Anonymous' : userData?.fullName,
            avatar: {
              url: newComment.isStealthMode
                ? 'https://ui-avatars.com/api/?name=S&background=18181b&color=22c55e'
                : userData?.avatar?.url
            }
          },
          createdAt: new Date().toISOString()
        };
        return {
          ...old,
          pages: old.pages.map((page, index) =>
            index === 0
              ? { ...page, docs: [optimisticComment, ...(page.docs || [])] }
              : page
          )
        };
      });

      return { previousComments };
    },
    onSuccess: () => {
      setCommentText('');
      setIsStealthComment(false);
      toast.success(isStealthComment ? 'Stealth comment added' : 'Comment posted!');
      queryClient.invalidateQueries(['video', videoId]); // Update comment count
    },
    onError: (err, vars, context) => {
      if (context?.previousComments) {
        queryClient.setQueryData(['videoComments', videoId], context.previousComments);
      }
      toast.error(toActionError(err, 'Could not post comment. Please try again.', [
        { when: 'not found', message: 'Video not found' },
        { when: ['comment is required', 'empty'], message: 'Comment cannot be empty' },
        { when: ['unauthorized', 'not authorized', 'login'], message: 'Please sign in to comment' },
      ]));
    },
    onSettled: () => {
      queryClient.invalidateQueries(['videoComments', videoId]);
    }
  });

  // Delete comment mutation
  const deleteCommentMutation = useMutation({
    mutationFn: (commentId) => commentService.deleteComment(commentId),
    onSuccess: () => {
      toast.success('Comment deleted');
      queryClient.invalidateQueries(['videoComments', videoId]);
      queryClient.invalidateQueries(['pinnedComments', videoId]);
      queryClient.invalidateQueries(['video', videoId]);
    },
    onError: (err) => {
      toast.error(toActionError(err, 'Could not delete comment. Please try again.', [
        { when: 'not found', message: 'Comment not found' },
        { when: ['permission', 'not authorized'], message: 'You do not have permission to delete this comment' },
      ]));
    }
  });

  // Toggle pin comment mutation (video owner only)
  const togglePinMutation = useMutation({
    mutationFn: (commentId) => commentService.togglePinComment(videoId, commentId),
    onSuccess: (data) => {
      queryClient.invalidateQueries(['pinnedComments', videoId]);
      queryClient.invalidateQueries(['videoComments', videoId]);
      toast.success(data.isPinned ? 'Comment pinned!' : 'Comment unpinned');
    },
    onError: (err) => {
      toast.error(toActionError(err, 'Could not pin comment. Please try again.', [
        { when: 'not found', message: 'Comment not found' },
        { when: ['permission', 'not authorized'], message: 'Only video owner can pin comments' },
      ]));
    }
  });

  // Toggle video stealth mode (claim/mask)
  const toggleStealthMutation = useMutation({
    mutationFn: () => {
      const formData = new FormData();
      formData.append('isStealthMode', !video?.isStealthMode);
      return videoService.updateVideo(videoId, formData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['video', videoId]);
      const message = video?.isStealthMode ? 'Video claimed (Public)' : 'Video masked (Stealth)';
      toast.success(message);
    },
    onError: (err) => {
      toast.error(toActionError(err, 'Could not update video privacy. Please try again.', [
        { when: 'not found', message: 'Video not found' },
        { when: ['permission', 'not authorized'], message: 'Only video owner can change privacy settings' },
      ]));
    }
  });

  // Delete video mutation (owner only)
  const deleteVideoMutation = useMutation({
    mutationFn: () => videoService.deleteVideo(videoId),
    onSuccess: () => {
      toast.success('Video deleted successfully');
      queryClient.invalidateQueries(['videos']);
      queryClient.invalidateQueries(['my-videos']);
      navigate('/cinema');
    },
    onError: (err) => {
      toast.error(toActionError(err, 'Could not delete video. Please try again.', [
        { when: 'not found', message: 'Video not found' },
        { when: ['permission', 'not authorized'], message: 'Only video owner can delete this video' },
      ]));
      setShowDeleteConfirm(false);
    }
  });

  // Toggle comment stealth mode (claim/mask)
  const toggleCommentStealthMutation = useMutation({
    mutationFn: ({ commentId, currentStealth }) =>
      commentService.updateComment(commentId, undefined, !currentStealth),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries(['videoComments', videoId]);
      const message = variables.currentStealth ? 'Comment claimed (Public)' : 'Comment masked (Stealth)';
      toast.success(message);
    },
    onError: (err) => {
      toast.error(toActionError(err, 'Could not update comment settings. Please try again.', [
        { when: 'not found', message: 'Comment not found' },
        { when: ['permission', 'not authorized'], message: 'Only video owner can change comment settings' },
      ]));
    }
  });

  // AI Summary mutation
  const summarizeMutation = useMutation({
    mutationFn: () => videoService.summarizeVideo(videoId),
    onSuccess: (data) => {
      setAISummary(data.summary);
      setShowAISummary(true);
      toast.success('Summary generated!');
    },
    onError: (err) => {
      toast.error(toActionError(err, 'Could not generate summary. Please try again.', [
        { when: ['not available', 'processing'], message: 'Video transcript is still being generated. Please try again in a moment.' },
        { when: ['429', 'busy', 'too many requests', 'rate limit'], message: 'AI service is busy. Please try again in a few seconds.' },
      ]));
    }
  });

  // AI Ask Question mutation
  const askQuestionMutation = useMutation({
    mutationFn: ({ question, history }) =>
      videoService.askVideoQuestion(videoId, question, history),
    onSuccess: (data) => {
      const newMessage = {
        role: 'assistant',
        content: data.answer
      };
      setChatMessages(prev => [...prev, newMessage]);
      setConversationHistory(prev => [...prev, { role: 'user', content: data.question }, newMessage]);
      setAIQuestion('');
      // No toast for assistant answers (keeps UX calm)
    },
    onError: (err) => {
      toast.error(toActionError(err, 'Could not generate answer. Please try again.', [
        { when: ['not available', 'processing'], message: 'Video transcript is still being generated. Cannot answer questions yet.' },
        { when: ['429', 'busy', 'too many requests', 'rate limit'], message: 'AI service is busy. Please try again in a few seconds.' },
      ]));
    }
  });

  // Handle ask question
  const handleAskQuestion = useCallback((e) => {
    e.preventDefault();
    if (!aiQuestion.trim()) {
      toast.error('Please enter a question');
      return;
    }

    // Add user message to chat
    const userMessage = { role: 'user', content: aiQuestion };
    setChatMessages(prev => [...prev, userMessage]);

    // Send to AI
    askQuestionMutation.mutate({
      question: aiQuestion,
      history: conversationHistory
    });
  }, [aiQuestion, conversationHistory, askQuestionMutation]);

  // Handle submit comment
  const handleSubmitComment = useCallback((e) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    addCommentMutation.mutate({
      content: commentText,
      isStealthMode: isStealthComment
    });
  }, [commentText, isStealthComment, addCommentMutation]);

  // Video controls
  const togglePlay = useCallback(() => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  }, [isPlaying]);

  const toggleMute = useCallback(() => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  }, [isMuted]);

  const handleVolumeChange = useCallback((e) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (videoRef.current) {
      videoRef.current.volume = newVolume;
      setIsMuted(newVolume === 0);
    }
  }, []);

  const handleProgressClick = useCallback((e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    if (videoRef.current) {
      videoRef.current.currentTime = percent * videoRef.current.duration;
    }
  }, []);

  const toggleFullscreen = useCallback(() => {
    const container = document.getElementById('video-container');
    if (!container) return;

    if (document.fullscreenElement) {
      document.exitFullscreen();
      setIsFullscreen(false);
    } else {
      container.requestFullscreen();
      setIsFullscreen(true);
    }
  }, []);

  const skipTime = useCallback((seconds) => {
    if (videoRef.current) {
      videoRef.current.currentTime = Math.max(0, Math.min(
        videoRef.current.currentTime + seconds,
        videoRef.current.duration
      ));
    }
  }, []);

  const seekVideoElement = useCallback((seekSeconds) => {
    const videoElement = videoRef.current;
    if (!videoElement || !Number.isFinite(seekSeconds)) return false;

    const nativeDuration = videoElement.duration;
    const safeDuration = Number.isFinite(nativeDuration) && nativeDuration > 0
      ? nativeDuration
      : duration;

    const clampedTime = Math.max(
      0,
      Number.isFinite(safeDuration) && safeDuration > 0
        ? Math.min(seekSeconds, safeDuration)
        : seekSeconds
    );

    if (typeof videoElement.fastSeek === 'function') {
      videoElement.fastSeek(clampedTime);
    } else {
      videoElement.currentTime = clampedTime;
    }

    setCurrentTime(clampedTime);

    if (Number.isFinite(safeDuration) && safeDuration > 0) {
      setProgress((clampedTime / safeDuration) * 100);
    }

    return true;
  }, [duration]);

  const applyPendingSeek = useCallback((forceAutoPlay = false) => {
    const pendingSeek = pendingSeekRef.current;
    if (!pendingSeek || !videoRef.current) return false;

    const didSeek = seekVideoElement(pendingSeek.seconds);
    if (!didSeek) return false;

    pendingSeekRef.current = null;

    if ((forceAutoPlay || pendingSeek.autoPlay) && videoRef.current.paused) {
      videoRef.current.play().catch(() => {
        // Browser autoplay policy may block playback; seek still applies.
      });
    }

    return true;
  }, [seekVideoElement]);

  const handleSeekToTime = useCallback((seekSeconds) => {
    if (!Number.isFinite(seekSeconds)) return;

    pendingSeekRef.current = {
      seconds: seekSeconds,
      autoPlay: true,
    };

    if (videoRef.current?.readyState >= 1) {
      applyPendingSeek();
    }

    setShowControls(true);
  }, [applyPendingSeek]);

  const togglePiP = useCallback(async () => {
    if (videoRef.current) {
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture();
      } else {
        await videoRef.current.requestPictureInPicture();
      }
    }
  }, []);

  const changePlaybackSpeed = useCallback((speed) => {
    if (videoRef.current) {
      videoRef.current.playbackRate = speed;
      setPlaybackSpeed(speed);
      setShowSettingsMenu(false);
    }
  }, []);

  const handleShare = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url)
      .then(() => {
        setCopied(true);
        toast.success('Link copied to clipboard!');
        setTimeout(() => setCopied(false), 2000);
      })
      .catch((error) => {
        toast.error(toActionError(error, 'Could not copy video link. Please try again.'));
      });
  };

  // Update progress
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const updateProgress = () => {
      let currentDuration = video.duration;
      // Fallback to API duration if native duration is Infinite (common in audio streams)
      if (!currentDuration || isNaN(currentDuration) || currentDuration === Infinity) {
        currentDuration = duration || 0;
      }

      if (currentDuration > 0) {
        const percent = (video.currentTime / currentDuration) * 100;
        setProgress(percent);
        setCurrentTime(video.currentTime);

        // Also update duration if not set yet (and valid)
        if (duration === 0 && !isNaN(video.duration) && video.duration !== Infinity) {
          setDuration(video.duration);
        } else if (duration === 0 && currentDuration > 0) {
          setDuration(currentDuration);
        }

        // Debounced save to localStorage (saves at most once every 2 seconds)
        if (progressSaveTimeoutRef.current) {
          clearTimeout(progressSaveTimeoutRef.current);
        }
        progressSaveTimeoutRef.current = setTimeout(() => {
          localStorage.setItem(`video-progress-${videoId}`, video.currentTime);
        }, 2000);
      }
    };

    const handleLoadedMetadata = () => {
      if (video.duration && !isNaN(video.duration) && video.duration !== Infinity) {
        setDuration(video.duration);
      }

      applyPendingSeek();
    };

    const handleCanPlay = () => {
      // Fallback: set duration when video can play
      if (video.duration && !isNaN(video.duration) && duration === 0) {
        setDuration(video.duration);
      }

      if (applyPendingSeek(true)) {
        return;
      }

      // Autoplay video when it's ready
      if (video.paused) {
        // Check for saved progress to restore
        const savedTime = localStorage.getItem(`video-progress-${videoId}`);
        if (savedTime) {
          const time = parseFloat(savedTime);
          // Only seek if difference is significant and we haven't played yet/seeked yet
          if (time > 0 && Math.abs(video.currentTime - time) > 1) {
            video.currentTime = time;
          }
        }

        video.play().then(() => {
          setIsPlaying(true);
        }).catch((_error) => {
          // Autoplay might be blocked by browser
        });
      }
    };

    const handleEnded = () => {
      setIsPlaying(false);
      localStorage.removeItem(`video-progress-${videoId}`);
    };

    // Check if metadata already loaded
    if (video.readyState >= 1 && video.duration && !isNaN(video.duration)) {
      setDuration(video.duration);
    }

    const handleWaiting = () => setIsBuffering(true);
    const handlePlaying = () => setIsBuffering(false);

    // Safety check: if readyState is 4 (HAVE_ENOUGH_DATA), play immediately
    if (video.readyState === 4) {
      setIsBuffering(false);
    }

    video.addEventListener('timeupdate', updateProgress);
    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    video.addEventListener('canplay', handleCanPlay);
    video.addEventListener('ended', handleEnded);
    video.addEventListener('waiting', handleWaiting);
    video.addEventListener('playing', handlePlaying);

    return () => {
      video.removeEventListener('timeupdate', updateProgress);
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      video.removeEventListener('canplay', handleCanPlay);
      video.removeEventListener('ended', handleEnded);
      video.removeEventListener('waiting', handleWaiting);
      video.removeEventListener('playing', handlePlaying);
    };
  }, [applyPendingSeek, duration, videoId]);

  // Use video duration from API as initial fallback
  useEffect(() => {
    if (video?.duration && duration === 0) {
      setDuration(video.duration);
    }
  }, [video?.duration, duration]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

      switch (e.key.toLowerCase()) {
        case ' ':
        case 'k':
          e.preventDefault();
          togglePlay();
          break;
        case 'f':
          e.preventDefault();
          toggleFullscreen();
          break;
        case 'm':
          e.preventDefault();
          toggleMute();
          break;
        case 'arrowleft':
          e.preventDefault();
          skipTime(-10);
          break;
        case 'arrowright':
          e.preventDefault();
          skipTime(10);
          break;
        case 'arrowup':
          e.preventDefault();
          setVolume((v) => {
            const newVol = Math.min(1, v + 0.1);
            if (videoRef.current) videoRef.current.volume = newVol;
            return newVol;
          });
          break;
        case 'arrowdown':
          e.preventDefault();
          setVolume((v) => {
            const newVol = Math.max(0, v - 0.1);
            if (videoRef.current) videoRef.current.volume = newVol;
            return newVol;
          });
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [togglePlay, toggleFullscreen, toggleMute, skipTime]);

  // Compute derived values (must be before early returns!)
  const isOwner = useMemo(() => userData?._id === video?.owner?._id, [userData?._id, video?.owner?._id]);
  const isStealthMode = useMemo(() => video?.isStealthMode || video?.owner?.isIdentityCloaked, [video?.isStealthMode, video?.owner?.isIdentityCloaked]);
  const displayName = useMemo(() =>
    isStealthMode ? "Anonymous Creator" : video?.owner?.fullName,
    [isStealthMode, video?.owner?.fullName]
  );
  const avatarUrl = useMemo(() =>
    isStealthMode
      ? `https://ui-avatars.com/api/?name=S&background=18181b&color=22c55e`
      : video?.owner?.avatar?.url,
    [isStealthMode, video?.owner?.avatar?.url]
  );
  const pinnedComments = useMemo(() => pinnedCommentsData || [], [pinnedCommentsData]);

  if (isLoading) {
    return (
      <>
        <Header />
        <Sidebar />
        <VideoPlayerSkeleton />
      </>
    );
  }

  if (!video) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <Film className="w-16 h-16 text-zinc-700 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">Video not found</h2>
          <p className="text-zinc-500 mb-6">This video may have been removed or is unavailable.</p>
          <button
            onClick={() => navigate('/cinema')}
            className="px-6 py-3 bg-white text-black hover:bg-zinc-200 font-bold rounded-xl transition-colors"
          >
            Back to Cinema
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <Header variant="cinema" onUploadClick={() => navigate('/upload')} />
      <Sidebar />

      <div className="lg:pl-70 pt-24 pb-20 px-4 md:px-6">
        <div className="max-w-450 mx-auto">
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">

            {/* Main Content - Video & Details */}
            <div className="xl:col-span-2 space-y-6">

              <VideoPlayerControls
                videoRef={videoRef}
                isPlaying={isPlaying}
                togglePlay={togglePlay}
                volume={volume}
                handleVolumeChange={handleVolumeChange}
                isMuted={isMuted}
                toggleMute={toggleMute}
                progress={progress}
                handleProgressClick={handleProgressClick}
                currentTime={currentTime}
                duration={duration}
                isBuffering={isBuffering}
                showControls={showControls}
                setShowControls={setShowControls}
                isFullscreen={isFullscreen}
                toggleFullscreen={toggleFullscreen}
                skipTime={skipTime}
                togglePiP={togglePiP}
                playbackSpeed={playbackSpeed}
                changePlaybackSpeed={changePlaybackSpeed}
                showSettingsMenu={showSettingsMenu}
                setShowSettingsMenu={setShowSettingsMenu}
                video={video}
                SPEED_OPTIONS={SPEED_OPTIONS}
              />

              <VideoInfo
                video={video}
                userData={userData}
                isOwner={isOwner}
                isStealthMode={isStealthMode}
                displayName={displayName}
                avatarUrl={avatarUrl}
                subscribeMutation={subscribeMutation}
                likeMutation={likeMutation}
                watchLaterMutation={watchLaterMutation}
                watchLaterStatus={watchLaterStatus}
                handleShare={handleShare}
                toggleStealthMutation={toggleStealthMutation}
                showDeleteConfirm={showDeleteConfirm}
                setShowDeleteConfirm={setShowDeleteConfirm}
                deleteVideoMutation={deleteVideoMutation}
                showDescription={showDescription}
                setShowDescription={setShowDescription}
                copied={copied}
                navigate={navigate}
              />

              <AIFeatures
                video={video}
                userData={userData}
                showTranscript={showTranscript}
                setShowTranscript={setShowTranscript}
                summarizeMutation={summarizeMutation}
                aiSummary={aiSummary}
                showAISummary={showAISummary}
                setShowAISummary={setShowAISummary}
                showAIChat={showAIChat}
                setShowAIChat={setShowAIChat}
                chatMessages={chatMessages}
                askQuestionMutation={askQuestionMutation}
                aiQuestion={aiQuestion}
                setAIQuestion={setAIQuestion}
                handleAskQuestion={handleAskQuestion}
                chatEndRef={chatEndRef}
                videoDuration={duration}
                onSeekToTime={handleSeekToTime}
              />

              <CommentsSection
                video={video}
                videoId={videoId}
                userData={userData}
                commentsData={commentsData} // Pass full infinite data
                pinnedComments={pinnedComments}
                commentsLoading={commentsLoading}
                fetchNextPage={fetchNextPage}
                hasNextPage={hasNextPage}
                isFetchingNextPage={isFetchingNextPage}
                commentText={commentText}
                setCommentText={setCommentText}
                isStealthComment={isStealthComment}
                setIsStealthComment={setIsStealthComment}
                handleSubmitComment={handleSubmitComment}
                addCommentMutation={addCommentMutation}
                deleteCommentMutation={deleteCommentMutation}
                togglePinMutation={togglePinMutation}
                toggleCommentStealthMutation={toggleCommentStealthMutation}
                showAllComments={showAllComments}
                setShowAllComments={setShowAllComments}
                isOwner={isOwner}
                navigate={navigate}
              />
            </div>

            {/* Sidebar - Recommended Videos */}
            <div className="xl:col-span-1">
              <RelatedVideos
                recommendedData={recommendedData}
                isStealthMode={isStealthMode}
                displayName={displayName}
                navigate={navigate}
                currentVideoId={videoId}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
