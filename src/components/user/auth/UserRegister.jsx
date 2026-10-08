import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Pressable,
  StyleSheet,
  ScrollView,
  Image,
  Dimensions,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
} from 'react-native';
import { GoogleLogo, WaveBottom } from '../../SvgIcons';
import Icon from '../../Icon';
import { performGoogleSignIn } from '../../../services/googleAuthService';

const { width } = Dimensions.get('window');

export default function UserRegister({ onRegister, onGoogleLogin, onSwitchToLogin, onBack }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const validateEmail = (val) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
  };

  const handleGoogleClick = async () => {
    setError('');
    setGoogleLoading(true);
    try {
      const googleUser = await performGoogleSignIn();
      if (googleUser && onGoogleLogin) {
        await onGoogleLogin(googleUser);
      }
    } catch (err) {
      if (err.isCancelled) {
        return;
      }
      setError(err?.message || 'Google sign-in failed. Please try again.');
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleSubmit = async () => {
    setError('');

    const cleanName = name.trim();
    const cleanEmail = email.trim().toLowerCase();

    if (!cleanName) {
      setError('Please enter your full name');
      return;
    }
    if (!cleanEmail) {
      setError('Please enter your email address');
      return;
    }
    if (!validateEmail(cleanEmail)) {
      setError('Please enter a valid email address');
      return;
    }
    if (!password || password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    setLoading(true);
    try {
      await onRegister({
        name: cleanName,
        email: cleanEmail,
        password,
      });
    } catch (err) {
      setError(err?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.root}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* TOP HERO ARTWORK */}
        <View style={styles.artworkContainer}>
          {/* Back Arrow Button to Welcome Page */}
          {onBack ? (
            <Pressable
              style={styles.backBtn}
              onPress={onBack}
              accessibilityRole="button"
              accessibilityLabel="Back"
              hitSlop={8}
            >
              <Icon name="arrow_back" size={20} color="#0f172a" />
            </Pressable>
          ) : null}

          <Image
            source={require('../../../assets/taxi-login-hero.jpg')}
            style={styles.artImage}
            resizeMode="cover"
          />
          <View style={styles.waveWrapper}>
            <WaveBottom width={width} height={48} color="#ffffff" />
          </View>
          <View style={styles.brandTagPill}>
            <Icon name="electric_bolt" size={14} color="#38bdf8" style={{ marginRight: 4 }} />
            <Text style={styles.brandTagText}>RapidRide</Text>
          </View>
          <View style={styles.captionPill}>
            <View style={styles.captionDot} />
            <Text style={styles.captionText}>Fast, Safe & Verified Rides</Text>
          </View>
        </View>

        {/* FORM CONTAINER */}
        <View style={styles.formContainer}>
          {/* Header */}
          <View style={styles.headerBlock}>
            <Text style={styles.title}>Sign Up</Text>
            <Text style={styles.subtitle}>
              Create an account to book fast & affordable rides
            </Text>
          </View>

          {/* Error Chip */}
          {error ? (
            <View style={styles.errorChip}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          {/* Full Name Field */}
          <View style={styles.inputGroup}>
            <View style={styles.pillInputWrapper}>
              <Icon name="person" size={18} color="#64748b" style={{ marginRight: 10 }} />
              <TextInput
                style={styles.textInput}
                placeholder="Full Name"
                placeholderTextColor="#94a3b8"
                value={name}
                onChangeText={(text) => {
                  setName(text);
                  if (error) setError('');
                }}
              />
            </View>
          </View>

          {/* Email Address Field */}
          <View style={styles.inputGroup}>
            <View style={styles.pillInputWrapper}>
              <Icon name="mail" size={18} color="#64748b" style={{ marginRight: 10 }} />
              <TextInput
                style={styles.textInput}
                placeholder="Email address"
                placeholderTextColor="#94a3b8"
                value={email}
                onChangeText={(text) => {
                  setEmail(text);
                  if (error) setError('');
                }}
                autoCapitalize="none"
                keyboardType="email-address"
              />
            </View>
          </View>

          {/* Password Field */}
          <View style={styles.inputGroup}>
            <View style={styles.pillInputWrapper}>
              <Icon name="lock" size={18} color="#64748b" style={{ marginRight: 10 }} />
              <TextInput
                style={styles.textInput}
                placeholder="Password (min 6 characters)"
                placeholderTextColor="#94a3b8"
                value={password}
                onChangeText={(text) => {
                  setPassword(text);
                  if (error) setError('');
                }}
                secureTextEntry={!showPassword}
              />
              <Pressable
                onPress={() => setShowPassword(!showPassword)}
                style={styles.eyeBtn}
                accessibilityRole="button"
                accessibilityLabel={showPassword ? 'Hide password' : 'Show password'}
                hitSlop={8}
              >
                <Icon
                  name={showPassword ? 'visibility' : 'visibility_off'}
                  size={20}
                  color="#64748b"
                />
              </Pressable>
            </View>
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            style={[styles.submitPillBtn, loading && styles.submitBtnDisabled]}
            onPress={handleSubmit}
            disabled={loading}
            activeOpacity={0.85}
          >
            {loading ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <Text style={styles.submitPillText}>SIGN UP</Text>
            )}
          </TouchableOpacity>

          {/* Divider */}
          <View style={styles.dividerRow}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>Or register with</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Social Logins */}
          <View style={styles.socialCol}>
            <TouchableOpacity
              style={styles.socialPillBtn}
              onPress={handleGoogleClick}
              disabled={loading || googleLoading}
              activeOpacity={0.8}
            >
              {googleLoading ? (
                <ActivityIndicator size="small" color="#0052e0" />
              ) : (
                <>
                  <GoogleLogo size={20} />
                  <Text style={styles.socialBtnText}>Continue with Google</Text>
                </>
              )}
            </TouchableOpacity>
          </View>

          {/* Switch to Login */}
          <View style={styles.switchRow}>
            <Text style={styles.switchText}>Already have an account? </Text>
            <TouchableOpacity onPress={onSwitchToLogin}>
              <Text style={styles.switchLink}>Login</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  scrollContent: {
    flexGrow: 1,
    backgroundColor: '#ffffff',
  },
  artworkContainer: {
    height: 200,
    width: '100%',
    position: 'relative',
    backgroundColor: '#0f172a',
  },
  artImage: {
    width: '100%',
    height: '100%',
  },
  waveWrapper: {
    position: 'absolute',
    bottom: -1,
    left: 0,
    right: 0,
  },
  backBtn: {
    position: 'absolute',
    top: Platform.OS === 'android' ? (StatusBar.currentHeight || 24) + 8 : 34,
    left: 18,
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 50,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 6,
  },
  backBtnIcon: {
    fontSize: 20,
    color: '#0f172a',
    fontWeight: '900',
    marginTop: -2,
  },
  brandTagPill: {
    position: 'absolute',
    top: Platform.OS === 'android' ? (StatusBar.currentHeight || 24) + 10 : 36,
    left: 68,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  brandTagText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '900',
  },
  captionPill: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(15, 23, 42, 0.8)',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 14,
    gap: 6,
  },
  captionDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10b981',
  },
  captionText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '800',
  },
  formContainer: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 28,
  },
  headerBlock: {
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '900',
    color: '#0f172a',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748b',
    marginTop: 4,
  },
  errorChip: {
    backgroundColor: '#fef2f2',
    borderWidth: 1,
    borderColor: '#fecaca',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
    marginBottom: 14,
  },
  errorText: {
    color: '#dc2626',
    fontSize: 13,
    fontWeight: '700',
  },
  inputGroup: {
    marginBottom: 14,
  },
  pillInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
    borderRadius: 28,
    paddingHorizontal: 16,
    height: 52,
  },
  inputIcon: {
    fontSize: 16,
    marginRight: 10,
  },
  textInput: {
    flex: 1,
    fontSize: 15,
    fontWeight: '700',
    color: '#0f172a',
    paddingVertical: 0,
  },
  eyeBtn: {
    padding: 4,
  },
  eyeText: {
    fontSize: 16,
  },
  submitPillBtn: {
    backgroundColor: '#0f172a',
    borderRadius: 28,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  submitBtnDisabled: {
    opacity: 0.7,
  },
  submitPillText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 1.5,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 18,
    gap: 12,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#e2e8f0',
  },
  dividerText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#94a3b8',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  socialCol: {
    gap: 10,
  },
  socialPillBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
    borderRadius: 28,
    height: 50,
    gap: 10,
  },
  socialBtnText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#334155',
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  switchText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748b',
  },
  switchLink: {
    fontSize: 14,
    fontWeight: '900',
    color: '#0052e0',
  },
});
