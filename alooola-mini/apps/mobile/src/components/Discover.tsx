/**
 * Discover screen and AI assistant flow translated to React Native.
 */
import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { Icon } from './Icon';
import { Screen } from './Screen';
import { OpportunityDetail } from './OpportunityDetail';
import { COLORS } from '../theme/colors';
import { RADIUS, SPACING } from '../theme/layout';

const BORDER_ACCENTS = [
  { borderLeftColor: '#94a3b8' },
  { borderLeftColor: '#71717a' },
  { borderLeftColor: '#6b7280' },
  { borderLeftColor: '#78716c' },
];

/** React Native component for Discover. */
export function Discover() {
  const [showAIChat, setShowAIChat] = useState(false);
  const [selectedOpportunity, setSelectedOpportunity] = useState<any>(null);

  const opportunities = [
    {
      id: 1,
      name: 'Healthcare REIT Portfolio',
      ticker: 'MPW, WELL, DOC',
      return: '+12.4%',
      risk: 'Moderate',
    },
    {
      id: 2,
      name: 'Biotech Innovation Fund',
      ticker: 'XBI',
      return: '+18.7%',
      risk: 'Aggressive',
    },
    {
      id: 3,
      name: 'Medical Technology',
      ticker: 'MDT, ABT, SYK',
      return: '+10.2%',
      risk: 'Conservative',
    },
    {
      id: 4,
      name: 'Healthcare Leaders',
      ticker: 'UNH, JNJ, CVS',
      return: '+8.3%',
      risk: 'Conservative',
    },
  ];

  if (showAIChat) {
    return <AIChat onClose={() => setShowAIChat(false)} />;
  }

  if (selectedOpportunity) {
    return <OpportunityDetail opportunity={selectedOpportunity} onBack={() => setSelectedOpportunity(null)} />;
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
        <Text style={styles.sectionTitle}>Curated Portfolios</Text>
        <View style={styles.list}>
          {opportunities.map((opportunity, index) => (
            <Pressable
              key={opportunity.id}
              onPress={() => setSelectedOpportunity(opportunity)}
              style={[styles.opportunityCard, BORDER_ACCENTS[index % BORDER_ACCENTS.length]]}
            >
              <View style={styles.opportunityHeader}>
                <View style={styles.opportunityText}>
                  <Text style={styles.opportunityTitle}>{opportunity.name}</Text>
                  <Text style={styles.opportunityTicker} numberOfLines={1}>
                    {opportunity.ticker}
                  </Text>
                </View>
                <Icon name="chevronRight" size={18} color={COLORS.subtleInk} />
              </View>
              <View style={styles.opportunityMetaRow}>
                <View>
                  <Text style={styles.metaLabel}>1Y Return</Text>
                  <Text style={styles.metaValuePositive}>{opportunity.return}</Text>
                </View>
                <View>
                  <Text style={styles.metaLabel}>Risk</Text>
                  <Text style={styles.metaValue}>{opportunity.risk}</Text>
                </View>
              </View>
            </Pressable>
          ))}
        </View>
      </View>
    </Screen>
  );
}

function AIChat({ onClose }: { onClose: () => void }) {
  const [messages, setMessages] = useState([
    { id: 1, type: 'ai', text: 'Hi Dr. Morgan! How can I help you today?', time: 'Just now' },
  ]);
  const [inputText, setInputText] = useState('');
  const [showSchedule, setShowSchedule] = useState(false);

  const quickActions = ['Portfolio recommendations', 'Tax strategies', 'Schedule with advisor'];

  const handleSend = () => {
    if (!inputText.trim()) return;

    const newMessage = {
      id: messages.length + 1,
      type: 'user',
      text: inputText,
      time: 'Just now',
    };

    setMessages([...messages, newMessage]);

    if (inputText.toLowerCase().includes('schedule') || inputText.toLowerCase().includes('advisor')) {
      setTimeout(() => {
        const aiResponse = {
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
        const aiResponse = {
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
        {messages.map((message: any) => (
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
          {quickActions.map((action) => (
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

  const availableDates = ['Mon, Jan 20', 'Tue, Jan 21', 'Wed, Jan 22', 'Thu, Jan 23', 'Fri, Jan 24'];
  const availableTimes = ['9:00 AM', '10:30 AM', '2:00 PM', '3:30 PM', '5:00 PM'];

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
          {availableDates.map((date) => (
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
              {availableTimes.map((time) => (
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

const styles = StyleSheet.create({
  header: {
    marginBottom: SPACING.xxl,
  },
  title: {
    fontSize: 30,
    fontWeight: '300',
    color: COLORS.ink,
    marginBottom: SPACING.xs,
  },
  subtitle: {
    fontSize: 12,
    color: COLORS.mutedInk,
  },
  aiButton: {
    backgroundColor: COLORS.ink,
    borderRadius: RADIUS.xl,
    padding: SPACING.xl,
    marginBottom: SPACING.xxl,
    shadowColor: COLORS.shadow,
    shadowOpacity: 0.1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  aiButtonHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  aiButtonTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.surface,
  },
  aiButtonText: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.7)',
  },
  section: {
    marginBottom: SPACING.lg,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '300',
    color: COLORS.ink,
    marginBottom: SPACING.lg,
  },
  list: {
    gap: SPACING.sm,
  },
  opportunityCard: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    borderLeftWidth: 4,
    shadowColor: COLORS.shadow,
    shadowOpacity: 0.08,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 1,
  },
  opportunityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.md,
  },
  opportunityText: {
    flex: 1,
  },
  opportunityTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.ink,
    marginBottom: SPACING.xs,
  },
  opportunityTicker: {
    fontSize: 11,
    color: COLORS.subtleInk,
  },
  opportunityMetaRow: {
    flexDirection: 'row',
    gap: SPACING.xxl,
  },
  metaLabel: {
    fontSize: 10,
    color: COLORS.subtleInk,
  },
  metaValue: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.ink,
  },
  metaValuePositive: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.accentEmerald,
  },
  chatHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    marginBottom: SPACING.lg,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: RADIUS.pill,
    backgroundColor: COLORS.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backIcon: {
    transform: [{ rotate: '180deg' }],
  },
  chatHeaderText: {
    flex: 1,
  },
  chatTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.ink,
  },
  chatSubtitle: {
    fontSize: 10,
    color: COLORS.subtleInk,
  },
  chatMessages: {
    flex: 1,
  },
  chatMessagesContent: {
    gap: SPACING.md,
    paddingBottom: SPACING.lg,
  },
  messageBubble: {
    maxWidth: '80%',
    borderRadius: RADIUS.xl,
    padding: SPACING.md,
  },
  messageUser: {
    alignSelf: 'flex-end',
    backgroundColor: COLORS.ink,
  },
  messageAi: {
    alignSelf: 'flex-start',
    backgroundColor: COLORS.surface,
  },
  messageUserText: {
    fontSize: 12,
    color: COLORS.surface,
  },
  messageAiText: {
    fontSize: 12,
    color: COLORS.ink,
  },
  scheduleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    backgroundColor: COLORS.surface,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.pill,
    marginTop: SPACING.sm,
    alignSelf: 'flex-start',
  },
  scheduleButtonText: {
    fontSize: 11,
    color: COLORS.ink,
  },
  quickActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  quickActionChip: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.pill,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
  },
  quickActionText: {
    fontSize: 10,
    color: COLORS.ink,
  },
  chatInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.xl,
    padding: SPACING.sm,
  },
  chatInput: {
    flex: 1,
    fontSize: 12,
    color: COLORS.ink,
    paddingHorizontal: SPACING.sm,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: RADIUS.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonActive: {
    backgroundColor: COLORS.ink,
  },
  sendButtonInactive: {
    backgroundColor: COLORS.border,
  },
  sectionHeader: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.ink,
    marginBottom: SPACING.sm,
  },
  dateCard: {
    padding: SPACING.md,
    borderRadius: RADIUS.lg,
  },
  dateCardActive: {
    backgroundColor: COLORS.ink,
  },
  dateCardInactive: {
    backgroundColor: COLORS.surface,
  },
  dateTextActive: {
    color: COLORS.surface,
    fontSize: 12,
  },
  dateTextInactive: {
    color: COLORS.ink,
    fontSize: 12,
  },
  timeBlock: {
    marginTop: SPACING.lg,
  },
  timeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  timeChip: {
    borderRadius: RADIUS.lg,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
  },
  timeChipActive: {
    backgroundColor: COLORS.ink,
  },
  timeChipInactive: {
    backgroundColor: COLORS.surface,
  },
  timeTextActive: {
    color: COLORS.surface,
    fontSize: 11,
  },
  timeTextInactive: {
    color: COLORS.ink,
    fontSize: 11,
  },
  confirmButton: {
    backgroundColor: COLORS.ink,
    borderRadius: RADIUS.pill,
    paddingVertical: SPACING.md,
    alignItems: 'center',
  },
  confirmButtonText: {
    color: COLORS.surface,
    fontSize: 12,
    fontWeight: '600',
  },
});
