# StreamWire Frontend

The client-side application for **StreamWire**, built with **React 19** and **Vite 7**. This modern frontend delivers a seamless social video experience, featuring real-time feeds, an immersive video player, and a dual-identity system (Public "Wire" vs. Anonymous "Shadows").

## ⚡ Tech Stack

- **Core**: [React 19](https://react.dev/), [Vite 7](https://vitejs.dev/)
- **State Management**: [Redux Toolkit](https://redux-toolkit.js.org/) (Auth/Global UI), [TanStack Query](https://tanstack.com/query/latest) (Server State/Caching)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/), [Framer Motion](https://www.framer.com/motion/) (Animations)
- **Routing**: `react-router-dom` v7
- **HTTP**: `axios` with interceptors for JWT refresh + request queueing
- **Forms**: [React Hook Form](https://react-hook-form.com/)
- **Icons**: [Lucide React](https://lucide.dev/)

## 📂 Key Directories

- **`src/pages`**: 25 route-level pages (`VideoPlayer`, `WireFeed`, `ShadowsFeed`, `Dashboard`, `Customize`, etc.)
- **`src/Components`**: Reusable UI blocks
  - `VideoPlayer/`: Player controls, AI features, comments, related videos
  - `Dashboard/`: Stats, video list, wire list, stealth management
  - `LandingPage/`: Hero section, bento grid, AI demo, footer
  - `Common/`: AuthLock modal, skeleton loaders
- **`src/store`**: Redux store + `authSlice` (with localStorage persistence)
- **`src/api`**: Centralized Axios instance (`axios.js`) and 10 service modules
- **`src/utils`**: Formatters (views, time, duration) + client-side image compression

## 🚀 Getting Started

### Prerequisites
- **Node.js** v18+
- Backend server running (see [Backend README](../Backend/README.md))

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

## ✨ Key Features

- **Three Feed Experiences**: Cinema (video streaming), Wire (public discourse), Shadows (anonymous)
- **Custom Video Player**: Speed controls, Picture-in-Picture, theater mode, keyboard shortcuts
- **AI Features**: Video summarization + conversational Q&A powered by Groq AI (rendered as Markdown)
- **Optimistic UI**: Instant feedback on likes and comments — rolls back on server error
- **Infinite Scroll**: Intersection Observer-based pagination on Wire and Shadows feeds
- **Auto JWT Refresh**: Axios interceptor queues failed requests during token refresh, replays them after
- **Identity Cloaking**: KillSwitch page for toggling anonymous mode across all content
- **Customization Wizard**: Multi-step profile setup with avatar/cover cropping and color picker
- **AuthLock**: Non-intrusive auth prompts that let guests browse but protect interactions
- **Skeleton Loaders**: Custom layout-matching skeletons for every page and component
- **SEO**: `sitemap.xml`, `robots.txt`, and proper meta tags
