# 🎨 StreamWire — Frontend

<p align="center">
  <img src="https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React 19"/>
  <img src="https://img.shields.io/badge/Vite-7-646CFF?style=for-the-badge&logo=vite&logoColor=white" alt="Vite 7"/>
  <img src="https://img.shields.io/badge/Tailwind_CSS-v4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white" alt="Tailwind CSS v4"/>
  <img src="https://img.shields.io/badge/Redux_Toolkit-764ABC?style=for-the-badge&logo=redux&logoColor=white" alt="Redux Toolkit"/>
  <img src="https://img.shields.io/badge/TanStack_Query-FF4154?style=for-the-badge&logo=reactquery&logoColor=white" alt="TanStack Query"/>
  <img src="https://img.shields.io/badge/Framer_Motion-0055FF?style=for-the-badge&logo=framer&logoColor=white" alt="Framer Motion"/>
  <img src="https://img.shields.io/badge/Axios-5A29E4?style=for-the-badge&logo=axios&logoColor=white" alt="Axios"/>
  <img src="https://img.shields.io/badge/React_Router-v7-CA4245?style=for-the-badge&logo=reactrouter&logoColor=white" alt="React Router v7"/>
</p>

The client-side application for **StreamWire**, built with **React 19** and **Vite 7**. This modern frontend delivers a seamless social video experience, featuring real-time feeds, an immersive video player, and a dual-identity system (Public "Wire" vs. Anonymous "Shadows").

---

## ⚡ Tech Stack

| Layer | Technology |
|---|---|
| **Core** | [React 19](https://react.dev/), [Vite 7](https://vitejs.dev/) |
| **State Management** | [Redux Toolkit](https://redux-toolkit.js.org/) (Auth/Global UI), [TanStack Query](https://tanstack.com/query/latest) (Server State/Caching) |
| **Styling** | [Tailwind CSS v4](https://tailwindcss.com/), [Framer Motion](https://www.framer.com/motion/) |
| **Routing** | `react-router-dom` v7 |
| **HTTP** | `axios` with interceptors for JWT refresh + request queueing |
| **Forms** | [React Hook Form](https://react-hook-form.com/) |
| **Icons** | [Lucide React](https://lucide.dev/) |
| **Utilities** | `date-fns`, `canvas-confetti`, `react-intersection-observer` |

---

## 📂 Project Structure
```
src/
├── App.jsx                    # Root app component with router
├── main.jsx                   # Entry point + Redux + React Query providers
├── index.css                  # Global styles + Tailwind directives
│
├── pages/                     # 25 route-level pages
│   ├── Landing.jsx                # Marketing landing page
│   ├── WireFeed.jsx               # Public social feed
│   ├── ShadowsFeed.jsx            # Anonymous feed
│   ├── CinemaFeed.jsx             # Video discovery with hero + category filters
│   ├── VideoPlayer.jsx            # Full-featured custom video player + AI
│   ├── Dashboard.jsx              # Creator Studio
│   ├── Trending.jsx               # Cross-platform trending
│   ├── Channel.jsx                # Creator profiles with subscriber management
│   ├── BuildFeed.jsx              # Customize "For You" video preferences
│   ├── History.jsx                # Personal watch history
│   ├── Saved.jsx                  # Watch later + saved playlists
│   ├── Following.jsx              # Subscription management
│   ├── Settings.jsx               # Account & privacy settings
│   ├── Customize.jsx              # Profile wizard (avatar, cover, bio, colors)
│   ├── KillSwitch.jsx             # Toggle identity cloaking globally
│   ├── About.jsx                  # Platform feature showcase
│   ├── Contact.jsx                # Contact form
│   ├── Login.jsx                  # Authentication gateway
│   ├── Register.jsx               # OTP-verified account registration
│   ├── ForgotPassword.jsx         # Password recovery flow
│   ├── ChangePassword.jsx         # Password change (auth required)
│   ├── UploadVideo.jsx            # Video upload page
│   ├── Home.jsx                   # Home redirect handler
│   ├── Support.jsx                # Support page
│   └── NotFound.jsx               # 404 page
│
├── Components/               # Reusable UI blocks
│   ├── Header.jsx                 # Floating pill-shaped nav (wire/cinema/gateway variants)
│   ├── Sidebar.jsx                # Collapsible side navigation
│   ├── Layout.jsx                 # Page layout wrapper
│   ├── AuthLayout.jsx             # Protected route wrapper
│   ├── ErrorBoundary.jsx          # React error boundary
│   ├── Footer.jsx                 # Global footer
│   ├── Search.jsx                 # Global search with user/video results
│   ├── WireCard.jsx               # Public post card
│   ├── WireInput.jsx              # Post composer (public)
│   ├── WirePost.jsx               # Full wire post with comments
│   ├── ShadowCard.jsx             # Anonymous post card
│   ├── ShadowInput.jsx            # Post composer (anonymous)
│   ├── ShadowPost.jsx             # Full shadow post with comments
│   ├── VideoCard.jsx              # Video thumbnail card (root-level)
│   ├── VideoUploadForm.jsx        # Video upload modal + form
│   ├── HeroImage.jsx              # Landing hero image component
│   ├── ChannelCard.jsx            # Channel/user summary card
│   ├── UserCard.jsx               # Compact user card
│   ├── index.js                   # Re-exports
│   │
│   ├── VideoPlayer/               # Video player sub-components
│   │   ├── VideoPlayerControls.jsx    # Play/pause, volume, seek, PiP, fullscreen
│   │   ├── VideoInfo.jsx              # Title, channel, likes, watch later, share
│   │   ├── AIFeatures.jsx             # AI summarization + conversational Q&A
│   │   ├── CommentsSection.jsx        # Comment list, add comment, stealth toggle
│   │   └── RelatedVideos.jsx          # Related videos sidebar
│   │
│   ├── Dashboard/                 # Creator Studio sub-components
│   │   ├── StatsOverview.jsx          # Channel stats cards
│   │   ├── RecentContent.jsx          # Recent videos and wires
│   │   ├── VideoList.jsx              # Paginated video management list
│   │   ├── WireList.jsx               # Paginated wire management list
│   │   ├── StealthSection.jsx         # Stealth content management
│   │   ├── DashboardVideoCard.jsx     # Video card for dashboard view
│   │   └── WireCardMini.jsx           # Compact wire card for dashboard
│   │
│   ├── Cinema/                    # Cinema feed sub-components
│   │   ├── HeroSection.jsx            # Featured video hero banner
│   │   ├── CategoryTabs.jsx           # Editable category filter tabs
│   │   └── VideoCard.jsx              # Cinema-specific video card
│   │
│   ├── LandingPage/               # Landing page sub-components
│   │   ├── HeroSection.jsx            # Main hero with call-to-action
│   │   ├── AIFeatures.jsx             # AI feature highlights section
│   │   ├── BentoGrid.jsx              # Bento-style feature grid
│   │   ├── Footer.jsx                 # Landing page footer
│   │   ├── CustomLogo.jsx             # Custom StreamWire logo
│   │   ├── HeroMascot.jsx             # Animated mascot component
│   │   ├── InteractiveFeedDemo.jsx    # Interactive feed preview demo
│   │   ├── MagneticButton.jsx         # Magnetic hover button
│   │   ├── ScrollReveal.jsx           # Scroll-triggered animation wrapper
│   │   └── index.js                   # Re-exports
│   │
│   ├── Video/                     # Generic video sub-components
│   │   ├── VideoDetails.jsx           # Video details display
│   │   └── CommentsList.jsx           # Reusable comments list
│   │
│   ├── Common/                    # Shared UI utilities
│   │   ├── AuthLock.jsx               # Non-intrusive auth prompt for guests
│   │   ├── LoadingIndicator.jsx       # Spinner + loading dots components
│   │   └── Skeleton.jsx               # Layout-matching skeleton loaders for all pages
│   │
│   └── Shared/                    # (reserved for future shared components)
│
├── api/
│   ├── axios.js                   # Axios instance + JWT refresh interceptor + queueing
│   └── services/                  # 10 service modules
│       ├── auth.service.js            # Register, login, logout, OTP, profile
│       ├── video.service.js           # Video CRUD, AI, trending, For You feed
│       ├── tweet.service.js           # Wire/Shadow CRUD, polls, trending
│       ├── comment.service.js         # Comment CRUD, pin, stealth toggle
│       ├── like.service.js            # Toggle likes (video/tweet)
│       ├── subscription.service.js    # Follow/unfollow, channel requests
│       ├── playlist.service.js        # Playlist CRUD, video management
│       ├── library.service.js         # Watch history, watch later, liked videos
│       ├── dashboard.service.js       # Creator analytics and stats
│       └── user.service.js            # User search, channel profile
│
├── store/
│   ├── store.js                   # Redux store configuration
│   └── authSlice.js               # Auth state with localStorage persistence
│
├── utils/
│   ├── formatters.js              # View counts, duration, time ago formatters
│   └── imageCompressor.js         # Client-side image compression
│
└── assets/                   # Static images & favicon
```

---

## ✨ Key Features

- **Three Feed Experiences**: Cinema (video streaming), Wire (public discourse), Shadows (anonymous)
- **Custom Video Player**: Speed controls (0.25x–4x), Picture-in-Picture, theater mode, keyboard shortcuts
- **AI Features**: Video summarization + conversational Q&A powered by Groq AI (rendered as Markdown)
- **Optimistic UI**: Instant feedback on likes and comments — rolls back on server error
- **Infinite Scroll**: Intersection Observer-based pagination on Wire and Shadows feeds
- **Auto JWT Refresh**: Axios interceptor queues failed requests during token refresh, replays them after
- **Identity Cloaking**: KillSwitch page for toggling anonymous mode across all content
- **Customization Wizard**: Multi-step profile setup with avatar/cover cropping and color picker
- **AuthLock**: Non-intrusive auth prompts that let guests browse but protect interactions
- **Skeleton Loaders**: Custom layout-matching skeletons for every page and component
- **OTP Registration**: Email-verified account creation with 6-digit OTP flow
- **SEO**: `sitemap.xml`, `robots.txt`, and proper meta tags

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** v18+
- Backend server running — see [Backend README](../Backend/README.md)

### Setup
```bash
cd Frontend
npm install
```

Create a `.env` file:
```env
VITE_API_URL=http://localhost:8000/api/v1
```

### Development
```bash
npm run dev
```
Access at `http://localhost:5173`

### Production Build
```bash
npm run build    # Outputs to dist/
npm run preview  # Preview production build locally
```

---

## 🔗 Related

- [Backend README](../Backend/README.md)
- [Root README](../README.md)
- [API Documentation](../Backend/API.md)
