<div align="center">

# 🚀 Taskcoda - Modern SaaS Starter Template

[![Version](https://img.shields.io/badge/version-2.1.0-blue.svg)](https://github.com/code-craka/react-starter-temp)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![React Router](https://img.shields.io/badge/React_Router-v7.5.3-CA4245?logo=react-router&logoColor=white)](https://reactrouter.com)
[![React](https://img.shields.io/badge/React-v19.1.0-61DAFB?logo=react&logoColor=black)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-v5.8.3-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-v4.1.4-38B2AC?logo=tailwind-css&logoColor=white)](https://tailwindcss.com)
[![Vitest](https://img.shields.io/badge/Vitest-v4.0.8-6E9F18?logo=vitest&logoColor=white)](https://vitest.dev)
[![Playwright](https://img.shields.io/badge/Playwright-v1.56.1-2EAD33?logo=playwright&logoColor=white)](https://playwright.dev)
[![Convex](https://img.shields.io/badge/Convex-Real--time_DB-FF6154?logo=convex&logoColor=white)](https://convex.dev)
[![Clerk](https://img.shields.io/badge/Clerk-Auth-6C47FF?logo=clerk&logoColor=white)](https://clerk.com)
[![Framer Motion](https://img.shields.io/badge/Framer_Motion-v12-0055FF?logo=framer&logoColor=white)](https://www.framer.com/motion)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](http://makeapullrequest.com)
[![Build Status](https://img.shields.io/badge/build-passing-success.svg)](https://github.com/code-craka/react-starter-temp)
[![Deployment](https://img.shields.io/badge/Vercel-Deployed-black?logo=vercel&logoColor=white)](https://vercel.com)

**A modern, production-ready SaaS starter template with stunning UI/UX, comprehensive testing, and enterprise features**

[Features](#-features) • [Demo](#-demo) • [Quick Start](#-quick-start) • [Documentation](#-documentation) • [Contributing](#-contributing)

<img src="https://img.shields.io/badge/Made_with-❤️-red.svg" alt="Made with love" />

</div>

---

## 📖 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Demo](#-demo)
- [Quick Start](#-quick-start)
- [Project Structure](#-project-structure)
- [Testing](#-testing)
- [Deployment](#-deployment)
- [Configuration](#-configuration)
- [Documentation](#-documentation)
- [Contributing](#-contributing)
- [Changelog](#-changelog)
- [License](#-license)
- [Author](#-author)
- [Support](#-support)

---

## 🌟 Overview

**Taskcoda** is a complete, production-ready SaaS starter template that eliminates months of integration work. Built with modern technologies and best practices, it provides everything you need to launch your SaaS product:

- 🎨 **Stunning UI/UX** - Modern animated landing page with Framer Motion
- 🔐 **Authentication** - Complete user management with Clerk
- 💳 **Payments** - Subscription billing with Polar.sh
- 🗄️ **Database** - Real-time backend with Convex
- 🤖 **AI Integration** - OpenAI-powered chat functionality
- 🧪 **Testing Suite** - Unit, E2E, and load testing configured
- 📊 **Observability** - Production monitoring with Sentry & Analytics
- 👥 **Admin Panel** - Comprehensive user and organization management
- 🚀 **Deploy Ready** - One-click deployment to Vercel

**Stop rebuilding the same foundation.** Start building your unique features from day one.

---

## ✨ Features

### 🎨 Enhanced Landing Page (v2.0)

<details>
<summary><strong>Hero Section</strong></summary>

- Framer Motion fade-in animations with scroll triggers
- Gradient text with shimmer effect
- Floating geometric shapes with parallax
- 3D tilt integration cards with Spring physics
- Glowing CTA button with pulse animation
- Fully responsive design

</details>

<details>
<summary><strong>Features Bento Grid</strong></summary>

- Modern responsive bento grid layout
- Tab-switching feature showcase (Collaboration, Productivity, Security)
- 3D tilt cards with hover effects
- 9 comprehensive features with animated icons
- Large showcase cards with gradient backgrounds

</details>

<details>
<summary><strong>Social Proof</strong></summary>

- Animated statistics counters (1000+ teams, 50K+ tasks)
- Auto-play testimonial carousel with Embla
- Company logos with hover effects
- Real testimonial data integration

</details>

<details>
<summary><strong>Pricing Section</strong></summary>

- 3D card tilt on hover
- Pulsing glow for "Most Popular" plan
- Dynamic plan icons (Crown, Zap, Star)
- Comprehensive comparison table
- Seamless Polar.sh checkout integration

</details>

<details>
<summary><strong>FAQ Section</strong></summary>

- Smooth accordion animations with Radix UI
- Real-time search functionality
- Category filters (8 categories)
- 12 comprehensive FAQs
- Contact CTA integration

</details>

### 🧪 Comprehensive Testing Infrastructure

- ✅ **Unit Testing** - Vitest with React Testing Library
- 🎭 **E2E Testing** - Playwright for cross-browser testing
- ⚡ **Load Testing** - k6 for performance testing
- 📊 **Coverage Reports** - Detailed code coverage analysis
- 🔍 **Visual Testing** - Screenshot and video recording
- 🎯 **API Mocking** - MSW for service worker mocking

### 📈 Enterprise Observability

- 🐛 **Error Tracking** - Sentry integration
- 📊 **Analytics** - Vercel Analytics for user behavior
- ⚡ **Caching** - Upstash Redis for rate limiting
- 📝 **Logging** - Comprehensive logging with Pino
- 🏥 **Health Checks** - System health monitoring endpoints

### 👥 Admin Panel

- User management with activity tracking
- Organization overview and management
- Real-time analytics dashboard
- System monitoring and performance metrics
- Revenue and growth tracking

### 🎯 Core SaaS Features

- 🔐 Authentication with Clerk (OAuth, email, magic links)
- 💳 Subscription management with Polar.sh
- 🗄️ Real-time database with Convex
- 🤖 AI chat with OpenAI integration
- 📱 Responsive mobile-first design
- 🎨 Modern UI with shadcn/ui and Radix UI
- 🌓 Dark/Light mode support
- 📧 Email notifications
- 🎯 Protected routes and authorization
- 👥 Team collaboration features
- 🏢 Multi-organization support
- 📊 Usage tracking and analytics
- 🔄 Webhook handling
- 📄 Legal pages (Terms, Privacy, AUP, Cookies)

### 🤖 Claude Desktop Integration

7 custom skills for AI-assisted development:
- `code-review` - Automated code quality checks
- `test-generator` - Generate unit tests
- `docs-writer` - Component documentation
- `refactor-suggest` - Code improvements
- `type-checker` - Enhanced TypeScript validation
- `perf-analyzer` - Performance optimization
- `security-audit` - Vulnerability scanning

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: React Router v7 (Full-stack React framework with SSR)
- **UI Library**: React v19
- **Language**: TypeScript v5.8.3
- **Styling**: TailwindCSS v4 + shadcn/ui + Radix UI
- **Animations**: Framer Motion v12
- **Icons**: Lucide React + Tabler Icons
- **Charts**: Recharts
- **Carousel**: Embla Carousel
- **State**: React hooks + Context API

### Backend & Services
- **Database**: Convex (Real-time serverless database)
- **Auth**: Clerk (Complete authentication solution)
- **Payments**: Polar.sh (Subscription billing)
- **AI**: OpenAI (GPT-4 powered chat)
- **Cache**: Upstash Redis
- **Email**: Resend

### Development & Testing
- **Build Tool**: Vite v6
- **Unit Testing**: Vitest v4 + Testing Library
- **E2E Testing**: Playwright v1.56
- **Load Testing**: k6
- **Mocking**: MSW (Mock Service Worker)
- **Coverage**: Vitest Coverage v8

### Deployment & Monitoring
- **Hosting**: Vercel (optimized preset)
- **Containers**: Docker support
- **Monitoring**: Sentry
- **Analytics**: Vercel Analytics
- **Logging**: Pino

---

## 🎯 Demo

### Live Demo
🌐 **[View Live Demo](https://taskcoda.com)** (Coming soon)

### Screenshots

<details>
<summary><strong>View Screenshots</strong></summary>

**Landing Page**
- Modern hero section with animations
- Features bento grid
- Social proof carousel
- Interactive pricing cards
- FAQ accordion

**Dashboard**
- Real-time analytics
- User management
- Organization overview
- AI chat interface
- Settings panel

</details>

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18+
- **npm** or **yarn**
- **Clerk** account ([Sign up](https://clerk.com))
- **Convex** account ([Sign up](https://convex.dev))
- **Polar.sh** account ([Sign up](https://polar.sh))
- **OpenAI** API key ([Get key](https://platform.openai.com))

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/code-craka/react-starter-temp.git
   cd react-starter-temp
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```

4. **Configure your `.env.local`**
   ```bash
   # Convex Production Deployment
   CONVEX_DEPLOYMENT=prod:your_deployment_name
   VITE_CONVEX_URL=https://your_deployment.convex.cloud
   CONVEX_DEPLOY_KEY=prod:your_deployment_name|your_key_here
   CONVEX_CLOUD_URL=https://your_deployment.convex.cloud
   CONVEX_SITE_URL=https://your_deployment.convex.site

   # Clerk Authentication
   VITE_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key_here
   CLERK_SECRET_KEY=your_clerk_secret_key_here

   # Polar.sh Configuration
   POLAR_ACCESS_TOKEN=your_polar_access_token_here
   POLAR_ORGANIZATION_ID=your_polar_organization_id_here
   POLAR_WEBHOOK_SECRET=your_polar_webhook_secret_here
   POLAR_SERVER=sandbox  # or "production"

   # OpenAI Configuration
   OPENAI_API_KEY=your_openai_api_key_here

   # Sentry Error Tracking
   VITE_SENTRY_DSN=your_sentry_dsn_here

   # Upstash Redis (Rate Limiting)
   UPSTASH_REDIS_REST_URL=your_upstash_url_here
   UPSTASH_REDIS_REST_TOKEN=your_upstash_token_here

   # Frontend URL
   FRONTEND_URL=http://localhost:5173
   ```

5. **Initialize Convex**
   ```bash
   npx convex dev
   ```

6. **Start development server**
   ```bash
   npm run dev
   ```

7. **Open your browser**
   ```
   http://localhost:5173
   ```

🎉 **You're ready to build!**

---

## 📁 Project Structure

```
taskcoda/
├── app/
│   ├── components/           # Reusable UI components
│   │   ├── ui/              # shadcn/ui components
│   │   ├── homepage/        # Landing page sections
│   │   │   ├── hero-enhanced.tsx
│   │   │   ├── features-bento.tsx
│   │   │   ├── social-proof.tsx
│   │   │   ├── pricing-enhanced.tsx
│   │   │   ├── faq.tsx
│   │   │   └── footer.tsx
│   │   ├── dashboard/       # Dashboard components
│   │   │   ├── app-sidebar.tsx
│   │   │   ├── site-header.tsx
│   │   │   ├── analytics.tsx
│   │   │   └── usage-dashboard.tsx
│   │   └── legal/           # Legal components
│   ├── routes/              # React Router routes
│   │   ├── home.tsx         # Landing page
│   │   ├── dashboard/       # Dashboard routes
│   │   │   ├── index.tsx
│   │   │   ├── chat.tsx
│   │   │   ├── settings.tsx
│   │   │   └── admin/       # Admin panel routes
│   │   ├── pricing.tsx      # Pricing page
│   │   ├── success.tsx      # Success page
│   │   └── webhook/         # Webhook handlers
│   ├── lib/                 # Utility libraries
│   │   ├── utils.ts
│   │   └── sentry.client.ts
│   └── app.css             # Global styles
├── convex/                  # Convex backend
│   ├── _generated/          # Auto-generated files
│   ├── schema.ts            # Database schema
│   ├── subscriptions.ts     # Subscription functions
│   ├── users.ts             # User functions
│   ├── organizations.ts     # Organization functions
│   └── chat.ts              # Chat functions
├── tests/                   # Test suites
│   ├── unit/               # Unit tests
│   ├── e2e/                # E2E tests
│   └── load/               # Load tests
├── public/                  # Static assets
├── docs/                    # Documentation
│   └── claude-desktop/      # Claude Desktop guides
├── .github/                 # GitHub configuration
│   └── workflows/           # CI/CD workflows
├── package.json             # Dependencies
├── tsconfig.json            # TypeScript config
├── tailwind.config.ts       # Tailwind config
├── vite.config.ts           # Vite config
├── playwright.config.ts     # Playwright config
├── vitest.config.ts         # Vitest config
├── Dockerfile               # Docker configuration
├── README.md                # This file
├── CHANGELOG.md             # Version history
└── LICENSE                  # MIT License
```

---

## 🧪 Testing

### Run All Tests
```bash
npm run test:all
```

### Unit Tests
```bash
# Run unit tests
npm run test

# Watch mode
npm run test:watch

# With coverage
npm run test:unit

# Interactive UI
npm run test:ui
```

### E2E Tests
```bash
# Run E2E tests
npm run test:e2e

# Interactive UI
npm run test:e2e:ui
```

### Load Tests
```bash
# Run load tests
npm run test:load
```

### Coverage Reports
After running `npm run test:unit`, open `coverage/index.html` to view detailed coverage reports.

---

## 🚢 Deployment

### Vercel (Recommended)

1. **Connect repository to Vercel**
   ```bash
   npm i -g vercel
   vercel
   ```

2. **Set environment variables** in Vercel dashboard

3. **Deploy**
   - Automatic deployment on push to main branch
   - Preview deployments for PRs

### Docker

Build and run with Docker:
```bash
# Build image
docker build -t taskcoda .

# Run container
docker run -p 3000:3000 taskcoda
```

Deploy to:
- AWS ECS
- Google Cloud Run
- Azure Container Apps
- Digital Ocean
- Fly.io
- Railway

### DIY Deployment

Build for production:
```bash
npm run build
```

Deploy the `build/` directory to any Node.js hosting platform.

---

## ⚙️ Configuration

### Environment Variables

<details>
<summary><strong>Required Variables</strong></summary>

| Variable | Description | Required |
|----------|-------------|----------|
| `CONVEX_DEPLOYMENT` | Convex deployment URL | ✅ |
| `VITE_CONVEX_URL` | Convex client URL | ✅ |
| `VITE_CLERK_PUBLISHABLE_KEY` | Clerk publishable key | ✅ |
| `CLERK_SECRET_KEY` | Clerk secret key | ✅ |
| `POLAR_ACCESS_TOKEN` | Polar.sh API token | ✅ |
| `POLAR_ORGANIZATION_ID` | Polar.sh org ID | ✅ |
| `POLAR_WEBHOOK_SECRET` | Polar.sh webhook secret | ✅ |
| `POLAR_SERVER` | Polar server mode | ✅ |
| `OPENAI_API_KEY` | OpenAI API key | ✅ |
| `VITE_SENTRY_DSN` | Sentry error tracking DSN | ✅ |
| `UPSTASH_REDIS_REST_URL` | Redis cache URL | ✅ |
| `UPSTASH_REDIS_REST_TOKEN` | Redis auth token | ✅ |
| `FRONTEND_URL` | Frontend URL | ✅ |

</details>

<details>
<summary><strong>Optional Variables</strong></summary>

| Variable | Description | Default |
|----------|-------------|---------|
| `RESEND_API_KEY` | Email service key | - |
| `FROM_EMAIL` | Email sender address | - |
| `VITE_GIT_COMMIT_SHA` | Git commit for Sentry | auto |

</details>

### Webhook Setup

Configure Polar.sh webhook:
- **URL**: `{your_domain}/webhook/polar`
- **Events**: All subscription events
- **Secret**: Use your `POLAR_WEBHOOK_SECRET`

---

## 📚 Documentation

### Guides
- [Getting Started](docs/getting-started.md)
- [Testing Guide](docs/testing.md)
- [Deployment Guide](docs/deployment.md)
- [Claude Desktop Setup](docs/claude-desktop/README.md)
- [API Reference](docs/api.md)
- [Contributing](CONTRIBUTING.md)

### Component Documentation
- [Enhanced Hero](docs/components/hero-enhanced.md)
- [Features Bento Grid](docs/components/features-bento.md)
- [Social Proof](docs/components/social-proof.md)
- [Pricing](docs/components/pricing-enhanced.md)
- [FAQ](docs/components/faq.md)

### Architecture
- [Database Schema](docs/architecture/database.md)
- [Authentication Flow](docs/architecture/auth.md)
- [Subscription Flow](docs/architecture/subscriptions.md)
- [AI Chat Integration](docs/architecture/ai-chat.md)

---

## 🤝 Contributing

We love contributions! Please read our [Contributing Guide](CONTRIBUTING.md) to get started.

### Development Workflow

1. **Fork** the repository
2. **Create** a feature branch
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. **Commit** your changes
   ```bash
   git commit -m 'feat: Add amazing feature'
   ```
4. **Push** to your branch
   ```bash
   git push origin feature/amazing-feature
   ```
5. **Open** a Pull Request

### Commit Convention

We follow [Conventional Commits](https://www.conventionalcommits.org/):
- `feat:` - New features
- `fix:` - Bug fixes
- `docs:` - Documentation changes
- `style:` - Code style changes
- `refactor:` - Code refactoring
- `test:` - Test updates
- `chore:` - Build/tooling changes

---

## 📝 Changelog

See [CHANGELOG.md](CHANGELOG.md) for detailed version history.

### Latest Version: v2.1.0
- 🐛 Critical bug fixes for production stability
- 🔧 Polar.sh SDK compatibility improvements
- 🎯 Sentry SDK v10+ configuration updates
- ✨ Missing Convex API endpoint implementation
- 🎨 Icon type consistency improvements

[View Full Changelog](CHANGELOG.md)

---

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

```
MIT License

Copyright (c) 2025 Sayem Abdullah Rihan

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

---

## 👨‍💻 Author

<div align="center">

### **Sayem Abdullah Rihan**

[![GitHub](https://img.shields.io/badge/GitHub-code--craka-181717?logo=github&logoColor=white)](https://github.com/code-craka)
[![Email](https://img.shields.io/badge/Email-hello@techsci.io-EA4335?logo=gmail&logoColor=white)](mailto:hello@techsci.io)
[![Website](https://img.shields.io/badge/Website-TechSci-4285F4?logo=google-chrome&logoColor=white)](https://techsci.io)

**Full-Stack Developer | SaaS Architect | Open Source Enthusiast**

Creator of Taskcoda and passionate about building modern, scalable web applications.

</div>

---

## 💬 Support

### Get Help

- 📧 **Email**: [hello@techsci.io](mailto:hello@techsci.io)
- 💬 **Issues**: [GitHub Issues](https://github.com/code-craka/react-starter-temp/issues)
- 📖 **Documentation**: [View Docs](docs/)
- 🐛 **Bug Reports**: [Report Bug](https://github.com/code-craka/react-starter-temp/issues/new?template=bug_report.md)
- ✨ **Feature Requests**: [Request Feature](https://github.com/code-craka/react-starter-temp/issues/new?template=feature_request.md)

### Community

- ⭐ **Star** this repo if you find it helpful
- 🔀 **Fork** to create your own version
- 📢 **Share** with other developers
- 🤝 **Contribute** to make it better

---

## 🌟 Show Your Support

If this project helped you, please consider:

- ⭐ **Starring** the repository
- 🐦 **Sharing** on social media
- 💬 **Spreading** the word
- ☕ **Sponsoring** the development

---

## 🙏 Acknowledgments

Special thanks to:
- [React Router Team](https://reactrouter.com) - Amazing full-stack React framework
- [Convex Team](https://convex.dev) - Real-time database excellence
- [Clerk Team](https://clerk.com) - Seamless authentication
- [Polar.sh Team](https://polar.sh) - Modern subscription billing
- [shadcn](https://ui.shadcn.com) - Beautiful UI components
- [Vercel](https://vercel.com) - Deployment platform
- All open-source contributors

---

## 🔥 Why Choose Taskcoda?

✅ **Production-Ready** - Launch in days, not months
✅ **Modern Stack** - Latest technologies and best practices
✅ **Fully Tested** - Unit, E2E, and load tests included
✅ **Beautiful UI** - Stunning animations and responsive design
✅ **Enterprise Features** - Admin panel, monitoring, analytics
✅ **Well Documented** - Comprehensive guides and examples
✅ **Active Support** - Regular updates and maintenance
✅ **MIT Licensed** - Use in any project, commercial or personal

---

<div align="center">

**[⬆ Back to Top](#-taskcoda---modern-saas-starter-template)**

Made with ❤️ by [Sayem Abdullah Rihan](https://github.com/code-craka)

⭐ **Star this repo if you find it useful!** ⭐

</div>
