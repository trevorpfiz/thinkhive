import Head from 'next/head';
import { useCallback, useEffect, useRef, useState } from 'react';
import { atom, useAtom } from 'jotai';

import MetaDescription from '@/components/seo/MetaDescription';
import Meta from '@/components/seo/Meta';
import { useRouter } from 'next/router';
import Messages from '@/components/widget/Messages';
import ChatInput from '@/components/widget/ChatInput';
import * as EventTypes from '@/types/eventTypes';
import { api } from '@/utils/api';

interface MessageEventProps extends MessageEvent {
  type: string;
  value: {
    expertId: string;
    topHost: string;
    deviceWidth: number;
  };
}

export interface WidgetMessage {
  type?: string;
  content: string;
}

const widthAtom = atom(0);
export const messagesAtom = atom<WidgetMessage[]>([]);
export const loadingAtom = atom(false);
export const chatHistoryAtom = atom<string[]>([]);
// const storage = createJSONStorage<string[]>(() => sessionStorage);
// export const chatHistoryAtom = atomWithStorage<string[]>('chatHistory', [], storage);

const ExpertWidgetPage = () => {
  const [deviceWidth, setDeviceWidth] = useAtom(widthAtom);
  const [initial, setInitial] = useAtom(messagesAtom);
  const [initialMessagesSet, setInitialMessagesSet] = useState(false);
  const messagesRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

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
            const isExpertIdValid = expert?.id === event.data.value.expertId;
            const hasValidDomain =
              !expert?.domains ||
              expert?.domains.split(',').some((domain) => {
                const subdomains = event.data.value.topHost.split('.');
                const mainDomain = subdomains.slice(-2).join('.');
                return domain === mainDomain;
              });
            console.log(hasValidDomain, event.data.value.topHost, expert?.domains);
            if (isExpertIdValid && hasValidDomain) {
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
        <title>Widget - ThinkHive</title>
        <Meta />
        <MetaDescription
          value="Create intelligent chatbots that answer questions based on your organization's
          knowledge base, providing answers to your company-specific inquiries anytime, anywhere!"
        />
      </Head>

      {isReady && (
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
      )}
    </>
  );
};

export default ExpertWidgetPage;
