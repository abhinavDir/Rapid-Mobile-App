import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Dimensions,
  Animated,
} from 'react-native';
import Icon from '../../Icon';
import {
  BikeGraphic,
  AutoGraphic,
  SharedAutoGraphic,
  CarGraphic,
  CabGraphic,
  SedanGraphic,
  SuvGraphic,
  CategoryPlaceVectorIcon,
  IndiaHeritageDoodleGraphic,
} from '../../SvgIcons';
import { getNearbyRealPlaces } from '../../../services/nearbyPlacesService';
import storage from '../../../utils/storage';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

function ShimmerBar({ style, shimmerAnim }) {
  const opacity = shimmerAnim
    ? shimmerAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [0.35, 0.8],
      })
    : 0.5;

  return (
    <Animated.View
      style={[
        { backgroundColor: '#e2e8f0', borderRadius: 8 },
        style,
        { opacity },
      ]}
    />
  );
}

// TOP VEHICLE GRID (MATCHING REFERENCE SCREENSHOT)
export const TOP_VEHICLES = [
  {
    id: 'shared_auto',
    name: 'Shared Auto',
    render: (w, h) => <SharedAutoGraphic width={w} height={h} />,
    badge: '₹',
  },
  {
    id: 'bike',
    name: 'Bike',
    render: (w, h) => <BikeGraphic width={w} height={h} />,
  },
  {
    id: 'auto',
    name: 'Auto',
    render: (w, h) => <AutoGraphic width={w} height={h} />,
  },
  {
    id: 'cab_economy',
    name: 'Cab Economy',
    render: (w, h) => <CabGraphic width={w} height={h} />,
  },
];

// REALISTIC VECTOR VEHICLE ICONS FOR EXPLORE RIDES (Clean, Colorful, Minimal, No Text/Cards)
// Matches 🏍 (Bike) 🛺 (Auto) 🚗 (Car) 🚕 (Cab) 🚙 (SUV)
export const EXPLORE_VEHICLES = [
  {
    id: 'bike',
    name: 'Bike',
    render: (w, h) => <BikeGraphic width={w} height={h} />,
    renderGraphic: (w, h) => <BikeGraphic width={w} height={h} />,
  },
  {
    id: 'auto',
    name: 'Auto',
    render: (w, h) => <AutoGraphic width={w} height={h} />,
    renderGraphic: (w, h) => <AutoGraphic width={w} height={h} />,
  },
  {
    id: 'car',
    name: 'Car',
    render: (w, h) => <CarGraphic width={w} height={h} color="#ef4444" />,
    renderGraphic: (w, h) => <CarGraphic width={w} height={h} color="#ef4444" />,
  },
  {
    id: 'cab',
    name: 'Cab',
    render: (w, h) => <CabGraphic width={w} height={h} />,
    renderGraphic: (w, h) => <CabGraphic width={w} height={h} />,
  },
  {
    id: 'suv',
    name: 'SUV',
    render: (w, h) => <SuvGraphic width={w} height={h} />,
    renderGraphic: (w, h) => <SuvGraphic width={w} height={h} />,
  },
];

// Backward-compatible alias so no ReferenceError occurs in any cached screen/component
export const VEHICLE_CATEGORIES = EXPLORE_VEHICLES;

export default function LocationStep({
  userCoords,
  ridePickup,
  isPanelExpanded = false,
  headerPanHandlers,
  onOpenSearchModal,
  onClearDropoff,
  onSubmitRoute,
  onScroll,
  onScrollEndDrag,
}) {
  // Instant 0ms cache loading
  const [nearbyPlaces, setNearbyPlaces] = useState(() => {
    try {
      const cached = storage.getItem('@rapidride_cached_explore_places');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {}
    return [];
  });
  const [isLoadingPlaces, setIsLoadingPlaces] = useState(false);
  const shimmerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    let anim;
    if (isLoadingPlaces) {
      anim = Animated.loop(
        Animated.sequence([
          Animated.timing(shimmerAnim, { toValue: 1, duration: 750, useNativeDriver: true }),
          Animated.timing(shimmerAnim, { toValue: 0, duration: 750, useNativeDriver: true }),
        ])
      );
      anim.start();
    }
    return () => {
      if (anim) anim.stop();
    };
  }, [isLoadingPlaces, shimmerAnim]);

  // Fetch ONLY confirmed, real places based on user's actual location (any city)
  useEffect(() => {
    let isMounted = true;
    const loadRealPlaces = async () => {
      const lat = userCoords?.latitude;
      const lng = userCoords?.longitude;
      if (!lat || !lng) return;

      setIsLoadingPlaces(true);
      try {
        const places = await getNearbyRealPlaces(lat, lng);
        if (isMounted && places && places.length > 0) {
          setNearbyPlaces(places);
          try {
            storage.setItem('@rapidride_cached_explore_places', JSON.stringify(places));
          } catch (e) {}
        }
      } catch (err) {
        // preserve cached places
      } finally {
        if (isMounted) setIsLoadingPlaces(false);
      }
    };

    loadRealPlaces();
    return () => {
      isMounted = false;
    };
  }, [userCoords?.latitude, userCoords?.longitude]);

  const handleSelectDestination = (place) => {
    if (onClearDropoff) onClearDropoff();
    const coords = { latitude: place.lat, longitude: place.lng };
    setTimeout(() => {
      onSubmitRoute && onSubmitRoute(ridePickup || 'Current Location', place.name, coords);
    }, 60);
  };

  return (
    <View style={styles.stepRootContainer}>
      {/* 1. TOP STICKY / FIXED SEARCH BAR AREA (WITH DRAG PAN HANDLERS) */}
      <View {...headerPanHandlers} style={styles.searchBarStickyHeader}>
        <TouchableOpacity
          style={styles.searchBoxCard}
          onPress={() => onOpenSearchModal && onOpenSearchModal('dropoff')}
          activeOpacity={0.88}
        >
          <View style={styles.searchBoxLeft}>
            <View style={styles.searchIconBubble}>
              <Icon name="search" size={22} color="#0052e0" />
            </View>
            <View style={styles.searchPromptCol}>
              <Text style={styles.searchPromptTitle}>Where are you going?</Text>
              <Text style={styles.searchPromptSubtitle} numberOfLines={1}>
                Search station, airport, office or home...
              </Text>
            </View>
          </View>
          <View style={styles.searchNowPill}>
            <Icon name="schedule" size={15} color="#0f172a" />
            <Text style={styles.searchNowText}>Now</Text>
            <Icon name="keyboard_arrow_down" size={13} color="#0f172a" />
          </View>
        </TouchableOpacity>
      </View>

      {/* 2. SCROLLABLE STEP CONTENT (EXPLORE RIDES, OFFERS, REAL PLACES, PROMO) */}
      <ScrollView
        style={styles.scrollContainer}
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
        nestedScrollEnabled={true}
        keyboardShouldPersistTaps="handled"
        scrollEnabled={Boolean(isPanelExpanded)}
        overScrollMode="never"
        bounces={false}
        onScroll={onScroll}
        onScrollEndDrag={onScrollEndDrag}
        scrollEventThrottle={16}
      >
        {/* EXPLORE RIDES (PLACED BELOW THE SEARCH BAR) */}
        <View style={styles.exploreRidesBlock}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionHeading}>Explore Rides</Text>
          </View>
          <View style={styles.topVehicleRow}>
            {TOP_VEHICLES.map((v) => (
              <TouchableOpacity
                key={v.id}
                style={styles.topVehicleItem}
                onPress={() => onOpenSearchModal && onOpenSearchModal('dropoff')}
                activeOpacity={0.82}
              >
                <View style={styles.topVehicleCardBox}>
                  {v.render(50, 30)}
                  {v.badge && (
                    <View style={styles.topVehicleBadgePill}>
                      <Text style={styles.topVehicleBadgePillText}>{v.badge}</Text>
                    </View>
                  )}
                </View>
                <Text style={styles.topVehicleCardLabel} numberOfLines={1}>
                  {v.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* 3. SLIM DARK BLUE OFFER BANNER (MATCHING REFERENCE SCREENSHOT) */}
        <TouchableOpacity
          style={styles.slimDarkBanner}
          onPress={() => onOpenSearchModal && onOpenSearchModal('dropoff')}
          activeOpacity={0.92}
        >
          <View style={styles.slimDarkBannerLeft}>
            <View style={styles.radarIconCircle}>
              <Icon name="radar" size={16} color="#60a5fa" />
            </View>
            <View style={styles.slimDarkBannerCol}>
              <Text style={styles.slimDarkBannerTitle}>FIRST AUTO RIDE FREE</Text>
              <Text style={styles.slimDarkBannerSub}>offer has been detected.</Text>
            </View>
          </View>
          <View style={styles.slimDarkBannerCta}>
            <Text style={styles.slimDarkBannerCtaText}>Tap here to apply</Text>
          </View>
        </TouchableOpacity>

      {/* 4. GO PLACES WITH RAPIDRIDE - HORIZONTAL CARDS WITH COLORFUL ICONS */}
      <View style={styles.goPlacesSection}>
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionHeading}>Go Places with RapidRide</Text>
        </View>

        {isLoadingPlaces && nearbyPlaces.length === 0 ? (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.goPlacesScrollContainer}
          >
            {[1, 2, 3, 4].map((k) => (
              <View key={k} style={styles.placeVisualCard}>
                <View style={[styles.placeIconCardWrapper, { backgroundColor: '#f1f5f9' }]}>
                  <ShimmerBar style={{ width: 44, height: 44, borderRadius: 12 }} shimmerAnim={shimmerAnim} />
                </View>
                <ShimmerBar style={{ width: '85%', height: 12, marginTop: 8 }} shimmerAnim={shimmerAnim} />
                <ShimmerBar style={{ width: '60%', height: 10, marginTop: 4 }} shimmerAnim={shimmerAnim} />
              </View>
            ))}
          </ScrollView>
        ) : (
          <>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.goPlacesScrollContainer}
            >
              {(nearbyPlaces.length > 0
                ? nearbyPlaces
                : [
                    { id: '1', name: 'Chaudhary Charan Singh International Airport', category: 'Airport', lat: 26.7606, lng: 80.8893 },
                    { id: '2', name: 'Lucknow Junction', category: 'Railway Station', lat: 26.8320, lng: 80.9180 },
                    { id: '3', name: 'Alambagh Bus Terminal', category: 'Railway Station', lat: 26.8184, lng: 80.9072 },
                    { id: '4', name: 'Hazratganj Shopping Hub', category: 'Mall', lat: 26.8467, lng: 80.9462 },
                    { id: '5', name: 'Janeshwar Mishra Park', category: 'Park', lat: 26.8378, lng: 81.0064 },
                  ]
              ).map((place) => (
                <TouchableOpacity
                  key={place.id}
                  style={styles.placeVisualCard}
                  onPress={() => handleSelectDestination(place)}
                  activeOpacity={0.82}
                >
                  <View style={styles.placeIconCardWrapper}>
                    <CategoryPlaceVectorIcon category={place.category} size={48} />
                    <View style={styles.placeCategoryBadgePill}>
                      <Text style={styles.placeCategoryBadgeText}>{place.category}</Text>
                    </View>
                  </View>
                  <Text style={styles.placeCardName} numberOfLines={2}>
                    {place.name}
                  </Text>
                  {place.distKm && place.distKm < 999 ? (
                    <Text style={styles.placeCardDistText}>{place.distKm} km away</Text>
                  ) : null}
                </TouchableOpacity>
              ))}
            </ScrollView>
            <View style={styles.carouselDashRow}>
              <View style={styles.carouselDashActive} />
              <View style={styles.carouselDashInactive} />
            </View>
          </>
        )}
      </View>

      {/* 5. LARGE PROMO BANNER: Three wheels. Free wheels. (MATCHING REFERENCE SCREENSHOT) */}
      <TouchableOpacity
        style={styles.threeWheelsCard}
        onPress={() => onOpenSearchModal && onOpenSearchModal('dropoff')}
        activeOpacity={0.92}
      >
        <View style={styles.threeWheelsLeft}>
          <Text style={styles.threeWheelsTitle}>Three wheels.{'\n'}Free wheels.</Text>
          <Text style={styles.threeWheelsSub}>
            Use coupon: <Text style={styles.couponBold}>FREERIDE</Text>{'\n'}on first Auto ride.
          </Text>
          <View style={styles.tryAutoPill}>
            <Text style={styles.tryAutoPillText}>Try Our Auto</Text>
          </View>
          <Text style={styles.termsMicroText}>*Users must pay minimum base fare | T&C Apply</Text>
        </View>
        <View style={styles.threeWheelsRight}>
          <View style={styles.firstRideBadgeWrapper}>
            <Text style={styles.firstRideTextSmall}>⚡ FIRST</Text>
            <Text style={styles.firstRideTextSmall}>RIDE</Text>
            <Text style={styles.freeHighlightText}>FREE!</Text>
          </View>
          <View style={styles.threeWheelsAutoGraphic}>
            <AutoGraphic width={94} height={54} />
          </View>
        </View>
      </TouchableOpacity>

      {/* 6. RAPIDRIDE TRUST & VALUE PROPOSITIONS */}
      <View style={styles.trustBanner}>
        <View style={styles.trustItem}>
          <View style={[styles.trustIconCircle, { backgroundColor: '#ecfdf5' }]}>
            <Icon name="verified_user" size={16} color="#059669" />
          </View>
          <Text style={styles.trustTitle}>Verified Captains</Text>
          <Text style={styles.trustSub}>Background checked</Text>
        </View>
        <View style={styles.trustDivider} />
        <View style={styles.trustItem}>
          <View style={[styles.trustIconCircle, { backgroundColor: '#eff6ff' }]}>
            <Icon name="payments" size={16} color="#0052e0" />
          </View>
          <Text style={styles.trustTitle}>Zero Surge on Auto</Text>
          <Text style={styles.trustSub}>Fair pricing always</Text>
        </View>
        <View style={styles.trustDivider} />
        <View style={styles.trustItem}>
          <View style={[styles.trustIconCircle, { backgroundColor: '#fef3c7' }]}>
            <Icon name="security" size={16} color="#d97706" />
          </View>
          <Text style={styles.trustTitle}>Live GPS & SOS</Text>
          <Text style={styles.trustSub}>24x7 Safety shield</Text>
        </View>
      </View>

      {/* 7. #goRapidRide - MADE FOR INDIA BRAND FULL-BLEED BACKGROUND BANNER */}
      <View style={styles.heritageFullCoverBanner}>
        {/* Full-bleed background doodle artwork covering 100% width left-to-right */}
        <View style={styles.heritageGraphicWrapper} pointerEvents="none">
          <IndiaHeritageDoodleGraphic width={SCREEN_WIDTH} height={320} />
        </View>

        {/* Foreground Content Matching Reference Image */}
        <View style={styles.heritageContent}>
          <Text style={styles.brandHashtag}>#goRapidRide</Text>

          <View style={styles.prideRow}>
            <Text style={styles.flagEmoji}>🇮🇳</Text>
            <Text style={styles.prideText}>Made for India</Text>
          </View>

          <View style={styles.prideRow}>
            <Text style={styles.heartEmoji}>❤️</Text>
            <Text style={styles.prideText}>Crafted for Indian Roads</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  </View>
);
}

const styles = StyleSheet.create({
  stepRootContainer: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  searchBarStickyHeader: {
    paddingHorizontal: 16,
    paddingTop: 4,
    paddingBottom: 6,
    backgroundColor: '#ffffff',
  },
  exploreRidesBlock: {
    marginBottom: 14,
  },
  scrollContainer: {
    flex: 1,
  },
  container: {
    paddingHorizontal: 16,
    paddingTop: 4,
    paddingBottom: 110,
    backgroundColor: '#ffffff',
  },

  // SECTION HEADERS
  sectionBlock: {
    marginBottom: 14,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    marginBottom: 10,
    paddingHorizontal: 2,
  },
  sectionHeading: {
    fontSize: 16,
    fontWeight: '900',
    color: '#0f172a',
    letterSpacing: -0.2,
  },
  sectionSubheading: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748b',
  },

  // 1. TOP VEHICLES GRID (MATCHING REFERENCE SCREENSHOT)
  topVehicleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 16,
    paddingHorizontal: 2,
  },
  topVehicleItem: {
    alignItems: 'center',
    width: '23%',
  },
  topVehicleCardBox: {
    width: '100%',
    height: 68,
    borderRadius: 18,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  topVehicleBadgePill: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: '#312e81',
    borderRadius: 6,
    paddingHorizontal: 4,
    paddingVertical: 1,
  },
  topVehicleBadgePillText: {
    fontSize: 8.5,
    fontWeight: '900',
    color: '#a5b4fc',
  },
  topVehicleCardLabel: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#1e293b',
    textAlign: 'center',
    marginTop: 6,
  },

  // 2. SLIM DARK BLUE BANNER (MATCHING REFERENCE SCREENSHOT)
  slimDarkBanner: {
    backgroundColor: '#0a1d37',
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#1e3a5f',
  },
  slimDarkBannerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 10,
  },
  radarIconCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(96, 165, 250, 0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  slimDarkBannerCol: {
    flex: 1,
  },
  slimDarkBannerTitle: {
    fontSize: 13,
    fontWeight: '900',
    color: '#facc15',
    letterSpacing: 0.3,
  },
  slimDarkBannerSub: {
    fontSize: 10.5,
    color: '#cbd5e1',
    marginTop: 1,
  },
  slimDarkBannerCta: {
    backgroundColor: '#ffffff',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 14,
  },
  slimDarkBannerCtaText: {
    fontSize: 10.5,
    fontWeight: '800',
    color: '#0f172a',
  },

  // 2. SEARCH BOX
  searchBoxCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f8fafc',
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 18,
    marginBottom: 2,
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  searchBoxLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  searchIconBubble: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#eff6ff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchPromptCol: {
    flex: 1,
  },
  searchPromptTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0f172a',
  },
  searchPromptSubtitle: {
    fontSize: 11.5,
    color: '#64748b',
    marginTop: 1,
  },
  searchNowPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#ffffff',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  searchNowText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#0f172a',
  },

  // 3. QUICK CHIPS
  quickChipsContainer: {
    gap: 8,
    paddingVertical: 2,
    paddingBottom: 14,
  },
  quickChipButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#ffffff',
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  quickChipIconBox: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#eff6ff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickChipLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1e293b',
  },

  // 4. PROMOTIONAL BANNER
  promoBanner: {
    backgroundColor: '#0a192f',
    borderRadius: 20,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 18,
    overflow: 'hidden',
    shadowColor: '#0a192f',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 5,
  },
  promoLeftCol: {
    flex: 1,
    paddingRight: 10,
  },
  promoBrandBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 10,
    marginBottom: 6,
  },
  promoBrandDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: '#10b981',
  },
  promoBrandBadgeText: {
    fontSize: 9,
    fontWeight: '900',
    color: '#93c5fd',
    letterSpacing: 0.6,
  },
  promoMainTitle: {
    fontSize: 17,
    fontWeight: '900',
    color: '#ffffff',
    letterSpacing: 0.3,
  },
  promoSubText: {
    fontSize: 11.5,
    color: '#cbd5e1',
    marginTop: 3,
    lineHeight: 16,
    marginBottom: 10,
  },
  promoCtaBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#ffffff',
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  promoCtaBtnText: {
    fontSize: 11.5,
    fontWeight: '900',
    color: '#0052e0',
  },
  promoRightCol: {
    width: 94,
    height: 85,
    borderRadius: 14,
    position: 'relative',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  promoVehicleGraphicBox: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  promoDiscountTag: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: '#10b981',
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 6,
  },
  promoDiscountTagText: {
    fontSize: 8.5,
    fontWeight: '900',
    color: '#ffffff',
  },

  // 4. GO PLACES WITH RAPIDRIDE (HORIZONTAL CARDS WITH VECTOR ICONS)
  goPlacesSection: {
    marginBottom: 20,
    marginTop: 6,
  },
  goPlacesScrollContainer: {
    paddingVertical: 4,
    paddingRight: 10,
  },
  placeVisualCard: {
    width: 156,
    marginRight: 14,
  },
  placeIconCardWrapper: {
    width: 156,
    height: 98,
    borderRadius: 18,
    backgroundColor: '#f8fafc',
    borderWidth: 1.2,
    borderColor: '#e2e8f0',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  placeCategoryBadgePill: {
    position: 'absolute',
    top: 6,
    left: 6,
    backgroundColor: 'rgba(15, 23, 42, 0.72)',
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 1.5,
  },
  placeCategoryBadgeText: {
    fontSize: 8.5,
    fontWeight: '700',
    color: '#ffffff',
  },
  placeCardName: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#0f172a',
    marginTop: 6,
    lineHeight: 16,
  },
  placeCardDistText: {
    fontSize: 10.5,
    fontWeight: '600',
    color: '#0052e0',
    marginTop: 2,
  },
  carouselDashRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
    gap: 6,
  },
  carouselDashActive: {
    width: 24,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#334155',
  },
  carouselDashInactive: {
    width: 6,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#cbd5e1',
  },

  // 5. LARGE PROMO BANNER (Three wheels. Free wheels.)
  threeWheelsCard: {
    backgroundColor: '#fffdf5',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1.5,
    borderColor: '#fef08a',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 18,
    shadowColor: '#ca8a04',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  threeWheelsLeft: {
    flex: 1,
    paddingRight: 8,
  },
  threeWheelsTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#0f172a',
    lineHeight: 22,
  },
  threeWheelsSub: {
    fontSize: 11,
    color: '#475569',
    marginTop: 6,
    lineHeight: 15,
  },
  couponBold: {
    fontWeight: '900',
    color: '#0f172a',
  },
  tryAutoPill: {
    backgroundColor: '#fef3c7',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 10,
    alignSelf: 'flex-start',
    marginTop: 8,
    borderWidth: 0.8,
    borderColor: '#fde047',
  },
  tryAutoPillText: {
    fontSize: 10.5,
    fontWeight: '800',
    color: '#854d0e',
  },
  termsMicroText: {
    fontSize: 7.5,
    color: '#94a3b8',
    marginTop: 6,
  },
  threeWheelsRight: {
    width: 108,
    alignItems: 'center',
    justifyContent: 'center',
  },
  firstRideBadgeWrapper: {
    alignItems: 'center',
    marginBottom: 4,
  },
  firstRideTextSmall: {
    fontSize: 13.5,
    fontWeight: '900',
    color: '#1d4ed8',
    lineHeight: 16,
    fontStyle: 'italic',
  },
  freeHighlightText: {
    fontSize: 18,
    fontWeight: '900',
    color: '#eab308',
    letterSpacing: 0.5,
  },
  threeWheelsAutoGraphic: {
    alignItems: 'center',
    justifyContent: 'center',
  },

  // 6. TRUST BANNER
  trustBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f8fafc',
    borderRadius: 18,
    paddingVertical: 14,
    paddingHorizontal: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginTop: 4,
  },
  trustItem: {
    flex: 1,
    alignItems: 'center',
  },
  trustIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  trustTitle: {
    fontSize: 10.5,
    fontWeight: '800',
    color: '#0f172a',
    textAlign: 'center',
  },
  trustSub: {
    fontSize: 9,
    color: '#64748b',
    textAlign: 'center',
    marginTop: 1,
  },
  trustDivider: {
    width: 1,
    height: 36,
    backgroundColor: '#e2e8f0',
  },

  // 7. #goRapidRide BRAND SECTION (FULL-BLEED BACKGROUND DOODLE - 100% SCREEN COVERAGE)
  heritageFullCoverBanner: {
    position: 'relative',
    marginHorizontal: -16, // Bleeds to the left and right device edges
    width: SCREEN_WIDTH,
    minHeight: 310,
    backgroundColor: '#ffffff',
    justifyContent: 'flex-end',
    paddingBottom: 28,
    paddingHorizontal: 20,
    marginTop: 18,
    marginBottom: 10,
    overflow: 'hidden',
  },
  heritageGraphicWrapper: {
    ...StyleSheet.absoluteFillObject,
    width: SCREEN_WIDTH,
    height: 320,
  },
  heritageContent: {
    zIndex: 2,
  },
  brandHashtag: {
    fontSize: 44,
    fontWeight: '900',
    color: '#94a3b8',
    letterSpacing: -1.4,
    fontStyle: 'italic',
    marginBottom: 10,
  },
  prideRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 5,
  },
  flagEmoji: {
    fontSize: 18,
  },
  heartEmoji: {
    fontSize: 16,
  },
  prideText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#64748b',
    letterSpacing: 0.1,
  },
});
