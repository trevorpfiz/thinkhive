import { api } from '@/utils/api';
import type { FileMetadata } from '@prisma/client';
import { useLayoutEffect, useRef, useState } from 'react';

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}

export default function FileTable() {
  const {
    isLoading: metadataLoading,
    isError,
    data: fileMetadata,
    error,
  } = api.metadata.getMetadata.useQuery();

  const utils = api.useContext();

  const { mutate } = api.metadata.deleteMetadata.useMutation({
    onSuccess() {
      // Reset the selected files state
      setSelectedFiles([]);
      // Refetch the query after a successful delete
      void utils.metadata.getMetadata.invalidate();
    },
    onError: () => {
      console.error('Error!');
    },
  });

  const checkbox = useRef<HTMLInputElement>(null);
  const [checked, setChecked] = useState(false);
  const [indeterminate, setIndeterminate] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<FileMetadata[]>([]);

  useLayoutEffect(() => {
    if (fileMetadata && checkbox.current) {
      console.log(fileMetadata);
      const isIndeterminate =
        selectedFiles.length > 0 && selectedFiles.length < fileMetadata.length;
      setChecked(selectedFiles.length === fileMetadata.length);
      setIndeterminate(isIndeterminate);
      checkbox.current.indeterminate = isIndeterminate;
    }
  }, [selectedFiles, fileMetadata]);

  function toggleAll() {
    if (fileMetadata) {
      setSelectedFiles(checked || indeterminate ? [] : fileMetadata);
      setChecked(!checked && !indeterminate);
      setIndeterminate(false);
    }
  }

  if (isError) {
    return <span>Error: {error.message}</span>;
  }

  function handleDelete() {
    // Extract the ids of the selected files
    const ids = selectedFiles.map((file) => file.metadataId);

    // Call the mutation to delete the selected files
    mutate({ ids });
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-base font-semibold leading-6 text-gray-900">Files</h1>
          <p className="mt-2 text-sm text-gray-700">
            A list of all the file metadata in your account including their fileName, title, email
            and role.
          </p>
        </div>
        <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
          <button
            type="button"
            className="block rounded-md bg-indigo-600 py-1.5 px-3 text-center text-sm font-semibold leading-6 text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
          >
            Upload
          </button>
        </div>
      </div>
      <div className="mt-8 flow-root">
        <div className="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
            <div className="relative">
              {selectedFiles.length > 0 && (
                <div className="absolute top-0 left-14 flex h-12 items-center space-x-3 bg-white sm:left-12">
                  <button
                    onClick={handleDelete}
                    type="button"
                    className="inline-flex items-center rounded bg-white px-2 py-1 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-white"
                  >
                    Bulk delete
                  </button>
                </div>
              )}
              <table className="min-w-full table-fixed divide-y divide-gray-300">
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
                      className="min-w-[12rem] py-3.5 pr-3 text-left text-sm font-semibold text-gray-900"
                    >
                      Name
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                    >
                      Title
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                    >
                      Email
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                    >
                      Role
                    </th>
                    <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-3">
                      <span className="sr-only">Edit</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {metadataLoading ? (
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
                    fileMetadata.map((file) => (
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
                            'whitespace-nowrap py-4 pr-3 text-sm font-medium',
                            selectedFiles.includes(file) ? 'text-indigo-600' : 'text-gray-900'
                          )}
                        >
                          {file.fileName}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          {file.uploadDate.toString()}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          {file.wordCount}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          {file.contentType}
                        </td>
                        <td className="whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-3">
                          <a href="#" className="text-indigo-600 hover:text-indigo-900">
                            Edit<span className="sr-only">, {file.fileName}</span>
                          </a>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
