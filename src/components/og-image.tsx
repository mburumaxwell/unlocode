import type { Metadata } from 'next';

import { UnlocodeIcon } from '@/components/logos';
import { config } from '@/lib/site';
import { cn } from '@/lib/utils';

/**
 * Wraps the Open Graph image component with additional styling and layout properties.
 *
 * @param children - The content to be rendered inside the wrapper.
 * @param props - Additional props to be spread onto the wrapper div element.
 * @returns The wrapped Open Graph image component.
 */
export function OpenGraphImageWrapper({ children, className, tw, ...props }: React.ComponentPropsWithoutRef<'div'>) {
  const resolvedClassName = cn('flex h-full w-full items-center justify-center', className, tw);
  return (
    <div className={resolvedClassName} tw={resolvedClassName} {...props}>
      {children}
    </div>
  );
}

type OpenGraphImageMarketingProps = Omit<React.ComponentPropsWithoutRef<'div'>, 'title' | 'children'> &
  ({ title?: string; description?: string } | { metadata: Metadata });
export function OpenGraphImageMarketing({ style, className, tw, ...props }: OpenGraphImageMarketingProps) {
  let title: string | undefined, description: string | undefined;
  if ('metadata' in props) {
    const metadata = props.metadata;
    if (metadata.title) {
      if (typeof metadata.title === 'string') {
        title = metadata.title;
      } else if ('absolute' in metadata.title) {
        title = metadata.title.absolute;
      } else if ('default' in metadata.title) {
        title = metadata.title.default;
      }
    }
    description = metadata.description ?? undefined;
  } else {
    title = props.title;
    description = props.description;
  }
  title ??= config.title;
  description ??= config.description;

  // trim description to 140 characters to ensure it fits, and append ellipsis if it was trimmed
  if (description.length > 140) {
    description = `${description.slice(0, 140)}…`;
  }

  const resolvedClassName = cn(
    'flex h-full w-full flex-row items-center justify-center bg-[#0a0a0a] p-20 text-white',
    className,
    tw,
  );
  return (
    <div
      // tw='gap-[60px] or tw='gap-15' do not work
      style={{ ...style, gap: '60px' }}
      className={resolvedClassName}
      tw={resolvedClassName}
      {...props}
    >
      <div tw='flex items-center justify-center'>
        <UnlocodeIcon width={280} height={280} fill='#0ea5e9' />
      </div>

      <div tw='w-1 h-88 bg-[#0ea5e9] opacity-30' />

      <div tw='flex flex-col justify-center max-w-xl'>
        <p tw='text-5xl font-bold tracking-tight'>{title}</p>
        <p tw='text-3xl text-gray-400 leading-snug mt-4'>{description}</p>
      </div>
    </div>
  );
}

export function UnlocodeIconOpenGraph(props: React.ComponentPropsWithoutRef<typeof OpenGraphImageWrapper>) {
  return (
    <OpenGraphImageWrapper className='rounded-md bg-[#d4d4d4] p-1 text-[#0ea5e9]' {...props}>
      <UnlocodeIcon width={24} height={24} />
    </OpenGraphImageWrapper>
  );
}
