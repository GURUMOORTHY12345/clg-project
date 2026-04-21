-- Create profiles table linked to auth.users
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  education TEXT,
  target_role TEXT,
  experience_level TEXT DEFAULT 'fresher',
  skills TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "profiles_select_own" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "profiles_insert_own" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "profiles_update_own" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "profiles_delete_own" ON public.profiles FOR DELETE USING (auth.uid() = id);

-- Create skill_analyses table to store analysis results
CREATE TABLE IF NOT EXISTS public.skill_analyses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  target_role TEXT NOT NULL,
  current_skills TEXT[] NOT NULL,
  missing_skills TEXT[],
  recommendations TEXT[],
  readiness_score INTEGER DEFAULT 0,
  roadmap JSONB,
  market_trends JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.skill_analyses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "analyses_select_own" ON public.skill_analyses FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "analyses_insert_own" ON public.skill_analyses FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "analyses_update_own" ON public.skill_analyses FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "analyses_delete_own" ON public.skill_analyses FOR DELETE USING (auth.uid() = user_id);

-- Create mock_interviews table
CREATE TABLE IF NOT EXISTS public.mock_interviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL,
  questions JSONB NOT NULL,
  answers JSONB,
  feedback JSONB,
  overall_score INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

ALTER TABLE public.mock_interviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "interviews_select_own" ON public.mock_interviews FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "interviews_insert_own" ON public.mock_interviews FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "interviews_update_own" ON public.mock_interviews FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "interviews_delete_own" ON public.mock_interviews FOR DELETE USING (auth.uid() = user_id);

-- Auto-create profile on signup trigger
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', NULL)
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
