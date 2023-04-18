import { type GetServerSideProps } from 'next';
import Head from 'next/head';
import { useRouter } from 'next/router';
import Script from 'next/script';
import { getServerSession } from 'next-auth';
import BrainHeader from '~/components/dashboard/BrainHeader';
import AvailableFiles from '~/components/dashboard/tables/AvailableFiles';
import BrainFiles from '~/components/dashboard/tables/BrainFiles';
import Meta from '~/components/seo/Meta';
import MetaDescription from '~/components/seo/MetaDescription';
import SidebarLayout from '~/components/ui/SidebarLayout';
import { env } from '~/env.mjs';
import { authOptions } from '~/server/auth';

import type { ReactElement } from 'react';
import type { NextPageWithLayout } from '../../_app';

const BrainPage: NextPageWithLayout = () => {
  const router = useRouter();
  const brainId = router.query.brainId as string;

  return (
    <>
      <Script
        src="https://cdn.jsdelivr.net/gh/ElektrikSpark/thinkhive-widget@latest/index.min.js"
        data-expertId={env.NEXT_PUBLIC_EXPERT_ID}
      />
      <Head>
        <title>Brain - ThinkHive</title>
        <Meta />
        <MetaDescription
          value="Create intelligent chatbots that answer questions based on your organization's
          knowledge base, providing answers to your company-specific inquiries anytime, anywhere!"
        />
      </Head>

      <div className="flex flex-col gap-16">
        <BrainHeader brainId={brainId} />
        <div className="flex flex-col gap-8 sm:flex-row sm:flex-wrap">
          <BrainFiles brainId={brainId} />
          <AvailableFiles brainId={brainId} />
        </div>
      </div>
    </>
  );
};

BrainPage.getLayout = function getLayout(page: ReactElement) {
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

export default BrainPage;
