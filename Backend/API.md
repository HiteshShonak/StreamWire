# StreamWire API Documentation

**Base URL**: `http://localhost:8000/api/v1`

## Authentication

All protected endpoints require a valid JWT access token sent via **HTTP-Only cookie** (set automatically on login). If the access token expires, the client should call `POST /users/refresh-token` to get a new one.

**Auth Legend:**
- 🔓 **Public** — No authentication required
- 🔒 **Protected** — Requires authenticated user (USER or ADMIN role)
- ⚡ **Rate Limited** — Has specific rate limiting applied

---

## Health Check

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/health` | 🔓 | Server status, uptime, environment, and timestamp |

---

## 1. Users & Auth (`/users`)

### Registration & Login

| Method | Endpoint | Auth | Rate Limit | Validation | Description |
|--------|----------|------|------------|------------|-------------|
| `POST` | `/users/register-request` | 🔓 | ⚡ authLimiter | `registerRequestSchema` | Send OTP to email for registration |
| `POST` | `/users/verify-otp` | 🔓 | ⚡ authLimiter | `verifyOtpSchema` | Verify OTP and create account |
| `POST` | `/users/resend-otp` | 🔓 | ⚡ otpResendLimiter | `resendOtpSchema` | Resend OTP to email |
| `POST` | `/users/login` | 🔓 | ⚡ loginLimiter | `loginSchema` | Login with email/username + password |
| `POST` | `/users/refresh-token` | 🔓 | — | — | Refresh access token using refresh cookie |

**Register Request Body:**
```json
{ "fullName": "string", "email": "string", "username": "string", "password": "string" }
```

**Login Body:**
```json
{ "identifier": "email or username", "password": "string" }
```

### Password Recovery

| Method | Endpoint | Auth | Rate Limit | Validation | Description |
|--------|----------|------|------------|------------|-------------|
| `POST` | `/users/forgot-password` | 🔓 | ⚡ passwordResetLimiter | `forgotPasswordSchema` | Send password reset OTP |
| `POST` | `/users/reset-password` | 🔓 | ⚡ authLimiter | `resetPasswordSchema` | Reset password with OTP |

**Reset Password Body:**
```json
{ "email": "string", "otp": "string", "newPassword": "string" }
```

### Session Management

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/users/logout` | 🔒 | Logout current session |
| `POST` | `/users/logout-all` | 🔒 | Logout all sessions (all devices) |

### Profile & Settings

| Method | Endpoint | Auth | Validation | Description |
|--------|----------|------|------------|-------------|
| `GET` | `/users/me` | 🔒 | — | Get current user data |
| `GET` | `/users/c/:username` | 🔓 | — | Get channel/profile by username |
| `GET` | `/users/search` | 🔓 | — | Search users by username or name |
| `PATCH` | `/users/change-password` | 🔒 | `changePasswordSchema` | Change password |
| `PATCH` | `/users/update-profile` | 🔒 | `updateProfileSchema` | Update profile (multipart: `avatar`, `coverImage`, `fullName`, `bio`, etc.) |
| `PATCH` | `/users/toggle-privacy` | 🔒 | `updatePrivacySchema` | Toggle profile privacy / identity cloaking |
| `PATCH` | `/users/deactivate` | 🔒 | — | Deactivate account |

**Update Profile** — `multipart/form-data`:
| Field | Type | Description |
|-------|------|-------------|
| `avatar` | File | Profile picture |
| `coverImage` | File | Cover/banner image |
| `fullName` | string | Display name |
| `bio` | string | User bio |

### Feed Management

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/users/feed/for-you` | 🔒 | Get personalized "For You" feed |
| `GET` | `/users/feed/preferences` | 🔒 | Get user's tag preferences |
| `PATCH` | `/users/feed/preferences` | 🔒 | Update tag preferences |
| `POST` | `/users/feed/build` | 🔒 | Build feed from watch history |
| `GET` | `/users/feed/tags` | 🔒 | Get all available tags |
| `GET` | `/users/feed/tags/popular` | 🔒 | Get popular tags (query: `?limit=50`) |

---

## 2. Videos (`/videos`)

### Public

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/videos` | 🔓 | Get all videos (query: `?page`, `?limit`, `?query`, `?sortBy`, `?sortType`, `?userId`) |
| `GET` | `/videos/v/:videoId` | 🔓 | Get video by ID (also records view) |

### AI Features

| Method | Endpoint | Auth | Rate Limit | Description |
|--------|----------|------|------------|-------------|
| `POST` | `/videos/v/:videoId/summarize` | 🔓 | ⚡ aiLimiter | Generate AI summary of video |
| `POST` | `/videos/v/:videoId/ask` | 🔓 | ⚡ aiLimiter | Ask AI a question about video content |

**Ask Question Body:**
```json
{ "question": "string", "conversationHistory": [{ "role": "user|assistant", "content": "string" }] }
```

### Creator Tools (Protected)

| Method | Endpoint | Auth | Rate Limit | Validation | Description |
|--------|----------|------|------------|------------|-------------|
| `POST` | `/videos/publish` | 🔒 | ⚡ uploadLimiter | `publishVideoSchema` | Upload and publish a video (multipart: `videoFile`, `thumbnail`) |
| `PATCH` | `/videos/v/:videoId` | 🔒 | — | `updateVideoSchema` | Update video details (multipart: optional `thumbnail`) |
| `DELETE` | `/videos/v/:videoId` | 🔒 | — | — | Delete a video |
| `PATCH` | `/videos/toggle/publish/:videoId` | 🔒 | — | — | Toggle publish/draft status |

**Publish Video** — `multipart/form-data`:
| Field | Type | Description |
|-------|------|-------------|
| `videoFile` | File | Video file (max 100MB) |
| `thumbnail` | File | Thumbnail image (max 5MB) |
| `title` | string | Video title |
| `description` | string | Optional description (AI-generated if empty) |
| `tags` | string | Comma-separated tags |
| `isStealthMode` | boolean | Post anonymously |

---

## 3. Tweets / Wire / Shadows (`/tweets`)

### Public

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/tweets` | 🔓 | Get all tweets (query: `?page`, `?limit`, `?sortBy`, `?sortType`, `?isStealthMode`) |
| `GET` | `/tweets/user/:userId` | 🔓 | Get tweets by user |
| `GET` | `/tweets/:tweetId` | 🔓 | Get single tweet |

### Protected

| Method | Endpoint | Auth | Rate Limit | Validation | Description |
|--------|----------|------|------------|------------|-------------|
| `POST` | `/tweets` | 🔒 | ⚡ createContentLimiter | `createTweetSchema` | Create tweet (multipart: `image`) |
| `PATCH` | `/tweets/:tweetId` | 🔒 | — | `updateTweetSchema` | Update tweet |
| `DELETE` | `/tweets/:tweetId` | 🔒 | — | — | Delete tweet |
| `POST` | `/tweets/vote/:tweetId` | 🔒 | — | `voteOnPollSchema` | Vote on a poll |

**Create Tweet** — `multipart/form-data`:
| Field | Type | Description |
|-------|------|-------------|
| `content` | string | Post content |
| `image` | File | Optional attached image |
| `isStealthMode` | boolean | Post as anonymous (Shadows mode) |
| `poll` | JSON | Optional poll `{ question, options: ["a", "b", ...] }` |

---

## 4. Comments (`/comments`)

### Public (Read-Only)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/comments/v/:videoId` | 🔓 | Get comments for a video (query: `?page`, `?limit`) |
| `GET` | `/comments/t/:tweetId` | 🔓 | Get comments for a tweet |
| `GET` | `/comments/v/:videoId/pinned` | 🔓 | Get pinned comments for a video |

### Protected

| Method | Endpoint | Auth | Rate Limit | Validation | Description |
|--------|----------|------|------------|------------|-------------|
| `POST` | `/comments/v/:videoId` | 🔒 | ⚡ createContentLimiter | `addCommentSchema` | Add comment to video |
| `POST` | `/comments/t/:tweetId` | 🔒 | ⚡ createContentLimiter | `addCommentSchema` | Add comment to tweet |
| `PATCH` | `/comments/c/:commentId` | 🔒 | — | `updateCommentSchema` | Edit a comment |
| `DELETE` | `/comments/c/:commentId` | 🔒 | — | — | Delete a comment |
| `POST` | `/comments/v/:videoId/pin/:commentId` | 🔒 | — | — | Pin/unpin comment (video owner only) |

**Add Comment Body:**
```json
{ "content": "string", "isStealthMode": false }
```

---

## 5. Subscriptions (`/subscriptions`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/subscriptions/c/:channelId` | 🔒 | Toggle subscribe/unsubscribe (or send request for private channels) |
| `GET` | `/subscriptions/c/:channelId` | 🔓 | Get subscriber list for a channel |
| `GET` | `/subscriptions/u/:subscriberId` | 🔓 | Get channels a user follows |
| `GET` | `/subscriptions/requests` | 🔒 | Get pending subscription requests (for your channel) |
| `PATCH` | `/subscriptions/requests/:requestId` | 🔒 | Accept or reject a request |

**Manage Request Body:**
```json
{ "action": "ACCEPT" }  // or "REJECT"
```

---

## 6. Likes (`/likes`)

All like endpoints are **protected** and return `{ isLiked: true/false }`.

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/likes/toggle/v/:videoId` | 🔒 | Toggle video like |
| `POST` | `/likes/toggle/c/:commentId` | 🔒 | Toggle comment like |
| `POST` | `/likes/toggle/t/:tweetId` | 🔒 | Toggle tweet like |

---

## 7. Library (`/library`)

All library endpoints are **protected**.

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/library/history` | 🔒 | Get watch history (query: `?page`, `?limit`) |
| `PATCH` | `/library/history/:videoId` | 🔒 | Update watch progress (playback position) |
| `GET` | `/library/watch-later` | 🔒 | Get watch later list |
| `POST` | `/library/watch-later/:videoId` | 🔒 | Toggle watch later |
| `GET` | `/library/watch-later/:videoId` | 🔒 | Check if video is in watch later |
| `GET` | `/library/liked-videos` | 🔒 | Get liked videos |
| `GET` | `/library/playlists` | 🔒 | Get saved playlists |

---

## 8. Playlists (`/playlists`)

### Public

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/playlists/user/:userId` | 🔓 | Get user's playlists |
| `GET` | `/playlists/:playlistId` | 🔓 | Get playlist by ID (with videos) |

### Protected

| Method | Endpoint | Auth | Rate Limit | Validation | Description |
|--------|----------|------|------------|------------|-------------|
| `POST` | `/playlists` | 🔒 | ⚡ createContentLimiter | `createPlaylistSchema` | Create playlist |
| `PATCH` | `/playlists/:playlistId` | 🔒 | — | `updatePlaylistSchema` | Update playlist |
| `DELETE` | `/playlists/:playlistId` | 🔒 | — | — | Delete playlist |
| `PATCH` | `/playlists/add/:videoId/:playlistId` | 🔒 | — | — | Add video to playlist |
| `PATCH` | `/playlists/remove/:videoId/:playlistId` | 🔒 | — | — | Remove video from playlist |
| `POST` | `/playlists/save/:playlistId` | 🔒 | — | — | Save/unsave playlist to library |

**Create Playlist Body:**
```json
{ "name": "string", "description": "string" }
```

---

## 9. Dashboard (`/dashboard`)

All dashboard endpoints are **protected**.

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/dashboard/stats` | 🔒 | Get channel analytics (total views, subscribers, likes, videos) |
| `GET` | `/dashboard/videos` | 🔒 | Get channel videos for management (with edit/delete capabilities) |

---

## 10. Contact (`/contact`)

| Method | Endpoint | Auth | Rate Limit | Validation | Description |
|--------|----------|------|------------|------------|-------------|
| `POST` | `/contact/send` | 🔓 | ⚡ contactLimiter | `contactFormSchema` | Send contact form email |

**Contact Body:**
```json
{ "name": "string", "email": "string", "subject": "string", "message": "string" }
```

---

## Standard Response Format

All responses follow this structure:

**Success:**
```json
{
  "statusCode": 200,
  "data": { ... },
  "message": "Success message",
  "success": true
}
```

**Error:**
```json
{
  "statusCode": 400,
  "message": "Error message",
  "success": false,
  "errors": []
}
```

## Common Query Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `page` | number | 1 | Page number for pagination |
| `limit` | number | 10-20 | Items per page |
| `sortBy` | string | `createdAt` | Sort field (`createdAt`, `views`, `trendScore`) |
| `sortType` | string | `desc` | Sort direction (`asc` or `desc`) |
| `query` | string | — | Search query (for videos and users) |

## Rate Limiting

| Limiter | Applied To | Limit |
|---------|------------|-------|
| `loginLimiter` | Login | Restricted per IP |
| `authLimiter` | Register, verify OTP, reset password | Restricted per IP |
| `otpResendLimiter` | Resend OTP | Strict per IP |
| `passwordResetLimiter` | Forgot password | Strict per IP |
| `uploadLimiter` | Video upload | Restricted per user |
| `createContentLimiter` | Create tweets, comments, playlists | Restricted per user |
| `aiLimiter` | AI summarize, ask | Restricted per IP |
| `contactLimiter` | Contact form | Strict per IP |
