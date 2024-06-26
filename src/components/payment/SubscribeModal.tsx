import { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { useAtom } from 'jotai';
import { api } from '~/utils/api';

import LoadingBars from '../ui/LoadingBars';
import ProrationStage from './ProrationStage';
import { modalStageAtom } from './SubscribeButton';
import SwapStage from './SwapStage';

interface ModalProps {
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
}

export default function SubscribeModal({ onSubmit }: ModalProps) {
  const [modalStage, setModalStage] = useAtom(modalStageAtom);

  const { data, isLoading: isLoadingSubscription } = api.user.getActiveSubscription.useQuery();
  const activeSubscription = data?.activeSubscription?.[0];
  const credits = data?.credits;

  // TODO add delayed subscription change back
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
                {isLoadingSubscription || !credits ? (
                  <div className="flex h-[464px] justify-center">
                    <LoadingBars />
                  </div>
                ) : (
                  <>
                    {modalStage === 1 && <SwapStage />}
                    {modalStage === 2 && <div>Delayed change</div>}
                    {modalStage === 3 && (
                      <ProrationStage
                        activeSubscription={activeSubscription}
                        credits={credits}
                        onSubmit={onSubmit}
                      />
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
