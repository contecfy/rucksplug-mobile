import React, { useState } from 'react';
import { StyleSheet, View, ScrollView, TouchableOpacity, Switch, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { 
  ChevronLeft, 
  Moon, 
  Sun, 
  Bell, 
  ShieldCheck, 
  HelpCircle, 
  FileText, 
  Info,
  ChevronRight,
  Monitor
} from 'lucide-react-native';
import { Header } from 'prizmux';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useThemeStore } from '@/store/theme-store';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function SettingsScreen() {
  const router = useRouter();
  const { theme, setTheme } = useThemeStore();
  const colorScheme = useColorScheme();
  
  const textColor = useThemeColor({}, 'text');
  const cardBackground = useThemeColor({}, 'card');
  const tintColor = useThemeColor({}, 'tint');
  const background = useThemeColor({}, 'background');
  const borderColor = useThemeColor({}, 'borderColor');

  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [biometricsEnabled, setBiometricsEnabled] = useState(false);

  const renderSettingItem = (
    icon: React.ReactNode, 
    label: string, 
    value?: string | boolean, 
    onPress?: () => void,
    isSwitch: boolean = false,
    onSwitchChange?: (val: boolean) => void
  ) => (
    <TouchableOpacity 
      style={[styles.settingItem, { borderBottomColor: borderColor }]} 
      onPress={onPress}
      disabled={isSwitch}
    >
      <View style={styles.settingItemLeft}>
        <View style={[styles.iconContainer, { backgroundColor: textColor + '10' }]}>
          {icon}
        </View>
        <ThemedText type="precision" style={styles.settingLabel}>{label}</ThemedText>
      </View>
      <View style={styles.settingItemRight}>
        {isSwitch ? (
          <Switch
            value={value as boolean}
            onValueChange={onSwitchChange}
            trackColor={{ false: borderColor, true: tintColor }}
            thumbColor={Platform.OS === 'ios' ? undefined : '#f4f3f4'}
          />
        ) : (
          <>
            {value && <ThemedText style={styles.settingValue}>{value}</ThemedText>}
            <ChevronRight size={18} color={textColor} opacity={0.3} />
          </>
        )}
      </View>
    </TouchableOpacity>
  );

  const handleThemeChange = (newTheme: 'light' | 'dark' | 'system') => {
    setTheme(newTheme);
  };

  return (
    <ThemedView style={styles.container}>
      <Header
        title="Settings"
        showBack
        onBackPress={() => router.back()}
        backIcon={<ChevronLeft color={textColor} size={24} />}
        backgroundColor={background}
        titleStyle={{ color: textColor, fontFamily: 'Inter_700Bold', fontSize: 20 }}
        backButtonBackgroundColor="transparent"
        backIconColor={textColor}
        style={{ borderBottomWidth: 0, paddingTop: 50 }}
      />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Appearance</ThemedText>
          <View style={[styles.card, { backgroundColor: cardBackground, borderColor }]}>
            <TouchableOpacity 
              style={[styles.themeOption, theme === 'light' && { backgroundColor: textColor + '05' }]} 
              onPress={() => handleThemeChange('light')}
            >
              <View style={styles.themeOptionLeft}>
                <Sun size={20} color={theme === 'light' ? tintColor : textColor} />
                <ThemedText style={[styles.themeText, theme === 'light' && { color: tintColor, fontWeight: 'bold' }]}>Light Mode</ThemedText>
              </View>
              {theme === 'light' && <View style={[styles.activeDot, { backgroundColor: tintColor }]} />}
            </TouchableOpacity>
            
            <View style={[styles.divider, { backgroundColor: borderColor }]} />
            
            <TouchableOpacity 
              style={[styles.themeOption, theme === 'dark' && { backgroundColor: textColor + '05' }]} 
              onPress={() => handleThemeChange('dark')}
            >
              <View style={styles.themeOptionLeft}>
                <Moon size={20} color={theme === 'dark' ? tintColor : textColor} />
                <ThemedText style={[styles.themeText, theme === 'dark' && { color: tintColor, fontWeight: 'bold' }]}>Dark Mode</ThemedText>
              </View>
              {theme === 'dark' && <View style={[styles.activeDot, { backgroundColor: tintColor }]} />}
            </TouchableOpacity>

            <View style={[styles.divider, { backgroundColor: borderColor }]} />
            
            <TouchableOpacity 
              style={[styles.themeOption, theme === 'system' && { backgroundColor: textColor + '05' }]} 
              onPress={() => handleThemeChange('system')}
            >
              <View style={styles.themeOptionLeft}>
                <Monitor size={20} color={theme === 'system' ? tintColor : textColor} />
                <ThemedText style={[styles.themeText, theme === 'system' && { color: tintColor, fontWeight: 'bold' }]}>System Default</ThemedText>
              </View>
              {theme === 'system' && <View style={[styles.activeDot, { backgroundColor: tintColor }]} />}
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Preferences</ThemedText>
          <View style={[styles.card, { backgroundColor: cardBackground, borderColor }]}>
            {renderSettingItem(
              <Bell size={20} color={textColor} />, 
              "Push Notifications", 
              notificationsEnabled, 
              undefined, 
              true, 
              setNotificationsEnabled
            )}
            {renderSettingItem(
              <ShieldCheck size={20} color={textColor} />, 
              "Biometric Authentication", 
              biometricsEnabled, 
              undefined, 
              true, 
              setBiometricsEnabled
            )}
          </View>
        </View>

        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Support & About</ThemedText>
          <View style={[styles.card, { backgroundColor: cardBackground, borderColor }]}>
            {renderSettingItem(<HelpCircle size={20} color={textColor} />, "Help & Support", undefined, () => {})}
            {renderSettingItem(<FileText size={20} color={textColor} />, "Terms of Service", undefined, () => {})}
            {renderSettingItem(<Info size={20} color={textColor} />, "Privacy Policy", undefined, () => {})}
            
            <View style={styles.versionContainer}>
              <ThemedText style={styles.versionLabel}>App Version</ThemedText>
              <ThemedText style={styles.versionText}>1.0.0 (Build 1245)</ThemedText>
            </View>
          </View>
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 14,
    opacity: 0.5,
    marginBottom: 12,
    marginLeft: 4,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  card: {
    borderRadius: 20,
    borderWidth: 1,
    overflow: 'hidden',
  },
  themeOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  themeOptionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  themeText: {
    fontSize: 16,
  },
  activeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  divider: {
    height: 1,
    width: '100%',
    opacity: 0.1,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
  },
  settingItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  settingLabel: {
    fontSize: 16,
  },
  settingItemRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  settingValue: {
    fontSize: 14,
    opacity: 0.5,
  },
  versionContainer: {
    padding: 20,
    alignItems: 'center',
    opacity: 0.4,
  },
  versionLabel: {
    fontSize: 12,
    marginBottom: 2,
  },
  versionText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
});
