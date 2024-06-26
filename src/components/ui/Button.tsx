import Link from 'next/link';
import { cva } from 'class-variance-authority';

import type { VariantProps } from 'class-variance-authority';
import type { AnchorHTMLAttributes, ButtonHTMLAttributes } from 'react';

const button = cva(
  'group inline-flex items-center justify-center rounded-full focus:outline-none, disabled:cursor-not-allowed disabled:opacity-30',
  {
    variants: {
      intent: {
        solidSlate:
          'font-semibold focus-visible:outline-2 focus-visible:outline-offset-2 bg-slate-900 text-white hover:bg-slate-700 hover:text-slate-100 active:bg-slate-800 active:text-slate-300 focus-visible:outline-slate-900',
        solidBlue:
          'font-semibold focus-visible:outline-2 focus-visible:outline-offset-2 bg-blue-600 text-white hover:text-slate-100 hover:bg-blue-500 active:bg-blue-800 active:text-blue-100 focus-visible:outline-blue-600',
        solidWhite:
          'font-semibold focus-visible:outline-2 focus-visible:outline-offset-2 bg-white text-slate-900 hover:bg-blue-50 active:bg-blue-200 active:text-slate-600 focus-visible:outline-white',
        solidRed:
          'font-semibold focus-visible:outline-2 focus-visible:outline-offset-2 bg-red-600 text-white hover:text-slate-100 hover:bg-red-500 active:bg-red-800 active:text-red-100 focus-visible:outline-red-600',
        solidGreen:
          'font-semibold focus-visible:outline-2 focus-visible:outline-offset-2 bg-green-600 text-white hover:text-slate-100 hover:bg-green-500 active:bg-green-800 active:text-green-100 focus-visible:outline-green-600',
        solidIndigo:
          'font-semibold focus-visible:outline-2 focus-visible:outline-offset-2 bg-indigo-600 text-white hover:text-slate-100 hover:bg-indigo-500 active:bg-indigo-800 active:text-indigo-100 focus-visible:outline-indigo-600 dis',

        outlineSlate:
          'ring-1 ring-slate-200 text-slate-700 hover:text-slate-900 hover:ring-slate-300 active:bg-slate-100 active:text-slate-600 focus-visible:outline-blue-600 focus-visible:ring-slate-300',
        outlineWhite:
          'ring-1 ring-slate-700 text-white hover:ring-slate-500 active:ring-slate-700 active:text-slate-400 focus-visible:outline-white',
        outlineRed:
          'ring-1 ring-red-200 text-red-700 hover:text-red-900 hover:ring-red-300 active:bg-red-100 active:text-red-600 focus-visible:outline-blue-600 focus-visible:ring-red-300',
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
