import { useEffect, useRef, useState } from 'react';
import type { FileMetadata } from '@prisma/client';

import useNotification from '@/hooks/useNotification';
import { api } from '@/utils/api';
import LoadingBars from '../ui/LoadingBars';
import Notification from '../ui/Notification';
import ConfirmDeleteModal from './ConfirmDeleteModal';

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}

export default function FilesTable() {
  const {
    isLoading: metadataLoading,
    isError,
    data: fileMetadata,
    error,
  } = api.metadata.getMetadata.useQuery();

  const utils = api.useContext();

  const { mutate } = api.metadata.deleteMetadata.useMutation({
    onSuccess() {
      showSuccessNotification('Files deleted');
      // Reset the selected files state
      setSelectedFiles([]);
      // Refetch the query after a successful delete
      void utils.metadata.getMetadata.invalidate();
    },
    onError: (errorDelete) => {
      showErrorNotification('Error Deleting Files', errorDelete.message);
    },
  });

  // notifications
  const { notification, showSuccessNotification, showErrorNotification, showLoadingNotification } =
    useNotification();

  const checkbox = useRef<HTMLInputElement>(null);
  const [checked, setChecked] = useState(false);
  const [indeterminate, setIndeterminate] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<FileMetadata[]>([]);
  const [fileToDelete, setFileToDelete] = useState('');
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isSingleDeleteOpen, setIsSingleDeleteOpen] = useState(false);

  useEffect(() => {
    if (fileMetadata && checkbox.current) {
      const isIndeterminate =
        selectedFiles.length > 0 && selectedFiles.length < fileMetadata.length;
      setChecked(selectedFiles.length > 0 && selectedFiles.length === fileMetadata.length);
      setIndeterminate(isIndeterminate);
      checkbox.current.indeterminate = isIndeterminate;
    }
  }, [selectedFiles, fileMetadata]);

  function toggleAll() {
    if (fileMetadata && fileMetadata.length > 0) {
      setSelectedFiles(checked || indeterminate ? [] : fileMetadata);
      setChecked(!checked && !indeterminate);
      setIndeterminate(false);
    }
  }

  function handleBulkDelete(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    showLoadingNotification('Deleting files...');
    // Extract the ids of the selected files
    const ids = selectedFiles.map((file) => file.metadataId);

    // Call the mutation to delete the selected files
    mutate({ ids });

    // Reset the state
    setSelectedFiles([]);
    setIsDeleteModalOpen(false);
  }

  function handleDelete(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    showLoadingNotification('Deleting file...');
    // Call the mutation to delete the selected files
    mutate({ ids: [fileToDelete] });

    // Reset the selected files state
    setSelectedFiles([]);
    setIsSingleDeleteOpen(false);
  }

  if (isError) {
    return <span>Error: {error.message}</span>;
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
      <ConfirmDeleteModal
        modal={[isDeleteModalOpen, setIsDeleteModalOpen]}
        onSubmit={handleBulkDelete}
      />
      <ConfirmDeleteModal
        modal={[isSingleDeleteOpen, setIsSingleDeleteOpen]}
        onSubmit={handleDelete}
      />
      <div className="flex-grow rounded-lg bg-white p-4 shadow sm:p-6 lg:p-8">
        <div className="sm:flex sm:items-center">
          <div className="sm:flex-auto">
            <h2 className="text-base font-semibold leading-6">Files</h2>
          </div>
        </div>
        <div className="mt-8 flow-root">
          {metadataLoading ? (
            <LoadingBars />
          ) : (
            <div className="-my-2 -ml-4 sm:-ml-6 lg:-ml-8">
              <div className="inline-block min-w-full py-2 align-middle">
                <div className="relative max-h-96 overflow-auto">
                  <table className="min-w-full border-separate border-spacing-0">
                    <thead>
                      <tr>
                        <th
                          scope="col"
                          className="sticky top-0 z-20 bg-white bg-opacity-75 py-3.5 pr-3 backdrop-blur backdrop-filter"
                        >
                          <input
                            type="checkbox"
                            className="absolute left-4 top-1/2 -mt-2 h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600"
                            ref={checkbox}
                            checked={checked}
                            onChange={toggleAll}
                          />
                          {selectedFiles.length > 0 && (
                            <button
                              onClick={() => setIsDeleteModalOpen(true)}
                              type="button"
                              className="absolute left-12 top-2.5 z-20 inline-flex min-w-[92px] items-center rounded bg-white px-2 py-1 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-white"
                            >
                              Bulk delete
                            </button>
                          )}
                        </th>
                        <th
                          scope="col"
                          className="sticky top-0 z-10 border-b border-gray-300 bg-white bg-opacity-75 py-3.5 pr-3 text-left text-sm font-semibold text-gray-900 backdrop-blur backdrop-filter"
                        >
                          Name
                        </th>
                        <th
                          scope="col"
                          className="sticky top-0 z-10 hidden border-b border-gray-300 bg-white bg-opacity-75 px-3 py-3.5 text-left text-sm font-semibold text-gray-900 backdrop-blur backdrop-filter sm:table-cell"
                        >
                          Uploaded
                        </th>
                        <th
                          scope="col"
                          className="sticky top-0 z-10 border-b border-gray-300 bg-white bg-opacity-75 px-3 py-3.5 text-left text-sm font-semibold text-gray-900 backdrop-blur backdrop-filter"
                        >
                          Words
                        </th>
                        <th
                          scope="col"
                          className="sticky top-0 z-10 hidden border-b border-gray-300 bg-white bg-opacity-75 px-3 py-3.5 text-left text-sm font-semibold text-gray-900 backdrop-blur backdrop-filter lg:table-cell"
                        >
                          Type
                        </th>
                        <th
                          scope="col"
                          className="sticky top-0 z-10 border-b border-gray-300 bg-white bg-opacity-75 py-3.5 pr-4 pl-3 backdrop-blur backdrop-filter sm:pr-6 lg:pr-8"
                        >
                          <span className="sr-only">Delete</span>
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {fileMetadata.map((file) => (
                        <tr
                          key={file.id}
                          className={selectedFiles.includes(file) ? 'bg-gray-50' : undefined}
                        >
                          <td className="relative px-6 sm:w-12 sm:px-6">
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
                              'max-w-[140px] truncate whitespace-nowrap py-4 pr-3 text-sm font-medium',
                              selectedFiles.includes(file) ? 'text-indigo-600' : 'text-gray-900'
                            )}
                          >
                            {file.fileName}
                          </td>
                          <td className="hidden whitespace-nowrap px-3 py-4 text-sm text-gray-500 sm:table-cell">
                            {file.uploadDate.toDateString()}
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                            {file.wordCount}
                          </td>
                          <td className="hidden whitespace-nowrap px-3 py-4 text-sm text-gray-500 lg:table-cell">
                            {file.contentType}
                          </td>
                          <td className="whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-3">
                            <button
                              onClick={() => {
                                setIsSingleDeleteOpen(true);
                                setFileToDelete(file.metadataId);
                              }}
                              type="button"
                              className="text-indigo-600 hover:text-indigo-900"
                            >
                              Delete<span className="sr-only truncate">, {file.fileName}</span>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
