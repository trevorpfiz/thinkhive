import { useState } from 'react';
import { RadioGroup } from '@headlessui/react';
import { CheckIcon } from '@heroicons/react/20/solid';
import { UpgradeButton } from './Upgrade';

const frequencies: Frequency[] = [
  { value: 'monthly', label: 'Monthly', priceSuffix: '/month' },
  { value: 'annual', label: 'Annually', priceSuffix: '/year' },
];
const tiers: Tier[] = [
  {
    name: 'Hangout',
    id: 'hangout',
    href: '#',
    price: { monthly: '$20', annual: '$220' },
    description: 'Ideal for small groups or individuals.',
    features: [
      '1,000 messages',
      '50,000 words uploaded',
      '3 Experts',
      'Deploy your own Discord bot',
    ],
    mostPopular: false,
  },
  {
    name: 'Community',
    id: 'community',
    href: '#',
    price: { monthly: '$100', annual: '$1,100' },
    description: 'Perfect for growing teams and communities.',
    features: [
      '25,000 messages',
      '100,000 words uploaded',
      '5 Experts',
      'Deploy your own Discord bot',
    ],
    mostPopular: true,
  },
  {
    name: 'Enterprise',
    id: 'enterprise',
    href: '#',
    price: { monthly: '$300', annual: '$3,300' },
    description: 'Designed for large organizations and enterprises.',
    features: [
      '100,000 messages',
      '1,000,000 words uploaded',
      '10 Experts',
      'Deploy your own Discord bot',
    ],
    mostPopular: false,
  },
];

interface Frequency {
  value: string;
  label: string;
  priceSuffix: string;
}

interface Price {
  monthly: string;
  annual: string;
}

interface Tier {
  name: string;
  id: string;
  href: string;
  price: Price;
  description: string;
  features: string[];
  mostPopular: boolean;
}

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}

export default function Plans() {
  const [frequency, setFrequency] = useState(frequencies[0]);

  return (
    <div className="bg-white py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="text-base font-semibold leading-7 text-indigo-600">Pricing</h2>
          <p className="mt-2 text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
            Pricing plans for teams of&nbsp;all&nbsp;sizes
          </p>
        </div>
        <p className="mx-auto mt-6 max-w-2xl text-center text-lg leading-8 text-gray-600">
          Choose an affordable plan that’s packed with the best features for engaging your audience,
          creating customer loyalty, and driving sales.
        </p>
        <div className="mt-16 flex justify-center">
          <RadioGroup
            value={frequency}
            onChange={setFrequency}
            className="grid grid-cols-2 gap-x-1 rounded-full p-1 text-center text-xs font-semibold leading-5 ring-1 ring-inset ring-gray-200"
          >
            <RadioGroup.Label className="sr-only">Payment frequency</RadioGroup.Label>
            {frequencies.map((option) => (
              <RadioGroup.Option
                key={option.value}
                value={option}
                className={({ checked }) =>
                  classNames(
                    checked ? 'bg-indigo-600 text-white' : 'text-gray-500',
                    'cursor-pointer rounded-full py-1 px-2.5'
                  )
                }
              >
                <span>{option.label}</span>
              </RadioGroup.Option>
            ))}
          </RadioGroup>
        </div>
        <div className="isolate mx-auto mt-10 grid max-w-md grid-cols-1 gap-8 lg:mx-0 lg:max-w-none lg:grid-cols-3">
          {tiers.map((tier) => (
            <div
              key={tier.id}
              className={classNames(
                tier.mostPopular ? 'ring-2 ring-indigo-600' : 'ring-1 ring-gray-200',
                'rounded-3xl p-8 xl:p-10'
              )}
            >
              <div className="flex items-center justify-between gap-x-4">
                <h3
                  id={tier.id}
                  className={classNames(
                    tier.mostPopular ? 'text-indigo-600' : 'text-gray-900',
                    'text-lg font-semibold leading-8'
                  )}
                >
                  {tier.name}
                </h3>
                {tier.mostPopular ? (
                  <p className="rounded-full bg-indigo-600/10 py-1 px-2.5 text-xs font-semibold leading-5 text-indigo-600">
                    Most popular
                  </p>
                ) : null}
              </div>
              <p className="mt-4 text-sm leading-6 text-gray-600">{tier.description}</p>
              <p className="mt-6 flex items-baseline gap-x-1">
                <span className="text-4xl font-bold tracking-tight text-gray-900">
                  {tier.price[frequency?.value as keyof Price]}
                </span>
                <span className="text-sm font-semibold leading-6 text-gray-600">
                  {frequency?.priceSuffix}
                </span>
              </p>
              <UpgradeButton plan={tier.id} subscriptionInterval={frequency?.value} />
              <ul role="list" className="mt-8 space-y-3 text-sm leading-6 text-gray-600 xl:mt-10">
                {tier.features.map((feature) => (
                  <li key={feature} className="flex gap-x-3">
                    <CheckIcon className="h-6 w-5 flex-none text-indigo-600" aria-hidden="true" />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
