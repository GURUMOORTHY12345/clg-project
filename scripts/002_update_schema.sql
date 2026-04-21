-- Update skill_analyses table to match the new schema
ALTER TABLE public.skill_analyses 
ADD COLUMN IF NOT EXISTS resume_text TEXT,
ADD COLUMN IF NOT EXISTS analysis_result JSONB,
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Update mock_interviews table to match the new schema
ALTER TABLE public.mock_interviews 
ADD COLUMN IF NOT EXISTS analysis_id UUID REFERENCES public.skill_analyses(id),
ADD COLUMN IF NOT EXISTS target_role TEXT,
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'in_progress',
ADD COLUMN IF NOT EXISTS score INTEGER,
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Rename columns if they exist with different names
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'mock_interviews' AND column_name = 'role' AND table_schema = 'public') THEN
    ALTER TABLE public.mock_interviews RENAME COLUMN role TO target_role_old;
  END IF;
END $$;
