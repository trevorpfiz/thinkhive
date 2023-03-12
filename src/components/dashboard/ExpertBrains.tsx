import { api } from '@/utils/api';

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}

export default function ExpertBrains({ expertId }: { expertId: string }) {
  const {
    isLoading: isExpertLoading,
    isError: isExpertError,
    data: expertData,
    error: expertError,
  } = api.expert.getExpert.useQuery({ id: expertId });

  const utils = api.useContext();

  const { mutate: unassignMutate } = api.expert.unassignBrain.useMutation({
    onSuccess() {
      // Refetch the query after a successful unassign
      void utils.expert.getExpert.invalidate();
      void utils.expert.getUnassignedBrains.invalidate();
    },
    onError: () => {
      console.error('Error!');
    },
  });

  function handleUnassign(brainId: string) {
    unassignMutate({ expertId, brainId });
  }

  if (isExpertError) {
    return <span>Error: {expertError.message}</span>;
  }

  return (
    <div className="flex-grow px-4 sm:px-6 lg:px-8">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h2 className="text-base font-semibold leading-6 text-gray-900">
            Expert knows {expertData?.size} words
          </h2>
        </div>
      </div>
      <div className="mt-8 flow-root">
        <div className="-my-2 -mx-4 sm:-mx-6 lg:-mx-8">
          {isExpertLoading ? (
            <div className="mt-3">
              <>
                <div className="mt-2 animate-pulse">
                  <div className="h-4 rounded bg-gray-300"></div>
                  <div className="mt-2 h-4 rounded bg-gray-300"></div>
                  <div className="mt-2 h-4 rounded bg-gray-300"></div>
                  <div className="mt-2 h-4 rounded bg-gray-300"></div>
                  <div className="mt-2 h-4 rounded bg-gray-300"></div>
                </div>
              </>
            </div>
          ) : (
            <div className="inline-block min-w-full py-2 align-middle">
              <table className="min-w-full border-separate border-spacing-0">
                <thead>
                  <tr>
                    <th
                      scope="col"
                      className="sticky top-0 z-10 border-b border-gray-300 bg-white bg-opacity-75 py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 backdrop-blur backdrop-filter sm:pl-6 lg:pl-8"
                    >
                      Brain
                    </th>
                    <th
                      scope="col"
                      className="sticky top-0 z-10 hidden border-b border-gray-300 bg-white bg-opacity-75 px-3 py-3.5 text-left text-sm font-semibold text-gray-900 backdrop-blur backdrop-filter sm:table-cell"
                    >
                      Updated
                    </th>
                    <th
                      scope="col"
                      className="sticky top-0 z-10 hidden border-b border-gray-300 bg-white bg-opacity-75 px-3 py-3.5 text-left text-sm font-semibold text-gray-900 backdrop-blur backdrop-filter lg:table-cell"
                    >
                      Size
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
                  {expertData &&
                    expertData.brains &&
                    expertData.brains.map((brain, brainIdx) => (
                      <tr key={brain.id}>
                        <td
                          className={classNames(
                            brainIdx !== expertData.brains.length - 1
                              ? 'border-b border-gray-200'
                              : '',
                            'whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6 lg:pl-8'
                          )}
                        >
                          {brain.name}
                        </td>
                        <td
                          className={classNames(
                            brainIdx !== expertData.brains.length - 1
                              ? 'border-b border-gray-200'
                              : '',
                            'hidden whitespace-nowrap px-3 py-4 text-sm text-gray-500 sm:table-cell'
                          )}
                        >
                          {brain.updatedAt.toDateString()}
                        </td>
                        <td
                          className={classNames(
                            brainIdx !== expertData.brains.length - 1
                              ? 'border-b border-gray-200'
                              : '',
                            'hidden whitespace-nowrap px-3 py-4 text-sm text-gray-500 lg:table-cell'
                          )}
                        >
                          {brain.size}
                        </td>
                        <td
                          className={classNames(
                            brainIdx !== expertData.brains.length - 1
                              ? 'border-b border-gray-200'
                              : '',
                            'relative whitespace-nowrap py-4 pr-4 pl-3 text-right text-sm font-medium sm:pr-8 lg:pr-8'
                          )}
                        >
                          <button
                            onClick={() => handleUnassign(brain.id)}
                            type="button"
                            className="text-indigo-600 hover:text-indigo-900"
                          >
                            Unassign<span className="sr-only">, {brain.name}</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
