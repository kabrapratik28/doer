# DOER Backend

**The Execution Engine** - Supabase Backend Implementation

## Overview

This is the complete backend infrastructure for DOER, a minimalist productivity app that solves "Productivity Porn" by limiting active tasks to 3 and emphasizing execution over organization.

## Tech Stack

- **Database**: PostgreSQL (via Supabase)
- **Auth**: Supabase Auth (Email/Password, Magic Link, OAuth)
- **API**: Supabase REST API + Edge Functions
- **Real-time**: Supabase Realtime subscriptions
- **Scheduled Jobs**: pg_cron for daily resets

## Project Structure

```
backend/
├── supabase/
│   ├── migrations/           # Database migrations
│   │   ├── 001_initial_schema.sql
│   │   ├── 002_rls_policies.sql
│   │   ├── 003_auth_trigger.sql
│   │   ├── 004_daily_reset_cron.sql
│   │   └── 005_helper_functions.sql
│   ├── functions/            # Edge Functions
│   │   ├── _shared/          # Shared utilities
│   │   │   ├── types.ts
│   │   │   └── cors.ts
│   │   ├── complete-task/    # Complete task + streak update
│   │   ├── promote-task/     # Move idea → active
│   │   ├── reorder-tasks/    # Update task priorities
│   │   └── weekly-stats/     # Get velocity score
│   └── config.toml           # Supabase local config
├── .env.example              # Environment template
├── .gitignore
├── package.json
└── README.md
```

## Quick Start

### Prerequisites

1. Install Supabase CLI:
   ```bash
   npm install -g supabase
   ```

2. Install Docker (required for local development)

### Local Development

1. Clone and navigate:
   ```bash
   cd backend
   ```

2. Start Supabase locally:
   ```bash
   supabase start
   ```

3. Apply migrations:
   ```bash
   supabase db reset
   ```

4. Serve Edge Functions locally:
   ```bash
   supabase functions serve
   ```

### Production Deployment

1. Create a Supabase project at https://supabase.com

2. Link to your project:
   ```bash
   supabase link --project-ref YOUR_PROJECT_REF
   ```

3. Push database migrations:
   ```bash
   supabase db push
   ```

4. Deploy Edge Functions:
   ```bash
   supabase functions deploy complete-task
   supabase functions deploy promote-task
   supabase functions deploy reorder-tasks
   supabase functions deploy weekly-stats
   ```

5. Enable pg_cron for daily reset:
   - Go to **Dashboard > Database > Extensions**
   - Enable `pg_cron`
   - Run in SQL Editor:
     ```sql
     SELECT cron.schedule('daily-reset', '*/5 * * * *', 'SELECT reset_daily_tasks()');
     ```

6. Enable Realtime for tasks table:
   - Go to **Dashboard > Database > Replication**
   - Enable replication for `public.tasks`

## API Reference

### REST API (via Supabase Client)

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/rest/v1/tasks` | GET | Fetch all user tasks |
| `/rest/v1/tasks` | POST | Create new task |
| `/rest/v1/tasks?id=eq.{id}` | PATCH | Update task |
| `/rest/v1/tasks?id=eq.{id}` | DELETE | Delete task |
| `/rest/v1/profiles?id=eq.{id}` | GET | Get user profile |
| `/rest/v1/profiles?id=eq.{id}` | PATCH | Update settings |

### Edge Functions

| Endpoint | Method | Body | Description |
|----------|--------|------|-------------|
| `/functions/v1/complete-task` | POST | `{ id: string }` | Complete task + update streak |
| `/functions/v1/promote-task` | POST | `{ id: string, priority?: number }` | Move idea → active |
| `/functions/v1/reorder-tasks` | POST | `{ task_ids: string[] }` | Update task priorities |
| `/functions/v1/weekly-stats` | GET | - | Get velocity score stats |

### Error Codes

| Code | Description |
|------|-------------|
| `UNAUTHORIZED` | Missing or invalid auth token |
| `MAX_ACTIVE_REACHED` | Already have 3 active tasks |
| `NOT_FOUND` | Resource not found |
| `INVALID_INPUT` | Missing or invalid request body |
| `INVALID_STATUS` | Task status doesn't allow this action |

## Database Schema

### profiles
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key (matches auth.users.id) |
| email | TEXT | User email |
| streak_count | INTEGER | Current consecutive days |
| streak_last_date | DATE | Last completion date |
| reset_time | TIME | Daily reset time (default: 04:00) |
| haptics_enabled | BOOLEAN | Haptics preference |
| timezone | TEXT | User timezone (IANA format) |

### tasks
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| user_id | UUID | Foreign key to auth.users |
| text | TEXT | Task content (1-500 chars) |
| status | TEXT | 'idea', 'active', or 'done' |
| priority | INTEGER | 1 (Prime), 2, or 3 |
| is_from_yesterday | BOOLEAN | Carried over from reset |
| completed_at | TIMESTAMPTZ | When marked done |

## Core Business Rules

1. **Rule of 3**: Maximum 3 active tasks at any time
2. **The Big One**: Priority 1 task is the "Prime Task"
3. **Daily Reset**: At 04:00 local time, active tasks move to ideas with "From Yesterday" flag
4. **Streak Logic**: Completing at least 1 task per day maintains streak
5. **Auto-formatting**: Task text is auto-capitalized and trimmed

## Environment Variables

Required for production:

```env
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
```

## Testing Checklist

- [ ] User signup creates profile automatically
- [ ] RLS prevents cross-user data access
- [ ] Complete task updates streak correctly
- [ ] Promote task enforces max 3 limit
- [ ] Reorder updates priorities correctly
- [ ] Daily reset moves active → ideas
- [ ] Real-time subscriptions fire on task changes
- [ ] Weekly stats calculate correctly

## License

MIT
