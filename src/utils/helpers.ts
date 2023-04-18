// Stripe
export const toDateTime = (secs: number) => {
  const t = new Date('1970-01-01T00:30:00Z'); // Unix epoch start.
  t.setSeconds(secs);
  return t;
};

// widget
export const isMobile = () => window.innerWidth <= 600;
export const isTablet = () => window.innerWidth > 600 && window.innerWidth < 768;
export const isDesktop = () => window.innerWidth >= 768;
export const isPortraitMode = () => window.innerHeight > window.innerWidth;
