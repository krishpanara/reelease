# Reelease AI

| Folder | What it is | Port |
|---|---|---|
| `reelease-ai-api/` | Express + MongoDB API, socket.io, AI generation (Kie.ai) | 5000 |
| `reelease-ai-next/` | Next.js 16 web app (admin panel + user app) | 3000 |

## Requirements

- Node.js 22
- MongoDB 8 running locally (`mongodb://127.0.0.1:27017`)

## Setup

```bash
# 1. API
cd reelease-ai-api
cp .env.example .env        # then fill in JWT_SECRET and TOKEN_ENCRYPTION_KEY
npm install
npm run seed                # roles, permissions, plans, default admin + user
npm run dev                 # http://localhost:5000

# 2. Web app (second terminal)
cd reelease-ai-next
cp .env.example .env.local
npm install
npm run dev                 # http://localhost:3000
```

On first run, open http://localhost:5000/install and verify the Envato purchase code.
Every API request returns "License not installed" until this is done.

Default logins after seeding (change them after first login):

| Role | Email | Password |
|---|---|---|
| Admin | `admin@reeleaseai.com` | `admin123` |
| User | `john@reeleaseai.com` | `123456789` |

## Configuration done in the admin panel

These are stored in MongoDB, not in `.env`:

- **AI Providers → Kie.ai**: API key for each of the 5 features (text/image to image/video, video motion).
  Reference images and videos stored on this server are uploaded to Kie.ai's file storage automatically,
  so generation works on localhost too.
- **Settings → Email (SMTP)**: required for sign-up verification and password reset.
- **Payment Setup**: Stripe / Razorpay / PayPal / manual, required for users to subscribe to plans.
- **Settings → Registration free credits**: credits given to new users (default 0).

The AI generation pages are available to the `user` role. Admins see them only after enabling the
AI permissions for `super_admin` under **Permissions**.

## Not in this repo

`.env` files, uploaded/generated media (`reelease-ai-api/uploads/`, except seeded logos and images),
and the license files the installer writes to `reelease-ai-api/public/`.
