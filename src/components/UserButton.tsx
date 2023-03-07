import { signOut, useSession } from 'next-auth/react';
import Image from 'next/image';

export default function UserButton() {
  const { data: sessionData } = useSession();

  return (
    <div className="flex flex-shrink-0 border-t border-indigo-800 p-4">
      <a href="#" className="group block w-full flex-shrink-0">
        <div className="flex items-center">
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
            <p className="text-sm font-medium text-white">
              {sessionData?.user.email ? sessionData?.user.email.split('@')[0] : 'User'}
            </p>
            <button
              onClick={() =>
                void signOut({
                  callbackUrl: '/',
                })
              }
            >
              Sign out
            </button>
          </div>
        </div>
      </a>
    </div>
  );
}

const AuthShowcase: React.FC = () => {
  const { data: sessionData } = useSession();

  const { data: secretMessage } = api.example.getSecretMessage.useQuery(
    undefined, // no input
    { enabled: sessionData?.user !== undefined }
  );

  return (
    <div className="flex flex-col items-center justify-center gap-4">
      <p className="text-center text-2xl text-white">
        {sessionData && <span>Logged in as {sessionData.user?.name}</span>}
        {secretMessage && <span> - {secretMessage}</span>}
      </p>
      <button
        className="rounded-full bg-white/10 px-10 py-3 font-semibold text-white no-underline transition hover:bg-white/20"
        onClick={sessionData ? () => void signOut() : () => void signIn()}
      >
        {sessionData ? 'Sign out' : 'Sign in'}
      </button>
    </div>
  );
};
