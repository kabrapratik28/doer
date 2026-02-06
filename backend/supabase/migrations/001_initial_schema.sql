-- DOER Backend Schema - Initial Tables
-- Migration: 001_initial_schema.sql

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Profiles table (extends auth.users)
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  streak_count INTEGER DEFAULT 0 NOT NULL,
  streak_last_date DATE,
  reset_time TIME DEFAULT '04:00:00' NOT NULL,
  haptics_enabled BOOLEAN DEFAULT true NOT NULL,
  timezone TEXT DEFAULT 'UTC' NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Tasks table
CREATE TABLE public.tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  text TEXT NOT NULL CHECK (char_length(text) BETWEEN 1 AND 500),
  status TEXT NOT NULL DEFAULT 'idea' CHECK (status IN ('idea', 'active', 'done')),
  priority INTEGER CHECK (priority BETWEEN 1 AND 3),
  is_from_yesterday BOOLEAN DEFAULT false NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  completed_at TIMESTAMPTZ
);

-- Indexes for performance
CREATE INDEX idx_tasks_user_status ON public.tasks(user_id, status);
CREATE INDEX idx_tasks_user_priority ON public.tasks(user_id, priority) WHERE status = 'active';
CREATE INDEX idx_profiles_streak ON public.profiles(streak_last_date);

-- Updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at triggers
CREATE TRIGGER tasks_updated_at
  BEFORE UPDATE ON public.tasks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Add comments for documentation
COMMENT ON TABLE public.profiles IS 'User profiles with streak and settings data';
COMMENT ON TABLE public.tasks IS 'User tasks with status lifecycle: idea -> active -> done';
COMMENT ON COLUMN public.tasks.priority IS '1 = Prime Task (The Big One), 2-3 = Secondary tasks';
COMMENT ON COLUMN public.tasks.is_from_yesterday IS 'True if task was carried over from daily reset';
