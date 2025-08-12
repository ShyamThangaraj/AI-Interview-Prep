'use client';

import { createBrowserClient } from '@supabase/ssr';

function getPublicEnv() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) {
    throw new Error(
      'Missing Supabase env vars. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local'
    );
  }
  return { url, key };
}

const { url, key } = getPublicEnv();

// Single browser client for the whole app
export const supabase = createBrowserClient(url, key);

// (Optional) helper if you want a stable site URL for email redirects
export function getSiteUrl() {
  return process.env.NEXT_PUBLIC_SITE_URL ?? window.location.origin;
}