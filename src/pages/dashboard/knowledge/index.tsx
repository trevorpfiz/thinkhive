import Head from 'next/head';
import { useRouter } from 'next/router';
import Script from 'next/script';
import { useSession } from 'next-auth/react';

import type { ReactElement } from 'react';
import type { NextPageWithLayout } from '../../_app';
import FileDropzone from '~/components/dashboard/FileDropzone';
import FilesTable from '~/components/dashboard/tables/FilesTable';
import Meta from '~/components/seo/Meta';
import MetaDescription from '~/components/seo/MetaDescription';
import LoadingBars from '~/components/ui/LoadingBars';
import SidebarLayout from '~/components/ui/SidebarLayout';
import { env } from '~/env.mjs';

const KnowledgePage: NextPageWithLayout = () => {
  const router = useRouter();
  const { status } = useSession({
    required: true,
    onUnauthenticated() {
      void router.push('/login');
    },
  });

  if (status === 'loading') {
    return <LoadingBars />;
  }

  return (
    <>
      <Script
        src="https://cdn.jsdelivr.net/gh/ElektrikSpark/thinkhive-widget@latest/index.min.js"
        data-assistantId={env.NEXT_PUBLIC_ASSISTANT_ID}
      />
      <Head>
        <title>Knowledge - ThinkHive</title>
        <Meta />
        <MetaDescription
          value="Create intelligent chatbots that answer questions based on your organization's
          knowledge base, providing answers to your company-specific inquiries anytime, anywhere!"
        />
      </Head>

      <div className="flex flex-col gap-8">
        <h1 className="text-2xl font-semibold leading-6">Knowledge Base</h1>
        <div className="flex flex-col gap-8">
          <FileDropzone />
          <FilesTable />
        </div>
      </div>
    </>
  );
};

KnowledgePage.getLayout = function getLayout(page: ReactElement) {
  return <SidebarLayout>{page}</SidebarLayout>;
};

export default KnowledgePage;
