/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { getProrationAmount } from '@/utils/payments';
import { api } from '@/utils/api';
import { Dialog } from '@headlessui/react';
import { useAtomValue, useSetAtom } from 'jotai';
import { frequencyAtom, selectedAmountAtom, selectedTierAtom } from './Plans';
import { modalStageAtom } from './SubscribeButton';

interface ModalProps {
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
  activeSubscription: any; // FIXME - RouterOutputs for type?
  credits: number;
}

export default function ProrationModal({ onSubmit, activeSubscription, credits }: ModalProps) {
  const setModalStage = useSetAtom(modalStageAtom);
  const selectedTier = useAtomValue(selectedTierAtom);
  const selectedAmount = useAtomValue(selectedAmountAtom) / 100;
  const frequency = useAtomValue(frequencyAtom);

  const { data: subscribedProductCredits, isLoading } = api.stripe.getCreditsForProduct.useQuery(
    {
      productId: activeSubscription?.price?.product.id as string,
    },
    { enabled: !!activeSubscription?.price?.product.id }
  );

  console.log(activeSubscription, 'activeSubscription');

  const subscriptionPrice = activeSubscription?.price?.unit_amount / 100;
  const subscribedProductName = activeSubscription?.price?.product.name;
  const subscribedProductId = activeSubscription?.price?.product.id;
  console.log(subscribedProductId, 'subscribedProductId');

  const prorationAmount = getProrationAmount(credits, subscribedProductCredits, subscriptionPrice);

  console.log(prorationAmount, 'prorationAmount');

  isLoading && <div>Loading...</div>;

  return (
    <form onSubmit={(e) => onSubmit(e)}>
      <div className="sm:flex sm:items-start">
        <div className="mt-3 text-center sm:mt-0 sm:text-left">
          <Dialog.Title as="h3" className="text-base font-semibold leading-6 text-gray-900">
            Subscribe
          </Dialog.Title>
          <div className="mt-1">
            <p className="max-w-prose text-sm text-gray-500">
              Any remaining credits this month will be credited towards the new plan. You will be
              charged immediately for your new plan.
            </p>
          </div>
        </div>
      </div>
      <ul role="list" className="mt-4 divide-y divide-gray-200 rounded-lg bg-gray-100 py-3">
        <li key={1} className="flex justify-between py-2 px-4">
          <div>
            <p className="text-sm font-medium text-gray-900">From {subscribedProductName} Plan</p>
            <p className="text-sm text-gray-500">Unused Credits</p>
          </div>
          <div className="flex items-end">
            <p className="text-green-600">+${prorationAmount}</p>
          </div>
        </li>
        <li key={2} className="flex justify-between px-4 py-2">
          <div>
            <p className="text-sm font-medium text-gray-900">To {selectedTier?.name} Plan</p>
            <p className="text-sm text-gray-500">Price of plan</p>
          </div>
          <div className="flex items-end">
            <p className="text-red-600">
              ${selectedAmount} / {frequency.value === 'monthly' ? 'month' : 'year'}
            </p>
          </div>
        </li>
      </ul>
      <ul role="list" className="divide-y divide-gray-200 pb-4 pt-2">
        <li key={1} className="flex justify-between py-2 px-4">
          <div>
            <p className="text-sm font-medium text-gray-900">Subtotal</p>
            <p className="text-sm text-gray-500">Tax</p>
          </div>
          <div>
            <p className="text-gray-500">${selectedAmount - prorationAmount}</p>
            <p className="text-gray-500">$0</p>
          </div>
        </li>
        <li key={2} className="flex justify-between px-4 py-2">
          <div>
            <p className="text-sm font-medium text-gray-900">Amount Due</p>
          </div>
          <div>
            <p className="text-gray-500">${selectedAmount - prorationAmount}</p>
          </div>
        </li>
      </ul>
      <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
        <button
          type="submit"
          className="inline-flex w-full justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 sm:ml-3 sm:w-auto"
        >
          Subscribe
        </button>
        <button
          type="button"
          className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto"
          onClick={() => setModalStage(1)}
        >
          Back
        </button>
      </div>
    </form>
  );
}
