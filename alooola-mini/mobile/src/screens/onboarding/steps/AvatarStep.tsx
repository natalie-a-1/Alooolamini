/**
 * Avatar upload step for onboarding.
 */
import React from 'react';
import { Alert, Image, Pressable, Text, View } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Icon } from '@/components/Icon';
import { COLORS } from '@/theme/colors';
import { styles } from '../OnboardingScreen.styles';

interface AvatarStepProps {
  avatarUri: string | null;
  onAvatarChange: (uri: string | null) => void;
}

export function AvatarStep({ avatarUri, onAvatarChange }: AvatarStepProps) {
  const handlePickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Permission needed',
        'Please allow access to your photo library to upload a profile picture.'
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      onAvatarChange(result.assets[0].uri);
    }
  };

  const isLocalUri = avatarUri && !avatarUri.startsWith('/');

  return (
    <View>
      <Text style={styles.heading}>Add a profile picture</Text>
      <Text style={styles.subheading}>
        Help others recognize you. You can skip this for now.
      </Text>

      <View style={styles.avatarContainer}>
        <Pressable onPress={handlePickImage} style={styles.avatarPicker}>
          {isLocalUri ? (
            <Image source={{ uri: avatarUri }} style={styles.avatarImage} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Icon name="camera" size={32} color={COLORS.subtleInk} />
              <Text style={styles.avatarPlaceholderText}>Tap to upload</Text>
            </View>
          )}
        </Pressable>
        {isLocalUri && (
          <Pressable onPress={() => onAvatarChange(null)} style={styles.removeAvatar}>
            <Text style={styles.removeAvatarText}>Remove</Text>
          </Pressable>
        )}
      </View>

      <View style={styles.tipCard}>
        <Text style={styles.tipText}>
          If you skip, we'll use a friendly default avatar for you.
        </Text>
      </View>
    </View>
  );
}
