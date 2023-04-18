import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { PaperAirplaneIcon } from '@heroicons/react/20/solid';
import { fetchEventSource } from '@microsoft/fetch-event-source';
import { useAtom } from 'jotai';
import { ulid } from 'ulid';

import { chatHistoryAtom, loadingAtom, messagesAtom } from '~/pages/assistant-iframe/[assistantId]';
import { api } from '~/utils/api';

export default function ChatInput({
  messagesRef,
  inputRef,
}: {
  messagesRef: React.RefObject<HTMLDivElement>;
  inputRef: React.RefObject<HTMLInputElement>;
}) {
  const [messages, setMessages] = useAtom(messagesAtom);
  const [chatHistory, setChatHistory] = useAtom(chatHistoryAtom);
  const [loading, setLoading] = useAtom(loadingAtom);
  const router = useRouter();
  const assistantId = router.query.assistantId as string;

  const {
    isLoading: isAssistantLoading,
    isError,
    data: assistant,
    error,
  } = api.assistant.getWidgetAssistant.useQuery({ id: assistantId }, { enabled: !!assistantId });

  const [query, setQuery] = useState<string>('');

  const scrollToBottom = useCallback(() => {
    if (messagesRef.current) {
      messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
    }
  }, [messagesRef]);

  // search
  function handleSearch(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!query) {
      alert('Please input a question');
      return;
    }

    const question = query.trim();
    setMessages([...messages, { type: 'user', content: question, id: Date.now().toString() }]);
    setQuery('');
    const metadataIds =
      assistant?.brains?.flatMap((brain) => brain.files?.flatMap((file) => file.metadataId)) ?? [];

    setLoading(true);
    const controller = new AbortController();
    const serverResponseId = ulid();

    try {
      void fetchEventSource('/api/get-answer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          question,
          chatHistory,
          systemMessage: assistant?.systemMessage || '',
          metadataIds,
          assistantId,
        }),
        signal: controller.signal,
        onmessage: (event) => {
          setLoading(false);
          if (event.data === '[DONE]') {
            setChatHistory((prevChatHistory) => [
              ...prevChatHistory,
              question,
              messages[messages.length - 1]?.content || '',
            ]);
            setLoading(false);
            controller.abort();
            // Complete
          } else {
            // Stream text
            const serverResponseTokens = event.data.split(' ');

            setMessages((prevMessages) => {
              const existingMessageIndex = prevMessages.findIndex(
                (msg) => msg.id === serverResponseId
              );

              if (existingMessageIndex === -1) {
                // Add an empty server message with the unique id if it doesn't exist
                return [
                  ...prevMessages,
                  { type: 'server', content: serverResponseTokens[0] ?? '', id: serverResponseId },
                ];
              }

              // Update the existing message with the unique id
              const updatedMessages = [...prevMessages];
              serverResponseTokens.forEach((token, index) => {
                if (index === 0) {
                  updatedMessages[existingMessageIndex]!.content += token;
                } else {
                  updatedMessages[existingMessageIndex]!.content += ' ' + token;
                }
              });
              return updatedMessages;
            });
          }
        },
      });
    } catch (error) {
      setLoading(false);
      console.log(error, 'error');
    }
  }

  useEffect(() => {
    scrollToBottom();
  }, [loading, scrollToBottom, messages]);

  if (isError) {
    return <div>Error: {error.message}</div>;
  }

  return (
    <div>
      <div className="pt-1"></div>
      <form onSubmit={(e) => handleSearch(e)} className="flex items-center">
        <div className="flex w-full rounded-md border border-gray-300">
          <label htmlFor="message" className="sr-only">
            Message
          </label>
          <input
            type="text"
            name="message"
            id="message"
            className="min-w-0 flex-1 appearance-none rounded-md border-0 bg-inherit focus:border-transparent focus:outline-none focus:ring-0 sm:text-sm"
            placeholder="Message"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            ref={inputRef}
            autoComplete="off"
            maxLength={650}
            minLength={1}
            required
          />
          <button
            type="submit"
            className="flex flex-none items-center px-3 text-blue-600 hover:text-blue-800 focus:outline-none disabled:opacity-30"
            disabled={isAssistantLoading || !assistant || !query || loading}
          >
            <PaperAirplaneIcon className="h-5 w-5" />
          </button>
        </div>
      </form>
      <div className="pb-2 lg:pb-4"></div>
    </div>
  );
}
