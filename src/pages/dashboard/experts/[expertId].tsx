import { type GetServerSideProps } from 'next';
import Head from 'next/head';
import type { ReactElement } from 'react';

import MetaDescription from '@/components/seo/MetaDescription';
import Meta from '@/components/seo/Meta';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/server/auth';
import SidebarLayout from '@/components/ui/SidebarLayout';
import type { NextPageWithLayout } from '../../_app';
import { useRouter } from 'next/router';
import ExpertBrains from '@/components/dashboard/ExpertBrains';
import AvailableBrains from '@/components/dashboard/AvailableBrains';

const ExpertPage: NextPageWithLayout = () => {
  const router = useRouter();
  const expertId = router.query.expertId as string;

  return (
    <>
      <Head>
        <title>Expert - ThinkHive</title>
        <Meta />
        <MetaDescription
          value="Create intelligent chatbots that answer questions based on your organization's
          knowledge base, providing answers to your company-specific inquiries anytime, anywhere!"
        />
      </Head>

      <div>{expertId}</div>
      <div className="flex flex-row">
        <ExpertBrains expertId={expertId} />
        <AvailableBrains expertId={expertId} />
      </div>
    </>
  );
};

ExpertPage.getLayout = function getLayout(page: ReactElement) {
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

export default ExpertPage;
