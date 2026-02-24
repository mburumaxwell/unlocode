import type { NextConfig } from 'next';

const config: NextConfig = {
  reactStrictMode: true,
  reactCompiler: true,
  typedRoutes: true,
  logging: { fetches: { fullUrl: true } }, // allows us to see cache behaviour for fetches
  images: {
    formats: ['image/avif', 'image/webp'],
    unoptimized: true, // do not need image optimisation
  },
};

export default config;
