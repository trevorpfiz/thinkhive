import { type GetServerSideProps } from 'next';
import Head from 'next/head';
import type { ReactElement } from 'react';
import { getServerSession } from 'next-auth';

import MetaDescription from '@/components/seo/MetaDescription';
import Meta from '@/components/seo/Meta';
import { authOptions } from '@/server/auth';
import SidebarLayout from '@/components/ui/SidebarLayout';
import type { NextPageWithLayout } from '@/pages/_app';
import ExpertsTable from '@/components/dashboard/ExpertsTable';
import Script from 'next/script';
import { env } from '@/env.mjs';

const ExpertsPage: NextPageWithLayout = () => {
  return (
    <>
      <Script
        src="https://cdn.jsdelivr.net/gh/ElektrikSpark/thinkhive-widget@latest/index.min.js"
        data-expertId={env.NEXT_PUBLIC_EXPERT_ID}
      />
      <Head>
        <title>Experts - ThinkHive</title>
        <Meta />
        <MetaDescription
          value="Create intelligent chatbots that answer questions based on your organization's
          knowledge base, providing answers to your company-specific inquiries anytime, anywhere!"
        />
      </Head>

      <div className="flex flex-col gap-16">
        <ExpertsTable />
      </div>
    </>
  );
};

ExpertsPage.getLayout = function getLayout(page: ReactElement) {
  return <SidebarLayout>{page}</SidebarLayout>;
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  const session = await getServerSession(context.req, context.res, authOptions);

  if (!session) {
    return {
      redirect: {
        destination: '/login',
        permanent: false,
      },
    };
  }

  return {
    props: {
      session,
    },
  };
};

export default ExpertsPage;
