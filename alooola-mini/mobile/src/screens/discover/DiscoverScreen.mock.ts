/**
 * Mock data for the Discover screen.
 */

export const BORDER_ACCENTS = [
  { borderLeftColor: '#94a3b8' },
  { borderLeftColor: '#71717a' },
  { borderLeftColor: '#6b7280' },
  { borderLeftColor: '#78716c' },
];

export const QUICK_ACTIONS = ['Portfolio recommendations', 'Tax strategies', 'Schedule with advisor'];

export const AVAILABLE_DATES = ['Mon, Jan 20', 'Tue, Jan 21', 'Wed, Jan 22', 'Thu, Jan 23', 'Fri, Jan 24'];

export const AVAILABLE_TIMES = ['9:00 AM', '10:30 AM', '2:00 PM', '3:30 PM', '5:00 PM'];

export const INITIAL_AI_MESSAGE = {
  id: 1,
  type: 'ai' as const,
  text: 'Hi Dr. Morgan! How can I help you today?',
  time: 'Just now',
};

export const DEMO_MUTUAL_FUNDS = [
  {
    id: 'VFIAX',
    symbol: 'VFIAX',
    name: 'Vanguard 500 Index Fund Admiral Shares',
    type: 'Mutual Fund',
    region: 'United States',
    marketOpen: '09:30',
    marketClose: '16:00',
    timezone: 'UTC-04',
    currency: 'USD',
    matchScore: null,
  },
  {
    id: 'VTSAX',
    symbol: 'VTSAX',
    name: 'Vanguard Total Stock Market Index Fund Admiral Shares',
    type: 'Mutual Fund',
    region: 'United States',
    marketOpen: '09:30',
    marketClose: '16:00',
    timezone: 'UTC-04',
    currency: 'USD',
    matchScore: null,
  },
  {
    id: 'FXAIX',
    symbol: 'FXAIX',
    name: 'Fidelity 500 Index Fund',
    type: 'Mutual Fund',
    region: 'United States',
    marketOpen: '09:30',
    marketClose: '16:00',
    timezone: 'UTC-04',
    currency: 'USD',
    matchScore: null,
  },
  {
    id: 'FSKAX',
    symbol: 'FSKAX',
    name: 'Fidelity Total Market Index Fund',
    type: 'Mutual Fund',
    region: 'United States',
    marketOpen: '09:30',
    marketClose: '16:00',
    timezone: 'UTC-04',
    currency: 'USD',
    matchScore: null,
  },
  {
    id: 'SWPPX',
    symbol: 'SWPPX',
    name: 'Schwab S&P 500 Index Fund',
    type: 'Mutual Fund',
    region: 'United States',
    marketOpen: '09:30',
    marketClose: '16:00',
    timezone: 'UTC-04',
    currency: 'USD',
    matchScore: null,
  },
];

export const DEMO_BASE_PRICES: Record<string, number> = {
  VFIAX: 445.12,
  VTSAX: 125.44,
  FXAIX: 184.21,
  FSKAX: 118.76,
  SWPPX: 77.91,
  FCNTX: 16.85,
  TRBCX: 195.32,
  PRGFX: 71.09,
};
