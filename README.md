# Nexus Dashboard

A modern and responsive SaaS dashboard interface built with React and Tailwind CSS. Nexus Dashboard focuses on providing a clean user experience, reusable UI components, and a structured foundation for building scalable dashboard applications.

## 🚀 Live Demo

[View Nexus Dashboard](https://nexus-dashboard-five-rho.vercel.app/)

## ✨ Features

- Modern and clean dashboard interface.
- Responsive layout for desktop, tablet, and mobile devices.
- Reusable and modular React components.
- Interactive data visualizations using Chart.js.
- Client-side navigation with React Router.
- Consistent styling with Tailwind CSS.
- Icon-based interface using Lucide React.
- Light and dark theme styling.

## 🛠️ Tech Stack

| Technology | Purpose |
|---|---|
| React 19 | UI development |
| Vite 8 | Development server and build tool |
| Tailwind CSS 4 | Styling and responsive design |
| React Router 7 | Client-side routing |
| Chart.js | Data visualization |
| Lucide React | Icons |
| JavaScript (ES6+) | Application logic |

## 📦 Getting Started

Follow these steps to run the project locally.

### 1. Clone the repository

```bash
git clone https://github.com/alkhwlyhasan777-coder/nexus-dashboard.git
```

### 2. Navigate to the project directory

```bash
cd nexus-dashboard
```

### 3. Install dependencies

```bash
npm install
```

### 4. Start the development server

```bash
npm run dev
```

Open the local URL displayed in your terminal, usually:

```text
http://localhost:5173
```

## 🏗️ Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Starts the development server |
| `npm run build` | Builds the application for production |
| `npm run preview` | Previews the production build |
| `npm run lint` | Runs ESLint to check code quality |

## 📁 Project Structure

```text
nexus-dashboard/
├── public/
├── src/
│   ├── assets/
│   ├── components/
│   ├── pages/
│   ├── App.jsx
│   ├── main.jsx
│   └── ...
├── index.html
├── package.json
├── vite.config.js
└── README.md
```

*Note: The structure above illustrates a suggested organization; adjust it to match the actual source folders.*

## 🎯 Project Goals

Nexus Dashboard is developed as a practical Front-End project to demonstrate:

- Building scalable interfaces with React.
- Creating reusable components.
- Working with modern styling tools.
- Implementing responsive layouts.
- Visualizing data through charts.
- Organizing a front-end application.

## 👨‍💻 Author

**Hasan Saeed**

Front-End Developer

- GitHub: [alkhwlyhasan777-coder](https://github.com/alkhwlyhasan777-coder)
- LinkedIn: [hassan-saed1](https://www.linkedin.com/in/hassan-saed1/)

---

If you find this project useful, feel free to explore the repository and share your feedback.

**Built with React, Tailwind CSS, and passion for Front-End Development.**

## 🔐 Authentication setup (Supabase)

Nexus Dashboard uses Supabase Auth for email/password registration, email confirmation, sign-in, password recovery, password updates, and sign-out.

### 1. Install dependencies

```bash
npm install
```

This installs the Supabase JavaScript client and refreshes `package-lock.json`.

### 2. Create a Supabase project

Create a project at [Supabase](https://supabase.com/dashboard), then open **Project Settings → API** (or the project's Connect panel) and copy the Project URL and Publishable key.

### 3. Configure local environment

Copy `.env.example` to `.env.local` and fill in:

```env
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your-supabase-publishable-key
```

The publishable key is intended for browser use. Never put a Supabase secret/service-role key in a Vite environment variable or commit it to Git.

### 4. Configure Auth URLs

In **Authentication → URL Configuration**, set the Site URL to your deployed app URL and add these Redirect URLs:

- `http://localhost:5173/**`
- `https://nexus-dashboard-five-rho.vercel.app/**`

If you use another production domain or Vercel preview domain, add its exact URL/pattern too.

### 5. Enable email/password and confirmation

In **Authentication → Sign In / Providers → Email**, enable email/password sign-up and keep email confirmation enabled. Configure a custom SMTP provider before production use; Supabase's default email service is rate-limited and intended for trying the flow.

### 6. Run locally

```bash
npm run dev
npm run lint
npm run build
```

### Auth routes

- `/signup` — create an account and request email confirmation.
- `/login` — sign in with email and password.
- `/forgot-password` — send a password recovery email.
- `/reset-password` — set a new password from the recovery link.
- `/settings/security` — change the password while signed in.

Private dashboard routes are wrapped by the Supabase session guard. Authentication does not automatically isolate existing localStorage demo data between different users; user-specific data persistence and database Row Level Security must be implemented before treating this as a multi-tenant production SaaS.
