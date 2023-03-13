/* eslint-disable @typescript-eslint/ban-ts-comment */
import { Fragment, useState } from 'react';
import { Menu, Transition } from '@headlessui/react';
import { EllipsisVerticalIcon } from '@heroicons/react/20/solid';
import { api } from '@/utils/api';
import { useRouter } from 'next/router';
import RenameModal from './RenameModal';
import ConfirmDeleteModal from './ConfirmDeleteModal';

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}

export default function ExpertHeader({ expertId }: { expertId: string }) {
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [formData, setFormData] = useState('');

  const {
    isLoading,
    isError,
    data: expert,
    error,
  } = api.expert.getExpert.useQuery({ id: expertId });

  const utils = api.useContext();
  const { mutate } = api.expert.renameExpert.useMutation({
    // FIXME - optimistic update is not working
    async onMutate(newExpert) {
      // Cancel outgoing fetches (so they don't overwrite our optimistic update)
      await utils.expert.getExpert.cancel();

      // Get the data from the queryCache
      const prevData = utils.expert.getExpert.getData();

      // Optimistically update the data with our new name
      // @ts-ignore
      utils.expert.getExpert.setData(undefined, (old) => newExpert);

      // Return the previous data so we can revert if something goes wrong
      console.log(prevData, 'prevData');
      return { prevData };
    },
    onError(err, newPost, ctx) {
      // If the mutation fails, use the context-value from onMutate
      // @ts-ignore
      utils.expert.getExpert.setData(undefined, ctx?.prevData);
    },
    onSettled() {
      // Sync with server once mutation has settled
      void utils.expert.getExpert.invalidate();
    },
  });

  const { mutate: deleteExpert } = api.expert.deleteExpert.useMutation({
    onSuccess() {
      // Refetch the query after a successful unassign
      void utils.expert.getExperts.invalidate();
    },
    onError: () => {
      console.error('Error!');
    },
  });

  function handleRename(e: React.FormEvent<HTMLFormElement>, inputValue: string) {
    e.preventDefault();
    if (expert?.id) {
      mutate({ id: expert?.id, name: inputValue });
    }

    setIsModalOpen(false);
  }

  function handleDelete(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (expert?.id) {
      deleteExpert({ id: expert?.id });

      // Redirect the user to the new page
      void router.push('/dashboard/experts');
    }
  }

  if (isError) {
    return <span>Error: {error.message}</span>;
  }

  return (
    <>
      <RenameModal
        modal={[isModalOpen, setIsModalOpen]}
        formData={[formData, setFormData]}
        onSubmit={handleRename}
      />
      <ConfirmDeleteModal
        modal={[isDeleteModalOpen, setIsDeleteModalOpen]}
        onSubmit={handleDelete}
      />
      <div className="border-b border-gray-200 pb-5">
        <div className="sm:flex sm:items-center sm:justify-between">
          <div className="mr-4 inline-block h-10 w-10 rounded-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>
          <div className="sm:w-0 sm:flex-1">
            <h1 id="message-heading" className="text-base font-semibold leading-6 text-gray-900">
              {expert?.name}
            </h1>
            {expert?.brains && expert?.brains.length > 0 ? (
              <p className="mt-1 truncate text-sm text-gray-500">
                Expert has {expert?.brains.length} brains
              </p>
            ) : (
              <p className="mt-1 truncate text-sm text-gray-500">Expert is looking for its brain</p>
            )}
          </div>

          <div className="mt-4 flex items-center justify-between sm:mt-0 sm:ml-6 sm:flex-shrink-0 sm:justify-start">
            <span className="inline-flex items-center rounded-full bg-green-100 px-3 py-0.5 text-sm font-medium text-green-800">
              Active
            </span>
            <Menu as="div" className="relative ml-3 inline-block text-left">
              <div>
                <Menu.Button className="-my-2 flex items-center rounded-full bg-white p-2 text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500">
                  <span className="sr-only">Open options</span>
                  <EllipsisVerticalIcon className="h-5 w-5" aria-hidden="true" />
                </Menu.Button>
              </div>

              <Transition
                as={Fragment}
                enter="transition ease-out duration-100"
                enterFrom="transform opacity-0 scale-95"
                enterTo="transform opacity-100 scale-100"
                leave="transition ease-in duration-75"
                leaveFrom="transform opacity-100 scale-100"
                leaveTo="transform opacity-0 scale-95"
              >
                <Menu.Items className="absolute right-0 z-10 mt-2 w-56 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                  <div className="py-1">
                    <Menu.Item>
                      {({ active }) => (
                        <button
                          onClick={() => setIsModalOpen(true)}
                          type="button"
                          className={classNames(
                            active ? 'bg-gray-100 text-gray-900' : 'text-gray-700',
                            'flex w-full justify-between px-4 py-2 text-sm'
                          )}
                        >
                          <span>Rename</span>
                        </button>
                      )}
                    </Menu.Item>
                    <Menu.Item>
                      {({ active }) => (
                        <button
                          type="button"
                          className={classNames(
                            active ? 'bg-gray-100 text-gray-900' : 'text-gray-700',
                            'flex w-full justify-between px-4 py-2 text-sm'
                          )}
                        >
                          <span>Deactivate</span>
                        </button>
                      )}
                    </Menu.Item>
                    <Menu.Item>
                      {({ active }) => (
                        <button
                          onClick={() => setIsDeleteModalOpen(true)}
                          type="button"
                          className={classNames(
                            active ? 'bg-gray-100 text-gray-900' : 'text-gray-700',
                            'flex w-full justify-between px-4 py-2 text-sm'
                          )}
                        >
                          <span>Delete</span>
                        </button>
                      )}
                    </Menu.Item>
                  </div>
                </Menu.Items>
              </Transition>
            </Menu>
          </div>
        </div>
      </div>
    </>
  );
}
