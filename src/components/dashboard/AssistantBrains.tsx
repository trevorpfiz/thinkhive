import { useEffect, useState } from 'react';

import useNotification from '~/hooks/useNotification';
import { api } from '~/utils/api';
import { calculateAssistantSizes } from '~/utils/word-count';
import LoadingBars from '../ui/LoadingBars';
import Notification from '../ui/Notification';

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}

export default function AssistantBrains({ assistantId }: { assistantId: string }) {
  const {
    isLoading: isAssistantLoading,
    isError: isAssistantError,
    data: assistantData,
    error: assistantError,
  } = api.assistant.getAssistant.useQuery({ id: assistantId });

  const utils = api.useContext();

  const { mutate: detachMutate } = api.assistant.detachBrain.useMutation({
    onSuccess() {
      showSuccessNotification('Brain detached');
      // Refetch the query after a successful detach
      void utils.assistant.getAssistant.invalidate();
      void utils.assistant.getDetachedBrains.invalidate();
    },
    onError: (error) => {
      showErrorNotification('Error Detaching Brain', error.message);
    },
  });

  // notifications
  const { notification, showSuccessNotification, showErrorNotification, showLoadingNotification } =
    useNotification();

  // handlers
  function handleDetach(brainId: string) {
    showLoadingNotification('Detaching brain...');
    detachMutate({ assistantId, brainId });
  }

  const [brainSizes, setBrainSizes] = useState<number[]>([]);
  const [totalSize, setTotalSize] = useState<number>(0);

  useEffect(() => {
    if (assistantData) {
      const [sizes, total] = calculateAssistantSizes(assistantData);
      setBrainSizes(sizes);
      setTotalSize(total);
    }
  }, [assistantData]);

  if (isAssistantError) {
    return <span>Error: {assistantError.message}</span>;
  }

  return (
    <>
      {notification.show && (
        <Notification
          intent={notification.intent}
          message={notification.message}
          description={notification.description}
          show={notification.show}
          onClose={notification.onClose}
          timeout={notification.timeout}
        />
      )}
      <div className="flex-grow rounded-lg bg-white p-4 shadow sm:p-6 lg:p-8">
        <div className="sm:flex sm:items-center">
          <div className="sm:flex-auto">
            <h2 className="text-base font-semibold leading-6 text-gray-900">
              Assistant has {totalSize} words
            </h2>
          </div>
        </div>
        <div className="mt-8 flow-root">
          {isAssistantLoading ? (
            <LoadingBars />
          ) : (
            <div className="-my-2">
              <div className="inline-block min-w-full py-2 align-middle">
                <table className="min-w-full border-separate border-spacing-0">
                  <thead>
                    <tr>
                      <th
                        scope="col"
                        className="sticky top-0 z-10 border-b border-gray-300 bg-white bg-opacity-75 py-3.5 pr-3 text-left text-sm font-semibold text-gray-900 backdrop-blur backdrop-filter"
                      >
                        Brain
                      </th>
                      <th
                        scope="col"
                        className="sticky top-0 z-10 hidden border-b border-gray-300 bg-white bg-opacity-75 px-3 py-3.5 text-left text-sm font-semibold text-gray-900 backdrop-blur backdrop-filter xl:table-cell"
                      >
                        Updated
                      </th>
                      <th
                        scope="col"
                        className="sticky top-0 z-10 hidden border-b border-gray-300 bg-white bg-opacity-75 px-3 py-3.5 text-left text-sm font-semibold text-gray-900 backdrop-blur backdrop-filter sm:table-cell"
                      >
                        Words
                      </th>
                      <th
                        scope="col"
                        className="sticky top-0 z-10 border-b border-gray-300 bg-white bg-opacity-75 py-3.5 pr-4 pl-3 backdrop-blur backdrop-filter sm:pr-6 lg:pr-8"
                      >
                        <span className="sr-only">Edit</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {assistantData &&
                      assistantData.brains &&
                      assistantData.brains.map((brain, brainIdx) => (
                        <tr key={brain.id}>
                          <td
                            className={classNames(
                              brainIdx !== assistantData.brains.length - 1
                                ? 'border-b border-gray-200'
                                : '',
                              'max-w-[140px] truncate whitespace-nowrap py-4 pr-3 text-sm font-medium text-gray-900'
                            )}
                          >
                            {brain.name}
                          </td>
                          <td
                            className={classNames(
                              brainIdx !== assistantData.brains.length - 1
                                ? 'border-b border-gray-200'
                                : '',
                              'hidden whitespace-nowrap px-3 py-4 text-sm text-gray-500 xl:table-cell'
                            )}
                          >
                            {brain.updatedAt.toDateString()}
                          </td>
                          <td
                            className={classNames(
                              brainIdx !== assistantData.brains.length - 1
                                ? 'border-b border-gray-200'
                                : '',
                              'hidden whitespace-nowrap px-3 py-4 text-sm text-gray-500 sm:table-cell'
                            )}
                          >
                            {brainSizes[brainIdx]}
                          </td>
                          <td
                            className={classNames(
                              brainIdx !== assistantData.brains.length - 1
                                ? 'border-b border-gray-200'
                                : '',
                              'relative whitespace-nowrap py-4 pr-4 pl-3 text-right text-sm font-medium sm:pr-8 lg:pr-8'
                            )}
                          >
                            <button
                              onClick={() => handleDetach(brain.id)}
                              type="button"
                              className="text-indigo-600 hover:text-indigo-900"
                            >
                              Detach<span className="sr-only">, {brain.name}</span>
                            </button>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
