# Phase 3: Live Classes - Quick Start Guide

## 🚀 Get Started in 5 Minutes

This guide will help you set up and test the live streaming functionality.

---

## Step 1: Set Up LiveKit Cloud (5 minutes)

### 1.1 Create Account
```
1. Visit: https://cloud.livekit.io
2. Click "Sign Up"
3. Verify your email
4. Create a new project
```

### 1.2 Get API Credentials
```
1. Go to your project dashboard
2. Click "Settings" → "Keys"
3. Copy the following:
   - API Key (starts with "API...")
   - API Secret (long string)
   - WebSocket URL (starts with "wss://")
```

### 1.3 Configure Environment Variables
```bash
# Create .env file from template
cp .env.example .env

# Edit .env and add your LiveKit credentials:
LIVEKIT_API_KEY=APIxxxxxxxxxxxxxxxx
LIVEKIT_API_SECRET=your_secret_key_here
LIVEKIT_URL=wss://your-subdomain.livekit.cloud
NEXT_PUBLIC_LIVEKIT_URL=wss://your-subdomain.livekit.cloud
```

**Important:** Keep your API Secret secure! Never commit it to git.

---

## Step 2: Apply Database Migration (2 minutes)

### 2.1 Open Supabase SQL Editor
```
1. Go to https://supabase.com/dashboard
2. Select your project
3. Click "SQL Editor" in the sidebar
4. Click "New query"
```

### 2.2 Run Migration
```sql
-- Copy and paste the entire contents of:
-- supabase/migrations/001_add_livekit_tables.sql

-- Then click "Run" (or press Cmd/Ctrl + Enter)
```

### 2.3 Verify Tables Created
```sql
-- Run this query to verify:
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN ('class_messages', 'class_donations');

-- You should see 2 rows returned
```

---

## Step 3: Test Live Streaming (10 minutes)

### 3.1 Start Development Server
```bash
npm run dev
```

### 3.2 Create Test Account
```
1. Open http://localhost:3000
2. Click "Sign Up"
3. Create a test account (e.g., instructor@test.com)
4. Verify email if required
```

### 3.3 Schedule a Test Class
```
1. Navigate to http://localhost:3000/classes
2. Click "Schedule a Class"
3. Fill in the form:
   - Title: "Test Live Class"
   - Description: "Testing live streaming"
   - Date: Today
   - Time: 5 minutes from now
   - Duration: 60 minutes
   - Enable all features (Chat, Q&A, Donations)
4. Click "Schedule Class"
```

### 3.4 Test as Instructor
```
1. Go back to /classes
2. Find your scheduled class
3. Click on it to open the teach page
4. Allow browser access to camera and microphone
5. You should see:
   ✅ Your video feed
   ✅ "LIVE" indicator
   ✅ Participant count (1)
   ✅ Chat, Q&A, and Participants tabs
```

### 3.5 Test as Student (New Browser/Incognito)
```
1. Open a new incognito/private window
2. Go to http://localhost:3000
3. Sign up with a different email (student@test.com)
4. Navigate to /classes
5. Find the LIVE class (red LIVE badge)
6. Click "Join Class"
7. You should see:
   ✅ Instructor's video feed
   ✅ Your own video (if invited to speak)
   ✅ Chat messages in real-time
   ✅ "Raise Hand" button
```

### 3.6 Test Features

**In Student Window:**
```
1. Send a chat message → Should appear in instructor window
2. Click "Raise Hand" → Should show hand icon in participants list
3. Ask a question in Q&A → Should appear in instructor's Q&A panel
```

**In Instructor Window:**
```
1. See the raised hand in Participants tab
2. Click "Invite to Speak" for the student
3. Student should now be able to publish video/audio
4. Answer the question in Q&A panel
5. Send a chat message
6. Click "End Class" when done
```

---

## Step 4: Verify Everything Works ✅

### Checklist:
- [ ] Instructor can start a class
- [ ] Student can join a live class
- [ ] Video/audio streams work both ways
- [ ] Chat messages appear in real-time
- [ ] Q&A questions can be asked and answered
- [ ] Hand raise works and instructor can invite to speak
- [ ] Participant list shows all users
- [ ] Instructor can end the class
- [ ] Class status updates to "completed" in database

---

## Troubleshooting

### ❌ "Failed to join class" Error
**Solution:**
```bash
# Check environment variables
cat .env | grep LIVEKIT

# Make sure all 4 variables are set:
# - LIVEKIT_API_KEY
# - LIVEKIT_API_SECRET
# - LIVEKIT_URL
# - NEXT_PUBLIC_LIVEKIT_URL

# Restart dev server after changing .env
npm run dev
```

### ❌ "Class room not created" Error
**Solution:**
```sql
-- Check if migration was applied:
SELECT * FROM classes WHERE livekit_room_name IS NOT NULL;

-- If column doesn't exist, re-run migration from Step 2
```

### ❌ Camera/Microphone Not Working
**Solution:**
```
1. Check browser permissions (usually a camera icon in address bar)
2. Click the icon and allow access
3. Refresh the page
4. For Firefox: about:preferences#privacy → Permissions → Camera/Microphone
5. For Chrome: chrome://settings/content → Camera/Microphone
```

### ❌ Video Not Showing
**Solution:**
```
1. Open browser console (F12)
2. Look for errors
3. Common issues:
   - HTTPS required (use localhost, not 127.0.0.1)
   - WebRTC blocked by firewall
   - Browser doesn't support WebRTC (use Chrome/Firefox/Safari)
```

### ❌ Chat/Q&A Not Working
**Solution:**
```sql
-- Verify Supabase realtime is enabled:
-- Go to Supabase Dashboard → Database → Replication
-- Make sure 'class_messages' table has realtime enabled

-- Or run this SQL:
ALTER PUBLICATION supabase_realtime ADD TABLE class_messages;
```

---

## Advanced Testing

### Test with Multiple Students
```
1. Open 3-4 browser windows (use different browsers or incognito)
2. Create different student accounts
3. Join the same class from all windows
4. Test concurrent:
   - Video streaming
   - Chat messages
   - Q&A questions
   - Hand raising
```

### Test Performance
```
1. Monitor network usage in browser DevTools
2. Check CPU/memory usage
3. Verify video quality adjusts based on bandwidth
4. Test with poor network conditions (Chrome DevTools → Network → Throttling)
```

### Test Mobile Responsiveness
```
1. Open in mobile browser (or use Chrome DevTools device mode)
2. Test all features work on mobile
3. Check video grid layout adapts
4. Verify touch interactions work
```

---

## Next Steps After Testing

### 1. Customize the UI
- Update colors in components to match your brand
- Add your logo to class pages
- Customize class card designs
- Add more instructor controls

### 2. Add Blockchain Donations
```typescript
// TODO: Implement DonationModal component
// - Integrate @mysten/dapp-kit
// - Allow SUI token transfers
// - Store in class_donations table
// - Show donation feed during class
```

### 3. Enable Recording
```typescript
// TODO: Configure LiveKit cloud recording
// - Enable in LiveKit dashboard
// - Store recording URLs in database
// - Add recording playback page
// - Create recordings gallery
```

### 4. Production Deployment
```bash
# 1. Set up production LiveKit project
# 2. Update environment variables in Vercel/hosting
# 3. Apply migration to production Supabase
# 4. Test on production domain
# 5. Monitor with LiveKit dashboard
```

---

## Support & Resources

### LiveKit Documentation
- [Getting Started](https://docs.livekit.io/realtime/quickstarts/nextjs/)
- [React Components](https://docs.livekit.io/reference/components/react/)
- [Server SDK](https://docs.livekit.io/reference/server/server-sdk-js/)

### Common Questions

**Q: How many participants can join a class?**
A: Currently set to 100 max. You can change this in the LiveKit controller.

**Q: What's the video quality?**
A: LiveKit automatically adjusts based on bandwidth. Default is up to 1080p.

**Q: Is there a free tier?**
A: Yes! LiveKit Cloud has a free tier with 10,000 participant minutes/month.

**Q: Can I record classes?**
A: Yes! Enable cloud recording in LiveKit dashboard (requires egress add-on).

**Q: How do I add more features?**
A: Check `PHASE_3_IMPLEMENTATION.md` for the full architecture and extend components.

---

## Success Criteria ✅

You've successfully completed Phase 3 setup when:
- ✅ Instructor can start and end classes
- ✅ Students can join live classes
- ✅ Real-time video/audio works
- ✅ Chat messages sync instantly
- ✅ Q&A panel works with upvoting
- ✅ Hand raise and invite-to-speak function properly
- ✅ All features work on mobile browsers
- ✅ Multiple students can join simultaneously

---

**Ready to go live?** 🎉

Start scheduling real classes and invite your community to learn Move programming together!

For detailed implementation info, see `PHASE_3_IMPLEMENTATION.md`.
