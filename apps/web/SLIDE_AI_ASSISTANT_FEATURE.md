# Slide AI Assistant Feature ✨

## Overview

The **Slide AI Assistant** is a context-aware AI tutor that helps students understand each teaching module during lessons. Each slide now has its own dedicated AI assistant button that, when clicked, opens a voice-powered conversation with Gemini AI Live.

---

## Key Features

### 1. **Per-Slide AI Assistance**
- ✅ Every teaching slide has its own "Ask AI" button
- ✅ Button positioned in top-right corner of the narrative panel
- ✅ Context-aware: AI knows exactly what slide the student is viewing

### 2. **Voice-Powered Conversations**
- ✅ Uses **Gemini AI Live** (multimodal audio API)
- ✅ Hands-free interaction - students just speak naturally
- ✅ Real-time audio responses from AI tutor
- ✅ Visual feedback showing when AI is listening vs speaking

### 3. **Intelligent Context Awareness**
The AI tutor automatically receives:
- Lesson title
- Current slide number (e.g., "Slide 3 of 8")
- Slide title and content
- Interactive code examples (if present)
- Explanations and hints from the slide

### 4. **Socratic Teaching Method**
The AI is programmed to:
- Ask guiding questions instead of just giving answers
- Break down complex concepts into simple terms
- Encourage critical thinking
- Provide relevant examples
- Keep responses concise and friendly

---

## Implementation Details

### Files Created

#### 1. `SlideAIAssistant.tsx`
**Location:** `app/components/lessons/SlideAIAssistant.tsx`

**Purpose:** Per-slide AI assistant component with voice chat modal

**Key Features:**
- Builds slide-specific context for Gemini AI
- Manages voice connection lifecycle
- Beautiful modal UI with voice visualizations
- Volume meter showing student's voice input
- Animated speaking/listening indicators

**Props:**
```typescript
interface SlideAIAssistantProps {
  slide: TeachingSlide;           // Current slide data
  lessonTitle: string;             // Lesson name
  slideIndex: number;              // Current slide index (0-based)
  totalSlides: number;             // Total slides in lesson
}
```

### Files Modified

#### 2. `TeachingSlide.tsx`
**Changes:**
- Added `SlideAIAssistant` import
- Added `lessonTitle` prop
- Positioned AI button in top-right corner of narrative panel
- Passes slide context to AI assistant

**Code:**
```typescript
<div className="absolute top-6 right-6 z-20">
  <SlideAIAssistant
    slide={currentSlide}
    lessonTitle={lessonTitle}
    slideIndex={currentSlideIndex}
    totalSlides={slides.length}
  />
</div>
```

#### 3. `LessonView.tsx`
**Changes:**
- Passes `lessonTitle` prop to `TeachingSlide` component

**Code:**
```typescript
<TeachingSlide
  slides={slidesToShow}
  onComplete={handleTeachingComplete}
  lessonTitle={lesson.title}  // ← New prop
  transitionMessage={...}
/>
```

---

## User Flow

### Step 1: Navigate to Lesson
Student starts a lesson and enters the teaching phase.

### Step 2: See AI Button on Each Slide
Each teaching slide displays a colorful "Ask AI" button in the top-right corner.

![Button appearance: Gradient blue-to-purple with sparkle emoji]

### Step 3: Click to Open AI Assistant
Student clicks the button to open a modal with:
- Slide context information
- Instructions for asking questions
- Example questions
- "Start Voice Chat" button

### Step 4: Start Voice Conversation
Student clicks "Start Voice Chat" and:
1. Browser requests microphone permission
2. Connection to Gemini AI Live established
3. Modal shows listening/speaking visualization
4. Student can now speak naturally

### Step 5: Interactive Learning
- Student asks questions by speaking
- AI responds with audio explanations
- Visual indicators show who's talking
- Volume meter shows student's voice input
- Student can ask follow-up questions

### Step 6: End Conversation
Student clicks "End Voice Chat" to:
- Disconnect from Gemini AI Live
- Stop microphone access
- Return to lesson or close modal

---

## Context Building

### How the AI Knows What to Teach

The AI receives a detailed context string for each slide:

```typescript
const buildSlideContext = () => {
  let context = `You are an expert Move programming tutor helping a student understand a specific concept.\n\n`;
  context += `Lesson: "${lessonTitle}"\n`;
  context += `Current Slide: ${slideIndex + 1} of ${totalSlides}\n`;
  context += `Slide Title: "${slide.title}"\n`;
  context += `Content: ${slide.content}\n\n`;

  if (slide.interactiveElement) {
    context += `This slide has an interactive element: ${slide.interactiveElement.type}\n`;

    if (slide.interactiveElement.type === 'code-highlight') {
      context += `Code Example:\n\`\`\`move\n${slide.interactiveElement.config.code}\n\`\`\`\n\n`;
    }

    if (slide.interactiveElement.config?.explanation) {
      context += `Explanation: ${slide.interactiveElement.config.explanation}\n\n`;
    }
  }

  context += `Your role:\n`;
  context += `1. Help the student understand this specific concept in simple terms\n`;
  context += `2. Break down complex ideas into digestible pieces\n`;
  context += `3. Answer questions about the code examples if present\n`;
  context += `4. Encourage questions and provide examples\n`;
  context += `5. Keep responses concise and friendly\n`;
  context += `6. Use the Socratic method - ask guiding questions instead of just giving answers\n\n`;
  context += `The student can ask you questions by voice. Help them understand "${slide.title}" thoroughly.`;

  return context;
};
```

### Example Context for a Slide

**Slide: "Understanding Move Modules"**

```
You are an expert Move programming tutor helping a student understand a specific concept.

Lesson: "Introduction to Move Programming"
Current Slide: 3 of 8
Slide Title: "Understanding Move Modules"
Content: Modules are the fundamental building blocks of Move programs. They contain functions, structs, and resources.

This slide has an interactive element: code-highlight
Code Example:
```move
module 0x1::MyModule {
    public fun greet() {
        // Function implementation
    }
}
```

Explanation: This example shows how to define a basic module with a public function.

Your role:
1. Help the student understand this specific concept in simple terms
2. Break down complex ideas into digestible pieces
3. Answer questions about the code examples if present
4. Encourage questions and provide examples
5. Keep responses concise and friendly
6. Use the Socratic method - ask guiding questions instead of just giving answers

The student can ask you questions by voice. Help them understand "Understanding Move Modules" thoroughly.
```

---

## API Integration

### Gemini AI Live Setup

The feature uses **Google's Gemini 2.5 Flash Native Audio** model via the `useMultimodalLive` hook.

**Required Environment Variable:**
```bash
NEXT_PUBLIC_GEMINI_API_KEY=your_api_key_here
```

**How to Get API Key:**
1. Go to [Google AI Studio](https://aistudio.google.com/apikey)
2. Create a new API key
3. Add to `.env.local` file

### Voice Connection Flow

```typescript
const { connect, disconnect, isConnected, isSpeaking, volume } = useMultimodalLive({
  context: buildSlideContext(),
});

// Start voice chat
const handleToggleVoice = () => {
  const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
  if (!apiKey) {
    alert('API key not configured');
    return;
  }
  connect(apiKey);
};

// End voice chat
disconnect();
```

### Audio Processing

**Input:** Student's voice
- Captured via Web Audio API (`ScriptProcessorNode`)
- Downsampled to 16kHz
- Sent to Gemini in real-time

**Output:** AI's voice response
- Received as PCM audio data (Int16Array)
- Decoded and played via Web Audio API
- Scheduled sequentially for smooth playback

---

## UI Components

### 1. Trigger Button
- **Location:** Top-right corner of each slide's narrative panel
- **Design:** Gradient blue-to-purple, rounded pill shape
- **States:**
  - Default: Shows ✨ icon + "Ask AI" text
  - Hover: Scales up 5%
  - Active: Scales down 5%

### 2. Modal (Inactive State)
- **Header:** Gradient background with lesson context
- **Content:**
  - Large microphone icon (gradient circle)
  - Heading: "Need help understanding this slide?"
  - Description of how to use the feature
  - Example questions panel (blue background)
  - "Start Voice Chat" button

### 3. Modal (Active State)
- **Header:** Same as inactive
- **Content:**
  - Animated voice visualization (pulsing gradient circle)
  - Status text: "Listening..." or "AI is speaking..."
  - Volume meter (progress bar showing input level)
  - "End Voice Chat" button (red)

### 4. Animations
- Modal fade in/out with scale
- Voice visualization pulse effect
- Volume meter smooth transitions
- Speaking indicator infinite pulse animation

---

## Example Questions Students Can Ask

### Understanding Concepts
- "Explain this concept in simpler terms"
- "What does this mean for beginners?"
- "Why is this important?"
- "How does this relate to what we learned before?"

### Code Examples
- "What does this code example do?"
- "Can you explain this line by line?"
- "Why do we use this syntax?"
- "What would happen if I changed this part?"

### Clarification
- "I don't understand the difference between X and Y"
- "Can you give me another example?"
- "What are common mistakes with this concept?"
- "How would I use this in a real project?"

### Practice
- "Can you give me a similar problem to solve?"
- "How can I practice this?"
- "What should I try next?"

---

## Benefits for Students

### 1. **Immediate Help**
- No need to wait for instructor
- Get explanations on-demand
- Available 24/7

### 2. **Personalized Learning**
- Ask questions at your own pace
- Get clarification on specific confusion points
- Revisit concepts as many times as needed

### 3. **Interactive Engagement**
- Voice interaction is more natural than typing
- Encourages asking questions
- Makes learning more engaging

### 4. **Confidence Building**
- Safe space to ask "dumb questions"
- No judgment from peers
- Encourages deeper understanding

### 5. **Context-Aware Responses**
- AI knows exactly what you're learning
- Tailored explanations for current concept
- References the code examples on screen

---

## Benefits for Instructors

### 1. **Reduced Support Load**
- AI handles common questions
- Students solve problems independently
- More time for complex issues

### 2. **Better Learning Outcomes**
- Students get immediate feedback
- Concepts reinforced through Q&A
- Active learning vs passive reading

### 3. **Insights into Student Struggles**
- Could track common questions (future feature)
- Identify difficult concepts
- Improve lesson content

---

## Technical Requirements

### Browser Support
- **Microphone Access:** Chrome, Firefox, Safari, Edge
- **Web Audio API:** All modern browsers
- **WebSocket:** For Gemini AI Live connection

### Permissions Needed
- **Microphone:** Required for voice input
- **Browser will prompt user on first use**

### Performance
- **Model:** Gemini 2.5 Flash (fast responses)
- **Latency:** ~500ms-2s for AI response
- **Audio Quality:** 16kHz input, 24kHz output

---

## Privacy & Safety

### Data Handling
- ✅ Voice audio sent to Google Gemini API
- ✅ Audio not stored permanently (ephemeral)
- ✅ Context is lesson content only (no personal data)
- ✅ No recording saved to database

### Content Safety
- ✅ AI system instruction enforces educational context
- ✅ AI stays on-topic (Move programming)
- ✅ Inappropriate responses unlikely (tutor persona)

### User Control
- ✅ Students explicitly start voice chat
- ✅ Can end conversation anytime
- ✅ Visual indicators show when mic is active

---

## Troubleshooting

### "API key not configured" Error
**Cause:** `NEXT_PUBLIC_GEMINI_API_KEY` not set

**Fix:**
```bash
# Add to .env.local
NEXT_PUBLIC_GEMINI_API_KEY=your_key_here

# Restart dev server
npm run dev
```

### Microphone Not Working
**Cause:** Browser permissions denied

**Fix:**
1. Click browser's address bar lock icon
2. Allow microphone access
3. Refresh page

### AI Not Responding
**Cause:** Network connection issue or API quota exceeded

**Fix:**
1. Check internet connection
2. Verify API key is valid
3. Check Google Cloud Console quota

### Audio Playback Issues
**Cause:** Browser audio context suspended

**Fix:**
- Click anywhere on page to activate audio context
- Check browser audio settings

---

## Future Enhancements

### Potential Features
1. **Chat History**
   - Save conversation per slide
   - Review past questions
   - Export conversation log

2. **Text Mode**
   - Alternative to voice for quiet environments
   - Faster for quick questions
   - Better for code snippets

3. **Analytics**
   - Track common questions per slide
   - Identify difficult concepts
   - A/B test teaching methods

4. **Multi-Language Support**
   - Support for non-English speakers
   - Language detection
   - Translation features

5. **Advanced AI Features**
   - Code completion suggestions
   - Real-time error explanation
   - Personalized learning paths

6. **Collaborative Learning**
   - Share AI insights with peers
   - Group discussion mode
   - Study group features

---

## Best Practices for Students

### Getting the Most Out of AI Tutor

1. **Be Specific**
   - ❌ "I don't understand"
   - ✅ "Can you explain what a resource is in Move?"

2. **Ask Follow-Up Questions**
   - Don't stop at first answer
   - Dig deeper: "Why?" "How?" "What if?"

3. **Practice Active Learning**
   - Try to answer before asking
   - Use AI to verify your understanding
   - Ask for examples to practice

4. **Use It as a Supplement**
   - Complete the lesson first
   - Use AI for clarification
   - Still attend live classes

5. **Experiment**
   - Ask hypothetical questions
   - Request different explanations
   - Test edge cases

---

## Development Notes

### Testing the Feature

**Manual Test:**
```bash
# 1. Set API key
echo "NEXT_PUBLIC_GEMINI_API_KEY=your_key" >> .env.local

# 2. Start dev server
npm run dev

# 3. Navigate to any lesson
# 4. Look for "Ask AI" button on each slide
# 5. Click button and grant microphone permission
# 6. Speak a question
# 7. Verify AI responds with audio
```

**Test Cases:**
- [ ] Button appears on every teaching slide
- [ ] Modal opens when button clicked
- [ ] Voice connection establishes
- [ ] Microphone permission requested
- [ ] Volume meter reflects voice input
- [ ] AI responds with relevant audio
- [ ] Speaking/listening indicators work
- [ ] Can end conversation cleanly
- [ ] Works on mobile devices
- [ ] Context updates when changing slides

### Code Quality

**TypeScript:**
- ✅ Full type safety
- ✅ No `any` types (except for SDK compatibility)
- ✅ Proper interface definitions

**Accessibility:**
- ✅ Keyboard navigation (Enter to submit)
- ✅ ARIA labels for buttons
- ✅ Visual feedback for all states
- ✅ Alternative text mode (future)

**Performance:**
- ✅ Lazy loading of audio context
- ✅ Cleanup on unmount
- ✅ Efficient state management
- ✅ Debounced volume updates

---

## Summary

The **Slide AI Assistant** feature transforms the learning experience by providing:

1. ✅ **Instant, context-aware help** on every teaching slide
2. ✅ **Natural voice conversations** with AI tutor
3. ✅ **Socratic teaching method** for deeper understanding
4. ✅ **Beautiful, intuitive UI** that encourages engagement
5. ✅ **Seamless integration** with existing lesson structure

**Students can now:**
- Ask questions without fear of judgment
- Get immediate clarification on confusing concepts
- Engage in interactive learning conversations
- Build confidence through hands-free voice interaction

**Result:** Better learning outcomes, higher engagement, and more independent problem-solving skills.

---

**Last Updated:** January 17, 2025
**Status:** ✅ Implemented and ready for testing
**API:** Gemini 2.5 Flash Native Audio (Google AI)
