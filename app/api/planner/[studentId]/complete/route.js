import { NextResponse } from 'next/server';
import { runQuery, DatabaseUnavailableError, ConfigError } from '@/lib/neo4j';

export async function POST(request, { params }) {
  const { studentId } = await params;
  const body = await request.json().catch(() => ({}));
  const { code, grade } = body;

  if (!code) {
    return NextResponse.json({ error: 'A course code is required.' }, { status: 400 });
  }

  const cypher = `
    MATCH (s:Student {studentId: $studentId}), (c:Course {code: $code})
    MERGE (s)-[r:COMPLETED]->(c)
    SET r.grade = $grade, r.term = coalesce(r.term, 'Current Term')
    RETURN s.studentId AS studentId, c.code AS code
  `;

  try {
    const records = await runQuery(cypher, { studentId, code, grade: grade || 'P' });
    if (records.length === 0) {
      return NextResponse.json({ error: 'Student or course not found.' }, { status: 404 });
    }
    return NextResponse.json({ ok: true });
  } catch (err) {
    if (err instanceof DatabaseUnavailableError || err instanceof ConfigError) {
      return NextResponse.json({ error: err.message }, { status: 503 });
    }
    return NextResponse.json({ error: 'Unexpected error updating progress.' }, { status: 500 });
  }
}
