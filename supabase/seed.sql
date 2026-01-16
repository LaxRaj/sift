-- Sift Database Schema

-- Profiles table linked to auth.users
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nylas_grant_id TEXT,
  timezone TEXT DEFAULT 'UTC',
  summary_time TIME DEFAULT '08:00',
  is_paid BOOLEAN DEFAULT FALSE
);

-- Summaries table for AI outputs
CREATE TABLE IF NOT EXISTS public.summaries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  content JSONB NOT NULL,
  heat_vibe TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for common access patterns
CREATE INDEX IF NOT EXISTS idx_profiles_nylas_grant_id
  ON public.profiles (nylas_grant_id);
CREATE INDEX IF NOT EXISTS idx_summaries_user_id
  ON public.summaries (user_id);
CREATE INDEX IF NOT EXISTS idx_summaries_created_at
  ON public.summaries (created_at DESC);

-- Trigger to auto-create profile on new auth user
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, timezone, summary_time, is_paid)
  VALUES (NEW.id, 'UTC', '08:00', FALSE);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Enable Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.summaries ENABLE ROW LEVEL SECURITY;

-- RLS Policies: authenticated users can only select/update their own data
DROP POLICY IF EXISTS "Profiles: select own" ON public.profiles;
CREATE POLICY "Profiles: select own"
  ON public.profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Profiles: update own" ON public.profiles;
CREATE POLICY "Profiles: update own"
  ON public.profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Summaries: select own" ON public.summaries;
CREATE POLICY "Summaries: select own"
  ON public.summaries
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Summaries: update own" ON public.summaries;
CREATE POLICY "Summaries: update own"
  ON public.summaries
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
