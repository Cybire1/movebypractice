import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { prisma } from '@/app/lib/prisma';

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const next = requestUrl.searchParams.get('next') || '/';

  if (code) {
    const cookieStore = await cookies();

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              );
            } catch {
              // setAll called from Server Component — safe to ignore
            }
          },
        },
      }
    );

    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      // Get the authenticated user
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        // Upsert user into Prisma DB
        const email = user.email || '';
        const username = email.split('@')[0] || user.id.slice(0, 8);
        const avatarUrl = user.user_metadata?.avatar_url || user.user_metadata?.picture || null;

        await prisma.user.upsert({
          where: { id: user.id },
          create: {
            id: user.id,
            email,
            username,
            avatarUrl,
          },
          update: {
            email,
            avatarUrl,
          },
        });

        // Ensure stats record exists
        await prisma.userStats.upsert({
          where: { userId: user.id },
          create: { userId: user.id },
          update: {},
        });
      }

      return NextResponse.redirect(new URL(next, request.url));
    }
  }

  return NextResponse.redirect(new URL('/?error=auth_failed', request.url));
}
