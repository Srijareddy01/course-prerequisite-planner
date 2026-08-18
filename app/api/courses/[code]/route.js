import { NextResponse } from 'next/server';
import { runQuery, DatabaseUnavailableError, ConfigError } from '@/lib/neo4j';

export async function GET(request, { params }) {
  const { code } = await params;

  const cypher = `
    MATCH (c:Course {code: $code})-[:BELONGS_TO]->(d:Department)
    OPTIONAL MATCH (c)-[:REQUIRES]->(prereq:Course)
    OPTIONAL MATCH (dependent:Course)-[:REQUIRES]->(c)
    OPTIONAL MATCH (c)-[:COVERS]->(t:Topic)
    OPTIONAL MATCH (i:Instructor)-[:TEACHES]->(c)
    RETURN c.code AS code, c.title AS title, c.credits AS credits, c.level AS level,
           c.description AS description, d.name AS department,
           collect(DISTINCT {code: prereq.code, title: prereq.title}) AS prereqs,
           collect(DISTINCT {code: dependent.code, title: dependent.title}) AS dependents,
           collect(DISTINCT t.name) AS topics,
           collect(DISTINCT i.name) AS instructors
  `;

  try {
    const records = await runQuery(cypher, { code });
    if (records.length === 0) {
      return NextResponse.json({ error: 'Course not found.' }, { status: 404 });
    }
    const r = records[0];
    return NextResponse.json({
      code: r.code,
      title: r.title,
      credits: r.credits?.toNumber ? r.credits.toNumber() : r.credits,
      level: r.level?.toNumber ? r.level.toNumber() : r.level,
      description: r.description,
      department: r.department,
      prereqs: r.prereqs.filter((p) => p.code),
      dependents: r.dependents.filter((d) => d.code),
      topics: r.topics.filter(Boolean),
      instructors: r.instructors.filter(Boolean),
    });
  } catch (err) {
    if (err instanceof DatabaseUnavailableError || err instanceof ConfigError) {
      return NextResponse.json({ error: err.message }, { status: 503 });
    }
    return NextResponse.json({ error: 'Unexpected error loading course.' }, { status: 500 });
  }
}
