/* eslint-disable @typescript-eslint/ban-ts-comment */
import { Fragment, useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { Menu, Transition } from '@headlessui/react';
import { EllipsisVerticalIcon } from '@heroicons/react/20/solid';
import { Visibility } from '@prisma/client';

import type { SettingsData } from './modals/SettingsModal';
import useNotification from '@/hooks/useNotification';
import { api } from '@/utils/api';
import Button from '../ui/Button';
import Notification from '../ui/Notification';
import StatusBadge from '../ui/StatusBadge';
import VisibilityBadge from '../ui/VisibilityBadge';
import ConfirmDeleteModal from './modals/ConfirmDeleteModal';
import EmbedModal from './modals/EmbedModal';
import RenameModal from './modals/RenameModal';
import SettingsModal from './modals/SettingsModal';

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}

export default function ExpertHeader({ expertId }: { expertId: string }) {
  const router = useRouter();
  const [isEmbedOpen, setIsEmbedOpen] = useState(false);
  const [isRenameOpen, setIsRenameOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [renameData, setRenameData] = useState('');
  const [settingsData, setSettingsData] = useState<SettingsData>({
    initialMessages: 'Hello!',
    domains: '',
    visibility: Visibility.PRIVATE,
    systemMessage: '',
  });

  const { isError, data: expert, error } = api.expert.getExpert.useQuery({ id: expertId });
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
      showErrorNotification('Error Renaming Expert', err.message);
      // If the mutation fails, use the context-value from onMutate
      // @ts-ignore
      utils.expert.getExpert.setData(undefined, ctx?.prevData);
    },
    onSettled() {
      // Sync with server once mutation has settled
      void utils.expert.getExpert.invalidate();
    },
  });

  const { mutate: toggleStatus } = api.expert.toggleStatus.useMutation({
    onSuccess() {
      // Refetch the query after changing status
      void utils.expert.getExpert.invalidate();
    },
    onError: (errorStatus) => {
      showErrorNotification('Error Changing Status', errorStatus.message);
    },
  });

  const { mutate: changeSettings } = api.expert.changeSettings.useMutation({
    onSuccess() {
      showSuccessNotification('Settings changed!');
      // Refetch the query after a successful detach
      void utils.expert.getExpert.invalidate();
    },
    onError: (errorSettings) => {
      showErrorNotification('Error Changing Settings', errorSettings.message);
    },
  });

  const { mutate: deleteExpert } = api.expert.deleteExpert.useMutation({
    onSuccess() {
      // Refetch the query after a successful detach
      void utils.expert.getExperts.invalidate();
    },
    onError: (errorDelete) => {
      showErrorNotification('Error Deleting Expert', errorDelete.message);
    },
  });

  // notifications
  const { notification, showErrorNotification, showSuccessNotification, showLoadingNotification } =
    useNotification();

  // handlers
  function handleRename(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (expert?.id) {
      mutate({ id: expert?.id, name: renameData });
    }

    setIsRenameOpen(false);
  }

  function handleStatusChange() {
    if (expert?.status) {
      toggleStatus({ id: expert?.id });
    }
  }

  function handleSettings(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    showLoadingNotification('Changing settings...');
    console.log(settingsData, 'settingsData');
    if (expert?.id) {
      changeSettings({ id: expert?.id, settings: settingsData });
    }

    setIsSettingsOpen(false);
  }

  function handleSettingsChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) {
    const { name, value } = e.target;
    setSettingsData((prevSettings) => ({ ...prevSettings, [name]: value }));
  }

  function handleDelete(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (expert?.id) {
      deleteExpert({ id: expert?.id });

      // Redirect the user to the new page
      void router.push('/dashboard/experts');
    }
  }

  useEffect(() => {
    if (expert) {
      setRenameData(expert.name);
      setSettingsData({
        initialMessages: expert.initialMessages || 'Hello!',
        domains: expert.domains || '',
        visibility: expert.visibility || Visibility.PRIVATE,
        systemMessage: expert.systemMessage || '',
      });
    }
  }, [expert]);

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
      <EmbedModal modal={[isEmbedOpen, setIsEmbedOpen]} />
      <RenameModal
        modal={[isRenameOpen, setIsRenameOpen]}
        formData={[renameData, setRenameData]}
        onSubmit={handleRename}
      />
      <SettingsModal
        modal={[isSettingsOpen, setIsSettingsOpen]}
        formData={[settingsData, setSettingsData]}
        onChange={handleSettingsChange}
        onSubmit={handleSettings}
      />
      <ConfirmDeleteModal
        modal={[isDeleteModalOpen, setIsDeleteModalOpen]}
        onSubmit={handleDelete}
      />
      <div className="border-b border-gray-200 py-4 px-2">
        <div className="sm:flex sm:items-center sm:justify-between">
          <div className="mt-4 flex flex-wrap items-center justify-between gap-6 sm:mt-0 sm:ml-6 sm:flex-shrink-0 sm:justify-start">
            <div className="flex flex-wrap items-center">
              <div className="mr-4 inline-block h-10 w-10 rounded-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>
              <div>
                <h1
                  id="message-heading"
                  className="text-base font-semibold leading-6 text-gray-900"
                >
                  {expert?.name}
                </h1>
                {expert?.brains && expert?.brains.length > 0 ? (
                  <p className="mt-1 truncate text-sm text-gray-500">
                    Expert has {expert?.brains.length} brains
                  </p>
                ) : (
                  <p className="mt-1 truncate text-sm text-gray-500">
                    Expert is looking for its brain
                  </p>
                )}
              </div>
            </div>
            <div className="flex gap-4">
              <VisibilityBadge visibility={expert?.visibility} />
            </div>
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-between gap-6 sm:mt-0 sm:ml-6 sm:flex-shrink-0 sm:justify-start">
            <div className="flex gap-4">
              <Button
                onClick={() => setIsEmbedOpen(true)}
                target="_blank"
                intent="solidSlate"
                className="rounded-md"
              >
                Add to site
              </Button>
              <Button
                href={`/playground/${expertId}`}
                target="_blank"
                intent="solidSlate"
                className="rounded-md"
              >
                Playground
              </Button>
            </div>
            <Menu as="div" className="relative inline-block text-left">
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
                          onClick={() => setIsRenameOpen(true)}
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
                          onClick={() => setIsSettingsOpen(true)}
                          type="button"
                          className={classNames(
                            active ? 'bg-gray-100 text-gray-900' : 'text-gray-700',
                            'flex w-full justify-between px-4 py-2 text-sm'
                          )}
                        >
                          <span>Settings</span>
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
