import React, { useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import { RootStackParamList } from '../../navigation/types';
import { ApiError } from '../../api/types';
import { authService } from '../../api/auth.service';
import { COLORS } from '../../constants/colors';
import { getApkConfig } from '../../constants/config';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function LoginScreen() {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [phone, setPhone] = useState('');
  const [touched, setTouched] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const apkConfig = getApkConfig();

  const digitsOnly = phone.replace(/\D/g, '');
  const isValid = digitsOnly.length === 10;
  const showError =
    (touched && digitsOnly.length > 0 && !isValid) || errorMsg.length > 0;

  // Format to: 98260 12345
  const formattedPhone =
    digitsOnly.length > 5
      ? `${digitsOnly.slice(0, 5)} ${digitsOnly.slice(5)}`
      : digitsOnly;

  const handlePhoneChange = (value: string) => {
    setErrorMsg('');
    setPhone(value);
  };

  const handleSendOtp = async () => {
    setTouched(true);
    if (!isValid || loading) return;

    setLoading(true);
    setErrorMsg('');
    try {
      await authService.requestOtp({ phone: digitsOnly });
      navigation.navigate('Otp', { phoneNumber: digitsOnly });
    } catch (error: any) {
      const message =
        error instanceof ApiError
          ? error.message
          : 'Failed to send OTP. Please check your network and try again.';
      setErrorMsg(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[COLORS.gradientStart, COLORS.gradientEnd]}
        start={{ x: 0, y: 0.5 }}
        end={{ x: 1, y: 0.5 }}
        style={styles.headerBackground}
      />

      <KeyboardAvoidingView
        style={styles.body}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          showsVerticalScrollIndicator={false}
          bounces={false}>
          {/* Header Branding */}
          <View style={styles.brandRow}>
            <View style={styles.logoBadge}>
              <Text style={styles.logoIcon}>📊</Text>
            </View>
            <View style={styles.brandTextGroup}>
              <Text style={styles.brandName}>{apkConfig.apkName}</Text>
              <Text style={styles.brandTagline}>IntefAI Digital CRM</Text>
            </View>
          </View>

          {/* Login Card */}
          <View style={styles.card}>
            <View style={styles.titleRow}>
              <Text style={styles.title}>Welcome back</Text>
              <Text style={styles.titleWave}>👋</Text>
            </View>

            <Text style={styles.subtitle}>
              Login with your registered mobile number to access {apkConfig.apkName}
            </Text>

            <Text style={styles.label}>Mobile number</Text>
            <View style={[styles.inputWrap, showError && styles.inputError]}>
              <Text style={styles.countryCode}>+91</Text>
              <Text style={styles.phoneIcon}>📱</Text>
              <TextInput
                style={styles.input}
                value={formattedPhone}
                onChangeText={handlePhoneChange}
                onBlur={() => setTouched(true)}
                placeholder="Enter 10-digit number"
                placeholderTextColor={COLORS.textMuted}
                keyboardType="number-pad"
                maxLength={11}
                returnKeyType="done"
              />
            </View>

            {showError && (
              <Text style={styles.errorText}>
                {errorMsg || 'Please enter a valid 10-digit mobile number'}
              </Text>
            )}

            {/* Send OTP Button */}
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={handleSendOtp}
              disabled={!isValid || loading}
              style={styles.buttonOuter}>
              {isValid && !loading ? (
                <LinearGradient
                  colors={[COLORS.gradientStart, COLORS.gradientEnd]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.buttonInner}>
                  <Text style={styles.buttonText}>Send OTP</Text>
                </LinearGradient>
              ) : (
                <View style={[styles.buttonInner, styles.buttonDisabled]}>
                  {loading ? (
                    <ActivityIndicator color={COLORS.white} size="small" />
                  ) : (
                    <Text style={styles.buttonText}>Send OTP</Text>
                  )}
                </View>
              )}
            </TouchableOpacity>

            {/* Security / Verification Badge */}
            <View style={styles.footerRow}>
              <Text style={styles.shieldIcon}>🔒</Text>
              <Text style={styles.footerText}>Secure 4-Digit OTP Authentication</Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  headerBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: SCREEN_HEIGHT * 0.38,
  },
  body: {
    flex: 1,
    zIndex: 10,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 22,
    paddingTop: 48,
    paddingBottom: 40,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 26,
    zIndex: 20,
  },
  logoBadge: {
    width: 50,
    height: 50,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  logoIcon: {
    fontSize: 24,
  },
  brandTextGroup: {
    flex: 1,
  },
  brandName: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    opacity: 0.9,
  },
  brandTagline: {
    color: COLORS.white,
    fontSize: 20,
    fontWeight: '700',
    marginTop: 2,
    letterSpacing: -0.3,
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 24,
    paddingHorizontal: 22,
    paddingTop: 30,
    paddingBottom: 28,
    shadowColor: '#1E293B',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.08,
    shadowRadius: 20,
    elevation: 6,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: COLORS.textDark,
    letterSpacing: -0.5,
  },
  titleWave: {
    fontSize: 22,
    marginLeft: 6,
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 21,
    color: COLORS.textMuted,
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    color: COLORS.textDark,
    marginBottom: 8,
    fontWeight: '600',
  },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.inputBg,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: COLORS.inputBorder,
    paddingHorizontal: 16,
    height: 56,
  },
  inputError: {
    borderColor: COLORS.error,
  },
  countryCode: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textDark,
    marginRight: 8,
  },
  phoneIcon: {
    fontSize: 16,
    marginRight: 10,
    opacity: 0.7,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: COLORS.textDark,
    fontWeight: '600',
    paddingVertical: 0,
    height: '100%',
  },
  errorText: {
    color: COLORS.error,
    fontSize: 13,
    marginTop: 8,
    marginLeft: 4,
    fontWeight: '500',
  },
  buttonOuter: {
    marginTop: 24,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonInner: {
    height: 54,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonDisabled: {
    backgroundColor: COLORS.disabledBtn,
  },
  buttonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
    gap: 6,
  },
  shieldIcon: {
    fontSize: 14,
  },
  footerText: {
    fontSize: 13,
    color: COLORS.textMuted,
    fontWeight: '500',
  },
});
