/* eslint-disable @typescript-eslint/no-unsafe-member-access */

import { useEffect, useRef, useState } from 'react';
import { type GetServerSideProps } from 'next';
import Head from 'next/head';
import { useAtom } from 'jotai';
import { getServerSession } from 'next-auth';

import Meta from '~/components/seo/Meta';
import MetaDescription from '~/components/seo/MetaDescription';
import ChatInput from '~/components/widget/ChatInput';
import Messages from '~/components/widget/Messages';
import { authOptions } from '~/server/auth';
import { prisma } from '~/server/db';
import { api } from '~/utils/api';
import { messagesAtom } from '../assistant-iframe/[assistantId]';

interface AssistantPlaygroundProps {
  assistantId: string;
}

const AssistantPlayground = ({ assistantId }: AssistantPlaygroundProps) => {
  const [initial, setInitial] = useAtom(messagesAtom);
  const [initialMessagesSet, setInitialMessagesSet] = useState(false);

  const {
    isLoading: isAssistantLoading,
    isError,
    data: assistant,
    error,
  } = api.assistant.getWidgetAssistant.useQuery({ id: assistantId }, { enabled: !!assistantId });

  const messagesRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    if (assistant && assistant.initialMessages && !initialMessagesSet) {
      const initialMessages = assistant.initialMessages.split('\n').map((msg) => ({
        type: 'server',
        content: msg,
      }));
      setInitial(initialMessages);
      setInitialMessagesSet(true); // Set the flag to true after setting initial messages
    }
  }, [assistant, setInitial, initialMessagesSet]);

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

      <div className="flex h-full max-w-full flex-col bg-white">
        <main className="flex flex-col h-full">
          <div className="flex-1 overflow-y-auto px-2 py-2 lg:px-4 lg:py-4" ref={messagesRef}>
            <Messages />
          </div>
          <div className="bg-white px-2 lg:px-4">
            <ChatInput messagesRef={messagesRef} inputRef={inputRef} />
          </div>
        </main>
      </div>
    </>
  );
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  const session = await getServerSession(context.req, context.res, authOptions);
  const assistantId = context.params?.assistantId as string;

  const assistant = await prisma.assistant.findUnique({
    where: { id: assistantId },
    select: { visibility: true, userId: true, status: true },
  });

  if (!assistant) {
    return {
      notFound: true,
    };
  }

  const isPublic = assistant.visibility === 'PUBLIC';
  const isOwner = session?.user.id === assistant.userId;

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
      assistantId,
    },
  };
};

export default AssistantPlayground;
