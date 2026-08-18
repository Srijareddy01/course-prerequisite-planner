"use client";

import { useEffect, useState, useCallback } from "react";
import CourseCard from "@/components/CourseCard";
import EmptyState from "@/components/EmptyState";
import LoadingSkeleton from "@/components/LoadingSkeleton";
import ErrorState from "@/components/ErrorState";

export default function PlannerPage() {
  const [students, setStudents] = useState([]);
  const [studentId, setStudentId] = useState("");
  const [plan, setPlan] = useState(null);
  const [status, setStatus] = useState("loading");
  const [errorMsg, setErrorMsg] = useState("");
  const [marking, setMarking] = useState("");

  useEffect(() => {
    fetch("/api/planner/students")
      .then((r) => r.json())
      .then((d) => {
        setStudents(d.students || []);
        if (d.students?.length) setStudentId(d.students[0].studentId);
      })
      .catch(() => {});
  }, []);

  const loadPlan = useCallback((id) => {
    if (!id) return;
    setStatus("loading");
    fetch(`/api/planner/${id}`)
      .then(async (r) => {
        const d = await r.json();
        if (!r.ok) throw new Error(d.error);
        setPlan(d);
        setStatus("ready");
      })
      .catch((err) => {
        setStatus("error");
        setErrorMsg(err.message);
      });
  }, []);

  useEffect(() => {
    loadPlan(studentId);
  }, [studentId, loadPlan]);

  const markComplete = async (code) => {
    setMarking(code);
    try {
      const res = await fetch(`/api/planner/${studentId}/complete`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, grade: "A" }),
      });
      if (!res.ok) throw new Error((await res.json()).error);
      await loadPlan(studentId);
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setMarking("");
    }
  };

  return (
    <div className="pt-10">
      <p className="eyebrow mb-3">
        Vol. 2 · One student, their whole path forward
      </p>
      <h1 className="font-display text-4xl md:text-5xl leading-tight max-w-2xl mb-3">
        What can this student take next?
      </h1>
      <p className="text-parchment/60 max-w-xl mb-8">
        Eligibility here isn&apos;t a lookup table — it&apos;s computed live
        from what the student has completed and what each course still requires.
      </p>

      <div className="mb-8">
        <label className="eyebrow block mb-2">Student</label>
        <select
          className="field min-w-[280px]"
          value={studentId}
          onChange={(e) => setStudentId(e.target.value)}
        >
          {students.map((s) => (
            <option key={s.studentId} value={s.studentId}>
              {s.name} — Year {s.year}, {s.major} ({s.completedCount} completed)
            </option>
          ))}
        </select>
      </div>

      {status === "loading" && <LoadingSkeleton rows={4} />}
      {status === "error" && <ErrorState message={errorMsg} />}

      {status === "ready" && plan && (
        <div className="space-y-12">
          <section>
            <p className="eyebrow mb-3">Completed ({plan.completed.length})</p>
            {plan.completed.length === 0 ? (
              <EmptyState title="No courses completed yet" />
            ) : (
              <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {plan.completed.map((c) => (
                  <div
                    key={c.code}
                    className="ledger-card px-4 py-3 flex items-center justify-between"
                  >
                    <div>
                      <span className="font-mono text-brass text-xs mr-2">
                        {c.code}
                      </span>
                      <span className="text-sm">{c.title}</span>
                    </div>
                    <span className="pill border-teal/40 text-teal-light">
                      {c.grade}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </section>

          <section>
            <p className="eyebrow mb-3">
              Eligible now ({plan.eligible.length})
            </p>
            <p className="text-parchment/50 text-sm mb-4 -mt-2">
              Every direct prerequisite for these is already satisfied.
            </p>
            {plan.eligible.length === 0 ? (
              <EmptyState
                title="Nothing eligible right now"
                description="This student needs to complete more prerequisites first."
              />
            ) : (
              <div className="grid gap-3 sm:grid-cols-2">
                {plan.eligible.map((c) => (
                  <CourseCard
                    key={c.code}
                    course={c}
                    action={
                      <button
                        className="btn-secondary mt-1 self-start"
                        disabled={marking === c.code}
                        onClick={() => markComplete(c.code)}
                      >
                        {marking === c.code ? "Marking…" : "Mark completed"}
                      </button>
                    }
                  />
                ))}
              </div>
            )}
          </section>

          <section>
            <p className="eyebrow mb-3">Recommended by topic overlap</p>
            <p className="text-parchment/50 text-sm mb-4 -mt-2">
              Courses that share the most subject matter with what this student
              has already taken.
            </p>
            {plan.recommended.length === 0 ? (
              <EmptyState
                title="No recommendations yet"
                description="Complete a few courses to see suggestions."
              />
            ) : (
              <div className="grid gap-3 sm:grid-cols-2">
                {plan.recommended.map((c) => (
                  <CourseCard
                    key={c.code}
                    course={c}
                    badge={
                      <span className="pill border-brass/40 text-brass-light">
                        {c.overlap} shared topic{c.overlap === 1 ? "" : "s"}
                      </span>
                    }
                    action={
                      <p className="text-xs text-parchment/50">
                        {c.sharedTopics.join(", ")}
                      </p>
                    }
                  />
                ))}
              </div>
            )}
          </section>
        </div>
      )}
    </div>
  );
}
