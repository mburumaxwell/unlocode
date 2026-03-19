'use client';

import { MenuIcon } from 'lucide-react';
import type { Route } from 'next';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import * as React from 'react';

import { GithubIcon } from '@/components/logos';
import { ThemeButton } from '@/components/theme';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { cn } from '@/lib/utils';

const NAV_ITEMS = [
  { href: '/search', label: 'Search' },
  { href: '/component', label: 'Component' },
  { href: '/docs', label: 'API' },
];

export function Header() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = React.useState(false);

  return (
    <header className='sticky top-0 z-50 border-b bg-background/80 backdrop-blur-sm'>
      <div className='mx-auto flex h-14 max-w-3xl items-center gap-4 px-4'>
        <Link href='/' className='shrink-0 font-mono text-xs font-semibold tracking-tight text-foreground'>
          unlocode/
        </Link>

        <nav className='hidden items-center gap-1 overflow-x-auto md:flex' aria-label='Main navigation'>
          {NAV_ITEMS.map(({ href, label }) => {
            const active = pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href as Route}
                className={cn(
                  'shrink-0 rounded-md px-2.5 py-1 text-sm transition-colors',
                  active ? 'font-medium text-foreground' : 'text-muted-foreground hover:text-foreground',
                )}
              >
                {label}
              </Link>
            );
          })}
        </nav>

        <div className='flex-1' />

        <Button
          className='hidden md:inline-flex'
          variant='outline'
          size='sm'
          nativeButton={false}
          render={
            <a
              href='https://github.com/mburumaxwell/unlocode'
              target='_blank'
              rel='noreferrer'
              aria-label='Open GitHub repository'
              className='flex items-center gap-2'
            >
              <GithubIcon className='size-4' />
              <span>GitHub</span>
            </a>
          }
        />

        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger
            render={<Button variant='outline' size='icon-sm' className='md:hidden' aria-label='Open menu' />}
          >
            <MenuIcon />
          </SheetTrigger>
          <SheetContent side='right' className='p-3 md:hidden'>
            <nav className='mt-10 flex flex-col gap-1' aria-label='Mobile navigation'>
              {NAV_ITEMS.map(({ href, label }) => {
                const active = pathname.startsWith(href);
                return (
                  <Link
                    key={href}
                    href={href as Route}
                    className={cn(
                      'rounded-md px-3 py-2 text-sm transition-colors',
                      active ? 'bg-accent font-medium text-foreground' : 'text-muted-foreground hover:text-foreground',
                    )}
                    onClick={() => setMobileOpen(false)}
                  >
                    {label}
                  </Link>
                );
              })}
              <div className='my-1 h-px bg-border' />
              <Button
                variant='ghost'
                className='justify-start'
                nativeButton={false}
                render={
                  <a
                    href='https://github.com/mburumaxwell/unlocode'
                    target='_blank'
                    rel='noreferrer'
                    className='flex items-center gap-2'
                    onClick={() => setMobileOpen(false)}
                  >
                    <GithubIcon className='size-4' />
                    <span>GitHub</span>
                  </a>
                }
              />
            </nav>
          </SheetContent>
        </Sheet>

        <ThemeButton />
      </div>
    </header>
  );
}
