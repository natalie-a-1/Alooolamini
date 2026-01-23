/**
 * Account type metadata for icons and labels.
 */
import { type AccountType } from '../hooks/useAccountsData';

export const ACCOUNT_TYPE_ICONS: Record<AccountType, string> = {
  checking: 'building',
  savings: 'piggyBank',
  investment: 'trendingUp',
  credit: 'creditCard',
};

export const ACCOUNT_TYPE_LABELS: Record<AccountType, string> = {
  checking: 'Checking',
  savings: 'Savings',
  investment: 'Invest',
  credit: 'Credit',
};

export const ACCOUNT_TYPES: AccountType[] = ['checking', 'savings', 'investment', 'credit'];