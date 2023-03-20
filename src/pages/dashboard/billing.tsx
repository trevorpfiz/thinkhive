import { type GetServerSideProps } from 'next';
import Head from 'next/head';
import type { ReactElement } from 'react';

import MetaDescription from '@/components/seo/MetaDescription';
import Meta from '@/components/seo/Meta';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/server/auth';
import SidebarLayout from '@/components/ui/SidebarLayout';
import type { NextPageWithLayout } from '../_app';
import { api } from '@/utils/api';
import { ManageBilling } from '@/components/payment/ManageBilling';
import Plans from '@/components/payment/Plans';

const BillingPage: NextPageWithLayout = () => {
  const { data: subscriptionStatus, isLoading } = api.user.subscriptionStatus.useQuery();

  console.log(subscriptionStatus);

  return (
    <>
      <Head>
        <title>Billing - ThinkHive</title>
        <Meta />
        <MetaDescription
          value="Create intelligent chatbots that answer questions based on your organization's
          knowledge base, providing answers to your company-specific inquiries anytime, anywhere!"
        />
      </Head>

      <h1>Billing</h1>
      <div className="mt-3 flex flex-col items-center justify-center gap-4">
        {!isLoading && subscriptionStatus !== null && (
          <>
            <p className="text-xl text-gray-700">Your subscription is {subscriptionStatus}.</p>
            <ManageBilling />
          </>
        )}
        {!isLoading && subscriptionStatus === null && (
          <>
            <p className="text-xl text-gray-700">You are not subscribed!!!</p>
          </>
        )}
      </div>
      <Plans />
    </>
  );
};

BillingPage.getLayout = function getLayout(page: ReactElement) {
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

export default BillingPage;
