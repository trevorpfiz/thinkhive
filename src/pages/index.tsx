import { type NextPage } from 'next';
import Head from 'next/head';

import { Faqs } from '@/components/Faqs';
import { Footer } from '@/components/Footer';
import { Header } from '@/components/Header';
import { Hero } from '@/components/Hero';
import { PrimaryFeatures } from '@/components/PrimaryFeatures';
import Demo from '@/components/Demo';

const HomePage: NextPage = () => {
  return (
    <>
      <Head>
        <title>ThinkHive - Intelligent knowledge bases</title>
        <meta
          name="description"
          content="Most bookkeeping software is accurate, but hard to use. We make the opposite trade-off, and hope you don’t get audited."
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Header />
      <main>
        <Hero />
        <PrimaryFeatures />
        <Demo />
        <Faqs />
      </main>
      <Footer />
    </>
  );
};

export default HomePage;
