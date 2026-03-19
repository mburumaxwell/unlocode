import { Skeleton } from '@/components/ui/skeleton';
import { Spinner } from '@/components/ui/spinner';

export default function Loading() {
  return (
    <main className='min-h-[calc(100vh-3.5rem)]'>
      <div className='mx-auto max-w-2xl px-4 py-8'>
        <div className='space-y-6'>
          <header className='flex items-start gap-3'>
            <Skeleton className='size-6 rounded-full' />
            <div className='min-w-0 flex-1 space-y-2'>
              <Skeleton className='h-3 w-16' />
              <Skeleton className='h-7 w-56 max-w-full' />
              <div className='flex flex-wrap gap-1'>
                <Skeleton className='h-5 w-16 rounded-full' />
                <Skeleton className='h-5 w-20 rounded-full' />
                <Skeleton className='h-5 w-18 rounded-full' />
              </div>
            </div>
          </header>

          <div className='flex items-center gap-2 text-sm text-muted-foreground'>
            <Spinner />
            <span>Loading location details...</span>
          </div>

          <section className='overflow-hidden rounded-lg border'>
            {Array.from({ length: 8 }).map((_, index) => (
              <div key={index} className='flex items-center gap-4 border-b px-4 py-3 last:border-b-0'>
                <Skeleton className='h-3 w-24' />
                <Skeleton className='h-4 flex-1' />
              </div>
            ))}
          </section>
        </div>
      </div>
    </main>
  );
}
