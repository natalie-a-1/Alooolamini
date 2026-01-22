/**
 * Mutual fund detail screen composition.
 */
import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';
import { Screen } from '@/components/Screen';
import { Icon } from '@/components/Icon';
import { COLORS } from '@/theme/colors';
import {
  getMutualFundPerformance,
  getMutualFundQuote,
  type MutualFund,
  type MutualFundPerformance,
  type MutualFundQuote,
} from '@/services/mutualFunds';
import { styles } from '../DiscoverScreen.styles';
import { FundDetailHeader } from '../components/FundDetailHeader';
import { FundPerformanceChart } from '../components/FundPerformanceChart';
import { FundQuoteStats } from '../components/FundQuoteStats';
import { FundMeta } from '../components/FundMeta';
import { FundActions } from '../components/FundActions';

type MutualFundDetailProps = {
  fund: MutualFund;
  onBack: () => void;
  forceDemo?: boolean;
  demoPerformance: (fund: MutualFund) => MutualFundPerformance;
  demoQuote: (fund: MutualFund, points?: MutualFundPerformance['points']) => MutualFundQuote;
};

export function MutualFundDetail({ fund, onBack, forceDemo = false, demoPerformance, demoQuote }: MutualFundDetailProps) {
  const [performance, setPerformance] = useState<MutualFundPerformance | null>(null);
  const [isPerformanceLoading, setIsPerformanceLoading] = useState(true);
  const [performanceError, setPerformanceError] = useState<string | null>(null);
  const [quote, setQuote] = useState<MutualFundQuote | null>(null);
  const [isQuoteLoading, setIsQuoteLoading] = useState(true);
  const [useDemoData, setUseDemoData] = useState(forceDemo);

  const applyDemoFallback = useCallback(() => {
    const demoPerf = demoPerformance(fund);
    const demoQ = demoQuote(fund, demoPerf.points);
    setUseDemoData(true);
    setPerformance(demoPerf);
    setQuote(demoQ);
    setPerformanceError(null);
    setIsPerformanceLoading(false);
    setIsQuoteLoading(false);
  }, [demoPerformance, demoQuote, fund]);

  useEffect(() => {
    let isMounted = true;
    if (forceDemo) {
      applyDemoFallback();
      return () => {
        isMounted = false;
      };
    }
    if (useDemoData) {
      return () => {
        isMounted = false;
      };
    }
    const loadPerformance = async () => {
      if (!fund.symbol) {
        setPerformance(null);
        setIsPerformanceLoading(false);
        setPerformanceError('No symbol available for this fund.');
        return;
      }
      try {
        const result = await getMutualFundPerformance(fund.symbol);
        if (!isMounted) return;
        setPerformance(result);
        setPerformanceError(null);
        setUseDemoData(false);
      } catch {
        if (!isMounted) return;
        applyDemoFallback();
      } finally {
        if (isMounted) {
          setIsPerformanceLoading(false);
        }
      }
    };

    loadPerformance();
    return () => {
      isMounted = false;
    };
  }, [applyDemoFallback, forceDemo, fund.symbol, useDemoData]);

  useEffect(() => {
    let isMounted = true;
    if (forceDemo) {
      applyDemoFallback();
      return () => {
        isMounted = false;
      };
    }
    if (useDemoData) {
      return () => {
        isMounted = false;
      };
    }
    const loadQuote = async () => {
      if (!fund.symbol) {
        setQuote(null);
        setIsQuoteLoading(false);
        return;
      }
      try {
        const result = await getMutualFundQuote(fund.symbol);
        if (!isMounted) return;
        setQuote(result);
        setUseDemoData(false);
      } catch {
        if (!isMounted) return;
        applyDemoFallback();
      } finally {
        if (isMounted) {
          setIsQuoteLoading(false);
        }
      }
    };

    loadQuote();
    return () => {
      isMounted = false;
    };
  }, [applyDemoFallback, forceDemo, fund.symbol, useDemoData]);

  const displayPerformance = performance;
  const displayQuote = quote;
  const performancePoints = displayPerformance?.points ?? [];

  const oneYearPercent = displayPerformance?.oneYearChangePercent ?? null;
  const rangeLow = displayPerformance?.rangeLow ?? null;
  const rangeHigh = displayPerformance?.rangeHigh ?? null;

  const isChartLoading = !useDemoData && isPerformanceLoading;
  const showChartError = !useDemoData && performanceError;
  const hasDisplayData = Boolean(displayQuote && displayPerformance);
  const detailNotice = useDemoData ? 'Showing demo data - live data unavailable.' : null;

  return (
    <Screen>
      <FundDetailHeader fund={fund} onBack={onBack} notice={detailNotice} />

      <FundQuoteStats
        price={displayQuote?.price ?? null}
        oneYearPercent={oneYearPercent}
        rangeLow={rangeLow}
        rangeHigh={rangeHigh}
        currency={fund.currency}
      />

      {isChartLoading ? (
        <View style={styles.detailCard}>
          <ActivityIndicator color={COLORS.ink} />
        </View>
      ) : showChartError ? (
        <View style={styles.detailCard}>
          <Text style={styles.emptyStateText}>Unable to load performance chart.</Text>
        </View>
      ) : hasDisplayData ? (
        <FundPerformanceChart points={performancePoints} currency={fund.currency} />
      ) : null}

      <FundMeta fund={fund} />

      <FundActions
        onAddToWatchlist={() => console.log('Add to watchlist', fund.symbol)}
        onBuy={() => console.log('Buy fund', fund.symbol)}
      />
    </Screen>
  );
}
