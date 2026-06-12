# Portfolio Website

A high-performance **Next.js 14** portfolio featuring an intelligent **AI chatbot** (powered by Google Gemini), **RAG (Retrieval-Augmented Generation)** for contextual answers, dynamic content management.

> _"I build systems that think."_

## ✨ Key Features

### 🧠 **Intelligent AI Chatbot**

- **Google Gemini 2.5 Flash**: Fast, cost-effective, and intelligent
- **RAG-Enabled**: Chatbot accesses your project documentation for context-aware answers
- **Adaptive Personas**: Switches between "Recruiter Mode" and "Dev Mode" based on conversation
- **Rate Limiting**: Built-in protection with Firebase (optional)
- **Real-time Streaming**: Smooth, responsive chat experience

### 🎨 **Aesthetic**

- **Atmosphere Layer**: Translucent depth-of-field effect for cinematic UI
- **Floating Sigils**: Animated code symbols drifting through the void
- **Glassmorphism Design**: Modern frosted-glass UI with neon accents
- **Particle Effects**: Interactive particle network and floating elements
- **Torch Cursor**: Illuminated cursor effect

### 🎛️ **Fully Dynamic Content**

- **No Code Required**: Edit JSON files to update portfolio
- **Project Management**: Add/remove projects instantly
- **Skills & Timeline**: Update on the fly
- **Admin Dashboard**: Manage content and contact messages (Firebase-backed)

### 📊 **Analytics & Contact**

- **Visit Counter**: Optional Firebase analytics
- **Contact Form**: Web3Forms integration with validation
- **Message Management**: Review submissions in admin panel
- **Rate Limiting**: Prevent spam on chatbot and contact form

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18+ (with npm)
- **Git** for version control

### Installation

```bash
# Clone the repository
git clone <repo-url>
cd ai-portfolio

# Install dependencies
npm install

# Create environment file
cp .env.example .env.local

# Start development server
npm run dev
```

Visit `http://localhost:3000` to see your portfolio.

---

## 🔧 Configuration

### 1. **Update Portfolio Content** (`content/`)

Edit JSON files to customize your portfolio:

#### `profile.json`

```json
{
  "personal": {
    "name": "Your Name",
    "title": "Your Title",
    "email": "your@email.com",
    "links": {
      "github": "https://github.com/yourusername",
      "linkedin": "https://linkedin.com/in/yourprofile",
      "portfolio": "https://yourportfolio.com",
      "twitter": "https://twitter.com/yourhandle",
      "instagram": "https://instagram.com/yourhandle"
    },
    "location": "Your City, Country"
  },
  "skillsSummary": {
    "languages": ["Python", "TypeScript", "JavaScript"],
    "software": ["React", "Next.js", "TensorFlow"]
  }
}
```

#### `skills.json`

```json
[
  {
    "name": "Python",
    "category": "Backend",
    "level": 95,
    "experience": "5+ years"
  }
]
```

#### `experience.json`

```json
[
  {
    "type": "Experience",
    "role": "Senior AI Engineer",
    "company": "Your Company",
    "period": "2023 - Present",
    "location": "City, Country",
    "description": ["Built ML systems", "Led research"],
    "order": 1
  }
]
```

#### `projects.json`

```json
[
  {
    "slug": "my-project",
    "title": "Project Title",
    "description": "Brief description",
    "imageUrl": "/images/projects/my-project.jpg",
    "projectUrl": "https://project-url.com",
    "githubUrl": "https://github.com/repo",
    "tech": ["Python", "React"],
    "order": 1
  }
]
```

### 2. **Set Up Environment Variables** (`.env.local`)

**Required:**

```env
# Google Gemini API
GEMINI_API_KEY=your_gemini_api_key

# Contact form (Web3Forms)
NEXT_PUBLIC_WEB3FORMS_ACCESS_KEY=your_web3forms_key

# App URL
NEXT_PUBLIC_APP_URL=https://yourdomain.com
```

**Optional (Analytics & Admin):**

```env
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=

# Firebase Admin (for rate limiting & analytics)
FIREBASE_ADMIN_SERVICE_ACCOUNT_JSON={"type": "service_account", ...}
# OR split format:
FIREBASE_PROJECT_ID=
FIREBASE_CLIENT_EMAIL=
FIREBASE_PRIVATE_KEY=
```

### 3. **Add Project Documentation** (for RAG)

Create markdown files in `lib/project-docs/` matching your project slugs:

```bash
lib/project-docs/
  ├── my-project.md          # Document for "my-project" from projects.json
  ├── another-project.md
  └── ...
```

Example `my-project.md`:

```markdown
# My Project

## Overview

This project uses Python and React to solve problem X.

## Tech Stack

- Python 3.11
- FastAPI
- React 18
- PostgreSQL

## Key Features

- Feature 1
- Feature 2
- Feature 3

## Architecture

[Description of system architecture]
```

### 4. **Customize Images**

Replace default images:

- **Hero**: `/public/images/hero_*.jpg`
- **Projects**: `/public/images/projects/{slug}.jpg`
- **Favicon**: `app/favicon.ico`

---

## 📁 Project Structure

```
ai-portfolio/
├── app/
│   ├── (site)/              # Public pages
│   │   ├── layout.tsx
│   │   ├── page.tsx         # Home
│   │   ├── error.tsx        # Error boundary
│   │   ├── not-found.tsx
│   │   ├── projects/[slug]/ # Project detail pages
│   │   └── services/        # Services page
│   ├── api/analytics/       # API routes
│   └── layout.tsx           # Root layout
│
├── components/
│   ├── layout/              # Nav, footer
│   ├── sections/            # Page sections
│   ├── effects/             # Visual effects
│   ├── chatbot.tsx          # AI chatbot UI
│   └── ui/                  # UI utilities
│
├── lib/
│   ├── content/             # JSON loaders & types
│   ├── ai/                  # Gemini API integration
│   ├── analytics/           # Firebase (optional)
│   └── utils.ts
│
├── content/
│   ├── profile.json
│   ├── skills.json
│   ├── experience.json
│   └── projects.json
│
├── public/
│   └── images/
│
├── docs/
│   └── ARCHITECTURE.md
│
└── .env.local               # Environment variables
```

---

## 🛠️ Development

### Commands

```bash
# Start dev server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linting
npm run lint

# Clean Next.js cache
npm run clean
```

### Development Features

- **Hot Reload**: Changes instantly reflect in browser
- **TypeScript**: Full type safety
- **Tailwind CSS**: Utility-first styling
- **Framer Motion**: Smooth animations

---

## 🌐 Deployment

### Option 1: Vercel (Recommended)

1. **Connect repository**
   - Push code to GitHub
   - Import project in Vercel

2. **Set environment variables**
   - Add all `.env.local` variables to Vercel project settings

3. **Deploy**
   - Vercel deploys automatically on push

### Option 2: Google Cloud Run

Use the included `deploy.sh`:

```bash
# Update GCP_PROJECT_ID in deploy.sh
./deploy.sh
```

### Option 3: Docker

```bash
# Build Docker image
docker build -t ai-portfolio .

# Run container
docker run -p 3000:3000 -e GEMINI_API_KEY=xxx ai-portfolio
```

---

## 🔐 Security

- **Firestore Rules**: Configured for read-only public access
- **Rate Limiting**: Prevents chatbot/contact form abuse
- **Environment Variables**: Sensitive keys never committed
- **Input Validation**: Zod schema validation on all forms
- **CORS**: Properly configured for Web3Forms

---

## 📊 Optional Features

### Analytics (Firebase)

Enable visit tracking and chat rate limiting:

1. Create Firebase project
2. Add credentials to `.env.local`
3. Enable Firestore database
4. Update `firestore.rules` if needed

### Admin Dashboard

Manage projects, skills, and contact messages:

1. Set up Firebase authentication
2. Access admin panel at `/admin` (requires setup)
3. Manage content without code changes

---

## 🎨 Customization Guide

### Change Color Theme

Edit `tailwind.config.ts`:

```ts
theme: {
  extend: {
    colors: {
      primary: "var(--primary)",      // Cyan by default
      secondary: "var(--secondary)",   // Purple by default
    }
  }
}
```

### Modify Particle Effects

- `components/effects/particle-network.tsx`
- `components/effects/floating-sigils.tsx`
- `myhero/particle-field.tsx`

### Adjust Chatbot Behavior

- System prompt: `lib/ai/prompt.ts`
- RAG documents: `lib/project-docs/*.md`
- Conversation history: `components/chatbot.tsx`

---

## 🤖 AI Chatbot Setup

### How RAG Works

1. **User asks question** → Chatbot receives input
2. **System loads context** → Portfolio data + project docs
3. **Gemini API called** → With system prompt + context
4. **Response streamed** → Real-time reply to user
5. **Rate limit checked** → Firebase prevents abuse (optional)

### Improving Answers

1. Add detailed project documentation to `lib/project-docs/`
2. Include specific metrics and achievements
3. Mention technologies and methodologies
4. Provide context about problem-solving approach

Example good documentation:

```markdown
# EdgeAI Project

## Problem Solved

Reduced inference latency from 500ms to 50ms on edge devices.

## Technologies

- TensorFlow Lite
- ONNX Runtime
- Quantization (INT8)

## Results

- 10x speedup
- 80% model size reduction
- Energy efficiency improved 90%
```

---

## 🧪 Testing

### Build Verification

```bash
npm run build
```

### Type Checking

```bash
# TypeScript strict mode is enabled
npm run build
```

### Linting

```bash
npm run lint
```

---

## 📝 Content Management

### Editing Workflow

1. **Edit content JSON files** (`content/*.json`)
2. **For AI context**: Update `lib/project-docs/*.md`
3. **Push to repository**
4. **Vercel auto-deploys** (or manually deploy)

### Adding a New Project

1. Add entry to `content/projects.json`:

```json
{
  "slug": "new-project",
  "title": "New Project",
  "description": "...",
  "imageUrl": "/images/projects/new-project.jpg",
  "projectUrl": "...",
  "githubUrl": "...",
  "tech": ["..."],
  "order": 1
}
```

2. Create documentation `lib/project-docs/new-project.md`
3. Add image to `/public/images/projects/new-project.jpg`
4. Deploy

---

## 🐛 Troubleshooting

### Chatbot not responding

- Check `GEMINI_API_KEY` is set
- Verify Firebase rate limit not exceeded
- Check console for errors

### Images not loading

- Ensure files exist in `/public/images/`
- Check file paths in JSON match actual files
- Use absolute paths starting with `/`

### Contact form not working

- Verify `NEXT_PUBLIC_WEB3FORMS_ACCESS_KEY` is set
- Check form validation (phone, email, message)
- Ensure CORS allows requests

### Build errors

- Run `npm run clean` then `npm run build`
- Check all environment variables are set
- Verify Node.js version >= 18

---

## 📚 Additional Resources

- **Next.js Docs**: https://nextjs.org/docs
- **Tailwind CSS**: https://tailwindcss.com/docs
- **Framer Motion**: https://www.framer.com/motion/
- **Google Gemini API**: https://ai.google.dev/
- **Firebase Docs**: https://firebase.google.com/docs

---

## 📄 License

This project is open source. Check LICENSE file for details.

---

## 🤝 Contributing

Found a bug or have suggestions? Feel free to submit issues and pull requests.

---

## 👤 Author

**Derek Yendoh**

- 🌐 [Portfolio](https://your-portfolio.com)
- 💼 [LinkedIn](https://linkedin.com/in/your-profile)
- 🐙 [GitHub](https://github.com/your-username)
- 🐦 [Twitter](https://twitter.com/your-handle)

---

**Built with** ❤️ using Next.js, Tailwind CSS, Framer Motion, and Google Gemini
