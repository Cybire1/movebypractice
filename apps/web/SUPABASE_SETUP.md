# 🚀 Supabase Setup Guide

## Step 1: Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign up/login
2. Click "New Project"
3. Fill in project details:
   - **Name**: Move By Practice
   - **Database Password**: (save this securely)
   - **Region**: Choose closest to your users
4. Wait for project to initialize (~2 minutes)

## Step 2: Get API Keys

1. In your Supabase dashboard, go to **Settings** → **API**
2. Copy the following:
   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon public** key: `eyJhbGc...`

## Step 3: Configure Environment Variables

1. Create `.env.local` file in project root:

```bash
cp .env.example .env.local
```

2. Add your Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

## Step 4: Run Database Schema

1. In Supabase dashboard, go to **SQL Editor**
2. Click "New Query"
3. Copy the contents of `supabase/schema.sql`
4. Paste into the SQL editor
5. Click **Run** or press `Ctrl/Cmd + Enter`
6. Verify all tables were created successfully

## Step 5: Configure Authentication

1. Go to **Authentication** → **Providers**
2. Enable the following:
   - **Email** (default - enabled)
   - **Google OAuth** (optional):
     - Get credentials from [Google Cloud Console](https://console.cloud.google.com)
     - Add to "Authorized redirect URIs": `https://your-project.supabase.co/auth/v1/callback`
   - **GitHub OAuth** (optional):
     - Create OAuth app at [GitHub Settings](https://github.com/settings/developers)
     - Add callback URL: `https://your-project.supabase.co/auth/v1/callback`

## Step 6: Configure Email Templates (Optional)

1. Go to **Authentication** → **Email Templates**
2. Customize:
   - **Confirm Signup**
   - **Magic Link**
   - **Change Email**
   - **Reset Password**

## Step 7: Test the Setup

1. Start your development server:

```bash
npm run dev
```

2. Go to `http://localhost:3000`
3. Click "Sign Up" and create a test account
4. Check Supabase dashboard → **Authentication** → **Users** to see your new user

## Verification Checklist

✅ Supabase project created
✅ Environment variables set
✅ Database schema executed
✅ Tables visible in Table Editor
✅ Authentication providers enabled
✅ Test user created successfully

## Troubleshooting

### "Invalid API key"
- Double-check your `.env.local` file
- Ensure you're using the **anon public** key, not the service role key
- Restart your dev server after changing env vars

### "relation does not exist"
- Run the `schema.sql` file in SQL Editor
- Check for any SQL errors in the output
- Verify tables exist in **Table Editor**

### "User already exists"
- Check **Authentication** → **Users** in dashboard
- Delete test user and try again

## Next Steps

Once setup is complete:
- Users can sign up/login
- Progress will be saved to the database
- Real-time sync across devices works
- Ready for analytics dashboard!

---

**Need help?** Check the [Supabase Documentation](https://supabase.com/docs) or open an issue in the repo.
