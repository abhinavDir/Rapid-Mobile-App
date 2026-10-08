import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Dimensions,
  SafeAreaView,
} from 'react-native';
import { WaveBottom } from '../../SvgIcons';
import storage from '../../../utils/storage';

const { width } = Dimensions.get('window');

export default function WelcomeScreen({ onNavigate }) {
  const handleProceed = async (targetScreen) => {
    try {
      await storage.setItem('hasSeenWelcome', 'true');
    } catch (e) {
      console.warn('Failed to save hasSeenWelcome:', e);
    }
    if (onNavigate) {
      onNavigate(targetScreen);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* TOP: Hero Photo with Wave Bottom */}
      <View style={styles.heroContainer}>
        <Image
          source={require('../../../assets/welcome-hero.jpg')}
          style={styles.heroPhoto}
          resizeMode="cover"
        />
        {/* Prominent S-Curve Wave matching screenshot */}
        <View style={styles.waveWrapper}>
          <WaveBottom width={width} height={64} color="#ffffff" />
        </View>
      </View>

      {/* BOTTOM: Clean Content */}
      <View style={styles.contentContainer}>
        <View style={styles.titleBlock}>
          <Text style={styles.eyebrowText}>RAPIDRIDE</Text>
          <Text style={styles.mainHeading}>CITY MOBILITY</Text>
        </View>

        <View style={styles.buttonsBlock}>
          <TouchableOpacity
            style={styles.btnPrimary}
            activeOpacity={0.88}
            onPress={() => handleProceed('register')}
          >
            <Text style={styles.btnPrimaryText}>Sign Up for Free!</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.btnSecondary}
            activeOpacity={0.88}
            onPress={() => handleProceed('login')}
          >
            <Text style={styles.btnSecondaryText}>Just Browsing</Text>
          </TouchableOpacity>

          <View style={styles.signinRow}>
            <Text style={styles.signinText}>Already have an account? </Text>
            <TouchableOpacity onPress={() => handleProceed('login')}>
              <Text style={styles.signinLink}>Sign in</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  heroContainer: {
    flex: 1.35,
    position: 'relative',
    overflow: 'hidden',
    backgroundColor: '#f1f5f9',
  },
  heroPhoto: {
    width: '100%',
    height: '100%',
  },
  waveWrapper: {
    position: 'absolute',
    bottom: -1,
    left: 0,
    right: 0,
    width: '100%',
    zIndex: 10,
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 28,
    paddingTop: 8,
    paddingBottom: 24,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    gap: 20,
    zIndex: 20,
  },
  titleBlock: {
    alignItems: 'center',
    width: '100%',
  },
  eyebrowText: {
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 2.2,
    color: '#1a365d',
    textTransform: 'uppercase',
    marginBottom: 4,
    textAlign: 'center',
  },
  mainHeading: {
    fontSize: 34,
    fontWeight: '900',
    letterSpacing: -0.6,
    color: '#ff5c47',
    lineHeight: 40,
    textTransform: 'uppercase',
    textAlign: 'center',
  },
  buttonsBlock: {
    width: '100%',
    gap: 12,
  },
  btnPrimary: {
    width: '100%',
    paddingVertical: 15,
    backgroundColor: '#ff5c47',
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#ff5c47',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 14,
    elevation: 5,
  },
  btnPrimaryText: {
    color: '#ffffff',
    fontSize: 16.5,
    fontWeight: '800',
  },
  btnSecondary: {
    width: '100%',
    paddingVertical: 15,
    backgroundColor: '#fff0d9',
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnSecondaryText: {
    color: '#c96434',
    fontSize: 16,
    fontWeight: '800',
  },
  signinRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 4,
  },
  signinText: {
    fontSize: 14.5,
    fontWeight: '600',
    color: '#475569',
  },
  signinLink: {
    color: '#ff5c47',
    fontWeight: '800',
    fontSize: 14.5,
  },
});
