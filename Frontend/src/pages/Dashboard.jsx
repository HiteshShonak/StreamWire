import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import {
  Film, MessageSquare, Ghost, BarChart3, Upload, PenSquare
} from 'lucide-react';

import Header from '../Components/Header';
import Sidebar from '../Components/Sidebar';
import { videoService } from '../api/services/video.service';
import { tweetService } from '../api/services/tweet.service';
import { dashboardService } from '../api/services/dashboard.service';

// Modular Components
import StatsOverview from '../Components/Dashboard/StatsOverview';
import RecentContent from '../Components/Dashboard/RecentContent';
import VideoList from '../Components/Dashboard/VideoList';
import WireList from '../Components/Dashboard/WireList';
import StealthSection from '../Components/Dashboard/StealthSection';

export default function Dashboard() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { userData } = useSelector((state) => state.auth);

  const [activeSection, setActiveSection] = useState('overview'); // overview | videos | wires | shadows | stealth
  const [videoPage, setVideoPage] = useState(1);
  const [wirePage, setWirePage] = useState(1);



  // Dashboard Stats
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: () => dashboardService.getChannelStats(),
    staleTime: 30000
  });

  // My Videos (all including stealth)
  const { data: myVideos, isLoading: videosLoading } = useQuery({
    queryKey: ['my-videos', videoPage],
    queryFn: () => videoService.getAllVideos({
      userId: userData?._id,
      page: videoPage,
      limit: 12,
      publicView: false // Get ALL videos including stealth
    }),
    enabled: !!userData?._id
  });

  // My Wires (all including stealth)
  const { data: myWires, isLoading: wiresLoading } = useQuery({
    queryKey: ['my-wires', wirePage],
    queryFn: () => tweetService.getUserTweets(userData?._id, {
      page: wirePage,
      limit: 20,
      publicView: false // Get ALL wires including stealth
    }),
    enabled: !!userData?._id
  });



  // Toggle Video Stealth
  const toggleVideoStealthMutation = useMutation({
    mutationFn: ({ videoId, currentStealth }) => {
      const formData = new FormData();
      formData.append('isStealthMode', !currentStealth);
      return videoService.updateVideo(videoId, formData);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries(['my-videos']);
      const message = variables.currentStealth ? 'Video is now public' : 'Video is now in stealth';
      toast.success(message);
    },
    onError: (err) => {
      const message = err.message?.includes('not found')
        ? 'Video not found'
        : err.message?.includes('permission') || err.message?.includes('not authorized')
          ? 'You do not have permission to edit this video'
          : 'Could not update video. Please try again.';
      toast.error(message);
    }
  });

  // Delete Video
  const deleteVideoMutation = useMutation({
    mutationFn: (videoId) => videoService.deleteVideo(videoId),
    onSuccess: () => {
      queryClient.invalidateQueries(['my-videos']);
      queryClient.invalidateQueries(['dashboard-stats']);
      toast.success('Video deleted');
    },
    onError: (err) => {
      const message = err.message?.includes('not found')
        ? 'Video not found'
        : err.message?.includes('permission') || err.message?.includes('not authorized')
          ? 'You do not have permission to delete this video'
          : 'Could not delete video. Please try again.';
      toast.error(message);
    }
  });

  // Toggle Wire Stealth
  const toggleWireStealthMutation = useMutation({
    mutationFn: ({ wireId, currentStealth }) =>
      tweetService.updateTweet(wireId, { isStealthMode: !currentStealth }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries(['my-wires']);
      const message = variables.currentStealth ? 'Wire is now public' : 'Wire is now in stealth';
      toast.success(message);
    },
    onError: (err) => {
      const message = err.message?.includes('not found')
        ? 'Wire not found'
        : err.message?.includes('permission') || err.message?.includes('not authorized')
          ? 'You do not have permission to edit this wire'
          : 'Could not update wire. Please try again.';
      toast.error(message);
    }
  });

  // Delete Wire
  const deleteWireMutation = useMutation({
    mutationFn: (wireId) => tweetService.deleteTweet(wireId),
    onSuccess: () => {
      queryClient.invalidateQueries(['my-wires']);
      queryClient.invalidateQueries(['dashboard-stats']);
      toast.success('Wire deleted');
    },
    onError: (err) => {
      const message = err.message?.includes('not found')
        ? 'Wire not found'
        : err.message?.includes('permission') || err.message?.includes('not authorized')
          ? 'You do not have permission to delete this wire'
          : 'Could not delete wire. Please try again.';
      toast.error(message);
    }
  });



  const allVideos = myVideos?.videos || [];
  const stealthVideos = allVideos.filter(v => v.isStealthMode);

  // Wires use paginated response with 'docs' field
  const allWires = myWires?.docs || [];
  const stealthWires = allWires.filter(w => w.isStealthMode);


  const sections = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'videos', label: 'My Videos', icon: Film, count: allVideos.length },
    { id: 'wires', label: 'My Wires', icon: MessageSquare, count: allWires.length },
    { id: 'stealth', label: 'Stealth Posts', icon: Ghost, count: stealthVideos.length + stealthWires.length },
  ];



  return (
    <div className="min-h-screen bg-[#050505] text-white">
      <Header variant="gateway" />
      <Sidebar />

      <div className="lg:pl-[280px] pt-24 pb-20 px-4 md:px-8">
        <div className="max-w-[1600px] mx-auto">

          {/* ==================== HEADER ==================== */}
          <div className="mb-10">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              <div>
                <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight mb-2">
                  Creator Studio
                </h1>
                <p className="text-lg text-zinc-500">
                  Manage your content, track performance, and grow your audience.
                </p>
              </div>

              {/* Quick Actions */}
              <div className="flex items-center gap-3">
                <button
                  onClick={() => navigate('/upload')}
                  className="flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-500 rounded-xl font-bold text-sm transition-all"
                >
                  <Upload className="w-4 h-4" />
                  Upload Video
                </button>
                <Link
                  to="/wire"
                  className="flex items-center gap-2 px-6 py-3 bg-zinc-800 hover:bg-zinc-700 rounded-xl font-bold text-sm transition-all border border-zinc-700"
                >
                  <PenSquare className="w-4 h-4" />
                  New Wire
                </Link>
              </div>
            </div>
          </div>

          {/* ==================== NAVIGATION TABS ==================== */}
          <div className="flex items-center gap-2 mb-8 overflow-x-auto pb-2 scrollbar-hide">
            {sections.map((section) => (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`
                  flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium text-sm whitespace-nowrap transition-all
                  ${activeSection === section.id
                    ? section.id === 'stealth'
                      ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                      : 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                    : 'bg-zinc-900 text-zinc-400 border border-zinc-800 hover:text-white hover:border-zinc-700'
                  }
                `}
              >
                <section.icon className="w-4 h-4" />
                {section.label}
                {section.count !== undefined && (
                  <span className={`
                    px-2 py-0.5 rounded-full text-xs font-bold
                    ${activeSection === section.id
                      ? section.id === 'stealth' ? 'bg-green-500/30' : 'bg-indigo-500/30'
                      : 'bg-zinc-800'
                    }
                  `}>
                    {section.count}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* ==================== CONTENT SECTIONS ==================== */}
          <AnimatePresence mode="wait">

            {/* OVERVIEW SECTION */}
            {activeSection === 'overview' && (
              <motion.div
                key="overview"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-8"
              >
                <StatsOverview stats={stats} />
                <RecentContent
                  allVideos={allVideos}
                  allWires={allWires}
                  navigate={navigate}
                  setActiveSection={setActiveSection}
                />
              </motion.div>
            )}

            {/* MY VIDEOS SECTION */}
            {activeSection === 'videos' && (
              <VideoList
                allVideos={allVideos}
                videosLoading={videosLoading}
                navigate={navigate}
                toggleVideoStealthMutation={toggleVideoStealthMutation}
                deleteVideoMutation={deleteVideoMutation}
              />
            )}

            {/* MY WIRES SECTION */}
            {activeSection === 'wires' && (
              <WireList
                allWires={allWires}
                wiresLoading={wiresLoading}
                toggleWireStealthMutation={toggleWireStealthMutation}
                deleteWireMutation={deleteWireMutation}
              />
            )}

            {/* STEALTH POSTS SECTION */}
            {activeSection === 'stealth' && (
              <StealthSection
                stealthVideos={stealthVideos}
                stealthWires={stealthWires}
                toggleVideoStealthMutation={toggleVideoStealthMutation}
                deleteVideoMutation={deleteVideoMutation}
                toggleWireStealthMutation={toggleWireStealthMutation}
                deleteWireMutation={deleteWireMutation}
              />
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
