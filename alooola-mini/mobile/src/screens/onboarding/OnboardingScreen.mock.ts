/**
 * Mock data and types for the Onboarding screen.
 */

export interface Goal {
  id: string;
  label: string;
  icon: string;
}

export interface RiskLevel {
  id: string;
  label: string;
  description: string;
}

export const GOALS: Goal[] = [
  { id: 'retirement', label: 'Retirement Planning', icon: 'target' },
  { id: 'wealth', label: 'Wealth Building', icon: 'trendingUp' },
  { id: 'education', label: 'Education Fund', icon: 'graduationCap' },
  { id: 'property', label: 'Property Investment', icon: 'home' },
  { id: 'emergency', label: 'Emergency Fund', icon: 'shield' },
  { id: 'other', label: 'Other Goals', icon: 'crosshair' },
];

export const RISK_LEVELS: RiskLevel[] = [
  {
    id: 'conservative',
    label: 'Conservative',
    description: 'Lower risk, steady growth',
  },
  {
    id: 'moderate',
    label: 'Moderate',
    description: 'Balanced risk and reward',
  },
  {
    id: 'aggressive',
    label: 'Aggressive',
    description: 'Higher risk, maximum growth',
  },
];

export const STARTER_AMOUNTS = ['1000', '5000', '10000', '25000', '50000'];
