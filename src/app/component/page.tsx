'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { CheckCircle2Icon } from 'lucide-react';
import * as React from 'react';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';
import { CodeBlock } from '@/components/code-block';
import { CountryFlag } from '@/components/country';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Spinner } from '@/components/ui/spinner';
import { UnlocodeInput } from '@/components/unlocode-input';
import type { UnlocodeEntry, UnlocodeFunctionCode } from '@/lib/unlocode';
import { UNLOCODE_FUNCTIONS } from '@/lib/unlocode';

const usageExample = `import * as React from 'react';
import { UnlocodeInput } from '@/components/unlocode-input';
import type { UnlocodeEntry } from '@/lib/unlocode';

export function BookingField() {
  const [value, setValue] = React.useState<string | null>(null);
  const [entry, setEntry] = React.useState<UnlocodeEntry | undefined>();

  return (
    <UnlocodeInput
      value={value}
      onValueChange={(value, entry) => {
        setValue(value);
        setEntry(entry);
      }}
      countries={['US', 'CA']}
      functions={['port', 'airport']}
      placeholder='Select port...'
    />
  );
}`;

export default function ComponentPage() {
  const formSchema = z
    .object({
      reference: z.string('Reference is required').trim(),
      origin: z.string().min(1, 'Origin is required'),
      destination: z.string().min(1, 'Destination is required'),
    })
    .refine((data) => data.origin !== data.destination, {
      message: 'Destination must be different from origin',
      path: ['destination'],
    });

  const [originEntry, setOriginEntry] = React.useState<UnlocodeEntry | undefined>();
  const [destEntry, setDestEntry] = React.useState<UnlocodeEntry | undefined>();
  const [submitted, setSubmitted] = React.useState<z.infer<typeof formSchema> | null>(null);
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: { reference: '', origin: '', destination: '' },
  });

  async function handleSubmit(data: z.infer<typeof formSchema>) {
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setSubmitted(data);
  }

  function handleReset() {
    form.reset();
    setOriginEntry(undefined);
    setDestEntry(undefined);
    setSubmitted(null);
  }

  return (
    <main className='min-h-[calc(100vh-3.5rem)]'>
      <div className='mx-auto max-w-3xl px-4 py-8'>
        <div className='mb-6'>
          <h1 className='text-lg font-semibold text-foreground'>UN/LOCODE Component</h1>
          <p className='text-sm text-muted-foreground'>
            A compact UN/LOCODE selector designed for form fields. Try the example booking form below.
          </p>
        </div>

        <div className='flex flex-col gap-6'>
          <Card size='sm' className='rounded-md'>
            <CardHeader>
              <CardTitle className='text-base'>Shipment Booking</CardTitle>
              <CardDescription>
                Select origin and destination using the compact selector. It shows the selected value inline and
                supports clearing back to search mode.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={form.handleSubmit(handleSubmit)}>
                <FieldGroup className='grid md:grid-cols-2 gap-2'>
                  <Controller
                    name='reference'
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <Field className='md:col-span-2'>
                        <FieldLabel htmlFor='reference'>Booking Reference</FieldLabel>
                        <Input {...field} id='reference' placeholder='e.g. BK-2026-0042' />
                        {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                      </Field>
                    )}
                  />

                  <Controller
                    name='origin'
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <Field>
                        <FieldLabel htmlFor='origin'>Origin</FieldLabel>
                        <UnlocodeInput
                          {...field}
                          id='origin'
                          onValueChange={(value, entry) => {
                            field.onChange(value);
                            setOriginEntry(entry);
                          }}
                          placeholder='Select port...'
                        />
                        {originEntry && <SelectedSummary entry={originEntry} />}
                        {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                      </Field>
                    )}
                  />

                  <Controller
                    name='destination'
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <Field>
                        <FieldLabel htmlFor='destination'>Destination</FieldLabel>
                        <UnlocodeInput
                          {...field}
                          id='destination'
                          onValueChange={(value, entry) => {
                            field.onChange(value);
                            setDestEntry(entry);
                          }}
                          placeholder='Select port...'
                        />
                        {destEntry && <SelectedSummary entry={destEntry} />}
                        {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                      </Field>
                    )}
                  />
                </FieldGroup>

                <Separator className='my-4' />

                <FieldGroup>
                  <Field orientation='horizontal'>
                    <Button type='submit' disabled={form.formState.isSubmitting || !form.formState.isDirty}>
                      {form.formState.isSubmitting ? (
                        <>
                          <Spinner />
                          Booking...
                        </>
                      ) : (
                        'Book Shipment'
                      )}
                    </Button>
                    <Button
                      type='button'
                      variant='outline'
                      onClick={handleReset}
                      disabled={form.formState.isSubmitting || !form.formState.isDirty}
                    >
                      Reset
                    </Button>
                  </Field>
                </FieldGroup>
              </form>
            </CardContent>
          </Card>

          {submitted !== null && (
            <Card size='sm' className='rounded-md'>
              <CardContent>
                <div className='flex items-start gap-3'>
                  <CheckCircle2Icon className='size-5 text-foreground shrink-0 mt-0.5' />
                  <div className='flex flex-col gap-2 text-sm'>
                    <p className='font-medium text-foreground'>Shipment booked</p>
                    <div className='rounded-md bg-muted p-3 font-mono text-xs flex flex-col gap-1'>
                      <span>reference: {submitted.reference || '(none)'}</span>
                      <span>origin: {submitted.origin}</span>
                      <span>destination: {submitted.destination}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <Separator />

          <section>
            <h2 className='text-sm font-semibold text-foreground mb-3'>Standalone examples</h2>
            <p className='text-sm text-muted-foreground mb-4'>
              The selector in different states to illustrate selection and clearing.
            </p>
            <div className='grid md:grid-cols-2 gap-6'>
              <UnlocodeInputWithSummary label='Default (empty)' />
              <UnlocodeInputWithSummary label='Pre-selected' value='SGSIN' />
              <UnlocodeInputWithSummary label='Ports and Airports only' functions={['port', 'airport']} />
              <UnlocodeInputWithSummary
                label='US/CA Ports and Airports only'
                countries={['US', 'CA']}
                functions={['port', 'airport']}
              />
            </div>
          </section>

          <Separator />

          <section className='flex flex-col gap-3'>
            <h2 className='text-sm font-semibold text-foreground'>Usage</h2>
            <p className='text-sm text-muted-foreground'>
              Basic integration example for the <code>UnlocodeInput</code> component.
            </p>
            <CodeBlock code={usageExample} language='tsx' />
            <a
              href='https://github.com/mburumaxwell/unlocode/blob/main/src/components/unlocode-input.tsx'
              target='_blank'
              rel='noreferrer noopener'
              className='w-fit text-sm text-primary hover:underline underline-offset-4'
            >
              View component source on GitHub
            </a>
          </section>
        </div>
      </div>
    </main>
  );
}

function SelectedSummary({ entry }: { entry: UnlocodeEntry }) {
  return (
    <div className='flex items-center gap-2 text-xs text-muted-foreground px-1 py-0.5'>
      <CountryFlag countryCode={entry.country} className='size-3' shape='circle' />
      <span className='font-mono font-medium'>{entry.code}</span>
      <span>{entry.name}</span>
      <span className='text-muted-foreground/60'>
        {entry.functions.map((fc) => UNLOCODE_FUNCTIONS.find((f) => f.code === fc)?.label ?? fc).join(', ')}
      </span>
    </div>
  );
}

function UnlocodeInputWithSummary({
  label,
  value: initialValue,
  functions,
  countries,
}: {
  label: string;
  value?: string | null;
  functions?: UnlocodeFunctionCode[];
  countries?: string[];
}) {
  const [value, setValue] = React.useState<string | null>(initialValue || null);
  const [entry, setEntry] = React.useState<UnlocodeEntry | undefined>();

  return (
    <div className='flex flex-col gap-1.5'>
      <p className='text-sm font-medium text-foreground'>{label}</p>
      <UnlocodeInput
        value={value}
        countries={countries}
        functions={functions}
        onValueChange={(value, entry) => {
          setValue(value);
          setEntry(entry);
        }}
      />
      {entry && <SelectedSummary entry={entry} />}
      <span className='text-xs text-muted-foreground font-mono px-1'>value = {value ? `"${value}"` : 'null'}</span>
    </div>
  );
}
