export function GithubIcon(props: React.ComponentPropsWithoutRef<'svg'>) {
  return (
    <svg viewBox='0 0 24 24' aria-hidden='true' fill='currentColor' {...props}>
      <path d='M12 0C5.37 0 0 5.37 0 12c0 5.3 3.44 9.8 8.2 11.38.6.1.82-.26.82-.58 0-.28-.01-1.04-.01-2.03-3.34.73-4.04-1.61-4.04-1.61-.55-1.38-1.33-1.75-1.33-1.75-1.08-.75.08-.74.08-.74 1.2.08 1.83 1.24 1.83 1.24 1.06 1.83 2.8 1.3 3.49.99.11-.77.42-1.3.76-1.6-2.67-.31-5.47-1.33-5.47-5.94 0-1.31.47-2.38 1.24-3.22-.12-.31-.54-1.56.12-3.25 0 0 1.01-.32 3.3 1.23a11.5 11.5 0 0 1 6 0c2.29-1.55 3.3-1.23 3.3-1.23.66 1.69.24 2.94.12 3.25.77.84 1.24 1.91 1.24 3.22 0 4.62-2.8 5.62-5.48 5.92.43.37.82 1.1.82 2.22 0 1.6-.01 2.89-.01 3.28 0 .32.22.69.83.57A12.01 12.01 0 0 0 24 12c0-6.63-5.37-12-12-12Z' />
    </svg>
  );
}

export function UnlocodeIcon(props: React.ComponentPropsWithoutRef<'svg'>) {
  return (
    <svg viewBox='0 0 24 24' fill='none' aria-hidden='true' {...props}>
      <circle cx='12' cy='12' r='9' stroke='currentColor' opacity='0.25' strokeWidth='1.75' />
      <path d='M8 9L5 12L8 15' stroke='currentColor' strokeWidth='1.75' strokeLinecap='round' strokeLinejoin='round' />
      <path
        d='M16 9L19 12L16 15'
        stroke='currentColor'
        strokeWidth='1.75'
        strokeLinecap='round'
        strokeLinejoin='round'
      />
      <path
        d='M12 6.5C10.07 6.5 8.5 8.07 8.5 10C8.5 12.48 11.09 15.7 11.75 16.47C11.88 16.62 12.12 16.62 12.25 16.47C12.91 15.7 15.5 12.48 15.5 10C15.5 8.07 13.93 6.5 12 6.5Z'
        stroke='currentColor'
        strokeWidth='1.75'
        strokeLinejoin='round'
      />
      <circle cx='12' cy='10' r='1' fill='currentColor' />
    </svg>
  );
}
