import { api } from '@/utils/api';
import { calculateBrainSizes } from '@/utils/word-count';
import { useEffect, useState } from 'react';

export default function BrainsTable() {
  const { isLoading: brainsLoading, isError, data: brains, error } = api.brain.getBrains.useQuery();

  const utils = api.useContext();

  const { mutate } = api.brain.createBrain.useMutation({
    onSuccess() {
      // Refetch the brains query after a successful creation
      void utils.brain.getBrains.invalidate();
    },
    onError: () => {
      console.error('Error!');
    },
  });

  function handleSubmit() {
    // Create a new brain
    mutate({ name: 'New brain', size: 0 });
  }

  const [brainSizes, setBrainSizes] = useState<number[]>([]);
  const [totalSize, setTotalSize] = useState<number>(0);

  useEffect(() => {
    if (brains) {
      const [sizes, total] = calculateBrainSizes(brains);
      setBrainSizes(sizes);
      setTotalSize(total);
    }
  }, [brains]);

  if (isError) {
    return <span>Error: {error.message}</span>;
  }

  return (
    <div>
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-base font-semibold leading-6 text-gray-900">Brains</h1>
          <p className="mt-2 text-sm text-gray-700">A list of all the brains in your account.</p>
        </div>
        <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
          <button
            onClick={handleSubmit}
            type="button"
            className="block rounded-md bg-indigo-600 py-2 px-3 text-center text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
          >
            Add brain
          </button>
        </div>
      </div>
      <div className="-mx-4 mt-8 sm:-mx-0">
        {brainsLoading ? (
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
          <table className="min-w-full divide-y divide-gray-300">
            <thead className="px-2">
              <tr>
                <th
                  scope="col"
                  className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900"
                >
                  Brain
                </th>
                <th
                  scope="col"
                  className="hidden px-3 py-3.5 text-left text-sm font-semibold text-gray-900 sm:table-cell"
                >
                  Updated
                </th>
                <th
                  scope="col"
                  className="hidden px-3 py-3.5 text-left text-sm font-semibold text-gray-900 sm:table-cell"
                >
                  Size
                </th>
                <th
                  scope="col"
                  className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                >
                  Attachments
                </th>
                <th scope="col" className="relative py-3.5 pl-3 pr-4">
                  <span className="sr-only">Edit</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {brains.map((brain, index) => (
                <tr key={brain.id}>
                  <td className="w-full max-w-0 py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:w-auto sm:max-w-none">
                    <div className="hidden items-center sm:flex">
                      <div className="h-10 w-10 flex-shrink-0">
                        <div className="inline-block h-10 w-10 rounded-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>
                      </div>
                      <div className="ml-4">
                        <div className="font-medium text-gray-900">{brain.name}</div>
                      </div>
                    </div>
                    <dl className="font-normal sm:hidden">
                      <dt className="sr-only">Brain</dt>
                      <dd className="mt-1 truncate text-gray-700">{brain.name}</dd>
                      <dt className="sr-only sm:hidden">Size</dt>
                      <dd className="mt-1 truncate text-gray-500 sm:hidden">{brainSizes[index]}</dd>
                    </dl>
                  </td>
                  <td className="hidden px-3 py-4 text-sm text-gray-500 sm:table-cell">
                    <div className="text-gray-900">{brain.updatedAt.toDateString()}</div>
                    <div className="text-gray-500">{brain.createdAt.toDateString()}</div>
                  </td>
                  <td className="px-3 py-4 text-sm text-gray-500">
                    <span className="inline-flex rounded-full bg-green-100 px-2 text-xs font-semibold leading-5 text-green-800">
                      {brainSizes[index]}
                    </span>
                  </td>
                  <td className="hidden px-3 py-4 text-sm text-gray-500 sm:table-cell">
                    {brainSizes[index]}
                  </td>
                  <td className="py-4 pl-3 pr-4 text-right text-sm font-medium">
                    <a
                      href={`/dashboard/brains/${brain.id}`}
                      className="text-indigo-600 hover:text-indigo-900"
                    >
                      Edit<span className="sr-only">, {brain.name}</span>
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
