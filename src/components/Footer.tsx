import Link from 'next/link';

import { Container } from '@/components/ui/Container';
import Logo from '@/components/ui/Logo';
import { NavLink } from '@/components/ui/NavLink';
import DiscordLogo from '@/images/logos/discord-mark-blue.svg';

export function Footer() {
  return (
    <footer className="bg-slate-50">
      <Container>
        <div className="flex flex-col items-center justify-center py-16">
          <Link href="/" aria-label="Home" className="mx-auto">
            <Logo height={28} />
          </Link>
          <nav className="mt-10 text-sm" aria-label="quick links">
            <div className="-my-1 flex justify-center gap-x-6">
              <NavLink href="/#features">Features</NavLink>
              <NavLink href="/pricing">Pricing</NavLink>
              <NavLink href="https://app.termly.io/document/privacy-policy/f7b7ce7d-ed9b-4fc0-802c-1ae5fcbde7a1">
                Privacy
              </NavLink>
              <NavLink href="https://app.termly.io/document/terms-and-conditions/183699fa-a057-4dfe-a345-75b22cd2b3bf">
                Terms
              </NavLink>
            </div>
          </nav>
        </div>
        <div className="flex flex-col items-center border-t border-slate-400/10 py-10 sm:flex-row-reverse sm:justify-between">
          <div className="flex gap-x-6">
            <Link
              href="https://discord.gg/xYw9VScdzg"
              target="_blank"
              className="group"
              aria-label="ThinkHive on Discord"
            >
              <DiscordLogo
                aria-hidden="true"
                className="w-6 fill-slate-500 group-hover:fill-[#5865f2]"
              />
            </Link>
          </div>
          <p className="mt-6 text-sm text-slate-500 sm:mt-0">
            Copyright &copy; {new Date().getFullYear()} TwinZ LLC. All rights reserved.
          </p>
        </div>
      </Container>
    </footer>
  );
}
