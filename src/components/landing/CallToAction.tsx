import Image from 'next/image';

import Button from '@/components/ui/Button';
import { Container } from '@/components/ui/Container';
import backgroundImage from '@/images/background-call-to-action.jpg';
import { signIn } from 'next-auth/react';

export function CallToAction() {
  return (
    <section id="get-started-today" className="relative overflow-hidden bg-blue-600 py-32">
      <Image
        className="absolute top-1/2 left-1/2 max-w-none -translate-x-1/2 -translate-y-1/2"
        src={backgroundImage}
        alt=""
        width={2347}
        height={1244}
        placeholder="blur"
      />
      <Container className="relative">
        <div className="mx-auto max-w-lg text-center">
          <h2 className="font-display text-3xl tracking-tight text-white sm:text-4xl">
            Get started today
          </h2>
          <p className="mt-4 text-lg tracking-tight text-white">
          With the help of your Experts, your customers get the help they need, when they need it, while you can focus on growing your business.
          </p>
          <Button onClick={() => signIn()} intent="solidWhite" className="mt-10">
            Build your Experts
          </Button>
        </div>
      </Container>
    </section>
  );
}
