-- Migration: Add LiveKit tables and fields for Phase 3
-- Run this after the initial schema.sql

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

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_classes_livekit_room_name ON public.classes(livekit_room_name);
CREATE INDEX IF NOT EXISTS idx_classes_status ON public.classes(status);
CREATE INDEX IF NOT EXISTS idx_class_messages_class_id ON public.class_messages(class_id);
CREATE INDEX IF NOT EXISTS idx_class_messages_user_id ON public.class_messages(user_id);
CREATE INDEX IF NOT EXISTS idx_class_messages_parent_id ON public.class_messages(parent_id);
CREATE INDEX IF NOT EXISTS idx_class_messages_type ON public.class_messages(message_type);
CREATE INDEX IF NOT EXISTS idx_class_donations_class_id ON public.class_donations(class_id);
CREATE INDEX IF NOT EXISTS idx_class_donations_donor_id ON public.class_donations(donor_id);
CREATE INDEX IF NOT EXISTS idx_class_donations_transaction ON public.class_donations(transaction_digest);

-- Enable RLS on new tables
ALTER TABLE public.class_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.class_donations ENABLE ROW LEVEL SECURITY;

-- RLS Policies for class_messages
CREATE POLICY "Anyone can view class messages" ON public.class_messages
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can insert messages" ON public.class_messages
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own messages" ON public.class_messages
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own messages" ON public.class_messages
  FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for class_donations
CREATE POLICY "Anyone can view donations" ON public.class_donations
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create donations" ON public.class_donations
  FOR INSERT WITH CHECK (auth.uid() = donor_id);

-- Triggers for updated_at
CREATE TRIGGER update_class_messages_updated_at
  BEFORE UPDATE ON public.class_messages
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Grant permissions
GRANT ALL ON public.class_messages TO anon, authenticated;
GRANT ALL ON public.class_donations TO anon, authenticated;
