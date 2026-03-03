# StreamWire

> **Connect. Shield. Stream.**  
> A next-generation social platform combining authenticated discourse, anonymous expression, and immersive video streaming.

StreamWire is a full-stack social media application exploring the intersection of identity and anonymity. It features three distinct content experiences — **Wire** (Public), **Shadows** (Anonymous), and **Cinema** (Video) — powered by a MERN stack with AI integrations and privacy-first design.

---

## 🌟 Key Features

### 📢 The Wire (Public Feed)
- **Authenticated Discourse**: Social feed where identity is front and center
- **Rich Posts**: Text, image attachments, and integrated voting polls
- **Trend Score Algorithm**: Smart sorting based on recency, engagement, and unique views
- **Stealth Toggle**: Dynamically mask or reveal identity on any post

### 👻 Shadows (Anonymous Feed)
- **True Anonymity**: Post and comment without revealing identity
- **Kill Switch**: Instantly cloak your entire profile and content history
- **AuthLock**: Browse freely as a guest — authentication only required for interactions
- **Stealth Comments**: Participate in public threads anonymously

### 🎬 Cinema (Video Streaming)
- **Custom Video Player**: Speed controls, Picture-in-Picture, theater mode, keyboard shortcuts
- **AI-Powered** (Groq):
  - Auto-transcription via Whisper
  - AI-generated descriptions and SEO tags
  - On-demand video summarization
  - Conversational Q&A about video content
- **Engagement**: Like, subscribe, pin comments, and "Watch Later" library
- **Compression**: Server-side FFmpeg compression for optimized storage

### 🧠 Smart Features
- **Personalized "For You" Feed**: Built from watch history + selected tag preferences
- **Optimistic UI**: Instant feedback on likes and comments, with rollback on failure
- **Multi-Device Sessions**: Up to 5 concurrent logins with JWT refresh token rotation
- **View Deduplication**: TTL-based unique view tracking (1 view per user per 12 hours)

---

## 🛠️ Technology Stack

### Frontend
| Layer | Technology |
|---|---|
| Core | React 19, Vite 7 |
| State | Redux Toolkit (Auth) + TanStack React Query (Server State) |
| Styling | Tailwind CSS v4 + Framer Motion |
| HTTP | Axios with auto JWT refresh + request queueing |
| Forms | React Hook Form |
| Routing | React Router v7 |

### Backend
| Layer | Technology |
|---|---|
| Runtime | Node.js (ES Modules), Express 5 |
| Database | MongoDB + Mongoose 9 (Aggregation Pipelines) |
| Auth | JWT (HTTP-Only Cookies) + bcrypt |
| Validation | Zod schemas |
| Security | Helmet, express-rate-limit, CORS |
| Media | Cloudinary + Fluent-FFmpeg |
| AI | Groq SDK (Whisper + Llama 3.3) |
| Email | Nodemailer (Gmail App Passwords) |
| Scheduling | node-cron (daily trend score updates) |

---

## 📂 Project Structure

```
StreamWire/
├── Backend/                           # Node.js + Express API
│   ├── src/
│   │   ├── app.js                         # Express config + health check
│   │   ├── index.js                       # Server startup + graceful shutdown
│   │   ├── controllers/                   # 11 request handlers
│   │   ├── models/                        # 13 Mongoose schemas
│   │   ├── routes/                        # 10 route modules (/api/v1/*)
│   │   ├── middlewares/                   # Auth, Multer, Zod validation, rate limiters
│   │   ├── validations/                   # 8 Zod schema files
│   │   ├── utils/                         # 12 utilities (AI, FFmpeg, Cloudinary, etc.)
│   │   ├── services/                      # JWT + Video AI services
│   │   ├── cron/                          # Trend score cron job
│   │   └── db/                            # MongoDB connection
│   ├── .env.example
│   └── package.json
│
├── Frontend/                          # React 19 + Vite Client
│   ├── src/
│   │   ├── pages/                         # 25 route-level pages
│   │   ├── Components/                    # Reusable UI (26 components, 7 subdirs)
│   │   ├── api/                           # Axios instance + 10 service modules
│   │   ├── store/                         # Redux store + auth slice
│   │   ├── utils/                         # Formatters + image compressor
│   │   └── assets/                        # Static images
│   ├── public/                            # sitemap.xml, robots.txt
│   └── package.json
│
├── README.md                          # This file
└── LICENSE                            # MIT License
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js v18+
- MongoDB (local or [Atlas](https://www.mongodb.com/atlas))
- Cloudinary account
- Groq API key
- Gmail with App Password (for emails)
- FFmpeg installed system-wide

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/HiteshShoworker/StreamWire.git
   cd StreamWire
   ```

2. **Backend Setup**
   ```bash
   cd Backend
   npm install
   cp .env.example .env    # Fill in your credentials
   npm run dev
   ```

3. **Frontend Setup**
   ```bash
   cd Frontend
   npm install
   npm run dev
   ```

4. **Access the app** at `http://localhost:5173`  
   API health check: `http://localhost:8000/api/v1/health`

---

## 🛡️ Security Features

| Feature | Implementation |
|---|---|
| HTTP Security Headers | Helmet middleware |
| Rate Limiting | Granular per-route-group limiters |
| Authentication | JWT in HTTP-Only cookies with refresh token rotation |
| Session Management | 5-device limit with FIFO eviction + reuse detection |
| Input Validation | Zod schemas on all mutation endpoints |
| Password Storage | bcrypt with salt rounds |
| Identity Privacy | Configurable stealth mode + identity cloaking |
| View Anti-Spam | TTL-indexed deduplication (1 view / 12hr / user) |
| Auto Token Refresh | Axios interceptor with request queueing during refresh |

---

## 🤝 Contribution

This is a portfolio project demonstrating advanced full-stack capabilities. Feedback and contributions are welcome!

---

© 2026 StreamWire. Built with ❤️ by [Hitesh Sharma](https://github.com/HiteshShoworker).
