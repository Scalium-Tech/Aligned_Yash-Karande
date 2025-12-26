<div align="center">

# ✨ Aligned - Your Personal Operating System

### *Stay consistent by aligning who you are with what you do*

[![Made with React](https://img.shields.io/badge/Made%20with-React-61DAFB?style=for-the-badge&logo=react&logoColor=white)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)](https://supabase.com/)
[![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)

[🌐 Live Demo](#) • [📖 Documentation](#features) • [🚀 Getting Started](#-quick-start) • [💜 Support](#-support)

---

<img src="public/og-image.png" alt="Aligned Dashboard Preview" width="800"/>

</div>

## 🎯 What is Aligned?

**Aligned** is a modern personal productivity and identity alignment platform that helps you become the person you want to be. Unlike traditional productivity apps that focus on tasks and habits, Aligned starts with a fundamental question: *Who do you want to become?*

Built for students, professionals, and creators who want to build meaningful lives — one calm, focused day at a time.

## ✨ Features

### 🧭 Identity-First Approach
- Define your core identities (Developer, Creator, Athlete, etc.)
- AI-generated insights based on your chosen identity
- Track how aligned your daily actions are with who you want to become

### 📊 Smart Dashboard
- **Identity Score** - See how aligned your actions are with your goals
- **Daily Streaks** - Build consistency and maintain momentum
- **Weekly Analytics** - Visualize your progress with beautiful charts
- **AI-Powered Insights** - Get personalized recommendations

### ⏱️ Focus Sessions
- Pomodoro-style focus timer with flexible durations
- AI-generated focus tasks based on your identity
- Add custom tasks with your own duration
- Track focus minutes and completed sessions

### 📓 Reflection Journal
- Daily AI-generated prompts for self-reflection
- **Smart Insights** - Comprehensive AI analysis of your entries including:
  - Key themes identification
  - Empathetic reflections
  - Actionable suggestions
  - Daily affirmations
- **Ask AI** - Chat with AI to get personalized plans and advice
- Mood and energy tracking

### 🎯 Goals & Challenges
- Set quarterly goals with progress tracking
- 21-day challenges to build new habits
- Daily check-ins with streak tracking
- Celebration animations on completion

### 💪 Daily Habits & Health
- Customizable daily non-negotiables
- Health tracking (water, sleep, steps, nutrition)
- AI-generated personalized health suggestions
- Daily reset for fresh starts

### 🌙 Beautiful UI/UX
- Stunning dark/light mode with purple theme
- Smooth animations with Framer Motion
- Glassmorphism design elements
- Fully responsive across all devices

## 🛠️ Tech Stack

| Category | Technology |
|----------|------------|
| **Frontend** | React 18, TypeScript |
| **Styling** | Tailwind CSS, shadcn/ui |
| **Animations** | Framer Motion |
| **Build Tool** | Vite |
| **AI** | Google Gemini API |
| **Backend** | Supabase (Auth, Database) |
| **Charts** | Recharts |
| **Icons** | Lucide React |
| **Routing** | React Router DOM |

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Supabase account (for authentication)
- Google AI API key (for AI features)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/aligned.git
   cd aligned
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   Create a `.env` file in the root directory:
   ```env
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   VITE_GOOGLE_API_KEY=your_google_ai_api_key
   ```

4. **Set up Supabase**
   
   Run the SQL migrations in your Supabase SQL Editor:
   - `supabase/migrations/feedback_table.sql`
   - `supabase/migrations/contact_messages_table.sql`

5. **Start the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   
   Navigate to `http://localhost:8080`

## 📁 Project Structure

```
aligned/
├── public/                 # Static assets
├── src/
│   ├── components/
│   │   ├── dashboard/      # Dashboard components
│   │   ├── landing/        # Landing page components
│   │   └── ui/             # shadcn/ui components
│   ├── contexts/           # React contexts
│   ├── hooks/              # Custom hooks
│   ├── lib/                # Utility functions
│   ├── pages/              # Page components
│   └── App.tsx             # Main app component
├── supabase/
│   └── migrations/         # Database migrations
└── package.json
```

## 🔐 Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `VITE_SUPABASE_URL` | Your Supabase project URL | ✅ |
| `VITE_SUPABASE_ANON_KEY` | Your Supabase anonymous key | ✅ |
| `VITE_GOOGLE_API_KEY` | Google AI (Gemini) API key | ✅ |

## 📱 Screenshots

<div align="center">
<table>
<tr>
<td><img src="public/screenshots/dashboard.png" width="400"/></td>
<td><img src="public/screenshots/focus.png" width="400"/></td>
</tr>
<tr>
<td align="center"><b>Dashboard</b></td>
<td align="center"><b>Focus Sessions</b></td>
</tr>
<tr>
<td><img src="public/screenshots/journal.png" width="400"/></td>
<td><img src="public/screenshots/analytics.png" width="400"/></td>
</tr>
<tr>
<td align="center"><b>Reflection Journal</b></td>
<td align="center"><b>Analytics</b></td>
</tr>
</table>
</div>

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👤 Author

<div align="center">

**Yash Karande**

[![LinkedIn](https://img.shields.io/badge/LinkedIn-0077B5?style=for-the-badge&logo=linkedin&logoColor=white)](https://www.linkedin.com/in/yash-karande-b3544a2a1/)
[![Twitter](https://img.shields.io/badge/Twitter-1DA1F2?style=for-the-badge&logo=twitter&logoColor=white)](https://x.com/YashK57440)
[![Email](https://img.shields.io/badge/Email-D14836?style=for-the-badge&logo=gmail&logoColor=white)](mailto:yashvkarande@gmail.com)

</div>

## 💜 Support

If you find Aligned helpful, please consider:

- ⭐ **Star this repository** to show your support
- 🐛 **Report bugs** by opening an issue
- 💡 **Suggest features** to help improve Aligned
- 📢 **Share** with friends who might find it useful

---

<div align="center">

**Built with 💜 for intentional living**

*Stay aligned. Stay consistent. Become who you want to be.*

</div>
