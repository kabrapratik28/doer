-- DOER Backend Schema - Helper Functions
-- Migration: 005_helper_functions.sql

-- Function to get active task count for a user
CREATE OR REPLACE FUNCTION get_active_task_count(p_user_id UUID)
RETURNS INTEGER AS $$
DECLARE
  task_count INTEGER;
BEGIN
  SELECT COUNT(*)
  INTO task_count
  FROM public.tasks
  WHERE user_id = p_user_id
    AND status = 'active';
  RETURN task_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get next available priority
CREATE OR REPLACE FUNCTION get_next_priority(p_user_id UUID)
RETURNS INTEGER AS $$
DECLARE
  used_priorities INTEGER[];
  next_priority INTEGER;
BEGIN
  SELECT ARRAY_AGG(priority)
  INTO used_priorities
  FROM public.tasks
  WHERE user_id = p_user_id
    AND status = 'active'
    AND priority IS NOT NULL;

  -- Find first available priority 1, 2, or 3
  FOR next_priority IN 1..3 LOOP
    IF used_priorities IS NULL OR NOT (next_priority = ANY(used_priorities)) THEN
      RETURN next_priority;
    END IF;
  END LOOP;

  RETURN NULL; -- All priorities used
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to auto-capitalize first letter and trim whitespace
CREATE OR REPLACE FUNCTION format_task_text()
RETURNS TRIGGER AS $$
BEGIN
  -- Trim whitespace
  NEW.text = TRIM(NEW.text);

  -- Auto-capitalize first letter
  IF LENGTH(NEW.text) > 0 THEN
    NEW.text = UPPER(LEFT(NEW.text, 1)) || SUBSTRING(NEW.text FROM 2);
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply text formatting trigger
CREATE TRIGGER format_task_text_trigger
  BEFORE INSERT OR UPDATE OF text ON public.tasks
  FOR EACH ROW EXECUTE FUNCTION format_task_text();
