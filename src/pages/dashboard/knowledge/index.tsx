import Head from 'next/head';
import type { ReactElement } from 'react';

import MetaDescription from '@/components/seo/MetaDescription';
import Meta from '@/components/seo/Meta';
import SidebarLayout from '@/components/ui/SidebarLayout';
import type { NextPageWithLayout } from '../../_app';
import FileDropzone from '@/components/dashboard/FileDropzone';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import FilesTable from '@/components/dashboard/FilesTable';

const KnowledgePage: NextPageWithLayout = () => {
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
        <title>Knowledge - ThinkHive</title>
        <Meta />
        <MetaDescription
          value="Create intelligent chatbots that answer questions based on your organization's
          knowledge base, providing answers to your company-specific inquiries anytime, anywhere!"
        />
      </Head>

      <div className="flex flex-row-reverse flex-wrap gap-8">
        <FileDropzone />
        <FilesTable />
      </div>
    </>
  );
};

KnowledgePage.getLayout = function getLayout(page: ReactElement) {
  return <SidebarLayout>{page}</SidebarLayout>;
};

export default KnowledgePage;
