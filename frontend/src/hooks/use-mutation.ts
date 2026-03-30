import { useState } from "react";
import { toast } from "sonner";

function useMutation<R>(
  mutationFn: () => Promise<R>,
  options?: {
    onSuccess?: string | ((result: R) => void);
    onError?: string | ((error: Error) => void);
  },
): {
  mutate: () => Promise<void>;
  loading: boolean;
  error: Error | null;
  isSuccess: boolean;
};

function useMutation<A, R>(
  mutationFn: (args: A) => Promise<R>,
  options?: {
    onSuccess?: string | ((result: R, args: A) => void);
    onError?: string | ((error: Error, args: A) => void);
  },
): {
  mutate: (args: A) => Promise<void>;
  loading: boolean;
  error: Error | null;
  isSuccess: boolean;
};

function useMutation<A, R>(
  mutationFn: ((args: A) => Promise<R>) | (() => Promise<R>),
  options?: {
    onSuccess?: string | ((result: R, args?: A) => void);
    onError?: string | ((error: Error, args?: A) => void);
  },
) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const mutate = async (args?: A) => {
    setLoading(true);
    setError(null);
    setIsSuccess(false);

    try {
      const result =
        args === undefined
          ? await (mutationFn as () => Promise<R>)()
          : await (mutationFn as (args: A) => Promise<R>)(args);

      setIsSuccess(true);
      if (options?.onSuccess) {
        if (typeof options.onSuccess === "string") {
          toast.success(options.onSuccess);
        } else {
          options.onSuccess(result, args);
        }
      }
    } catch (err) {
      setError(err as Error);
      if (options?.onError) {
        if (typeof options.onError === "string") {
          toast.error(options.onError);
        } else {
          options.onError(err as Error, args);
        }
      }
    } finally {
      setLoading(false);
    }
  };

  return { mutate, loading, error, isSuccess };
}

export default useMutation;
