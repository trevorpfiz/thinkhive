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
import { Popover, Transition } from '@headlessui/react';

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
      setIsShowButton(false);
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

      <div className="fixed w-full">
        <Popover className="relative">
          {({ open }) => (
            <>
              <Popover.Button onClick={handleOpen} className="h-[76px] w-[76px] bg-indigo-600">
                <div className="flex h-full w-full items-center justify-center">
                  <div className="flex flex-col items-center justify-center">
                    <div className="flex items-center justify-center">
                      <svg
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M20 2H4C2.9 2 2 2.9 2 4V22L6 18H20C21.1 18 22 17.1 22 16V4C22 2.9 21.1 2 20 2ZM20 16H6L4 18V4H20V16Z"
                          fill="#FFFFFF"
                        />
                      </svg>
                    </div>
                  </div>
                </div>
              </Popover.Button>
              <Transition
                as={Fragment}
                enter="transition ease-out duration-200"
                enterFrom="opacity-0 translate-y-1"
                enterTo="opacity-100 translate-y-0"
                leave="transition ease-in duration-150"
                leaveFrom="opacity-100 translate-y-0"
                leaveTo="opacity-0 translate-y-1"
              >
                <Popover.Panel className="absolute left-1/2 z-10 mt-3 w-screen max-w-sm -translate-x-1/2 transform px-4 sm:px-0 lg:max-w-3xl">
                  <div className="overflow-hidden rounded-lg shadow-lg ring-1 ring-black ring-opacity-5">
                    <div className="flex min-h-screen flex-col justify-between overflow-auto bg-white px-2 pt-2 lg:px-4 lg:pt-4">
                      <Messages />
                      <ChatInput />
                    </div>
                  </div>
                </Popover.Panel>
              </Transition>
            </>
          )}
        </Popover>
      </div>

      {/* {isReady && (
        <Popover className="h-full w-full bg-transparent">
          {({ open }) => (
            <>
              {open && (
                <div>
                  <Popover.Panel>
                    <div className="flex min-h-screen flex-col justify-between overflow-auto bg-white px-2 pt-2 lg:px-4 lg:pt-4">
                      <Messages />
                      <ChatInput />
                    </div>
                  </Popover.Panel>
                </div>
              )}


            </>
          )}
        </Popover>
      )} */}

      {/* {isReady && isShowButton && (
        <button onClick={handleOpen} type="button" className="h-full w-full bg-indigo-600">

        </button>
      )} */}
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
