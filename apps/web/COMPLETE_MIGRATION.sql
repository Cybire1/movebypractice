-- ============================================================================
-- MOVE BY PRACTICE - COMPLETE DATABASE SETUP
-- ============================================================================
-- This file combines the base schema + Phase 3 LiveKit tables
-- Run this ONCE in Supabase SQL Editor: https://supabase.com/dashboard/project/ygdhvrquxbxbyxsnytbk/sql
-- ============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- USERS & AUTHENTICATION
-- ============================================================================

-- Users table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.users (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT,
  wallet_address TEXT UNIQUE,
  username TEXT UNIQUE,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User Statistics
CREATE TABLE IF NOT EXISTS public.user_stats (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  xp INTEGER DEFAULT 0,
  level INTEGER DEFAULT 1,
  streak INTEGER DEFAULT 0,
  last_active_date DATE,
  total_lessons_completed INTEGER DEFAULT 0,
  total_time_spent_minutes INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- User Progress per Lesson
CREATE TABLE IF NOT EXISTS public.user_progress (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  lesson_id TEXT NOT NULL,
  completed BOOLEAN DEFAULT FALSE,
  time_spent_minutes INTEGER DEFAULT 0,
  attempts INTEGER DEFAULT 0,
  code_submitted TEXT,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, lesson_id)
);

-- Achievements
CREATE TABLE IF NOT EXISTS public.achievements (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  achievement_id TEXT NOT NULL,
  unlocked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, achievement_id)
);

-- Analytics Events
CREATE TABLE IF NOT EXISTS public.analytics_events (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  event_type TEXT NOT NULL,
  metadata JSONB,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- CLASSES & LIVE STREAMING (PHASE 3)
-- ============================================================================

-- Classes (for livestreaming feature)
CREATE TABLE IF NOT EXISTS public.classes (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  instructor_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  scheduled_at TIMESTAMP WITH TIME ZONE NOT NULL,
  duration_minutes INTEGER DEFAULT 60,
  max_students INTEGER DEFAULT 50,
  price DECIMAL(10, 2) DEFAULT 0.00,
  status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'live', 'completed', 'cancelled')),
  room_url TEXT,
  recording_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add LiveKit-specific fields to classes table
ALTER TABLE public.classes
ADD COLUMN IF NOT EXISTS livekit_room_name TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS livekit_metadata JSONB,
ADD COLUMN IF NOT EXISTS chat_enabled BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS qa_enabled BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS donations_enabled BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS participant_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS started_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS ended_at TIMESTAMP WITH TIME ZONE;

-- Class Bookings
CREATE TABLE IF NOT EXISTS public.class_bookings (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  class_id UUID REFERENCES public.classes(id) ON DELETE CASCADE NOT NULL,
  status TEXT DEFAULT 'booked' CHECK (status IN ('booked', 'attended', 'cancelled')),
  booked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, class_id)
);

-- Class Messages (Q&A and Chat)
CREATE TABLE IF NOT EXISTS public.class_messages (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  class_id UUID REFERENCES public.classes(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  message_type TEXT NOT NULL CHECK (message_type IN ('chat', 'question', 'answer')),
  content TEXT NOT NULL,
  parent_id UUID REFERENCES public.class_messages(id) ON DELETE CASCADE,
  is_instructor_reply BOOLEAN DEFAULT false,
  upvotes INTEGER DEFAULT 0,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Class Donations (Sui blockchain)
CREATE TABLE IF NOT EXISTS public.class_donations (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  class_id UUID REFERENCES public.classes(id) ON DELETE CASCADE NOT NULL,
  donor_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  donor_wallet_address TEXT NOT NULL,
  recipient_wallet_address TEXT NOT NULL,
  amount_sui DECIMAL(20, 9) NOT NULL,
  transaction_digest TEXT UNIQUE NOT NULL,
  message TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'failed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  confirmed_at TIMESTAMP WITH TIME ZONE
);

-- ============================================================================
-- INDEXES
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_user_progress_user_id ON public.user_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_user_progress_lesson_id ON public.user_progress(lesson_id);
CREATE INDEX IF NOT EXISTS idx_achievements_user_id ON public.achievements(user_id);
CREATE INDEX IF NOT EXISTS idx_analytics_events_user_id ON public.analytics_events(user_id);
CREATE INDEX IF NOT EXISTS idx_analytics_events_event_type ON public.analytics_events(event_type);
CREATE INDEX IF NOT EXISTS idx_analytics_events_timestamp ON public.analytics_events(timestamp);
CREATE INDEX IF NOT EXISTS idx_classes_instructor_id ON public.classes(instructor_id);
CREATE INDEX IF NOT EXISTS idx_classes_scheduled_at ON public.classes(scheduled_at);
CREATE INDEX IF NOT EXISTS idx_class_bookings_user_id ON public.class_bookings(user_id);
CREATE INDEX IF NOT EXISTS idx_class_bookings_class_id ON public.class_bookings(class_id);
CREATE INDEX IF NOT EXISTS idx_classes_livekit_room_name ON public.classes(livekit_room_name);
CREATE INDEX IF NOT EXISTS idx_classes_status ON public.classes(status);
CREATE INDEX IF NOT EXISTS idx_class_messages_class_id ON public.class_messages(class_id);
CREATE INDEX IF NOT EXISTS idx_class_messages_user_id ON public.class_messages(user_id);
CREATE INDEX IF NOT EXISTS idx_class_messages_parent_id ON public.class_messages(parent_id);
CREATE INDEX IF NOT EXISTS idx_class_messages_type ON public.class_messages(message_type);
CREATE INDEX IF NOT EXISTS idx_class_donations_class_id ON public.class_donations(class_id);
CREATE INDEX IF NOT EXISTS idx_class_donations_donor_id ON public.class_donations(donor_id);
CREATE INDEX IF NOT EXISTS idx_class_donations_transaction ON public.class_donations(transaction_digest);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.class_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.class_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.class_donations ENABLE ROW LEVEL SECURITY;

-- Users: Can view own profile, update own profile
DROP POLICY IF EXISTS "Users can view own profile" ON public.users;
CREATE POLICY "Users can view own profile" ON public.users
  FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
CREATE POLICY "Users can update own profile" ON public.users
  FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert own profile" ON public.users;
CREATE POLICY "Users can insert own profile" ON public.users
  FOR INSERT WITH CHECK (auth.uid() = id);

-- User Stats: Can view and update own stats
DROP POLICY IF EXISTS "Users can view own stats" ON public.user_stats;
CREATE POLICY "Users can view own stats" ON public.user_stats
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own stats" ON public.user_stats;
CREATE POLICY "Users can update own stats" ON public.user_stats
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own stats" ON public.user_stats;
CREATE POLICY "Users can insert own stats" ON public.user_stats
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- User Progress: Can view and update own progress
DROP POLICY IF EXISTS "Users can view own progress" ON public.user_progress;
CREATE POLICY "Users can view own progress" ON public.user_progress
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own progress" ON public.user_progress;
CREATE POLICY "Users can update own progress" ON public.user_progress
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own progress" ON public.user_progress;
CREATE POLICY "Users can insert own progress" ON public.user_progress
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Achievements: Can view own achievements
DROP POLICY IF EXISTS "Users can view own achievements" ON public.achievements;
CREATE POLICY "Users can view own achievements" ON public.achievements
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own achievements" ON public.achievements;
CREATE POLICY "Users can insert own achievements" ON public.achievements
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Analytics: Can insert own events, view own events
DROP POLICY IF EXISTS "Users can insert own events" ON public.analytics_events;
CREATE POLICY "Users can insert own events" ON public.analytics_events
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view own events" ON public.analytics_events;
CREATE POLICY "Users can view own events" ON public.analytics_events
  FOR SELECT USING (auth.uid() = user_id);

-- Classes: Everyone can view, instructors can manage their own
DROP POLICY IF EXISTS "Anyone can view classes" ON public.classes;
CREATE POLICY "Anyone can view classes" ON public.classes
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Instructors can insert classes" ON public.classes;
CREATE POLICY "Instructors can insert classes" ON public.classes
  FOR INSERT WITH CHECK (auth.uid() = instructor_id);

DROP POLICY IF EXISTS "Instructors can update own classes" ON public.classes;
CREATE POLICY "Instructors can update own classes" ON public.classes
  FOR UPDATE USING (auth.uid() = instructor_id);

-- Bookings: Users can view and manage own bookings
DROP POLICY IF EXISTS "Users can view own bookings" ON public.class_bookings;
CREATE POLICY "Users can view own bookings" ON public.class_bookings
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create bookings" ON public.class_bookings;
CREATE POLICY "Users can create bookings" ON public.class_bookings
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own bookings" ON public.class_bookings;
CREATE POLICY "Users can update own bookings" ON public.class_bookings
  FOR UPDATE USING (auth.uid() = user_id);

-- Class Messages: Anyone can view, authenticated users can insert
DROP POLICY IF EXISTS "Anyone can view class messages" ON public.class_messages;
CREATE POLICY "Anyone can view class messages" ON public.class_messages
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Authenticated users can insert messages" ON public.class_messages;
CREATE POLICY "Authenticated users can insert messages" ON public.class_messages
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own messages" ON public.class_messages;
CREATE POLICY "Users can update own messages" ON public.class_messages
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own messages" ON public.class_messages;
CREATE POLICY "Users can delete own messages" ON public.class_messages
  FOR DELETE USING (auth.uid() = user_id);

-- Class Donations: Anyone can view, authenticated users can create
DROP POLICY IF EXISTS "Anyone can view donations" ON public.class_donations;
CREATE POLICY "Anyone can view donations" ON public.class_donations
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Authenticated users can create donations" ON public.class_donations;
CREATE POLICY "Authenticated users can create donations" ON public.class_donations
  FOR INSERT WITH CHECK (auth.uid() = donor_id);

-- ============================================================================
-- FUNCTIONS & TRIGGERS
-- ============================================================================

-- Function to automatically create user_stats when user is created
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_stats (user_id, xp, level, streak)
  VALUES (NEW.id, 0, 1, 0);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create user_stats on user creation
DROP TRIGGER IF EXISTS on_auth_user_created ON public.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON public.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
DROP TRIGGER IF EXISTS update_users_updated_at ON public.users;
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_user_stats_updated_at ON public.user_stats;
CREATE TRIGGER update_user_stats_updated_at BEFORE UPDATE ON public.user_stats
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_user_progress_updated_at ON public.user_progress;
CREATE TRIGGER update_user_progress_updated_at BEFORE UPDATE ON public.user_progress
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_classes_updated_at ON public.classes;
CREATE TRIGGER update_classes_updated_at BEFORE UPDATE ON public.classes
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_class_bookings_updated_at ON public.class_bookings;
CREATE TRIGGER update_class_bookings_updated_at BEFORE UPDATE ON public.class_bookings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_class_messages_updated_at ON public.class_messages;
CREATE TRIGGER update_class_messages_updated_at
  BEFORE UPDATE ON public.class_messages
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================================================
-- PERMISSIONS
-- ============================================================================

GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON public.class_messages TO anon, authenticated;
GRANT ALL ON public.class_donations TO anon, authenticated;

-- ============================================================================
-- SETUP COMPLETE!
-- ============================================================================
-- Next steps:
-- 1. Enable Realtime for class_messages table in Supabase Dashboard
-- 2. Go to Database → Replication
-- 3. Enable realtime for 'class_messages' table
-- Or run: ALTER PUBLICATION supabase_realtime ADD TABLE class_messages;
-- ============================================================================
