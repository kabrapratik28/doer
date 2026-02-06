-- DOER Backend Schema - Daily Reset Cron Job
-- Migration: 004_daily_reset_cron.sql

-- NOTE: pg_cron extension must be enabled via Supabase Dashboard > Database > Extensions

-- Function to reset tasks at user's local reset time
CREATE OR REPLACE FUNCTION reset_daily_tasks()
RETURNS void AS $$
DECLARE
  user_record RECORD;
BEGIN
  -- Process each user based on their timezone and reset_time
  FOR user_record IN
    SELECT id, timezone, reset_time
    FROM public.profiles
  LOOP
    -- Check if current time matches user's reset time in their timezone
    IF (NOW() AT TIME ZONE user_record.timezone)::time
       BETWEEN user_record.reset_time
       AND user_record.reset_time + INTERVAL '5 minutes'
    THEN
      -- Move active tasks to ideas with "from yesterday" flag
      UPDATE public.tasks
      SET
        status = 'idea',
        priority = NULL,
        is_from_yesterday = true
      WHERE user_id = user_record.id
        AND status = 'active';

      -- Delete done tasks older than 30 days
      DELETE FROM public.tasks
      WHERE user_id = user_record.id
        AND status = 'done'
        AND completed_at < NOW() - INTERVAL '30 days';
    END IF;
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- To schedule the cron job, run this in the SQL Editor after enabling pg_cron:
-- SELECT cron.schedule('daily-reset', '*/5 * * * *', 'SELECT reset_daily_tasks()');

-- To view scheduled jobs:
-- SELECT * FROM cron.job;

-- To unschedule:
-- SELECT cron.unschedule('daily-reset');
