-- ═══════════════════════════════════════════════════════════════════════════
-- LifeGPS — Supabase Database Schema
-- Run this in: Supabase Dashboard → SQL Editor → New Query
-- ═══════════════════════════════════════════════════════════════════════════

-- ─── Enable UUID extension ────────────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ─── profiles ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  name TEXT,
  plan TEXT NOT NULL DEFAULT 'free' CHECK (plan IN ('free', 'pro', 'premium', 'admin')),
  stripe_customer_id TEXT UNIQUE,
  stripe_subscription_id TEXT,
  subscription_status TEXT NOT NULL DEFAULT 'inactive',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO public.profiles (id, name, plan, subscription_status)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.email),
    'free',
    'inactive'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ─── domains ──────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.domains (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  vision TEXT,
  description TEXT,
  icon TEXT NOT NULL DEFAULT '🎯',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE public.domains ENABLE ROW LEVEL SECURITY;
CREATE POLICY "domains_own" ON public.domains FOR ALL USING (auth.uid() = user_id);

-- ─── objectives ───────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.objectives (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT DEFAULT '',
  domain TEXT NOT NULL,
  priority TEXT NOT NULL DEFAULT 'moyenne' CHECK (priority IN ('haute', 'moyenne', 'basse')),
  target_date TEXT,
  success_indicator TEXT,
  motivation TEXT,
  status TEXT NOT NULL DEFAULT 'actif' CHECK (status IN ('actif', 'terminé', 'en-pause')),
  progress INTEGER NOT NULL DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE public.objectives ENABLE ROW LEVEL SECURITY;
CREATE POLICY "objectives_own" ON public.objectives FOR ALL USING (auth.uid() = user_id);

-- ─── action_plans ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.action_plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  objective_id UUID REFERENCES public.objectives(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT DEFAULT '',
  status TEXT NOT NULL DEFAULT 'à faire' CHECK (status IN ('à faire', 'en cours', 'terminé')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE public.action_plans ENABLE ROW LEVEL SECURITY;
CREATE POLICY "action_plans_own" ON public.action_plans FOR ALL USING (auth.uid() = user_id);

-- ─── quarterly_plans ──────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.quarterly_plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  objective_id UUID REFERENCES public.objectives(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  quarter TEXT NOT NULL CHECK (quarter IN ('Q1', 'Q2', 'Q3', 'Q4')),
  year INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'planifié' CHECK (status IN ('planifié', 'en cours', 'terminé')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE public.quarterly_plans ENABLE ROW LEVEL SECURITY;
CREATE POLICY "quarterly_plans_own" ON public.quarterly_plans FOR ALL USING (auth.uid() = user_id);

-- ─── systems (habitudes) ──────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.systems (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  objective_id UUID REFERENCES public.objectives(id) ON DELETE SET NULL,
  frequency TEXT NOT NULL DEFAULT 'quotidien',
  normal_duration INTEGER NOT NULL DEFAULT 30,
  min_duration INTEGER NOT NULL DEFAULT 10,
  min_description TEXT,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE public.systems ENABLE ROW LEVEL SECURITY;
CREATE POLICY "systems_own" ON public.systems FOR ALL USING (auth.uid() = user_id);

-- ─── missions ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.missions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  mental_level INTEGER NOT NULL DEFAULT 3 CHECK (mental_level BETWEEN 1 AND 5),
  objective_id UUID REFERENCES public.objectives(id) ON DELETE SET NULL,
  date TEXT NOT NULL,
  completed BOOLEAN NOT NULL DEFAULT FALSE,
  pomodoro_sessions INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE public.missions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "missions_own" ON public.missions FOR ALL USING (auth.uid() = user_id);

-- ─── habit_checks ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.habit_checks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  system_id UUID NOT NULL REFERENCES public.systems(id) ON DELETE CASCADE,
  date TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('done', 'minimum', 'missed')),
  UNIQUE(user_id, system_id, date)
);
ALTER TABLE public.habit_checks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "habit_checks_own" ON public.habit_checks FOR ALL USING (auth.uid() = user_id);

-- ─── weekly_focuses ───────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.weekly_focuses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  week_start TEXT NOT NULL,
  priority TEXT NOT NULL,
  details TEXT,
  week_days TEXT[] NOT NULL DEFAULT ARRAY['LU','MA','ME','JE','VE','SA','DI'],
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE public.weekly_focuses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "weekly_focuses_own" ON public.weekly_focuses FOR ALL USING (auth.uid() = user_id);

-- ─── reviews ──────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('hebdo', 'mensuel')),
  date TEXT NOT NULL,
  period TEXT NOT NULL,
  content JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
CREATE POLICY "reviews_own" ON public.reviews FOR ALL USING (auth.uid() = user_id);

-- ─── journal_entries ──────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.journal_entries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date TEXT NOT NULL,
  title TEXT NOT NULL,
  tag TEXT NOT NULL CHECK (tag IN ('leçon', 'idée', 'réflexion')),
  content TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE public.journal_entries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "journal_entries_own" ON public.journal_entries FOR ALL USING (auth.uid() = user_id);

-- ─── pomodoro_sessions ────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.pomodoro_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  mission_id UUID REFERENCES public.missions(id) ON DELETE SET NULL,
  duration INTEGER NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('focus', 'short-break', 'long-break')),
  completed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE public.pomodoro_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "pomodoro_sessions_own" ON public.pomodoro_sessions FOR ALL USING (auth.uid() = user_id);

-- ═══════════════════════════════════════════════════════════════════════════
-- Done! All tables created with Row Level Security enabled.
-- Each user can only see and modify their own data.
-- ═══════════════════════════════════════════════════════════════════════════
