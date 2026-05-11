# 🔄 Zustand + Supabase Sync Implementation

## Overview

The game store has been migrated to a **hybrid local-first + cloud-sync** architecture that provides the best of both worlds:

- **Offline-first**: All actions work instantly without waiting for network
- **Cloud-backed**: Progress syncs to Supabase automatically
- **Cross-device**: Access your progress from any device
- **No data loss**: Existing local progress is preserved and migrated

---

## Architecture

### Local-First with Optimistic Updates

```typescript
// User completes a lesson
completeLesson(lessonId, xpReward)
  ↓
1. Update Zustand store IMMEDIATELY (instant UI feedback)
  ↓
2. Async sync to Supabase in background (no blocking)
  ↓
3. If offline: queued for next sync
```

### Automatic Sync Points

The system automatically syncs to Supabase when:

1. **User earns XP** → Updates `user_stats` table
2. **Lesson completed** → Updates `user_progress` table
3. **Achievement unlocked** → Inserts into `achievements` table
4. **Streak updated** → Updates `user_stats` table
5. **User logs in** → Loads latest data from Supabase
6. **User logs out** → Clears local store

---

## New Store Methods

### `loadFromSupabase(userId: string)`

**Purpose**: Load user's progress from Supabase into local store

**When called**:
- User logs in
- User signs up
- App initializes with existing session

**Example**:
```typescript
const { loadFromSupabase } = useGameStore();

// In AuthProvider after login
if (session?.user) {
  await loadFromSupabase(session.user.id);
}
```

---

### `syncWithSupabase(userId: string)`

**Purpose**: Push local progress to Supabase (migration tool)

**When called**:
- User has local progress before creating account
- Manual sync requested
- Data migration flow

**Example**:
```typescript
const { syncWithSupabase } = useGameStore();

// After signup, sync existing local data
await syncWithSupabase(user.id);
```

---

### `resetStore()`

**Purpose**: Clear all local data (logout cleanup)

**When called**:
- User logs out
- Session expires

**Example**:
```typescript
const { resetStore } = useGameStore();

// In AuthProvider on logout
if (event === 'SIGNED_OUT') {
  resetStore();
}
```

---

## Data Flow Diagrams

### New User (No Local Data)

```
Sign Up
  ↓
Create account in Supabase
  ↓
Auto-create user_stats (via trigger)
  ↓
Load empty data into Zustand
  ↓
Start learning!
```

### Existing User (Has Local Progress)

```
Complete 3 lessons locally (not logged in)
  ↓
Sign Up
  ↓
DataMigrationNotice appears
  ↓
User clicks "Sync My Progress"
  ↓
syncWithSupabase() uploads all local data
  ↓
Future progress auto-syncs
```

### Returning User (Login)

```
Log In
  ↓
loadFromSupabase() fetches cloud data
  ↓
Zustand store populated
  ↓
Local data overwritten with cloud data
  ↓
Continue learning with synced progress
```

---

## Components

### AuthProvider Integration

**File**: `app/lib/auth/AuthProvider.tsx`

**Changes**:
- Imports `useGameStore`
- Calls `loadFromSupabase()` on login
- Calls `resetStore()` on logout
- Handles auth state changes

```typescript
const { loadFromSupabase, resetStore } = useGameStore();

supabase.auth.onAuthStateChange(async (event, session) => {
  if (event === 'SIGNED_IN' && session?.user) {
    await loadFromSupabase(session.user.id);
  }

  if (event === 'SIGNED_OUT') {
    resetStore();
  }
});
```

---

### DataMigrationNotice

**File**: `app/components/auth/DataMigrationNotice.tsx`

**Purpose**: Prompt users to sync local progress after signup

**Features**:
- Detects local progress on first login
- Shows summary of XP, lessons, achievements
- One-click sync to cloud
- Skip option (can sync later)

**Triggers**:
- User has `xp > 0` OR `completedLessons.length > 0`
- User just logged in/signed up
- `lastSyncedAt` is null

---

## Database Schema Mapping

### Zustand → Supabase

| Zustand Field | Supabase Table | Column |
|--------------|----------------|---------|
| `xp` | `user_stats` | `total_xp` |
| `level` | `user_stats` | `level` |
| `streak` | `user_stats` | `current_streak` |
| `lastActiveDate` | `user_stats` | `last_active_at` |
| `completedLessons[i]` | `user_progress` | `lesson_id` (row) |
| `achievements[i]` | `achievements` | `achievement_id` (row) |

---

## Error Handling

### Offline Mode

All Supabase sync operations are **fire-and-forget**:

```typescript
// Update local state immediately
set({ xp: newXP });

// Sync to Supabase in background
supabase
  .from('user_stats')
  .update({ total_xp: newXP })
  .eq('user_id', user.id)
  .then(); // ← No await, no error blocking
```

If offline:
- Local state still updates ✅
- Sync fails silently 🔇
- Next successful sync will overwrite with latest local data

### Sync Conflicts

**Current strategy**: Last-write-wins

- Local changes overwrite Supabase
- Login overwrites local with Supabase
- No conflict resolution (future enhancement)

---

## Testing Checklist

### Manual Testing Steps

**1. Test New User Flow**
```bash
1. Clear browser storage (localStorage)
2. Visit site (not logged in)
3. Complete a lesson
4. Check XP increases locally
5. Sign up for account
6. Check DataMigrationNotice appears
7. Click "Sync My Progress"
8. Verify data in Supabase dashboard
```

**2. Test Returning User Flow**
```bash
1. Log out
2. Complete another lesson (local only)
3. Log back in
4. Verify local data replaced by cloud data
5. Complete new lesson
6. Check auto-sync to Supabase
```

**3. Test Multi-Device Sync**
```bash
1. Log in on Device A
2. Complete 2 lessons
3. Log in on Device B
4. Verify progress appears
5. Complete 1 lesson on Device B
6. Return to Device A (refresh)
7. Verify new lesson appears
```

### Database Verification

Check Supabase SQL Editor:

```sql
-- Verify user stats sync
SELECT * FROM user_stats WHERE user_id = '<USER_ID>';

-- Verify lesson progress
SELECT * FROM user_progress
WHERE user_id = '<USER_ID>'
ORDER BY completed_at DESC;

-- Verify achievements
SELECT * FROM achievements
WHERE user_id = '<USER_ID>';
```

---

## Known Limitations

1. **No Conflict Resolution**: If you complete lessons on 2 devices offline, the last sync wins
2. **No Offline Queue**: Failed syncs are not retried automatically
3. **No Real-time Sync**: Changes on other devices require page refresh
4. **Migration Prompt Once**: If user skips migration, they need to manually sync later

---

## Future Enhancements

### Phase 2 (Recommended)

1. **Real-time Subscriptions**
   ```typescript
   supabase
     .channel('user_progress')
     .on('postgres_changes', { event: '*', schema: 'public', table: 'user_progress' })
     .subscribe((payload) => {
       // Update Zustand store when data changes
     });
   ```

2. **Offline Queue with Retry**
   ```typescript
   // Store failed syncs
   const offlineQueue = [];

   // Retry on reconnect
   window.addEventListener('online', () => {
     offlineQueue.forEach(sync => sync.retry());
   });
   ```

3. **Conflict Resolution**
   ```typescript
   // Merge local + cloud data
   const mergedXP = Math.max(localXP, cloudXP);
   const mergedLessons = [...new Set([...local, ...cloud])];
   ```

---

## Migration Scenarios

### Scenario 1: Fresh Start

**User**: Never used the app before

**Flow**:
```
1. Sign up → Creates account
2. Auto-create user_stats (trigger)
3. Load empty data
4. Start learning!
```

**Result**: Clean slate, all progress synced from start

---

### Scenario 2: Local Progress First

**User**: Completed 5 lessons before signing up

**Flow**:
```
1. Complete 5 lessons locally
2. Sign up → DataMigrationNotice appears
3. Click "Sync" → Upload to Supabase
4. Future progress auto-syncs
```

**Result**: All local progress preserved and synced

---

### Scenario 3: Skip Migration

**User**: Has local progress but skips migration

**Flow**:
```
1. Complete 5 lessons locally
2. Sign up → DataMigrationNotice appears
3. Click "Skip" → No upload
4. loadFromSupabase() overwrites local with empty cloud data
```

**Result**: ⚠️ Local progress LOST (by user choice)

**Fix**: Call `syncWithSupabase(userId)` manually later

---

## API Reference

### useGameStore Hook

```typescript
import { useGameStore } from '@/app/lib/store/gameStore';

const {
  // State
  xp,
  level,
  streak,
  completedLessons,
  achievements,
  isSyncing,
  lastSyncedAt,

  // Actions (local + auto-sync)
  addXP,
  completeLesson,
  unlockAchievement,
  updateStreak,
  setCurrentLesson,

  // Sync methods
  loadFromSupabase,
  syncWithSupabase,
  resetStore,
} = useGameStore();
```

### Example: Manual Sync

```typescript
'use client';

import { useAuth } from '@/app/lib/auth/AuthProvider';
import { useGameStore } from '@/app/lib/store/gameStore';

export default function SyncButton() {
  const { user } = useAuth();
  const { syncWithSupabase, isSyncing } = useGameStore();

  const handleSync = async () => {
    if (!user) return;
    await syncWithSupabase(user.id);
    alert('Progress synced!');
  };

  return (
    <button onClick={handleSync} disabled={isSyncing}>
      {isSyncing ? 'Syncing...' : 'Sync Now'}
    </button>
  );
}
```

---

## Troubleshooting

### "Data not syncing"

**Check**:
1. User is logged in (`useAuth().user` not null)
2. Network connection active
3. Supabase credentials correct in `.env.local`
4. RLS policies allow user to write their own data

**Debug**:
```typescript
// Add logging to store actions
completeLesson: (lessonId, xpReward) => {
  console.log('Completing lesson:', lessonId);

  // ... existing code

  if (user) {
    supabase.from('user_progress')
      .upsert(...)
      .then(({ error }) => {
        if (error) console.error('Sync failed:', error);
        else console.log('Synced lesson:', lessonId);
      });
  }
}
```

---

### "Local progress lost after login"

**Cause**: `loadFromSupabase()` overwrites local data with cloud data

**Solution**: Always use DataMigrationNotice before first login

**Manual Fix**:
```typescript
// Before login, backup local data
const backup = useGameStore.getState();

// After login, if cloud is empty, restore and sync
if (cloudXP === 0 && backup.xp > 0) {
  await syncWithSupabase(userId);
}
```

---

## Summary

✅ **What's Working**:
- Instant local updates (no lag)
- Automatic background sync
- Cross-device progress
- Migration for existing users
- Logout cleanup

🔄 **What's Next**:
- Real-time sync (subscriptions)
- Offline queue with retry
- Better conflict resolution
- Analytics dashboard (Phase 2)

---

**Built with ❤️ for the Move By Practice platform**

Last Updated: December 29, 2025
Status: Zustand-Supabase Sync Complete ✅
