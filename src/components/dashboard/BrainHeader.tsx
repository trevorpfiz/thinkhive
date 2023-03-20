/* eslint-disable @typescript-eslint/ban-ts-comment */
import { Fragment, useState } from 'react';
import { Menu, Transition } from '@headlessui/react';
import { EllipsisVerticalIcon } from '@heroicons/react/20/solid';
import { useRouter } from 'next/router';

import { api } from '@/utils/api';
import RenameModal from './RenameModal';
import ConfirmDeleteModal from './ConfirmDeleteModal';
import Button from '../ui/Button';
import Notification from '../ui/Notification';
import useNotification from '@/hooks/useNotification';

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}

export default function BrainHeader({ brainId }: { brainId: string }) {
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [formData, setFormData] = useState('');

  const { isError, data: brain, error } = api.brain.getBrain.useQuery({ id: brainId });

  const utils = api.useContext();
  const { mutate } = api.brain.renameBrain.useMutation({
    // FIXME - optimistic update is not working
    async onMutate(newBrain) {
      // Cancel outgoing fetches (so they don't overwrite our optimistic update)
      await utils.brain.getBrain.cancel();

      // Get the data from the queryCache
      const prevData = utils.brain.getBrain.getData();

      // Optimistically update the data with our new name
      // @ts-ignore
      utils.brain.getBrain.setData(undefined, (old) => newBrain);

      // Return the previous data so we can revert if something goes wrong
      console.log(prevData, 'prevData');
      return { prevData };
    },
    onError(err, newPost, ctx) {
      showErrorNotification('Error Renaming Brain', err.message);
      // If the mutation fails, use the context-value from onMutate
      // @ts-ignore
      utils.brain.getBrain.setData(undefined, ctx?.prevData);
    },
    onSettled() {
      // Sync with server once mutation has settled
      void utils.brain.getBrain.invalidate();
    },
  });

  const { mutate: deleteBrain } = api.brain.deleteBrain.useMutation({
    onSuccess() {
      // Refetch the query after a successful unlearn
      void utils.brain.getBrains.invalidate();
    },
    onError: (errorDelete) => {
      showErrorNotification('Error Deleting Brain', errorDelete.message);
    },
  });

  // notifications
  const { notification, showErrorNotification } = useNotification();

  // handlers
  function handleRename(e: React.FormEvent<HTMLFormElement>, inputValue: string) {
    e.preventDefault();
    if (brain?.id) {
      mutate({ id: brain?.id, name: inputValue });
    }

    setIsModalOpen(false);
  }

  function handleDelete(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (brain?.id) {
      deleteBrain({ id: brain?.id });

      // Redirect the user to the new page
      void router.push('/dashboard/brains');
    }
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
      <RenameModal
        modal={[isModalOpen, setIsModalOpen]}
        formData={[formData, setFormData]}
        onSubmit={handleRename}
      />
      <ConfirmDeleteModal
        modal={[isDeleteModalOpen, setIsDeleteModalOpen]}
        onSubmit={handleDelete}
      />
      <div className="border-b border-gray-200 py-4 px-2">
        <div className="sm:flex sm:items-center sm:justify-between">
          <div className="mr-4 inline-block h-10 w-10 rounded-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>
          <div className="sm:w-0 sm:flex-1">
            <h1 id="message-heading" className="text-base font-semibold leading-6 text-gray-900">
              {brain?.name}
            </h1>
            {brain?.files && brain?.files.length > 0 ? (
              <p className="mt-1 truncate text-sm text-gray-500">
                Brain has {brain?.files.length} files
              </p>
            ) : (
              <p className="mt-1 truncate text-sm text-gray-500">
                Brain is hungry for some knowledge
              </p>
            )}
          </div>

          <div className="mt-4 flex items-center justify-between sm:mt-0 sm:ml-6 sm:flex-shrink-0 sm:justify-start">
            <Button
              href={`/dashboard/experts`}
              target="_blank"
              intent="solidSlate"
              className="ml-6 rounded-md"
            >
              Attach
            </Button>
            <Menu as="div" className="relative ml-6 inline-block text-left">
              <div>
                <Menu.Button className="-my-2 flex items-center rounded-full bg-white p-2 text-gray-400 shadow hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500">
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
