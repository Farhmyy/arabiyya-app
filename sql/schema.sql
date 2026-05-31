-- ============================================================
-- Arabiyya App — Supabase Schema
-- Run this once in the Supabase SQL Editor
-- ============================================================

-- Users table
CREATE TABLE IF NOT EXISTS public.users (
  id          UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email       TEXT NOT NULL,
  nickname    TEXT NOT NULL,
  role        TEXT NOT NULL DEFAULT 'student',
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  last_active_date DATE DEFAULT CURRENT_DATE,
  progress    JSONB DEFAULT '{}'::jsonb
);

-- Content table (id = 'mufrodat' | 'tadribat1' | 'tadribat2')
CREATE TABLE IF NOT EXISTS public.content (
  id         TEXT PRIMARY KEY,
  data       JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Admins table
CREATE TABLE IF NOT EXISTS public.admins (
  email TEXT PRIMARY KEY
);

-- Storage bucket for mufrodat images (run in Supabase dashboard or via API)
-- INSERT INTO storage.buckets (id, name, public) VALUES ('mufrodat', 'mufrodat', true);

-- ── Row Level Security ──────────────────────────────────────

ALTER TABLE public.users   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admins  ENABLE ROW LEVEL SECURITY;

-- Users: own row read/write
CREATE POLICY "users_own_select" ON public.users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "users_own_insert" ON public.users FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "users_own_update" ON public.users FOR UPDATE USING (auth.uid() = id);

-- Admins can read all users
CREATE POLICY "admins_read_all_users" ON public.users FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.admins WHERE email = (auth.jwt()->>'email'))
);

-- Content: anyone can read, only admins can write
CREATE POLICY "content_public_read" ON public.content FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "content_admin_write" ON public.content FOR ALL USING (
  EXISTS (SELECT 1 FROM public.admins WHERE email = (auth.jwt()->>'email'))
);

-- Admins table: authenticated users can check membership
CREATE POLICY "admins_auth_read" ON public.admins FOR SELECT TO authenticated USING (true);
