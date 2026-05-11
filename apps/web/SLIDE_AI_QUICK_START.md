# Slide AI Assistant - Quick Start Guide 🚀

## What Was Added

Every teaching slide now has an **"Ask AI" button** that opens a voice-powered AI tutor to help students understand the current concept.

---

## Setup (Required)

### 1. Get Gemini API Key

```bash
# Visit Google AI Studio
https://aistudio.google.com/apikey

# Create a new API key
# Copy the key
```

### 2. Add to Environment Variables

```bash
# Add to .env.local file
NEXT_PUBLIC_GEMINI_API_KEY=your_api_key_here

# Restart your dev server
npm run dev
```

### 3. Test It Out

1. Start any lesson
2. Enter the teaching phase
3. Look for the **✨ Ask AI** button in the top-right corner of each slide
4. Click it to open the AI assistant
5. Click "Start Voice Chat"
6. Allow microphone permission
7. Ask a question by speaking!

---

## How It Works

### Visual Layout

```
┌─────────────────────────────────────────────────────┐
│  [Progress Bar] ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
├────────────────────────────┬────────────────────────┤
│                            │                        │
│   [Narrative Panel]        │   [Interactive Panel]  │
│                 [✨ Ask AI] │                        │
│   📦                       │                        │
│   Understanding Modules    │   ┌──────────────┐    │
│                            │   │ Code Example │    │
│   Modules are the          │   │              │    │
│   building blocks...       │   │ module 0x1:: │    │
│                            │   │   MyModule   │    │
│   [← Previous] [Continue]  │   └──────────────┘    │
│                            │                        │
└────────────────────────────┴────────────────────────┘
```

### AI Button States

**1. Default (Closed):**
```
┌──────────────┐
│ ✨ Ask AI    │
└──────────────┘
```

**2. Modal (Welcome State):**
```
┌────────────────────────────────┐
│  AI Tutor                   ✕  │
│  Slide 3: Understanding Modules│
├────────────────────────────────┤
│                                │
│         🎤                     │
│    (Microphone Icon)           │
│                                │
│  Need help understanding       │
│  this slide?                   │
│                                │
│  💡 Example questions:         │
│  • Explain in simpler terms    │
│  • What does this code do?     │
│                                │
│  [Start Voice Chat]            │
│                                │
└────────────────────────────────┘
```

**3. Modal (Active Voice):**
```
┌────────────────────────────────┐
│  AI Tutor                   ✕  │
│  Slide 3: Understanding Modules│
├────────────────────────────────┤
│                                │
│         🎤                     │
│    (Pulsing Animation)         │
│                                │
│  👂 Listening...               │
│  Speak naturally - ask your    │
│  question                      │
│                                │
│  ▓▓▓▓▓▓▓▓░░░░░░░ 60%         │
│  (Volume Meter)                │
│                                │
│  [End Voice Chat]              │
│                                │
└────────────────────────────────┘
```

---

## Example Usage Scenario

### Student's Journey

**Slide 3: "Understanding Move Modules"**

1. Student reads the slide content
2. Sees code example but doesn't fully understand
3. Clicks **✨ Ask AI** button
4. Modal opens with context about this specific slide
5. Clicks "Start Voice Chat"
6. Browser asks for microphone permission → Student allows
7. AI says: *"Hi! I can help you understand Move modules. What would you like to know?"*
8. Student asks: "What's the difference between a module and a function?"
9. AI explains: *"Great question! Think of a module like a container or a toolbox. It holds functions, just like a toolbox holds different tools. A function is one specific tool inside that toolbox..."*
10. Student asks follow-up: "Can you show me an example?"
11. AI provides example and explains
12. Student clicks "End Voice Chat"
13. Student continues to next slide

---

## What the AI Knows

For each slide, the AI receives:

### Context Information
- **Lesson Name:** "Introduction to Move Programming"
- **Slide Number:** "Slide 3 of 8"
- **Slide Title:** "Understanding Move Modules"
- **Slide Content:** Full text from the slide
- **Code Examples:** If the slide has interactive code
- **Explanations:** Any additional hints or notes

### Teaching Persona
The AI is instructed to:
- Use the **Socratic method** (ask guiding questions)
- Keep responses **concise** (30-60 seconds)
- **Break down** complex concepts
- Provide **examples** when helpful
- Be **encouraging** and friendly

---

## Tips for Students

### ✅ DO:
- Ask specific questions about the current slide
- Request different explanations if confused
- Ask for examples or analogies
- Speak clearly and naturally
- Ask follow-up questions

### ❌ DON'T:
- Ask about slides you haven't reached yet
- Expect AI to complete exercises for you
- Rely solely on AI (use it as a supplement)
- Speak too quietly or with background noise

---

## Example Questions

### Good Questions:
```
1. "Can you explain what a module is in simple terms?"
2. "What does this line of code do: module 0x1::MyModule?"
3. "Why do we need modules instead of just functions?"
4. "Can you give me a real-world analogy for modules?"
5. "What's the difference between public and private functions?"
```

### Less Helpful Questions:
```
1. "I don't understand" (too vague)
2. "What's the answer to the quiz?" (AI won't give direct answers)
3. "Tell me about Move" (too broad - be specific to the slide)
```

---

## Troubleshooting

### Button Not Visible
- **Cause:** Not on a teaching slide
- **Fix:** Navigate to the teaching phase of a lesson

### "API key not configured" Alert
- **Cause:** Missing `NEXT_PUBLIC_GEMINI_API_KEY`
- **Fix:** Add the environment variable and restart server

### Microphone Not Working
- **Cause:** Permission denied
- **Fix:** Click browser's lock icon → Allow microphone

### No Audio from AI
- **Cause:** Browser audio context suspended
- **Fix:** Click anywhere on the page, check volume

### AI Gives Generic Responses
- **Cause:** Poor context or vague question
- **Fix:** Ask more specific questions about the slide content

---

## Files Modified

### New File:
- `app/components/lessons/SlideAIAssistant.tsx` - The AI assistant component

### Modified Files:
- `app/components/lessons/TeachingSlide.tsx` - Added AI button to each slide
- `app/components/lessons/LessonView.tsx` - Pass lesson title to slides

---

## Testing Checklist

- [ ] API key added to `.env.local`
- [ ] Dev server restarted
- [ ] Navigate to any lesson
- [ ] Enter teaching phase (click "Start Lesson")
- [ ] See "Ask AI" button on each slide
- [ ] Click button → modal opens
- [ ] Click "Start Voice Chat"
- [ ] Grant microphone permission
- [ ] Speak a question
- [ ] Hear AI response
- [ ] See volume meter respond to voice
- [ ] See "Listening..." / "AI is speaking..." indicators
- [ ] Click "End Voice Chat" → connection closes
- [ ] Navigate to next slide → button still works

---

## Cost Considerations

### Gemini AI API Pricing
- **Free Tier:** 15 requests per minute, 1 million tokens per day
- **This should be sufficient for development and small user base**
- For production, consider:
  - Rate limiting per student
  - Usage analytics
  - Paid tier if needed

### Typical Usage:
- 1 lesson = 8 slides
- Student asks 2 questions per slide = 16 API calls
- 100 students = 1,600 API calls/day
- Well within free tier limits

---

## Next Steps

### For Development:
1. Test with real students
2. Gather feedback on AI responses
3. Tune the system prompt if needed
4. Add analytics to track usage

### For Production:
1. Set up API key rotation
2. Add rate limiting
3. Monitor API quota usage
4. Consider caching common questions

### Future Enhancements:
1. Add text chat mode (for quiet environments)
2. Save conversation history per slide
3. Allow students to replay AI explanations
4. Integrate with progress tracking

---

## Support

### Need Help?
1. Check full documentation: `SLIDE_AI_ASSISTANT_FEATURE.md`
2. Review the code: `app/components/lessons/SlideAIAssistant.tsx`
3. Test with example lessons in the app

### Feedback?
- Note which questions work well
- Identify confusing AI responses
- Track which slides need better context

---

**Ready to use!** 🎉

Students can now get instant, context-aware help on every teaching slide through natural voice conversations with an AI tutor.

**Last Updated:** January 17, 2025
