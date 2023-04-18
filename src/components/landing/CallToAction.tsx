import Image from 'next/image';
import { signIn } from 'next-auth/react';
import Button from '~/components/ui/Button';
import { Container } from '~/components/ui/Container';
import backgroundImage from '~/images/background-call-to-action.jpg';

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
          With the help of your healthcare Assistants, users receive the guidance they need, when they need it, while healthcare professionals can concentrate on providing optimal care.
          </p>
          <Button onClick={() => signIn()} intent="solidWhite" className="mt-10">
            Build your Assistants
          </Button>
        </div>
      </Container>
    </section>
  );
}
