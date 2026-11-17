import React, { useEffect, useRef, useState } from 'react';
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
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { RootStackParamList } from '../../navigation/types';
import { ApiError } from '../../api/types';
import { authService } from '../../api/auth.service';
import { saveSession } from '../../storage/session';
import { COLORS } from '../../constants/colors';
import { getApkConfig } from '../../constants/config';

const OTP_LENGTH = 4;
const RESEND_COOLDOWN_SECONDS = 30;
const { height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function OtpScreen() {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<RootStackParamList, 'Otp'>>();
  const { phoneNumber } = route.params;

  const [otp, setOtp] = useState('');
  const [touched, setTouched] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(RESEND_COOLDOWN_SECONDS);
  const [resending, setResending] = useState(false);

  const inputRef = useRef<any>(null);
  const apkConfig = getApkConfig();

  const isValid = otp.length === OTP_LENGTH;
  const showError =
    (touched && otp.length > 0 && !isValid) || errorMsg.length > 0;

  // Cooldown countdown
  useEffect(() => {
    let timer: any;
    if (resendCooldown > 0) {
      timer = setTimeout(() => {
        setResendCooldown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearTimeout(timer);
  }, [resendCooldown]);

  const handleOtpChange = (value: string) => {
    setErrorMsg('');
    const cleaned = value.replace(/\D/g, '').slice(0, OTP_LENGTH);
    setOtp(cleaned);
  };

  const handleResendOtp = async () => {
    if (resendCooldown > 0 || resending) return;
    setResending(true);
    setErrorMsg('');
    try {
      await authService.requestOtp({ phone: phoneNumber });
      setResendCooldown(RESEND_COOLDOWN_SECONDS);
      setOtp('');
      inputRef.current?.focus();
    } catch (error: any) {
      const message =
        error instanceof ApiError
          ? error.message
          : 'Failed to resend OTP. Please try again.';
      setErrorMsg(message);
    } finally {
      setResending(false);
    }
  };

  const handleVerify = async () => {
    setTouched(true);
    if (!isValid || loading) return;

    setLoading(true);
    setErrorMsg('');
    try {
      const result = await authService.verifyOtp({
        phone: phoneNumber,
        code: otp,
      });

      // Role check to ensure user belongs to current APK
      const userRole = result.user.role;
      if (apkConfig.disallowedRoles && apkConfig.disallowedRoles.includes(userRole)) {
        throw new ApiError(
          403,
          `Access Denied: Accounts with role (${userRole}) are not permitted on ${apkConfig.apkName}.`
        );
      }
      if (apkConfig.allowedRoles && apkConfig.allowedRoles.length > 0) {
        const isAllowed = apkConfig.allowedRoles.includes(userRole);
        if (!isAllowed) {
          throw new ApiError(
            403,
            `Access Denied: Your account role (${userRole}) is not permitted on ${apkConfig.apkName}.`
          );
        }
      }

      // Save session securely
      await saveSession({
        accessToken: result.accessToken,
        refreshToken: result.refreshToken,
        user: result.user,
        phone: phoneNumber,
      });

      // Reset navigation stack to Dashboard so back button cannot return to login
      navigation.reset({
        index: 0,
        routes: [{ name: 'Dashboard' }],
      });
    } catch (error: any) {
      const message =
        error instanceof ApiError
          ? error.message
          : 'Invalid OTP. Please check the code and try again.';
      setErrorMsg(message);
    } finally {
      setLoading(false);
    }
  };

  const formattedPhone =
    phoneNumber.length > 5
      ? `${phoneNumber.slice(0, 5)} ${phoneNumber.slice(5)}`
      : phoneNumber;

  return (
    <View style={styles.root}>
      <LinearGradient
        colors={[COLORS.gradientStart, COLORS.gradientEnd]}
        start={{ x: 0, y: 0.5 }}
        end={{ x: 1, y: 0.5 }}
        style={styles.headerBackground}
      />

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          showsVerticalScrollIndicator={false}
          bounces={false}>
          {/* Back Button */}
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => navigation.goBack()}
            style={styles.backBtn}>
            <Text style={styles.backText}>← Back</Text>
          </TouchableOpacity>

          {/* OTP Card */}
          <View style={styles.card}>
            <Text style={styles.title}>Enter OTP</Text>
            <Text style={styles.subtitle}>
              We sent a 4-digit code to{' '}
              <Text style={styles.phoneHighlight}>+91 {formattedPhone}</Text>
            </Text>

            {/* OTP 4 Boxes */}
            <TouchableOpacity
              activeOpacity={1}
              style={styles.otpRow}
              onPress={() => inputRef.current?.focus()}>
              {Array.from({ length: OTP_LENGTH }).map((_, index) => (
                <View
                  key={index}
                  style={[
                    styles.otpBox,
                    otp.length === index && styles.otpBoxActive,
                    showError && styles.otpBoxError,
                  ]}>
                  <Text style={styles.otpDigit}>{otp[index] ?? ''}</Text>
                </View>
              ))}
              <TextInput
                ref={inputRef}
                value={otp}
                onChangeText={handleOtpChange}
                onBlur={() => setTouched(true)}
                keyboardType="number-pad"
                maxLength={OTP_LENGTH}
                style={styles.otpInputOverlay}
                autoFocus
                caretHidden
              />
            </TouchableOpacity>

            {showError ? (
              <Text style={styles.errorText}>
                {errorMsg || 'Please enter the complete 4-digit OTP'}
              </Text>
            ) : null}

            {/* Verify Button */}
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={handleVerify}
              disabled={!isValid || loading}
              style={styles.buttonOuter}>
              {isValid && !loading ? (
                <LinearGradient
                  colors={[COLORS.gradientStart, COLORS.gradientEnd]}
                  start={{ x: 0, y: 0.5 }}
                  end={{ x: 1, y: 0.5 }}
                  style={styles.buttonInner}>
                  <Text style={styles.buttonText}>Verify & Continue</Text>
                </LinearGradient>
              ) : (
                <View style={[styles.buttonInner, styles.buttonDisabled]}>
                  {loading ? (
                    <ActivityIndicator color={COLORS.white} size="small" />
                  ) : (
                    <Text style={styles.buttonText}>Verify & Continue</Text>
                  )}
                </View>
              )}
            </TouchableOpacity>

            {/* Resend and Change Number Actions */}
            <View style={styles.actionRow}>
              {resendCooldown > 0 ? (
                <Text style={styles.resendCooldownText}>
                  Resend code in {resendCooldown}s
                </Text>
              ) : (
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={handleResendOtp}
                  disabled={resending}>
                  <Text style={styles.resendActionText}>
                    {resending ? 'Sending...' : 'Resend OTP'}
                  </Text>
                </TouchableOpacity>
              )}

              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => navigation.goBack()}>
                <Text style={styles.changeNumberText}>Change number</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  flex: {
    flex: 1,
    zIndex: 10,
  },
  headerBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: SCREEN_HEIGHT * 0.38,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 22,
    paddingTop: 44,
    paddingBottom: 40,
  },
  backBtn: {
    alignSelf: 'flex-start',
    paddingVertical: 8,
    paddingHorizontal: 4,
    marginBottom: 20,
    zIndex: 20,
  },
  backText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '700',
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
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: COLORS.textDark,
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 22,
    color: COLORS.textMuted,
    marginBottom: 28,
  },
  phoneHighlight: {
    color: COLORS.primary,
    fontWeight: '700',
  },
  otpRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
    position: 'relative',
    gap: 12,
  },
  otpBox: {
    flex: 1,
    aspectRatio: 1,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: COLORS.inputBorder,
    backgroundColor: COLORS.inputBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  otpBoxActive: {
    borderColor: COLORS.primary,
    backgroundColor: '#EFF6FF',
    borderWidth: 2,
  },
  otpBoxError: {
    borderColor: COLORS.error,
    backgroundColor: '#FEF2F2',
  },
  otpDigit: {
    fontSize: 26,
    fontWeight: '800',
    color: COLORS.textDark,
  },
  otpInputOverlay: {
    ...StyleSheet.absoluteFill,
    opacity: 0,
  },
  errorText: {
    color: COLORS.error,
    fontSize: 13,
    marginTop: 6,
    marginBottom: 10,
    fontWeight: '500',
    lineHeight: 18,
  },
  buttonOuter: {
    marginTop: 20,
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
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 24,
    paddingHorizontal: 4,
  },
  resendCooldownText: {
    fontSize: 14,
    color: COLORS.textMuted,
    fontWeight: '500',
  },
  resendActionText: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: '700',
  },
  changeNumberText: {
    fontSize: 14,
    color: COLORS.secondary,
    fontWeight: '600',
  },
});
