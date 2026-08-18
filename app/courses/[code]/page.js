'use client';

import { useEffect, useState, use } from 'react';
import Link from 'next/link';
import PrereqTree from '@/components/PrereqTree';
import ErrorState from '@/components/ErrorState';

export default function CourseDetailPage({ params }) {
  const { code } = use(params);
  const [course, setCourse] = useState(null);
  const [chain, setChain] = useState(null);
  const [status, setStatus] = useState('loading');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    setStatus('loading');
    Promise.all([
      fetch(`/api/courses/${code}`).then(async (r) => {
        const d = await r.json();
        if (!r.ok) throw new Error(d.error);
        return d;
      }),
      fetch(`/api/courses/${code}/chain`).then(async (r) => {
        const d = await r.json();
        if (!r.ok) throw new Error(d.error);
        return d;
      }),
    ])
      .then(([courseData, chainData]) => {
        setCourse(courseData);
        setChain(chainData);
        setStatus('ready');
      })
      .catch((err) => {
        setStatus('error');
        setErrorMsg(err.message);
      });
  }, [code]);

  if (status === 'loading') {
    return (
      <div className="pt-10 animate-pulse">
        <div className="h-3 w-20 bg-brass/20 rounded mb-4" />
        <div className="h-10 w-2/3 bg-parchment/10 rounded mb-6" />
        <div className="h-32 bg-parchment/5 rounded" />
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="pt-10">
        <ErrorState message={errorMsg} />
      </div>
    );
  }

  return (
    <div className="pt-10">
      <Link href="/" className="eyebrow hover:text-brass-light">← Back to catalog</Link>

      <div className="mt-4 mb-8">
        <div className="flex flex-wrap items-baseline gap-3">
          <span className="font-mono text-brass text-sm">{course.code}</span>
          <span className="text-parchment/40 text-sm">{course.department} · Level {course.level} · {course.credits} credits</span>
        </div>
        <h1 className="font-display text-4xl mt-2 max-w-2xl">{course.title}</h1>
        <p className="text-parchment/70 mt-3 max-w-2xl leading-relaxed">{course.description}</p>
      </div>

      <div className="grid md:grid-cols-3 gap-6 mb-10">
        <div className="ledger-card p-4">
          <p className="eyebrow mb-2">Taught by</p>
          {course.instructors.length ? (
            course.instructors.map((i) => <p key={i} className="text-sm">{i}</p>)
          ) : (
            <p className="text-sm text-parchment/50">Staff</p>
          )}
        </div>
        <div className="ledger-card p-4">
          <p className="eyebrow mb-2">Topics covered</p>
          <div className="flex flex-wrap gap-1.5">
            {course.topics.map((t) => (
              <span key={t} className="pill border-teal/40 text-teal-light">{t}</span>
            ))}
          </div>
        </div>
        <div className="ledger-card p-4">
          <p className="eyebrow mb-2">Direct prerequisites</p>
          {course.prereqs.length ? (
            course.prereqs.map((p) => (
              <Link key={p.code} href={`/courses/${p.code}`} className="block text-sm hover:text-brass-light">
                {p.code} — {p.title}
              </Link>
            ))
          ) : (
            <p className="text-sm text-parchment/50">None — open enrollment.</p>
          )}
        </div>
      </div>

      <div className="mb-10">
        <p className="eyebrow mb-3">Full prerequisite chain, traced hop by hop</p>
        <div className="ledger-card p-6">
          <PrereqTree target={chain.target} nodes={chain.nodes} edges={chain.edges} />
        </div>
      </div>

      {course.dependents.length > 0 && (
        <div>
          <p className="eyebrow mb-3">Courses that build on this one</p>
          <div className="grid gap-2 sm:grid-cols-2">
            {course.dependents.map((d) => (
              <Link
                key={d.code}
                href={`/courses/${d.code}`}
                className="ledger-card px-4 py-3 text-sm hover:border-brass/40"
              >
                <span className="font-mono text-brass text-xs mr-2">{d.code}</span>
                {d.title}
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
