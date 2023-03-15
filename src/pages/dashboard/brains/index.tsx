import Head from 'next/head';
import type { ReactElement } from 'react';

import MetaDescription from '@/components/seo/MetaDescription';
import Meta from '@/components/seo/Meta';
import SidebarLayout from '@/components/ui/SidebarLayout';
import type { NextPageWithLayout } from '../../_app';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import BrainsTable from '@/components/dashboard/BrainsTable';

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
        <div className="border-b border-gray-200 pb-5">
          <h3 className="text-base font-semibold leading-6 text-gray-900">
            <span role="img" aria-label="brain">
              🧠
            </span>
            Brains
          </h3>
        </div>
        <BrainsTable />
      </div>
    </>
  );
};

BrainsPage.getLayout = function getLayout(page: ReactElement) {
  return <SidebarLayout>{page}</SidebarLayout>;
};

export default BrainsPage;
