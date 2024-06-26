import { useMemo, useState } from 'react';
import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/20/solid';
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table';
import useNotification from '~/hooks/useNotification';
import { api } from '~/utils/api';

import type { FileMetadata } from '@prisma/client';
import type { SortingState, VisibilityState } from '@tanstack/react-table';
import Button from '../../ui/Button';
import LoadingBars from '../../ui/LoadingBars';
import Notification from '../../ui/Notification';
import DebouncedInput from './DebouncedInput';
import { type FileTable } from './FilesTable';
import IndeterminateCheckbox from './IndeterminateCheckbox';

const columnHelper = createColumnHelper<FileTable>();

export default function AvailableFiles({ brainId }: { brainId: string }) {
  const {
    isLoading,
    isError,
    data: files,
    error,
  } = api.brain.getUnlearnedFiles.useQuery({ id: brainId });

  const utils = api.useContext();

  const { mutate: learnMutate } = api.brain.learnFiles.useMutation({
    onSuccess() {
      showSuccessNotification('Brain successfully learned');
      // Refetch the query after a successful learn
      void utils.brain.getBrain.invalidate();
      void utils.brain.getUnlearnedFiles.invalidate();
    },
    onError: (errorLearn) => {
      showErrorNotification('Error Learning', errorLearn.message);
    },
  });

  // tanstack table
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState('');
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({
    metadataId: false,
    fileName: true,
    uploadDate: true,
    wordCount: true,
    contentType: false,
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
      sortingFn: 'alphanumeric',
    }),
    columnHelper.accessor('uploadDate', {
      header: () => <span>Uploaded</span>,
      cell: (info) => (
        <div className="whitespace-nowrap py-4 px-3 text-sm text-gray-500">
          {info.getValue().toDateString()}
        </div>
      ),
      sortingFn: 'datetime',
    }),
    columnHelper.accessor('wordCount', {
      header: () => <span>Words</span>,
      cell: (info) => (
        <div className="whitespace-nowrap py-4 px-3 text-sm text-gray-500">{info.getValue()}</div>
      ),
      sortDescFirst: false,
    }),
    columnHelper.accessor('contentType', {
      header: () => <span>Type</span>,
      cell: (info) => (
        <div className="whitespace-nowrap py-4 px-3 text-sm text-gray-500">{info.getValue()}</div>
      ),
      // TODO - add custom filter prop - https://github.com/TanStack/table/discussions/4018
    }),
    columnHelper.display({
      id: 'learn',
      header: () => <span className="sr-only">Learn</span>,
      cell: ({ row }) => (
        <div className="flex justify-end whitespace-nowrap py-4 px-3 text-right text-sm font-medium sm:pr-6 lg:pr-8">
          <button
            onClick={() => handleLearn([row.original.metadataId])}
            type="button"
            className="text-indigo-600 hover:text-indigo-900"
          >
            Learn<span className="sr-only truncate">, {row.original.fileName}</span>
          </button>
        </div>
      ),
    }),
  ];

  function mapFileMetadataToTable(metadata: FileMetadata[]): FileTable[] {
    return metadata.map((file) => ({
      metadataId: file.metadataId,
      fileName: file.fileName,
      uploadDate: file.uploadDate,
      wordCount: file.wordCount,
      contentType: file.contentType,
    }));
  }

  const table = useReactTable({
    data: useMemo(() => mapFileMetadataToTable(files || []), [files]),
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

  // handlers
  function handleLearn(metadataIds: string[]) {
    showLoadingNotification('Brain learning...');

    learnMutate({ brainId, ids: metadataIds });
    // Reset the selected files state
    setRowSelection({});
  }

  function handleBulkLearn() {
    showLoadingNotification('Brain learning...');
    // Get the ids of the selected files
    const ids = Object.entries(rowSelection)
      .filter(([key, value]) => value)
      .map(([id]) => {
        const row = table.getRow(id);
        return row?.original?.metadataId;
      })
      .filter((metadataId) => !!metadataId);
    // Call the learn mutation
    learnMutate({ brainId, ids });
    // Reset the selected files state
    setRowSelection({});
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

      <div className="flex-grow rounded-lg bg-white p-4 shadow sm:p-6 lg:p-8">
        <div className="sm:flex sm:items-center">
          <div className="sm:flex-auto">
            <h2 className="text-base font-semibold leading-6">Files</h2>
          </div>
        </div>
        <div className="mt-8 flow-root">
          {isLoading ? (
            <LoadingBars />
          ) : files && files.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-4 py-6">
              <p>Add some files!</p>
              <Button href="/dashboard/knowledge" intent="solidIndigo">
                Upload
              </Button>
            </div>
          ) : (
            <>
              <div className="my-2 mx-0 flex flex-wrap items-center gap-4 rounded-lg sm:-mx-2 lg:-mx-4">
                <DebouncedInput
                  value={globalFilter ?? ''}
                  onChange={(value) => setGlobalFilter(String(value))}
                  className="font-lg border-block border p-2 pl-8"
                  placeholder="Search all files..."
                />
                {Object.keys(rowSelection).length > 0 && (
                  <Button
                    onClick={handleBulkLearn}
                    type="button"
                    intent="solidIndigo"
                    className="z-20 rounded-none disabled:cursor-not-allowed disabled:opacity-30"
                    disabled={Object.keys(rowSelection).length === 0}
                  >
                    Bulk learn
                  </Button>
                )}
              </div>
              {/* table */}
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
            </>
          )}
        </div>
      </div>
    </>
  );
}
