'use client';

import { useMemo } from 'react';
import Link from 'next/link';

const COL_W = 210;
const ROW_H = 62;
const NODE_W = 168;
const NODE_H = 40;
const PAD = 24;

/**
 * Renders the multi-hop REQUIRES chain returned by /api/courses/[code]/chain
 * as a leveled schematic: the target course sits at depth 0 on the left,
 * and each column to the right is one prerequisite hop further back.
 */
export default function PrereqTree({ target, nodes, edges }) {
  const { columns, positioned, paths, width, height } = useMemo(() => {
    if (!nodes || nodes.length === 0) {
      return { columns: [], positioned: new Map(), paths: [], width: 0, height: 0 };
    }

    // BFS depth from target along edges (from -> to means "from requires to")
    const children = new Map(); // code -> [prereq codes]
    edges.forEach((e) => {
      if (!children.has(e.from)) children.set(e.from, []);
      children.get(e.from).push(e.to);
    });

    const depth = new Map([[target, 0]]);
    const queue = [target];
    while (queue.length) {
      const cur = queue.shift();
      const kids = children.get(cur) || [];
      for (const k of kids) {
        const d = depth.get(cur) + 1;
        if (!depth.has(k) || d < depth.get(k)) {
          depth.set(k, d);
          queue.push(k);
        }
      }
    }

    const maxDepth = Math.max(...Array.from(depth.values()));
    const columns = Array.from({ length: maxDepth + 1 }, () => []);
    nodes.forEach((n) => {
      const d = depth.has(n.code) ? depth.get(n.code) : maxDepth;
      columns[d].push(n);
    });
    columns.forEach((col) => col.sort((a, b) => a.code.localeCompare(b.code)));

    const positioned = new Map();
    columns.forEach((col, colIdx) => {
      col.forEach((n, rowIdx) => {
        positioned.set(n.code, {
          x: PAD + colIdx * COL_W,
          y: PAD + rowIdx * ROW_H,
          ...n,
        });
      });
    });

    const paths = edges
      .map((e) => {
        const from = positioned.get(e.from);
        const to = positioned.get(e.to);
        if (!from || !to) return null;
        const x1 = from.x + NODE_W;
        const y1 = from.y + NODE_H / 2;
        const x2 = to.x;
        const y2 = to.y + NODE_H / 2;
        const midX = (x1 + x2) / 2;
        return { key: `${e.from}-${e.to}`, d: `M ${x1} ${y1} C ${midX} ${y1}, ${midX} ${y2}, ${x2} ${y2}` };
      })
      .filter(Boolean);

    const maxRows = Math.max(...columns.map((c) => c.length), 1);
    const width = PAD * 2 + (maxDepth + 1) * COL_W - (COL_W - NODE_W);
    const height = PAD * 2 + maxRows * ROW_H - (ROW_H - NODE_H);

    return { columns, positioned, paths, width, height };
  }, [target, nodes, edges]);

  if (!nodes || nodes.length <= 1) {
    return (
      <p className="text-parchment/60 text-sm italic">
        No prerequisites — this course has an open door.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto">
      <div className="flex gap-0 mb-2 pl-6" style={{ width }}>
        {columns.map((_, i) => (
          <div key={i} className="eyebrow" style={{ width: COL_W, flexShrink: 0 }}>
            {i === 0 ? 'this course' : `${i} hop${i > 1 ? 's' : ''} back`}
          </div>
        ))}
      </div>
      <svg width={Math.max(width, 400)} height={Math.max(height, 100)} className="min-w-full">
        <g>
          {paths.map((p) => (
            <path key={p.key} d={p.d} fill="none" stroke="#C9A227" strokeOpacity="0.45" strokeWidth="1.5" />
          ))}
        </g>
        <g>
          {Array.from(positioned.values()).map((n) => {
            const isTarget = n.code === target;
            return (
              <g key={n.code} transform={`translate(${n.x}, ${n.y})`}>
                <rect
                  width={NODE_W}
                  height={NODE_H}
                  rx="3"
                  fill={isTarget ? '#C9A227' : '#1C2540'}
                  stroke={isTarget ? '#C9A227' : '#C9A227'}
                  strokeOpacity={isTarget ? '1' : '0.35'}
                />
                <foreignObject width={NODE_W} height={NODE_H}>
                  <Link
                    href={`/courses/${n.code}`}
                    className={`flex flex-col justify-center h-full px-3 ${
                      isTarget ? 'text-ink' : 'text-parchment hover:text-brass-light'
                    }`}
                  >
                    <span className="font-mono text-[11px] leading-tight">{n.code}</span>
                    <span className="text-[11px] leading-tight truncate">{n.title}</span>
                  </Link>
                </foreignObject>
              </g>
            );
          })}
        </g>
      </svg>
    </div>
  );
}
