import { useState } from 'react';
import { RadioGroup } from '@headlessui/react';
import { CheckIcon } from '@heroicons/react/20/solid';
import { signIn, useSession } from 'next-auth/react';
import { useRouter } from 'next/router';

const frequencies: Frequency[] = [
  { value: 'monthly', label: 'Monthly', priceSuffix: '/month' },
  { value: 'annually', label: 'Annually', priceSuffix: '/year' },
];
const tiers: Tier[] = [
  {
    name: 'Trial',
    id: 'tier-trial',
    href: '#',
    price: { monthly: '$0', annually: '$0' },
    description: 'The essentials to try out everything we offer.',
    features: [
      '~30 messages',
      'Up to 30,000 words uploaded',
      '3 Experts',
      'Optional credit top ups',
      'Chat with your Expert in a playground', 
      'Deploy your Expert as a website chatbot',
    ],
    mostPopular: false,
  },
  {
    name: 'Hangout',
    id: 'tier-hangout',
    href: '#',
    price: { monthly: '$20', annually: '$220' },
    description: 'Ideal for small groups or individuals.',
    features: [
      '~5,000 messages per month',
      'Up to 5,000,000 words uploaded per month',
      '20 Experts',
      'Optional credit top ups',
      'Chat with your Expert in a playground', 
      'Deploy your Expert as a website chatbot',
    ],
    mostPopular: false,
  },
  {
    name: 'Community',
    id: 'tier-community',
    href: '#',
    price: { monthly: '$100', annually: '$1,100' },
    description: 'Perfect for growing teams and communities.',
    features: [
      '~25,000 messages per month',
      'Up to 25,000,000 words uploaded per month',
      '20 Experts',
      'Optional credit top ups',
      'Chat with your Expert in a playground', 
      'Deploy your Expert as a website chatbot',
    ],
    mostPopular: false,
  },
  {
    name: 'Enterprise',
    id: 'tier-enterprise',
    href: '#',
    price: { monthly: '$300', annually: '$3,300' },
    description: 'Designed for large organizations and enterprises.',
    features: [
      '~100,000 messages per month',
      'Up to 100,000,000 words uploaded per month',
      '20 Experts',
      'Optional credit top ups',
      'Chat with your Expert in a playground', 
      'Deploy your Expert as a website chatbot',
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
  annually: string;
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

export default function Pricing() {
  const router = useRouter();
  const { status } = useSession();
  const [frequency, setFrequency] = useState(frequencies[0]);

  const handleButtonClick = () => {
    if (status === 'authenticated') {
      // Redirect to the dashboard if the user is logged in
      void router.push('/dashboard/billing');
    } else {
      // Redirect to the sign-in page if the user is not logged in
      void signIn();
    }
  };

  return (
    <div className="bg-white py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="text-base font-semibold leading-7 text-indigo-600">Pricing</h2>
          <p className="mt-2 text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
            Pricing plans for all sizes
          </p>
        </div>
        <p className="mx-auto mt-6 max-w-2xl text-center text-lg leading-8 text-gray-600">
          Choose an affordable plan that’s packed with the best features for enhancing user satisfaction,
          fostering customer loyalty, and driving sales.
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
        <div className="isolate mx-auto mt-10 grid max-w-md grid-cols-1 gap-8 md:max-w-2xl md:grid-cols-2 lg:max-w-4xl xl:mx-0 xl:max-w-none xl:grid-cols-4">
          {tiers.map((tier) => (
            <div
              key={tier.id}
              className={classNames(
                tier.mostPopular ? 'ring-2 ring-indigo-600' : 'ring-1 ring-gray-200',
                'rounded-3xl p-8'
              )}
            >
              <h3
                id={tier.id}
                className={classNames(
                  tier.mostPopular ? 'text-indigo-600' : 'text-gray-900',
                  'text-lg font-semibold leading-8'
                )}
              >
                {tier.name}
              </h3>
              <p className="mt-4 text-sm leading-6 text-gray-600">{tier.description}</p>
              <p className="mt-6 flex items-baseline gap-x-1">
                <span className="text-4xl font-bold tracking-tight text-gray-900">
                  {tier.price[frequency?.value as keyof Price]}
                </span>
                <span className="text-sm font-semibold leading-6 text-gray-600">
                  {frequency?.priceSuffix}
                </span>
              </p>
              <button
                onClick={handleButtonClick}
                aria-describedby={tier.id}
                className={classNames(
                  tier.name === 'Trial'
                    ? 'text-indigo-600 ring-1 ring-inset ring-indigo-200 hover:ring-indigo-300'
                    : 'bg-indigo-600 text-white shadow-sm hover:bg-indigo-500',
                  'mt-6 block w-full rounded-md py-2 px-3 text-center text-sm font-semibold leading-6 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600'
                )}
              >
                {tier.name === 'Trial' ? 'Get started' : 'Subscribe'}
              </button>
              <ul role="list" className="mt-8 space-y-3 text-sm leading-6 text-gray-600">
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
