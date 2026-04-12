import { useCallback, useState } from "react";

type QueryState<R> = {
  data: R | null;
  isLoading: boolean;
  error: Error | null;
};

function useQuery<R>(queryFn: () => Promise<R>) {
  const [data, setData] = useState<R | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const setQueryState = useCallback((next: Partial<QueryState<R>>) => {
    if ("data" in next) {
      setData((next.data as R | null) ?? null);
    }
    if ("isLoading" in next) {
      setIsLoading(next.isLoading ?? false);
    }
    if ("error" in next) {
      setError(next.error ?? null);
    }
  }, []);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await queryFn();
      setData(result);
    } catch (err) {
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  }, [queryFn]);

  return {
    data,
    isLoading,
    error,
    refetch: fetchData,
    setQueryState,
  };
}

export default useQuery;
