# Doer — Web App

Next.js 16 web application with React, TypeScript, Tailwind CSS, and Zustand.

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4
- **State**: Zustand 5
- **Backend**: Supabase (PostgreSQL, Auth, Realtime)
- **Icons**: Lucide React
- **Toasts**: Sonner
- **DnD**: @dnd-kit

## Setup

### 1. Install dependencies

```bash
cd web
npm install
```

### 2. Configure environment

```bash
cp .env.example .env.local
```

Edit `.env.local` with your Supabase credentials:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### 3. Run development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### 4. Build for production

```bash
npm run build
npm start
```

## Project Structure

```
src/
├── app/            Routes (App Router)
│   ├── (auth)/     Login, Signup, OAuth callback
│   └── (app)/      Today, Upcoming, Inbox, Project, Settings
├── components/     UI components by feature
├── stores/         Zustand stores (auth, task, project, label, ui)
├── hooks/          Custom hooks (command parser)
├── lib/            Supabase clients, utilities, constants
└── types/          TypeScript interfaces
```
