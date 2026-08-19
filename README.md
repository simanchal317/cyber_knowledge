# RANGE // Offensive Security Practice Console & Drill Platform 🛡️

A modern, full-stack offensive security drill book, CTF reference, protocol exploitation matrix, and interactive practice terminal platform built with Next.js and designed for **GitHub** and **Vercel** deployment with **live multi-user state synchronization**.

---

## 🔍 Why Previous Changes Didn't Show for Other Users

In a standalone static HTML file, changes (custom topics, newly created practice machines, deleted items, custom notes) are saved **only to your browser's private `localStorage`**. 

When deployed on Vercel or GitHub:
- `localStorage` is **isolated per browser / device**.
- Other visitors have their own empty `localStorage`, so they never see your updates or new machines.
- Admin credentials in plain HTML could be viewed by anyone using "View Page Source".

---

## ⚡ How This Project Solves the Problem

1. **Cloud-Synced Backend (`/api/data`)**:
   - When an Admin creates a new Practice Machine, edits a topic, or adds a custom payload, it sends a secure request to the backend.
   - All visitors fetch and auto-sync with the shared global database in real-time.
2. **Serverless Cloud Storage Support (`lib/db.js`)**:
   - Supports **Upstash Redis / Vercel KV** (1-click free storage in Vercel Marketplace).
   - Supports **Supabase PostgreSQL** via REST.
   - Includes automatic memory & fallback cache.
3. **Server-Side Authentication (`/api/auth/login`)**:
   - Admin credentials are verified securely on the server side using session tokens, protecting your credentials.
4. **Live Dynamic IP Injection**:
   - Type your Kali (`<ATTACKER>`) and Target (`<TARGET>`) IPs once in the console header — every single command across all 70+ daemons, PrivEsc matrices, and CTF drills updates automatically.
5. **Interactive Practice Machines with Simulated Terminal**:
   - Realistic command execution, shell context switching (`kali@range` → `www-data@target`), hints, progress percentage, and flags.
   - Interactive step-by-step Machine Builder.

---

## 🚀 Quick Start (Local Development)

```bash
# 1. Navigate to the project directory
cd range-offensive-security

# 2. Install dependencies
npm install

# 3. Start local development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🌐 Deploy to Vercel & GitHub in 3 Steps

### Step 1: Push Code to GitHub
```bash
git init
git add .
git commit -m "feat: complete offensive security console platform"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/range-offensive-security.git
git push -u origin main
```

### Step 2: Deploy to Vercel
1. Go to [vercel.com](https://vercel.com) and click **"Add New..."** → **"Project"**.
2. Import your GitHub repository `range-offensive-security`.
3. Click **Deploy**.

### Step 3: Enable Permanent Multi-User Cloud Storage (Choose either A or B)

#### Option A: Upstash Redis (Recommended - 30 seconds setup)
1. On your Vercel Project Dashboard, click the **Storage** tab.
2. Click **Create Database** → select **Upstash (KV / Redis)**.
3. Vercel will automatically connect `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN`.
4. Redeploy your project — **All changes made by Admin will now be permanently saved and visible to every user worldwide!**

#### Option B: Supabase (Free PostgreSQL)
1. Create a free project at [supabase.com](https://supabase.com).
2. In the Supabase SQL Editor, run:
   ```sql
   create table range_config (
     id text primary key,
     state jsonb,
     updated_at timestamp with time zone default timezone('utc'::text, now())
   );
   ```
3. In Vercel Project Settings → **Environment Variables**, add:
   - `NEXT_PUBLIC_SUPABASE_URL` = `https://your-project.supabase.co`
   - `SUPABASE_SERVICE_ROLE_KEY` = `your-supabase-service-role-key`

---

## 🔐 Admin Credentials

- **Default Username:** `ganesh`
- **Default Password:** `2006`

*(To customize these, set `ADMIN_USERNAME` and `ADMIN_PASSWORD` in your Vercel Environment Variables).*

---

## 📁 Codebase Structure

```text
range-offensive-security/
├── app/
│   ├── api/
│   │   ├── auth/
│   │   │   ├── login/route.js    # Secure admin login endpoint
│   │   │   └── check/route.js    # Session token validation
│   │   └── data/route.js         # Shared global state synchronization API
│   ├── globals.css               # Responsive cyberpunk terminal design system
│   ├── layout.jsx                # Root layout & Google Fonts integration
│   └── page.jsx                  # Main interactive platform & terminal simulator
├── lib/
│   ├── auth.js                   # Server-side auth & token validation
│   ├── db.js                     # Multi-cloud database adapter (Upstash/Supabase/Memory)
│   └── initial-data.js           # 70+ services, privesc matrix, CTF topics, machines
├── public/                       # Static assets
├── .env.example                  # Environment configuration template
├── next.config.js                # Next.js configuration
├── package.json                  # Dependencies & scripts
├── vercel.json                   # Vercel deployment configuration
└── README.md                     # Documentation & setup guide
```
RAHUL
