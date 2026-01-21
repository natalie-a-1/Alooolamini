/**
 * Business logic for the mutual funds module.
 */
import { env } from "../../config/env";
import { ApiError, badRequest, notFound } from "../../lib/errors";

const ALPHA_VANTAGE_URL = "https://www.alphavantage.co/query";
const SERIES_CACHE_TTL_MS = 30 * 60 * 1000;
const LIST_CACHE_TTL_MS = 6 * 60 * 60 * 1000;
const DEFAULT_LIMIT = 5;
const MAX_LIMIT = 6;

interface AlphaVantageTimeSeriesResponse {
  "Monthly Time Series"?: Record<string, Record<string, string>>;
  "Monthly Adjusted Time Series"?: Record<string, Record<string, string>>;
  "Weekly Time Series"?: Record<string, Record<string, string>>;
  "Weekly Adjusted Time Series"?: Record<string, Record<string, string>>;
  "Time Series (Daily)"?: Record<string, Record<string, string>>;
  Note?: string;
  "Error Message"?: string;
}

export interface MutualFundMatch {
  id: string;
  symbol: string;
  name: string;
  type: string;
  region: string;
  marketOpen: string;
  marketClose: string;
  timezone: string;
  currency: string;
  matchScore: number | null;
}

const dailySeriesCache = new Map<string, { fetchedAt: number; data: MutualFundPerformancePoint[] }>();
const monthlySeriesCache = new Map<string, { fetchedAt: number; data: MutualFundPerformancePoint[] }>();
const fundDataCache = new Map<
  string,
  { fetchedAt: number; data: { quote: MutualFundQuote; performance: MutualFundPerformance } | null }
>();
let listCache: { fetchedAt: number; data: MutualFundMatch[] } | null = null;

function parseNumber(value?: string) {
  if (!value) return null;
  const parsed = Number(value);
  return Number.isNaN(parsed) ? null : parsed;
}

const CURATED_FUNDS: MutualFundMatch[] = [
  {
    id: "VFIAX",
    symbol: "VFIAX",
    name: "Vanguard 500 Index Fund Admiral Shares",
    type: "Mutual Fund",
    region: "United States",
    marketOpen: "09:30",
    marketClose: "16:00",
    timezone: "UTC-04",
    currency: "USD",
    matchScore: null,
  },
  {
    id: "VTSAX",
    symbol: "VTSAX",
    name: "Vanguard Total Stock Market Index Fund Admiral Shares",
    type: "Mutual Fund",
    region: "United States",
    marketOpen: "09:30",
    marketClose: "16:00",
    timezone: "UTC-04",
    currency: "USD",
    matchScore: null,
  },
  {
    id: "FXAIX",
    symbol: "FXAIX",
    name: "Fidelity 500 Index Fund",
    type: "Mutual Fund",
    region: "United States",
    marketOpen: "09:30",
    marketClose: "16:00",
    timezone: "UTC-04",
    currency: "USD",
    matchScore: null,
  },
  {
    id: "FSKAX",
    symbol: "FSKAX",
    name: "Fidelity Total Market Index Fund",
    type: "Mutual Fund",
    region: "United States",
    marketOpen: "09:30",
    marketClose: "16:00",
    timezone: "UTC-04",
    currency: "USD",
    matchScore: null,
  },
  {
    id: "SWPPX",
    symbol: "SWPPX",
    name: "Schwab S&P 500 Index Fund",
    type: "Mutual Fund",
    region: "United States",
    marketOpen: "09:30",
    marketClose: "16:00",
    timezone: "UTC-04",
    currency: "USD",
    matchScore: null,
  },
  {
    id: "FCNTX",
    symbol: "FCNTX",
    name: "Fidelity Contrafund",
    type: "Mutual Fund",
    region: "United States",
    marketOpen: "09:30",
    marketClose: "16:00",
    timezone: "UTC-04",
    currency: "USD",
    matchScore: null,
  },
  {
    id: "TRBCX",
    symbol: "TRBCX",
    name: "T. Rowe Price Blue Chip Growth Fund",
    type: "Mutual Fund",
    region: "United States",
    marketOpen: "09:30",
    marketClose: "16:00",
    timezone: "UTC-04",
    currency: "USD",
    matchScore: null,
  },
  {
    id: "PRGFX",
    symbol: "PRGFX",
    name: "T. Rowe Price Growth Stock Fund",
    type: "Mutual Fund",
    region: "United States",
    marketOpen: "09:30",
    marketClose: "16:00",
    timezone: "UTC-04",
    currency: "USD",
    matchScore: null,
  },
];

function buildSeriesParams(
  symbol: string,
  seriesFn: string,
  options?: { outputsize?: "compact" | "full"; datatype?: "json" | "csv" }
) {
  const url = new URL(ALPHA_VANTAGE_URL);
  url.searchParams.set("function", seriesFn);
  url.searchParams.set("symbol", symbol);
  if (options?.outputsize) {
    url.searchParams.set("outputsize", options.outputsize);
  }
  if (options?.datatype) {
    url.searchParams.set("datatype", options.datatype);
  }
  url.searchParams.set("apikey", env.ALPHA_VANTAGE_API_KEY ?? "");
  return url.toString();
}

export interface MutualFundPerformancePoint {
  date: string;
  close: number;
}

export interface MutualFundPerformance {
  symbol: string;
  points: MutualFundPerformancePoint[];
  rangeLow: number;
  rangeHigh: number;
  oneMonthChange: number;
  oneMonthChangePercent: number;
  oneYearChange: number;
  oneYearChangePercent: number;
}

export interface MutualFundQuote {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  asOf: string;
}

type SeriesSource = {
  functionName: string;
  seriesKeys: (keyof AlphaVantageTimeSeriesResponse)[];
  closeKeys: string[];
  outputsize?: "compact" | "full";
};

const DAILY_SERIES_SOURCE: SeriesSource = {
  functionName: "TIME_SERIES_DAILY",
  seriesKeys: ["Time Series (Daily)"],
  closeKeys: ["4. close"],
  outputsize: "compact",
};

const MONTHLY_SERIES_SOURCES: SeriesSource[] = [
  {
    functionName: "TIME_SERIES_MONTHLY_ADJUSTED",
    seriesKeys: ["Monthly Adjusted Time Series"],
    closeKeys: ["5. adjusted close", "4. close"],
  },
  {
    functionName: "TIME_SERIES_MONTHLY",
    seriesKeys: ["Monthly Time Series"],
    closeKeys: ["4. close"],
  },
];

/** List mutual funds from a curated allowlist. */
export async function listMutualFunds(options?: { keywords?: string; limit?: number }) {
  if (!env.ALPHA_VANTAGE_API_KEY) {
    throw badRequest("ALPHA_VANTAGE_API_KEY not configured");
  }

  const limit = Math.min(Math.max(options?.limit ?? DEFAULT_LIMIT, 1), MAX_LIMIT);
  const normalizedKeyword = options?.keywords?.trim().toLowerCase();

  const isCacheFresh =
    listCache && Date.now() - listCache.fetchedAt < LIST_CACHE_TTL_MS && listCache.data.length > 0;

  const applyFilter = (funds: MutualFundMatch[]) =>
    normalizedKeyword
      ? funds.filter((fund) =>
          `${fund.name} ${fund.symbol}`.toLowerCase().includes(normalizedKeyword)
        )
      : funds;

  if (isCacheFresh) {
    const cachedResults = applyFilter(listCache!.data).slice(0, limit);
    if (cachedResults.length > 0) {
      return cachedResults;
    }
  }

  const results: MutualFundMatch[] = [];
  try {
    for (const fund of CURATED_FUNDS) {
      const data = await getFundData(fund.symbol);
      if (data) {
        results.push(fund);
      }
    }
  } catch (error) {
    if (isCacheFresh) {
      return applyFilter(listCache!.data).slice(0, limit);
    }
    throw error;
  }

  if (results.length === 0) {
    throw notFound("No mutual funds with complete data available.");
  }

  listCache = { fetchedAt: Date.now(), data: results };
  const filteredResults = applyFilter(results).slice(0, limit);
  if (filteredResults.length === 0) {
    throw notFound("No mutual funds match your search with complete data.");
  }
  return filteredResults;
}

async function getDailySeries(symbol: string) {
  const cacheKey = symbol.toUpperCase();
  const cached = dailySeriesCache.get(cacheKey);
  if (cached && Date.now() - cached.fetchedAt < SERIES_CACHE_TTL_MS) {
    return cached.data;
  }

  const points = await fetchSeries(cacheKey, DAILY_SERIES_SOURCE);
  const safePoints = points ?? [];
  dailySeriesCache.set(cacheKey, { fetchedAt: Date.now(), data: safePoints });
  return safePoints;
}

async function getMonthlySeries(symbol: string) {
  const cacheKey = symbol.toUpperCase();
  const cached = monthlySeriesCache.get(cacheKey);
  if (cached && Date.now() - cached.fetchedAt < SERIES_CACHE_TTL_MS) {
    return cached.data;
  }

  let points: MutualFundPerformancePoint[] | null = null;
  for (const source of MONTHLY_SERIES_SOURCES) {
    points = await fetchSeries(cacheKey, source);
    if (points && points.length > 0) break;
  }
  const safePoints = points ?? [];
  monthlySeriesCache.set(cacheKey, { fetchedAt: Date.now(), data: safePoints });
  return safePoints;
}

async function fetchSeries(symbol: string, source: SeriesSource) {
  const response = await fetch(
    buildSeriesParams(symbol, source.functionName, {
      outputsize: source.outputsize,
      datatype: "json",
    })
  );

  let payload: AlphaVantageTimeSeriesResponse | string;
  try {
    payload = (await response.json()) as AlphaVantageTimeSeriesResponse;
  } catch (error) {
    payload = await response.text();
  }

  if (!response.ok) {
    throw badRequest("Alpha Vantage request failed", "ALPHA_VANTAGE_ERROR", {
      status: response.status,
      payload,
    });
  }

  if (typeof payload === "string") {
    return null;
  }

  if (payload.Note) {
    throw new ApiError(429, "ALPHA_VANTAGE_RATE_LIMIT", "Alpha Vantage rate limit reached", {
      note: payload.Note,
    });
  }

  if ("Information" in payload && payload.Information) {
    throw new ApiError(429, "ALPHA_VANTAGE_RATE_LIMIT", "Alpha Vantage rate limit reached", {
      info: payload.Information,
    });
  }

  if (payload["Error Message"]) {
    return null;
  }

  const seriesKey = source.seriesKeys.find((key) => payload[key]);
  const series = seriesKey ? payload[seriesKey] : undefined;
  if (!series) return null;

  const points = Object.entries(series)
    .map(([date, data]) => {
      const closeValue = source.closeKeys
        .map((key) => parseNumber(data[key]))
        .find((value) => value !== null);
      return {
        date,
        close: closeValue ?? NaN,
      };
    })
    .filter((point) => Number.isFinite(point.close))
    .sort((a, b) => a.date.localeCompare(b.date));

  return points.length > 0 ? points : null;
}

function buildMonthlyPerformance(symbol: string, points: MutualFundPerformancePoint[]) {
  const sorted = [...points].sort((a, b) => a.date.localeCompare(b.date));
  if (sorted.length < 13) return null;
  const lastThirteen = sorted.slice(-13);
  const lastTwelve = lastThirteen.slice(1);
  const latest = lastThirteen[lastThirteen.length - 1];
  const previous = lastThirteen[lastThirteen.length - 2];
  const yearAgo = lastThirteen[0];
  if (!previous || !yearAgo || previous.close <= 0 || yearAgo.close <= 0) return null;

  const rangeLow = Math.min(...lastTwelve.map((point) => point.close));
  const rangeHigh = Math.max(...lastTwelve.map((point) => point.close));
  const oneMonthChange = latest.close - previous.close;
  const oneMonthChangePercent = (oneMonthChange / previous.close) * 100;
  const oneYearChange = latest.close - yearAgo.close;
  const oneYearChangePercent = (oneYearChange / yearAgo.close) * 100;

  return {
    symbol,
    points: lastTwelve,
    rangeLow,
    rangeHigh,
    oneMonthChange,
    oneMonthChangePercent,
    oneYearChange,
    oneYearChangePercent,
  } satisfies MutualFundPerformance;
}

function buildDailyQuote(symbol: string, points: MutualFundPerformancePoint[]) {
  if (points.length < 2) return null;
  const latest = points[points.length - 1];
  const previous = points[points.length - 2];
  if (!previous || previous.close <= 0) return null;
  const change = latest.close - previous.close;
  const changePercent = (change / previous.close) * 100;
  return {
    symbol,
    price: latest.close,
    change,
    changePercent,
    asOf: latest.date,
  } satisfies MutualFundQuote;
}

async function getFundData(symbol: string) {
  const cacheKey = symbol.toUpperCase();
  const cached = fundDataCache.get(cacheKey);
  if (cached && Date.now() - cached.fetchedAt < SERIES_CACHE_TTL_MS) {
    return cached.data;
  }

  const monthlyPoints = await getMonthlySeries(cacheKey);
  const performance = monthlyPoints.length ? buildMonthlyPerformance(cacheKey, monthlyPoints) : null;
  if (!performance) {
    fundDataCache.set(cacheKey, { fetchedAt: Date.now(), data: null });
    return null;
  }

  const dailyPoints = await getDailySeries(cacheKey);
  const quote = dailyPoints.length ? buildDailyQuote(cacheKey, dailyPoints) : null;
  const data = quote && performance ? { quote, performance } : null;
  fundDataCache.set(cacheKey, { fetchedAt: Date.now(), data });
  return data;
}

export async function getMutualFundPerformance(symbol: string): Promise<MutualFundPerformance> {
  if (!env.ALPHA_VANTAGE_API_KEY) {
    throw badRequest("ALPHA_VANTAGE_API_KEY not configured");
  }

  const cacheKey = symbol.toUpperCase();
  const data = await getFundData(cacheKey);
  if (!data) {
    throw notFound("Mutual fund data unavailable");
  }
  return data.performance;
}

/** Get latest quote for a mutual fund symbol. */
export async function getMutualFundQuote(symbol: string): Promise<MutualFundQuote> {
  if (!env.ALPHA_VANTAGE_API_KEY) {
    throw badRequest("ALPHA_VANTAGE_API_KEY not configured");
  }

  const cacheKey = symbol.toUpperCase();
  const data = await getFundData(cacheKey);
  if (!data) {
    throw notFound("Mutual fund data unavailable");
  }
  return data.quote;
}
