# AlignedOS - Interview Guide

## 🎯 30-Second Elevator Pitch

> "I built **AlignedOS**, a full-stack productivity web app that helps users build consistent habits by aligning daily actions with their identity. It features a React + TypeScript frontend, Supabase backend with Row-Level Security, Razorpay payment integration, and AI-powered insights using Google Gemini. The app has a freemium model with Pro subscriptions and is deployed on Vercel."

---

## 📋 Structured Explanation

### 1. What is it?
"A personal operating system for intentional living - helps users track habits, journal, set goals, and stay focused with AI-powered guidance."

### 2. Why I built it?
"I wanted to solve my own problem of staying consistent. Most apps focus on *what to do*, but I built this around *identity* - becoming the person who naturally does those things."

### 3. Tech Stack
| Layer | Technology |
|-------|------------|
| Frontend | React 18, TypeScript, Vite, Tailwind CSS, shadcn/ui |
| Backend | Supabase (PostgreSQL + Auth + Edge Functions) |
| State | React Context + TanStack Query |
| Payments | Razorpay |
| AI | Google Gemini API |
| Deployment | Vercel (auto-deploy from GitHub) |

### 4. Key Features Implemented
- ✅ Email authentication with confirmation flow
- ✅ Row-Level Security (RLS) policies
- ✅ Pro feature gating with subscriptions
- ✅ Real-time data sync with optimistic updates
- ✅ AI-powered weekly planning
- ✅ Responsive design + dark/light mode

### 5. Challenges & Solutions

| Challenge | Solution |
|-----------|----------|
| RLS blocking signup | Created database trigger on `auth.users` |
| Slow login | Optimized - skip profile check if exists |
| Email confirmation | Built custom UI + Supabase templates |
| Payment before account | Stored payment in localStorage until signup |

---

## 💡 Technical Points to Mention

1. **Database triggers** - Shows backend/SQL knowledge
2. **RLS policies** - Shows security awareness
3. **Freemium model** - Shows business logic understanding
4. **3 external APIs** - Supabase, Razorpay, Gemini
5. **Performance optimization** - Attention to UX

---

## 🗣️ Common Q&A

**Q: Hardest part?**
> "Email confirmation with Supabase. Used database triggers and user metadata since user isn't authenticated until confirmation."

**Q: How do payments work?**
> "Razorpay for Indian payments. Payment ID stored in localStorage, linked to profile on signup completion."

**Q: How does AI work?**
> "Journal entries sent to Gemini via Supabase Edge Functions. Returns personalized insights and weekly planning."

---

## 📊 Metrics to Mention
- Production deployed at [alignedos.vercel.app](https://alignedos.vercel.app)
- Full freemium business model
- 15+ Supabase tables with RLS
- Mobile-responsive design
