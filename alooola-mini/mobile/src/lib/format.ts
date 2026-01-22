export function formatCurrency(amount: number): string {
    return amount.toLocaleString('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    });
  }
  
export function formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }

  // Get the number of days for each timeframe
export function getTimeframeDays(tf: string): number {
  switch (tf) {
    case '1M': return 30;
    case '3M': return 90;
    case '6M': return 180;
    case '1Y': return 365;
    case 'ALL': return Infinity;
    default: return 30;
  }
}

export function formatTime(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  }

  export const normalizeName = (text: string) =>
    text
      .toLowerCase()
      .trim()
      .replace(/\s+/g, ' ');

export const isValidEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

export const formatMoneyInput = (text: string) => {
  const cleaned = text.replace(/\D/g, '');
  if (!cleaned) {
    return '';
  }
  const value = (parseInt(cleaned, 10) / 100).toFixed(2);
  return value;
};