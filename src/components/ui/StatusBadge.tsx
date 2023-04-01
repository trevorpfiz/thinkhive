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
      'bg-blue-100': status === 'TRIAL',
    },
    {
      'text-green-800': status === 'ACTIVE',
      'text-red-800': status === 'INACTIVE',
      'text-black': status === 'TRIAL',
    }
  );

  if (!status) {
    return null;
  }

  const statusText = status ? status.charAt(0).toUpperCase() + status.slice(1).toLowerCase() : '';

  return <span className={badgeClasses}>{statusText}</span>;
}
