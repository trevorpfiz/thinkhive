import { loadingAtom, messagesAtom } from '@/pages/expert-iframe/[expertId]';
import { chatHistoryAtom } from '@/pages/expert-iframe/[expertId]';
import { api } from '@/utils/api';
import { PaperAirplaneIcon } from '@heroicons/react/20/solid';
import { useAtom, useSetAtom } from 'jotai';
import { useRouter } from 'next/router';
import { useCallback, useEffect, useState } from 'react';

export default function ChatInput({
  messagesRef,
  inputRef,
}: {
  messagesRef: React.RefObject<HTMLDivElement>;
  inputRef: React.RefObject<HTMLInputElement>;
}) {
  const setMessages = useSetAtom(messagesAtom);
  const [chatHistory, setChatHistory] = useAtom(chatHistoryAtom);
  const [loading, setLoading] = useAtom(loadingAtom);
  const router = useRouter();
  const expertId = router.query.expertId as string;

  const {
    isLoading: isExpertLoading,
    isError,
    data: expert,
    error,
  } = api.expert.getWidgetExpert.useQuery({ id: expertId }, { enabled: !!expertId });

  const { mutateAsync } = api.chat.getAnswer.useMutation();

  const [query, setQuery] = useState<string>('');

  function addMessage(type: string, content: string) {
    setMessages((prevMessages) => [...prevMessages, { type, content }]);
  }

  const scrollToBottom = useCallback(() => {
    if (messagesRef.current) {
      messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
    }
  }, [messagesRef]);

  // search
  async function handleSearch(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!query) {
      alert('Please input a question');
      return;
    }

    const question = query.trim();
    addMessage('user', question);
    setQuery('');
    const metadataIds =
      expert?.brains?.flatMap((brain) => brain.files?.flatMap((file) => file.metadataId)) ?? [];

    setLoading(true);
    const { response } = await mutateAsync({
      question,
      chatHistory,
      systemMessage: expert?.systemMessage || '',
      metadataIds,
      expertId,
    });
    setLoading(false);
    console.log(response);

    if (response.text) {
      console.log(response.text);
      addMessage('server', response.text as string);
      setChatHistory((prevChatHistory) => [...prevChatHistory, question, response.text as string]);
    }
  }

  useEffect(() => {
    scrollToBottom();
    console.log('scroll to bottom useEffect');
  }, [loading, scrollToBottom]);

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
            disabled={isExpertLoading || !expert || !query}
          >
            <PaperAirplaneIcon className="h-5 w-5" />
          </button>
        </div>
      </form>
      <div className="pb-2 lg:pb-4"></div>
    </div>
  );
}
