import { loadingAtom, messagesAtom } from '@/pages/expert-iframe/[expertId]';
import clsx from 'clsx';
import { useAtom } from 'jotai';
import LoadingBars from '../ui/LoadingBars';

export default function Messages() {
  const [messages] = useAtom(messagesAtom);
  const [loading] = useAtom(loadingAtom);

  // FIXME - might not work for all cases
  const urlRegex = /((https?:\/\/)|(www\.))[\S]+(?<![,.;!?])/gi;

  const formatMessage = (content: string) => {
    return content.replace(urlRegex, (url) => {
      const properUrl = url.startsWith('http') ? url : 'http://' + url;
      return `<a href="${properUrl}" target="_blank" rel="noopener noreferrer" class="text-blue-600">${url}</a>`;
    });
  };

  return (
    <>
      <div>
        {messages.map((message, index) => (
          <div
            key={index}
            className={clsx('clear-both max-w-prose', {
              'float-left': message.type !== 'user',
              'float-right': message.type === 'user',
              'mr-8': message.type !== 'user',
              'ml-8': message.type === 'user',
            })}
          >
            <div
              className={clsx('relative float-right mb-2 rounded-lg px-4 py-5 sm:px-6', {
                'bg-gray-100': message.type !== 'user',
                'bg-blue-100': message.type === 'user',
              })}
            >
              <div className="flex w-full space-x-3">
                <div className="flex-1 gap-4">
                  <div className="whitespace-normal text-black [overflow-wrap:anywhere]">
                    <p dangerouslySetInnerHTML={{ __html: formatMessage(message.content) }} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
        <div className="clear-both mt-2 mr-8 max-w-prose">{loading && <LoadingBars />}</div>
      </div>
    </>
  );
}
