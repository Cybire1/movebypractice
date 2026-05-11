# Prisma Setup Guide for Move By Practice

## 🎉 Overview

Your **Move By Practice** platform is now powered by **Prisma 7** + **Neon PostgreSQL**, giving you:

- ✅ **Type-safe database queries** with full TypeScript support
- ✅ **Serverless-ready** connection pooling via Neon
- ✅ **Fast migrations** with `prisma db push`
- ✅ **Auto-generated types** from your database schema
- ✅ **Connection pooling** for optimal performance in Next.js

---

## 📦 What's Installed

### Dependencies

```json
{
  "dependencies": {
    "@prisma/client": "^7.2.0",
    "@prisma/adapter-pg": "latest",
    "pg": "latest"
  },
  "devDependencies": {
    "prisma": "^7.2.0",
    "dotenv": "latest",
    "tsx": "latest"
  }
}
```

### File Structure

```
move-by-practice/
├── prisma/
│   ├── schema.prisma          # Database schema (9 models, 4 enums)
│   └── migrations/            # Migration history (auto-generated)
├── prisma.config.ts           # Prisma 7 configuration
├── app/lib/prisma/
│   ├── client.ts              # Singleton Prisma Client
│   └── index.ts               # Re-exports + types
├── .env                        # DATABASE_URL + secrets
└── test-prisma.ts             # Test script
```

---

## 🗄️ Database Schema

Your Neon database now has **9 tables** matching your Supabase schema:

### Core Tables
- `users` - User accounts (email, wallet, username)
- `user_stats` - XP, level, streak tracking
- `user_progress` - Lesson completion tracking
- `achievements` - Unlocked achievements
- `analytics_events` - User activity tracking

### Live Classes Tables (Phase 3)
- `classes` - LiveKit streaming sessions
- `class_bookings` - Student enrollments
- `class_messages` - Chat & Q&A messages
- `class_donations` - Blockchain donations (Sui)

### Enums
- `ClassStatus` - scheduled | live | completed | cancelled
- `BookingStatus` - booked | attended | cancelled
- `MessageType` - chat | question | answer
- `DonationStatus` - pending | confirmed | failed

---

## 🚀 Usage

### 1. Import Prisma Client

```typescript
// In any server component or API route
import { prisma } from '@/app/lib/prisma'

// Query users
const users = await prisma.user.findMany()

// Create a user
const user = await prisma.user.create({
  data: {
    id: userId, // from Supabase auth
    email: 'user@example.com',
    username: 'learner123',
  }
})

// Include relations
const userWithStats = await prisma.user.findUnique({
  where: { id: userId },
  include: {
    stats: true,          // UserStats
    progress: true,        // UserProgress[]
    achievements: true,    // Achievement[]
  }
})
```

### 2. Example API Route

```typescript
// app/api/users/[id]/stats/route.ts
import { NextResponse } from 'next/server'
import { prisma } from '@/app/lib/prisma'

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const userStats = await prisma.userStats.findUnique({
      where: { userId: params.id },
      include: { user: true },
    })

    if (!userStats) {
      return NextResponse.json(
        { error: 'User stats not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(userStats)
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch user stats' },
      { status: 500 }
    )
  }
}
```

### 3. TypeScript Types

All types are auto-generated and exported:

```typescript
import type {
  User,
  UserStats,
  Class,
  ClassStatus,
  MessageType,
} from '@/app/lib/prisma'

// Types are automatically inferred
const updateStats = async (userId: string, xp: number) => {
  const stats = await prisma.userStats.update({
    where: { userId },
    data: { xp },
  })
  // stats is typed as UserStats
  return stats.level // TypeScript knows this exists!
}
```

---

## 🔧 Common Commands

### Development

```bash
# Run migrations (sync schema to database)
npx prisma db push

# Generate Prisma Client (after schema changes)
npx prisma generate

# Open Prisma Studio (visual database editor)
npx prisma studio

# Test database connection
npx tsx test-prisma.ts
```

### Production

```bash
# Generate optimized client
NODE_ENV=production npx prisma generate

# Apply migrations
npx prisma migrate deploy
```

---

## 🌐 Environment Variables

Your `.env` file contains:

```bash
# Neon PostgreSQL (Pooled)
DATABASE_URL="postgresql://neondb_owner:***@ep-fragrant-tree-ahnbb9id-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require"

# Direct connection (for migrations)
DATABASE_URL_UNPOOLED="postgresql://neondb_owner:***@ep-fragrant-tree-ahnbb9id.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require"
```

⚠️ **NEVER commit `.env` to git!** (Already in `.gitignore`)

---

## 📚 Example Queries

### Create User with Stats

```typescript
const user = await prisma.user.create({
  data: {
    id: userId,
    email: 'new@user.com',
    stats: {
      create: {
        xp: 0,
        level: 1,
        streak: 0,
      }
    }
  },
  include: { stats: true }
})
```

### Track Lesson Progress

```typescript
await prisma.userProgress.upsert({
  where: {
    userId_lessonId: {
      userId: userId,
      lessonId: 'lesson-1',
    }
  },
  update: {
    completed: true,
    completedAt: new Date(),
    attempts: { increment: 1 },
  },
  create: {
    userId: userId,
    lessonId: 'lesson-1',
    completed: true,
    completedAt: new Date(),
    attempts: 1,
  }
})
```

### Get Leaderboard

```typescript
const leaderboard = await prisma.userStats.findMany({
  orderBy: { xp: 'desc' },
  take: 10,
  include: {
    user: {
      select: {
        username: true,
        avatarUrl: true,
      }
    }
  }
})
```

### Schedule a Live Class

```typescript
const newClass = await prisma.class.create({
  data: {
    instructorId: userId,
    title: 'Intro to Move Structs',
    description: 'Learn how to define custom types',
    scheduledAt: new Date('2025-02-01T18:00:00Z'),
    durationMinutes: 60,
    status: 'scheduled',
    chatEnabled: true,
    qaEnabled: true,
  }
})
```

---

## 🔄 Migrating from Supabase Client

### Before (Supabase)

```typescript
import { supabase } from '@/lib/supabase/client'

const { data, error } = await supabase
  .from('users')
  .select('*, user_stats(*)')
  .eq('id', userId)
  .single()
```

### After (Prisma)

```typescript
import { prisma } from '@/app/lib/prisma'

const data = await prisma.user.findUnique({
  where: { id: userId },
  include: { stats: true }
})
```

**Benefits:**
- ✅ Full TypeScript autocomplete
- ✅ No manual type definitions
- ✅ Compile-time error checking
- ✅ Better performance (direct SQL)

---

## 🧪 Testing

```bash
# Run the test script
npx tsx test-prisma.ts
```

**Test Coverage:**
1. ✅ Database connection
2. ✅ Table accessibility
3. ✅ Create operations
4. ✅ Query operations
5. ✅ Relations

---

## 🚨 Important Notes

### 1. Supabase Triggers Not Migrated

The auto-creation trigger for `user_stats` from Supabase is **not ported**. You'll need to manually create stats or add the trigger to Neon:

```sql
-- Run in Neon SQL Editor
CREATE OR REPLACE FUNCTION create_user_stats()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO user_stats (user_id, xp, level, streak)
  VALUES (NEW.id, 0, 1, 0);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_user_created
  AFTER INSERT ON users
  FOR EACH ROW
  EXECUTE FUNCTION create_user_stats();
```

### 2. Connection Pooling

We use **PostgreSQL adapter** (`@prisma/adapter-pg`) instead of Neon serverless adapter for:
- ✅ Better compatibility
- ✅ Easier debugging
- ✅ Standard connection pooling

### 3. Prisma 7 Changes

- ✅ No more `url` in `schema.prisma` (moved to `prisma.config.ts`)
- ✅ Requires adapter (we use `@prisma/adapter-pg`)
- ✅ Faster query engine

---

## 📖 Documentation Links

- [Prisma Docs](https://www.prisma.io/docs)
- [Neon + Prisma Guide](https://neon.tech/docs/guides/prisma)
- [Prisma Client API](https://www.prisma.io/docs/reference/api-reference/prisma-client-reference)
- [Prisma Schema Reference](https://www.prisma.io/docs/reference/api-reference/prisma-schema-reference)

---

## ✅ You're All Set!

Your database is ready to use. Start querying with:

```typescript
import { prisma } from '@/app/lib/prisma'

// Your code here
const users = await prisma.user.findMany()
```

Happy coding! 🚀
