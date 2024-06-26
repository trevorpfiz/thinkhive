/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */

import { useEffect, useState } from 'react';
import { Dialog } from '@headlessui/react';
import { useAtomValue, useSetAtom } from 'jotai';
import { api } from '~/utils/api';
import { getProrationAmountsAnnual, getProrationAmountsMonthly } from '~/utils/payments';

import LoadingBars from '../ui/LoadingBars';
import { frequencyAtom, selectedAmountAtom, selectedTierAtom } from './Plans';
import { modalStageAtom } from './SubscribeButton';

interface ModalProps {
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
  activeSubscription: any; // FIXME - RouterOutputs for type?
  credits: number;
}

export default function ProrationStage({ onSubmit, activeSubscription, credits }: ModalProps) {
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

  const [prorationAmounts, setProrationAmounts] = useState<{
    monthly: { proration: number; total: number };
    annual: { proration: number; total: number };
  } | null>(null);

  const subscriptionPrice = activeSubscription?.price?.unit_amount / 100;
  const subscribedProductName = activeSubscription?.price?.product.name;
  const subscribedProductId = activeSubscription?.price?.product.id;
  const annualProration =
    frequency?.value === 'annual' && activeSubscription.price.interval === 'year';

  useEffect(() => {
    if (subscribedProductCredits !== undefined) {
      setProrationAmounts({
        monthly: getProrationAmountsMonthly(
          credits,
          subscribedProductCredits,
          subscriptionPrice,
          selectedAmount
        ),
        annual: getProrationAmountsAnnual(
          credits,
          subscribedProductCredits,
          subscriptionPrice,
          activeSubscription?.current_period_end as number,
          selectedAmount
        ),
      });
    }
  }, [subscribedProductCredits, credits, subscriptionPrice, selectedAmount, activeSubscription]);

  return (
    <form onSubmit={(e) => onSubmit(e)}>
      {isLoading || !prorationAmounts ? (
        <div className="flex h-[464px] justify-center">
          <LoadingBars />
        </div>
      ) : (
        <>
          <div className="sm:flex sm:items-start">
            <div className="mt-3 text-center sm:mt-0 sm:text-left">
              <Dialog.Title as="h3" className="text-base font-semibold leading-6 text-gray-900">
                Subscribe
              </Dialog.Title>
              <div className="mt-1">
                <p className="max-w-prose text-sm text-gray-500">
                  Any remaining credits this month will be credited towards the new plan. You will
                  be charged immediately for your new plan.
                </p>
              </div>
            </div>
          </div>
          <ul role="list" className="mt-4 divide-y divide-gray-200 rounded-lg bg-gray-100 py-3">
            <li key={1} className="flex justify-between py-2 px-4">
              <div>
                <p className="text-sm font-medium text-gray-900">
                  From {subscribedProductName} Plan
                </p>
                <p className="text-sm text-gray-500">Unused Credits</p>
              </div>
              <div className="flex items-end">
                <p className="text-green-600">
                  +$
                  {annualProration
                    ? prorationAmounts.annual.proration
                    : prorationAmounts.monthly.proration}
                </p>
              </div>
            </li>
            <li key={2} className="flex justify-between px-4 py-2">
              <div>
                <p className="text-sm font-medium text-gray-900">To {selectedTier?.name} Plan</p>
                <p className="text-sm text-gray-500">Price of plan</p>
              </div>
              <div className="flex items-end">
                <p className="text-red-600">
                  {`$${selectedAmount} / ${frequency.value === 'monthly' ? 'month' : 'year'}`}
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
                <p className="text-gray-500">
                  $
                  {annualProration ? prorationAmounts.annual.total : prorationAmounts.monthly.total}
                </p>
                <p className="text-gray-500">$0</p>
              </div>
            </li>
            <li key={2} className="flex justify-between px-4 py-2">
              <div>
                <p className="text-sm font-medium text-gray-900">Amount Due</p>
              </div>
              <div>
                <p className="text-gray-500">
                  $
                  {annualProration ? prorationAmounts.annual.total : prorationAmounts.monthly.total}
                </p>
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
              onClick={() => setModalStage(0)}
            >
              Cancel
            </button>
          </div>
        </>
      )}
    </form>
  );
}
