import { type GetServerSideProps } from 'next';
import Head from 'next/head';
import Script from 'next/script';
import { getServerSession } from 'next-auth';

import type { ReactElement } from 'react';
import type { NextPageWithLayout } from '~/pages/_app';
import BrainsTable from '~/components/dashboard/BrainsTable';
import Meta from '~/components/seo/Meta';
import MetaDescription from '~/components/seo/MetaDescription';
import SidebarLayout from '~/components/ui/SidebarLayout';
import { env } from '~/env.mjs';
import { authOptions } from '~/server/auth';

const BrainsPage: NextPageWithLayout = () => {
  return (
    <>
      <Script
        src="https://cdn.jsdelivr.net/gh/ElektrikSpark/thinkhive-widget@latest/index.min.js"
        data-assistantId={env.NEXT_PUBLIC_ASSISTANT_ID}
      />
      <Head>
        <title>Brains - ThinkHive</title>
        <Meta />
        <MetaDescription
          value="Create intelligent chatbots that answer questions based on your organization's
          knowledge base, providing answers to your company-specific inquiries anytime, anywhere!"
        />
      </Head>

      <div className="flex flex-col gap-16">
        <BrainsTable />
      </div>
    </>
  );
};

BrainsPage.getLayout = function getLayout(page: ReactElement) {
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

export default BrainsPage;
