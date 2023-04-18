import { useCallback, useEffect, useRef, useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { atom, useAtom } from 'jotai';
import normalizeUrl from 'normalize-url';

import Meta from '~/components/seo/Meta';
import MetaDescription from '~/components/seo/MetaDescription';
import ChatInput from '~/components/widget/ChatInput';
import Messages from '~/components/widget/Messages';
import * as EventTypes from '~/types/eventTypes';
import { api } from '~/utils/api';

interface MessageEventProps extends MessageEvent {
  type: string;
  value: {
    assistantId: string;
    topHost: string;
    deviceWidth: number;
  };
}

export interface WidgetMessage {
  type: string;
  content: string;
  id?: string;
}

const widthAtom = atom(0);
export const messagesAtom = atom<WidgetMessage[]>([]);
export const loadingAtom = atom(false);
export const chatHistoryAtom = atom<string[]>([]);
// const storage = createJSONStorage<string[]>(() => sessionStorage);
// export const chatHistoryAtom = atomWithStorage<string[]>('chatHistory', [], storage);

const AssistantWidgetPage = () => {
  const [deviceWidth, setDeviceWidth] = useAtom(widthAtom);
  const [initial, setInitial] = useAtom(messagesAtom);
  const [initialMessagesSet, setInitialMessagesSet] = useState(false);
  const messagesRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const router = useRouter();
  const assistantId = router.query.assistantId as string;

  const {
    isLoading,
    isError,
    data: assistant,
    error,
  } = api.assistant.getWidgetAssistant.useQuery({ id: assistantId }, { enabled: !!assistantId });

  const [isReady, setIsReady] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

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
            const isAssistantIdValid = assistant?.id === event.data.value.assistantId;

            const hasValidDomain =
              assistant?.domains?.split(',').some((domain) => {
                const normalizedAssistantDomain = normalizeUrl(domain, {
                  stripProtocol: true,
                  stripHash: true,
                });
                const normalizedTopHost = normalizeUrl(event.data.value.topHost, {
                  stripProtocol: true,
                  stripHash: true,
                });

                return normalizedAssistantDomain === normalizedTopHost;
              }) ?? false;

            console.log(hasValidDomain, event.data.value.topHost, assistant?.domains);
            if (isAssistantIdValid && hasValidDomain) {
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
    [assistant, isOpen, setDeviceWidth, setIsOpen, setIsReady]
  );

  useEffect(() => {
    window.addEventListener('message', receiveMessage, false);

    return () => window.removeEventListener('message', receiveMessage, false);
  }, [receiveMessage]);

  useEffect(() => {
    if (!isReady && assistant && assistant.id) {
      window.parent.postMessage(
        {
          type: EventTypes.INITIATE_INIT_IFRAME,
        },
        '*'
      );
    }
  }, [assistant, isReady]);

  useEffect(() => {
    if (assistant && assistant.initialMessages && !initialMessagesSet) {
      const initialMessages = assistant.initialMessages.split('\n').map((msg) => ({
        type: 'server',
        content: msg,
        id: Date.now().toString(),
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

export default AssistantWidgetPage;
