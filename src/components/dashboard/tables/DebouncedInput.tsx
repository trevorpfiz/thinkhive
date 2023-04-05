import { MagnifyingGlassIcon } from '@heroicons/react/20/solid';
import React from 'react';

// A debounced input react component
export default function DebouncedInput({
  value: initialValue,
  onChange,
  debounce = 500,
  ...props
}: {
  value: string | number;
  onChange: (value: string | number) => void;
  debounce?: number;
} & Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'>) {
  const [value, setValue] = React.useState(initialValue);

  React.useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  React.useEffect(() => {
    const timeout = setTimeout(() => {
      onChange(value);
    }, debounce);

    return () => clearTimeout(timeout);
  }, [value]);

  return (
    <div className="relative">
      <MagnifyingGlassIcon className="absolute inset-y-0 left-0 my-auto ml-2 h-5 w-5 text-gray-400" />
      <input {...props} value={value} onChange={(e) => setValue(e.target.value)} />
    </div>
  );
}
