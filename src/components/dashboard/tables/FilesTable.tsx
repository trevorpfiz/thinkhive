import { useMemo, useState } from 'react';
import type { FileMetadata } from '@prisma/client';
import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  type SortingState,
  useReactTable,
  createColumnHelper,
  getFilteredRowModel,
  type VisibilityState,
} from '@tanstack/react-table';

import useNotification from '@/hooks/useNotification';
import { api } from '@/utils/api';
import LoadingBars from '../../ui/LoadingBars';
import Notification from '../../ui/Notification';
import ConfirmDeleteModal from '../modals/ConfirmDeleteModal';
import DebouncedInput from './DebouncedInput';
import IndeterminateCheckbox from './IndeterminateCheckbox';
import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/20/solid';

type FileTable = {
  metadataId: string;
  fileName: string;
  uploadDate: string;
  wordCount: number;
  contentType: string;
};

const columnHelper = createColumnHelper<FileTable>();

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}

export default function FilesTanStackTable() {
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
      setRowSelection({});
      // Refetch the query after a successful delete
      void utils.metadata.getMetadata.invalidate();
    },
    onError: (errorDelete) => {
      showErrorNotification('Error Deleting Files', errorDelete.message);
    },
  });

  // TanStack Table
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState('');
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({
    metadataId: false,
    fileName: true,
    uploadDate: true,
    wordCount: true,
    contentType: true,
  });
  const [rowSelection, setRowSelection] = useState({});

  const columns = [
    columnHelper.display({
      id: 'select',
      header: ({ table }) => (
        <div className="pl-1">
          <IndeterminateCheckbox
            className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-600"
            {...{
              checked: table.getIsAllRowsSelected(),
              indeterminate: table.getIsSomeRowsSelected(),
              onChange: table.getToggleAllRowsSelectedHandler(),
            }}
          />
        </div>
      ),
      cell: ({ row }) => (
        <div className="relative flex h-full items-center pl-4">
          {row.getIsSelected() && <div className="absolute inset-y-0 left-0 w-0.5 bg-indigo-600" />}
          <IndeterminateCheckbox
            className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-600"
            {...{
              checked: row.getIsSelected(),
              disabled: !row.getCanSelect(),
              indeterminate: row.getIsSomeSelected(),
              onChange: row.getToggleSelectedHandler(),
            }}
          />
        </div>
      ),
    }),
    columnHelper.accessor('metadataId', {
      enableGlobalFilter: false,
      enableColumnFilter: false,
      enableSorting: false,
    }),
    columnHelper.accessor('fileName', {
      header: () => <span>Name</span>,
      cell: (info) => (
        <span className="max-w-[140px] truncate whitespace-nowrap py-4 px-3 text-sm font-medium">
          {info.getValue()}
        </span>
      ),
    }),
    columnHelper.accessor('uploadDate', {
      header: () => <span>Uploaded</span>,
      cell: (info) => (
        <div className="whitespace-nowrap py-4 px-3 text-sm text-gray-500">{info.getValue()}</div>
      ),
    }),
    columnHelper.accessor('wordCount', {
      header: () => <span>Words</span>,
      cell: (info) => (
        <div className="whitespace-nowrap py-4 px-3 text-sm text-gray-500">{info.getValue()}</div>
      ),
      // is sorting different from rest because number?
    }),
    columnHelper.accessor('contentType', {
      header: () => <span>Type</span>,
      cell: (info) => (
        <div className="whitespace-nowrap py-4 px-3 text-sm text-gray-500">{info.getValue()}</div>
      ),
      // TODO - add custom filter prop - https://github.com/TanStack/table/discussions/4018
    }),
    columnHelper.display({
      id: 'delete',
      header: () => <span className="sr-only">Delete</span>,
      cell: ({ row }) => (
        <div className="flex justify-end whitespace-nowrap py-4 px-3 text-right text-sm font-medium sm:pr-6 lg:pr-8">
          <button
            onClick={() => {
              setIsSingleDeleteOpen(true);
              setFileToDelete(row.original.metadataId);
            }}
            type="button"
            className="text-indigo-600 hover:text-indigo-900"
          >
            Delete<span className="sr-only truncate">, {row.original.fileName}</span>
          </button>
        </div>
      ),
    }),
  ];

  function mapFileMetadataToTable(metadata: FileMetadata[]): FileTable[] {
    return metadata.map((file) => ({
      metadataId: file.metadataId,
      fileName: file.fileName,
      uploadDate: file.uploadDate.toDateString(),
      wordCount: file.wordCount,
      contentType: file.contentType,
    }));
  }

  const table = useReactTable({
    data: useMemo(() => mapFileMetadataToTable(fileMetadata || []), [fileMetadata]),
    columns,
    state: {
      sorting,
      globalFilter,
      columnVisibility,
      rowSelection,
    },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    onColumnVisibilityChange: setColumnVisibility,
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    debugTable: true,
  });

  // notifications
  const { notification, showSuccessNotification, showErrorNotification, showLoadingNotification } =
    useNotification();

  const [fileToDelete, setFileToDelete] = useState('');
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isSingleDeleteOpen, setIsSingleDeleteOpen] = useState(false);

  function handleBulkDelete(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    showLoadingNotification('Deleting files...');
    // Get the ids of the selected files
    const ids = Object.entries(rowSelection)
      .filter(([key, value]) => value)
      .map(([id]) => {
        const row = table.getRow(id);
        return row?.original?.metadataId;
      })
      .filter((metadataId) => !!metadataId);

    // Call the mutation to delete the selected files
    mutate({ ids });

    // Reset the state
    setRowSelection({});
    setIsDeleteModalOpen(false);
  }

  function handleDelete(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    showLoadingNotification('Deleting file...');
    // Call the mutation to delete the selected files
    mutate({ ids: [fileToDelete] });

    // Reset the selected files state
    setRowSelection({});
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

      <div>
        <div className="flex flex-wrap items-center gap-4">
          <DebouncedInput
            value={globalFilter ?? ''}
            onChange={(value) => setGlobalFilter(String(value))}
            className="font-lg border-block border p-2 shadow"
            placeholder="Search all columns..."
          />
          {Object.keys(rowSelection).length > 0 && (
            <button
              onClick={() => setIsDeleteModalOpen(true)}
              type="button"
              className="z-20 inline-flex items-center rounded bg-white px-2 py-1 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-white"
              disabled={Object.keys(rowSelection).length === 0}
            >
              Bulk delete
            </button>
          )}
        </div>
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
              <div className="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
                <div className="inline-block min-w-full py-2 align-middle">
                  <div className="relative max-h-96 overflow-auto">
                    <table className="h-full min-w-full border-separate border-spacing-0">
                      <thead>
                        {table.getHeaderGroups().map((headerGroup) => (
                          <tr key={headerGroup.id}>
                            {headerGroup.headers.map((header) => {
                              return (
                                <th
                                  key={header.id}
                                  colSpan={header.colSpan}
                                  scope="col"
                                  className="sticky top-0 z-10 border-b border-gray-300 bg-white bg-opacity-75 py-3.5 px-3 text-left text-sm font-semibold text-black backdrop-blur backdrop-filter"
                                >
                                  {header.isPlaceholder ? null : (
                                    <>
                                      <div
                                        {...{
                                          className: header.column.getCanSort()
                                            ? 'cursor-pointer select-none group inline-flex items-center'
                                            : '',
                                          onClick: header.column.getToggleSortingHandler(),
                                        }}
                                      >
                                        {flexRender(
                                          header.column.columnDef.header,
                                          header.getContext()
                                        )}
                                        {{
                                          // show on hover
                                          asc: (
                                            <span className="ml-2 rounded bg-gray-100 text-gray-900">
                                              <ChevronDownIcon
                                                className="h-5 w-5"
                                                aria-hidden="true"
                                              />
                                            </span>
                                          ),
                                          desc: (
                                            <span className="ml-2 rounded bg-gray-100 text-gray-900">
                                              <ChevronUpIcon
                                                className="h-5 w-5"
                                                aria-hidden="true"
                                              />
                                            </span>
                                          ),
                                        }[header.column.getIsSorted() as string] ??
                                          (header.column.getCanSort() ? (
                                            <span className="invisible ml-2 rounded text-gray-900 group-hover:visible">
                                              <ChevronDownIcon
                                                className="h-5 w-5"
                                                aria-hidden="true"
                                              />
                                            </span>
                                          ) : null)}
                                      </div>
                                    </>
                                  )}
                                </th>
                              );
                            })}
                          </tr>
                        ))}
                      </thead>
                      <tbody>
                        {table.getRowModel().rows.map((row) => {
                          return (
                            <tr
                              key={row.id}
                              className={row.getIsSelected() ? 'bg-gray-50' : undefined}
                            >
                              {row.getVisibleCells().map((cell) => {
                                return (
                                  <td key={cell.id} className="h-full p-0">
                                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                  </td>
                                );
                              })}
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
