# HidyoNepal 🏔️

## Setup (3 steps)

### 1. Install
```bash
npm install
```

### 2. Environment
```bash
cp .env.local.example .env.local
```
Fill in your Supabase URL and anon key from: Supabase Dashboard → Project Settings → API

### 3. Supabase
- Run `supabase-schema.sql` in Supabase SQL Editor
- Go to **Authentication → Providers → Email → turn OFF "Confirm email"**

### 4. Run
```bash
npm run dev
```

## PWA Icons
Drop any two PNGs into `public/icons/`:
- `icon-192x192.png`  
- `icon-512x512.png`

## Pages
- `/feed` — Posts feed with voting
- `/feed/create` — Create post
- `/trek-rooms` — Browse groups
- `/trek-rooms/create` — Create group  
- `/trek-rooms/[id]` — Group detail + join
- `/trek-rooms/[id]/board` — Members-only board
- `/marketplace` — Gear listings
- `/marketplace/list` — List your gear
- `/search` — Search everything
- `/profile` — Your profile
