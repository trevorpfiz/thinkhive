import {
  ArrowUpOnSquareStackIcon,
  ChatBubbleLeftRightIcon,
  UserGroupIcon,
} from '@heroicons/react/24/outline';

const features = [
  {
    name: 'Upload your knowledge base',
    description: 'Easily upload your documents and know they are secure.',
    href: '#',
    icon: ArrowUpOnSquareStackIcon,
  },
  {
    name: 'Train your own Experts',
    description: 'Customize your Experts according to your knowledge base.',
    href: '#',
    icon: UserGroupIcon,
  },
  {
    name: 'Deploy your custom-built Experts',
    description: 'Quickly make your Experts accessible to your customers.',
    href: '#',
    icon: ChatBubbleLeftRightIcon,
  },
];

export default function FeatureList() {
  return (
    <div className="bg-white py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl lg:mx-0">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            We have everything you need to build your team.
          </h2>
          {/* <p className="mt-6 text-lg leading-8 text-gray-600">
            Lorem ipsum dolor sit amet consect adipisicing elit. Possimus magnam voluptatum
            cupiditate veritatis in accusamus quisquam.
          </p> */}
        </div>
        <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
          <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-3">
            {features.map((feature) => (
              <div key={feature.name} className="flex flex-col">
                <dt className="text-base font-semibold leading-7 text-gray-900">
                  <div className="mb-6 flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-600">
                    <feature.icon className="h-6 w-6 text-white" aria-hidden="true" />
                  </div>
                  {feature.name}
                </dt>
                <dd className="mt-1 flex flex-auto flex-col text-base leading-7 text-gray-600">
                  <p className="flex-auto">{feature.description}</p>
                  <p className="mt-6">
                    {/* <a
                      href={feature.href}
                      className="text-sm font-semibold leading-6 text-indigo-600"
                    >
                      Learn more <span aria-hidden="true">→</span>
                    </a> */}
                  </p>
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </div>
  );
}
