/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import 'focus-visible';
import { Inter, Lexend } from 'next/font/google';
import { Analytics } from '@vercel/analytics/react';
import { Provider } from 'jotai';
import { type Session } from 'next-auth';
import { SessionProvider } from 'next-auth/react';
import { api } from '~/utils/api';

import type { NextPage } from 'next';
import type { AppProps, AppType } from 'next/app';
import type { ReactElement, ReactNode } from 'react';
import '~/styles/globals.css';

// If loading a variable font, you don't need to specify the font weight
const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const lexend = Lexend({ subsets: ['latin'], variable: '--font-lexend' });

// TODO: Fix type errors when time permits
// eslint-disable-next-line @typescript-eslint/ban-types
export type NextPageWithLayout<P = {}, IP = P> = NextPage<P, IP> & {
  getLayout?: (page: ReactElement) => ReactNode;
};

type AppPropsWithLayout = AppProps & {
  Component: NextPageWithLayout;
};

const MyApp: AppType<{ session: Session | null }> = ({
  Component,
  pageProps: { session, ...pageProps },
}: AppPropsWithLayout) => {
  // Use the layout defined at the page level, if available
  const getLayout = Component.getLayout ?? ((page) => page);

  return (
    <SessionProvider session={session}>
      <Provider>
        <style jsx global>{`
          :root {
            --font-inter: ${inter.style.fontFamily};
            --font-lexend: ${lexend.style.fontFamily};
          }
        `}</style>
        {getLayout(<Component {...pageProps} />)}
        <Analytics />
      </Provider>
    </SessionProvider>
  );
};

export default api.withTRPC(MyApp);
