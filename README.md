# ⚡ StreamWire

> **Connect. Shield. Stream.**
> A next-generation social platform combining authenticated discourse, anonymous expression, and immersive video streaming.

StreamWire is a full-stack social media application engineered to explore the intersection of identity and anonymity. It features three distinct feed types—**Wire** (Public), **Shadows** (Anonymous), and **Cinema** (Video)—powered by a robust MERN stack architecture with real-time interactions, AI integrations, and privacy-first design patterns.

---

## 🌟 Key Features

### 📢 The Wire (Public Feed)
*   **Authenticated Discourse:** Standard social feed where identity is front and center.
*   **Interactive Posts:** Rich text, image attachments, and **integrated voting polls**.
*   **Trend Score Algorithm:** Smart sorting based on recency, engagement, and unique views.
*   **Stealth Toggle:** Users can "claim" anonymous posts or "mask" public posts dynamically.

### 👻 Shadows (Anonymous Feed)
*   **True Anonymity:** Posting and commenting without revealing identity.
*   **Identity Cloaking:** Global "Kill Switch" to instantly anonymize an entire user profile's history.
*   **AuthLock Security:** Inline authentication prompts that maintain engagement without forcing sign-ups for browsing.
*   **Stealth Comments:** Users can participate in public threads anonymously.

### 🎬 Cinema (Video Streaming)
*   **Immersive Player:** Custom-built video player with speed controls, PiP, and theater mode.
*   **AI Integration (Gemini):**
    *   **Auto-Summaries:** Generate concise summaries of video content.
    *   **Interactive Chat:** Ask questions about the video context using AI.
*   **Engagement:** Like, Subscribe, Pin Comments, and "Watch Later" library management.

---

## 🛠️ Technology Stack

### Frontend
*   **Framework:** React 19 (Vite)
*   **State Management:** Redux Toolkit + React Query (TanStack Query) for optimistic UI updates.
*   **Styling:** Tailwind CSS + Framer Motion for smooth animations.
*   **Components:** Modular architecture with reusable UI patterns (`AuthLock`, `WireCard`).

### Backend
*   **Runtime:** Node.js + Express (ES Modules).
*   **Database:** MongoDB + Mongoose (Advanced Aggregation Pipelines).
*   **Authentication:** JWT + HTTP-Only Cookies + Helmet Security headers.
*   **Media:** Cloudinary (Images) + Fluent-FFmpeg (Video processing).
*   **AI:** Google Gemini SDK for content analysis.

---

## � Project Structure

```
StreamWire/
├── Backend/                          # Node.js + Express API Server
│   ├── src/
│   │   ├── app.js                   # 68 lines   - Express app configuration
│   │   ├── index.js                 # 49 lines   - Server entry point
│   │   ├── constants.js             # 9 lines    - App constants
│   │   │
│   │   ├── controllers/             # ~3,900 lines total
│   │   │   ├── auth.controller.js        # 400 lines  - Registration, Login, OTP, Password Recovery
│   │   │   ├── user.controller.js        # 598 lines  - Profile, Channel, Search, Settings
│   │   │   ├── video.controller.js       # 537 lines  - Upload, CRUD, View tracking
│   │   │   ├── tweet.controller.js       # 534 lines  - Wire/Shadow posts, Polls
│   │   │   ├── library.controller.js     # 442 lines  - History, Watch Later, Saved
│   │   │   ├── playlist.controller.js    # 409 lines  - Playlist management
│   │   │   ├── comment.controller.js     # 359 lines  - Comments, Pinning
│   │   │   ├── subscription.controller.js# 327 lines  - Follow/Unfollow, Requests
│   │   │   ├── like.controller.js        # 172 lines  - Video/Tweet/Comment likes
│   │   │   ├── dashboard.controller.js   # 125 lines  - Creator analytics
│   │   │   └── contact.controller.js     # 57 lines   - Contact form
│   │   │
│   │   ├── models/                  # ~650 lines total
│   │   │   ├── user.model.js             # ~120 lines - User schema + JWT methods
│   │   │   ├── video.model.js            # ~110 lines - Video schema + indexes
│   │   │   ├── tweet.model.js            # ~50 lines  - Wire/Shadow post schema
│   │   │   ├── comment.model.js          # ~30 lines  - Polymorphic comments
│   │   │   ├── like.model.js             # ~45 lines  - Like schema
│   │   │   ├── subscription.model.js     # ~40 lines  - Follow relationships
│   │   │   ├── playlist.model.js         # ~25 lines  - Playlist schema
│   │   │   ├── history.model.js          # ~25 lines  - Watch history
│   │   │   ├── watchLater.model.js       # ~20 lines  - Watch later queue
│   │   │   ├── savedPlaylist.model.js    # ~20 lines  - Saved playlists
│   │   │   ├── pollVote.model.js         # ~20 lines  - Poll votes
│   │   │   ├── videoView.model.js        # ~30 lines  - Unique view tracking
│   │   │   └── tweetView.model.js        # ~30 lines  - Tweet view tracking
│   │   │
│   │   ├── routes/                  # ~550 lines total
│   │   │   ├── user.routes.js            # ~140 lines - User endpoints
│   │   │   ├── video.routes.js           # ~65 lines  - Video endpoints
│   │   │   ├── tweet.routes.js           # ~60 lines  - Wire/Shadow endpoints
│   │   │   ├── comment.routes.js         # ~60 lines  - Comment endpoints
│   │   │   ├── playlist.routes.js        # ~55 lines  - Playlist endpoints
│   │   │   ├── subscription.routes.js    # ~45 lines  - Subscription endpoints
│   │   │   ├── library.routes.js         # ~35 lines  - Library endpoints
│   │   │   ├── like.routes.js            # ~35 lines  - Like endpoints
│   │   │   ├── dashboard.routes.js       # ~25 lines  - Dashboard endpoints
│   │   │   └── contact.routes.js         # ~15 lines  - Contact endpoints
│   │   │
│   │   ├── utils/                   # ~1,550 lines total
│   │   │   ├── ai.service.js             # 382 lines  - Groq Whisper transcription
│   │   │   ├── feedBuilder.js            # 215 lines  - Personalized feed algorithm
│   │   │   ├── mail.js                   # 181 lines  - Email templates (Nodemailer)
│   │   │   ├── compressVideo.js          # 175 lines  - FFmpeg video compression
│   │   │   ├── cloudinary.js             # 144 lines  - Cloudinary upload/delete
│   │   │   ├── trendScore.js             # 113 lines  - Trending algorithm
│   │   │   ├── helper.js                 # 57 lines   - Identity masking stages
│   │   │   ├── identity.resolver.js      # 54 lines   - Avatar/Cover resolution
│   │   │   ├── ApiError.js               # ~20 lines  - Custom error class
│   │   │   ├── ApiResponse.js            # ~10 lines  - Response wrapper
│   │   │   ├── asyncHandler.js           # ~10 lines  - Async error wrapper
│   │   │   └── otp.service.js            # ~15 lines  - OTP generation
│   │   │
│   │   ├── middlewares/             # ~200 lines total
│   │   │   ├── auth.middleware.js        # ~40 lines  - JWT verification
│   │   │   ├── multer.middleware.js      # ~40 lines  - File upload config
│   │   │   ├── validate.middleware.js    # ~35 lines  - Joi validation
│   │   │   └── rate-limiters/            # ~150 lines
│   │   │       ├── auth.limiters.js      # ~60 lines  - Auth rate limits
│   │   │       ├── content.limiters.js   # ~35 lines  - Content rate limits
│   │   │       ├── ai.limiter.js         # ~20 lines  - AI rate limits
│   │   │       ├── contact.limiter.js    # ~20 lines  - Contact rate limits
│   │   │       └── index.js              # ~15 lines  - Export barrel
│   │   │
│   │   ├── validations/             # ~400 lines total
│   │   │   ├── auth.validation.js        # ~90 lines  - Auth schemas
│   │   │   ├── user.validation.js        # ~70 lines  - User schemas
│   │   │   ├── video.validation.js       # ~55 lines  - Video schemas
│   │   │   ├── tweet.validation.js       # ~45 lines  - Tweet schemas
│   │   │   ├── playlist.validation.js    # ~45 lines  - Playlist schemas
│   │   │   ├── comment.validation.js     # ~30 lines  - Comment schemas
│   │   │   ├── contact.validation.js     # ~30 lines  - Contact schemas
│   │   │   ├── subscription.validation.js# ~15 lines  - Subscription schemas
│   │   │   └── index.js                  # ~15 lines  - Export barrel
│   │   │
│   │   ├── services/                # ~280 lines total
│   │   │   ├── videoAI.service.js        # ~220 lines - Gemini AI integration
│   │   │   └── auth.service.js           # ~45 lines  - JWT helpers
│   │   │
│   │   ├── cron/
│   │   │   └── trendCron.js              # ~45 lines  - Scheduled trend updates
│   │   │
│   │   └── db/
│   │       └── connection.js             # ~15 lines  - MongoDB connection
│   │
│   ├── package.json                 # Dependencies
│   └── .env.example                 # Environment template
│
├── Frontend/                         # React 19 (Vite) Client
│   ├── src/
│   │   ├── main.jsx                 # 257 lines  - Router + Providers
│   │   ├── App.jsx                  # 91 lines   - Layout orchestration
│   │   ├── index.css                # ~65 lines  - Global styles
│   │   │
│   │   ├── pages/                   # ~8,200 lines total
│   │   │   ├── Customize.jsx             # 1066 lines - Profile customization wizard
│   │   │   ├── VideoPlayer.jsx           # 856 lines  - Cinema video player
│   │   │   ├── BuildFeed.jsx             # ~730 lines - Feed preferences
│   │   │   ├── ForgotPassword.jsx        # ~720 lines - Password recovery
│   │   │   ├── About.jsx                 # ~690 lines - About page
│   │   │   ├── UploadVideo.jsx           # ~720 lines - Video upload
│   │   │   ├── Channel.jsx               # ~620 lines - User profile page
│   │   │   ├── Register.jsx              # ~630 lines - Registration flow
│   │   │   ├── KillSwitch.jsx            # ~580 lines - Identity cloaking
│   │   │   ├── Contact.jsx               # ~540 lines - Contact form
│   │   │   ├── Trending.jsx              # ~475 lines - Trending page
│   │   │   ├── CinemaFeed.jsx            # ~440 lines - Cinema home
│   │   │   ├── ChangePassword.jsx        # ~430 lines - Password change
│   │   │   ├── Following.jsx             # ~390 lines - Following feed
│   │   │   ├── Settings.jsx              # ~410 lines - Settings page
│   │   │   ├── Login.jsx                 # ~365 lines - Login page
│   │   │   ├── Home.jsx                  # ~290 lines - Gateway page
│   │   │   ├── WireFeed.jsx              # ~275 lines - Wire home
│   │   │   ├── ShadowsFeed.jsx           # ~265 lines - Shadows home
│   │   │   ├── Saved.jsx                 # ~250 lines - Saved content
│   │   │   ├── Support.jsx               # ~240 lines - Support page
│   │   │   ├── Landing.jsx               # ~225 lines - Landing page
│   │   │   ├── Dashboard.jsx             # ~385 lines - Creator dashboard
│   │   │   ├── NotFound.jsx              # ~215 lines - 404 page
│   │   │   └── History.jsx               # ~185 lines - Watch history
│   │   │
│   │   ├── Components/              # ~11,500 lines total
│   │   │   ├── WirePost.jsx              # 784 lines  - Wire post detail
│   │   │   ├── ShadowPost.jsx            # 667 lines  - Shadow post detail
│   │   │   ├── Search.jsx                # ~505 lines - Search page
│   │   │   ├── Header.jsx                # ~520 lines - App header
│   │   │   ├── WireCard.jsx              # ~500 lines - Wire post card
│   │   │   ├── WireInput.jsx             # ~490 lines - Post composer
│   │   │   ├── ShadowInput.jsx           # ~475 lines - Shadow composer
│   │   │   ├── VideoUploadForm.jsx       # ~475 lines - Upload form
│   │   │   ├── ShadowCard.jsx            # ~390 lines - Shadow card
│   │   │   ├── Sidebar.jsx               # ~380 lines - Navigation sidebar
│   │   │   ├── HeroImage.jsx             # ~375 lines - Landing hero
│   │   │   ├── ChannelCard.jsx           # ~155 lines - User card
│   │   │   ├── VideoCard.jsx             # ~155 lines - Video thumbnail
│   │   │   ├── UserCard.jsx              # ~85 lines  - Mini user card
│   │   │   ├── ErrorBoundary.jsx         # ~150 lines - Error handling
│   │   │   ├── Layout.jsx                # ~45 lines  - Layout wrapper
│   │   │   ├── Footer.jsx                # ~45 lines  - App footer
│   │   │   ├── AuthLayout.jsx            # ~35 lines  - Auth guard
│   │   │   │
│   │   │   ├── VideoPlayer/         # ~1,150 lines
│   │   │   │   ├── VideoPlayerControls.jsx # ~800 lines - Custom controls
│   │   │   │   ├── AIFeatures.jsx        # ~620 lines - AI chat/summary
│   │   │   │   ├── CommentsSection.jsx   # ~560 lines - Video comments
│   │   │   │   ├── VideoInfo.jsx         # ~495 lines - Video details
│   │   │   │   └── RelatedVideos.jsx     # ~105 lines - Related videos
│   │   │   │
│   │   │   ├── Cinema/              # ~370 lines
│   │   │   │   ├── HeroSection.jsx       # ~365 lines - Cinema hero
│   │   │   │   ├── VideoCard.jsx         # ~250 lines - Cinema video card
│   │   │   │   └── CategoryTabs.jsx      # ~135 lines - Category tabs
│   │   │   │
│   │   │   ├── Dashboard/           # ~430 lines
│   │   │   │   ├── DashboardVideoCard.jsx# ~205 lines - Video manager card
│   │   │   │   ├── RecentContent.jsx     # ~200 lines - Recent uploads
│   │   │   │   ├── StealthSection.jsx    # ~135 lines - Stealth toggle
│   │   │   │   ├── WireCardMini.jsx      # ~120 lines - Mini wire card
│   │   │   │   ├── VideoList.jsx         # ~80 lines  - Video list
│   │   │   │   ├── WireList.jsx          # ~80 lines  - Wire list
│   │   │   │   └── StatsOverview.jsx     # ~55 lines  - Stats cards
│   │   │   │
│   │   │   ├── LandingPage/         # ~640 lines
│   │   │   │   ├── BentoGrid.jsx         # ~365 lines - Feature grid
│   │   │   │   ├── HeroSection.jsx       # ~265 lines - Landing hero
│   │   │   │   ├── Footer.jsx            # ~185 lines - Landing footer
│   │   │   │   ├── InteractiveFeedDemo.jsx# ~160 lines - Feed demo
│   │   │   │   ├── AIFeatures.jsx        # ~100 lines - AI features
│   │   │   │   ├── HeroMascot.jsx        # ~85 lines  - Mascot animation
│   │   │   │   ├── MagneticButton.jsx    # ~45 lines  - Hover button
│   │   │   │   ├── CustomLogo.jsx        # ~40 lines  - Logo component
│   │   │   │   └── ScrollReveal.jsx      # ~15 lines  - Scroll animation
│   │   │   │
│   │   │   ├── Common/              # ~850 lines
│   │   │   │   ├── Skeleton.jsx          # ~850 lines - All skeleton loaders
│   │   │   │   └── AuthLock.jsx          # ~135 lines - Auth prompt modal
│   │   │   │
│   │   │   └── Video/               # ~200 lines
│   │   │       ├── VideoDetails.jsx      # ~100 lines - Video metadata
│   │   │       └── CommentsList.jsx      # ~100 lines - Comments list
│   │   │
│   │   ├── api/                     # ~470 lines total
│   │   │   ├── axios.js                  # ~135 lines - Axios config + interceptors
│   │   │   └── services/
│   │   │       ├── video.service.js      # ~90 lines  - Video API
│   │   │       ├── auth.service.js       # ~80 lines  - Auth API
│   │   │       ├── tweet.service.js      # ~50 lines  - Wire/Shadow API
│   │   │       ├── user.service.js       # ~45 lines  - User API
│   │   │       ├── comment.service.js    # ~45 lines  - Comment API
│   │   │       ├── playlist.service.js   # ~40 lines  - Playlist API
│   │   │       ├── subscription.service.js# ~30 lines - Subscription API
│   │   │       ├── library.service.js    # ~25 lines  - Library API
│   │   │       ├── dashboard.service.js  # ~15 lines  - Dashboard API
│   │   │       └── like.service.js       # ~15 lines  - Like API
│   │   │
│   │   ├── store/                   # ~95 lines
│   │   │   ├── authSlice.js              # ~70 lines  - Redux auth slice
│   │   │   └── store.js                  # ~25 lines  - Redux store config
│   │   │
│   │   ├── utils/                   # ~195 lines
│   │   │   ├── imageCompressor.js        # ~155 lines - Client-side compression
│   │   │   └── formatters.js             # ~40 lines  - Date/number formatters
│   │   │
│   │   └── assets/                  # Static images (logos, mascots)
│   │
│   ├── public/
│   │   ├── ffmpeg/                  # FFmpeg WASM for browser
│   │   ├── sitemap.xml
│   │   └── robots.txt
│   │
│   ├── package.json                 # Dependencies
│   └── vite.config.js               # Vite configuration
│
├── README.md                        # This file
└── LICENSE                          # MIT License
```

### 📊 Codebase Statistics

| Category | Files | Lines (Approx.) |
|----------|-------|-----------------|
| **Backend Controllers** | 11 | ~3,900 |
| **Backend Models** | 13 | ~650 |
| **Backend Routes** | 10 | ~550 |
| **Backend Utils** | 12 | ~1,550 |
| **Backend Middlewares** | 8 | ~200 |
| **Backend Validations** | 9 | ~400 |
| **Backend Services** | 2 | ~280 |
| **Frontend Pages** | 25 | ~8,200 |
| **Frontend Components** | 48 | ~11,500 |
| **Frontend API Services** | 11 | ~470 |
| **Frontend Store** | 2 | ~95 |
| **Frontend Utils** | 2 | ~195 |
| **Total** | **~145 files** | **~28,000 lines** |

---

## �🚀 Getting Started

### Prerequisites
*   Node.js (v18+)
*   MongoDB (Local or Atlas)
*   Cloudinary Account
*   Google Gemini API Key

### Installation

1.  **Clone the repository**
    ```bash
    git clone https://github.com/hiteshshonak/streamwire.git
    cd streamwire
    ```

2.  **Backend Setup**
    ```bash
    cd Backend
    npm install
    # Create .env based on .env.example
    npm run dev
    ```

3.  **Frontend Setup**
    ```bash
    cd Frontend
    npm install
    npm run dev
    ```

---

## 🛡️ Authenticated & Secure
*   **Protection:** `AuthLock` components prevent unauthorized actions while allowing guest browsing.
*   **Rate Limiting:** View counting logic prevents spam (1 view/12hr per user).
*   **Optimistic UI:** Instant feedback on Likes, Comments, and Subscriptions before server confirmation.

---

## 📸 Screenshots
*(Add your project screenshots here)*

---

## 🤝 Contribution
This is a portfolio project demonstrating advanced full-stack capabilities. Feedback and contributions are welcome!

---
© 2026 StreamWire. Built with ❤️ by [Hitesh Sharma](https://github.com/hiteshshonak).
