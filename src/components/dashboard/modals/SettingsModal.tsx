import { Fragment, useEffect, useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { PencilSquareIcon, XMarkIcon } from '@heroicons/react/24/outline';

import type { Visibility } from '@prisma/client';
import type { ChangeEvent } from 'react';

export interface SettingsData {
  initialMessages: string;
  domains: string;
  visibility: Visibility;
  systemMessage: string;
}

interface ModalProps {
  modal: [boolean, React.Dispatch<React.SetStateAction<boolean>>];
  formData: [SettingsData, React.Dispatch<React.SetStateAction<SettingsData>>];
  onChange: (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => void;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
}

export default function SettingsModal({ modal, formData, onChange, onSubmit }: ModalProps) {
  const [open, setOpen] = modal;
  const [{ initialMessages, domains, visibility, systemMessage }, setData] = formData;

  const [initialMessagesArray, setInitialMessagesArray] = useState(initialMessages.split('\n'));

  const addMessageInput = () => {
    if (initialMessagesArray.length < 3) {
      setInitialMessagesArray([...initialMessagesArray, '']);
    }
  };

  const handleInitialMessagesChange = (event: ChangeEvent<HTMLInputElement>, index: number) => {
    const newInitialMessagesArray = initialMessagesArray.map((message, i) =>
      i === index ? event.target.value : message
    );
    setInitialMessagesArray(newInitialMessagesArray);
    setData((prevState) => ({
      ...prevState,
      initialMessages: newInitialMessagesArray.join('\n'),
    }));
  };

  const handleRemoveMessage = (index: number) => {
    const newInitialMessagesArray = initialMessagesArray.filter((_, i) => i !== index);
    setInitialMessagesArray(newInitialMessagesArray);
    setData((prevState) => ({
      ...prevState,
      initialMessages: newInitialMessagesArray.join('\n'),
    }));
  };

  useEffect(() => {
    setInitialMessagesArray(initialMessages.split('\n'));
  }, [initialMessages]);

  return (
    <Transition.Root show={open} as={Fragment}>
      <Dialog as="div" className="relative z-30" onClose={setOpen}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
        </Transition.Child>

        <div className="fixed inset-0 z-30 overflow-y-auto">
          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white px-4 pt-5 pb-4 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6">
                <div className="absolute top-0 right-0 hidden pt-4 pr-4 sm:block">
                  <button
                    type="button"
                    className="rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                    onClick={() => setOpen(false)}
                  >
                    <span className="sr-only">Close</span>
                    <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                  </button>
                </div>
                <form onSubmit={(e) => onSubmit(e)}>
                  <div className="sm:flex sm:items-start">
                    <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-indigo-100 sm:mx-0 sm:h-10 sm:w-10">
                      <PencilSquareIcon className="h-6 w-6 text-indigo-600" aria-hidden="true" />
                    </div>
                    <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                      <Dialog.Title
                        as="h3"
                        className="text-base font-semibold leading-6 text-gray-900"
                      >
                        Settings
                      </Dialog.Title>
                      <div className="mt-1">
                        <p className="text-sm text-gray-500">
                          Which settings would you like to change?
                        </p>
                      </div>
                    </div>
                  </div>
                  {/* Settings */}
                  <div className="mt-5 flex flex-col gap-1">
                    <label
                      htmlFor="initial-messages"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Initial chat messages (maximum 3 messages)
                    </label>
                    {initialMessagesArray.map((message, index) => (
                      <div key={index} className="flex items-center justify-center">
                        <input
                          type="text"
                          name={`initialMessage${index}`}
                          id={`initial-message-${index}`}
                          className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                          value={message}
                          onChange={(event) => handleInitialMessagesChange(event, index)}
                          placeholder={`Message ${index + 1}`}
                          maxLength={1000}
                          minLength={1}
                          required
                        />
                        {initialMessagesArray.length > 1 && (
                          <button
                            type="button"
                            className="ml-2 inline-flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-white hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-2"
                            onClick={() => handleRemoveMessage(index)}
                          >
                            <span className="sr-only">Remove message</span>
                            <XMarkIcon className="h-4 w-4" aria-hidden="true" />
                          </button>
                        )}
                      </div>
                    ))}
                    <button
                      type="button"
                      className="mt-2 inline-flex w-16 justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
                      onClick={addMessageInput}
                      disabled={initialMessagesArray.length >= 3}
                    >
                      Add
                    </button>
                  </div>
                  {/* Whitelisted domains input */}
                  <div className="mt-5">
                    <label
                      htmlFor="whitelisted-domains"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Whitelisted domains for website chatbot (separate each domain with a comma)
                    </label>
                    <input
                      type="text"
                      name="domains"
                      id="whitelisted-domains"
                      className="mt-1 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                      value={domains}
                      onChange={onChange}
                      placeholder="example.com,example2.com"
                    />
                  </div>
                  {/* Visibility setting */}
                  <div className="mt-5">
                    <label htmlFor="visibility" className="block text-sm font-medium text-gray-700">
                      Playground Visibility
                    </label>
                    <select
                      id="visibility"
                      name="visibility"
                      className="mt-1 block w-full border-0 bg-white py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                      value={visibility}
                      onChange={onChange}
                    >
                      <option value="PUBLIC">Public</option>
                      <option value="PRIVATE">Private</option>
                    </select>
                  </div>
                  {/* System message setting */}
                  <div className="mt-5">
                    <label
                      htmlFor="system-message"
                      className="block text-sm font-medium text-gray-700"
                    >
                      System message
                    </label>
                    <textarea
                      id="system-message"
                      name="systemMessage"
                      className="mt-1 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                      value={systemMessage}
                      onChange={onChange}
                      maxLength={500}
                      placeholder="A system message will modify the performance and behavior of your expert."
                    />
                  </div>
                  {/* Save and Cancel buttons */}
                  <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                    <button
                      type="submit"
                      className="inline-flex w-full justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 sm:ml-3 sm:w-auto"
                    >
                      Save
                    </button>
                    <button
                      type="button"
                      className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto"
                      onClick={() => setOpen(false)}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
}
