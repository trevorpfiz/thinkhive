import Head from 'next/head';
import type { ReactElement } from 'react';
import { type GetServerSideProps } from 'next';
import { getServerSession } from 'next-auth';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';

import MetaDescription from '@/components/seo/MetaDescription';
import Meta from '@/components/seo/Meta';
import SidebarLayout from '@/components/ui/SidebarLayout';
import type { NextPageWithLayout } from '@/pages/_app';
import BrainsTable from '@/components/dashboard/BrainsTable';
import { authOptions } from '@/server/auth';

const BrainsPage: NextPageWithLayout = () => {
  const router = useRouter();
  const { status } = useSession({
    required: true,
    onUnauthenticated() {
      void router.push('/login');
    },
  });

  if (status === 'loading') {
    return <div>Loading or not authenticated...</div>;
  }

  return (
    <>
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
