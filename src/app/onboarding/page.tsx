'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/app/lib/supabaseClient';

const ROLES = [
  'SWE - Frontend','SWE - Backend','SWE - Full Stack','Data Scientist','ML/AI Engineer','DevOps / SRE','Security','PM','Other',
];
const EXPERIENCE = ['Student / New Grad', 'Junior (0–2y)', 'Mid (2–5y)', 'Senior (5+y)'];
const FOCUS_GROUPS: { group: string; topics: string[] }[] = [
  { group: 'Algorithms & Data Structures', topics: ['Arrays','Strings','Hash Tables','Two Pointers','Stacks & Queues','Linked Lists','Trees','Graphs','Recursion','Dynamic Programming','Greedy','Sorting & Searching','Heaps / Priority Queues','Bit Manipulation'] },
  { group: 'System Design', topics: ['High-Level Design','APIs & REST','Databases (SQL/NoSQL)','Caching','Load Balancing','Sharding & Partitioning','Messaging & Queues','Event-Driven Systems','Consistency & Availability','Observability'] },
  { group: 'Back-end & Infra', topics: ['Concurrency / Multithreading','Networking Basics','Authentication & Authorization','Security Fundamentals','CI/CD','Containers (Docker)','Kubernetes Basics'] },
  { group: 'Frontend', topics: ['JavaScript/TypeScript','React','State Management','Accessibility','Performance','Testing (Jest/Cypress)'] },
  { group: 'Data / ML', topics: ['SQL','Pandas / Data Wrangling','Modeling Basics','Evaluation & Metrics','Prompt Engineering','Vector Databases'] },
  { group: 'Behavioral', topics: ['STAR Method','Leadership & Ownership','Collaboration','Conflict Resolution','Communication'] },
];

// More forgiving sentence counter: splits on . ! ? or newlines
function countSentences(text: string) {
  return text
    .split(/[.!?\n]+/g)
    .map(s => s.trim())
    .filter(s => s.length >= 4).length;
}

type FormData = {
  fullName: string;
  role: string;
  experience: string;
  focus: string[];
  strengths: string;
  challenges: string;
};

const emptyForm: FormData = {
  fullName: '',
  role: '',
  experience: '',
  focus: [],
  strengths: '',
  challenges: '',
};

export default function Onboarding() {
  const router = useRouter();
  const [step, setStep] = useState(0); // 0 basics, 1 focus, 2 S/C, 3 review
  const [form, setForm] = useState<FormData>(() => {
    if (typeof window !== 'undefined') {
      const saved = window.localStorage.getItem('onboarding_form');
      return saved ? (JSON.parse(saved) as FormData) : emptyForm;
    }
    return emptyForm;
  });
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  // guard if already onboarded
  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push('/login'); return; }
      const { data: profile } = await supabase.from('profiles').select('onboarded').eq('id', user.id).maybeSingle();
      if (profile?.onboarded) router.push('/dashboard');
    })();
  }, [router]);

  // persist draft
  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('onboarding_form', JSON.stringify(form));
    }
  }, [form]);

  // validations
  const basicsValid = useMemo(() => !!(form.fullName && form.role && form.experience), [form]);
  const strengthsValid = useMemo(() => (form.strengths.trim().length >= 40 && countSentences(form.strengths) >= 2), [form.strengths]);
  const challengesValid = useMemo(() => (form.challenges.trim().length >= 40 && countSentences(form.challenges) >= 2), [form.challenges]);
  const focusValid = useMemo(() => form.focus.length > 0, [form.focus]);

  // clear top error when user edits relevant fields
  const bind = <K extends keyof FormData>(key: K) => ({
    value: form[key] as FormData[K] & string,
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      setForm(f => ({ ...f, [key]: e.target.value as any }));
      setErr(null);
    }
  });

  function toggleFocus(topic: string) {
    setForm(f => {
      const active = f.focus.includes(topic);
      const next = active ? f.focus.filter(x => x !== topic) : [...f.focus, topic];
      return { ...f, focus: next };
    });
    setErr(null);
  }

  function next() {
    const errors: string[] = [];
    if (step === 0 && !basicsValid) errors.push('Fill name, role, and experience.');
    if (step === 1 && !focusValid) errors.push('Pick at least one focus area.');
    if (step === 2) {
      if (!strengthsValid) errors.push('Add 2–3 sentences about your strengths (≥ ~40 chars).');
      if (!challengesValid) errors.push('Add 2–3 sentences about your challenges (≥ ~40 chars).');
    }
    if (errors.length) { setErr(errors.join(' ')); return; }
    setErr(null);
    setStep(s => Math.min(s + 1, 3));
  }

  function back() {
    setErr(null);
    setStep(s => Math.max(s - 1, 0));
  }

  async function submit() {
    setErr(null);
    try {
      setLoading(true);
      const { data: { user }, error: uErr } = await supabase.auth.getUser();
      if (uErr || !user) { setErr('You are not logged in.'); return; }

      const { error } = await supabase.from('profiles').update({
        full_name: form.fullName.trim(),
        target_role: form.role,
        experience_level: form.experience,
        focus_topics: form.focus,
        strengths: form.strengths.trim(),
        challenges: form.challenges.trim(),
        onboarded: true,
      }).eq('id', user.id);

      if (error) { setErr(error.message); return; }

      if (typeof window !== 'undefined') localStorage.removeItem('onboarding_form');
      router.push('/dashboard');
    } catch {
      setErr('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  const Stepper = (
    <div className="flex items-center gap-2 text-xs text-gray-400">
      {[0,1,2,3].map(i => (
        <div key={i} className={`h-1.5 rounded-full transition-all ${i<=step ? 'bg-blue-500' : 'bg-gray-700'}`} style={{width: i===step ? 48 : 28}} />
      ))}
    </div>
  );

  return (
    <main className="min-h-screen bg-black text-white flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-3xl max-h-[90vh] overflow-y-auto bg-[#0d0d0d] border border-gray-800 p-6 sm:p-8 rounded-lg space-y-6 font-mono shadow-lg">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl sm:text-3xl font-bold">Quick Onboarding</h1>
          {Stepper}
        </div>

        {step === 0 && (
          <section className="space-y-4">
            <div>
              <label className="text-sm text-gray-400">Name</label>
              <input
                {...bind('fullName')}
                placeholder="Your preferred name"
                className="mt-1 w-full bg-gray-900 border border-gray-700 rounded px-3 py-2"
                required
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-gray-400">Role</label>
                <select
                  {...bind('role')}
                  className="mt-1 w-full bg-gray-900 border border-gray-700 rounded px-3 py-2"
                  required
                >
                  <option value="" disabled>Select a role</option>
                  {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
              <div>
                <label className="text-sm text-gray-400">Experience</label>
                <select
                  {...bind('experience')}
                  className="mt-1 w-full bg-gray-900 border border-gray-700 rounded px-3 py-2"
                  required
                >
                  <option value="" disabled>Select level</option>
                  {EXPERIENCE.map(x => <option key={x} value={x}>{x}</option>)}
                </select>
              </div>
            </div>
          </section>
        )}

        {step === 1 && (
          <section className="space-y-4">
            <div className="flex items-baseline justify-between">
              <label className="text-sm text-gray-400">Focus areas (pick several)</label>
              <span className="text-xs text-gray-500">{form.focus.length} selected</span>
            </div>
            <div className="mt-1 space-y-4">
              {FOCUS_GROUPS.map(({ group, topics }) => (
                <div key={group} className="border border-gray-800 rounded-lg p-3">
                  <div className="text-xs uppercase tracking-wide text-gray-400 mb-2">{group}</div>
                  <div className="flex flex-wrap gap-2">
                    {topics.map((t) => {
                      const active = form.focus.includes(t);
                      return (
                        <button
                          type="button"
                          key={t}
                          onClick={() => toggleFocus(t)}
                          className={`px-3 py-1 rounded border text-xs ${active ? 'bg-blue-600 border-blue-500' : 'bg-gray-900 border-gray-700 hover:border-gray-600'}`}
                          aria-pressed={active}
                        >
                          {t}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {step === 2 && (
          <section className="space-y-6">
            {/* Strengths */}
            <div>
              <label className="text-sm text-gray-400">
                What are your biggest strengths? (2–3 sentences) <span className="text-red-400">*</span>
              </label>
              <textarea
                {...bind('strengths')}
                rows={4}
                placeholder='Be specific: e.g., “Strong with React performance and reusable components. Confident building REST APIs and debugging across the stack.”'
                className={`mt-1 w-full bg-gray-900 border rounded px-3 py-2 ${strengthsValid ? 'border-gray-700' : 'border-red-500/60'}`}
                required
              />
              <div className="flex items-center justify-between mt-1">
                <span className={`text-xs ${strengthsValid ? 'text-gray-500' : 'text-red-400'}`}>
                  {strengthsValid ? 'Looks good.' : 'Please write ~2–3 sentences (≥ ~40 chars) with specific strengths.'}
                </span>
                <span className="text-xs text-gray-500">{form.strengths.trim().length} chars • {countSentences(form.strengths)} sentences</span>
              </div>
            </div>

            {/* Challenges */}
            <div>
              <label className="text-sm text-gray-400">
                What are your biggest challenges? (2–3 sentences) <span className="text-red-400">*</span>
              </label>
              <textarea
                {...bind('challenges')}
                rows={4}
                placeholder='Be specific: e.g., “Struggle with DP patterns (knapsack, subsequences), miss graph edge cases, and want to improve tradeoff explanations in system design.”'
                className={`mt-1 w-full bg-gray-900 border rounded px-3 py-2 ${challengesValid ? 'border-gray-700' : 'border-red-500/60'}`}
                required
              />
              <div className="flex items-center justify-between mt-1">
                <span className={`text-xs ${challengesValid ? 'text-gray-500' : 'text-red-400'}`}>
                  {challengesValid ? 'Looks good.' : 'Please write ~2–3 sentences (≥ ~40 chars) with specific struggles.'}
                </span>
                <span className="text-xs text-gray-500">{form.challenges.trim().length} chars • {countSentences(form.challenges)} sentences</span>
              </div>
            </div>
          </section>
        )}

        {step === 3 && (
          <section className="space-y-4">
            <h2 className="text-xl font-bold">Review</h2>
            <SummaryRow label="Name" value={form.fullName} />
            <SummaryRow label="Role" value={form.role} />
            <SummaryRow label="Experience" value={form.experience} />
            <SummaryRow label="Focus Areas" value={form.focus.join(', ')} />
            <SummaryRow label="Strengths" value={form.strengths} />
            <SummaryRow label="Challenges" value={form.challenges} />
          </section>
        )}

        {err && <p className="text-sm text-red-500">{err}</p>}

        <div className="flex items-center justify-between gap-3 pt-2">
          <button
            type="button"
            onClick={back}
            disabled={step === 0}
            className="px-4 py-2 border border-gray-700 rounded disabled:opacity-50"
          >
            Back
          </button>

          {step < 3 ? (
            <button
              type="button"
              onClick={next}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded"
            >
              Next
            </button>
          ) : (
            <button
              type="button"
              onClick={submit}
              disabled={loading}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded disabled:opacity-70"
            >
              {loading ? 'Saving…' : 'Finish'}
            </button>
          )}
        </div>
      </div>
    </main>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded p-3">
      <div className="text-xs text-gray-400">{label}</div>
      <div className="whitespace-pre-wrap">{value || '—'}</div>
    </div>
  );
}