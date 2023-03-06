import { type NextPage } from 'next';
import Head from 'next/head';

import { Footer } from '@/components/Footer';
import { Header } from '@/components/Header';
import Pricing from '@/components/Pricing';
import { PricingFaqs } from '@/components/PricingFaqs';
import Meta from '@/components/seo/Meta';
import MetaDescription from '@/components/seo/MetaDescription';

const PricingPage: NextPage = () => {
  return (
    <>
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
