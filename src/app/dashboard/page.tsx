// app/dashboard/page.tsx
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import SignOutButton from "./SignOutButton";

export default async function Dashboard() {
  const cookieStore = await cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) { return cookieStore.get(name)?.value; },
        set(_n: string, _v: string, _o: CookieOptions) {},
        remove(_n: string, _o: CookieOptions) {},
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("onboarded, full_name, target_role, experience_level")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile?.onboarded) redirect("/onboarding");

  return (
    <main className="min-h-screen bg-black text-white px-6 py-4 font-mono">
      <div className="flex justify-between items-center mt-4 px-4 mb-8">
        <a href="/">
          <h2 className="text-3xl text-gray-400 ml-4 hover:text-white transition cursor-pointer">
            DREAMTERVIEW
          </h2>
        </a>
        <SignOutButton />
      </div>

      <div className="flex flex-1 items-center justify-center">
        <div className="bg-[#0d0d0d] border border-gray-800 p-8 rounded-lg shadow-lg w-full max-w-md">
          <h1 className="text-3xl font-bold text-center mb-6">Dashboard</h1>

          <div className="space-y-4">
            <div>
              <label className="text-sm text-gray-400">User ID</label>
              <div className="bg-gray-900 border border-gray-700 rounded px-4 py-2 break-all">{user.id}</div>
            </div>
            <div>
              <label className="text-sm text-gray-400">Email</label>
              <div className="bg-gray-900 border border-gray-700 rounded px-4 py-2">{user.email}</div>
            </div>
            {profile?.full_name && (
              <div>
                <label className="text-sm text-gray-400">Name</label>
                <div className="bg-gray-900 border border-gray-700 rounded px-4 py-2">{profile.full_name}</div>
              </div>
            )}
            {(profile?.target_role || profile?.experience_level) && (
              <div className="text-gray-400 text-sm">
                {profile.target_role && <>Role: {profile.target_role} • </>}
                {profile.experience_level && <>Experience: {profile.experience_level}</>}
              </div>
            )}
          </div>

          <div className="mt-6 text-center text-gray-400 text-sm">
            Welcome{profile?.full_name ? `, ${profile.full_name}` : ""}!
          </div>

          {/* Action: navigate to LLM-powered recommendations */}
          <div className="mt-8 flex justify-center">
            <Link
              href="/recommendations"
              className="inline-flex items-center rounded-lg px-4 py-2 border border-gray-700 text-gray-200 hover:bg-gray-900 hover:border-gray-600 transition"
            >
              Get My LeetCode Plan
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
