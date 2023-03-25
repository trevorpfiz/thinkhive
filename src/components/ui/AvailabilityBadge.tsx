import clsx from 'clsx';

export default function AvailabilityBadge({ availability }: { availability: string | undefined }) {
  const badgeClasses = clsx(
    'inline-flex',
    'items-center',
    'rounded-full',
    'px-3',
    'py-0.5',
    'text-sm',
    'font-medium',
    {
      'bg-blue-100': availability === 'PUBLIC',
      'bg-slate-200': availability === 'PRIVATE',
    },
    {
      'text-blue-800': availability === 'PUBLIC',
      'text-slate-800': availability === 'PRIVATE',
    }
  );

  if (!availability) {
    return null;
  }

  return <span className={badgeClasses}>{availability === 'PUBLIC' ? 'Public' : 'Private'}</span>;
}
