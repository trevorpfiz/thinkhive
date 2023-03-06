import { type NextPage } from 'next';
import Head from 'next/head';

import { Footer } from '@/components/Footer';
import { Header } from '@/components/Header';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import MetaDescription from '@/components/seo/MetaDescription';
import Meta from '@/components/seo/Meta';

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
        <Meta />
        <MetaDescription
          value="Create intelligent chatbots that answer questions based on your organization's
        knowledge base, providing answers to your company-specific inquiries anytime, anywhere!"
        />
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
