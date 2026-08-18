import Link from 'next/link';

export default function CourseCard({ course, badge, action }) {
  return (
    <div className="ledger-card p-4 flex flex-col gap-2 hover:border-brass/40 transition-colors">
      <div className="flex items-start justify-between gap-3">
        <div>
          <Link href={`/courses/${course.code}`} className="font-mono text-xs text-brass tracking-wide">
            {course.code}
          </Link>
          <Link href={`/courses/${course.code}`}>
            <h3 className="font-display text-lg leading-snug mt-0.5 hover:text-brass-light">
              {course.title}
            </h3>
          </Link>
        </div>
        {badge}
      </div>
      <div className="flex flex-wrap gap-2 text-xs text-parchment/60">
        {course.department && <span>{course.department}</span>}
        {course.credits != null && <span>· {course.credits} credits</span>}
        {course.level != null && <span>· Level {course.level}</span>}
      </div>
      {action}
    </div>
  );
}
