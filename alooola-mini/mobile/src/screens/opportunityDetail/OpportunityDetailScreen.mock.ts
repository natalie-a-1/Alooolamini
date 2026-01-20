/**
 * Mock data and types for the OpportunityDetail screen.
 */

export interface Opportunity {
  id: number;
  name: string;
  ticker: string;
  return: string;
  risk: string;
}

export interface PerformanceData {
  period: string;
  value: string;
}

export interface KeyMetric {
  label: string;
  value: string;
}

export const MOCK_KEY_METRICS: KeyMetric[] = [
  { label: 'Market Cap', value: '$12.4B' },
  { label: 'P/E Ratio', value: '18.5' },
  { label: 'Dividend Yield', value: '3.2%' },
  { label: 'Expense Ratio', value: '0.45%' },
];

export const MOCK_RISK_FACTORS = [
  'Healthcare sector volatility',
  'Regulatory changes',
  'Market concentration risk',
  'Interest rate sensitivity',
];

export const MOCK_BENEFITS = [
  'Leverage sector knowledge and expertise',
  'Align investments with professional background',
  'Long-term sector growth potential',
];

export const CHART_DATA = [40, 55, 48, 65, 58, 72, 68, 80, 75, 85];

export const getPerformanceData = (opportunity: Opportunity): PerformanceData[] => [
  { period: '1W', value: '+2.1%' },
  { period: '1M', value: '+5.3%' },
  { period: '3M', value: '+8.7%' },
  { period: '1Y', value: opportunity.return },
  { period: 'ALL', value: '+24.5%' },
];
