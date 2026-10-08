import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Pressable,
  StyleSheet,
  Linking,
  ScrollView,
  Alert,
  Animated,
  Easing,
} from 'react-native';
import Icon from '../../Icon';
import { BikeGraphic, AutoGraphic, CabGraphic } from '../../SvgIcons';

const SEARCH_QUOTES = [
  'Broadcasting request to nearby verified captains...',
  'Finding the closest captain near Point A pickup...',
  'Confirming vehicle availability & upfront locked fare...',
  'Generating 4-digit start OTP security code...',
  'Connecting with high-rated RapidRide Captains...',
];

export default function ActiveRideCard({
  activeRide,
  liveTripDistKm,
  liveTripEtaMins,
  onStartTrip,
  onCompleteTrip,
  onCancelRequest,
  onOpenChat,
  onOpenSafety,
  onOpenFare,
}) {
  if (!activeRide) return null;

  const [isMinimized, setIsMinimized] = useState(false);
  const [searchSeconds, setSearchSeconds] = useState(0);
  const [quoteIndex, setQuoteIndex] = useState(0);

  // Smooth Sonar Radar Pulse Animation for PENDING state
  const pulseAnim1 = useRef(new Animated.Value(1)).current;
  const pulseOpacity1 = useRef(new Animated.Value(0.7)).current;
  const pulseAnim2 = useRef(new Animated.Value(1)).current;
  const pulseOpacity2 = useRef(new Animated.Value(0.5)).current;

  useEffect(() => {
    if (activeRide?.status !== 'PENDING') {
      setSearchSeconds(0);
      return;
    }

    const timerInterval = setInterval(() => {
      setSearchSeconds((prev) => prev + 1);
    }, 1000);

    const quoteInterval = setInterval(() => {
      setQuoteIndex((prev) => (prev + 1) % SEARCH_QUOTES.length);
    }, 2400);

    // Radar pulse animation loop
    const pulseLoop = Animated.loop(
      Animated.parallel([
        Animated.sequence([
          Animated.timing(pulseAnim1, {
            toValue: 1.6,
            duration: 1800,
            easing: Easing.out(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim1, {
            toValue: 1,
            duration: 0,
            useNativeDriver: true,
          }),
        ]),
        Animated.sequence([
          Animated.timing(pulseOpacity1, {
            toValue: 0,
            duration: 1800,
            easing: Easing.out(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(pulseOpacity1, {
            toValue: 0.7,
            duration: 0,
            useNativeDriver: true,
          }),
        ]),
        Animated.sequence([
          Animated.delay(500),
          Animated.timing(pulseAnim2, {
            toValue: 1.8,
            duration: 1800,
            easing: Easing.out(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim2, {
            toValue: 1,
            duration: 0,
            useNativeDriver: true,
          }),
        ]),
        Animated.sequence([
          Animated.delay(500),
          Animated.timing(pulseOpacity2, {
            toValue: 0,
            duration: 1800,
            easing: Easing.out(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(pulseOpacity2, {
            toValue: 0.5,
            duration: 0,
            useNativeDriver: true,
          }),
        ]),
      ])
    );
    pulseLoop.start();

    return () => {
      clearInterval(timerInterval);
      clearInterval(quoteInterval);
      pulseLoop.stop();
    };
  }, [activeRide?.status]);

  const formatTimer = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const vType = activeRide.vehicleType || 'Bike';
  const renderVehicleGraphic = (size = 'normal') => {
    const w = size === 'large' ? 68 : 36;
    const h = size === 'large' ? 38 : 22;
    if (vType === 'Auto') return <AutoGraphic width={w} height={h} />;
    if (vType === 'Car') return <CabGraphic width={w} height={h} />;
    return <BikeGraphic width={w} height={h} />;
  };

  const otpCode = String(activeRide.otp || activeRide.startOtp || '1979');
  const fare = activeRide.fare || 55;

  const handleCallDriver = () => {
    const phone = activeRide.assignedRiderPhone;
    if (phone) {
      Linking.openURL(`tel:${phone}`);
    } else {
      Alert.alert('Captain Contact', 'Captain is en route. You can use the in-app chat to message your captain.');
    }
  };

  const handleConfirmCancel = () => {
    Alert.alert(
      'Cancel Ride Request?',
      'Are you sure you want to cancel? No cancellation charge will apply.',
      [
        { text: 'Keep Waiting', style: 'cancel' },
        {
          text: 'Yes, Cancel',
          style: 'destructive',
          onPress: () => onCancelRequest && onCancelRequest(),
        },
      ]
    );
  };

  return (
    <ScrollView
      style={styles.scrollWrapper}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
      nestedScrollEnabled={true}
      bounces={true}
    >
      {/* 1. ENHANCED PENDING STATE: RADAR SONAR, ROTATING QUOTES, LOCKED FARE, ROUTE CAPSULE */}
      {activeRide.status === 'PENDING' && (
        <View style={styles.pendingBlock}>
          {/* Top Status & Live Timer Bar */}
          <View style={styles.pendingHeaderRow}>
            <View style={styles.searchingDotBadge}>
              <View style={styles.pulseDotBlue} />
              <Text style={styles.searchingStatusText}>REQUESTING {vType.toUpperCase()} CAPTAIN</Text>
            </View>

            <View style={styles.timerPill}>
              <Icon name="schedule" size={13} color="#0052e0" />
              <Text style={styles.timerText}>{formatTimer(searchSeconds)}</Text>
            </View>
          </View>

          {/* Central Sonar Radar Visual */}
          <View style={styles.radarContainer}>
            <Animated.View
              style={[
                styles.sonarRing,
                {
                  transform: [{ scale: pulseAnim2 }],
                  opacity: pulseOpacity2,
                },
              ]}
            />
            <Animated.View
              style={[
                styles.sonarRing,
                {
                  transform: [{ scale: pulseAnim1 }],
                  opacity: pulseOpacity1,
                },
              ]}
            />
            <View style={styles.radarCenterCircle}>
              {renderVehicleGraphic('large')}
            </View>
          </View>

          {/* Dynamic Changing Status Quote */}
          <View style={styles.quoteBubble}>
            <Text style={styles.quoteText}>
              {SEARCH_QUOTES[quoteIndex]}
            </Text>
          </View>

          {/* Locked Fare & Distance Badges */}
          <View style={styles.quickStatsRow}>
            <View style={styles.quickStatPill}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                <Icon name="lock" size={12} color="#059669" />
                <Text style={styles.quickStatLabel}>UPFRONT FARE</Text>
              </View>
              <Text style={styles.quickStatValue}>₹{fare}</Text>
              <Text style={styles.statSub}>Zero surge locked</Text>
            </View>
            <View style={styles.quickStatPill}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                <Icon name="near_me" size={12} color="#0052e0" />
                <Text style={styles.quickStatLabel}>ESTIMATED DISTANCE</Text>
              </View>
              <Text style={styles.quickStatValue}>
                {activeRide.distanceKm ? `${activeRide.distanceKm.toFixed(1)} km` : '~3.5 km'}
              </Text>
              <Text style={styles.statSub}>Fastest road route</Text>
            </View>
          </View>

          {/* Point A -> Point B Route Capsule */}
          <View style={styles.routeCard}>
            <View style={styles.routeRow}>
              <View style={styles.dotGreen} />
              <View style={styles.routeTextCol}>
                <Text style={styles.routeTagPickup}>PICKUP (POINT A)</Text>
                <Text style={styles.routeAddrText} numberOfLines={1}>
                  {activeRide.pickupAddress || 'Selected Pickup Point'}
                </Text>
              </View>
            </View>
            <View style={styles.routeTimelineLine} />
            <View style={styles.routeRow}>
              <View style={styles.squareRed} />
              <View style={styles.routeTextCol}>
                <Text style={styles.routeTagDropoff}>DESTINATION (POINT B)</Text>
                <Text style={styles.routeAddrText} numberOfLines={1}>
                  {activeRide.dropoffAddress || 'Selected Dropoff Destination'}
                </Text>
              </View>
            </View>
          </View>

          {/* Cancel Request Button */}
          <TouchableOpacity
            style={styles.cancelSearchBtn}
            onPress={handleConfirmCancel}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel="Cancel ride request"
          >
            <Icon name="close" size={16} color="#dc2626" />
            <Text style={styles.cancelSearchText}>Cancel Ride Request</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* 2. ACCEPTED & IN_PROGRESS STATES */}
      {(activeRide.status === 'ACCEPTED' || activeRide.status === 'IN_PROGRESS') && (
        <View style={styles.activeBlock}>
          {isMinimized ? (
            /* COMPACT MINIMIZED VIEW */
            <TouchableOpacity
              style={styles.minimizedBar}
              onPress={() => setIsMinimized(false)}
              activeOpacity={0.85}
            >
              <View style={styles.minimizedLeft}>
                <View
                  style={[
                    styles.statusBadge,
                    activeRide.status === 'ACCEPTED'
                      ? styles.statusAccepted
                      : styles.statusInProgress,
                  ]}
                >
                  <Text style={styles.statusBadgeText}>
                    {activeRide.status === 'ACCEPTED' ? 'CAPTAIN ARRIVING' : 'ON TRIP'}
                  </Text>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 3 }}>
                  {renderVehicleGraphic('small')}
                  <Text style={styles.minimizedDriverText} numberOfLines={1}>
                    {activeRide.assignedRiderName || 'Captain'} •{' '}
                    {activeRide.vehicleNumber || 'UP 32 EK 2049'}
                  </Text>
                </View>
              </View>

              <View style={styles.minimizedRight}>
                <Text style={styles.minimizedFare}>₹{fare}</Text>
                <View style={styles.expandCircle}>
                  <Icon name="expand_less" size={18} color="#0f172a" />
                </View>
              </View>
            </TouchableOpacity>
          ) : (
            /* FULL EXPANDED VIEW */
            <>
              {/* Header Bar: Status Pill, Fare, & Minimize Toggle */}
              <View style={styles.activeHeader}>
                <View
                  style={[
                    styles.statusBadge,
                    activeRide.status === 'ACCEPTED'
                      ? styles.statusAccepted
                      : styles.statusInProgress,
                  ]}
                >
                  <View
                    style={[
                      styles.statusDot,
                      activeRide.status === 'ACCEPTED'
                        ? styles.statusDotGreen
                        : styles.statusDotBlue,
                    ]}
                  />
                  <Text style={styles.statusBadgeText}>
                    {activeRide.status === 'ACCEPTED'
                      ? 'CAPTAIN EN ROUTE TO POINT A'
                      : 'TRIP IN PROGRESS TO POINT B'}
                  </Text>
                </View>

                <View style={styles.headerRightControls}>
                  <TouchableOpacity
                    onPress={onOpenFare}
                    style={styles.farePill}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.fareAmount}>₹{fare}</Text>
                    <Icon name="chevron_right" size={14} color="#64748b" />
                  </TouchableOpacity>

                  <Pressable
                    onPress={() => setIsMinimized(true)}
                    style={styles.minimizeBtn}
                    accessibilityRole="button"
                    accessibilityLabel="Minimize ride card"
                  >
                    <Icon name="expand_more" size={20} color="#0f172a" />
                  </Pressable>
                </View>
              </View>

              {/* Driver & Vehicle Hero Card */}
              <View style={styles.driverHeroCard}>
                <View style={styles.driverHeroLeft}>
                  <View style={styles.driverAvatar}>
                    {renderVehicleGraphic('small')}
                    <View style={styles.verifiedDot}>
                      <Icon name="check" size={10} color="#ffffff" />
                    </View>
                  </View>
                  <View style={styles.driverTextCol}>
                    <View style={styles.captainNameRow}>
                      <Text style={styles.driverName} numberOfLines={1}>
                        {activeRide.assignedRiderName || 'Verified Captain'}
                      </Text>
                      <View style={styles.verifiedBadge}>
                        <Text style={styles.verifiedBadgeText}>VERIFIED</Text>
                      </View>
                    </View>
                    <Text style={styles.vehicleModelText}>
                      {activeRide.vehicleModel || (vType + ' Service')}
                    </Text>
                    <View style={styles.ratingRow}>
                      <Icon name="star" size={13} color="#f59e0b" />
                      <Text style={styles.ratingNumber}>
                        {activeRide.riderRating ? activeRide.riderRating.toFixed(1) : '5.0'}
                      </Text>
                      <Text style={styles.tripsCount}>
                        {activeRide.totalTrips ? `• ${activeRide.totalTrips} trips` : '• Top Rated'}
                      </Text>
                    </View>
                  </View>
                </View>

                <View style={styles.driverHeroRight}>
                  <View style={styles.plateContainer}>
                    <Text style={styles.plateLabel}>IND</Text>
                    <Text style={styles.plateNumber}>
                      {activeRide.vehicleNumber || 'VERIFIED'}
                    </Text>
                  </View>
                  <View style={styles.liveEtaPill}>
                    <Icon name="schedule" size={12} color="#059669" />
                    <Text style={styles.liveEtaText}>
                      {activeRide.status === 'ACCEPTED'
                        ? liveTripDistKm !== null
                          ? `${liveTripDistKm.toFixed(1)} km (~${liveTripEtaMins || 2} min)`
                          : 'Arriving in ~2 mins'
                        : liveTripDistKm !== null
                          ? `${liveTripDistKm.toFixed(1)} km to dropoff`
                          : 'On destination route'}
                    </Text>
                  </View>
                </View>
              </View>

              {/* 4-DIGIT START OTP BADGE (Phase 1: Captain Arriving to Point A) */}
              {activeRide.status === 'ACCEPTED' && (
                <View style={styles.otpCard}>
                  <View style={styles.otpLeftCol}>
                    <View style={styles.otpTitleRow}>
                      <Icon name="vpn_key" size={15} color="#b45309" />
                      <Text style={styles.otpHeadline}>START TRIP PIN / OTP</Text>
                    </View>
                    <Text style={styles.otpSubtitle}>
                      Give this 4-digit code to Captain upon arrival to begin ride
                    </Text>
                  </View>
                  <View style={styles.otpDigitsContainer}>
                    {otpCode.split('').map((digit, i) => (
                      <View key={`otp-${i}`} style={styles.otpSingleBox}>
                        <Text style={styles.otpSingleDigit}>{digit}</Text>
                      </View>
                    ))}
                  </View>
                  
                  {/* Action to simulate Captain verifying OTP and starting ride */}
                  {onStartTrip && (
                    <TouchableOpacity
                      style={styles.startTripBtn}
                      onPress={onStartTrip}
                      activeOpacity={0.88}
                    >
                      <Icon name="play_arrow" size={16} color="#ffffff" />
                      <Text style={styles.startTripBtnText}>Start Ride (Verify OTP)</Text>
                    </TouchableOpacity>
                  )}
                </View>
              )}

              {/* TRIP IN PROGRESS LIVE BANNER (Phase 2: During Ride to Point B) */}
              {activeRide.status === 'IN_PROGRESS' && (
                <View style={styles.inProgressCard}>
                  <View style={styles.inProgressHeaderRow}>
                    <View style={styles.inProgressLeft}>
                      <View style={styles.pulseDotGreen} />
                      <View>
                        <Text style={styles.inProgressTitle}>HEADING TO DESTINATION (POINT B)</Text>
                        <Text style={styles.inProgressSub}>
                          {liveTripDistKm !== null
                            ? `${liveTripDistKm.toFixed(1)} km remaining • Live route active`
                            : 'Following fastest road route to Point B'}
                        </Text>
                      </View>
                    </View>
                    <TouchableOpacity
                      onPress={onOpenSafety}
                      style={styles.safetyMiniBtn}
                      activeOpacity={0.8}
                    >
                      <Icon name="shield" size={13} color="#0052e0" />
                      <Text style={styles.safetyMiniText}>Safety</Text>
                    </TouchableOpacity>
                  </View>

                  {/* Complete Ride Button */}
                  {onCompleteTrip && (
                    <TouchableOpacity
                      style={styles.completeRideBtn}
                      onPress={onCompleteTrip}
                      activeOpacity={0.88}
                    >
                      <Icon name="check_circle" size={16} color="#ffffff" />
                      <Text style={styles.completeRideBtnText}>Arrived at Destination (Complete Ride)</Text>
                    </TouchableOpacity>
                  )}
                </View>
              )}

              {/* Interactive Action Buttons: Call & Chat */}
              <View style={styles.actionButtonsRow}>
                <TouchableOpacity
                  style={[styles.primaryActionBtn, styles.callBtn]}
                  onPress={handleCallDriver}
                  activeOpacity={0.85}
                >
                  <View style={styles.actionIconCircleGreen}>
                    <Icon name="call" size={16} color="#ffffff" />
                  </View>
                  <View>
                    <Text style={styles.actionBtnTitle}>Call Captain</Text>
                    <Text style={styles.actionBtnSubtitle}>Free in-app call</Text>
                  </View>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.primaryActionBtn, styles.chatBtn]}
                  onPress={onOpenChat}
                  activeOpacity={0.85}
                >
                  <View style={styles.actionIconCircleBlue}>
                    <Icon name="chat" size={16} color="#ffffff" />
                  </View>
                  <View>
                    <Text style={styles.actionBtnTitle}>Chat / Message</Text>
                    <Text style={styles.actionBtnSubtitle}>Quick replies</Text>
                  </View>
                </TouchableOpacity>
              </View>

              {/* Detailed Route Capsule (Point A -> Point B) */}
              <View style={styles.routeCard}>
                <View style={styles.routeRow}>
                  <View style={styles.dotGreen} />
                  <View style={styles.routeTextCol}>
                    <Text style={styles.routeTagPickup}>PICKUP SPOT (POINT A)</Text>
                    <Text style={styles.routeAddrText} numberOfLines={1}>
                      {activeRide.pickupAddress || 'Pickup Point'}
                    </Text>
                  </View>
                </View>
                <View style={styles.routeTimelineLine} />
                <View style={styles.routeRow}>
                  <View style={styles.squareRed} />
                  <View style={styles.routeTextCol}>
                    <Text style={styles.routeTagDropoff}>DESTINATION (POINT B)</Text>
                    <Text style={styles.routeAddrText} numberOfLines={1}>
                      {activeRide.dropoffAddress || 'Dropoff Point'}
                    </Text>
                  </View>
                </View>
              </View>

              {/* Bottom Quick Tools: Safety SOS & Driver Delayed Cancel */}
              <View style={styles.bottomToolsRow}>
                <TouchableOpacity
                  style={styles.safetyToolBtn}
                  onPress={onOpenSafety}
                  activeOpacity={0.8}
                >
                  <Icon name="shield" size={15} color="#0052e0" />
                  <Text style={styles.safetyToolText}>Safety & SOS</Text>
                </TouchableOpacity>

                {activeRide.status === 'ACCEPTED' && (
                  <TouchableOpacity
                    style={styles.delayCancelBtn}
                    onPress={() => {
                      Alert.alert(
                        'Cancel Ride?',
                        'Is the Captain taking too long to arrive? You can cancel the ride with zero fee.',
                        [
                          { text: 'Keep Waiting', style: 'cancel' },
                          {
                            text: 'Yes, Cancel Ride',
                            style: 'destructive',
                            onPress: () => onCancelRequest && onCancelRequest(),
                          },
                        ]
                      );
                    }}
                    activeOpacity={0.8}
                  >
                    <Icon name="timer_off" size={14} color="#dc2626" />
                    <Text style={styles.delayCancelText}>Captain delayed? Cancel</Text>
                  </TouchableOpacity>
                )}
              </View>
            </>
          )}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollWrapper: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 6,
    paddingBottom: 24,
  },
  pendingBlock: {
    alignItems: 'center',
    paddingVertical: 4,
  },
  pendingHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 4,
    marginBottom: 12,
  },
  searchingDotBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#eff6ff',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#bfdbfe',
  },
  pulseDotBlue: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#2563eb',
  },
  pulseDotGreen: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#10b981',
  },
  searchingStatusText: {
    fontSize: 10,
    fontWeight: '900',
    color: '#1d4ed8',
    letterSpacing: 0.5,
  },
  timerPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#eff6ff',
    borderWidth: 1.5,
    borderColor: '#bfdbfe',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 20,
  },
  timerText: {
    fontSize: 13,
    fontWeight: '900',
    color: '#0052e0',
    fontVariant: ['tabular-nums'],
  },
  radarContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    width: 120,
    height: 120,
    marginVertical: 6,
  },
  sonarRing: {
    position: 'absolute',
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(0, 82, 224, 0.22)',
    borderWidth: 1.5,
    borderColor: '#3b82f6',
  },
  radarCenterCircle: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: '#ffffff',
    borderWidth: 2.5,
    borderColor: '#0052e0',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#0052e0',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
  },
  quoteBubble: {
    backgroundColor: '#f8fafc',
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 14,
    width: '100%',
    marginVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44,
  },
  quoteText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#1e293b',
    textAlign: 'center',
    lineHeight: 18,
  },
  quickStatsRow: {
    flexDirection: 'row',
    gap: 10,
    width: '100%',
    marginBottom: 10,
  },
  quickStatPill: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 14,
    paddingVertical: 8,
    paddingHorizontal: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 3,
    elevation: 1,
  },
  quickStatLabel: {
    fontSize: 9,
    fontWeight: '900',
    color: '#64748b',
    letterSpacing: 0.5,
  },
  quickStatValue: {
    fontSize: 16,
    fontWeight: '900',
    color: '#0f172a',
    marginTop: 2,
  },
  statSub: {
    fontSize: 9,
    fontWeight: '600',
    color: '#059669',
    marginTop: 1,
  },
  cancelSearchBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    width: '100%',
    paddingVertical: 11,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#fca5a5',
    backgroundColor: '#fff1f2',
    marginTop: 4,
  },
  cancelSearchText: {
    color: '#dc2626',
    fontSize: 13,
    fontWeight: '800',
  },
  activeBlock: {
    width: '100%',
  },
  minimizedBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#f8fafc',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  minimizedLeft: {
    flex: 1,
  },
  minimizedRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  minimizedDriverText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0f172a',
  },
  minimizedFare: {
    fontSize: 16,
    fontWeight: '900',
    color: '#0f172a',
  },
  expandCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#cbd5e1',
  },
  activeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  headerRightControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 10,
    borderWidth: 1,
  },
  statusAccepted: {
    backgroundColor: '#ecfdf5',
    borderColor: '#a7f3d0',
  },
  statusInProgress: {
    backgroundColor: '#eff6ff',
    borderColor: '#bfdbfe',
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusDotGreen: {
    backgroundColor: '#10b981',
  },
  statusDotBlue: {
    backgroundColor: '#2563eb',
  },
  statusBadgeText: {
    fontSize: 10,
    fontWeight: '900',
    color: '#0f172a',
    letterSpacing: 0.3,
  },
  farePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f1f5f9',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  fareAmount: {
    fontSize: 14,
    fontWeight: '900',
    color: '#0f172a',
  },
  minimizeBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  driverHeroCard: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 16,
    padding: 12,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  driverHeroLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  driverHeroRight: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  driverAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#f8fafc',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#e2e8f0',
    position: 'relative',
  },
  verifiedDot: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#10b981',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#ffffff',
  },
  driverTextCol: {
    flex: 1,
  },
  captainNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  driverName: {
    fontSize: 15,
    fontWeight: '900',
    color: '#0f172a',
  },
  verifiedBadge: {
    backgroundColor: '#ecfdf5',
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#a7f3d0',
  },
  verifiedBadgeText: {
    fontSize: 8.5,
    fontWeight: '900',
    color: '#059669',
  },
  vehicleModelText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#475569',
    marginTop: 1,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  ratingNumber: {
    fontSize: 12,
    fontWeight: '800',
    color: '#0f172a',
    marginLeft: 3,
  },
  tripsCount: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748b',
    marginLeft: 4,
  },
  plateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderWidth: 1.5,
    borderColor: '#0f172a',
    borderRadius: 6,
    overflow: 'hidden',
  },
  plateLabel: {
    backgroundColor: '#1e3a8a',
    color: '#ffffff',
    fontSize: 8.5,
    fontWeight: '900',
    paddingHorizontal: 4,
    paddingVertical: 2,
  },
  plateNumber: {
    fontSize: 11.5,
    fontWeight: '900',
    color: '#0f172a',
    paddingHorizontal: 6,
    paddingVertical: 2,
    letterSpacing: 0.8,
  },
  liveEtaPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#ecfdf5',
    borderWidth: 1,
    borderColor: '#a7f3d0',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  liveEtaText: {
    fontSize: 10.5,
    fontWeight: '800',
    color: '#047857',
  },
  otpCard: {
    backgroundColor: '#fffbeb',
    borderWidth: 1.5,
    borderColor: '#fde68a',
    borderRadius: 16,
    padding: 12,
    marginBottom: 10,
  },
  otpLeftCol: {
    marginBottom: 8,
  },
  otpTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  otpHeadline: {
    fontSize: 11,
    fontWeight: '900',
    color: '#92400e',
    letterSpacing: 0.5,
  },
  otpSubtitle: {
    fontSize: 10.5,
    fontWeight: '600',
    color: '#b45309',
    marginTop: 2,
  },
  otpDigitsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
    marginBottom: 10,
  },
  otpSingleBox: {
    width: 48,
    height: 52,
    borderRadius: 12,
    backgroundColor: '#ffffff',
    borderWidth: 1.5,
    borderColor: '#f59e0b',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#b45309',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  otpSingleDigit: {
    fontSize: 24,
    fontWeight: '900',
    color: '#78350f',
  },
  startTripBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#059669',
    paddingVertical: 10,
    borderRadius: 12,
    shadowColor: '#059669',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 3,
  },
  startTripBtnText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '900',
  },
  inProgressCard: {
    backgroundColor: '#eff6ff',
    borderWidth: 1,
    borderColor: '#bfdbfe',
    borderRadius: 14,
    padding: 12,
    marginBottom: 10,
  },
  inProgressHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  inProgressLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  inProgressTitle: {
    fontSize: 11,
    fontWeight: '900',
    color: '#1d4ed8',
    letterSpacing: 0.3,
  },
  inProgressSub: {
    fontSize: 10,
    color: '#3b82f6',
    fontWeight: '600',
    marginTop: 1,
  },
  safetyMiniBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#ffffff',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#93c5fd',
  },
  safetyMiniText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#1d4ed8',
  },
  completeRideBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#0052e0',
    paddingVertical: 10,
    borderRadius: 12,
    shadowColor: '#0052e0',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 3,
  },
  completeRideBtnText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '900',
  },
  actionButtonsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 10,
  },
  primaryActionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 14,
    borderWidth: 1.5,
    gap: 8,
  },
  callBtn: {
    backgroundColor: '#f0fdf4',
    borderColor: '#bbf7d0',
  },
  chatBtn: {
    backgroundColor: '#eff6ff',
    borderColor: '#bfdbfe',
  },
  actionIconCircleGreen: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#10b981',
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionIconCircleBlue: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#0052e0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionBtnTitle: {
    fontSize: 12.5,
    fontWeight: '900',
    color: '#0f172a',
  },
  actionBtnSubtitle: {
    fontSize: 9.5,
    fontWeight: '600',
    color: '#64748b',
    marginTop: 1,
  },
  routeCard: {
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 14,
    padding: 12,
    marginBottom: 10,
    width: '100%',
  },
  routeRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  dotGreen: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#10b981',
    marginTop: 3,
    marginRight: 8,
  },
  routeTimelineLine: {
    width: 2,
    height: 16,
    backgroundColor: '#cbd5e1',
    marginLeft: 4,
    marginVertical: 2,
  },
  squareRed: {
    width: 10,
    height: 10,
    borderRadius: 2,
    backgroundColor: '#ef4444',
    marginTop: 3,
    marginRight: 8,
  },
  routeTextCol: {
    flex: 1,
  },
  routeTagPickup: {
    fontSize: 9,
    fontWeight: '900',
    color: '#059669',
    letterSpacing: 0.5,
  },
  routeTagDropoff: {
    fontSize: 9,
    fontWeight: '900',
    color: '#dc2626',
    letterSpacing: 0.5,
  },
  routeAddrText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0f172a',
    marginTop: 2,
  },
  bottomToolsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 2,
  },
  safetyToolBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 10,
  },
  safetyToolText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#0052e0',
  },
  delayCancelBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
    backgroundColor: '#fff1f2',
    borderWidth: 1,
    borderColor: '#fecaca',
  },
  delayCancelText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#dc2626',
  },
});
