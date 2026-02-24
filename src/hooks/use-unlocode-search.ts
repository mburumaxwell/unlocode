import useSWR from 'swr';
import type { UnlocodeEntry, UnlocodeFunctionCode } from '@/lib/unlocode';

interface UseUnlocodeSearchParams {
  query: string;
  countries?: string[];
  functions?: UnlocodeFunctionCode[];
  limit?: number;
  offset?: number;
  enabled?: boolean;
}

interface UnlocodeSearchResult {
  results: UnlocodeEntry[];
  total: number;
}

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export function useUnlocodeSearch({
  query,
  countries,
  functions,
  limit = 50,
  offset = 0,
  enabled = true,
}: UseUnlocodeSearchParams) {
  const params = new URLSearchParams();
  if (query) params.set('q', query);
  if (countries && countries.length > 0) {
    for (const value of countries) params.append('country', value);
  }
  if (functions && functions.length > 0) {
    for (const fn of functions) params.append('function', fn);
  }
  if (limit) params.set('limit', String(limit));
  if (offset) params.set('offset', String(offset));

  const key = enabled ? `/api/unlocode/search?${params.toString()}` : null;

  const { data, error, isLoading, isValidating } = useSWR<UnlocodeSearchResult>(key, fetcher, {
    keepPreviousData: true,
    dedupingInterval: 300,
    revalidateOnFocus: false,
  });

  return {
    results: data?.results ?? [],
    total: data?.total ?? 0,
    isLoading,
    isValidating,
    error,
  };
}
