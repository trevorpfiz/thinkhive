import clsx from 'clsx';

export default function VisibilityBadge({ visibility }: { visibility: string | undefined }) {
  const badgeClasses = clsx(
    'inline-flex',
    'items-center',
    'rounded-full',
    'px-3',
    'py-0.5',
    'text-sm',
    'font-medium',
    {
      'bg-blue-100': visibility === 'PUBLIC',
      'bg-slate-200': visibility === 'PRIVATE',
    },
    {
      'text-blue-800': visibility === 'PUBLIC',
      'text-slate-800': visibility === 'PRIVATE',
    }
  );

  if (!visibility) {
    return null;
  }

  return <span className={badgeClasses}>{visibility === 'PUBLIC' ? 'Public' : 'Private'}</span>;
}
