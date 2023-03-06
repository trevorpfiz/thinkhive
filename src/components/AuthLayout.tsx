import Image from 'next/image';

import backgroundImage from '@/images/background-auth.jpg';

export function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <div className="flex h-screen flex-col items-center justify-center">
        <div className="fixed -z-10 hidden h-screen w-screen overflow-hidden sm:block">
          <Image
            className="absolute inset-0 h-full w-full object-cover"
            src={backgroundImage}
            alt="background blur"
            placeholder="blur"
            quality={100}
            fill
            sizes="100vw"
            style={{
              objectFit: 'cover',
            }}
          />
        </div>
        <div className="z-10 mx-auto h-full w-full rounded-lg bg-white py-10 px-4 shadow-2xl sm:h-auto sm:max-w-md sm:px-10">
          <div>{children}</div>
        </div>
      </div>
    </>
  );
}
