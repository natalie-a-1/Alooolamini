/**
 * Assistant screen hosting the AI chat experience.
 */
import React from 'react';
import { Screen } from '@/components/Screen';
import { AIChat } from './components/AIChat';

export function AssistantScreen() {
  return (
    <Screen scroll={false}>
      <AIChat />
    </Screen>
  );
}
