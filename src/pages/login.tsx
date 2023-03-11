import Head from 'next/head';
import Link from 'next/link';
import { signIn } from 'next-auth/react';
import { SparklesIcon } from '@heroicons/react/24/outline';
import { type GetServerSideProps } from 'next';
import { getServerSession } from 'next-auth';

import { AuthLayout } from '@/components/ui/AuthLayout';
import Logo from '@/components/ui/Logo';
import { GoogleLogo } from '@/components/ui/GoogleLogo';
import DiscordLogo from '@/images/logos/discord-mark-blue.svg';
import Meta from '@/components/seo/Meta';
import MetaDescription from '@/components/seo/MetaDescription';
import { authOptions } from '@/server/auth';

interface FormElements extends HTMLFormControlsCollection {
  email: HTMLInputElement;
}
interface EmailFormElement extends HTMLFormElement {
  readonly elements: FormElements;
}

export default function Login() {
  function handleSubmit(e: React.FormEvent<EmailFormElement>) {
    e.preventDefault(); // Prevent the form from submitting
    const email = e.currentTarget.elements.email.value; // Get the email entered by the user

    void signIn('email', { email }); // Call the signIn function with the email
  }

  return (
    <>
      <Head>
        <title>Login - ThinkHive</title>
        <Meta />
        <MetaDescription
          value="Create intelligent chatbots that answer questions based on your organization's
        knowledge base, providing answers to your company-specific inquiries anytime, anywhere!"
        />
      </Head>
      <AuthLayout>
        <div className="flex flex-col">
          <Link href="/" aria-label="Home">
            <Logo height={44} />
          </Link>
          <div className="mt-8">
            <h2 className="text-lg font-semibold text-gray-900">Welcome to ThinkHive</h2>
            <p className="text-sm text-gray-700">
              Continue with a social account or enter your email.
            </p>
          </div>
        </div>

        <div className="mt-8">
          <div>
            <div className="mt-2 flex flex-col gap-3">
              <div>
                <button
                  onClick={() =>
                    void signIn('google', {
                      callbackUrl: '/dashboard',
                    })
                  }
                  className="inline-flex w-full rounded-md bg-white py-2 px-5 text-gray-500 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:outline-offset-0"
                >
                  <span className="sr-only">Log in with Google</span>
                  <div className="flex flex-row items-center">
                    <GoogleLogo />
                    <span className="ml-4 font-medium">Continue with Google</span>
                  </div>
                </button>
              </div>

              {/* <div>
                <button
                  onClick={() =>
                    void signIn('azure-ad-b2c', {
                      callbackUrl: '/dashboard',
                    })
                  }
                  className="inline-flex w-full rounded-md bg-white py-2 px-5 text-gray-500 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:outline-offset-0"
                >
                  <span className="sr-only">Log in with Microsoft</span>
                  <MicrosoftLogo className="w-6" />
                  <span className="ml-4 font-medium">Continue with Microsoft</span>
                </button>
              </div> */}

              <div>
                <button
                  onClick={() => void signIn('discord')}
                  className="inline-flex w-full rounded-md bg-white py-2 px-5 text-gray-500 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:outline-offset-0"
                >
                  <span className="sr-only">Log in with Discord</span>
                  <div className="flex flex-row items-center">
                    <DiscordLogo className="w-6" />
                    <span className="ml-4 font-medium">Continue with Discord</span>
                  </div>
                </button>
              </div>
            </div>

            <div className="relative mt-6">
              <div className="absolute inset-0 flex items-center" aria-hidden="true">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="bg-white px-2 text-gray-500">OR</span>
              </div>
            </div>
          </div>

          <div className="mt-6">
            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium leading-6 text-gray-900"
                >
                  Email address
                </label>
                <div className="mt-2">
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    className="block w-full rounded-md border-0 py-1.5 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                  />
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  className="flex w-full justify-center rounded-md bg-indigo-600 py-2 px-3 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                >
                  Continue with email
                </button>
              </div>
            </form>

            <span className="mt-3 inline-flex gap-2 rounded-md bg-indigo-100 px-6 py-2 text-sm font-medium text-indigo-800">
              <SparklesIcon className="h-5 w-5 text-indigo-800" />
              We’ll email you a magic link for a password-free log in.
            </span>
          </div>
        </div>
      </AuthLayout>
    </>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const session = await getServerSession(context.req, context.res, authOptions);

  if (session) {
    return {
      redirect: {
        destination: '/dashboard',
        permanent: false,
      },
    };
  }

  return {
    props: {
      session,
    },
  };
};
