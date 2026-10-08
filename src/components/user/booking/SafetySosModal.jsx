import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Pressable,
  StyleSheet,
  Modal,
  Linking,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import Icon from '../../Icon';

export default function SafetySosModal({ show, onClose, activeRide }) {
  if (!show) return null;

  const handleCallEmergency = () => {
    Linking.openURL('tel:112');
  };

  const handleCallSupport = () => {
    Linking.openURL('tel:18001234567');
  };

  return (
    <Modal visible={show} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <TouchableOpacity
          style={styles.backdropTouchable}
          activeOpacity={1}
          onPress={onClose}
        />
        <SafeAreaView style={styles.modalSheet}>
          {/* Material Handle */}
          <View style={styles.handleContainer}>
            <View style={styles.handleBar} />
          </View>

          {/* Header */}
          <View style={styles.headerRow}>
            <View style={styles.titleGroup}>
              <View style={styles.shieldIcon}>
                <Icon name="shield" size={20} color="#dc2626" />
              </View>
              <View>
                <Text style={styles.title}>Safety & Emergency</Text>
                <Text style={styles.subtitle}>24x7 RapidRide Trust & Safety Hub</Text>
              </View>
            </View>

            <Pressable
              onPress={onClose}
              style={styles.closeBtn}
              accessibilityRole="button"
              accessibilityLabel="Close safety modal"
            >
              <Icon name="close" size={18} color="#475569" />
            </Pressable>
          </View>

          <ScrollView
            style={styles.contentScroll}
            contentContainerStyle={styles.scrollContentContainer}
            showsVerticalScrollIndicator={false}
            nestedScrollEnabled={true}
            bounces={true}
          >
            {/* SOS Emergency Button Card */}
            <TouchableOpacity
              style={styles.sosCard}
              onPress={handleCallEmergency}
              activeOpacity={0.85}
            >
              <View style={styles.sosLeft}>
                <View style={styles.sosBadge}>
                  <Text style={styles.sosBadgeText}>SOS</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.sosTitle}>Call National Emergency (112)</Text>
                  <Text style={styles.sosDesc}>
                    Direct line to Police, Ambulance & Fire control room
                  </Text>
                </View>
              </View>
              <View style={styles.sosArrowCircle}>
                <Icon name="arrow_forward" size={16} color="#ffffff" />
              </View>
            </TouchableOpacity>

            {/* 24x7 Safety Helpline Card */}
            <TouchableOpacity
              style={styles.supportCard}
              onPress={handleCallSupport}
              activeOpacity={0.85}
            >
              <View style={styles.supportLeft}>
                <View style={styles.supportBadge}>
                  <Icon name="call" size={18} color="#0052e0" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.supportTitle}>24x7 Safety Response Team</Text>
                  <Text style={styles.supportDesc}>
                    Live incident response & route telematics assistance
                  </Text>
                </View>
              </View>
              <View style={styles.supportArrowCircle}>
                <Icon name="arrow_forward" size={16} color="#0052e0" />
              </View>
            </TouchableOpacity>

            {/* Safety Features List Card */}
            <View style={styles.safetyInfoCard}>
              <Text style={styles.infoHeading}>Trip Protection Active</Text>

              <View style={styles.infoRow}>
                <View style={styles.infoIconBox}>
                  <Icon name="vpn_key" size={16} color="#059669" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.infoTitle}>Start OTP Verification</Text>
                  <Text style={styles.infoSub}>
                    Ride starts only when your unique 4-digit code is authenticated
                  </Text>
                </View>
              </View>

              <View style={styles.infoRow}>
                <View style={styles.infoIconBox}>
                  <Icon name="my_location" size={16} color="#0052e0" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.infoTitle}>Real-time GPS Tracking</Text>
                  <Text style={styles.infoSub}>
                    Live satellite tracking continuously monitored on map
                  </Text>
                </View>
              </View>

              <View style={styles.infoRow}>
                <View style={styles.infoIconBox}>
                  <Icon name="verified_user" size={16} color="#7c3aed" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.infoTitle}>Verified Captains</Text>
                  <Text style={styles.infoSub}>
                    Background checked and government document verified drivers
                  </Text>
                </View>
              </View>
            </View>
          </ScrollView>

          {/* Bottom Close Button */}
          <View style={styles.bottomBar}>
            <TouchableOpacity
              style={styles.doneBtn}
              onPress={onClose}
              activeOpacity={0.88}
            >
              <Text style={styles.doneBtnText}>Close Safety Hub</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'flex-end',
  },
  backdropTouchable: {
    flex: 1,
  },
  modalSheet: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '82%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 10,
  },
  handleContainer: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  handleBar: {
    width: 44,
    height: 4.5,
    borderRadius: 3,
    backgroundColor: '#cbd5e1',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  titleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  shieldIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#fef2f2',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#fecaca',
  },
  title: {
    fontSize: 17,
    fontWeight: '900',
    color: '#0f172a',
  },
  subtitle: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748b',
    marginTop: 1,
  },
  closeBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  contentScroll: {
    flexGrow: 0,
  },
  scrollContentContainer: {
    paddingHorizontal: 18,
    paddingTop: 16,
    paddingBottom: 16,
  },
  sosCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fef2f2',
    borderWidth: 1.5,
    borderColor: '#fca5a5',
    borderRadius: 18,
    padding: 14,
    marginBottom: 12,
    shadowColor: '#dc2626',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  sosLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  sosBadge: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#dc2626',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sosBadgeText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '900',
  },
  sosTitle: {
    fontSize: 14,
    fontWeight: '900',
    color: '#991b1b',
  },
  sosDesc: {
    fontSize: 11,
    fontWeight: '600',
    color: '#b91c1c',
    marginTop: 2,
  },
  sosArrowCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#dc2626',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 10,
  },
  supportCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#eff6ff',
    borderWidth: 1.5,
    borderColor: '#bfdbfe',
    borderRadius: 18,
    padding: 14,
    marginBottom: 16,
    shadowColor: '#0052e0',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  supportLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  supportBadge: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#dbeafe',
    alignItems: 'center',
    justifyContent: 'center',
  },
  supportTitle: {
    fontSize: 14,
    fontWeight: '900',
    color: '#1d4ed8',
  },
  supportDesc: {
    fontSize: 11,
    fontWeight: '600',
    color: '#2563eb',
    marginTop: 2,
  },
  supportArrowCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#dbeafe',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 10,
  },
  safetyInfoCard: {
    backgroundColor: '#ffffff',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    padding: 16,
    gap: 14,
    marginBottom: 8,
  },
  infoHeading: {
    fontSize: 11,
    fontWeight: '900',
    color: '#64748b',
    letterSpacing: 0.6,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  infoIconBox: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f8fafc',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  infoTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0f172a',
  },
  infoSub: {
    fontSize: 11,
    color: '#64748b',
    marginTop: 2,
    lineHeight: 15,
  },
  bottomBar: {
    paddingHorizontal: 18,
    paddingTop: 10,
    paddingBottom: 16,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    backgroundColor: '#ffffff',
  },
  doneBtn: {
    backgroundColor: '#0f172a',
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  doneBtnText: {
    fontSize: 14.5,
    fontWeight: '900',
    color: '#ffffff',
  },
});
