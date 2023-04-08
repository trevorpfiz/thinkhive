/* eslint-disable @typescript-eslint/no-unsafe-member-access */

import { useEffect, useRef, useState } from 'react';
import { type GetServerSideProps } from 'next';
import Head from 'next/head';
import { useAtom } from 'jotai';
import { getServerSession } from 'next-auth';

import Meta from '@/components/seo/Meta';
import MetaDescription from '@/components/seo/MetaDescription';
import ChatInput from '@/components/widget/ChatInput';
import Messages from '@/components/widget/Messages';
import { authOptions } from '@/server/auth';
import { prisma } from '@/server/db';
import { api } from '@/utils/api';
import { messagesAtom } from '../expert-iframe/[expertId]';

interface ExpertPlaygroundProps {
  expertId: string;
}

const ExpertPlayground = ({ expertId }: ExpertPlaygroundProps) => {
  const [initial, setInitial] = useAtom(messagesAtom);
  const [initialMessagesSet, setInitialMessagesSet] = useState(false);

  const {
    isLoading: isExpertLoading,
    isError,
    data: expert,
    error,
  } = api.expert.getWidgetExpert.useQuery({ id: expertId }, { enabled: !!expertId });

  const messagesRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    if (expert && expert.initialMessages && !initialMessagesSet) {
      const initialMessages = expert.initialMessages.split('\n').map((msg) => ({
        type: 'server',
        content: msg,
      }));
      setInitial(initialMessages);
      setInitialMessagesSet(true); // Set the flag to true after setting initial messages
    }
  }, [expert, setInitial, initialMessagesSet]);

  if (isError) {
    return <div>Error: {error.message}</div>;
  }

  return (
    <>
      <Head>
        <title>Playground - ThinkHive</title>
        <Meta />
        <MetaDescription
          value="Create intelligent chatbots that answer questions based on your organization's
          knowledge base, providing answers to your company-specific inquiries anytime, anywhere!"
        />
      </Head>

      <div className="flex h-screen flex-col justify-between bg-white">
        <div className="relative h-full w-full">
          <div className="relative h-full w-full overflow-hidden">
            <div
              className="absolute inset-0 overflow-y-auto overflow-x-hidden px-2 py-2 lg:px-4 lg:py-4"
              ref={messagesRef}
            >
              <Messages />
            </div>
          </div>
        </div>
        <div className="px-2 lg:px-4">
          <ChatInput messagesRef={messagesRef} inputRef={inputRef} />
        </div>
      </div>
    </>
  );
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  const session = await getServerSession(context.req, context.res, authOptions);
  const expertId = context.params?.expertId as string;

  const expert = await prisma.expert.findUnique({
    where: { id: expertId },
    select: { visibility: true, userId: true, status: true },
  });

  if (!expert) {
    return {
      notFound: true,
    };
  }

  const isPublic = expert.visibility === 'PUBLIC';
  const isOwner = session?.user.id === expert.userId;

  if (!isPublic && !isOwner) {
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
      expertId,
    },
  };
};

export default ExpertPlayground;
