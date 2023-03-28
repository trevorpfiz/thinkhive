// TierCard.tsx
import { SubscribeButton } from './SubscribeButton';
import { CheckIcon } from '@heroicons/react/20/solid';
import { frequencyAtom, type Tier } from './Plans';
import { useAtomValue } from 'jotai';

interface Interval {
  monthly: string;
  annual: string;
}

interface TierCardProps {
  tier: Tier;
  hasActiveSubscription: boolean;
}

export const TierCard: React.FC<TierCardProps> = ({ tier, hasActiveSubscription }) => {
  const frequency = useAtomValue(frequencyAtom);
  const isSubscribedPrice = tier.isSubscribedPrice[frequency.value as keyof Interval] || false;
  const isSubscribedProduct = tier.isSubscribedProduct;
  const priceId = tier.price[frequency.value as keyof Interval]?.priceId || '';

  return (
    <div key={tier.id} className="rounded-3xl bg-white p-8 shadow ring-1 ring-gray-200 xl:p-10">
      <div className="flex items-center justify-between gap-x-4">
        <h3 id={tier.id} className="text-lg font-semibold leading-8 text-gray-900">
          {tier.name}
        </h3>
      </div>
      <p className="mt-4 min-h-[50px] text-sm leading-6 text-gray-600">{tier.description}</p>
      <p className="mt-6 flex items-baseline gap-x-1">
        <span className="text-4xl font-bold tracking-tight text-gray-900">
          {tier.price[frequency?.value as keyof Interval]
            ? `$${tier.price[frequency?.value as keyof Interval].amount / 100}`
            : '$0'}
        </span>
        <span className="text-sm font-semibold leading-6 text-gray-600">
          {frequency?.priceSuffix}
        </span>
      </p>
      <SubscribeButton
        priceId={priceId}
        isSubscribedPrice={isSubscribedPrice}
        isSubscribedProduct={isSubscribedProduct}
        hasActiveSubscription={hasActiveSubscription}
        tier={tier}
        amount={tier.price[frequency?.value as keyof Interval]?.amount || 0}
      />
      <ul role="list" className="mt-8 space-y-3 text-sm leading-6 text-gray-600 xl:mt-10">
        {tier.features.map((feature) => (
          <li key={feature} className="flex gap-x-3">
            <CheckIcon className="h-6 w-5 flex-none text-indigo-600" aria-hidden="true" />
            {feature}
          </li>
        ))}
      </ul>
    </div>
  );
};
