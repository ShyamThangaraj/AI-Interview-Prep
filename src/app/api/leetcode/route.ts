import { NextRequest, NextResponse } from "next/server";
import { QUESTION_QUERY } from "./query";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const slug = searchParams.get("slug") || "two-sum";

  const resp = await fetch("https://leetcode.com/graphql", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Referer": "https://leetcode.com",
      "Origin": "https://leetcode.com",
    },
    body: JSON.stringify({
      query: QUESTION_QUERY,
      variables: { titleSlug: slug },
    }),
  });

  if (!resp.ok) {
    return NextResponse.json(
      { error: `LeetCode responded ${resp.status}` },
      { status: 500 }
    );
  }

  const json = await resp.json();
  const q = json?.data?.question;
  if (!q) {
    return NextResponse.json({ error: "Question not found" }, { status: 404 });
  }

  return NextResponse.json({
    id: q.questionId,
    title: q.title,
    slug: q.titleSlug,
    content: q.content,
    difficulty: q.difficulty,
    likes: q.likes,
    dislikes: q.dislikes,
    topicTags: q.topicTags,
  });
}
