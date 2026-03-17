import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import {
   ArrowLeft, ArrowRight, Check, X, Upload, Sparkles,
   User, Palette, Image, Camera, CheckCircle2, AlertCircle, FileText
} from 'lucide-react'
import { LoadingDots } from '../Components/Common/LoadingIndicator';
import toast from 'react-hot-toast';
import confetti from 'canvas-confetti';
import { authService } from '../api/services/auth.service';
import { login } from '../store/authSlice';


// Color palette options
const AVATAR_COLORS = [
   { name: 'Indigo', value: '6366f1' },
   { name: 'Purple', value: 'a855f7' },
   { name: 'Pink', value: 'ec4899' },
   { name: 'Rose', value: 'f43f5e' },
   { name: 'Red', value: 'ef4444' },
   { name: 'Orange', value: 'f97316' },
   { name: 'Amber', value: 'f59e0b' },
   { name: 'Yellow', value: 'eab308' },
   { name: 'Lime', value: '84cc16' },
   { name: 'Green', value: '22c55e' },
   { name: 'Emerald', value: '10b981' },
   { name: 'Teal', value: '14b8a6' },
   { name: 'Cyan', value: '06b6d4' },
   { name: 'Sky', value: '0ea5e9' },
   { name: 'Blue', value: '3b82f6' },
   { name: 'Zinc', value: '71717a' },
];

const COVER_COLORS = [
   { name: 'Dark Indigo', value: '312e81' },
   { name: 'Dark Purple', value: '581c87' },
   { name: 'Dark Pink', value: '831843' },
   { name: 'Dark Red', value: '7f1d1d' },
   { name: 'Dark Orange', value: '7c2d12' },
   { name: 'Dark Green', value: '14532d' },
   { name: 'Dark Teal', value: '134e4a' },
   { name: 'Dark Blue', value: '1e3a8a' },
   { name: 'Dark Zinc', value: '27272a' },
   { name: 'Charcoal', value: '18181b' },
   { name: 'Pure Black', value: '0a0a0a' },
   { name: 'Slate', value: '1e293b' },
];

export default function Customize() {
   const navigate = useNavigate();
   const dispatch = useDispatch();
   const queryClient = useQueryClient();
   const [searchParams] = useSearchParams();
   const isOnboarding = searchParams.get('onboarding') === 'true';

   const user = useSelector((state) => state.auth.userData);

   // Form state
   const [step, setStep] = useState(1); // 1: Name/Username, 2: Bio, 3: Avatar, 4: Cover, 5: Preview
   const [formData, setFormData] = useState({
      fullName: '',
      username: '',
      bio: '',
      avatarType: 'keep', // 'keep' | 'color' | 'custom' - keep means don't change
      avatarColor: '6366f1',
      avatarFile: null,
      coverType: 'keep', // 'keep' | 'color' | 'custom' - keep means don't change
      coverColor: '18181b',
      coverFile: null,
   });
   const [previews, setPreviews] = useState({ avatar: null, cover: null });
   const [usernameStatus, setUsernameStatus] = useState({ checking: false, available: null, message: '' });
   const [uploadProgress, setUploadProgress] = useState({ avatar: 0, cover: 0 });
   const [sliderPosition, setSliderPosition] = useState(50); // 0-100 for avatar before/after comparison
   const [coverSliderPosition, setCoverSliderPosition] = useState(50); // 0-100 for cover before/after comparison

   // Initialize with user data
   useEffect(() => {
      if (user) {
         setFormData(prev => ({
            ...prev,
            fullName: user.fullName || '',
            username: user.username || '',
            bio: user.bio || '',
         }));
      }
   }, [user]);

   // Fetch channel data for real-time subscriber counts
   const { data: channelData } = useQuery({
      queryKey: ['channel', user?.username],
      queryFn: () => authService.getChannelProfile(user.username),
      enabled: !!user?.username,
      staleTime: 30000, // Cache for 30 seconds
   });

   // Debounced username check
   useEffect(() => {
      if (!formData.username || formData.username === user?.username) {
         setUsernameStatus({ checking: false, available: null, message: '' });
         return;
      }

      const timer = setTimeout(async () => {
         if (formData.username.length < 3) {
            setUsernameStatus({ checking: false, available: false, message: 'At least 3 characters' });
            return;
         }

         setUsernameStatus({ checking: true, available: null, message: '' });

         try {
            // Check by fetching channel - if 404, username is available
            await authService.getChannelProfile(formData.username.toLowerCase());
            setUsernameStatus({ checking: false, available: false, message: 'Username taken' });
         } catch (error) {
            if (error.response?.status === 404 || error.message?.includes('not found')) {
               setUsernameStatus({ checking: false, available: true, message: 'Available!' });
            } else {
               setUsernameStatus({ checking: false, available: true, message: 'Available!' });
            }
         }
      }, 500);

      return () => clearTimeout(timer);
   }, [formData.username, user?.username]);

   // Update profile mutation
   const updateMutation = useMutation({
      mutationFn: async (data) => {
         const formDataToSend = new FormData();

         if (data.fullName && data.fullName !== user?.fullName) {
            formDataToSend.append('fullName', data.fullName);
         }
         if (data.username && data.username !== user?.username) {
            formDataToSend.append('username', data.username.toLowerCase());
         }
         if (data.bio !== undefined && data.bio !== user?.bio) {
            formDataToSend.append('bio', data.bio);
         }

         // Avatar
         if (data.avatarFile) {
            formDataToSend.append('avatar', data.avatarFile);
         } else if (data.avatarType === 'color') {
            formDataToSend.append('avatarColor', data.avatarColor);
         }

         // Cover
         if (data.coverFile) {
            formDataToSend.append('coverImage', data.coverFile);
         } else if (data.coverType === 'color') {
            formDataToSend.append('coverColor', data.coverColor);
         }

         // Track upload progress
         return await authService.updateProfile(formDataToSend, (progressEvent) => {
            const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            setUploadProgress({ avatar: percentCompleted, cover: percentCompleted });
         });
      },
      onSuccess: async (response) => {
         // Refresh user data
         const userData = await authService.getCurrentUser();
         dispatch(login({ user: userData }));
         queryClient.invalidateQueries(['user']);

         // Enhanced success message
         const hasAvatarChange = formData.avatarFile || formData.avatarType === 'color';
         const hasCoverChange = formData.coverFile || formData.coverType === 'color';

         let message = 'Profile updated successfully! ✨';
         if (hasAvatarChange && hasCoverChange) {
            message = 'Profile customized beautifully! 🎨';
         } else if (hasAvatarChange) {
            message = 'Avatar updated! Looking great! 👤';
         } else if (hasCoverChange) {
            message = 'Cover image updated! 🖼️';
         }

         toast.success(message);

         // Confetti celebration on first avatar upload during onboarding!
         if (isOnboarding && hasAvatarChange) {
            confetti({
               particleCount: 100,
               spread: 70,
               origin: { y: 0.6 },
               colors: ['#6366f1', '#a855f7', '#ec4899'],
               ticks: 200
            });
         }

         // Reset progress
         setUploadProgress({ avatar: 0, cover: 0 });

         navigate(isOnboarding ? '/home' : '/settings');
      },
      onError: (error) => {
         let errorMessage = error.message || 'Failed to update profile';

         if (error.message?.includes('File too large') || error.message?.includes('size')) {
            errorMessage = 'Image file is too large. Please use a smaller file.';
         } else if (error.message?.includes('Invalid file type') || error.message?.includes('format')) {
            errorMessage = 'Invalid file format. Please use JPG, PNG, or WebP.';
         } else if (error.message?.includes('username') && error.message?.includes('taken')) {
            errorMessage = 'Username is already taken. Please choose another.';
         }

         // Reset progress on error
         setUploadProgress({ avatar: 0, cover: 0 });
         toast.error(errorMessage);
      }
   });

   const handleAvatarFileChange = (e) => {
      const file = e.target.files[0];
      if (file) {
         if (file.size > 5 * 1024 * 1024) {
            toast.error('Image must be less than 5MB');
            return;
         }
         setFormData({ ...formData, avatarType: 'custom', avatarFile: file });
         setPreviews({ ...previews, avatar: URL.createObjectURL(file) });
      }
   };

   const handleCoverFileChange = (e) => {
      const file = e.target.files[0];
      if (file) {
         if (file.size > 10 * 1024 * 1024) {
            toast.error('Image must be less than 10MB');
            return;
         }
         setFormData({ ...formData, coverType: 'custom', coverFile: file });
         setPreviews({ ...previews, cover: URL.createObjectURL(file) });
      }
   };

   const getAvatarPreview = () => {
      if (formData.avatarType === 'custom' && previews.avatar) {
         return previews.avatar;
      }
      if (formData.avatarType === 'keep' && user?.avatar?.url) {
         return user.avatar.url;
      }
      const firstLetter = (formData.fullName || user?.fullName || 'U').charAt(0).toUpperCase();
      return `https://ui-avatars.com/api/?name=${firstLetter}&background=${formData.avatarColor}&color=fff&bold=true&length=1&size=200`;
   };

   const getCoverPreview = () => {
      if (formData.coverType === 'custom' && previews.cover) {
         return previews.cover;
      }
      if (formData.coverType === 'keep' && user?.coverImage?.url) {
         return user.coverImage.url;
      }
      return `https://placehold.jp/${formData.coverColor}/${formData.coverColor}/1280x300.png?text=%20`;
   };

   const canProceed = () => {
      if (step === 1) {
         return formData.fullName.length >= 2 &&
            formData.username.length >= 3 &&
            (usernameStatus.available || formData.username === user?.username);
      }
      return true;
   };

   const handleNext = () => {
      if (step < 5) setStep(step + 1);
   };

   const handleBack = () => {
      if (step > 1) setStep(step - 1);
   };

   const handleSkip = () => {
      if (isOnboarding) {
         navigate('/home');
      } else {
         navigate('/settings');
      }
   };

   const handleSubmit = () => {
      updateMutation.mutate(formData);
   };

   const totalSteps = 4;

   return (
      <div className="min-h-screen bg-[#050505]">

         {/* Background Effects */}
         <div className="fixed inset-0 pointer-events-none">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-indigo-500 opacity-5 blur-[120px] gpu-layer" />
         </div>

         <div className="pt-20 md:pt-24 pb-20 px-4 md:px-8">
            <div className="max-w-3xl mx-auto relative z-10">

               {/* Header */}
               <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center mb-12"
               >
                  {!isOnboarding && (
                     <button
                        onClick={() => navigate('/settings')}
                        className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors mb-6 group mx-auto"
                     >
                        <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                        <span>Back to Settings</span>
                     </button>
                  )}

                  <div className="w-20 h-20 mx-auto mb-6 rounded-3xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center">
                     <Sparkles className="w-10 h-10 text-indigo-400" />
                  </div>

                  <h1 className="text-4xl md:text-5xl font-black text-white mb-3">
                     {isOnboarding ? 'Customize Your Profile' : 'Edit Your Profile'}
                  </h1>
                  <p className="text-zinc-400 text-lg max-w-md mx-auto">
                     {isOnboarding
                        ? 'Make your profile unique. You can always change these later.'
                        : 'Update your profile information and appearance.'
                     }
                  </p>
               </motion.div>

               {/* Progress Steps */}
               <div className="flex items-center justify-center gap-2 mb-12">
                  {[1, 2, 3, 4, 5].map((s) => (
                     <div key={s} className="flex items-center">
                        <button
                           onClick={() => setStep(s)}
                           className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all ${s === step
                              ? 'bg-indigo-500 text-white scale-110'
                              : s < step
                                 ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                 : 'bg-zinc-800 text-zinc-500'
                              }`}
                        >
                           {s < step ? <Check className="w-4 h-4" /> : s}
                        </button>
                        {s < 5 && (
                           <div className={`w-6 h-0.5 mx-1 ${s < step ? 'bg-emerald-500/50' : 'bg-zinc-800'}`} />
                        )}
                     </div>
                  ))}
               </div>

               {/* Step Content */}
               <AnimatePresence mode="wait">

                  {/* Step 1: Name & Username */}
                  {step === 1 && (
                     <motion.div
                        key="step1"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="bg-zinc-900/50 border border-zinc-800 rounded-3xl p-8"
                     >
                        <div className="flex items-center gap-4 mb-8">
                           <div className="w-14 h-14 rounded-2xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center">
                              <User className="w-7 h-7 text-indigo-400" />
                           </div>
                           <div>
                              <h2 className="text-2xl font-bold text-white">Your Identity</h2>
                              <p className="text-zinc-400">How others will see you</p>
                           </div>
                        </div>

                        <div className="space-y-6">
                           {/* Full Name */}
                           <div>
                              <label className="block text-sm font-bold text-zinc-300 mb-2">
                                 Full Name
                              </label>
                              <input
                                 type="text"
                                 value={formData.fullName}
                                 onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                                 placeholder="Your display name"
                                 className="w-full px-4 py-3.5 bg-zinc-900 border border-zinc-700 rounded-xl text-white placeholder-zinc-500 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all text-lg"
                                 maxLength={50}
                              />
                              <p className="text-xs text-zinc-600 mt-2">{formData.fullName.length}/50</p>
                           </div>

                           {/* Username */}
                           <div>
                              <label className="block text-sm font-bold text-zinc-300 mb-2">
                                 Username
                              </label>
                              <div className="relative">
                                 <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500">@</span>
                                 <input
                                    type="text"
                                    value={formData.username}
                                    onChange={(e) => setFormData({ ...formData, username: e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '') })}
                                    placeholder="username"
                                    className="w-full pl-10 pr-12 py-3.5 bg-zinc-900 border border-zinc-700 rounded-xl text-white placeholder-zinc-500 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all text-lg"
                                    maxLength={20}
                                 />
                                 <div className="absolute right-4 top-1/2 -translate-y-1/2">
                                    {usernameStatus.checking && (
                                       <LoadingDots size="md" />
                                    )}
                                    {!usernameStatus.checking && usernameStatus.available === true && (
                                       <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                                    )}
                                    {!usernameStatus.checking && usernameStatus.available === false && (
                                       <AlertCircle className="w-5 h-5 text-red-400" />
                                    )}
                                 </div>
                              </div>
                              <div className="flex items-center justify-between mt-2">
                                 <p className="text-xs text-zinc-600">{formData.username.length}/20</p>
                                 {usernameStatus.message && (
                                    <p className={`text-xs font-medium ${usernameStatus.available ? 'text-emerald-400' : 'text-red-400'}`}>
                                       {usernameStatus.message}
                                    </p>
                                 )}
                              </div>
                           </div>
                        </div>
                     </motion.div>
                  )}

                  {/* Step 2: Bio */}
                  {step === 2 && (
                     <motion.div
                        key="step2"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="bg-zinc-900/50 border border-zinc-800 rounded-3xl p-8"
                     >
                        <div className="flex items-center gap-4 mb-8">
                           <div className="w-14 h-14 rounded-2xl bg-sky-500/20 border border-sky-500/30 flex items-center justify-center">
                              <FileText className="w-7 h-7 text-sky-400" />
                           </div>
                           <div>
                              <h2 className="text-2xl font-bold text-white">About You</h2>
                              <p className="text-zinc-400">Tell viewers a bit about yourself</p>
                           </div>
                        </div>

                        <div className="space-y-6">
                           {/* Bio */}
                           <div>
                              <label className="block text-sm font-bold text-zinc-300 mb-2">
                                 Bio
                              </label>
                              <textarea
                                 value={formData.bio}
                                 onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                                 placeholder="Write a short bio about yourself, your channel, or what content you create..."
                                 className="w-full px-4 py-3.5 bg-zinc-900 border border-zinc-700 rounded-xl text-white placeholder-zinc-500 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all text-base resize-none"
                                 rows={5}
                                 maxLength={300}
                              />
                              <div className="flex items-center justify-between mt-2">
                                 <p className="text-xs text-zinc-600">{formData.bio.length}/300 characters</p>
                                 {formData.bio.length >= 50 && (
                                    <p className="text-xs text-emerald-400 flex items-center gap-1">
                                       <Check className="w-3 h-3" /> Great bio!
                                    </p>
                                 )}
                              </div>
                           </div>

                           {/* Bio Tips */}
                           <div className="bg-sky-900/20 border border-sky-500/30 rounded-xl p-4">
                              <h4 className="text-sm font-bold text-sky-400 mb-2">💡 Tips for a great bio</h4>
                              <ul className="space-y-1.5 text-xs text-zinc-400">
                                 <li className="flex items-start gap-2">
                                    <span className="text-sky-400 mt-0.5">•</span>
                                    <span>Keep it short and memorable</span>
                                 </li>
                                 <li className="flex items-start gap-2">
                                    <span className="text-sky-400 mt-0.5">•</span>
                                    <span>Mention what kind of content you create</span>
                                 </li>
                                 <li className="flex items-start gap-2">
                                    <span className="text-sky-400 mt-0.5">•</span>
                                    <span>Add personality — be yourself!</span>
                                 </li>
                              </ul>
                           </div>
                        </div>
                     </motion.div>
                  )}

                  {/* Step 3: Avatar */}
                  {step === 3 && (
                     <motion.div
                        key="step3"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="bg-zinc-900/50 border border-zinc-800 rounded-3xl p-8"
                     >
                        <div className="flex items-center gap-4 mb-8">
                           <div className="w-14 h-14 rounded-2xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center">
                              <Camera className="w-7 h-7 text-indigo-400" />
                           </div>
                           <div>
                              <h2 className="text-2xl font-bold text-white">Profile Picture</h2>
                              <p className="text-zinc-400">Choose a color or upload custom</p>
                           </div>
                        </div>

                        {/* Avatar Preview - Before/After Comparison */}
                        <div className="flex justify-center mb-8">
                           {!isOnboarding && user?.avatar?.url && (formData.avatarFile || formData.avatarType === 'color') ? (
                              /* Interactive Before/After Slider */
                              <div className="relative">
                                 <div className="text-center mb-3">
                                    <p className="text-sm font-semibold text-zinc-400">Drag to compare</p>
                                 </div>

                                 <div
                                    className="relative w-64 h-64 rounded-full overflow-hidden border-4 border-zinc-700 shadow-2xl cursor-ew-resize select-none"
                                    onMouseDown={(e) => {
                                       const rect = e.currentTarget.getBoundingClientRect();
                                       const handleMove = (moveEvent) => {
                                          const x = moveEvent.clientX - rect.left;
                                          const percent = Math.max(0, Math.min(100, (x / rect.width) * 100));
                                          setSliderPosition(percent);
                                       };
                                       const handleUp = () => {
                                          document.removeEventListener('mousemove', handleMove);
                                          document.removeEventListener('mouseup', handleUp);
                                       };
                                       handleMove(e);
                                       document.addEventListener('mousemove', handleMove);
                                       document.addEventListener('mouseup', handleUp);
                                    }}
                                    onTouchStart={(e) => {
                                       const rect = e.currentTarget.getBoundingClientRect();
                                       const handleMove = (moveEvent) => {
                                          const touch = moveEvent.touches[0];
                                          const x = touch.clientX - rect.left;
                                          const percent = Math.max(0, Math.min(100, (x / rect.width) * 100));
                                          setSliderPosition(percent);
                                       };
                                       const handleEnd = () => {
                                          document.removeEventListener('touchmove', handleMove);
                                          document.removeEventListener('touchend', handleEnd);
                                       };
                                       handleMove(e);
                                       document.addEventListener('touchmove', handleMove);
                                       document.addEventListener('touchend', handleEnd);
                                    }}
                                 >
                                    {/* Current Avatar (Behind - Right Side) */}
                                    <div className="absolute inset-0">
                                       <img
                                          src={user.avatar.url}
                                          alt="Current avatar"
                                          className="w-full h-full object-cover"
                                          draggable={false}
                                       />
                                    </div>

                                    {/* New Avatar (In front with clip-path - Left Side) */}
                                    <div
                                       className="absolute inset-0"
                                       style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}
                                    >
                                       <img
                                          src={getAvatarPreview()}
                                          alt="New avatar"
                                          className="w-full h-full object-cover"
                                          draggable={false}
                                       />
                                    </div>

                                    {/* Slider Handle */}
                                    <div
                                       className="absolute inset-y-0 w-1 bg-white shadow-lg transition-none"
                                       style={{ left: `${sliderPosition}%`, transform: 'translateX(-50%)' }}
                                    >
                                       <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 bg-white rounded-full shadow-xl border-2 border-zinc-300 flex items-center justify-center hover:scale-110 transition-transform">
                                          <div className="flex gap-0.5">
                                             <div className="w-0.5 h-5 bg-zinc-400 rounded" />
                                             <div className="w-0.5 h-5 bg-zinc-400 rounded" />
                                          </div>
                                       </div>
                                    </div>
                                 </div>
                              </div>
                           ) : (
                              /* Single Avatar Preview */
                              <motion.div
                                 className="relative"
                                 whileHover={{ scale: 1.05 }}
                                 transition={{ duration: 0.2 }}
                              >
                                 <img
                                    key={formData.avatarColor + formData.avatarType + (previews.avatar || '')}
                                    src={getAvatarPreview()}
                                    alt="Avatar preview"
                                    className="w-32 h-32 rounded-full border-4 border-zinc-700 object-cover shadow-2xl transition-all"
                                 />
                                 {previews.avatar && (
                                    <button
                                       type="button"
                                       onClick={() => {
                                          setFormData({ ...formData, avatarFile: null, avatarType: 'color' });
                                          setPreviews({ ...previews, avatar: null });
                                       }}
                                       className="absolute -top-2 -right-2 w-7 h-7 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center transition-colors"
                                    >
                                       <X className="w-4 h-4" />
                                    </button>
                                 )}
                              </motion.div>
                           )}
                        </div>

                        {/* Upload Custom */}
                        <div className="mb-6">
                           <label className="block cursor-pointer">
                              <input
                                 type="file"
                                 accept="image/*"
                                 onChange={handleAvatarFileChange}
                                 className="hidden"
                              />
                              <div className="border-2 border-dashed border-zinc-700 hover:border-indigo-500/50 rounded-xl p-4 text-center transition-colors group">
                                 <Upload className="w-6 h-6 text-zinc-500 mx-auto mb-2 group-hover:text-indigo-400 transition-colors" />
                                 <p className="text-sm text-zinc-400">Upload custom image</p>
                              </div>
                           </label>
                        </div>

                        {/* Keep Current Option (only if user has avatar) */}
                        {!isOnboarding && user?.avatar?.url && (
                           <div className="mb-6">
                              <button
                                 type="button"
                                 onClick={() => {
                                    setFormData({ ...formData, avatarType: 'keep', avatarFile: null });
                                    setPreviews({ ...previews, avatar: null });
                                 }}
                                 className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all ${formData.avatarType === 'keep'
                                    ? 'border-indigo-500 bg-indigo-500/10'
                                    : 'border-zinc-700 hover:border-zinc-600 bg-zinc-800/50'
                                    }`}
                              >
                                 <img
                                    src={user.avatar.url}
                                    alt="Current avatar"
                                    className="w-12 h-12 rounded-full object-cover border-2 border-zinc-600"
                                 />
                                 <div className="text-left flex-1">
                                    <p className="font-semibold text-white">Keep Current Avatar</p>
                                    <p className="text-sm text-zinc-400">Don't change my avatar</p>
                                 </div>
                                 {formData.avatarType === 'keep' && (
                                    <div className="w-6 h-6 rounded-full bg-indigo-500 flex items-center justify-center">
                                       <Check className="w-4 h-4 text-white" />
                                    </div>
                                 )}
                              </button>
                           </div>
                        )}

                        {/* Color Options */}
                        <div>
                           <p className="text-sm font-bold text-zinc-300 mb-4">{!isOnboarding && user?.avatar?.url ? 'Or choose a color' : 'Choose a color'}</p>
                           <div className="grid grid-cols-8 gap-2">
                              {AVATAR_COLORS.map((color) => (
                                 <button
                                    key={color.value}
                                    onClick={() => setFormData({ ...formData, avatarType: 'color', avatarColor: color.value, avatarFile: null })}
                                    className={`w-full aspect-square rounded-lg transition-all hover:scale-110 ${formData.avatarType === 'color' && formData.avatarColor === color.value
                                       ? 'ring-2 ring-white ring-offset-2 ring-offset-zinc-900 scale-110'
                                       : ''
                                       }`}
                                    style={{ backgroundColor: `#${color.value}` }}
                                    title={color.name}
                                 />
                              ))}
                           </div>
                        </div>
                     </motion.div>
                  )}

                  {/* Step 4: Cover */}
                  {step === 4 && (
                     <motion.div
                        key="step4"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="bg-zinc-900/50 border border-zinc-800 rounded-3xl p-8"
                     >
                        <div className="flex items-center gap-4 mb-8">
                           <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center">
                              <Image className="w-7 h-7 text-emerald-400" />
                           </div>
                           <div>
                              <h2 className="text-2xl font-bold text-white">Cover Image</h2>
                              <p className="text-zinc-400">Your profile banner</p>
                           </div>
                        </div>

                        {/* Cover Preview - Before/After Comparison */}
                        <div className="mb-8">
                           {!isOnboarding && user?.coverImage?.url && (formData.coverFile || formData.coverType === 'color') ? (
                              /* Interactive Before/After Slider for Cover */
                              <div className="relative">
                                 <div className="text-center mb-3">
                                    <p className="text-sm font-semibold text-zinc-400">Drag to compare</p>
                                 </div>

                                 <div
                                    className="relative w-full h-40 rounded-xl overflow-hidden border-2 border-zinc-700 shadow-xl cursor-ew-resize select-none"
                                    onMouseDown={(e) => {
                                       const rect = e.currentTarget.getBoundingClientRect();
                                       const handleMove = (moveEvent) => {
                                          const x = moveEvent.clientX - rect.left;
                                          const percent = Math.max(0, Math.min(100, (x / rect.width) * 100));
                                          setCoverSliderPosition(percent);
                                       };
                                       const handleUp = () => {
                                          document.removeEventListener('mousemove', handleMove);
                                          document.removeEventListener('mouseup', handleUp);
                                       };
                                       handleMove(e);
                                       document.addEventListener('mousemove', handleMove);
                                       document.addEventListener('mouseup', handleUp);
                                    }}
                                    onTouchStart={(e) => {
                                       const rect = e.currentTarget.getBoundingClientRect();
                                       const handleMove = (moveEvent) => {
                                          const touch = moveEvent.touches[0];
                                          const x = touch.clientX - rect.left;
                                          const percent = Math.max(0, Math.min(100, (x / rect.width) * 100));
                                          setCoverSliderPosition(percent);
                                       };
                                       const handleEnd = () => {
                                          document.removeEventListener('touchmove', handleMove);
                                          document.removeEventListener('touchend', handleEnd);
                                       };
                                       handleMove(e);
                                       document.addEventListener('touchmove', handleMove);
                                       document.addEventListener('touchend', handleEnd);
                                    }}
                                 >
                                    {/* Current Cover (Behind - Right Side) */}
                                    <div className="absolute inset-0">
                                       <img
                                          src={user.coverImage.url}
                                          alt="Current cover"
                                          className="w-full h-full object-cover"
                                          draggable={false}
                                       />
                                    </div>

                                    {/* New Cover (In front with clip-path - Left Side) */}
                                    <div
                                       className="absolute inset-0"
                                       style={{ clipPath: `inset(0 ${100 - coverSliderPosition}% 0 0)` }}
                                    >
                                       <img
                                          src={getCoverPreview()}
                                          alt="New cover"
                                          className="w-full h-full object-cover"
                                          draggable={false}
                                       />
                                    </div>

                                    {/* Slider Handle */}
                                    <div
                                       className="absolute inset-y-0 w-1 bg-white shadow-lg transition-none"
                                       style={{ left: `${coverSliderPosition}%`, transform: 'translateX(-50%)' }}
                                    >
                                       <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 bg-white rounded-full shadow-xl border-2 border-zinc-300 flex items-center justify-center hover:scale-110 transition-transform">
                                          <div className="flex gap-0.5">
                                             <div className="w-0.5 h-5 bg-zinc-400 rounded" />
                                             <div className="w-0.5 h-5 bg-zinc-400 rounded" />
                                          </div>
                                       </div>
                                    </div>
                                 </div>
                              </div>
                           ) : (
                              /* Single Cover Preview */
                              <div className="relative rounded-xl overflow-hidden">
                                 <img
                                    key={formData.coverColor + formData.coverType + (previews.cover || '')}
                                    src={getCoverPreview()}
                                    alt="Cover preview"
                                    className="w-full h-40 object-cover transition-all"
                                 />
                                 {formData.coverType === 'custom' && (
                                    <button
                                       onClick={() => {
                                          setFormData({ ...formData, coverType: 'color', coverFile: null });
                                          setPreviews({ ...previews, cover: null });
                                       }}
                                       className="absolute top-2 right-2 w-8 h-8 bg-red-500 rounded-full flex items-center justify-center text-white hover:bg-red-600 transition-colors"
                                    >
                                       <X className="w-4 h-4" />
                                    </button>
                                 )}
                              </div>
                           )}
                        </div>

                        {/* Upload Custom */}
                        <div className="mb-6">
                           <label className="block cursor-pointer">
                              <input
                                 type="file"
                                 accept="image/*"
                                 onChange={handleCoverFileChange}
                                 className="hidden"
                              />
                              <div className="border-2 border-dashed border-zinc-700 hover:border-emerald-500/50 rounded-xl p-4 text-center transition-colors group">
                                 <Upload className="w-6 h-6 text-zinc-500 mx-auto mb-2 group-hover:text-emerald-400 transition-colors" />
                                 <p className="text-sm text-zinc-400">Upload custom banner</p>
                              </div>
                           </label>
                        </div>

                        {/* Keep Current Option (only if user has cover) */}
                        {!isOnboarding && user?.coverImage?.url && (
                           <div className="mb-6">
                              <button
                                 type="button"
                                 onClick={() => {
                                    setFormData({ ...formData, coverType: 'keep', coverFile: null });
                                    setPreviews({ ...previews, cover: null });
                                 }}
                                 className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all ${formData.coverType === 'keep'
                                    ? 'border-emerald-500 bg-emerald-500/10'
                                    : 'border-zinc-700 hover:border-zinc-600 bg-zinc-800/50'
                                    }`}
                              >
                                 <img
                                    src={user.coverImage.url}
                                    alt="Current cover"
                                    className="w-20 h-12 rounded-lg object-cover border-2 border-zinc-600"
                                 />
                                 <div className="text-left flex-1">
                                    <p className="font-semibold text-white">Keep Current Cover</p>
                                    <p className="text-sm text-zinc-400">Don't change my cover image</p>
                                 </div>
                                 {formData.coverType === 'keep' && (
                                    <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center">
                                       <Check className="w-4 h-4 text-white" />
                                    </div>
                                 )}
                              </button>
                           </div>
                        )}

                        {/* Color Options */}
                        <div>
                           <p className="text-sm font-bold text-zinc-300 mb-4">{!isOnboarding && user?.coverImage?.url ? 'Or choose a color' : 'Choose a color'}</p>
                           <div className="grid grid-cols-6 gap-2">
                              {COVER_COLORS.map((color) => (
                                 <button
                                    key={color.value}
                                    onClick={() => setFormData({ ...formData, coverType: 'color', coverColor: color.value, coverFile: null })}
                                    className={`w-full h-12 rounded-lg transition-all hover:scale-105 ${formData.coverType === 'color' && formData.coverColor === color.value
                                       ? 'ring-2 ring-white ring-offset-2 ring-offset-zinc-900 scale-105'
                                       : ''
                                       }`}
                                    style={{ backgroundColor: `#${color.value}` }}
                                    title={color.name}
                                 />
                              ))}
                           </div>
                        </div>
                     </motion.div>
                  )}

                  {/* Step 5: Preview */}
                  {step === 5 && (
                     <motion.div
                        key="step5"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="space-y-6"
                     >
                        <div className="text-center mb-6">
                           <h2 className="text-2xl font-bold text-white mb-2">Preview Your Profile</h2>
                           <p className="text-zinc-400">Here's how you'll appear to others</p>
                        </div>

                        {/* Profile Card Preview - YouTube Style */}
                        <div className="bg-zinc-900/50 border border-zinc-800 rounded-3xl overflow-hidden shadow-2xl">
                           {/* Cover Banner */}
                           <div className="h-36 md:h-48 relative">
                              <img
                                 key={formData.coverColor + formData.coverType}
                                 src={getCoverPreview()}
                                 alt="Cover"
                                 className="w-full h-full object-cover"
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-zinc-900/80 via-transparent to-transparent" />
                           </div>

                           {/* Profile Section */}
                           <div className="relative px-6 md:px-8 pb-6">
                              {/* Avatar - Positioned to overlap banner */}
                              <div className="absolute -top-16 left-6 md:left-8">
                                 <div className="relative">
                                    <img
                                       key={formData.avatarColor + formData.avatarType}
                                       src={getAvatarPreview()}
                                       alt="Avatar"
                                       className="w-28 h-28 md:w-32 md:h-32 rounded-full border-4 border-zinc-900 object-cover shadow-2xl"
                                    />
                                    <div className="absolute inset-0 rounded-full ring-2 ring-white/10" />
                                 </div>
                              </div>

                              {/* Profile Info - Right of avatar area */}
                              <div className="pt-16 md:pt-20">
                                 <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                                    <div>
                                       <h3 className="text-2xl md:text-3xl font-black text-white mb-1">
                                          {formData.fullName || 'Your Name'}
                                       </h3>
                                       <p className="text-zinc-400 font-medium">
                                          @{formData.username || 'username'}
                                       </p>

                                       {/* Stats */}
                                       <div className="flex items-center gap-4 mt-3 text-sm">
                                          <span className="text-zinc-400">
                                             <strong className="text-white font-bold">
                                                {channelData?.subscribersCount || 0}
                                             </strong> subscribers
                                          </span>
                                          <span className="text-zinc-600">•</span>
                                          <span className="text-zinc-400">
                                             <strong className="text-white font-bold">
                                                {channelData?.channelsSubscribedToCount || 0}
                                             </strong> subscribed
                                          </span>
                                       </div>
                                    </div>

                                    {/* Subscribe Button Preview */}
                                    <div className="flex items-center gap-2">
                                       <div className="px-6 py-2.5 bg-white text-black rounded-full font-bold text-sm">
                                          Subscribe
                                       </div>
                                    </div>
                                 </div>

                                 {/* Bio placeholder */}
                                 <div className="mt-4 pt-4 border-t border-zinc-800">
                                    <p className="text-sm text-zinc-500 italic">
                                       {formData.bio || "Your bio will appear here..."}
                                    </p>
                                 </div>
                              </div>
                           </div>
                        </div>

                        {/* Summary */}
                        <div className="bg-gradient-to-br from-emerald-900/20 to-green-900/20 border border-emerald-500/30 rounded-2xl p-6">
                           <div className="flex items-start gap-4">
                              <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center shrink-0">
                                 <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                              </div>
                              <div>
                                 <h4 className="text-white font-bold mb-2">Looking Great! 🎉</h4>
                                 <p className="text-sm text-zinc-400 leading-relaxed">
                                    Your profile is ready. Click "Save Profile" to apply these changes.
                                    You can always update your profile later from Settings.
                                 </p>
                              </div>
                           </div>
                        </div>
                     </motion.div>
                  )}
               </AnimatePresence>

               {/* Navigation Buttons */}
               <div className="flex flex-wrap items-center justify-between gap-4 mt-8">
                  <div>
                     <AnimatePresence mode="popLayout">
                        {step > 1 ? (
                           <motion.button
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              exit={{ opacity: 0, x: -20 }}
                              key="back-btn"
                              onClick={handleBack}
                              className="flex items-center gap-2 px-6 py-3 text-zinc-400 hover:text-white transition-colors"
                           >
                              <ArrowLeft className="w-4 h-4" />
                              Back
                           </motion.button>
                        ) : isOnboarding ? (
                           <motion.button
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              exit={{ opacity: 0, x: -20 }}
                              key="skip-btn-1"
                              onClick={handleSkip}
                              className="flex items-center gap-2 px-6 py-3 text-zinc-500 hover:text-zinc-300 transition-colors font-semibold"
                           >
                              Skip for now <ArrowRight className="w-4 h-4" />
                           </motion.button>
                        ) : (
                           <motion.button
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              exit={{ opacity: 0, x: -20 }}
                              key="cancel-btn"
                              onClick={() => navigate('/settings')}
                              className="px-6 py-3 text-zinc-500 hover:text-zinc-300 transition-colors"
                           >
                              Cancel
                           </motion.button>
                        )}
                     </AnimatePresence>
                  </div>

                  <div className="flex items-center gap-3">
                     {step < 5 ? (
                        <button
                           onClick={handleNext}
                           disabled={!canProceed()}
                           className="flex items-center gap-2 px-8 py-3.5 bg-indigo-600 hover:bg-indigo-500 rounded-xl font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-indigo-900/30"
                        >
                           Next
                           <ArrowRight className="w-4 h-4" />
                        </button>
                     ) : (
                        <>
                           {isOnboarding && (
                              <button
                                 onClick={handleSkip}
                                 disabled={updateMutation.isPending}
                                 className="px-6 py-3.5 text-zinc-400 hover:text-white font-medium transition-colors"
                              >
                                 Skip & use defaults
                              </button>
                           )}
                           <button
                              onClick={handleSubmit}
                              disabled={updateMutation.isPending}
                              className="flex items-center gap-2 px-8 py-3.5 bg-emerald-600 hover:bg-emerald-500 rounded-xl font-bold transition-all disabled:opacity-50 shadow-lg shadow-emerald-900/30"
                           >
                              {updateMutation.isPending ? (
                                 <>
                                    <LoadingDots size="md" />
                                    Saving...
                                 </>
                              ) : (
                                 <>
                                    <Check className="w-5 h-5" />
                                    Save Profile
                                 </>
                              )}
                           </button>
                        </>
                     )}
                  </div>

               </div>
            </div>

            {isOnboarding && step > 1 && step < 5 && (
               <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex justify-center mt-8"
               >
                  <button
                     onClick={handleSkip}
                     className="px-6 py-3 rounded-full text-zinc-400 hover:text-white bg-zinc-900/40 hover:bg-zinc-800/80 border border-zinc-800 transition-all font-bold flex items-center gap-2"
                  >
                     Skip for now <ArrowRight className="w-4 h-4" />
                  </button>
               </motion.div>
            )}
         </div>
      </div>
   );
}
