// app/post-login/page.tsx
export const revalidate = 0; // don't cache this gate

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createServerClient, type CookieOptions } from "@supabase/ssr";

export default async function PostLogin() {
  const cookieStore = await cookies(); // Next 15 / edge: async

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        // Server Components can't set cookies; leave as no-ops
        set(_n: string, _v: string, _o: CookieOptions) {},
        remove(_n: string, _o: CookieOptions) {},
      },
    }
  );

  // 1) Ensure session exists
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // 2) Enforce email verification BEFORE onboarding/dashboard
  //    (Turn ON "Confirm email" in Supabase Auth > Email)
  if (!user.email_confirmed_at) {
    redirect("/verify-email");
  }

  // 3) Read profile (may not exist yet)
  const { data: profile, error: selectErr } = await supabase
    .from("profiles")
    .select("onboarded")
    .eq("id", user.id)
    .maybeSingle();

  // If RLS/table misconfig, be conservative and send to onboarding
  if (selectErr) {
    redirect("/onboarding");
  }

  // 4) If no row, create one and send to onboarding
  if (!profile) {
    await supabase
      .from("profiles")
      .insert({ id: user.id, email: user.email, onboarded: false });
    redirect("/onboarding");
  }

  // 5) Route based on onboarded flag
  if (!profile.onboarded) redirect("/onboarding");

  redirect("/dashboard");
}