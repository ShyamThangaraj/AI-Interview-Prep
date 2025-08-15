export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { supabaseFromRequest } from "@/app/lib/supabaseServer";
import { groq } from "@/app/lib/groq";

type Profile = {
  id: string;
  email: string | null;
  full_name: string | null;
  target_role: string | null;
  experience_level: string | null;
  focus_topics: string[] | null;
  strengths: string | null;
  challenges: string | null;
};

export async function GET(req: NextRequest) {
  const res = new NextResponse();
  const supabase = supabaseFromRequest(req, res);

  const { data: auth } = await supabase.auth.getUser();
  if (!auth?.user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("id,email,full_name,target_role,experience_level,focus_topics,strengths,challenges")
    .eq("id", auth.user.id)
    .single<Profile>();

  if (error || !profile) {
    return NextResponse.json({ error: "Profile not found" }, { status: 404 });
  }

 const system = `
You are a senior interview coach.
Given a user's profile, output:
1) "schema": GraphQL SDL named "InterviewPrep" with:
   enum Difficulty { EASY MEDIUM HARD }
   type Question { slug: String!, title: String!, difficulty: Difficulty!, reason: String! }
   type Query { recommendedQuestions: [Question!]! }
2) "recommendations": 8–12 specific LeetCode questions tailored to the profile.
   - Use real LeetCode problem slugs (e.g., "two-sum","valid-parentheses","container-with-most-water","merge-intervals","median-of-two-sorted-arrays").
   - Titles must match the slug (Groq can infer common titles).
   - difficulty must be one of EASY, MEDIUM, HARD.
   - reason is a one–sentence rationale tied to the user's profile.
3) Do NOT include tag names or counts. Do NOT include example GraphQL queries.
4) Return a SINGLE JSON object with exactly: { "schema": string, "recommendations": Question[] }.
`;

  const payload = {
    profile,
    guidance: { maxTotalCount: 25, preferFreshPracticeMix: true },
  };

  const completion = await groq.chat.completions.create({
    model: process.env.GROQ_MODEL || "llama3-70b-8192",
    temperature: 0.2,
    messages: [
      { role: "system", content: system },
      { role: "user", content: "Generate JSON for: " + JSON.stringify(payload) },
    ],
  });

  const raw = completion.choices[0]?.message?.content ?? "{}";

  function safeParseJson(s: string) {
    try { return JSON.parse(s); } catch {}
    const a = s.indexOf("{"), b = s.lastIndexOf("}");
    if (a !== -1 && b !== -1 && b > a) {
      try { return JSON.parse(s.slice(a, b + 1)); } catch {}
    }
    return null;
  }
  const parsed = safeParseJson(raw);
  if (!parsed) {
    return NextResponse.json({ error: "LLM returned invalid JSON" }, { status: 502 });
  }

  const withLinks = {
  ...parsed,
  recommendations: (parsed.recommendations ?? []).map((r: any) => {
    const slug = r.slug || r.titleSlug || "";
    const leetcodeUrl = slug ? `https://leetcode.com/problems/${slug}/` : undefined;
    return { ...r, leetcodeUrl };
  }),
};

  return NextResponse.json(withLinks, { status: 200, headers: res.headers });
}
