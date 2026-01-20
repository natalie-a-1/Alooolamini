/**
 * Mock data and types for the Home screen.
 */

export interface PortfolioData {
  portfolioValue: number;
  gain: number;
  chartData: number[];
}

export const DEMO_DATA: PortfolioData = {
  portfolioValue: 134420.5,
  gain: 2945.75,
  chartData: [50, 45, 55, 52, 60, 58, 65, 62, 70, 68, 75, 72, 80, 78, 85, 82, 88, 86, 90, 88, 92],
};

export const TIMEFRAMES = ['1M', '3M', '6M', '1Y', 'ALL'];
