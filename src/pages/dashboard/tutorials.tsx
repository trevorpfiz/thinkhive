import { type GetServerSideProps } from 'next';
import Head from 'next/head';
import type { ReactElement } from 'react';

import MetaDescription from '@/components/seo/MetaDescription';
import Meta from '@/components/seo/Meta';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/server/auth';
import SidebarLayout from '@/components/ui/SidebarLayout';
import type { NextPageWithLayout } from '../_app';
import Script from 'next/script';
import { env } from '@/env.mjs';

const TutorialsPage: NextPageWithLayout = () => {
  return (
    <>
      <Script
        src="https://cdn.jsdelivr.net/gh/ElektrikSpark/thinkhive-widget@latest/index.min.js"
        data-expertId={env.NEXT_PUBLIC_EXPERT_ID}
      />
      <Head>
        <title>Tutorials - ThinkHive</title>
        <Meta />
        <MetaDescription
          value="Create intelligent chatbots that answer questions based on your organization's
          knowledge base, providing answers to your company-specific inquiries anytime, anywhere!"
        />
      </Head>

      <div className="mx-auto h-[630px] max-w-[708px]">
        <iframe
          src="https://app.tango.us/app/embed/84432f9f-2215-422a-9344-10d82c1a9741?iframe=true"
          sandbox="allow-scripts allow-top-navigation-by-user-activation allow-popups allow-same-origin"
          security="restricted"
          title="Shopify: How to Add an Expert to Your Store"
          width="100%"
          height="100%"
          referrerPolicy="strict-origin-when-cross-origin"
          frameBorder="0"
          allow="fullscreen"
          className="h-full w-full border-none"
        />
      </div>
    </>
  );
};

TutorialsPage.getLayout = function getLayout(page: ReactElement) {
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

export default TutorialsPage;
