# Doer — Backend (Supabase)

PostgreSQL database schema with Row Level Security, triggers, and indexes.

## Database Schema

| Table | Purpose |
|-------|---------|
| `profiles` | User profiles (auto-created on signup) |
| `projects` | Task projects with Inbox auto-created per user |
| `sections` | Subdivisions within projects |
| `tasks` | Tasks with sub-task support (max 1 level) |
| `labels` | User-defined color-coded labels |
| `task_labels` | Many-to-many join between tasks and labels |

## Setup

### Option 1: Supabase Dashboard SQL Editor

1. Go to your Supabase project's SQL Editor
2. Paste the contents of `supabase/migrations/20260212000000_init_schema.sql`
3. Run it

### Option 2: psql

```bash
psql "postgresql://postgres:YOUR_DB_PASSWORD@db.YOUR_PROJECT_REF.supabase.co:5432/postgres" \
  -f supabase/migrations/20260212000000_init_schema.sql
```

### Option 3: Step by step

Run each file in `supabase/sql-steps/` in order (step1 through step7).

## Enable Realtime

After running the migration, enable Realtime replication:

```sql
ALTER PUBLICATION supabase_realtime ADD TABLE public.tasks;
ALTER PUBLICATION supabase_realtime ADD TABLE public.projects;
ALTER PUBLICATION supabase_realtime ADD TABLE public.sections;
```

## Key Triggers

- **on_auth_user_created** — Auto-creates a `profiles` row when a user signs up
- **on_profile_created** — Auto-creates an `Inbox` project for each new user
- **enforce_subtask_depth** — Prevents nesting sub-tasks beyond 1 level
- **set_*_updated_at** — Auto-updates `updated_at` timestamps
