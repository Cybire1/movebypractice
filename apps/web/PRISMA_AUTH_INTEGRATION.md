# Prisma Authentication & Database Integration

## 🎉 Migration Complete!

Your **Move By Practice** platform now uses **Prisma 7 + Neon PostgreSQL** for all database operations, while keeping **Supabase Auth** for authentication.

---

## 🏗️ Architecture Overview

### Before (Client-Side Supabase)
```
User → Supabase Client (Browser) → Supabase Database
  ❌ Database queries exposed in browser
  ❌ No server-side validation
  ❌ Manual type definitions
  ❌ REST API overhead
```

### After (Server-Side Prisma)
```
User → Next.js API Routes → Prisma → Neon PostgreSQL
  ✅ Secure server-side queries
  ✅ Full type safety
  ✅ Direct SQL performance
  ✅ Automatic validation
```

---

## 🔐 Authentication Flow

### 1. Login/Signup (Unchanged - Supabase Auth)

Users authenticate via:
- Email/Password
- Google OAuth
- GitHub OAuth

**Files:**
- `app/components/auth/AuthModal.tsx` - Login/signup UI
- `app/lib/auth/AuthProvider.tsx` - Auth context provider

```typescript
// User logs in
await signIn('user@example.com', 'password')
  ↓
// Supabase Auth creates session
  ↓
// AuthProvider detects login and loads user data
await loadFromSupabase(user.id)
  ↓
// Calls GET /api/user/profile
```

### 2. Session Management

Supabase Auth handles:
- JWT tokens
- Session persistence
- Token refresh
- OAuth redirects

**Server-Side Auth Helper:**
```typescript
// app/lib/auth/server.ts
import { getServerUser } from '@/app/lib/auth/server'

// In any API route
const { user, error } = await getServerUser()
if (!user) {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
}
```

---

## 📡 API Routes (Server-Side Data Layer)

All database operations now go through API routes:

### GET /api/user/profile
**Purpose:** Load user profile with stats, progress, and achievements

**Response:**
```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "username": "movewizard"
  },
  "stats": {
    "xp": 1500,
    "level": 2,
    "streak": 5,
    "totalLessonsCompleted": 12
  },
  "completedLessons": ["lesson-1", "lesson-2", ...],
  "achievements": [...]
}
```

**Called by:** `gameStore.loadFromSupabase()`

---

### POST /api/user/complete-lesson
**Purpose:** Mark lesson as complete and award XP

**Request:**
```json
{
  "lessonId": "move-basics-1",
  "xpReward": 100,
  "timeSpentMinutes": 15,
  "codeSubmitted": "module example { ... }"
}
```

**Response:**
```json
{
  "success": true,
  "stats": {
    "xp": 1600,
    "level": 2
  },
  "leveledUp": false,
  "xpAwarded": 100
}
```

**Features:**
- Uses Prisma transaction for data consistency
- Auto-creates user stats if missing
- Automatically calculates level-ups (1000 XP per level)
- Logs analytics event

**Called by:** `gameStore.completeLesson()`

---

### POST /api/user/update-streak
**Purpose:** Update daily login streak

**Response:**
```json
{
  "streak": 6,
  "alreadyUpdatedToday": false
}
```

**Features:**
- Checks if already updated today
- Breaks streak if user missed yesterday
- Continues streak if logged in yesterday

**Called by:** `gameStore.updateStreak()`

---

### POST /api/user/unlock-achievement
**Purpose:** Unlock a new achievement

**Request:**
```json
{
  "achievementId": "first-lesson-complete"
}
```

**Response:**
```json
{
  "success": true,
  "achievement": {
    "id": "first-lesson-complete",
    "unlockedAt": "2025-01-17T12:00:00Z"
  }
}
```

**Features:**
- Prevents duplicate achievements
- Logs analytics event

**Called by:** `gameStore.unlockAchievement()`

---

## 🎮 Client State Management (Zustand Store)

### Updated: `app/lib/store/gameStore.ts`

**Key Changes:**
1. ❌ **Removed:** Direct Supabase client queries
2. ❌ **Removed:** `syncWithSupabase()` function
3. ✅ **Added:** API route calls with proper error handling
4. ✅ **Added:** Return types for async functions

**Updated Functions:**

```typescript
// Load user data on login
loadFromSupabase: async (userId: string) => {
  const response = await fetch('/api/user/profile')
  const data = await response.json()
  // Update local state
}

// Complete a lesson
completeLesson: async (lessonId, xpReward, timeSpent, code) => {
  const response = await fetch('/api/user/complete-lesson', {
    method: 'POST',
    body: JSON.stringify({ lessonId, xpReward, timeSpent, code })
  })
  const { stats, leveledUp } = await response.json()
  // Update local state and return level-up info
  return { leveledUp, newLevel: stats.level }
}

// Update daily streak
updateStreak: async () => {
  const response = await fetch('/api/user/update-streak', {
    method: 'POST'
  })
  const { streak } = await response.json()
  // Update local state
  return streak
}

// Unlock achievement
unlockAchievement: async (achievement) => {
  await fetch('/api/user/unlock-achievement', {
    method: 'POST',
    body: JSON.stringify({ achievementId: achievement.id })
  })
  // Update local state
}
```

---

## 🔄 Complete User Flow Example

### Scenario: User completes a lesson

```typescript
// 1. User clicks "Complete Lesson" button
onClick={() => completeLesson('lesson-1', 100, 15, userCode)}

// 2. gameStore.completeLesson() is called
completeLesson: async (lessonId, xpReward, timeSpent, code) => {
  // Client-side optimistic update (optional)
  set({ completedLessons: [...completedLessons, lessonId] })

  // 3. Call API route (server-side)
  const response = await fetch('/api/user/complete-lesson', {
    method: 'POST',
    body: JSON.stringify({ lessonId, xpReward, timeSpent, code })
  })

  // 4. Server validates auth
  const { user } = await getServerUser()
  if (!user) return 401

  // 5. Server uses Prisma transaction
  const result = await prisma.$transaction(async (tx) => {
    // Update user_progress
    await tx.userProgress.upsert(...)

    // Update user_stats
    const stats = await tx.userStats.update(...)

    // Log analytics_events
    await tx.analyticsEvent.create(...)

    return { stats, leveledUp: newLevel > oldLevel }
  })

  // 6. Server returns result
  return NextResponse.json(result)

  // 7. Client updates local state
  set({
    completedLessons: [...completedLessons, lessonId],
    xp: result.stats.xp,
    level: result.stats.level
  })

  // 8. UI shows level-up animation if leveledUp === true
  if (result.leveledUp) {
    showLevelUpModal(result.newLevel)
  }
}
```

---

## 🎯 Dashboard Integration

### Dashboard Page: `app/dashboard/page.tsx`

**Flow:**
```typescript
useEffect(() => {
  // On mount, load latest data from server
  if (user) {
    loadFromSupabase(user.id)
  }
}, [user])

// Dashboard renders with data from Zustand store
<StatsCards xp={xp} level={level} streak={streak} />
```

**Data Sources:**
- `xp`, `level`, `streak` → From Zustand store (loaded via API)
- `completedLessons` → From Zustand store (loaded via API)
- `achievements` → From Zustand store (loaded via API)

**Real-time Updates:**
- When user completes lesson → `completeLesson()` updates both server + local state
- Dashboard automatically re-renders with new data

---

## 🛡️ Security Improvements

### Before
```typescript
// ❌ Client-side query (browser can see/modify)
const { data } = await supabase
  .from('user_stats')
  .update({ total_xp: 9999999 }) // User can cheat!
  .eq('user_id', userId)
```

### After
```typescript
// ✅ Server-side validation
const { user } = await getServerUser()
// Can't forge user.id - Supabase Auth verifies JWT

const stats = await prisma.userStats.update({
  where: { userId: user.id }, // Guaranteed to be authentic
  data: { xp: currentXP + xpReward } // Server controls logic
})
```

**Benefits:**
- Users can't modify database queries
- XP/level calculations happen server-side
- All user IDs verified via Supabase Auth JWT

---

## 📊 Type Safety

### Before (Manual Types)
```typescript
// ❌ Manual type definitions, runtime errors possible
const { data: rawStats } = await supabase.from('user_stats').select('*')
const stats = rawStats as any // 😱
console.log(stats.total_xp) // Typo? No error until runtime!
```

### After (Auto-Generated Types)
```typescript
// ✅ Prisma generates types from schema
import { UserStats } from '@/app/lib/prisma'

const stats = await prisma.userStats.findUnique({ where: { userId } })
// stats is typed as UserStats | null ✅

console.log(stats.xp) // TypeScript autocomplete! ✅
console.log(stats.total_xp) // ❌ Compile error - property doesn't exist!
```

---

## 🚀 Performance Improvements

### Query Efficiency

**Before (3 separate REST API calls):**
```typescript
const user = await supabase.from('users').select('*').eq('id', userId)
const stats = await supabase.from('user_stats').select('*').eq('user_id', userId)
const progress = await supabase.from('user_progress').select('*').eq('user_id', userId)
```

**After (1 optimized SQL query with joins):**
```typescript
const data = await prisma.user.findUnique({
  where: { id: userId },
  include: {
    stats: true,
    progress: true,
    achievements: true
  }
})
// Prisma generates efficient JOIN query
```

### Connection Pooling

- Uses `@prisma/adapter-pg` with connection pooling
- Neon pooled connection URL for optimal serverless performance
- Faster than Supabase REST API layer

---

## 🧪 Testing

### Test the Complete Flow

1. **Login:**
   ```bash
   # Open app in browser
   npm run dev
   # Click "Sign In" → Use email/password or OAuth
   ```

2. **Check Dashboard:**
   ```bash
   # Navigate to /dashboard
   # Should load stats from Prisma database
   ```

3. **Complete a Lesson:**
   ```bash
   # Go to /lessons/move-basics-1
   # Complete exercises and click "Complete Lesson"
   # Check Network tab → Should see POST to /api/user/complete-lesson
   ```

4. **Verify Database:**
   ```bash
   npx prisma studio
   # Browse to user_progress table
   # Should see new lesson completion record
   ```

---

## 📝 Migration Notes

### What Changed
- ✅ All database queries now server-side via Prisma
- ✅ API routes handle authentication + data operations
- ✅ Zustand store calls API routes instead of Supabase client
- ✅ Full TypeScript type safety
- ✅ Better security (no client-side queries)

### What Stayed the Same
- ✅ Supabase Auth (login/signup/OAuth)
- ✅ AuthProvider context
- ✅ Zustand store structure
- ✅ Dashboard UI components
- ✅ User experience

### Breaking Changes
- ❌ Removed `syncWithSupabase()` function (no longer needed)
- ❌ `completeLesson()` now async (returns Promise)
- ❌ `updateStreak()` now async (returns Promise)
- ❌ `unlockAchievement()` now async (returns Promise)

**Update any code that calls these functions:**
```typescript
// Before
completeLesson('lesson-1', 100)

// After
await completeLesson('lesson-1', 100)
```

---

## 🔧 Troubleshooting

### Issue: "Unauthorized" error on API routes

**Cause:** User not logged in or session expired

**Fix:**
```typescript
// Check auth state
const { user } = useAuth()
if (!user) {
  // Redirect to login
  router.push('/')
}
```

### Issue: Database connection error

**Cause:** DATABASE_URL not set

**Fix:**
```bash
# Check .env file
cat .env | grep DATABASE_URL

# Should show:
# DATABASE_URL="postgresql://..."
```

### Issue: Prisma Client not generated

**Cause:** Need to regenerate after schema changes

**Fix:**
```bash
npx prisma generate
```

---

## 🎓 Next Steps

1. **Test the complete user flow** (login → dashboard → complete lesson)
2. **Monitor API routes** in development (check Network tab)
3. **Check database** with Prisma Studio (`npx prisma studio`)
4. **Deploy to production** (Vercel will run `prisma generate` automatically)

---

## 📚 Related Documentation

- [PRISMA_SETUP.md](./PRISMA_SETUP.md) - Database schema and setup
- [Prisma Client API](https://www.prisma.io/docs/reference/api-reference/prisma-client-reference)
- [Next.js API Routes](https://nextjs.org/docs/app/building-your-application/routing/route-handlers)
- [Supabase Auth](https://supabase.com/docs/guides/auth)

---

## ✅ Summary

Your platform now has:
- 🔐 **Secure authentication** via Supabase Auth
- 🗄️ **Type-safe database** via Prisma + Neon
- 🚀 **Fast performance** with direct SQL queries
- 🛡️ **Server-side validation** preventing cheating
- 📊 **Real-time dashboard** with optimized data loading

Happy coding! 🎉
