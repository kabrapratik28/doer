# DOER Backend - Final Setup Steps

## Required Steps to Complete Deployment

After the code is committed, the following manual steps are required to fully deploy the backend.

---

## 1. Create Supabase Project

1. Go to https://supabase.com and create an account
2. Create a new project
3. Note your **Project Reference ID** (from the URL: `https://supabase.com/dashboard/project/YOUR_REF_ID`)
4. Wait for the database to be provisioned

---

## 2. Get API Keys

Navigate to **Settings > API** in your Supabase Dashboard and copy:

| Key | Where to Use |
|-----|--------------|
| `Project URL` | Frontend + Edge Functions |
| `anon public` key | Frontend (client-side) |
| `service_role` key | Edge Functions (server-side only) |

---

## 3. Configure Environment

Create a `.env` file in `/backend/`:

```env
SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
SUPABASE_ANON_KEY=eyJ...your-anon-key
SUPABASE_SERVICE_ROLE_KEY=eyJ...your-service-role-key
SUPABASE_PROJECT_REF=YOUR_PROJECT_REF
```

---

## 4. Link & Deploy Database

```bash
cd backend

# Login to Supabase CLI
supabase login

# Link to your project
supabase link --project-ref YOUR_PROJECT_REF

# Push all migrations
supabase db push
```

---

## 5. Enable Required Extensions

In Supabase Dashboard:

1. Go to **Database > Extensions**
2. Enable `pg_cron` (for daily reset job)
3. Enable `uuid-ossp` (should already be enabled)

---

## 6. Schedule Daily Reset Job

Run this in the **SQL Editor**:

```sql
SELECT cron.schedule(
  'daily-reset',
  '*/5 * * * *',
  'SELECT reset_daily_tasks()'
);
```

To verify:
```sql
SELECT * FROM cron.job;
```

---

## 7. Deploy Edge Functions

```bash
cd backend

supabase functions deploy complete-task
supabase functions deploy promote-task
supabase functions deploy reorder-tasks
supabase functions deploy weekly-stats
```

---

## 8. Enable Realtime

1. Go to **Database > Replication**
2. Click on `public.tasks`
3. Enable replication for columns:
   - `id`
   - `user_id`
   - `text`
   - `status`
   - `priority`
   - `is_from_yesterday`
   - `updated_at`

---

## 9. Configure Authentication

In **Authentication > Providers**:

### Required
- [x] Email (enabled by default)

### Optional (Recommended for Mobile)
- [ ] Apple Sign-In (required for iOS App Store)
- [ ] Google OAuth

### Email Templates
Go to **Authentication > Email Templates** and customize:
- Confirm signup
- Magic link
- Reset password

---

## 10. Set Function Secrets (if needed)

If edge functions need additional secrets:

```bash
supabase secrets set MY_SECRET=value
```

---

## Verification Checklist

After completing all steps, verify:

- [ ] Can create a user account
- [ ] User profile is auto-created on signup
- [ ] Can create tasks via REST API
- [ ] Can call `/functions/v1/complete-task`
- [ ] Can call `/functions/v1/promote-task`
- [ ] Realtime updates work
- [ ] Daily reset job is scheduled

---

## API Endpoints for Frontend Teams

### Base URL
```
https://YOUR_PROJECT_REF.supabase.co
```

### Authentication
All requests must include:
```
Authorization: Bearer <user_access_token>
apikey: <SUPABASE_ANON_KEY>
```

### Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/rest/v1/tasks?select=*` | GET | Fetch all tasks |
| `/rest/v1/tasks` | POST | Create task |
| `/rest/v1/tasks?id=eq.{id}` | PATCH | Update task |
| `/rest/v1/tasks?id=eq.{id}` | DELETE | Delete task |
| `/rest/v1/profiles?id=eq.{id}` | GET | Get profile |
| `/functions/v1/complete-task` | POST | Complete task |
| `/functions/v1/promote-task` | POST | Promote to active |
| `/functions/v1/reorder-tasks` | POST | Reorder priorities |
| `/functions/v1/weekly-stats` | GET | Get velocity stats |

---

## Local Development

For local testing without deploying:

```bash
# Start local Supabase
supabase start

# View local credentials
supabase status

# Serve functions locally
supabase functions serve
```

Local API will be at: `http://localhost:54321`

---

## Troubleshooting

### "relation does not exist"
Run `supabase db push` to apply migrations

### "permission denied"
Check RLS policies in **Authentication > Policies**

### Edge function 500 errors
Check function logs: **Edge Functions > Logs**

### Cron not running
Verify pg_cron is enabled and job is scheduled

---

*Generated for DOER v1.0 Backend*
