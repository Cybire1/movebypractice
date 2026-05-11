-- Move By Practice Database Schema
-- Run this in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (extends Supabase auth.users)
CREATE TABLE public.users (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT,
  wallet_address TEXT UNIQUE,
  username TEXT UNIQUE,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User Statistics
CREATE TABLE public.user_stats (
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
CREATE TABLE public.user_progress (
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
CREATE TABLE public.achievements (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  achievement_id TEXT NOT NULL,
  unlocked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, achievement_id)
);

-- Analytics Events
CREATE TABLE public.analytics_events (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  event_type TEXT NOT NULL,
  metadata JSONB,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Classes (for livestreaming feature)
CREATE TABLE public.classes (
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

-- Class Bookings
CREATE TABLE public.class_bookings (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  class_id UUID REFERENCES public.classes(id) ON DELETE CASCADE NOT NULL,
  status TEXT DEFAULT 'booked' CHECK (status IN ('booked', 'attended', 'cancelled')),
  booked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, class_id)
);

-- Create indexes for better query performance
CREATE INDEX idx_user_progress_user_id ON public.user_progress(user_id);
CREATE INDEX idx_user_progress_lesson_id ON public.user_progress(lesson_id);
CREATE INDEX idx_achievements_user_id ON public.achievements(user_id);
CREATE INDEX idx_analytics_events_user_id ON public.analytics_events(user_id);
CREATE INDEX idx_analytics_events_event_type ON public.analytics_events(event_type);
CREATE INDEX idx_analytics_events_timestamp ON public.analytics_events(timestamp);
CREATE INDEX idx_classes_instructor_id ON public.classes(instructor_id);
CREATE INDEX idx_classes_scheduled_at ON public.classes(scheduled_at);
CREATE INDEX idx_class_bookings_user_id ON public.class_bookings(user_id);
CREATE INDEX idx_class_bookings_class_id ON public.class_bookings(class_id);

-- Row Level Security (RLS) Policies

-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.class_bookings ENABLE ROW LEVEL SECURITY;

-- Users: Can view own profile, update own profile
CREATE POLICY "Users can view own profile" ON public.users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.users
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.users
  FOR INSERT WITH CHECK (auth.uid() = id);

-- User Stats: Can view and update own stats
CREATE POLICY "Users can view own stats" ON public.user_stats
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own stats" ON public.user_stats
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own stats" ON public.user_stats
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- User Progress: Can view and update own progress
CREATE POLICY "Users can view own progress" ON public.user_progress
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own progress" ON public.user_progress
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own progress" ON public.user_progress
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Achievements: Can view own achievements
CREATE POLICY "Users can view own achievements" ON public.achievements
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own achievements" ON public.achievements
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Analytics: Can insert own events, view own events
CREATE POLICY "Users can insert own events" ON public.analytics_events
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own events" ON public.analytics_events
  FOR SELECT USING (auth.uid() = user_id);

-- Classes: Everyone can view, instructors can manage their own
CREATE POLICY "Anyone can view classes" ON public.classes
  FOR SELECT USING (true);

CREATE POLICY "Instructors can insert classes" ON public.classes
  FOR INSERT WITH CHECK (auth.uid() = instructor_id);

CREATE POLICY "Instructors can update own classes" ON public.classes
  FOR UPDATE USING (auth.uid() = instructor_id);

-- Bookings: Users can view and manage own bookings
CREATE POLICY "Users can view own bookings" ON public.class_bookings
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create bookings" ON public.class_bookings
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own bookings" ON public.class_bookings
  FOR UPDATE USING (auth.uid() = user_id);

-- Functions

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
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_stats_updated_at BEFORE UPDATE ON public.user_stats
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_progress_updated_at BEFORE UPDATE ON public.user_progress
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_classes_updated_at BEFORE UPDATE ON public.classes
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_class_bookings_updated_at BEFORE UPDATE ON public.class_bookings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Grant permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
