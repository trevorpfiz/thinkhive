import { api } from '@/utils/api';
import type { FileMetadata } from '@prisma/client';
import { useEffect, useRef, useState } from 'react';

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}

export default function BrainFiles({ brainId }: { brainId: string }) {
  const {
    isLoading: isBrainLoading,
    isError: isBrainError,
    data: brainData,
    error: brainError,
  } = api.brain.getBrain.useQuery({ id: brainId });

  const utils = api.useContext();

  const { mutate: unassignMutate } = api.brain.unassignFiles.useMutation({
    onSuccess() {
      // Refetch the query after a successful unassign
      void utils.brain.getBrain.invalidate();
      void utils.brain.getUnassignedFiles.invalidate();
    },
    onError: () => {
      console.error('Error!');
    },
  });

  const checkbox = useRef<HTMLInputElement>(null);
  const [checked, setChecked] = useState(false);
  const [indeterminate, setIndeterminate] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<FileMetadata[]>([]);

  const [totalSize, setTotalSize] = useState(0);

  useEffect(() => {
    if (brainData?.files) {
      let sum = 0;
      for (let i = 0; i < brainData?.files.length; i++) {
        sum += brainData?.files[i]?.wordCount || 0;
      }
      setTotalSize(sum);
    }
  }, [brainData?.files]);

  useEffect(() => {
    if (brainData?.files && checkbox.current) {
      const isIndeterminate =
        selectedFiles.length > 0 && selectedFiles.length < brainData.files.length;
      setChecked(selectedFiles.length > 0 && selectedFiles.length === brainData.files.length);
      setIndeterminate(isIndeterminate);
      checkbox.current.indeterminate = isIndeterminate;
    }
  }, [selectedFiles, brainData?.files]);

  function toggleAll() {
    if (brainData?.files && brainData?.files.length > 0) {
      setSelectedFiles(checked || indeterminate ? [] : brainData.files);
      setChecked(!checked && !indeterminate);
      setIndeterminate(false);
    }
  }

  function handleUnassign(metadataIds: string[]) {
    unassignMutate({ brainId, ids: metadataIds });
    setSelectedFiles([]);
  }

  function handleBulkUnassign() {
    unassignMutate({ brainId, ids: selectedFiles.map((file) => file.id) });
    setSelectedFiles([]);
  }

  if (isBrainError) {
    return <span>Error: {brainError.message}</span>;
  }

  return (
    <div className="flex-grow px-4 sm:px-6 lg:px-8">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h2 className="text-base font-semibold leading-6 text-gray-900">
            Brain contains {totalSize} words
          </h2>
        </div>
      </div>
      <div className="mt-8 flow-root">
        <div className="-my-2 -mx-4 sm:-mx-6 lg:-mx-8">
          {isBrainLoading ? (
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
              <div className="relative">
                {selectedFiles.length > 0 && (
                  <div className="absolute top-0 left-14 flex h-12 items-center space-x-3 bg-white sm:left-12">
                    <button
                      onClick={handleBulkUnassign}
                      type="button"
                      className="z-20 inline-flex items-center rounded bg-white px-2 py-1 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-white"
                    >
                      Bulk assign
                    </button>
                  </div>
                )}
                <table className="min-w-full border-separate border-spacing-0">
                  <thead>
                    <tr>
                      <th scope="col" className="relative px-7 sm:w-12 sm:px-6">
                        <input
                          type="checkbox"
                          className="absolute left-4 top-1/2 -mt-2 h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600"
                          ref={checkbox}
                          checked={checked}
                          onChange={toggleAll}
                        />
                      </th>
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
                        <span className="sr-only">Unassign</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {brainData &&
                      brainData.files &&
                      brainData.files.map((file, fileIdx) => (
                        <tr
                          key={file.id}
                          className={selectedFiles.includes(file) ? 'bg-gray-50' : undefined}
                        >
                          <td className="relative px-7 sm:w-12 sm:px-6">
                            {selectedFiles.includes(file) && (
                              <div className="absolute inset-y-0 left-0 w-0.5 bg-indigo-600" />
                            )}
                            <input
                              type="checkbox"
                              className="absolute left-4 top-1/2 -mt-2 h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600"
                              value={file.wordCount}
                              checked={selectedFiles.includes(file)}
                              onChange={(e) =>
                                setSelectedFiles(
                                  e.target.checked
                                    ? [...selectedFiles, file]
                                    : selectedFiles.filter((p) => p !== file)
                                )
                              }
                            />
                          </td>
                          <td
                            className={classNames(
                              fileIdx !== brainData.files.length - 1
                                ? 'border-b border-gray-200'
                                : '',
                              'whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6 lg:pl-8'
                            )}
                          >
                            {file.fileName}
                          </td>
                          <td
                            className={classNames(
                              fileIdx !== brainData.files.length - 1
                                ? 'border-b border-gray-200'
                                : '',
                              'hidden whitespace-nowrap px-3 py-4 text-sm text-gray-500 lg:table-cell'
                            )}
                          >
                            {file.updatedAt.toDateString()}
                          </td>
                          <td
                            className={classNames(
                              fileIdx !== brainData.files.length - 1
                                ? 'border-b border-gray-200'
                                : '',
                              'hidden whitespace-nowrap px-3 py-4 text-sm text-gray-500 sm:table-cell'
                            )}
                          >
                            {file.wordCount}
                          </td>
                          <td
                            className={classNames(
                              fileIdx !== brainData.files.length - 1
                                ? 'border-b border-gray-200'
                                : '',
                              'relative whitespace-nowrap py-4 pr-4 pl-3 text-right text-sm font-medium sm:pr-8 lg:pr-8'
                            )}
                          >
                            <button
                              onClick={() => handleUnassign([file.id])}
                              type="button"
                              className="text-indigo-600 hover:text-indigo-900"
                            >
                              Unassign<span className="sr-only">, {file.fileName}</span>
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
    </div>
  );
}
