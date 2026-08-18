'use client';

import { useEffect, useState } from 'react';
import CourseCard from '@/components/CourseCard';
import EmptyState from '@/components/EmptyState';
import LoadingSkeleton from '@/components/LoadingSkeleton';
import ErrorState from '@/components/ErrorState';

export default function CatalogPage() {
  const [search, setSearch] = useState('');
  const [dept, setDept] = useState('');
  const [level, setLevel] = useState('');
  const [meta, setMeta] = useState({ departments: [], levels: [] });
  const [courses, setCourses] = useState([]);
  const [status, setStatus] = useState('loading'); // loading | ready | error
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    fetch('/api/meta')
      .then((r) => r.json())
      .then((d) => setMeta(d))
      .catch(() => {});
  }, []);

  useEffect(() => {
    const params = new URLSearchParams({ search, dept, level });
    setStatus('loading');
    fetch(`/api/courses?${params}`)
      .then(async (r) => {
        const data = await r.json();
        if (!r.ok) throw new Error(data.error);
        setCourses(data.courses);
        setStatus('ready');
      })
      .catch((err) => {
        setStatus('error');
        setCourses([]);
        setErrorMsg(err.message);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, dept, level]);

  return (
    <div className="pt-10">
      <div className="mb-10">
        <p className="eyebrow mb-3">Vol. 1 · Every course, and what it stands on</p>
        <h1 className="font-display text-4xl md:text-5xl leading-tight max-w-2xl">
          Browse the catalog as a graph, not a spreadsheet.
        </h1>
        <p className="text-parchment/60 mt-3 max-w-xl">
          Each course here is a node. Prerequisites are relationships you can walk, hop by hop —
          search below, or open a course to see its full chain.
        </p>
      </div>

      <div className="flex flex-wrap gap-3 mb-8">
        <input
          className="field flex-1 min-w-[220px]"
          placeholder="Search by title or code (e.g. CS330, Machine Learning)"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select className="field" value={dept} onChange={(e) => setDept(e.target.value)}>
          <option value="">All departments</option>
          {meta.departments.map((d) => (
            <option key={d.name} value={d.name}>
              {d.name} ({d.courseCount})
            </option>
          ))}
        </select>
        <select className="field" value={level} onChange={(e) => setLevel(e.target.value)}>
          <option value="">All levels</option>
          {meta.levels.map((l) => (
            <option key={l} value={l}>
              {l}-level
            </option>
          ))}
        </select>
      </div>

      {status === 'loading' && <LoadingSkeleton rows={8} />}

      {status === 'error' && <ErrorState message={errorMsg} />}

      {status === 'ready' && courses.length === 0 && (
        <EmptyState
          title="No courses match that search"
          description="Try a different keyword, or clear the department and level filters."
        />
      )}

      {status === 'ready' && courses.length > 0 && (
        <div className="grid gap-3 sm:grid-cols-2">
          {courses.map((c) => (
            <CourseCard key={c.code} course={c} />
          ))}
        </div>
      )}
    </div>
  );
}
