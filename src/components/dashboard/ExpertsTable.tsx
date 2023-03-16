import { api } from '@/utils/api';
import { calculateExpertsSizes } from '@/utils/word-count';
import { useEffect, useState } from 'react';
import LoadingBars from '../ui/LoadingBars';
import LoadingDots from '../ui/LoadingDots';
import StatusBadge from '../ui/StatusBadge';

export default function ExpertsTable() {
  const {
    isLoading: expertsLoading,
    isError,
    data: experts,
    error,
  } = api.expert.getExperts.useQuery();

  const utils = api.useContext();

  const { mutate } = api.expert.createExpert.useMutation({
    onSuccess() {
      // Refetch the experts query after a successful creation
      void utils.expert.getExperts.invalidate();
    },
    onError: () => {
      console.error('Error!');
    },
  });

  function handleSubmit() {
    // Create a new expert
    mutate({ name: 'New expert', size: 0 });
  }

  const [brainSizes, setBrainSizes] = useState<number[]>([]);
  const [totalSize, setTotalSize] = useState<number>(0);

  useEffect(() => {
    if (experts) {
      const [sizes, total] = calculateExpertsSizes(experts);
      setBrainSizes(sizes);
      setTotalSize(total);
    }
  }, [experts]);

  if (isError) {
    return <span>Error: {error.message}</span>;
  }

  return (
    <div>
      <div className="border-b border-gray-200 pb-4 sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold leading-6">Experts</h1>
          <p className="mt-2 text-sm text-gray-700">A list of all the experts in your account</p>
        </div>
        <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
          <button
            onClick={handleSubmit}
            type="button"
            className="block rounded-md bg-indigo-600 py-2 px-3 text-center text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
          >
            Add expert
          </button>
        </div>
      </div>
      <div className="-mx-4 mt-8 sm:-mx-0">
        {expertsLoading ? (
          <LoadingBars />
        ) : (
          <table className="min-w-full divide-y divide-gray-300">
            <thead className="px-2">
              <tr>
                <th
                  scope="col"
                  className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900"
                >
                  Expert
                </th>
                <th
                  scope="col"
                  className="hidden px-3 py-3.5 text-left text-sm font-semibold text-gray-900 sm:table-cell"
                >
                  Brains
                </th>
                <th
                  scope="col"
                  className="hidden px-3 py-3.5 text-left text-sm font-semibold text-gray-900 sm:table-cell"
                >
                  Knowledge
                </th>
                <th
                  scope="col"
                  className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                >
                  Status
                </th>
                <th scope="col" className="relative py-3.5 pl-3 pr-4">
                  <span className="sr-only">Edit</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {experts.map((expert, index) => (
                <tr key={expert.id}>
                  <td className="w-full max-w-0 py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:w-auto sm:max-w-none">
                    <div className="flex items-center">
                      <div className="h-10 w-10 flex-shrink-0">
                        <div className="inline-block h-10 w-10 rounded-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>
                      </div>
                      <div className="ml-4">
                        <div className="font-medium text-gray-900">{expert.name}</div>
                      </div>
                    </div>
                    {/* <dl className="font-normal sm:hidden">
                      <dt className="sr-only">Expert</dt>
                      <dd className="mt-1 truncate text-gray-700">{expert.name}</dd>
                      <dt className="sr-only sm:hidden">Status</dt>
                      <dd className="mt-1 truncate text-gray-500 sm:hidden">
                        <StatusBadge status={expert.status} />
                      </dd>
                    </dl> */}
                  </td>
                  <td className="hidden px-3 py-4 text-sm text-gray-500 sm:table-cell">
                    {experts[index]?.brains.length}
                  </td>
                  <td className="hidden px-3 py-4 text-sm text-gray-500 sm:table-cell">
                    <div className="text-gray-900">{brainSizes[index]}</div>
                    <div className="text-gray-500">words</div>
                  </td>
                  <td className="px-3 py-4 text-sm text-gray-500">
                    <StatusBadge status={expert.status} />
                  </td>
                  <td className="py-4 pl-3 pr-4 text-right text-sm font-medium">
                    <a
                      href={`/dashboard/experts/${expert.id}`}
                      className="text-indigo-600 hover:text-indigo-900"
                    >
                      Edit<span className="sr-only">, {expert.name}</span>
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
