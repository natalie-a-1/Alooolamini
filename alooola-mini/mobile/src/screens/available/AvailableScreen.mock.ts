/**
 * Mock data and types for the Available screen.
 */

export interface Activity {
  id: number;
  name: string;
  avatar: string;
  description: string;
  amount: number;
  date: string;
}

export const AVAILABLE_BALANCE = 32547.0;
export const TOTAL_REWARDS = 1542.0;
export const REWARD_RATE = 2;

export const MOCK_ACTIVITIES: Activity[] = [
  {
    id: 1,
    name: 'Logan Stein',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop',
    description: 'Here is some cash :)',
    amount: 80.0,
    date: '10/26/2023',
  },
  {
    id: 2,
    name: 'Anisa Pearson',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop',
    description: 'For concert shopping',
    amount: -50.0,
    date: '10/25/2023',
  },
  {
    id: 3,
    name: 'Professional Conference',
    avatar: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=100&h=100&fit=crop',
    description: 'Registration fee',
    amount: -450.0,
    date: '10/24/2023',
  },
  {
    id: 4,
    name: 'Sarah Johnson',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop',
    description: 'Referral bonus',
    amount: 200.0,
    date: '10/23/2023',
  },
];
