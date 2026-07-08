import { createAuthClient } from 'better-auth/react';
import { adminClient } from 'better-auth/client/plugins';
import { ac, admin, user } from '@/config/permissions';

export const authClient = createAuthClient({
  plugins: [
    adminClient({
      ac,
      roles: { admin, user },
    }),
  ],
  fetchPlugins: [
    {
      id: 'next-cookies-request',
      name: 'next-cookies-request',
      hooks: {
        async onRequest(ctx: { headers: Headers }) {
          if (typeof window === 'undefined') {
            const { cookies } = await import('next/headers');
            const cookieStore = await cookies();
            ctx.headers.set('cookie', cookieStore.toString());
          }
        },
      },
    },
  ],
});

export const { signIn, signUp, signOut, useSession } = authClient;
