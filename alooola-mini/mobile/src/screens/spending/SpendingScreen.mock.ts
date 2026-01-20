/**
 * Mock data and types for the Spending screen.
 */

export interface SpendingCategory {
  id: number;
  name: string;
  icon: string;
  amount: number;
  percent: number;
  color: string;
  textColor: string;
}

export const TIMEFRAMES = ['This Week', 'This Month', 'This Year'];

export const TOTAL_SPENT = 4235.8;
export const MONTHLY_BUDGET = 6000.0;

export const MOCK_CATEGORIES: SpendingCategory[] = [
  {
    id: 1,
    name: 'Medical Equipment',
    icon: 'stethoscope',
    amount: 1250.0,
    percent: 29.5,
    color: '#e2e8f0',
    textColor: '#475569',
  },
  {
    id: 2,
    name: 'Continuing Education',
    icon: 'book',
    amount: 890.0,
    percent: 21.0,
    color: '#e4e4e7',
    textColor: '#52525b',
  },
  {
    id: 3,
    name: 'Professional Dues',
    icon: 'briefcase',
    amount: 650.0,
    percent: 15.3,
    color: '#e7e5e4',
    textColor: '#57534e',
  },
  {
    id: 4,
    name: 'Dining',
    icon: 'utensils',
    amount: 485.5,
    percent: 11.5,
    color: '#f5f5f5',
    textColor: '#737373',
  },
  {
    id: 5,
    name: 'Transportation',
    icon: 'car',
    amount: 420.3,
    percent: 9.9,
    color: '#f3f4f6',
    textColor: '#6b7280',
  },
  {
    id: 6,
    name: 'Other',
    icon: 'package',
    amount: 540.0,
    percent: 12.8,
    color: '#f3f4f6',
    textColor: '#6b7280',
  },
];
