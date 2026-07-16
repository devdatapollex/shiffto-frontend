import { z } from 'zod';

const envSchema = z.object({
  BACKEND_URL: z.string().url().default('http://localhost:5000'),
  NEXT_PUBLIC_API_URL: z.string().default('/api/v1'),
  NEXT_PUBLIC_SITE_URL: z.string().url().default('http://localhost:3000'),
  NEXT_PUBLIC_APP_ENV: z.enum(['development', 'production', 'test']).default('development'),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
});

const parsedEnv = envSchema.safeParse({
  BACKEND_URL: process.env.BACKEND_URL,
  NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
  NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
  NEXT_PUBLIC_APP_ENV: process.env.NEXT_PUBLIC_APP_ENV,
  NODE_ENV: process.env.NODE_ENV,
});

if (!parsedEnv.success) {
  console.error('❌ Invalid environment variables:', parsedEnv.error.flatten().fieldErrors);
  if (process.env.NODE_ENV === 'development') {
    throw new Error('Invalid environment variables. Check your .env.local file.');
  }
}

export const env = parsedEnv.success ? parsedEnv.data : ({} as z.infer<typeof envSchema>);

export const siteConfig = {
  name: 'SHIFFTO',
  description: 'Unified platform for sending shipments and traveling — one account, both sides.',
  links: {
    github: 'https://github.com/shiffto',
  },
};
