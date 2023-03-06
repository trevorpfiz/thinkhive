import { type NextPage } from 'next';
import Head from 'next/head';

import { Footer } from '@/components/Footer';
import { Header } from '@/components/Header';

const DashboardPage: NextPage = () => {
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
