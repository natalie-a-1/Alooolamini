/**
 * Normalizers for account payloads to ensure numeric balance fields.
 */
import type { Prisma } from "@prisma/client";

/**
 * Converts Prisma Decimal balance fields to numbers for API responses.
 */
export function normalizeAccountBalance<T extends Prisma.AccountGetPayload<{ include: { balance: true } }>>(account: T) {
  return {
    ...account,
    balance: account.balance
      ? {
          ...account.balance,
          availableBalance: Number(account.balance.availableBalance),
          currentBalance: Number(account.balance.currentBalance),
        }
      : null,
  };
}
