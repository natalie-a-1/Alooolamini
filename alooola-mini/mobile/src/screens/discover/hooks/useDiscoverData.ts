/**
 * Manages Discover screen data: mutual fund list, selection, demo fallback, AI chat state, and navigation param handling.
 */
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useFocusEffect, useNavigation, useRoute } from '@react-navigation/native';
import type { MainTabScreenProps } from '@/navigation/types';
import {
  getMutualFunds,
  type MutualFund,
  type MutualFundPerformance,
  type MutualFundPerformancePoint,
  type MutualFundQuote,
} from '@/services/mutualFunds';
import { DEMO_MUTUAL_FUNDS, INITIAL_AI_MESSAGE } from '../DiscoverScreen.mock';
import { buildDemoPerformance, buildDemoQuote } from '../utils/demoData';

type UseDiscoverDataReturn = {
  isLoading: boolean;
  isDemoList: boolean;
  listNotice: string | null;
  errorMessage: string | null;
  mutualFunds: MutualFund[];
  selectedFund: MutualFund | null;
  selectFund: (fund: MutualFund | null) => void;
  showAIChat: boolean;
  openAIChat: () => void;
  closeAIChat: () => void;
  demoPerformance: (fund: MutualFund) => MutualFundPerformance;
  demoQuote: (fund: MutualFund, points?: MutualFundPerformancePoint[]) => MutualFundQuote;
};

export function useDiscoverData(): UseDiscoverDataReturn {
  const route = useRoute<MainTabScreenProps<'Discover'>['route']>();
  const navigation = useNavigation<MainTabScreenProps<'Discover'>['navigation']>();

  const [showAIChat, setShowAIChat] = useState(false);
  const [mutualFunds, setMutualFunds] = useState<MutualFund[]>([]);
  const [selectedFund, setSelectedFund] = useState<MutualFund | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [listNotice, setListNotice] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDemoList, setIsDemoList] = useState(false);

  const loadMutualFunds = useCallback(async () => {
    try {
      const funds = await getMutualFunds({ limit: 5 });
      if (funds.length === 0) {
        setMutualFunds(DEMO_MUTUAL_FUNDS);
        setListNotice('Showing demo data - live mutual fund data is unavailable.');
        setIsDemoList(true);
      } else {
        setMutualFunds(funds);
        setListNotice(null);
        setIsDemoList(false);
      }
      setErrorMessage(null);
    } catch (error) {
      setMutualFunds(DEMO_MUTUAL_FUNDS);
      setErrorMessage(null);
      setListNotice('Showing demo data - live mutual fund data is unavailable.');
      setIsDemoList(true);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadMutualFunds();
  }, [loadMutualFunds]);

  useFocusEffect(
    useCallback(() => {
      if (route.params?.openAIChat) {
        setShowAIChat(true);
        navigation.setParams({ openAIChat: undefined });
      }
    }, [route.params, navigation])
  );

  const openAIChat = useCallback(() => setShowAIChat(true), []);
  const closeAIChat = useCallback(() => setShowAIChat(false), []);

  const demoPerformance = useCallback((fund: MutualFund) => buildDemoPerformance(fund), []);
  const demoQuote = useCallback((fund: MutualFund, points?: MutualFundPerformancePoint[]) => buildDemoQuote(fund, points), []);

  return useMemo(
    () => ({
      isLoading,
      isDemoList,
      listNotice,
      errorMessage,
      mutualFunds,
      selectedFund,
      selectFund: setSelectedFund,
      showAIChat,
      openAIChat,
      closeAIChat,
      demoPerformance,
      demoQuote,
    }),
    [
      closeAIChat,
      demoPerformance,
      demoQuote,
      errorMessage,
      isDemoList,
      isLoading,
      listNotice,
      mutualFunds,
      openAIChat,
      selectedFund,
      showAIChat,
    ]
  );
}
