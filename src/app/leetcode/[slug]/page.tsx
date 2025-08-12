type Question = {
  id: string;
  title: string;
  slug: string;
  content: string; // HTML
  difficulty: string;
  likes: number;
  dislikes: number;
  topicTags: { name: string; slug: string }[];
};

export const dynamic = "force-dynamic";

async function getQuestion(slug: string): Promise<Question | null> {
  const base = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const res = await fetch(`${base}/api/leetcode?slug=${slug}`, { cache: "no-store" });
  if (!res.ok) return null;
  return res.json();
}

export default async function Page({ params }: { params: { slug: string } }) {
  const q = await getQuestion(params.slug);

  if (!q) {
    return (
      <main className="max-w-3xl mx-auto p-6">
        <h1 className="text-xl font-semibold">Not found</h1>
        <p>Could not load question for slug: {params.slug}</p>
      </main>
    );
  }

  return (
    <main className="prose max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-semibold">
        {q.title} <span style={{ opacity: 0.6 }}>({q.difficulty})</span>
      </h1>

      {/* LeetCode returns HTML */}
      <div dangerouslySetInnerHTML={{ __html: q.content }} />

      <div style={{ marginTop: "1.5rem" }}>
        <h2>Tags</h2>
        <ul style={{ display: "flex", gap: ".5rem", flexWrap: "wrap", listStyle: "none", padding: 0 }}>
          {q.topicTags.map((t) => (
            <li key={t.slug} style={{ padding: ".25rem .5rem", background: "#f3f4f6", borderRadius: ".5rem" }}>
              {t.name}
            </li>
          ))}
        </ul>
      </div>

      <p style={{ marginTop: ".75rem", opacity: 0.7 }}>
        👍 {q.likes} | 👎 {q.dislikes}
      </p>
    </main>
  );
}
