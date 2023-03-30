import { loadingAtom, messagesAtom } from '@/pages/expert-iframe/[expertId]';
import clsx from 'clsx';
import { useAtom } from 'jotai';
import LoadingBars from '../ui/LoadingBars';

export default function Messages() {
  const [messages] = useAtom(messagesAtom);
  const [loading] = useAtom(loadingAtom);

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
                    <p>{message.content}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
        <div className="clear-both mt-2 max-w-prose">{loading && <LoadingBars />}</div>
      </div>
    </>
  );
}
