# ⚙️ StreamWire — Backend API

<p align="center">
  <img src="https://img.shields.io/badge/Node.js-v18+-339933?style=for-the-badge&logo=node.js&logoColor=white" alt="Node.js"/>
  <img src="https://img.shields.io/badge/Express-5-000000?style=for-the-badge&logo=express&logoColor=white" alt="Express 5"/>
  <img src="https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white" alt="MongoDB"/>
  <img src="https://img.shields.io/badge/Mongoose-9-880000?style=for-the-badge&logo=mongoose&logoColor=white" alt="Mongoose 9"/>
  <img src="https://img.shields.io/badge/JWT-black?style=for-the-badge&logo=JSON%20web%20tokens" alt="JWT"/>
  <img src="https://img.shields.io/badge/bcrypt-00599C?style=for-the-badge" alt="bcrypt"/>
  <img src="https://img.shields.io/badge/Zod-3E67B1?style=for-the-badge&logo=zod&logoColor=white" alt="Zod"/>
  <img src="https://img.shields.io/badge/Cloudinary-3448C5?style=for-the-badge&logo=cloudinary&logoColor=white" alt="Cloudinary"/>
  <img src="https://img.shields.io/badge/Groq_AI-F55036?style=for-the-badge" alt="Groq AI"/>
  <img src="https://img.shields.io/badge/FFmpeg-007808?style=for-the-badge&logo=ffmpeg&logoColor=white" alt="FFmpeg"/>
  <img src="https://img.shields.io/badge/Nodemailer-22B573?style=for-the-badge" alt="Nodemailer"/>
  <img src="https://img.shields.io/badge/Helmet-000000?style=for-the-badge" alt="Helmet"/>
</p>

The server-side application for **StreamWire**, built with **Node.js**, **Express 5**, and **MongoDB**. This RESTful API powers authentication, media processing, AI integrations, and all social features across three content experiences — Cinema, Wire, and Shadows.

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Runtime** | [Node.js](https://nodejs.org/) (ES Modules) |
| **Framework** | [Express 5](https://expressjs.com/) |
| **Database** | [MongoDB](https://www.mongodb.com/) + [Mongoose 9](https://mongoosejs.com/) (Aggregation Pipelines) |
| **Auth** | JWT (Access + Refresh tokens in HTTP-Only Cookies) + [bcrypt](https://www.npmjs.com/package/bcrypt) |
| **Validation** | [Zod](https://zod.dev/) schemas with custom middleware |
| **Security** | [Helmet](https://helmetjs.github.io/), [express-rate-limit](https://www.npmjs.com/package/express-rate-limit), CORS |
| **Media** | [Cloudinary](https://cloudinary.com/) (hosting + transformations), [Fluent-FFmpeg](https://github.com/fluent-ffmpeg/node-fluent-ffmpeg) (two-pass compression) |
| **AI** | [Groq SDK](https://groq.com/) — Whisper (transcription) + Llama 3.3 (content generation, auto-fallback) |
| **Email** | [Nodemailer](https://nodemailer.com/) with Gmail App Passwords |
| **Scheduling** | [node-cron](https://www.npmjs.com/package/node-cron) (daily trend score updates) |
| **Logging** | [Morgan](https://www.npmjs.com/package/morgan) (combined in production, dev in development) |
| **Caching** | [node-cache](https://www.npmjs.com/package/node-cache) (OTP in-memory, 10min TTL) |

---

## 📂 Directory Structure

```
src/
├── app.js                         # Express config: Helmet, CORS, Morgan, routes, error handler
├── index.js                       # Server startup, DB connect, graceful shutdown
├── constants.js                   # App-wide constants
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
│   └── rate-limiters/
│       ├── index.js                       # Re-exports all limiters
│       ├── auth.limiters.js               # Login, register, OTP, password reset
│       ├── content.limiters.js            # Upload, tweet, comment
│       ├── ai.limiter.js                  # AI API calls
│       └── contact.limiter.js             # Contact form
│
├── validations/                   # 9 Zod schema files
│   ├── index.js                       # Re-exports all schemas
│   ├── auth.validation.js
│   ├── user.validation.js
│   ├── video.validation.js
│   ├── tweet.validation.js
│   ├── comment.validation.js
│   ├── playlist.validation.js
│   ├── subscription.validation.js
│   └── contact.validation.js
│
├── utils/                         # 12 utility modules
│   ├── ai.service.js                  # Groq Whisper transcription + Llama content gen
│   ├── feedBuilder.js                 # Personalized "For You" feed algorithm
│   ├── compressVideo.js               # FFmpeg two-pass video compression
│   ├── cloudinary.js                  # Upload, delete, auto-thumbnail generation
│   ├── trendScore.js                  # Engagement-based trend scoring algorithm
│   ├── mail.js                        # Email templates (OTP, password reset, contact)
│   ├── helper.js                      # sanitizeUser, maskIdentityStage helpers
│   ├── identity.resolver.js           # Avatar/cover resolution (upload or placeholder)
│   ├── otp.service.js                 # In-memory OTP cache (node-cache, 10min TTL)
│   ├── ApiError.js                    # Custom error class
│   ├── ApiResponse.js                 # Standardized response wrapper
│   └── asyncHandler.js                # Async route handler wrapper
│
├── services/
│   ├── auth.service.js                # JWT generation + verification
│   └── videoAI.service.js             # AI summarization + Q&A (Groq)
│
├── cron/
│   └── trendCron.js                   # Daily midnight: recalculate all trend scores
│
└── db/
    └── connection.js                  # MongoDB connection via Mongoose
```

---

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

Server starts at `http://localhost:8000`.  
Health check: `GET /api/v1/health`

---

## 🔒 Security

| Feature | Implementation |
|---|---|
| HTTP Security Headers | Helmet middleware |
| Rate Limiting | Granular per-route-group limiters (auth, content, AI, contact) |
| Authentication | JWT in HTTP-Only cookies with refresh token rotation and reuse detection |
| Session Management | 5-device limit with FIFO eviction |
| Input Validation | Zod schemas on all mutation endpoints |
| Password Storage | bcrypt with salt rounds |
| Identity Masking | Content owner identity hidden when stealth mode is active |
| View Deduplication | TTL-indexed unique views (1 view per user per 12 hours) |
| Email Verification | OTP-based registration with 10-minute expiry |

---

## 🤖 AI Pipeline

Videos uploaded to StreamWire go through an automatic AI metadata pipeline:

1. **Upload** → Cloudinary (with FFmpeg compression if > target size)
2. **Transcription** → Groq Whisper (audio → text)
3. **Tag Generation** → Groq Llama 3.3 (transcript → SEO tags)
4. **Description** → Groq Llama 3.3 (transcript → description, if not provided)
5. **On-Demand**: Video summarization and conversational Q&A via `/summarize` and `/ask` endpoints

> **Fallback:** If the primary 70B model is rate-limited, automatically falls back to the 8B model.

---

## 📖 API Documentation

See [API.md](./API.md) for the complete list of endpoints, request/response formats, and authentication requirements.

---

## 🔗 Related

- [Frontend README](../Frontend/README.md)
- [Root README](../README.md)
