import Image from 'next/image';
import { signOut, useSession } from 'next-auth/react';

export default function UserButton() {
  const { data: sessionData } = useSession();

  return (
    <div className="flex flex-shrink-0 p-4">
      <div className="group block w-full flex-shrink-0">
        <div className="flex items-center rounded-xl border border-gray-200 bg-gray-100 p-4">
          <div>
            {sessionData?.user.image ? (
              <Image
                className="inline-block h-10 w-10 rounded-full"
                src={sessionData?.user.image}
                alt="User profile image"
                width={36}
                height={36}
              />
            ) : (
              <div className="inline-block h-10 w-10 rounded-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>
            )}
          </div>
          <div className="ml-3">
            <p className="truncate text-sm font-medium">
              {sessionData?.user.email ? sessionData?.user.email.split('@')[0] : 'User'}
            </p>
            <button
              onClick={() =>
                void signOut({
                  callbackUrl: '/',
                })
              }
              className="text-sm font-medium text-gray-500 hover:text-gray-700"
            >
              Sign out
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
