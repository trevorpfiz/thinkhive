import React, { Fragment, useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { PencilSquareIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { useAtom } from 'jotai';
import { modalStageAtom, swapImmediatelyAtom } from './SubscribeButton';

const timeframes = [
  { id: 'delayed', title: 'Swap at end of subscription period', swapImmediately: false },
  { id: 'immediately', title: 'Swap immediately with proration', swapImmediately: true },
];

interface Timeframe {
  id: string;
  title: string;
  swapImmediately: boolean;
}

export default function SwapModal() {
  const [modalStage, setModalStage] = useAtom(modalStageAtom);
  const [swapImmediately, setSwapImmediately] = useAtom(swapImmediatelyAtom);
  const [selectedTimeframe, setSelectedTimeframe] = useState<Timeframe>(timeframes[0]!);

  const handleNext = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSwapImmediately(selectedTimeframe.swapImmediately);
    setModalStage(selectedTimeframe.swapImmediately ? 3 : 2);
  };

  const handleRadioChange = (timeframe: Timeframe) => {
    setSelectedTimeframe(timeframe);
  };

  return (
    <Transition.Root show={modalStage === 1} as={Fragment}>
      <Dialog as="div" className="relative z-30" onClose={() => setModalStage(0)}>
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
                    onClick={() => setModalStage(0)}
                  >
                    <span className="sr-only">Close</span>
                    <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                  </button>
                </div>
                <div>
                  <label className="text-base font-semibold text-gray-900">
                    Choose your timeframe
                  </label>
                  <p className="text-sm text-gray-500">{`Changing plan now will prorate your unused credits, crediting them towards the next month's cost.`}</p>
                  <form onSubmit={handleNext}>
                    {/* ... rest of the content */}
                    <fieldset className="mt-4">
                      <legend className="sr-only">Choose your timeframe</legend>
                      <div className="space-y-4">
                        {timeframes.map((timeframe) => (
                          <label key={timeframe.id} className="flex cursor-pointer items-center">
                            <input
                              id={timeframe.id}
                              name="timeframe"
                              type="radio"
                              checked={selectedTimeframe.id === timeframe.id}
                              onChange={() => handleRadioChange(timeframe)}
                              className="h-4 w-4 border-gray-300 text-indigo-600 focus:ring-indigo-600"
                            />
                            <span className="ml-3 block text-sm font-medium leading-6 text-gray-900">
                              {timeframe.title}
                            </span>
                          </label>
                        ))}
                      </div>
                    </fieldset>
                    <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                      <button
                        type="submit"
                        className="inline-flex w-full justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 sm:ml-3 sm:w-auto"
                      >
                        Next
                      </button>
                      <button
                        type="button"
                        className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto"
                        onClick={() => setModalStage(0)}
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
}
