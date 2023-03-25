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
import FeatureList from '@/components/landing/FeatureList';
import { CallToAction } from '@/components/landing/CallToAction';
import Script from 'next/script';
import { env } from '@/env.mjs';

const HomePage: NextPage = () => {
  return (
    <>
      <Script
        src="https://cdn.jsdelivr.net/gh/ElektrikSpark/thinkhive-expert@latest/index.min.js"
        data-expertId={env.NEXT_PUBLIC_EXPERT_ID}
      />
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
        <FeatureList />
        <CallToAction />
        <Faqs />
      </main>
      <Footer />
    </>
  );
};

export default HomePage;
