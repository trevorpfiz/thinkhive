import { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { modalStageAtom } from './SubscribeButton';
import { useAtom, useAtomValue } from 'jotai';
import ProrationModal from './ProrationModal';
import SwapModal from './SwapModal';
import { selectedAmountAtom, selectedTierAtom } from './Plans';
import { api } from '@/utils/api';
import dayjs from 'dayjs';

interface ModalProps {
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
}

export default function SubscribeModal({ onSubmit }: ModalProps) {
  const [modalStage, setModalStage] = useAtom(modalStageAtom);
  const selectedTier = useAtomValue(selectedTierAtom);
  const selectedAmount = useAtomValue(selectedAmountAtom);

  const { data: activeSubscription, isLoading: isLoadingSubscription } =
    api.user.getActiveSubscription.useQuery();

  const subscriptionPrice = activeSubscription?.[0]?.price?.unit_amount;
  const subscribedProductName = activeSubscription?.[0]?.price?.product.name;
  const subscriptionFrequency = activeSubscription?.[0]?.price?.interval;
  const periodEnd = activeSubscription?.[0]?.current_period_end;
  const dueDate = dayjs(periodEnd).format('MMMM D, YYYY');
  // TODO per month
  return (
    <Transition.Root show={modalStage !== 0} as={Fragment}>
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
                {isLoadingSubscription ? (
                  <div>Loading...</div>
                ) : (
                  <>
                    {modalStage === 1 && <SwapModal />}
                    {modalStage === 2 && (
                      <form onSubmit={(e) => onSubmit(e)}>
                        <div className="sm:flex sm:items-start">
                          <div className="mt-3 text-center sm:mt-0 sm:text-left">
                            <Dialog.Title
                              as="h3"
                              className="text-base font-semibold leading-6 text-gray-900"
                            >
                              Subscribe
                            </Dialog.Title>
                            <div className="mt-1">
                              <p className="max-w-prose text-sm text-gray-500">
                                At the end of your billing cycle, your subscription plan will
                                automatically renew and update to your newly chosen plan.
                              </p>
                            </div>
                          </div>
                        </div>
                        <ul
                          role="list"
                          className="my-4 divide-y divide-gray-200 rounded-lg bg-gray-100 py-3"
                        >
                          <li key={1} className="flex justify-between py-2 px-4">
                            <div>
                              <p className="text-sm font-medium text-gray-900">
                                From {subscribedProductName} Plan
                              </p>
                              <p className="text-sm text-gray-500">Base price</p>
                            </div>
                            <div className="flex items-end">
                              <p className="text-gray-500">
                                ${subscriptionPrice / 100} / {subscriptionFrequency}
                              </p>
                            </div>
                          </li>
                          <li key={2} className="flex justify-between px-4 py-2">
                            <div>
                              <p className="text-sm font-medium text-gray-900">
                                To {selectedTier?.name} Plan
                              </p>
                              <p className="text-sm text-gray-500">Base price</p>
                            </div>
                            <div className="flex items-end">
                              <p className="text-gray-500">
                                ${selectedAmount / 100} / {subscriptionFrequency}
                              </p>
                            </div>
                          </li>
                        </ul>
                        <div className="flex flex-wrap items-center justify-between px-4 pb-6">
                          <p className="text-sm text-gray-500">
                            Amount due on on{' '}
                            <span className="font-medium italic text-gray-900">{dueDate}</span>.
                          </p>
                          <span className="text-gray-900">${selectedAmount / 100}</span>
                        </div>
                        <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                          <button
                            type="submit"
                            className="inline-flex w-full justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 sm:ml-3 sm:w-auto"
                          >
                            Confirm Change
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
                    )}
                    {modalStage === 3 && (
                      <ProrationModal activeSubscription={activeSubscription} onSubmit={onSubmit} />
                    )}
                  </>
                )}
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
}
