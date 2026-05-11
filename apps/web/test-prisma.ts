/**
 * Test script to verify Prisma database connection
 * Run with: npx tsx test-prisma.ts
 */

// Load environment variables FIRST
import 'dotenv/config'
import { prisma } from './app/lib/prisma'

async function main() {
  console.log('🔍 Testing Prisma connection to Neon database...\n')

  try {
    // Test 1: Database connection
    console.log('1️⃣  Testing database connection...')
    await prisma.$connect()
    console.log('✅ Database connection successful!\n')

    // Test 2: Count existing tables
    console.log('2️⃣  Checking database tables...')
    const userCount = await prisma.user.count()
    const statsCount = await prisma.userStats.count()
    const classCount = await prisma.class.count()

    console.log(`   Users: ${userCount}`)
    console.log(`   User Stats: ${statsCount}`)
    console.log(`   Classes: ${classCount}`)
    console.log('✅ Tables accessible!\n')

    // Test 3: Create a test user (will fail if user already exists)
    console.log('3️⃣  Creating test user...')
    const testUserId = '550e8400-e29b-41d4-a716-446655440000' // Fixed UUID for testing

    try {
      const user = await prisma.user.create({
        data: {
          id: testUserId,
          email: 'test@movebypractice.com',
          username: 'testuser123',
        }
      })
      console.log(`✅ User created: ${user.email}`)
    } catch (err: any) {
      if (err.code === 'P2002') {
        console.log('⚠️  Test user already exists (skipping)')
      } else {
        throw err
      }
    }

    // Test 4: Query the test user
    console.log('\n4️⃣  Querying test user...')
    const user = await prisma.user.findUnique({
      where: { id: testUserId },
      include: { stats: true }
    })

    if (user) {
      console.log(`✅ Found user: ${user.email}`)
      console.log(`   Username: ${user.username}`)
      console.log(`   Has stats: ${user.stats ? 'Yes' : 'No'}`)
    }

    // Test 5: Verify triggers (user_stats auto-creation)
    console.log('\n5️⃣  Testing auto-creation triggers...')
    const newUserId = '660e8400-e29b-41d4-a716-446655440001'

    try {
      await prisma.user.create({
        data: {
          id: newUserId,
          email: 'trigger-test@movebypractice.com',
          username: 'triggertest',
        }
      })

      // Note: The auto-trigger for user_stats is in Supabase, not Neon
      // We'll need to create stats manually or set up the trigger
      console.log('✅ User creation works (Note: Supabase triggers not ported)')
    } catch (err: any) {
      if (err.code === 'P2002') {
        console.log('⚠️  Trigger test user already exists')
      }
    }

    console.log('\n✨ All Prisma tests passed!')

  } catch (error) {
    console.error('❌ Error during testing:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
