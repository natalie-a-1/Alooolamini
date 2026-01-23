/**
 * Mock data for the Assistant (AI chat) screen.
 */

export const QUICK_ACTIONS = ['Portfolio recommendations', 'Tax strategies', 'Schedule with advisor'];

export const AVAILABLE_DATES = ['Mon, Jan 20', 'Tue, Jan 21', 'Wed, Jan 22', 'Thu, Jan 23', 'Fri, Jan 24'];

export const AVAILABLE_TIMES = ['9:00 AM', '10:30 AM', '2:00 PM', '3:30 PM', '5:00 PM'];

export const INITIAL_AI_MESSAGE = {
  id: 1,
  type: 'ai' as const,
  text: 'Hi Dr. Morgan! How can I help you today?',
  time: 'Just now',
};
