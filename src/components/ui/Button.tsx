import { cva, type VariantProps } from 'class-variance-authority';
import Link from 'next/link';
import type { AnchorHTMLAttributes, ButtonHTMLAttributes } from 'react';

const button = cva(
  'group inline-flex items-center justify-center rounded-full focus:outline-none',
  {
    variants: {
      intent: {
        solidSlate:
          'font-semibold focus-visible:outline-2 focus-visible:outline-offset-2 bg-slate-900 text-white hover:bg-slate-700 hover:text-slate-100 active:bg-slate-800 active:text-slate-300 focus-visible:outline-slate-900',
        solidBlue:
          'font-semibold focus-visible:outline-2 focus-visible:outline-offset-2 bg-blue-600 text-white hover:text-slate-100 hover:bg-blue-500 active:bg-blue-800 active:text-blue-100 focus-visible:outline-blue-600',
        solidWhite:
          'font-semibold focus-visible:outline-2 focus-visible:outline-offset-2 bg-white text-slate-900 hover:bg-blue-50 active:bg-blue-200 active:text-slate-600 focus-visible:outline-white',

        outlineSlate:
          'ring-1 ring-slate-200 text-slate-700 hover:text-slate-900 hover:ring-slate-300 active:bg-slate-100 active:text-slate-600 focus-visible:outline-blue-600 focus-visible:ring-slate-300',
        outlineWhite:
          'ring-1 ring-slate-700 text-white hover:ring-slate-500 active:ring-slate-700 active:text-slate-400 focus-visible:outline-white',
      },
      size: {
        small: ['text-sm', 'py-1', 'px-2'],
        medium: ['text-sm', 'py-2', 'px-4'],
        large: ['text-base', 'py-3', 'px-6'],
        xl: ['text-base', 'py-4', 'px-8'],
      },
    },
    defaultVariants: {
      intent: 'solidSlate',
      size: 'medium',
    },
  }
);

type ButtonBaseProps = VariantProps<typeof button> & {
  children: React.ReactNode;
};

interface ButtonAsAnchorProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  href: string;
}

interface ButtonAsButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  href?: never;
}

export type ButtonProps = ButtonBaseProps & (ButtonAsAnchorProps | ButtonAsButtonProps);

export type ButtonIntent = ButtonProps['intent'];

export default function Button({ children, intent, size, ...props }: ButtonProps) {
  const classes = button({ intent, size, className: props.className });

  if ('href' in props && props.href !== undefined) {
    return (
      <Link {...props} className={classes}>
        {children}
      </Link>
    );
  }

  return (
    <button {...props} className={classes}>
      {children}
    </button>
  );
}
