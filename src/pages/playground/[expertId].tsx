/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { type GetServerSideProps } from 'next';
import Head from 'next/head';
import { Fragment, useCallback, useEffect, useRef, useState } from 'react';

import { getServerSession } from 'next-auth';
import { useRouter } from 'next/router';

import { authOptions } from '@/server/auth';
import MetaDescription from '@/components/seo/MetaDescription';
import Meta from '@/components/seo/Meta';
import { api } from '@/utils/api';
import LoadingBars from '@/components/ui/LoadingBars';
import { prisma } from '@/server/db';
import Messages from '@/components/widget/Messages';
import ChatInput from '@/components/widget/ChatInput';
import { useAtom } from 'jotai';
import { messagesAtom } from '../expert-iframe/[expertId]';

const ExpertPlayground = () => {
  const [initial, setInitial] = useAtom(messagesAtom);
  const [initialMessagesSet, setInitialMessagesSet] = useState(false);

  const router = useRouter();
  const expertId = router.query.expertId as string;

  const {
    isLoading: isExpertLoading,
    isError,
    data: expert,
    error,
  } = api.expert.getWidgetExpert.useQuery({ id: expertId }, { enabled: !!expertId });

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
    const metadataIds =
      expert?.brains?.flatMap((brain) => brain.files?.flatMap((file) => file.metadataId)) ?? [];

    await mutateAsync({ question, metadataIds });

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

      <div className="flex min-h-screen flex-col justify-between overflow-y-auto overflow-x-hidden bg-white px-2 pt-2 lg:px-4 lg:pt-4">
        <Messages />
        <ChatInput />
      </div>
    </>
  );
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  const session = await getServerSession(context.req, context.res, authOptions);
  const expertId = context.params?.expertId as string;

  const expert = await prisma.expert.findUnique({
    where: { id: expertId },
    select: { availability: true, userId: true, status: true },
  });

  if (!expert) {
    return {
      notFound: true,
    };
  }

  const isPublic = expert.availability === 'PUBLIC';
  const isOwner = session?.user.id === expert.userId;

  if (!isPublic && !isOwner) {
    return {
      redirect: {
        destination: '/login',
        permanent: false,
      },
    };
  }

  if (expert.status === 'INACTIVE' && !isOwner) {
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

export default ExpertPlayground;
