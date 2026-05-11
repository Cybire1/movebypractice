-- Enable Realtime for class_messages table
-- Run this in Supabase SQL Editor to enable real-time chat and Q&A

ALTER PUBLICATION supabase_realtime ADD TABLE class_messages;

-- Verify realtime is enabled
SELECT schemaname, tablename
FROM pg_publication_tables
WHERE pubname = 'supabase_realtime';
