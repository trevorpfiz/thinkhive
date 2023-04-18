import { type GetServerSideProps } from 'next';
import Head from 'next/head';
import Script from 'next/script';
import { getServerSession } from 'next-auth';
import { Content } from '~/components/mdx/Content';
import { Heading } from '~/components/mdx/Heading';
import CustomImage from '~/components/mdx/Image';
import Meta from '~/components/seo/Meta';
import MetaDescription from '~/components/seo/MetaDescription';
import SidebarLayout from '~/components/ui/SidebarLayout';
import UserGuide from '~/docs/UserGuide.mdx';
import { env } from '~/env.mjs';
import { authOptions } from '~/server/auth';

import type { AnchorHTMLAttributes, ImgHTMLAttributes, ReactElement } from 'react';
import type { NextPageWithLayout } from '../_app';

const components = {
  img: ({ src, alt }: ImgHTMLAttributes<HTMLImageElement>) => {
    return <CustomImage src={src} alt={alt} />;
  },
  h1: Heading.H1,
  h2: Heading.H2,
  h3: Heading.H3,
  h4: Heading.H4,
  h5: Heading.H5,
  h6: Heading.H6,
  p: Content.P,
  a: ({ href, ...props }: AnchorHTMLAttributes<HTMLAnchorElement>) => Content.A({ href, ...props }),
};

const HelpPage: NextPageWithLayout = () => {
  return (
    <>
      <Script
        src="https://cdn.jsdelivr.net/gh/ElektrikSpark/thinkhive-widget@latest/index.min.js"
        data-expertId={env.NEXT_PUBLIC_EXPERT_ID}
      />
      <Head>
        <title>Help Center - ThinkHive</title>
        <Meta />
        <MetaDescription
          value="Create intelligent chatbots that answer questions based on your organization's
          knowledge base, providing answers to your company-specific inquiries anytime, anywhere!"
        />
      </Head>

      <div className="max-w-2xl mx-auto">
        <div className="py-8">
          <h1 className="text-3xl font-bold">Need Help?</h1>
          <p className="max-w-prose mt-4 text-lg tracking-tight text-slate-700">
            Talk with the ThinkHive Expert using the chat bubble in the bottom right, or reach out
            to us on our{' '}
            <a
              href="https://discord.gg/xYw9VScdzg"
              target="_blank"
              className="underline decoration-indigo-500 decoration-2 underline-offset-[3px] hover:decoration-indigo-700 hover:decoration-[3px]"
            >
              Discord server
            </a>
            !
          </p>
        </div>

        {/* divider */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center" aria-hidden="true">
            <div className="w-full border-t border-gray-300" />
          </div>
        </div>

        <div className="py-8">
          <UserGuide components={components} />
        </div>
      </div>
    </>
  );
};

HelpPage.getLayout = function getLayout(page: ReactElement) {
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

export default HelpPage;
