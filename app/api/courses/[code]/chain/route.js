import { NextResponse } from 'next/server';
import { runQuery, DatabaseUnavailableError, ConfigError } from '@/lib/neo4j';

// Walks every REQUIRES path up to 6 hops deep from the target course and
// returns the distinct nodes and edges involved, so the UI can render the
// full "everything you need before this course" tree in one call. This is
// the kind of unbounded-depth traversal a relational schema would need a
// recursive CTE (and a lot of self-joins) to express.
export async function GET(request, { params }) {
  const { code } = await params;

  const cypher = `
    MATCH (target:Course {code: $code})
    OPTIONAL MATCH path = (target)-[:REQUIRES*1..6]->(ancestor:Course)
    WITH target, collect(path) AS paths
    RETURN target.code AS targetCode, target.title AS targetTitle, paths
  `;

  try {
    const records = await runQuery(cypher, { code });
    if (records.length === 0) {
      return NextResponse.json({ error: 'Course not found.' }, { status: 404 });
    }

    const nodesByCode = new Map();
    const edges = [];
    const r = records[0];
    nodesByCode.set(r.targetCode, { code: r.targetCode, title: r.targetTitle });

    for (const path of r.paths) {
      for (const segment of path.segments) {
        const start = segment.start.properties;
        const end = segment.end.properties;
        nodesByCode.set(start.code, { code: start.code, title: start.title });
        nodesByCode.set(end.code, { code: end.code, title: end.title });
        edges.push({ from: start.code, to: end.code });
      }
    }

    // De-duplicate edges
    const seen = new Set();
    const uniqueEdges = edges.filter((e) => {
      const key = `${e.from}->${e.to}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

    return NextResponse.json({
      target: r.targetCode,
      nodes: Array.from(nodesByCode.values()),
      edges: uniqueEdges,
    });
  } catch (err) {
    if (err instanceof DatabaseUnavailableError || err instanceof ConfigError) {
      return NextResponse.json({ error: err.message }, { status: 503 });
    }
    return NextResponse.json({ error: 'Unexpected error loading prerequisite chain.' }, { status: 500 });
  }
}
