import { type NextPage } from 'next';
import Head from 'next/head';

import { Footer } from '@/components/Footer';
import { Header } from '@/components/Header';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';

const DashboardPage: NextPage = () => {
  const { status } = useSession();
  const router = useRouter();

  if (status === 'unauthenticated') {
    void router.push('/'); // navigate to the home page
    return null; // return null to prevent rendering of the DashboardPage component
  }

  return (
    <>
      <Head>
        <title>Dashboard - ThinkHive</title>
        <meta
          name="description"
          content="Most bookkeeping software is accurate, but hard to use. We make the opposite trade-off, and hope you don’t get audited."
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Header />
      <main>
        <h2>Dashboard page</h2>
      </main>
      <Footer />
    </>
  );
};

export default DashboardPage;
