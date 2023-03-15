import clsx from 'clsx';

export default function StatusBadge({ status }: { status: string | undefined }) {
  const badgeClasses = clsx(
    'inline-flex',
    'items-center',
    'rounded-full',
    'px-3',
    'py-0.5',
    'text-sm',
    'font-medium',
    {
      'bg-green-100': status === 'ACTIVE',
      'bg-red-100': status === 'INACTIVE',
    },
    {
      'text-green-800': status === 'ACTIVE',
      'text-red-800': status === 'INACTIVE',
    }
  );

  if (!status) {
    return null;
  }

  return <span className={badgeClasses}>{status === 'ACTIVE' ? 'Active' : 'Inactive'}</span>;
}
