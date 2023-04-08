export const Heading = {
  H1: ({ children }: { children?: React.ReactNode }) => (
    <h1 className="text-3xl font-bold">{children}</h1>
  ),
  H2: ({ children }: { children?: React.ReactNode }) => (
    <h2 className="text-2xl font-bold">{children}</h2>
  ),
  H3: ({ children }: { children?: React.ReactNode }) => (
    <h3 className="text-xl font-bold">{children}</h3>
  ),
  H4: ({ children }: { children?: React.ReactNode }) => (
    <h4 className="text-lg font-bold">{children}</h4>
  ),
  H5: ({ children }: { children?: React.ReactNode }) => (
    <h5 className="text-base font-bold">{children}</h5>
  ),
  H6: ({ children }: { children?: React.ReactNode }) => (
    <h6 className="text-sm font-bold">{children}</h6>
  ),
};
