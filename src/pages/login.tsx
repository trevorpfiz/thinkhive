import Head from 'next/head';
import Link from 'next/link';
import Image from 'next/image';
import { IconBrandGoogle, IconBrandWindows, IconBrandDiscord } from '@tabler/icons-react';
import { signIn, useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import { SparklesIcon } from '@heroicons/react/24/outline';

import { AuthLayout } from '@/components/AuthLayout';
import Button from '@/components/Button';
import { TextField } from '@/components/Fields';
import { Logo } from '@/components/Logo';

import { GoogleLogo } from '@/ui/GoogleLogo';

import DiscordLogo from '@/images/logos/discord-mark-blue.svg';

export default function Login() {
  const { data: session, status } = useSession();
  const router = useRouter();

  // If the user is authenticated, redirect them to the dashboard
  // page
  if (status === 'authenticated') {
    router.replace('/dashboard');
    console.log(session);
  }

  function handleSignIn(e) {
    e.preventDefault(); // Prevent the form from submitting
    const email = e.target.email.value; // Get the email entered by the user

    signIn('email', { email }); // Call the signIn function with the email
  }

  return (
    <>
      <Head>
        <title>Log In - ThinkHive</title>
      </Head>
      <AuthLayout>
        <div className="flex flex-col">
          <Link href="/" aria-label="Home">
            <Logo className="h-10 w-auto" />
          </Link>
          <div className="mt-8">
            <h2 className="text-lg font-semibold text-gray-900">Log in to your account</h2>
            <p className="text-sm text-gray-700">
              Don’t have an account?{' '}
              <Link href="/signup" className="font-medium text-blue-600 hover:underline">
                Sign up
              </Link>{' '}
              for a free trial.
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

              <div>
                <button
                  onClick={() => void signIn()}
                  className="inline-flex w-full rounded-md bg-white py-2 px-5 text-gray-500 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:outline-offset-0"
                >
                  <span className="sr-only">Log in with Microsoft</span>
                  <IconBrandWindows size={24} stroke={2} />
                  <span className="ml-4 font-medium">Continue with Microsoft Account</span>
                </button>
              </div>

              <div>
                <button
                  onClick={() =>
                    void signIn('discord', {
                      callbackUrl: '/dashboard',
                    })
                  }
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
                <span className="bg-white px-2 text-gray-500">Or continue with</span>
              </div>
            </div>
          </div>

          <div className="mt-6">
            <form onSubmit={handleSignIn} className="space-y-3">
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
                  Log in with email
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
