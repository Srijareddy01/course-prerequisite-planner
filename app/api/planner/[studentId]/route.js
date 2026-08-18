import { NextResponse } from "next/server";
import { runQuery, DatabaseUnavailableError, ConfigError } from "@/lib/neo4j";

const toNum = (v) => (v && v.toNumber ? v.toNumber() : v);

export async function GET(request, { params }) {
  const { studentId } = await params;

  const studentCypher = `
    MATCH (s:Student {studentId: $studentId})
    RETURN s.studentId AS studentId, s.name AS name, s.year AS year, s.major AS major
  `;

  const completedCypher = `
    MATCH (s:Student {studentId: $studentId})-[r:COMPLETED]->(c:Course)
    RETURN c.code AS code, c.title AS title, c.credits AS credits, r.grade AS grade, r.term AS term
    ORDER BY r.term, c.code
  `;

  // "Eligible next" — every course the student hasn't taken whose full set
  // of direct prerequisites is already in their completed set. Expressing
  // "match ALL rows in a variable-size related set" like this is exactly
  // the kind of query a relational schema pushes into an awkward
  // self-join-and-count-having pattern; here it's a single ALL() predicate
  // over the pattern comprehension.
  //
  // Note: this collects completed course codes into a list and filters
  // with `NOT code IN list` rather than the more idiomatic
  // `WHERE NOT (s)-[:COMPLETED]->(c)`. On this CognoDB instance the
  // negated-pattern form silently matches everything instead of filtering
  // (confirmed via isolated queries against the live instance) — the
  // list-membership form is the one that returns correct results.
  const eligibleCypher = `
    MATCH (s:Student {studentId: $studentId})
    OPTIONAL MATCH (s)-[:COMPLETED]->(cc:Course)
    WITH s, collect(cc.code) AS completedCodes
    MATCH (c:Course)
    WHERE NOT c.code IN completedCodes
    WITH s, c, completedCodes, [(c)-[:REQUIRES]->(p) | p.code] AS prereqCodes
    WHERE ALL(pc IN prereqCodes WHERE pc IN completedCodes)
    MATCH (c)-[:BELONGS_TO]->(d:Department)
    RETURN c.code AS code, c.title AS title, c.credits AS credits, c.level AS level,
           d.name AS department, size(prereqCodes) AS prereqCount
    ORDER BY c.level, c.code
  `;

  // Recommended — courses the student hasn't taken that share the most
  // topics with courses they've already completed, ranked by overlap.
  // Same list-membership fix as above applied to the exclusion filter.
  const recommendCypher = `
    MATCH (s:Student {studentId: $studentId})
    OPTIONAL MATCH (s)-[:COMPLETED]->(cc:Course)
    WITH s, collect(cc.code) AS completedCodes
    MATCH (s)-[:COMPLETED]->(:Course)-[:COVERS]->(t:Topic)
    WITH s, completedCodes, collect(DISTINCT t.name) AS completedTopics
    MATCH (rec:Course)-[:COVERS]->(t2:Topic)
    WHERE NOT rec.code IN completedCodes AND t2.name IN completedTopics
    WITH rec, count(DISTINCT t2) AS overlap, collect(DISTINCT t2.name) AS sharedTopics
    MATCH (rec)-[:BELONGS_TO]->(d:Department)
    RETURN rec.code AS code, rec.title AS title, rec.level AS level, d.name AS department,
           overlap, sharedTopics
    ORDER BY overlap DESC, rec.code
    LIMIT 6
  `;

  try {
    const [studentRows, completedRows, eligibleRows, recommendRows] =
      await Promise.all([
        runQuery(studentCypher, { studentId }),
        runQuery(completedCypher, { studentId }),
        runQuery(eligibleCypher, { studentId }),
        runQuery(recommendCypher, { studentId }),
      ]);

    if (studentRows.length === 0) {
      return NextResponse.json(
        { error: "Student not found." },
        { status: 404 },
      );
    }

    const s = studentRows[0];
    return NextResponse.json({
      student: {
        studentId: s.studentId,
        name: s.name,
        year: toNum(s.year),
        major: s.major,
      },
      completed: completedRows.map((r) => ({
        code: r.code,
        title: r.title,
        credits: toNum(r.credits),
        grade: r.grade,
        term: r.term,
      })),
      eligible: eligibleRows.map((r) => ({
        code: r.code,
        title: r.title,
        credits: toNum(r.credits),
        level: toNum(r.level),
        department: r.department,
        prereqCount: toNum(r.prereqCount),
      })),
      recommended: recommendRows.map((r) => ({
        code: r.code,
        title: r.title,
        level: toNum(r.level),
        department: r.department,
        overlap: toNum(r.overlap),
        sharedTopics: r.sharedTopics,
      })),
    });
  } catch (err) {
    if (err instanceof DatabaseUnavailableError || err instanceof ConfigError) {
      return NextResponse.json({ error: err.message }, { status: 503 });
    }
    return NextResponse.json(
      { error: "Unexpected error loading the planner." },
      { status: 500 },
    );
  }
}
