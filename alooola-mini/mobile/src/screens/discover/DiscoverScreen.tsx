/**
 * Discover screen and AI assistant flow.
 */
import React, { useEffect, useState } from 'react';
import { Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useFocusEffect } from '@react-navigation/native';
import type { MainTabScreenProps } from '@/navigation/types';
import { Icon } from '@/components/Icon';
import { Screen } from '@/components/Screen';
import { OpportunityDetailScreen } from '@/screens/opportunityDetail';
import { COLORS } from '@/theme/colors';
import { styles } from './DiscoverScreen.styles';
import {
  AVAILABLE_DATES,
  AVAILABLE_TIMES,
  BORDER_ACCENTS,
  INITIAL_AI_MESSAGE,
  MOCK_OPPORTUNITIES,
  type Opportunity,
  QUICK_ACTIONS,
} from './DiscoverScreen.mock';

export function DiscoverScreen() {
  const route = useRoute<MainTabScreenProps<'Discover'>['route']>();
  const navigation = useNavigation<MainTabScreenProps<'Discover'>['navigation']>();
  const [showAIChat, setShowAIChat] = useState(false);
  const [selectedOpportunity, setSelectedOpportunity] = useState<Opportunity | null>(null);

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

  if (selectedOpportunity) {
    return <OpportunityDetailScreen opportunity={selectedOpportunity} onBack={() => setSelectedOpportunity(null)} />;
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
          {MOCK_OPPORTUNITIES.map((opportunity, index) => (
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
