import { ApolloError, QueryResult as ApolloQueryResult } from '@apollo/client';
import { CommonPaginatedResultInfo, UnspecifiedError } from '@lens-protocol/api-bindings';
import { Prettify } from '@lens-protocol/shared-kernel';

/**
 * @internal
 */
export type ReadResultWithoutError<T> =
  | {
      data: undefined;
      loading: true;
    }
  | {
      data: T;
      loading: false;
    };

/**
 * @internal
 */
export type ReadResultWithError<T, E> =
  | {
      data: undefined;
      error: undefined;
      loading: true;
    }
  | {
      data: T;
      error: undefined;
      loading: false;
    }
  | {
      data: undefined;
      error: E;
      loading: false;
    };

export type ReadResult<T, E = UnspecifiedError> = E extends Error
  ? ReadResultWithError<T, E>
  : ReadResultWithoutError<T>;

function buildReadResult<T>(
  data: T | undefined,
  loading: boolean,
  error: ApolloError | undefined,
): ReadResult<T, UnspecifiedError> {
  if (data !== undefined && !loading) {
    return {
      data,
      error: undefined,
      loading: false,
    };
  }

  if (error) {
    return {
      data: undefined,
      error: new UnspecifiedError(error),
      loading: false,
    };
  }

  return {
    data: undefined,
    error: undefined,
    loading: true,
  };
}

export type QueryData<R> = { result: R };

type InferResult<T extends QueryData<unknown>> = T extends QueryData<infer R> ? R : never;

export function useReadResult<
  T extends QueryData<R>,
  R = InferResult<T>,
  V = { [key: string]: never },
>({ error, data, loading }: ApolloQueryResult<T, V>): ReadResult<R, UnspecifiedError> {
  return buildReadResult(data?.result, loading, error);
}

export type PaginatedArgs<T> = Prettify<
  T & {
    limit?: number;
  }
>;

export type PaginatedReadResult<T> = ReadResult<T, UnspecifiedError> & {
  hasMore: boolean;
  next: () => Promise<void>;
};

export type { CommonPaginatedResultInfo };

export type PaginatedQueryData<K> = {
  result: { pageInfo: CommonPaginatedResultInfo; items: K };
};

type InferPaginatedItemsType<T extends PaginatedQueryData<unknown>> = T extends PaginatedQueryData<
  infer R
>
  ? R
  : never;

export function usePaginatedReadResult<
  V,
  T extends PaginatedQueryData<K>,
  K = InferPaginatedItemsType<T>,
>({ error, data, loading, fetchMore }: ApolloQueryResult<T, V>): PaginatedReadResult<K> {
  return {
    ...buildReadResult<K>(data?.result.items, loading, error),
    hasMore: data?.result.pageInfo.next ? true : false,
    next: async () => {
      if (data?.result.pageInfo.next) {
        await fetchMore({
          variables: {
            cursor: data?.result.pageInfo.next,
          },
        });
      }
    },
  };
}
