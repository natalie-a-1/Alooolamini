/**
 * Mock data and types for the Discover screen.
 */

export interface Opportunity {
  id: number;
  name: string;
  ticker: string;
  return: string;
  risk: string;
}

export const BORDER_ACCENTS = [
  { borderLeftColor: '#94a3b8' },
  { borderLeftColor: '#71717a' },
  { borderLeftColor: '#6b7280' },
  { borderLeftColor: '#78716c' },
];

export const MOCK_OPPORTUNITIES: Opportunity[] = [
  {
    id: 1,
    name: 'Healthcare REIT Portfolio',
    ticker: 'MPW, WELL, DOC',
    return: '+12.4%',
    risk: 'Moderate',
  },
  {
    id: 2,
    name: 'Biotech Innovation Fund',
    ticker: 'XBI',
    return: '+18.7%',
    risk: 'Aggressive',
  },
  {
    id: 3,
    name: 'Medical Technology',
    ticker: 'MDT, ABT, SYK',
    return: '+10.2%',
    risk: 'Conservative',
  },
  {
    id: 4,
    name: 'Healthcare Leaders',
    ticker: 'UNH, JNJ, CVS',
    return: '+8.3%',
    risk: 'Conservative',
  },
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
