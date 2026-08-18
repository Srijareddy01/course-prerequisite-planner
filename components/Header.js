'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const links = [
  { href: '/', label: 'Catalog' },
  { href: '/planner', label: 'Planner' },
];

export default function Header() {
  const pathname = usePathname();

  return (
    <header className="border-b border-brass/15">
      <div className="max-w-6xl mx-auto px-6 py-6 flex items-end justify-between">
        <Link href="/" className="group">
          <div className="eyebrow mb-1">Bulletin · Academic Graph</div>
          <div className="font-display text-3xl tracking-tight">
            Course<span className="text-brass italic">graph</span>
          </div>
        </Link>
        <nav className="flex items-center gap-1">
          {links.map((link) => {
            const active = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`px-4 py-2 text-sm font-body rounded-sm ${
                  active
                    ? 'bg-brass/15 text-brass-light border border-brass/40'
                    : 'text-parchment/70 hover:text-parchment border border-transparent'
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
