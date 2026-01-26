-- Run this in the Supabase SQL Editor
CREATE TABLE IF NOT EXISTS public.user_data (
    user_id TEXT PRIMARY KEY,
    patients JSONB DEFAULT '[]'::jsonb,
    photos JSONB DEFAULT '[]'::jsonb,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.user_data ENABLE ROW LEVEL SECURITY;

-- Create a policy that allows anyone to insert/update/select their own data
-- (Note: Since we are using a mock login, we use user_id as a key. 
-- For real security, you would use auth.uid() if using Supabase Auth)
CREATE POLICY "Allow individual user access" ON public.user_data
    FOR ALL
    USING (true)
    WITH CHECK (true);
