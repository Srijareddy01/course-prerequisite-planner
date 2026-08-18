import { NextResponse } from 'next/server';
import { runQuery, DatabaseUnavailableError, ConfigError } from '@/lib/neo4j';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const search = (searchParams.get('search') || '').trim();
  const dept = searchParams.get('dept') || '';
  const level = searchParams.get('level') || '';

  const cypher = `
    MATCH (c:Course)-[:BELONGS_TO]->(d:Department)
    WHERE ($search = '' OR toLower(c.title) CONTAINS toLower($search) OR toLower(c.code) CONTAINS toLower($search))
      AND ($dept = '' OR d.name = $dept)
      AND ($level = '' OR c.level = toInteger($level))
    RETURN c.code AS code, c.title AS title, c.credits AS credits, c.level AS level, d.name AS department
    ORDER BY c.code
  `;

  try {
    const records = await runQuery(cypher, { search, dept, level });
    const courses = records.map((r) => ({
      code: r.code,
      title: r.title,
      credits: r.credits?.toNumber ? r.credits.toNumber() : r.credits,
      level: r.level?.toNumber ? r.level.toNumber() : r.level,
      department: r.department,
    }));
    return NextResponse.json({ courses });
  } catch (err) {
    if (err instanceof DatabaseUnavailableError || err instanceof ConfigError) {
      return NextResponse.json({ error: err.message }, { status: 503 });
    }
    return NextResponse.json({ error: 'Unexpected error loading courses.' }, { status: 500 });
  }
}
