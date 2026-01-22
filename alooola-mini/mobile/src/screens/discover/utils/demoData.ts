/**
 * Demo data builders for mutual fund performance and quotes.
 */
import { type MutualFund, type MutualFundPerformance, type MutualFundPerformancePoint, type MutualFundQuote } from '@/services/mutualFunds';
import { DEMO_BASE_PRICES } from '../DiscoverScreen.mock';

export function buildDemoPerformance(fund: MutualFund): MutualFundPerformance {
  const base = DEMO_BASE_PRICES[fund.symbol] ?? 100;
  const now = new Date();
  const points: MutualFundPerformancePoint[] = [];

  for (let i = 11; i >= 0; i -= 1) {
    const monthIndex = 11 - i;
    const date = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - i, 1));
    const trend = 1 + 0.008 * monthIndex;
    const swing = 1 + 0.02 * Math.sin(monthIndex / 2);
    const close = Number((base * trend * swing).toFixed(2));
    points.push({ date: date.toISOString().slice(0, 10), close });
  }

  const latest = points[points.length - 1];
  const previous = points[points.length - 2] ?? latest;
  const first = points[0];
  const rangeLow = Math.min(...points.map((point) => point.close));
  const rangeHigh = Math.max(...points.map((point) => point.close));
  const oneMonthChange = latest.close - previous.close;
  const oneMonthChangePercent = previous.close ? (oneMonthChange / previous.close) * 100 : 0;
  const oneYearChange = latest.close - first.close;
  const oneYearChangePercent = first.close ? (oneYearChange / first.close) * 100 : 0;

  return {
    symbol: fund.symbol,
    points,
    rangeLow,
    rangeHigh,
    oneMonthChange,
    oneMonthChangePercent,
    oneYearChange,
    oneYearChangePercent,
  };
}

export function buildDemoQuote(fund: MutualFund, points?: MutualFundPerformancePoint[]): MutualFundQuote {
  const performancePoints = points && points.length >= 2 ? points : buildDemoPerformance(fund).points;
  const latest = performancePoints[performancePoints.length - 1];
  const previous = performancePoints[performancePoints.length - 2];
  const change = latest.close - previous.close;
  const changePercent = previous.close ? (change / previous.close) * 100 : 0;

  return {
    symbol: fund.symbol,
    price: latest.close,
    change,
    changePercent,
    asOf: latest.date,
  };
}
