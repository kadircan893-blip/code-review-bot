# 🤖 Code Review Bot

> Automatic AI-powered Pull Request reviews using Groq, posted directly to GitHub.

[![Next.js](https://img.shields.io/badge/Next.js-14-black?style=flat-square&logo=nextdotjs)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat-square&logo=typescript)](https://typescriptlang.org)
[![Groq](https://img.shields.io/badge/Groq-llama--3.3--70b-orange?style=flat-square)](https://groq.com)
[![Prisma](https://img.shields.io/badge/Prisma-5-2D3748?style=flat-square&logo=prisma)](https://prisma.io)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](LICENSE)

---

## ✨ Features

- **Instant AI Reviews** — Groq (llama-3.3-70b) analyzes every PR within seconds of opening
- **Smart Scoring** — Each PR gets a quality score (0–100) and grade (A+ to F)
- **Security Scanning** — Detects OWASP Top 10 vulnerabilities automatically
- **Line-Level Comments** — Precise feedback at the exact file and line number
- **GitHub Native** — Reviews posted as GitHub PR comments automatically
- **Custom Rules** — Configure focus areas, severity thresholds, and instructions
- **Real-Time Dashboard** — Track all reviews across repositories
- **SSE Streaming** — Live review status updates without page refresh

## 🏗 Architecture

```mermaid
graph LR
    A[GitHub PR opened] -->|Webhook| B[/api/webhook/github]
    B --> C[Verify HMAC signature]
    C --> D[Create Review record]
    D --> E[triggerReview async]
    E --> F[Fetch PR diff via Octokit]
    F --> G[Groq API review]
    G --> H[Save to DB]
    H --> I[Post GitHub comment]
    I --> J[Dashboard updates via SSE]
```

## 🚀 Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14 (App Router, TypeScript) |
| Styling | Tailwind CSS + shadcn/ui + Framer Motion |
| Auth | NextAuth.js v5 (GitHub OAuth) |
| Database | Prisma ORM + SQLite (dev) / PostgreSQL (prod) |
| AI | Groq API (llama-3.3-70b-versatile) |
| GitHub | Octokit REST + GitHub Webhooks |
| State | TanStack Query v5 |
| Charts | Recharts |

## 📦 Quick Start

### Prerequisites

- Node.js 20+
- A GitHub account
- A Groq API key ([console.groq.com](https://console.groq.com))

### 1. Clone & Install

```bash
git clone https://github.com/yourusername/code-review-bot.git
cd code-review-bot
npm install
```

### 2. Create GitHub OAuth App

1. Go to **GitHub → Settings → Developer Settings → OAuth Apps**
2. Click **New OAuth App**
3. Fill in:
   - **Application name**: Code Review Bot
   - **Homepage URL**: `http://localhost:3000`
   - **Authorization callback URL**: `http://localhost:3000/api/auth/callback/github`
4. Copy the **Client ID** and **Client Secret**

### 3. Configure Environment

```bash
cp .env.example .env.local
```

Edit `.env.local`:

```env
DATABASE_URL="file:./dev.db"
NEXTAUTH_SECRET="run: openssl rand -base64 32"
NEXTAUTH_URL="http://localhost:3000"
GITHUB_CLIENT_ID="your-github-client-id"
GITHUB_CLIENT_SECRET="your-github-client-secret"
GROQ_API_KEY="your-groq-api-key"
WEBHOOK_SECRET="any-random-secret"
```

### 4. Setup Database

```bash
npm run db:push    # Create schema
npm run db:seed    # Load demo data (optional)
```

### 5. Start Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) 🎉

### 6. Expose Webhook (for local testing)

GitHub needs a public URL to send PR events. Use [smee.io](https://smee.io) or [ngrok](https://ngrok.com):

```bash
# With smee.io
npx smee-client -u https://smee.io/YOUR_CHANNEL -t http://localhost:3000/api/webhook/github

# With ngrok
ngrok http 3000
# Then update NEXTAUTH_URL in .env.local with the ngrok URL
```

## 🌍 Environment Variables

| Variable | Description | Required |
|---|---|---|
| `DATABASE_URL` | SQLite path or PostgreSQL URL | ✅ |
| `NEXTAUTH_SECRET` | Random 32-byte secret for session encryption | ✅ |
| `NEXTAUTH_URL` | Your app's public URL | ✅ |
| `GITHUB_CLIENT_ID` | GitHub OAuth App Client ID | ✅ |
| `GITHUB_CLIENT_SECRET` | GitHub OAuth App Client Secret | ✅ |
| `GROQ_API_KEY` | Groq API key | ✅ |
| `WEBHOOK_SECRET` | Shared secret for webhook verification | ✅ |

## 🐳 Docker Deployment

```bash
# Copy and fill environment variables
cp .env.example .env

# Build and start
docker compose up -d

# Run migrations
docker compose exec app npx prisma migrate deploy
```

## 📡 API Reference

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/webhook/github` | Receive GitHub PR webhook events |
| `GET` | `/api/repositories` | List connected repositories |
| `POST` | `/api/repositories` | Connect a new repository |
| `DELETE` | `/api/repositories/:id` | Disconnect a repository |
| `POST` | `/api/repositories/:id/sync` | Sync PRs from GitHub |
| `GET` | `/api/reviews` | List reviews (paginated, filterable) |
| `GET` | `/api/reviews/:id` | Get single review with comments |
| `POST` | `/api/reviews/:id/retry` | Retry a failed review |
| `GET` | `/api/reviews/:id/stream` | SSE stream for review status |
| `GET` | `/api/settings` | Get user settings |
| `PATCH` | `/api/settings` | Update user settings |

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch: `git checkout -b feat/amazing-feature`
3. Commit your changes: `git commit -m 'feat: add amazing feature'`
4. Push to the branch: `git push origin feat/amazing-feature`
5. Open a Pull Request

## 📄 License

MIT License — see [LICENSE](LICENSE) for details.

---

Built with ❤️ using [Next.js](https://nextjs.org) and [Groq](https://groq.com)
