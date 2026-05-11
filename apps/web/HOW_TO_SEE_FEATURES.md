# How to See All Features 🎯

## IMPORTANT: Server is Running on Port 3001

Your dev server is on **http://localhost:3001** (NOT 3000, which is used by another project).

---

## Step 1: Restart Dev Server (REQUIRED)

The `.env.local` file was just updated with the Gemini API key. You MUST restart the server:

```bash
# Kill current server
kill 4853

# OR press Ctrl+C in the terminal where server is running

# Then restart
npm run dev
```

**The server will start on port 3001 again** (since 3000 is occupied).

---

## Step 2: How to See the **AI Assistant Button** ✨

### What It Looks Like:
A colorful button with a sparkle emoji (✨) saying **"Ask AI"**

### Where to Find It:
1. Open browser: **http://localhost:3001**
2. Click **"Lessons"** in the navbar
3. Click on any lesson (e.g., "Introduction to Move")
4. Click **"Start Lesson"**
5. **Look at the TOP-RIGHT corner** of each teaching slide
6. You'll see: `✨ Ask AI` button

### Visual Guide:
```
┌──────────────────────────────────────────────┐
│  [Progress Bar] ━━━━━━━━━━━━━━━━━━━━━━━━━━  │
├──────────────────────────────────────────────┤
│                                 ┌──────────┐ │
│   📦 Slide Title               │ ✨ Ask AI│ │← HERE!
│                                 └──────────┘ │
│   Slide content goes here...                 │
│                                              │
│   [← Previous]  [Continue →]                │
└──────────────────────────────────────────────┘
```

### What It Does:
1. Click **"Ask AI"** → Modal opens
2. Click **"Start Voice Chat"** → Browser asks for microphone permission
3. **Speak your question** → AI responds with voice
4. Ask follow-up questions interactively
5. Click **"End Voice Chat"** when done

---

## Step 3: How to See **Live Classes** Feature 🎥

### Where to Find It:
1. Open browser: **http://localhost:3001**
2. Look at the **navbar** at the top
3. Click **"Live Classes"** (4th item in the menu)
4. You'll see the classes page

### Visual Guide:
```
Navbar:
┌──────────────────────────────────────────────────────┐
│  Move By Practice  |  Daily Challenge  |  Lessons  |  │
│  Exercises  |  Live Classes  ← HERE!                 │
└──────────────────────────────────────────────────────┘
```

### What You'll See:
- **"Live Now"** section (if any classes are streaming)
- **"Upcoming Classes"** section
- **"Schedule a Class"** button (top right)

### How to Use:

**As an Instructor:**
1. Click **"Schedule a Class"**
2. Fill in:
   - Class title
   - Description
   - Date and time
   - Duration
   - Max students
   - Enable chat, Q&A, donations
3. Click **"Schedule Class"**
4. When it's time, click **"Start Class"**
5. Your camera/microphone will activate
6. Students can join and watch

**As a Student:**
1. See live or upcoming classes
2. Click on a class card
3. Click **"Join Class"** or **"Book Class"**
4. Watch the instructor live
5. Use chat, Q&A, raise hand features

---

## Step 4: Quick Test Checklist

### ✅ AI Assistant Button:
- [ ] Server running on port 3001
- [ ] Navigated to: `http://localhost:3001/lessons`
- [ ] Clicked on a lesson
- [ ] Clicked "Start Lesson"
- [ ] **See "Ask AI" button in top-right corner**
- [ ] Clicked "Ask AI" → Modal opens
- [ ] Clicked "Start Voice Chat"
- [ ] Browser asked for microphone permission
- [ ] Granted permission
- [ ] Spoke a question
- [ ] AI responded with voice

### ✅ Live Classes:
- [ ] Server running on port 3001
- [ ] Navigated to: `http://localhost:3001`
- [ ] **See "Live Classes" in navbar**
- [ ] Clicked "Live Classes"
- [ ] See classes page with schedule button
- [ ] Can click "Schedule a Class"
- [ ] Can fill in class details

---

## Troubleshooting

### "I don't see the Ask AI button"
**Cause:** Server not restarted after `.env.local` update

**Fix:**
```bash
# Kill the server
kill 4853

# Restart
npm run dev

# Wait for it to compile
# Open http://localhost:3001
```

### "I don't see Live Classes in navbar"
**Cause:** Wrong URL or not looking at the right place

**Fix:**
1. Make sure you're on: `http://localhost:3001`
2. Look at the navbar at the very top
3. It's the 4th item: **Live Classes**
4. If still not visible, check `app/components/Navigation.tsx:40`

### "Voice chat doesn't work"
**Cause:** Microphone permission not granted or API key issue

**Fix:**
1. Click browser's address bar lock icon
2. Allow microphone access
3. Refresh page
4. Try again

### "Port 3001 doesn't work"
**Cause:** Server may have switched ports

**Fix:**
```bash
# Check which port is actually in use
lsof -nP -iTCP -sTCP:LISTEN | grep node

# Look for the line with your project
# Use that port number
```

---

## What Each Feature Does

### AI Assistant (Per-Slide Help)
**Purpose:** Help students understand each teaching slide through voice conversation

**Benefits:**
- Immediate answers to questions
- Context-aware (knows what slide you're on)
- Interactive voice conversation
- Available 24/7
- No need to wait for instructor

**Example Questions:**
- "Can you explain this concept in simpler terms?"
- "What does this code example do?"
- "Why is this important?"
- "Can you give me another example?"

### Live Classes (Instructor-Led Sessions)
**Purpose:** Real-time video streaming classes with chat, Q&A, and donations

**Features:**
- **Video/Audio:** Instructor streams live via webcam
- **Chat:** Students send text messages
- **Q&A:** Students ask questions, instructor answers
- **Raise Hand:** Students signal they want to speak
- **Invite to Speak:** Instructor allows students to unmute
- **Donations:** Students can send SUI tokens
- **Recording:** Can be enabled (not active by default)

**Powered by:** LiveKit (WebRTC streaming)

---

## URLs Reference

### Main App:
- **Home:** http://localhost:3001
- **Lessons:** http://localhost:3001/lessons
- **Live Classes:** http://localhost:3001/classes
- **Schedule Class:** http://localhost:3001/classes/schedule
- **Exercises:** http://localhost:3001/exercises
- **Daily Challenge:** http://localhost:3001/daily-challenge

### Specific Lesson (with AI button):
- **Lesson 1:** http://localhost:3001/lessons/1
- **Lesson 2:** http://localhost:3001/lessons/2
- **etc.**

---

## Screenshots Guide

### Where AI Button Appears:
```
Teaching Slide View:
┌────────────────────────────────────────────────────┐
│ Progress: ▓▓▓▓░░░░░░░░░░░░░░░░░░░░░░░              │
├────────────────────────────────────────────────────┤
│                                                     │
│  LEFT SIDE (Narrative)        RIGHT SIDE (Visual)  │
│  ┌──────────────────┐         ┌───────────────┐   │
│  │                  │         │               │   │
│  │  📦 Emoji       │         │  Code Example │   │
│  │                  │         │  or          │   │
│  │  # Title        │         │  Diagram      │   │
│  │                  │         │               │   │
│  │  Content text   │         └───────────────┘   │
│  │  goes here...   │                             │
│  │                  │  ┌──────────┐              │
│  │                  │  │ ✨ Ask AI│← Button here! │
│  │                  │  └──────────┘              │
│  │                  │                             │
│  │ [← Prev] [Next→]│                             │
│  └──────────────────┘                             │
└────────────────────────────────────────────────────┘
```

### Where Live Classes Appears:
```
Navbar:
┌──────────────────────────────────────────────────┐
│  🌊 Move By Practice                              │
│                                                   │
│  [Daily Challenge] [Lessons] [Exercises]         │
│  [Live Classes] ← Click here!                    │
│                                      [Sign In]   │
└──────────────────────────────────────────────────┘
```

---

## Next Steps

1. **Restart Server** (REQUIRED)
2. Open: **http://localhost:3001**
3. Try **AI Assistant**: Go to any lesson → Click "Ask AI"
4. Try **Live Classes**: Click "Live Classes" in navbar
5. Explore both features!

---

**Need Help?**
- Check that port 3001 is correct: `lsof -nP -iTCP -sTCP:LISTEN | grep node`
- Verify `.env.local` has `NEXT_PUBLIC_GEMINI_API_KEY`
- Make sure server was restarted after env file update

---

**Last Updated:** January 17, 2025
**Server Port:** 3001 (NOT 3000)
**Status:** ✅ Both features are implemented and ready to test
