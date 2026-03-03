# StreamWire Backend API

The server-side application for **StreamWire**, built with **Node.js**, **Express 5**, and **MongoDB**. This RESTful API powers authentication, media processing, AI integrations, and all social features across three content experiences — Cinema, Wire, and Shadows.

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Runtime** | [Node.js](https://nodejs.org/) (ES Modules) |
| **Framework** | [Express 5](https://expressjs.com/) |
| **Database** | [MongoDB](https://www.mongodb.com/) + [Mongoose 9](https://mongoosejs.com/) (Aggregation Pipelines) |
| **Auth** | JWT (Access + Refresh tokens in HTTP-Only Cookies) + [bcrypt](https://www.npmjs.com/package/bcrypt) |
| **Validation** | [Zod](https://zod.dev/) schemas with custom middleware |
| **Security** | [Helmet](https://helmetjs.github.io/), [express-rate-limit](https://www.npmjs.com/package/express-rate-limit), CORS |
| **Media** | [Cloudinary](https://cloudinary.com/) (hosting + transformations), [Fluent-FFmpeg](https://github.com/fluent-ffmpeg/node-fluent-ffmpeg) (video compression) |
| **AI** | [Groq SDK](https://groq.com/) — Whisper (transcription) + Llama 3.3 (content generation), with auto-fallback to faster models |
| **Email** | [Nodemailer](https://nodemailer.com/) with Gmail App Passwords |
| **Scheduling** | [node-cron](https://www.npmjs.com/package/node-cron) (daily trend score updates) |
| **Logging** | [Morgan](https://www.npmjs.com/package/morgan) (combined in production, dev in development) |

## 📂 Directory Structure

```
src/
├── app.js                         # Express config: Helmet, CORS, Morgan, routes, error handler
├── index.js                       # Server startup, DB connect, graceful shutdown
│
├── controllers/                   # 11 request handlers
│   ├── auth.controller.js             # Register (OTP), Login, JWT refresh, password recovery
│   ├── user.controller.js             # Profile, channel, search, feed, privacy, KillSwitch
│   ├── video.controller.js            # Upload + compress, AI metadata, view tracking, CRUD
│   ├── tweet.controller.js            # Wire/Shadow CRUD, polls, stealth toggle
│   ├── library.controller.js          # Watch history, watch later, liked videos, saved playlists
│   ├── playlist.controller.js         # CRUD, add/remove videos, save/unsave
│   ├── comment.controller.js          # CRUD, pin/unpin, stealth toggle
│   ├── subscription.controller.js     # Follow/unfollow, private channel requests
│   ├── like.controller.js             # Toggle likes (video/tweet/comment)
│   ├── dashboard.controller.js        # Creator analytics (channel stats, content lists)
│   └── contact.controller.js          # Contact form → email
│
├── models/                        # 13 Mongoose schemas
│   ├── user.model.js                  # Auth, profile, roles, privacy, feed preferences
│   ├── video.model.js                 # Files, metadata, AI data, engagement, stealth
│   ├── tweet.model.js                 # Content, media, polls, stealth, trendScore
│   ├── comment.model.js               # Polymorphic (video or tweet), stealth
│   ├── like.model.js                  # Polymorphic (video/tweet/comment)
│   ├── subscription.model.js          # Channel subscriptions + request management
│   ├── playlist.model.js              # Playlists with video references
│   ├── history.model.js               # Watch history with playback position
│   ├── watchLater.model.js            # Watch later queue
│   ├── savedPlaylist.model.js         # Saved playlists
│   ├── pollVote.model.js              # Poll votes (one per user per poll)
│   ├── videoView.model.js             # Unique views (12hr TTL deduplication)
│   └── tweetView.model.js             # Unique views (12hr TTL deduplication)
│
├── routes/                        # 10 route modules mounted under /api/v1
│   ├── user.routes.js                 # /api/v1/users
│   ├── video.routes.js                # /api/v1/videos
│   ├── tweet.routes.js                # /api/v1/tweets
│   ├── subscription.routes.js         # /api/v1/subscriptions
│   ├── playlist.routes.js             # /api/v1/playlists
│   ├── comment.routes.js              # /api/v1/comments
│   ├── like.routes.js                 # /api/v1/likes
│   ├── dashboard.routes.js            # /api/v1/dashboard
│   ├── library.routes.js              # /api/v1/library
│   └── contact.routes.js              # /api/v1/contact
│
├── middlewares/
│   ├── auth.middleware.js             # JWT verify (authenticate) + role guard (restrictTo)
│   ├── multer.middleware.js           # File upload (2GB limit, image/video filter)
│   ├── validate.middleware.js         # Zod schema validation with formatted errors
│   └── rate-limiters/                 # Granular rate limiting
│       ├── auth.limiters.js               # Login, register, OTP, password reset
│       ├── content.limiters.js            # Upload, tweet, comment
│       ├── ai.limiter.js                  # AI API calls
│       └── contact.limiter.js             # Contact form
│
├── validations/                   # Zod schemas for request validation
│   ├── auth.validation.js
│   ├── user.validation.js
│   ├── video.validation.js
│   ├── tweet.validation.js
│   ├── playlist.validation.js
│   ├── comment.validation.js
│   ├── contact.validation.js
│   └── subscription.validation.js
│
├── utils/                         # 12 utility modules
│   ├── ai.service.js                  # Groq Whisper transcription + Llama content gen
│   ├── feedBuilder.js                 # Personalized "For You" feed algorithm
│   ├── compressVideo.js               # FFmpeg two-pass video compression
│   ├── cloudinary.js                  # Upload, delete, auto-thumbnail generation
│   ├── trendScore.js                  # Engagement-based trend scoring algorithm
│   ├── mail.js                        # Email templates (OTP, password reset, contact)
│   ├── helper.js                      # sanitizeUser, maskIdentityStage
│   ├── identity.resolver.js           # Avatar/Cover resolution (upload or placeholder)
│   ├── otp.service.js                 # In-memory OTP cache (node-cache, 10min TTL)
│   ├── ApiError.js                    # Custom error class
│   ├── ApiResponse.js                 # Standardized response wrapper
│   └── asyncHandler.js                # Async route handler wrapper
│
├── services/                      # Business logic services
│   ├── auth.service.js                # JWT generation + verification
│   └── videoAI.service.js             # AI summarization + Q&A (Groq)
│
├── cron/
│   └── trendCron.js                   # Daily midnight: recalculate all trend scores
│
└── db/
    └── connection.js                  # MongoDB connection via Mongoose
```

## 🚀 Getting Started

### Prerequisites
- **Node.js** v18+
- **MongoDB** (local or [Atlas](https://www.mongodb.com/atlas))
- **Cloudinary** account
- **Groq** API key
- **Gmail** with App Password (for email service)
- **FFmpeg** installed system-wide (for video compression)

### Setup

```bash
cd Backend
npm install
```

Copy `.env.example` → `.env` and fill in your credentials:
```bash
cp .env.example .env
```

See `.env.example` for all required environment variables with placeholder descriptions.

### Run

```bash
# Development (with auto-reload)
npm run dev

# Production
npm start
```

Server starts at `http://localhost:8000`. Health check: `GET /api/v1/health`

## 🔒 Security

- **Helmet**: HTTP security headers
- **Rate Limiting**: Granular per-route-group limiters (auth, content, AI, contact)
- **JWT**: HTTP-Only cookies with refresh token rotation and reuse detection
- **Multi-Device Sessions**: 5-token limit with FIFO eviction
- **Zod Validation**: Schema-based input validation on all mutation endpoints
- **bcrypt**: Password hashing with salt rounds
- **Identity Masking**: Content owner identity hidden when stealth mode is active
- **View Deduplication**: TTL-indexed unique views (1 view per user per 12 hours)

## 🤖 AI Pipeline

Videos uploaded to StreamWire go through an automatic AI metadata pipeline:

1. **Upload** → Cloudinary (with compression if > target size)
2. **Transcription** → Groq Whisper (audio → text)
3. **Tag Generation** → Groq Llama 3.3 (transcript → SEO tags)
4. **Description** → Groq Llama 3.3 (transcript → description, if not provided)
5. **On-Demand**: Video summarization and conversational Q&A via `/summarize` and `/ask` endpoints

Fallback: If the primary 70B model is rate-limited, automatically falls back to the 8B model.
