# Mobile Caching with TanStack Query

This document explains the caching layer implemented in the mobile app using TanStack Query (React Query).

---

## Overview

All server state is managed through TanStack Query, providing:
- **Automatic caching** - Data is cached and reused across screens
- **Background refetching** - Stale data is refreshed automatically
- **Cache invalidation** - Mutations update all affected views immediately

---

## File Structure

```
mobile/src/lib/
├── queryClient.ts   # QueryClient configuration (stale times, retry logic)
├── queryKeys.ts     # Centralized query key definitions
├── useQueries.ts    # Shared hooks for queries and mutations
└── CACHING.md       # This documentation
```

---

## Query Keys

All query keys are defined in `queryKeys.ts`. This ensures:
- Consistent keys across the app
- Easy cache invalidation after mutations
- Clear documentation of what data exists

### Key Structure Pattern

```ts
export const featureKeys = {
  all: ['feature'] as const,                           // Base key for invalidating all
  list: (param: string) => [...featureKeys.all, 'list', param] as const,
  detail: (id: string) => [...featureKeys.all, 'detail', id] as const,
};
```

### Current Keys

| Feature | Key | Purpose |
|---------|-----|---------|
| `investmentKeys.summary` | `['investments', 'summary', householdId]` | Investment totals for Home screen |
| `accountKeys.list` | `['accounts', 'list', householdId]` | All accounts for Accounts screen |
| `accountKeys.transactions` | `['accounts', 'transactions', householdId, accountId]` | Transactions per account |
| `accountKeys.categories` | `['accounts', 'categories', householdId]` | Spending categories |
| `watchlistKeys.list` | `['watchlist', 'list']` | User's watchlist items |
| `notificationKeys.unreadCount` | `['notifications', 'unreadCount']` | Unread notification badge |

---

## Default Cache Settings

Configured in `queryClient.ts`:

```ts
{
  queries: {
    staleTime: 30 * 1000,        // Data fresh for 30 seconds
    gcTime: 5 * 60 * 1000,       // Keep unused data for 5 minutes
    refetchOnWindowFocus: false, // No auto-refetch on tab focus (mobile)
    retry: 1,                    // Retry failed requests once
  }
}
```

### Override for Critical Data

Some queries override defaults for fresher data:

```ts
// Investment summary always refetches on mount
useQuery({
  queryKey: investmentKeys.summary(householdId),
  staleTime: 0,                  // Always considered stale
  refetchOnMount: 'always',      // Refetch every time component mounts
});
```

---

## Writing a New Query Hook

### Step 1: Add Query Key

In `queryKeys.ts`:

```ts
export const myFeatureKeys = {
  all: ['myFeature'] as const,
  list: (userId: string) => [...myFeatureKeys.all, 'list', userId] as const,
};
```

### Step 2: Create Query Hook

In `useQueries.ts`:

```ts
import { getMyFeatureData } from '@/services/myFeature';

export function useMyFeature(userId: string | undefined) {
  return useQuery({
    queryKey: myFeatureKeys.list(userId ?? ''),
    queryFn: async () => {
      if (!userId) return [];
      return getMyFeatureData(userId);
    },
    enabled: !!userId,  // Don't fetch if userId is missing
  });
}
```

### Step 3: Use in Component

```tsx
function MyScreen() {
  const { data, isLoading, error } = useMyFeature(user?.id);
  
  if (isLoading) return <Loading />;
  if (error) return <Error />;
  return <MyContent data={data} />;
}
```

---

## Writing a Mutation with Cache Invalidation

### When to Invalidate

After a mutation, invalidate any queries whose data may have changed:

| Mutation | Invalidate |
|----------|------------|
| Create transaction | `accounts.list`, `accounts.transactions`, `investments.summary` |
| Create account | `accounts.list`, `investments.summary` |
| Add to watchlist | `watchlist.all` |

### Example Mutation

```ts
export function useCreateThing() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: ThingInput }) => {
      return createThing(id, data);
    },
    onSuccess: (_, variables) => {
      // Invalidate affected queries - they will refetch automatically
      queryClient.invalidateQueries({
        queryKey: thingKeys.list(variables.id),
      });
      
      // Invalidate related data that might be affected
      queryClient.invalidateQueries({
        queryKey: otherKeys.summary(variables.id),
      });
    },
  });
}
```

### Using the Mutation

```tsx
function MyComponent() {
  const createThing = useCreateThing();
  
  const handleSubmit = async (data) => {
    try {
      await createThing.mutateAsync({ id: userId, data });
      // Success! Cache is automatically invalidated
    } catch (error) {
      // Handle error
    }
  };
  
  return (
    <Button 
      onPress={handleSubmit} 
      disabled={createThing.isPending}
    />
  );
}
```

---

## Cache Invalidation Patterns

### Narrow Invalidation (Preferred)

Invalidate specific queries:

```ts
queryClient.invalidateQueries({
  queryKey: accountKeys.transactions(householdId, accountId),
});
```

### Broad Invalidation

Invalidate all queries for a feature:

```ts
queryClient.invalidateQueries({
  queryKey: accountKeys.all,  // Invalidates ALL account-related queries
});
```

### Direct Cache Update (Advanced)

For optimistic updates, set data directly:

```ts
queryClient.setQueryData(
  accountKeys.list(householdId),
  (old) => [...old, newAccount]
);
```

---

## Debugging Tips

1. **Check query key matches**: Ensure the key used in `useQuery` matches the key used in `invalidateQueries`

2. **Verify enabled condition**: If query isn't running, check the `enabled` option

3. **Use React Query DevTools**: Add devtools for debugging (not included in production):
   ```ts
   import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
   ```

4. **Log invalidations**: Temporarily log to verify invalidation is triggered:
   ```ts
   onSuccess: () => {
     console.log('Invalidating:', someKeys.list(id));
     queryClient.invalidateQueries({ queryKey: someKeys.list(id) });
   }
   ```

---

## Quick Reference

| Task | Code |
|------|------|
| Fetch data | `useQuery({ queryKey, queryFn })` |
| Mutate data | `useMutation({ mutationFn, onSuccess })` |
| Invalidate cache | `queryClient.invalidateQueries({ queryKey })` |
| Set cache directly | `queryClient.setQueryData(queryKey, data)` |
| Check if loading | `const { isLoading } = useQuery(...)` |
| Check if mutating | `const { isPending } = useMutation(...)` |
| Refetch manually | `const { refetch } = useQuery(...)` |

---

## Further Reading

- [TanStack Query Docs](https://tanstack.com/query/latest/docs/react/overview)
- [Query Keys Guide](https://tanstack.com/query/latest/docs/react/guides/query-keys)
- [Mutations Guide](https://tanstack.com/query/latest/docs/react/guides/mutations)
- [Cache Invalidation](https://tanstack.com/query/latest/docs/react/guides/query-invalidation)
