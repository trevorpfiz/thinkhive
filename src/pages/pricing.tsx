import { type NextPage } from 'next';
import Head from 'next/head';

import { Footer } from '@/components/Footer';
import { Header } from '@/components/Header';
import Pricing from '@/components/landing/Pricing';
import { PricingFaqs } from '@/components/landing/PricingFaqs';
import Meta from '@/components/seo/Meta';
import MetaDescription from '@/components/seo/MetaDescription';
import Script from 'next/script';
import { env } from '@/env.mjs';

const PricingPage: NextPage = () => {
  return (
    <>
      <Script
        src="https://cdn.jsdelivr.net/gh/ElektrikSpark/thinkhive-widget@latest/index.min.js"
        data-expertId={env.NEXT_PUBLIC_EXPERT_ID}
      />
      <Head>
        <title>Pricing - ThinkHive</title>
        <Meta />
        <MetaDescription
          value="Create intelligent chatbots that answer questions based on your organization's
        knowledge base, providing answers to your company-specific inquiries anytime, anywhere!"
        />
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
