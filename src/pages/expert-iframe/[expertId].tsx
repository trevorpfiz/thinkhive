import { type GetServerSideProps } from 'next';
import Head from 'next/head';
import { Fragment, useCallback, useEffect, useState } from 'react';

import MetaDescription from '@/components/seo/MetaDescription';
import Meta from '@/components/seo/Meta';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/server/auth';
import { useRouter } from 'next/router';
import Messages from '@/components/widget/Messages';
import ChatInput from '@/components/widget/ChatInput';
import * as EventTypes from '@/types/eventTypes';
import { api } from '@/utils/api';
import { atom, useAtom } from 'jotai';
import { Disclosure, Popover, Transition } from '@headlessui/react';
import clsx from 'clsx';

interface MessageEventProps extends MessageEvent {
  type: string;
  value: {
    expertId: string;
    topHost: string;
    deviceWidth: number;
  };
}

const widthAtom = atom(0);

const ExpertWidgetPage = () => {
  const [deviceWidth, setDeviceWidth] = useAtom(widthAtom);

  const router = useRouter();
  const expertId = router.query.expertId as string;

  const {
    isLoading,
    isError,
    data: expert,
    error,
  } = api.expert.getWidgetExpert.useQuery({ id: expertId }, { enabled: !!expertId });

  const [isReady, setIsReady] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [isShowButton, setIsShowButton] = useState(true);
  const [isShowMessages, setIsShowMessages] = useState(false);

  const isWidgetEvent = (event: MessageEvent<MessageEventProps>) => {
    return !!event && event.data && event.data.type && event.data.type in EventTypes;
  };

  function handleOpen() {
    if (!isOpen) {
      window.parent.postMessage(
        {
          type: EventTypes.CHANGE_CONTAINER_CLASS,
          value: 'thinkhive-open',
        },
        '*'
      );
      window.parent.postMessage(
        {
          type: EventTypes.LOCK_CLIENT_BODY,
          value: '',
        },
        '*'
      );
      // setIsShowButton(false);
    } else {
      window.parent.postMessage(
        {
          type: EventTypes.CHANGE_CONTAINER_CLASS,
          value: '',
        },
        '*'
      );
      window.parent.postMessage(
        {
          type: EventTypes.LOCK_CLIENT_BODY,
          value: 'unlock',
        },
        '*'
      );
    }
  }

  const receiveMessage = useCallback(
    (event: MessageEvent<MessageEventProps>) => {
      if (isWidgetEvent(event)) {
        switch (event.data.type) {
          // INIT_IFRAME
          case EventTypes.INIT_IFRAME:
            console.log(expert?.id, 'aksjld;g');
            console.log(event.data.value.expertId, 'event.data.value.expertId');
            console.log('next INIT_IFRAME');
            const isExpertIdValid = expert?.id === event.data.value.expertId;
            const hasValidDomain =
              !expert?.domains || expert?.domains.split(',').includes(event.data.value.topHost);

            if (isExpertIdValid && hasValidDomain) {
              // get whitelisted domains

              // BOOTSTRAP_DONE
              setIsReady(true);
              window.parent.postMessage({ type: EventTypes.BOOTSTRAP_DONE }, '*');
            } else {
              window.parent.postMessage({ type: EventTypes.DOMAIN_NOT_ALLOWED }, '*');
            }
            break;
          // CHANGE_CONTAINER_CLASS_DONE
          case EventTypes.CHANGE_CONTAINER_CLASS_DONE:
            setIsOpen(!isOpen);

            setDeviceWidth(event.data.value.deviceWidth);
            break;
          default:
            break;
        }
      }
    },
    [expert, isOpen, setDeviceWidth, setIsOpen, setIsReady]
  );

  useEffect(() => {
    window.addEventListener('message', receiveMessage, false);

    return () => window.removeEventListener('message', receiveMessage, false);
  }, [receiveMessage]);

  useEffect(() => {
    if (isOpen) {
      setIsShowMessages(true);
    }

    if (!isOpen) {
      // setTimeout(() => setIsShowButton(true), 1);
      setIsShowButton(true);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isReady && expert && expert.id) {
      window.parent.postMessage(
        {
          type: EventTypes.INITIATE_INIT_IFRAME,
        },
        '*'
      );
    }
  }, [expert, isReady]);

  useEffect(() => {
    console.log(isOpen);
  }, [isOpen]);

  if (isError) {
    return <div>Error: {error.message}</div>;
  }

  return (
    <>
      <Head>
        <title>Widget - ThinkHive</title>
        <Meta />
        <MetaDescription
          value="Create intelligent chatbots that answer questions based on your organization's
          knowledge base, providing answers to your company-specific inquiries anytime, anywhere!"
        />
      </Head>

      <div className="flex min-h-screen flex-col justify-between overflow-auto bg-white px-2 pt-2 lg:px-4 lg:pt-4">
        <Messages />
        <ChatInput />
      </div>
    </>
  );
};

// export const getServerSideProps: GetServerSideProps = async (context) => {
//   const session = await getServerSession(context.req, context.res, authOptions);

//   if (!session) {
//     return {
//       redirect: {
//         destination: '/login',
//         permanent: false,
//       },
//     };
//   }

//   return {
//     props: {
//       session,
//     },
//   };
// };

export default ExpertWidgetPage;
