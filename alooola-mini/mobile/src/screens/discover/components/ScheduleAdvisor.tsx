/**
 * Schedules an advisor session from within the AI chat flow.
 */
import React, { useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { Icon } from '@/components/Icon';
import { COLORS } from '@/theme/colors';
import { styles } from '../DiscoverScreen.styles';
import { AVAILABLE_DATES, AVAILABLE_TIMES } from '../DiscoverScreen.mock';

type ScheduleAdvisorProps = {
  onBack: () => void;
  onClose: () => void;
};

export function ScheduleAdvisor({ onBack, onClose }: ScheduleAdvisorProps) {
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');

  const handleConfirm = () => {
    onClose();
  };

  return (
    <View style={{ flex: 1 }}>
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

      <View style={styles.timeFooter}>
        <Pressable
          style={[
            styles.confirmButton,
            (!selectedDate || !selectedTime) && styles.confirmButtonDisabled,
          ]}
          onPress={handleConfirm}
          disabled={!selectedDate || !selectedTime}
        >
          <Text style={styles.confirmButtonText}>Confirm</Text>
        </Pressable>
      </View>
    </View>
  );
}
