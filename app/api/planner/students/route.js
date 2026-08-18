import { NextResponse } from 'next/server';
import { runQuery, DatabaseUnavailableError, ConfigError } from '@/lib/neo4j';

export async function GET() {
  const cypher = `
    MATCH (s:Student)
    OPTIONAL MATCH (s)-[:COMPLETED]->(c:Course)
    RETURN s.studentId AS studentId, s.name AS name, s.year AS year, s.major AS major,
           count(c) AS completedCount
    ORDER BY s.name
  `;

  try {
    const records = await runQuery(cypher);
    const students = records.map((r) => ({
      studentId: r.studentId,
      name: r.name,
      year: r.year?.toNumber ? r.year.toNumber() : r.year,
      major: r.major,
      completedCount: r.completedCount?.toNumber ? r.completedCount.toNumber() : r.completedCount,
    }));
    return NextResponse.json({ students });
  } catch (err) {
    if (err instanceof DatabaseUnavailableError || err instanceof ConfigError) {
      return NextResponse.json({ error: err.message }, { status: 503 });
    }
    return NextResponse.json({ error: 'Unexpected error loading students.' }, { status: 500 });
  }
}
