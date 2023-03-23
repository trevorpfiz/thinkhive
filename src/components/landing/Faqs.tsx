import Image from 'next/image';

import { Container } from '@/components/ui/Container';
import backgroundImage from '@/images/background-faqs.jpg';

const faqs = [
  [
    {
      question: 'What is an AI-Powered Business Expert?',
      answer:
        'An AI-Powered Business Expert is a chatbot that has been trained to intelligently answer questions about a set of uploaded documents. This chatbot can become an expert on your business processes, allowing users or team members to talk to the chatbot anytime to better understand your business or its processes.',
    },
    {
      question: 'What documents can be uploaded to the chatbot?',
      answer:
        'Any documents that detail your business processes can be uploaded to the chatbot. This could include procedures, policies, and guidelines. We currently support uploading PDFs.',
    },
    {
      question: 'Where is my data stored?',
      answer:
        'The complete documents are not stored, only their content is securely saved using Google Cloud servers. The content is restricted to be accessed only by users who engage with your Expert.',
    },
  ],
  [
    {
      question: `How accurate are the chatbot's answers?`,
      answer: `The chatbot's answers are highly accurate as it has been trained to understand company-specific questions.`,
    },
    {
      question: 'What is the response time of the chatbot?',
      answer: `Our chatbot utilizes the latest AI technology, ChatGPT, resulting in rapid responses in under one second.`,
    },
    {
      question: 'How can I train the chatbot?',
      answer: `You can easily train the chatbot for your company by simply uploading your organization's specific documents.`,
    },
    {
      question: `Can I customize the chatbot's responses?`,
      answer: `Yes, the chatbot's responses can be customized to fit your business's tone and voice. You can also update its knowledge as your business processes change and evolve.`,
    },
    {
      question: 'What platforms does the chatbot support?',
      answer: `The chatbot currently supports deployment as a website chatbot. Support for other platforms are coming soon!`,
    },
  ],
  [
    {
      question: 'Does the chatbot support other languages?',
      answer: `Yes, the chatbot has support for around 95 different languages and tries to respond in the same language as the user's question, regardless of the language of the documents.`,
    },
    {
      question: 'Can I use the chatbot for customer support?',
      answer: `Yes, the chatbot can be used for customer support. Customers can ask the chatbot questions about your products or services, and the chatbot will provide accurate answers based on the uploaded documents.`,
    },
    {
      question: 'What industries can benefit from using the chatbot?',
      answer:
        'The chatbot can be useful for any industry because there will always be team members or users who may not have complete knowledge or information about certain aspects of the business. The chatbot can provide such information easily and quickly.',
    },
  ],
];

export function Faqs() {
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
            Frequently asked questions
          </h2>
          <p className="mt-4 text-lg tracking-tight text-slate-700">
            If you can’t find what you’re looking for, talk to our Expert using the chat widget! Staff are available in the ThinkHive{' '}
            <a
              href="https://discord.gg/xYw9VScdzg"
              target="_blank"
              className="underline decoration-indigo-500 decoration-2 underline-offset-[3px] hover:decoration-indigo-700 hover:decoration-[3px]"
            >
              Discord community
            </a>
            .
          </p>
        </div>
        <ul
          role="list"
          className="mx-auto mt-16 grid max-w-2xl grid-cols-1 gap-8 lg:max-w-7xl lg:grid-cols-3"
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
