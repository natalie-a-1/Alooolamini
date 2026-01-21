/**
 * Discover screen and AI assistant flow.
 */
import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useFocusEffect } from '@react-navigation/native';
import type { MainTabScreenProps } from '@/navigation/types';
import { Icon } from '@/components/Icon';
import { Screen } from '@/components/Screen';
import {
  getMutualFundPerformance,
  getMutualFundQuote,
  getMutualFunds,
  type MutualFund,
  type MutualFundPerformance,
  type MutualFundPerformancePoint,
  type MutualFundQuote,
} from '@/services/mutualFunds';
import { COLORS } from '@/theme/colors';
import { styles } from './DiscoverScreen.styles';
import {
  AVAILABLE_DATES,
  AVAILABLE_TIMES,
  BORDER_ACCENTS,
  DEMO_MUTUAL_FUNDS,
  INITIAL_AI_MESSAGE,
  QUICK_ACTIONS,
} from './DiscoverScreen.mock';

export function DiscoverScreen() {
  const route = useRoute<MainTabScreenProps<'Discover'>['route']>();
  const navigation = useNavigation<MainTabScreenProps<'Discover'>['navigation']>();
  const [showAIChat, setShowAIChat] = useState(false);
  const [mutualFunds, setMutualFunds] = useState<MutualFund[]>([]);
  const [selectedFund, setSelectedFund] = useState<MutualFund | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [listNotice, setListNotice] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDemoList, setIsDemoList] = useState(false);

  // Load mutual funds from API
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

  // Check if we should open AI chat from navigation params when screen is focused
  useFocusEffect(
    React.useCallback(() => {
      if (route.params?.openAIChat) {
        setShowAIChat(true);
        // Clear the param after opening
        navigation.setParams({ openAIChat: undefined });
      }
    }, [route.params, navigation])
  );

  if (showAIChat) {
    return <AIChat onClose={() => setShowAIChat(false)} />;
  }

  if (selectedFund) {
    return (
      <MutualFundDetail
        fund={selectedFund}
        onBack={() => setSelectedFund(null)}
        forceDemo={isDemoList}
      />
    );
  }
  return (
    <Screen>
      <View style={styles.header}>
        <Text style={styles.title}>Discover</Text>
        <Text style={styles.subtitle}>Investment opportunities for medical professionals</Text>
      </View>

      <Pressable onPress={() => setShowAIChat(true)} style={styles.aiButton}>
        <View style={styles.aiButtonHeader}>
          <Icon name="message" size={16} color={COLORS.surface} />
          <Text style={styles.aiButtonTitle}>Ask AI</Text>
        </View>
        <Text style={styles.aiButtonText}>
          Get insights on portfolio options or schedule with an advisor
        </Text>
      </Pressable>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Mutual Funds</Text>
        <Text style={styles.sectionSubtitle}>Powered by Alpha Vantage time series data</Text>
        {listNotice && <Text style={styles.listNotice}>{listNotice}</Text>}
        {isLoading ? (
          <ActivityIndicator color={COLORS.ink} style={{ marginTop: 20 }} />
        ) : errorMessage ? (
          <Text style={styles.emptyStateText}>{errorMessage}</Text>
        ) : (
          <View style={styles.list}>
            {mutualFunds.length === 0 ? (
              <Text style={styles.emptyStateText}>No mutual funds found.</Text>
            ) : (
              mutualFunds.map((fund, index) => (
                <Pressable
                  key={fund.id}
                  onPress={() => setSelectedFund(fund)}
                  style={[styles.opportunityCard, BORDER_ACCENTS[index % BORDER_ACCENTS.length]]}
                >
                  <View style={styles.minimalCardHeader}>
                    <View style={styles.fundTitleBlock}>
                      <Text style={styles.opportunityTitle}>{fund.name}</Text>
                      <Text style={styles.minimalSubline}>
                        {fund.symbol} • {fund.type || 'Mutual Fund'}
                      </Text>
                    </View>
                    <Icon name="chevronRight" size={18} color={COLORS.subtleInk} />
                  </View>
                </Pressable>
              ))
            )}
          </View>
        )}
      </View>
    </Screen>
  );
}

const DEMO_NOTICE = 'Showing demo data - live data unavailable.';

const DEMO_BASE_PRICES: Record<string, number> = {
  VFIAX: 445.12,
  VTSAX: 125.44,
  FXAIX: 184.21,
  FSKAX: 118.76,
  SWPPX: 77.91,
  FCNTX: 16.85,
  TRBCX: 195.32,
  PRGFX: 71.09,
};

function buildDemoPerformance(fund: MutualFund): MutualFundPerformance {
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

function buildDemoQuote(
  fund: MutualFund,
  points?: MutualFundPerformancePoint[]
): MutualFundQuote {
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

function MutualFundDetail({
  fund,
  onBack,
  forceDemo = false,
}: {
  fund: MutualFund;
  onBack: () => void;
  forceDemo?: boolean;
}) {
  const [performance, setPerformance] = useState<MutualFundPerformance | null>(null);
  const [isPerformanceLoading, setIsPerformanceLoading] = useState(true);
  const [performanceError, setPerformanceError] = useState<string | null>(null);
  const [quote, setQuote] = useState<MutualFundQuote | null>(null);
  const [isQuoteLoading, setIsQuoteLoading] = useState(true);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [useDemoData, setUseDemoData] = useState(forceDemo);
  const [demoPerformance, setDemoPerformance] = useState<MutualFundPerformance | null>(null);
  const [demoQuote, setDemoQuote] = useState<MutualFundQuote | null>(null);

  const applyDemoFallback = useCallback(() => {
    const demoPerformanceValue = buildDemoPerformance(fund);
    const demoQuoteValue = buildDemoQuote(fund, demoPerformanceValue.points);
    setUseDemoData(true);
    setDemoPerformance(demoPerformanceValue);
    setDemoQuote(demoQuoteValue);
    setPerformanceError(null);
    setIsPerformanceLoading(false);
    setIsQuoteLoading(false);
  }, [fund]);

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
      } catch (error) {
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
  }, [fund.symbol, forceDemo, useDemoData, applyDemoFallback]);

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
      } catch (error) {
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
  }, [fund.symbol, forceDemo, useDemoData, applyDemoFallback]);

  const displayPerformance = useDemoData ? demoPerformance : performance;
  const displayQuote = useDemoData ? demoQuote : quote;
  const performancePoints = displayPerformance?.points ?? [];
  const chartValues = performancePoints.map((point) => point.close);
  const minValue = chartValues.length > 0 ? Math.min(...chartValues) : 0;
  const maxValue = chartValues.length > 0 ? Math.max(...chartValues) : 0;
  const valueRange = maxValue - minValue || 1;

  const getBarHeight = (value: number) => {
    const minHeight = 24;
    const maxHeight = 100;
    const normalized = (value - minValue) / valueRange;
    return minHeight + normalized * (maxHeight - minHeight);
  };

  const formatMonthLabel = (dateValue: string) => {
    const date = new Date(dateValue);
    if (Number.isNaN(date.getTime())) return '';
    return date.toLocaleString('en-US', { month: 'short' });
  };

  const formatPrice = (value: number) => {
    const currency = fund.currency || 'USD';
    try {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(value);
    } catch {
      return `$${value.toFixed(2)}`;
    }
  };

  const formatSignedPercent = (value: number | null) => {
    if (value === null || Number.isNaN(value)) return '';
    const sign = value >= 0 ? '+' : '';
    return `${sign}${value.toFixed(2)}%`;
  };

  const formatSignedPrice = (value: number | null) => {
    if (value === null || Number.isNaN(value)) return '';
    const sign = value >= 0 ? '+' : '';
    return `${sign}${formatPrice(Math.abs(value))}`;
  };

  const oneMonthChange = displayPerformance?.oneMonthChange ?? null;
  const oneMonthPercent = displayPerformance?.oneMonthChangePercent ?? null;
  const oneYearChange = displayPerformance?.oneYearChange ?? null;
  const oneYearPercent = displayPerformance?.oneYearChangePercent ?? null;
  const rangeLow = displayPerformance?.rangeLow ?? null;
  const rangeHigh = displayPerformance?.rangeHigh ?? null;
  const quoteChange = displayQuote?.change ?? null;
  const changeStyle = (value: number | null) => {
    if (value === null || Number.isNaN(value)) return styles.detailValue;
    return value < 0 ? styles.detailValueNegative : styles.detailValuePositive;
  };

  const matchScore = fund.matchScore;
  const showMatchScore = typeof matchScore === 'number' && Number.isFinite(matchScore);
  const detailNotice = useDemoData ? DEMO_NOTICE : null;
  const isLoadingData = !useDemoData && (isQuoteLoading || isPerformanceLoading);
  const isChartLoading = !useDemoData && isPerformanceLoading;
  const showChartError = !useDemoData && performanceError;
  const hasDisplayData = Boolean(displayQuote && displayPerformance);

  return (
    <Screen>
      <View style={styles.detailHeader}>
        <Pressable onPress={onBack} style={styles.backButton}>
          <Icon name="chevronRight" size={18} color={COLORS.ink} style={styles.backIcon} />
        </Pressable>
        <View style={styles.detailHeaderText}>
          <Text style={styles.detailTitle}>{fund.name}</Text>
          <Text style={styles.detailSubtitle}>{fund.symbol}</Text>
        </View>
      </View>
      {detailNotice && <Text style={styles.detailNotice}>{detailNotice}</Text>}

      <View style={styles.detailCard}>
        <Text style={styles.detailSectionTitle}>Fund Snapshot</Text>
        <View style={styles.detailGrid}>
          <View style={styles.detailCell}>
            <Text style={styles.detailLabel}>Type</Text>
            <Text style={styles.detailValue}>{fund.type}</Text>
          </View>
          <View style={styles.detailCell}>
            <Text style={styles.detailLabel}>Region</Text>
            <Text style={styles.detailValue}>{fund.region}</Text>
          </View>
          <View style={styles.detailCell}>
            <Text style={styles.detailLabel}>Currency</Text>
            <Text style={styles.detailValue}>{fund.currency}</Text>
          </View>
          {showMatchScore && (
            <View style={styles.detailCell}>
              <Text style={styles.detailLabel}>Match Score</Text>
              <Text style={styles.detailValue}>{`${Math.round(matchScore * 100)}%`}</Text>
            </View>
          )}
        </View>
      </View>

      <View style={styles.detailCard}>
        <Text style={styles.detailSectionTitle}>Price & Performance</Text>
        {isLoadingData ? (
          <ActivityIndicator color={COLORS.ink} style={{ marginTop: 12 }} />
        ) : !hasDisplayData ? (
          <Text style={styles.emptyStateText}>Price data unavailable.</Text>
        ) : (
          <>
            <View style={styles.detailGrid}>
              <View style={styles.detailCell}>
                <Text style={styles.detailLabel}>Current Price</Text>
                <Text style={styles.detailValue}>{formatPrice(displayQuote!.price)}</Text>
              </View>
              <View style={styles.detailCell}>
                <Text style={styles.detailLabel}>1D Change</Text>
                <Text style={[styles.detailValue, changeStyle(quoteChange)]}>
                  {`${formatSignedPrice(displayQuote!.change)} (${formatSignedPercent(displayQuote!.changePercent)})`}
                </Text>
              </View>
              <View style={styles.detailCell}>
                <Text style={styles.detailLabel}>1M Change</Text>
                <Text style={[styles.detailValue, changeStyle(oneMonthChange)]}>
                  {`${formatSignedPrice(oneMonthChange!)} (${formatSignedPercent(oneMonthPercent!)})`}
                </Text>
              </View>
              <View style={styles.detailCell}>
                <Text style={styles.detailLabel}>1Y Change</Text>
                <Text style={[styles.detailValue, changeStyle(oneYearChange)]}>
                  {`${formatSignedPrice(oneYearChange!)} (${formatSignedPercent(oneYearPercent!)})`}
                </Text>
              </View>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>12M Range</Text>
              <Text style={styles.detailValue}>
                {`${formatPrice(rangeLow!)} - ${formatPrice(rangeHigh!)}`}
              </Text>
            </View>
          </>
        )}
      </View>

      <View style={styles.detailCard}>
        <View style={styles.detailChartHeader}>
          <Text style={styles.detailSectionTitle}>Past 12 Months</Text>
          <Text style={styles.detailChartSubtitle}>Monthly closing prices</Text>
        </View>
        {isChartLoading ? (
          <ActivityIndicator color={COLORS.ink} style={{ marginTop: 12 }} />
        ) : showChartError ? (
          <Text style={styles.emptyStateText}>{performanceError}</Text>
        ) : performancePoints.length === 0 ? (
          <Text style={styles.emptyStateText}>No price data available.</Text>
        ) : (
          <View style={styles.detailChart}>
            <View style={styles.detailChartBars}>
              {performancePoints.map((point, index) => {
                const barHeight = getBarHeight(point.close);
                const isActive = activeIndex === index;
                return (
                  <View key={`${fund.id}-${point.date}`} style={styles.chartPoint}>
                    <Pressable
                      onPressIn={() => setActiveIndex(index)}
                      onPressOut={() => setActiveIndex(null)}
                      onHoverIn={() => setActiveIndex(index)}
                      onHoverOut={() => setActiveIndex(null)}
                      style={styles.chartPressable}
                    >
                      {isActive && (
                        <View style={[styles.chartTooltip, { bottom: barHeight + 10 }]}>
                          <Text style={styles.chartTooltipText} numberOfLines={1}>
                            {formatPrice(point.close)}
                          </Text>
                        </View>
                      )}
                      <View style={[styles.detailBar, { height: barHeight }, isActive && styles.detailBarActive]} />
                    </Pressable>
                  </View>
                );
              })}
            </View>
            <View style={styles.detailChartLabels}>
              {performancePoints.map((point, index) => (
                <Text
                  key={`${fund.id}-${point.date}-label`}
                  style={styles.chartLabel}
                  numberOfLines={1}
                >
                  {index % 2 === 0 ? formatMonthLabel(point.date) : ''}
                </Text>
              ))}
            </View>
          </View>
        )}
      </View>

      <View style={styles.detailCard}>
        <Text style={styles.detailSectionTitle}>Additional Details</Text>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Timezone</Text>
          <Text style={styles.detailValue}>{fund.timezone}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Market Hours</Text>
          <Text style={styles.detailValue}>
            {`${fund.marketOpen}-${fund.marketClose}`}
          </Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Symbol</Text>
          <Text style={styles.detailValue}>{fund.symbol}</Text>
        </View>
      </View>

      <View style={styles.detailActions}>
        <Pressable
          style={[styles.detailActionButton, styles.detailActionSecondary]}
          onPress={() => console.log('Add to watchlist', fund.symbol)}
        >
          <Icon name="heart" size={14} color={COLORS.ink} />
          <Text style={styles.detailActionSecondaryText}>Add to watchlist</Text>
        </Pressable>
        <Pressable
          style={[styles.detailActionButton, styles.detailActionPrimary]}
          onPress={() => console.log('Buy fund', fund.symbol)}
        >
          <Text style={styles.detailActionPrimaryText}>Buy fund</Text>
        </Pressable>
      </View>
    </Screen>
  );
}

interface Message {
  id: number;
  type: 'ai' | 'user';
  text: string;
  time: string;
  showScheduleButton?: boolean;
}

function AIChat({ onClose }: { onClose: () => void }) {
  const [messages, setMessages] = useState<Message[]>([INITIAL_AI_MESSAGE]);
  const [inputText, setInputText] = useState('');
  const [showSchedule, setShowSchedule] = useState(false);

  const handleSend = () => {
    if (!inputText.trim()) return;

    const newMessage: Message = {
      id: messages.length + 1,
      type: 'user',
      text: inputText,
      time: 'Just now',
    };

    setMessages([...messages, newMessage]);

    if (inputText.toLowerCase().includes('schedule') || inputText.toLowerCase().includes('advisor')) {
      setTimeout(() => {
        const aiResponse: Message = {
          id: messages.length + 2,
          type: 'ai',
          text: 'I can help you schedule a session with one of our certified financial advisors. Would you like to see available times?',
          time: 'Just now',
          showScheduleButton: true,
        };
        setMessages((prev) => [...prev, aiResponse]);
      }, 500);
    } else {
      setTimeout(() => {
        const aiResponse: Message = {
          id: messages.length + 2,
          type: 'ai',
          text: "Based on your profile as a cardiologist with moderate risk tolerance, I'd recommend diversifying into healthcare REITs and biotech ETFs. These align with your sector knowledge.",
          time: 'Just now',
        };
        setMessages((prev) => [...prev, aiResponse]);
      }, 500);
    }

    setInputText('');
  };

  const handleQuickAction = (action: string) => {
    if (action === 'Schedule with advisor') {
      setShowSchedule(true);
    } else {
      setInputText(action);
    }
  };

  if (showSchedule) {
    return <ScheduleAdvisor onBack={() => setShowSchedule(false)} onClose={onClose} />;
  }

  return (
    <Screen scroll={false}>
      <View style={styles.chatHeader}>
        <Pressable onPress={onClose} style={styles.backButton}>
          <Icon name="chevronRight" size={18} color={COLORS.ink} style={styles.backIcon} />
        </Pressable>
        <View style={styles.chatHeaderText}>
          <Text style={styles.chatTitle}>AI Assistant</Text>
          <Text style={styles.chatSubtitle}>Ask anything</Text>
        </View>
      </View>

      <ScrollView style={styles.chatMessages} contentContainerStyle={styles.chatMessagesContent}>
        {messages.map((message) => (
          <View key={message.id}>
            <View
              style={[
                styles.messageBubble,
                message.type === 'user' ? styles.messageUser : styles.messageAi,
              ]}
            >
              <Text style={message.type === 'user' ? styles.messageUserText : styles.messageAiText}>{message.text}</Text>
            </View>
            {message.showScheduleButton && (
              <Pressable onPress={() => setShowSchedule(true)} style={styles.scheduleButton}>
                <Icon name="calendar" size={14} color={COLORS.ink} />
                <Text style={styles.scheduleButtonText}>View Available Times</Text>
              </Pressable>
            )}
          </View>
        ))}
      </ScrollView>

      {messages.length === 1 && (
        <View style={styles.quickActions}>
          {QUICK_ACTIONS.map((action) => (
            <Pressable key={action} onPress={() => handleQuickAction(action)} style={styles.quickActionChip}>
              <Text style={styles.quickActionText}>{action}</Text>
            </Pressable>
          ))}
        </View>
      )}

      <View style={styles.chatInputRow}>
        <TextInput
          value={inputText}
          onChangeText={setInputText}
          placeholder="Ask about investments..."
          style={styles.chatInput}
          onSubmitEditing={handleSend}
        />
        <Pressable
          onPress={handleSend}
          disabled={!inputText.trim()}
          style={[styles.sendButton, inputText.trim() ? styles.sendButtonActive : styles.sendButtonInactive]}
        >
          <Icon name="send" size={14} color={inputText.trim() ? COLORS.surface : COLORS.subtleInk} />
        </Pressable>
      </View>
    </Screen>
  );
}

function ScheduleAdvisor({ onBack, onClose }: { onBack: () => void; onClose: () => void }) {
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');

  const handleConfirm = () => {
    onClose();
  };

  return (
    <Screen scroll={false}>
      <View style={styles.chatHeader}>
        <Pressable onPress={onBack} style={styles.backButton}>
          <Icon name="chevronRight" size={18} color={COLORS.ink} style={styles.backIcon} />
        </Pressable>
        <View style={styles.chatHeaderText}>
          <Text style={styles.chatTitle}>Schedule Session</Text>
          <Text style={styles.chatSubtitle}>30-minute consultation</Text>
        </View>
      </View>

      <ScrollView style={styles.chatMessages} contentContainerStyle={styles.chatMessagesContent}>
        <Text style={styles.sectionHeader}>Select Date</Text>
        <View style={styles.list}>
          {AVAILABLE_DATES.map((date) => (
            <Pressable
              key={date}
              onPress={() => setSelectedDate(date)}
              style={[styles.dateCard, selectedDate === date ? styles.dateCardActive : styles.dateCardInactive]}
            >
              <Text style={selectedDate === date ? styles.dateTextActive : styles.dateTextInactive}>{date}</Text>
            </Pressable>
          ))}
        </View>

        {selectedDate && (
          <View style={styles.timeBlock}>
            <Text style={styles.sectionHeader}>Select Time</Text>
            <View style={styles.timeGrid}>
              {AVAILABLE_TIMES.map((time) => (
                <Pressable
                  key={time}
                  onPress={() => setSelectedTime(time)}
                  style={[styles.timeChip, selectedTime === time ? styles.timeChipActive : styles.timeChipInactive]}
                >
                  <Text style={selectedTime === time ? styles.timeTextActive : styles.timeTextInactive}>{time}</Text>
                </Pressable>
              ))}
            </View>
          </View>
        )}
      </ScrollView>

      {selectedDate && selectedTime && (
        <Pressable style={styles.confirmButton} onPress={handleConfirm}>
          <Text style={styles.confirmButtonText}>Confirm Session</Text>
        </Pressable>
      )}
    </Screen>
  );
}
