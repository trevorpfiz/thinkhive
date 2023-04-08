export const Content = {
  P: ({ children }: { children?: React.ReactNode }) => (
    <p className="mt-4 text-lg tracking-tight text-slate-700">{children}</p>
  ),
  A: ({ children, href, ...props }: { children?: React.ReactNode; href?: string }) => (
    <a
      href={href}
      {...props}
      className="underline decoration-indigo-500 decoration-2 underline-offset-[3px] hover:decoration-indigo-700 hover:decoration-[3px]"
    >
      {children}
    </a>
  ),
};
