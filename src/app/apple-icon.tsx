import { ImageResponse } from 'next/og';
import { UnlocodeIconOpenGraph } from '@/components/og-image';

export const size = { width: 32, height: 32 };
export const contentType = 'image/png';

export default function Icon() {
  return new ImageResponse(<UnlocodeIconOpenGraph />, { ...size });
}
