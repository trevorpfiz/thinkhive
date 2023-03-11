import { type NextPage } from 'next';
import Head from 'next/head';

import { Faqs } from '@/components/landing/Faqs';
import { Footer } from '@/components/Footer';
import { Header } from '@/components/Header';
import { Hero } from '@/components/landing/Hero';
import { PrimaryFeatures } from '@/components/landing/PrimaryFeatures';
import Demo from '@/components/landing/Demo';
import Meta from '@/components/seo/Meta';
import MetaDescription from '@/components/seo/MetaDescription';

const HomePage: NextPage = () => {
  return (
    <>
      <Head>
        <title>ThinkHive</title>
        <Meta />
        <MetaDescription
          value="Create intelligent chatbots that answer questions based on your organization's
        knowledge base, providing answers to your company-specific inquiries anytime, anywhere!"
        />
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
