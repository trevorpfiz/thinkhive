import { type NextPage } from 'next';
import Head from 'next/head';

import { Footer } from '@/components/Footer';
import { Header } from '@/components/Header';
import Pricing from '@/components/Pricing';
import { PricingFaqs } from '@/components/PricingFaqs';

const PricingPage: NextPage = () => {
  return (
    <>
      <Head>
        <title>Pricing - ThinkHive</title>
        <meta
          name="description"
          content="Most bookkeeping software is accurate, but hard to use. We make the opposite trade-off, and hope you don’t get audited."
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Header />
      <main>
        <Pricing />
        <PricingFaqs />
      </main>
      <Footer />
    </>
  );
};

export default PricingPage;
