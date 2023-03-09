/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { useRef, useState, useEffect } from 'react';
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

const TestPage: NextPageWithLayout = () => {
  const { mutateAsync, data, isLoading } = api.chat.getAnswer.useMutation();

  const [query, setQuery] = useState<string>('');

  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  async function handleSearch() {
    if (!query) {
      alert('Please input a question');
      return;
    }

    const question = query.trim();

    await mutateAsync({ question });

    if (data?.response.text) {
      console.log(data?.response.text);
    }
  }

  const handleEnter = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && query) {
      void handleSearch();
    } else {
      return;
    }
  };

  return (
    <>
      <Head>
        <title>Test - ThinkHive</title>
        <Meta />
        <MetaDescription
          value="Create intelligent chatbots that answer questions based on your organization's
          knowledge base, providing answers to your company-specific inquiries anytime, anywhere!"
        />
      </Head>

      <section className="container mx-auto max-w-xl pt-4 pb-6 md:pt-8 md:pb-10 lg:pt-10 lg:pb-16">
        <div className="mx-auto flex flex-col gap-4">
          <h1 className="mb-3 text-center text-2xl font-bold leading-[1.1] tracking-tighter">
            Chat With Your Notion Docs
          </h1>
          <div className="flex w-full max-w-xl items-center space-x-2">
            <input
              ref={inputRef}
              className="flex h-10 w-full rounded-md border border-slate-300 bg-transparent py-2 px-3 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              type="text"
              placeholder="What is ThinkHive?"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleEnter}
            />
            <button
              // eslint-disable-next-line @typescript-eslint/no-misused-promises
              onClick={handleSearch}
              className="inline-flex h-10 items-center justify-center rounded-md bg-slate-900 py-2 px-4 text-sm font-medium text-white transition-colors hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 active:scale-95 disabled:pointer-events-none disabled:opacity-50 data-[state=open]:bg-slate-100"
            >
              Search
            </button>
          </div>
          {isLoading && (
            <div className="mt-3">
              <>
                <div className="mt-2 animate-pulse">
                  <div className="h-4 rounded bg-gray-300"></div>
                  <div className="mt-2 h-4 rounded bg-gray-300"></div>
                  <div className="mt-2 h-4 rounded bg-gray-300"></div>
                  <div className="mt-2 h-4 rounded bg-gray-300"></div>
                  <div className="mt-2 h-4 rounded bg-gray-300"></div>
                </div>
              </>
            </div>
          )}
          {!isLoading && data?.response.text.length > 0 && (
            <>
              <div className="mt-4 rounded-md border border-neutral-300 p-5">
                <h2 className="text-center text-xl font-bold leading-[1.1] tracking-tighter">
                  Answer
                </h2>
                <p className="mt-3 leading-normal text-slate-700 sm:leading-7">
                  {data?.response.text}
                </p>
              </div>
            </>
          )}
        </div>
      </section>
    </>
  );
};

TestPage.getLayout = function getLayout(page: ReactElement) {
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

export default TestPage;
