import { NextResponse } from 'next/server';
import { runQuery, DatabaseUnavailableError, ConfigError } from '@/lib/neo4j';

export async function GET() {
  const cypher = `
    MATCH (d:Department)
    OPTIONAL MATCH (c:Course)-[:BELONGS_TO]->(d)
    RETURN d.name AS department, count(c) AS courseCount
    ORDER BY d.name
  `;
  try {
    const records = await runQuery(cypher);
    return NextResponse.json({
      departments: records.map((r) => ({
        name: r.department,
        courseCount: r.courseCount?.toNumber ? r.courseCount.toNumber() : r.courseCount,
      })),
      levels: [100, 200, 300, 400],
    });
  } catch (err) {
    if (err instanceof DatabaseUnavailableError || err instanceof ConfigError) {
      return NextResponse.json({ error: err.message }, { status: 503 });
    }
    return NextResponse.json({ error: 'Unexpected error loading filters.' }, { status: 500 });
  }
}
