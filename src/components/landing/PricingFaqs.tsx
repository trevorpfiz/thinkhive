import Image from 'next/image';
import { Container } from '~/components/ui/Container';
import backgroundImage from '~/images/background-faqs.jpg';

const faqs = [
  [
    {
      question: 'What counts as one message?',
      answer:
        'Each time a user asks a question to an Expert and receives a response, it counts as one message.',
    },
    {
      question: 'What is the word count of the files that I wish to upload?',
      answer:
        'Once you attach your files for upload, we will display the total word count of all the attached files.',
    },
    {
      question: 'How can I determine if I need more usage?',
      answer:
        'You can monitor your usage and billing information in the dashboard, which will display the amount of remaining usage and the next billing date. Once you reach your usage limit, you will not receive any further responses from your Experts and uploading new information will not be possible. However, you can purchase more credits.',
    },
  ],
  [
    {
      question: 'What is the Trial Plan?',
      answer:
        'The Trial Plan is a no-cost plan that provides you with a complete end-to-end experience of using ThinkHive. This allows you to determine whether the platform is valuable to you before you decide to make any payment.',
    },
    {
      question: 'Does the Trial Plan renew each month?',
      answer:
        'No, it does not renew each month. The reason behind this is that we aim to provide our users with a generous and complete testing experience of ThinkHive, using all their data. If the fixed usage renewed every month, it would put a significant financial strain on us.',
    },
    {
      question: 'What if I want to upgrade my plan?',
      answer:
        'Just select the plan you want to upgrade to in the billing dashboard and you will have two options. One option is to start on the new plan at the end of your current subscription period. The other option is to upgrade immediately while getting prorated for your unused credits. For example, if you only used 1,000 of your 5,000 credits on a $20 plan, you would get $16 towards your upgrade.',
    },
  ],
  [
    {
      question: 'What is the difference between monthly billing and yearly billing?',
      answer:
        'You have the option to subscribe and be billed either monthly or annually. If you choose to pay annually, you will be charged the full amount for the entire year upfront, but at a discounted price compared to paying on a monthly basis. You will receive one month free as part of the annual payment plan.',
    },
    {
      question: 'Can I purchase more credits while on my current plan?',
      answer:
        "Yes you can! Just head to the billing page in the dashboard where you can see your usage. Here is where you can buy more credits. 1 credit = ~1 message or ~1,000 words uploaded. Purchased credits will persist between subscription periods and your plan's credits will be used up first.",
    },
  ],
];

export function PricingFaqs() {
  return (
    <section
      id="faq"
      aria-labelledby="faq-title"
      className="relative overflow-hidden bg-slate-50 py-20 sm:py-32"
    >
      <Image
        className="absolute top-0 left-1/2 max-w-none translate-x-[-30%] -translate-y-1/4"
        src={backgroundImage}
        alt=""
        width={1558}
        height={946}
        placeholder="blur"
      />
      <Container className="relative">
        <div className="mx-auto max-w-2xl lg:mx-0">
          <h2
            id="faq-title"
            className="font-display text-3xl font-semibold tracking-tight text-gray-900 sm:text-4xl"
          >
            Pricing FAQs
          </h2>
          <p className="mt-4 text-lg tracking-tight text-slate-700">
            If you have any confusion whatsoever, talk to our Expert using the chat widget. Give us
            feedback through our{' '}
            <a
              href="https://discord.gg/xYw9VScdzg"
              target="_blank"
              className="underline decoration-indigo-500 decoration-2 underline-offset-[3px] hover:decoration-indigo-700 hover:decoration-[3px]"
            >
              Discord server
            </a>
            !
          </p>
        </div>
        <ul
          role="list"
          className="mx-auto mt-16 grid max-w-2xl grid-cols-1 gap-8 lg:max-w-none lg:grid-cols-3"
        >
          {faqs.map((column, columnIndex) => (
            <li key={columnIndex}>
              <ul role="list" className="flex flex-col gap-y-8">
                {column.map((faq, faqIndex) => (
                  <li key={faqIndex}>
                    <h3 className="font-display text-lg font-semibold leading-7 text-gray-900">
                      {faq.question}
                    </h3>
                    <p className="mt-4 text-sm text-slate-700">{faq.answer}</p>
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
