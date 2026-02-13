# Doer — Task Management App

A Todoist-inspired task management platform with Web, iOS, and Android clients sharing a single Supabase backend.

## Project Structure

```
doer/
├── web/         Next.js 16 (React, TypeScript, Tailwind CSS, Zustand)
├── ios/         Native Swift/SwiftUI (Supabase Swift SDK)
├── android/     Native Kotlin/Jetpack Compose (Supabase Kotlin SDK)
└── backend/     Supabase PostgreSQL migrations and SQL
```

## Features

- Task CRUD with priorities (P1-P4), due dates, descriptions
- Projects with color coding and sections
- Sub-tasks (one level of nesting)
- Labels with color picker
- Today view (overdue + today) and Upcoming view (7-day)
- Quick add with `#project` and `@label` commands (web)
- Drag-and-drop reordering (web)
- Swipe actions (iOS/Android)
- Real-time sync across all clients
- Auth (email/password signup and login)
- Profile settings (name, password)

## Quick Start

### 1. Set up the database

See [`backend/README.md`](backend/README.md)

### 2. Run the web app

See [`web/README.md`](web/README.md)

### 3. Run the iOS app

See [`ios/README.md`](ios/README.md)

### 4. Run the Android app

See [`android/README.md`](android/README.md)

## Demo Account

```
Email:    demo@doer.app
Password: demo123456
```
