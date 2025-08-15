"use client";
import { useEffect, useState } from "react";

type Rec = {
  slug: string;
  title: string;
  difficulty: "EASY" | "MEDIUM" | "HARD";
  reason: string;
  leetcodeUrl?: string;
};

export default function RecommendationsPage() {
  const [loading, setLoading] = useState(true);
  const [schema, setSchema] = useState("");
  const [recs, setRecs] = useState<Rec[]>([]);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const r = await fetch("/api/recommendations");
      if (!r.ok) throw new Error((await r.json()).error || r.statusText);
      const data = await r.json();
      setSchema(data.schema || "");
      setRecs(data.recommendations || []);
    } catch (e: any) {
      setError(e.message || "Failed to load");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Your LeetCode Plan</h1>
        <button onClick={load} className="rounded-xl px-4 py-2 border hover:bg-gray-50">
          Refresh
        </button>
      </div>

      {loading && <p>Loading…</p>}
      {error && <p className="text-red-600">{error}</p>}

      {!loading && !error && (
        <>
          <section>
            <h2 className="text-lg font-semibold mb-2">GraphQL Schema</h2>
            <pre className="whitespace-pre-wrap rounded-xl border p-4 text-sm overflow-auto">
{schema}
            </pre>
          </section>

          <section className="space-y-4">
            <h2 className="text-lg font-semibold">Recommended Questions</h2>
            <ul className="space-y-3">
              {recs.map((r, i) => (
                <li key={i} className="rounded-xl border p-4">
                  <div className="font-medium">
                    {r.title} ({r.slug}) · {r.difficulty}
                  </div>
                  <p className="text-sm text-gray-600 mt-1">{r.reason}</p>
                  {r.leetcodeUrl && (
                    <div className="mt-2">
                      <a className="text-blue-600 underline" href={r.leetcodeUrl} target="_blank" rel="noreferrer">
                        Open on LeetCode
                      </a>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          </section>
        </>
      )}
    </div>
  );
}
