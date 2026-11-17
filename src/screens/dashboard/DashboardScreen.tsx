import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/types';
import { UserProfile } from '../../api/types';
import { clearSession, getSession } from '../../storage/session';
import { authService } from '../../api/auth.service';
import { COLORS } from '../../constants/colors';
import { getApkConfig } from '../../constants/config';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function DashboardScreen() {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [loggingOut, setLoggingOut] = useState(false);

  const apkConfig = getApkConfig();

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const session = await getSession();
      if (session?.user) {
        setUser(session.user);
      }
    } catch (e) {
      console.error('Failed to load user session', e);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: async () => {
          setLoggingOut(true);
          try {
            await authService.logout();
            await clearSession();
            navigation.reset({
              index: 0,
              routes: [{ name: 'Login' }],
            });
          } catch {
            await clearSession();
            navigation.reset({
              index: 0,
              routes: [{ name: 'Login' }],
            });
          } finally {
            setLoggingOut(false);
          }
        },
      },
    ]);
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  const displayName = user?.firstName
    ? `${user.firstName} ${user.lastName || ''}`.trim()
    : 'User';

  return (
    <View style={styles.root}>
      {/* Gradient Header */}
      <LinearGradient
        colors={[COLORS.gradientStart, COLORS.gradientEnd]}
        start={{ x: 0, y: 0.5 }}
        end={{ x: 1, y: 0.5 }}
        style={styles.headerBackground}
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        {/* App Greeting Header */}
        <View style={styles.topBar}>
          <View>
            <Text style={styles.greetingText}>Hello, Welcome Back!</Text>
            <Text style={styles.nameText}>{displayName}</Text>
          </View>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={handleLogout}
            disabled={loggingOut}
            style={styles.logoutBtn}>
            {loggingOut ? (
              <ActivityIndicator color={COLORS.white} size="small" />
            ) : (
              <Text style={styles.logoutBtnText}>Sign Out</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Dynamic APK Dashboard Banner */}
        <View style={styles.dashboardBannerCard}>
          <View style={styles.bannerBadge}>
            <Text style={styles.bannerBadgeText}>{apkConfig.apkName}</Text>
          </View>
          <Text style={styles.dashboardTitle}>{apkConfig.dashboardTitle}</Text>
          <Text style={styles.dashboardSubtitle}>
            Authenticated session active. Digital Marketing ERP & CRM system.
          </Text>
        </View>

        {/* User Profile Summary Card */}
        <View style={styles.profileCard}>
          <Text style={styles.sectionTitle}>Account Details</Text>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Role</Text>
            <View style={styles.roleBadge}>
              <Text style={styles.roleBadgeText}>
                {user?.roleName || user?.role || 'User'}
              </Text>
            </View>
          </View>

          {user?.phone ? (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Phone</Text>
              <Text style={styles.infoValue}>+91 {user.phone}</Text>
            </View>
          ) : null}

          {user?.email ? (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Email</Text>
              <Text style={styles.infoValue}>{user.email}</Text>
            </View>
          ) : null}

          {user?.department ? (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Department</Text>
              <Text style={styles.infoValue}>{user.department}</Text>
            </View>
          ) : null}

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Status</Text>
            <View style={styles.statusBadge}>
              <View style={styles.statusDot} />
              <Text style={styles.statusText}>{user?.status || 'ACTIVE'}</Text>
            </View>
          </View>
        </View>

        {/* Session Info Card */}
        <View style={styles.sessionCard}>
          <Text style={styles.sessionCardTitle}>APK Identification</Text>
          <Text style={styles.sessionCardText}>
            Target APK: <Text style={styles.boldText}>{apkConfig.apkName}</Text>
          </Text>
          <Text style={styles.sessionCardText}>
            Dashboard: <Text style={styles.boldText}>{apkConfig.dashboardTitle}</Text>
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  headerBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: SCREEN_HEIGHT * 0.3,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 48,
    paddingBottom: 40,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  greetingText: {
    color: 'rgba(255, 255, 255, 0.85)',
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  nameText: {
    color: COLORS.white,
    fontSize: 22,
    fontWeight: '800',
    marginTop: 2,
    letterSpacing: -0.3,
  },
  logoutBtn: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  logoutBtnText: {
    color: COLORS.white,
    fontSize: 13,
    fontWeight: '700',
  },
  dashboardBannerCard: {
    backgroundColor: COLORS.white,
    borderRadius: 22,
    paddingHorizontal: 22,
    paddingVertical: 24,
    marginBottom: 16,
    shadowColor: '#1E293B',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  bannerBadge: {
    alignSelf: 'flex-start',
    backgroundColor: COLORS.badgeBg,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    marginBottom: 10,
  },
  bannerBadgeText: {
    color: COLORS.badgeText,
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  dashboardTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: COLORS.textDark,
    letterSpacing: -0.5,
  },
  dashboardSubtitle: {
    fontSize: 13,
    color: COLORS.textMuted,
    marginTop: 6,
    lineHeight: 19,
  },
  profileCard: {
    backgroundColor: COLORS.white,
    borderRadius: 22,
    paddingHorizontal: 20,
    paddingVertical: 22,
    marginBottom: 16,
    shadowColor: '#1E293B',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textDark,
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F8FAFC',
  },
  infoLabel: {
    fontSize: 14,
    color: COLORS.textMuted,
    fontWeight: '500',
  },
  infoValue: {
    fontSize: 14,
    color: COLORS.textDark,
    fontWeight: '600',
  },
  roleBadge: {
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  roleBadgeText: {
    color: '#4F46E5',
    fontSize: 12,
    fontWeight: '700',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 6,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10B981',
  },
  statusText: {
    color: '#059669',
    fontSize: 12,
    fontWeight: '700',
  },
  sessionCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 18,
    paddingHorizontal: 18,
    paddingVertical: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  sessionCardTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textMuted,
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  sessionCardText: {
    fontSize: 13,
    color: COLORS.textDark,
    lineHeight: 20,
  },
  boldText: {
    fontWeight: '700',
    color: COLORS.primary,
  },
});
