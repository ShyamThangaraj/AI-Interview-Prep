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

  // 1) Auth
  const { data: auth } = await supabase.auth.getUser();
  if (!auth?.user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  // 2) Load profile
  const { data: profile, error } = await supabase
    .from("profiles")
    .select("id,email,full_name,target_role,experience_level,focus_topics,strengths,challenges")
    .eq("id", auth.user.id)
    .single<Profile>();

  if (error || !profile) {
    return NextResponse.json({ error: "Profile not found" }, { status: 404 });
  }

  // 3) Prompt
  const system = `
You are a senior interview coach.
Given a user's profile, output:
1) "schema": GraphQL SDL named "InterviewPrep" with:
   enum Difficulty { EASY MEDIUM HARD }
   type Recommendation { tagSlug: String!, tagName: String!, difficulty: Difficulty!, count: Int!, reason: String! }
   type Query { recommendedProblems: [Recommendation!]! }
2) "recommendations": 6–10 items mixing tags and difficulty tailored to the profile.
   Use real LeetCode tag slugs (e.g., "two-pointers","binary-search","dynamic-programming","graph","heap","sliding-window","tree","trie","backtracking","greedy").
3) For each item, include "exampleQuery" using LeetCode's operation "problemsetQuestionList" with variables for tag slug and difficulty.
Return a single JSON object ONLY.
  `;

  const payload = {
    profile,
    guidance: { maxTotalCount: 25, preferFreshPracticeMix: true },
  };

  // 4) Call Groq (OpenAI-compatible)
  const completion = await groq.chat.completions.create({
    model: process.env.GROQ_MODEL || "llama3-70b-8192",
    temperature: 0.2,
    messages: [
      { role: "system", content: system },
      { role: "user", content: "Generate JSON for: " + JSON.stringify(payload) },
    ],
  });

  const raw = completion.choices[0]?.message?.content ?? "{}";

  // 5) Parse JSON robustly
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

  // 6) Add LeetCode filter links
  const withLinks = {
    ...parsed,
    recommendations: (parsed.recommendations ?? []).map((r: any) => {
      const diff =
        r.difficulty === "EASY" ? "Easy" :
        r.difficulty === "HARD" ? "Hard" : "Medium";
      const leetcodeUrl =
        `https://leetcode.com/problemset/?topicSlugs=${encodeURIComponent(r.tagSlug)}&difficulty=${diff}`;
      return { ...r, leetcodeUrl };
    }),
  };

  return NextResponse.json(withLinks, { status: 200, headers: res.headers });
}
