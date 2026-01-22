/**
 * AI chat experience for the Discover screen.
 */
import React, { useState } from 'react';
import { Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { Icon } from '@/components/Icon';
import { COLORS } from '@/theme/colors';
import { styles } from '../DiscoverScreen.styles';
import { INITIAL_AI_MESSAGE, QUICK_ACTIONS } from '../DiscoverScreen.mock';
import { ScheduleAdvisor } from './ScheduleAdvisor';

export interface Message {
  id: number;
  type: 'ai' | 'user';
  text: string;
  time: string;
  showScheduleButton?: boolean;
}

type AIChatProps = {
  onClose: () => void;
};

export function AIChat({ onClose }: AIChatProps) {
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
    <ScreenWrapper onClose={onClose}>
      <ScrollView style={styles.chatMessages} contentContainerStyle={styles.chatMessagesContent}>
        {messages.map((message) => (
          <View key={message.id}>
            <View style={[styles.messageBubble, message.type === 'user' ? styles.messageUser : styles.messageAi]}>
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
    </ScreenWrapper>
  );
}

function ScreenWrapper({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  return (
    <View style={{ flex: 1 }}>
      <View style={styles.chatHeader}>
        <Pressable onPress={onClose} style={styles.backButton}>
          <Icon name="chevronRight" size={18} color={COLORS.ink} style={styles.backIcon} />
        </Pressable>
        <View style={styles.chatHeaderText}>
          <Text style={styles.chatTitle}>AI Assistant</Text>
          <Text style={styles.chatSubtitle}>Ask anything</Text>
        </View>
      </View>
      {children}
    </View>
  );
}
