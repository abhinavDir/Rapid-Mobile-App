import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Pressable,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  Modal,
  Platform,
  StatusBar,
  Animated,
  Dimensions,
} from 'react-native';
import Icon from '../../Icon';
import storage from '../../../utils/storage';
import {
  RealisticRideIcon,
  RealisticFoodIcon,
  RealisticGroceryIcon,
  RealisticReserveIcon,
  RealisticHourlyIcon,
  RealisticRentIcon,
  RealisticPackageIcon,
  RealisticCompassIcon,
  RealisticElectricCar,
  CategoryPlaceVectorIcon,
} from '../../SvgIcons';
import { getNearbyRealPlaces, calculateDistanceKm } from '../../../services/nearbyPlacesService';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

function ShimmerBar({ style, shimmerAnim }) {
  const opacity = shimmerAnim
    ? shimmerAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [0.35, 0.85],
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

export default function UserExplore({ user, onNavigate, onLogout, addToast = () => {} }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [scheduleOption, setScheduleOption] = useState('Now');
  const [showScheduleDropdown, setShowScheduleDropdown] = useState(false);
  const [activeModal, setActiveModal] = useState(null); // 'food' | 'grocery' | 'reserve' | 'hourly' | 'intercity' | 'package' | 'cityguide'
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [userCoords, setUserCoords] = useState({ latitude: 26.8467, longitude: 80.9462 });

  // Instant 0ms cache initialization
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

  // Comprehensive Curated Lucknow & Nearby Key Destinations
  const DEFAULT_PLACES = [
    {
      id: 'dest-1',
      name: 'Ekana International Stadium',
      address: 'Amar Shaheed Path, Gomti Nagar Extension, Lucknow',
      coords: { latitude: 26.7997, longitude: 81.0152 },
      category: 'Landmark',
      badge: 'Cricket Hub',
    },
    {
      id: 'dest-2',
      name: 'Chaudhary Charan Singh Airport (LKO)',
      address: 'Amausi, VIP Road, Lucknow',
      coords: { latitude: 26.7606, longitude: 80.8893 },
      category: 'Airport',
      badge: 'Terminal 3',
    },
    {
      id: 'dest-3',
      name: 'Charbagh Central Railway Station',
      address: 'Station Road, Railway Colony, Charbagh, Lucknow',
      coords: { latitude: 26.8317, longitude: 80.9234 },
      category: 'Railway Station',
      badge: 'Central Junction',
    },
    {
      id: 'dest-4',
      name: 'Phoenix Palassio Mega Mall',
      address: 'Sector 7, Amar Shaheed Path, Gomti Nagar Extension',
      coords: { latitude: 26.8048, longitude: 81.0189 },
      category: 'Mall',
      badge: 'Top Shopping',
    },
    {
      id: 'dest-5',
      name: 'Dr. Ram Manohar Lohia Hospital',
      address: 'Vibhuti Khand, Gomti Nagar, Lucknow',
      coords: { latitude: 26.8624, longitude: 81.0018 },
      category: 'Hospital',
      badge: 'Emergency 24x7',
    },
    {
      id: 'dest-6',
      name: 'Janeshwar Mishra Eco Park',
      address: 'Gomti Nagar Extension, Lucknow',
      coords: { latitude: 26.8385, longitude: 81.0022 },
      category: 'Park',
      badge: 'Asia Largest Park',
    },
    {
      id: 'dest-7',
      name: 'Bara Imambara & Rumi Darwaza',
      address: 'Machchhi Bhavan, Husainabad, Lucknow',
      coords: { latitude: 26.8690, longitude: 80.9131 },
      category: 'Landmark',
      badge: 'Heritage Monument',
    },
    {
      id: 'dest-8',
      name: 'Hazratganj Main Market',
      address: 'MG Marg, Hazratganj, Lucknow',
      coords: { latitude: 26.8467, longitude: 80.9462 },
      category: 'Market',
      badge: 'City Center',
    },
  ];

  // Fetch real nearby places on mount
  useEffect(() => {
    let isMounted = true;

    const detectAndFetchPlaces = async () => {
      setIsLoadingPlaces(true);
      let lat = userCoords.latitude;
      let lng = userCoords.longitude;

      try {
        const geo = navigator.geolocation || (typeof global !== 'undefined' && global.navigator?.geolocation);
        if (geo && geo.getCurrentPosition) {
          await new Promise((resolve) => {
            geo.getCurrentPosition(
              (pos) => {
                if (pos?.coords) {
                  lat = pos.coords.latitude;
                  lng = pos.coords.longitude;
                  if (isMounted) setUserCoords({ latitude: lat, longitude: lng });
                }
                resolve();
              },
              () => resolve(),
              { enableHighAccuracy: false, timeout: 4000, maximumAge: 60000 }
            );
          });
        }
      } catch (err) {}

      try {
        const places = await getNearbyRealPlaces(lat, lng);
        if (isMounted) {
          if (places && places.length > 0) {
            setNearbyPlaces(places);
            try {
              storage.setItem('@rapidride_cached_explore_places', JSON.stringify(places));
            } catch (err) {}
          } else {
            setNearbyPlaces(DEFAULT_PLACES);
          }
        }
      } catch (e) {
        if (isMounted) setNearbyPlaces(DEFAULT_PLACES);
      } finally {
        if (isMounted) setIsLoadingPlaces(false);
      }
    };

    detectAndFetchPlaces();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleSelectDestination = (dest) => {
    if (onNavigate) {
      onNavigate('home', {
        presetDropoff: `${dest.name}, ${dest.address || ''}`,
        dropoffCoords: dest.coords,
      });
    }
  };

  const handleRequestEV = () => {
    if (onNavigate) {
      onNavigate('home', {
        preferredVehicle: 'Car',
        isEcoEV: true,
      });
      addToast('Green EV Ride Mode Activated! ⚡ Flat ₹50 OFF', 'success');
    }
  };

  const handleSearchSubmit = () => {
    if (!searchQuery.trim()) return;
    if (onNavigate) {
      onNavigate('home', {
        presetDropoff: searchQuery.trim(),
      });
    }
  };

  // 8 Services with realistic SVG graphics & modern tags
  const SERVICES = [
    {
      id: 'ride',
      title: 'Daily Ride',
      desc: 'Bike, Auto & Cabs',
      tag: 'FASTEST',
      tagBg: '#ecfdf5',
      tagColor: '#059669',
      icon: <RealisticRideIcon width={48} height={48} />,
      onPress: () => onNavigate && onNavigate('home', { preferredVehicle: 'Bike' }),
    },
    {
      id: 'reserve',
      title: 'Reserve Ahead',
      desc: 'Schedule 30 Days Early',
      tag: 'NO WAIT',
      tagBg: '#f5f3ff',
      tagColor: '#7c3aed',
      icon: <RealisticReserveIcon width={48} height={48} />,
      onPress: () => setActiveModal('reserve'),
    },
    {
      id: 'hourly',
      title: 'Hourly Rentals',
      desc: 'Multi-stop Hourly Cab',
      tag: 'FLEXIBLE',
      tagBg: '#eff6ff',
      tagColor: '#2563eb',
      icon: <RealisticHourlyIcon width={48} height={48} />,
      onPress: () => setActiveModal('hourly'),
    },
    {
      id: 'intercity',
      title: 'Intercity',
      desc: 'Outstation One-Way & Round',
      tag: 'HIGHWAY',
      tagBg: '#fffbeb',
      tagColor: '#d97706',
      icon: <RealisticRentIcon width={48} height={48} />,
      onPress: () => setActiveModal('intercity'),
    },
    {
      id: 'food',
      title: 'RapidFood',
      desc: 'Hot Meals in 30 Mins',
      tag: 'HOT MEALS',
      tagBg: '#fff7ed',
      tagColor: '#ea580c',
      icon: <RealisticFoodIcon width={48} height={48} />,
      onPress: () => setActiveModal('food'),
    },
    {
      id: 'grocery',
      title: 'RapidMart',
      desc: '10-Min Groceries',
      tag: '10 MINS',
      tagBg: '#f0fdf4',
      tagColor: '#16a34a',
      icon: <RealisticGroceryIcon width={48} height={48} />,
      onPress: () => setActiveModal('grocery'),
    },
    {
      id: 'package',
      title: 'Parcel Send',
      desc: 'Doorstep Courier Pickup',
      tag: 'SAFE OTP',
      tagBg: '#eef2ff',
      tagColor: '#4f46e5',
      icon: <RealisticPackageIcon width={48} height={48} />,
      onPress: () => setActiveModal('package'),
    },
    {
      id: 'tourist',
      title: 'City Guide',
      desc: 'Monuments & Sightseeing',
      tag: 'HERITAGE',
      tagBg: '#ecfeff',
      tagColor: '#0891b2',
      icon: <RealisticCompassIcon width={48} height={48} />,
      onPress: () => {
        setSelectedCategory('Landmarks');
        addToast('Showing Lucknow Heritage & Sightseeing spots below!', 'info');
      },
    },
  ];

  const QUICK_SEARCH_CHIPS = [
    { label: '✈️ Airport', query: 'Chaudhary Charan Singh Airport' },
    { label: '🚆 Railway Station', query: 'Charbagh Railway Station' },
    { label: '🛍️ Phoenix Palassio', query: 'Phoenix Palassio Mall' },
    { label: '🏥 Lohia Hospital', query: 'Dr Ram Manohar Lohia Hospital' },
    { label: '⚡ Eco EV Cab', query: 'EV' },
  ];

  const CATEGORY_TABS = ['All', 'Transit', 'Landmarks', 'Shopping', 'Hospitals', 'Parks'];

  // Filter places based on selected category & search input
  const displayedPlaces = (nearbyPlaces.length > 0 ? nearbyPlaces : DEFAULT_PLACES).filter((p) => {
    const matchCategory =
      selectedCategory === 'All' ||
      (selectedCategory === 'Transit' && ['Airport', 'Railway Station', 'Metro', 'Bus', 'Transit'].includes(p.category)) ||
      (selectedCategory === 'Landmarks' && ['Landmark', 'Heritage', 'Monument', 'Hub'].includes(p.category)) ||
      (selectedCategory === 'Shopping' && ['Mall', 'Market'].includes(p.category)) ||
      (selectedCategory === 'Hospitals' && ['Hospital', 'Clinic'].includes(p.category)) ||
      (selectedCategory === 'Parks' && ['Park', 'Garden'].includes(p.category)) ||
      p.category?.toLowerCase() === selectedCategory.toLowerCase();

    const matchQuery =
      !searchQuery.trim() ||
      p.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.address?.toLowerCase().includes(searchQuery.toLowerCase());

    return matchCategory && matchQuery;
  });

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />

      {/* 1. TOP HEADER APP BAR */}
      <View style={styles.topHeaderBar}>
        <View style={styles.headerBrandCol}>
          <View style={styles.brandBadgeRow}>
            <View style={styles.brandIconDot} />
            <Text style={styles.brandNameText}>RAPIDRIDE EXPLORE</Text>
          </View>
          <Text style={styles.headerMainTitle}>Where would you like to go?</Text>
        </View>

        <TouchableOpacity
          style={styles.profileAvatarBtn}
          onPress={() => onNavigate && onNavigate('profile')}
          activeOpacity={0.8}
        >
          <Icon name="person" size={20} color="#0052e0" />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.mainScroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* 2. STANDARD SEARCH HUB WITH SCHEDULE SELECTOR */}
        <View style={styles.searchHeroBox}>
          <View style={styles.searchBarRow}>
            <View style={styles.searchGlassInput}>
              <Icon name="search" size={20} color="#0052e0" style={{ marginRight: 8 }} />
              <TextInput
                style={styles.searchInput}
                placeholder="Search station, mall, airport or street..."
                placeholderTextColor="#94a3b8"
                value={searchQuery}
                onChangeText={setSearchQuery}
                onSubmitEditing={handleSearchSubmit}
                returnKeyType="search"
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity onPress={() => setSearchQuery('')} hitSlop={8} style={{ paddingRight: 4 }}>
                  <Icon name="close" size={16} color="#94a3b8" />
                </TouchableOpacity>
              )}
            </View>

            {/* Schedule Selector Pill */}
            <TouchableOpacity
              style={styles.scheduleSelectorPill}
              onPress={() => setShowScheduleDropdown(!showScheduleDropdown)}
              activeOpacity={0.8}
            >
              <Icon name="schedule" size={14} color="#0052e0" />
              <Text style={styles.scheduleSelectorText}>{scheduleOption}</Text>
              <Icon name="expand_more" size={14} color="#64748b" />
            </TouchableOpacity>
          </View>

          {/* Schedule Dropdown Menu */}
          {showScheduleDropdown && (
            <View style={styles.scheduleDropdownMenu}>
              {['Now', 'In 15 min', 'In 30 min'].map((opt) => (
                <TouchableOpacity
                  key={opt}
                  style={styles.scheduleDropdownItem}
                  onPress={() => {
                    setScheduleOption(opt);
                    setShowScheduleDropdown(false);
                    addToast(`Pickup scheduled for ${opt}`, 'info');
                  }}
                >
                  <Icon name="schedule" size={14} color="#0052e0" style={{ marginRight: 8 }} />
                  <Text style={styles.scheduleDropdownText}>{opt}</Text>
                </TouchableOpacity>
              ))}
              <TouchableOpacity
                style={styles.scheduleDropdownItem}
                onPress={() => {
                  setShowScheduleDropdown(false);
                  setActiveModal('reserve');
                }}
              >
                <Icon name="calendar_month" size={14} color="#7c3aed" style={{ marginRight: 8 }} />
                <Text style={styles.scheduleDropdownText}>Schedule for Later...</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Quick Search Tag Chips */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.quickTagsScroll}
          >
            {QUICK_SEARCH_CHIPS.map((chip, idx) => (
              <TouchableOpacity
                key={idx}
                style={styles.quickTagChip}
                onPress={() => {
                  if (chip.query === 'EV') {
                    handleRequestEV();
                  } else {
                    setSearchQuery(chip.query);
                    if (onNavigate) {
                      onNavigate('home', { presetDropoff: chip.query });
                    }
                  }
                }}
                activeOpacity={0.75}
              >
                <Text style={styles.quickTagText}>{chip.label}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* 3. FEATURED MOBILITY SPOTLIGHT HERO (EV & SPECIALS) */}
        <TouchableOpacity
          style={styles.spotlightHeroCard}
          onPress={handleRequestEV}
          activeOpacity={0.92}
        >
          <View style={styles.spotlightLeft}>
            <View style={styles.spotlightBadgeRow}>
              <View style={styles.spotlightPillGreen}>
                <Icon name="electric_bolt" size={12} color="#ffffff" />
                <Text style={styles.spotlightPillGreenText}>100% ECO FLEET</Text>
              </View>
              <View style={styles.spotlightDiscountBadge}>
                <Text style={styles.spotlightDiscountText}>FLAT ₹50 OFF</Text>
              </View>
            </View>

            <Text style={styles.spotlightTitle}>Electrify Your City Ride</Text>
            <Text style={styles.spotlightSub}>
              Zero emissions • Whisper quiet • AC Fleet
            </Text>

            <View style={styles.spotlightActionBtn}>
              <Text style={styles.spotlightActionText}>Request Green EV</Text>
              <Icon name="arrow_forward" size={13} color="#ffffff" style={{ marginLeft: 4 }} />
            </View>
          </View>

          <View style={styles.spotlightGraphicBox}>
            <RealisticElectricCar width={110} height={56} />
          </View>
        </TouchableOpacity>

        {/* 4. MODULAR SERVICES GRID (8 TILES) */}
        <View style={styles.sectionHeaderWrap}>
          <View>
            <Text style={styles.sectionMainTitle}>RapidRide Services</Text>
            <Text style={styles.sectionSubTitle}>Everything you need to move, eat & send</Text>
          </View>
        </View>

        <View style={styles.servicesGridContainer}>
          {SERVICES.map((srv) => (
            <TouchableOpacity
              key={srv.id}
              style={styles.serviceTileCard}
              onPress={srv.onPress}
              activeOpacity={0.82}
            >
              {/* Top Tag */}
              <View style={[styles.serviceTagPill, { backgroundColor: srv.tagBg }]}>
                <Text style={[styles.serviceTagText, { color: srv.tagColor }]}>
                  {srv.tag}
                </Text>
              </View>

              {/* Realistic Icon Graphic */}
              <View style={styles.serviceGraphicBox}>
                {srv.icon}
              </View>

              <Text style={styles.serviceTileTitle} numberOfLines={1}>
                {srv.title}
              </Text>
              <Text style={styles.serviceTileDesc} numberOfLines={1}>
                {srv.desc}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* 5. TRENDING OFFERS & COMMUTE PASSES CAROUSEL */}
        <View style={styles.passesSectionWrap}>
          <View style={styles.sectionHeaderWrap}>
            <View>
              <Text style={styles.sectionMainTitle}>Commute Passes & Highlights</Text>
              <Text style={styles.sectionSubTitle}>Save more with curated travel vouchers</Text>
            </View>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.passesScrollContent}
          >
            {/* Pass Card 1 */}
            <TouchableOpacity
              style={[styles.passHighlightCard, { backgroundColor: '#0052e0' }]}
              onPress={() => addToast('RapidCommute Pass 20% Discount applied to your account!', 'success')}
              activeOpacity={0.88}
            >
              <View style={styles.passBadge}>
                <Text style={styles.passBadgeText}>POPULAR PASS</Text>
              </View>
              <Text style={styles.passCardTitle}>Rapid Commute Pass</Text>
              <Text style={styles.passCardSub}>Flat 20% OFF on next 10 rides across any vehicle category.</Text>
              <View style={styles.passCardBtnWhite}>
                <Text style={styles.passCardBtnWhiteText}>Claim Pass • ₹99</Text>
              </View>
            </TouchableOpacity>

            {/* Pass Card 2 */}
            <TouchableOpacity
              style={[styles.passHighlightCard, { backgroundColor: '#059669' }]}
              onPress={() => setActiveModal('grocery')}
              activeOpacity={0.88}
            >
              <View style={[styles.passBadge, { backgroundColor: '#047857' }]}>
                <Text style={styles.passBadgeText}>10-MIN EXPRESS</Text>
              </View>
              <Text style={styles.passCardTitle}>RapidMart Essentials</Text>
              <Text style={styles.passCardSub}>Fresh fruits, dairy & snacks delivered to your doorstep in 10 mins.</Text>
              <View style={styles.passCardBtnWhite}>
                <Text style={[styles.passCardBtnWhiteText, { color: '#059669' }]}>Order Groceries</Text>
              </View>
            </TouchableOpacity>

            {/* Pass Card 3 */}
            <TouchableOpacity
              style={[styles.passHighlightCard, { backgroundColor: '#7c3aed' }]}
              onPress={() => setActiveModal('reserve')}
              activeOpacity={0.88}
            >
              <View style={[styles.passBadge, { backgroundColor: '#6d28d9' }]}>
                <Text style={styles.passBadgeText}>AIRPORT READY</Text>
              </View>
              <Text style={styles.passCardTitle}>Airport Express Cab</Text>
              <Text style={styles.passCardSub}>Zero wait-time cab guaranteed with free flight delay insurance.</Text>
              <View style={styles.passCardBtnWhite}>
                <Text style={[styles.passCardBtnWhiteText, { color: '#7c3aed' }]}>Reserve Airport Cab</Text>
              </View>
            </TouchableOpacity>
          </ScrollView>
        </View>

        {/* 6. DISCOVER REAL DESTINATIONS (NEARBY & POPULAR) */}
        <View style={styles.destinationsSectionWrap}>
          <View style={styles.destinationsHeaderLine}>
            <View>
              <Text style={styles.sectionMainTitle}>Go Places with RapidRide</Text>
              <Text style={styles.sectionSubTitle}>Confirmed real-world places near your location</Text>
            </View>
          </View>

          {/* Category Filter Tabs */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoryPillsScroll}
          >
            {CATEGORY_TABS.map((tab) => {
              const isSelected = selectedCategory === tab;
              return (
                <TouchableOpacity
                  key={tab}
                  style={[styles.categoryPill, isSelected && styles.categoryPillActive]}
                  onPress={() => setSelectedCategory(tab)}
                  activeOpacity={0.75}
                >
                  <Text style={[styles.categoryPillText, isSelected && styles.categoryPillTextActive]}>
                    {tab}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* Destinations List OR Shimmer Skeleton */}
          <View style={styles.destinationsListWrap}>
            {isLoadingPlaces && nearbyPlaces.length === 0 ? (
              [1, 2, 3, 4].map((k) => (
                <View key={`skel-dest-${k}`} style={styles.destinationRowCard}>
                  <View style={[styles.destIconBox, { backgroundColor: '#f1f5f9' }]}>
                    <ShimmerBar
                      style={{ width: 28, height: 28, borderRadius: 8 }}
                      shimmerAnim={shimmerAnim}
                    />
                  </View>
                  <View style={styles.destInfoBlock}>
                    <View style={styles.destTitleRow}>
                      <ShimmerBar
                        style={{ width: '60%', height: 16, borderRadius: 6 }}
                        shimmerAnim={shimmerAnim}
                      />
                      <ShimmerBar
                        style={{ width: 48, height: 18, borderRadius: 10 }}
                        shimmerAnim={shimmerAnim}
                      />
                    </View>
                    <ShimmerBar
                      style={{ width: '85%', height: 12, borderRadius: 4, marginTop: 8 }}
                      shimmerAnim={shimmerAnim}
                    />
                    <View style={[styles.destFooterRow, { marginTop: 12 }]}>
                      <ShimmerBar
                        style={{ width: 75, height: 14, borderRadius: 6 }}
                        shimmerAnim={shimmerAnim}
                      />
                      <ShimmerBar
                        style={{ width: 70, height: 16, borderRadius: 6 }}
                        shimmerAnim={shimmerAnim}
                      />
                    </View>
                  </View>
                </View>
              ))
            ) : (
              displayedPlaces.map((dest, idx) => {
                const dist = dest.distanceKm || calculateDistanceKm(
                  userCoords.latitude,
                  userCoords.longitude,
                  dest.coords?.latitude,
                  dest.coords?.longitude
                );
                const etaMins = dist ? Math.max(3, Math.round(dist * 3)) : 8;

                return (
                  <TouchableOpacity
                    key={dest.id || `place-${idx}`}
                    style={styles.destinationRowCard}
                    onPress={() => handleSelectDestination(dest)}
                    activeOpacity={0.82}
                  >
                    <View style={styles.destIconBox}>
                      <CategoryPlaceVectorIcon category={dest.category} size={28} />
                    </View>

                    <View style={styles.destInfoBlock}>
                      <View style={styles.destTitleRow}>
                        <Text style={styles.destNameText} numberOfLines={1}>
                          {dest.name}
                        </Text>
                        {dist && (
                          <View style={styles.destDistPill}>
                            <Text style={styles.destDistText}>{dist} km</Text>
                          </View>
                        )}
                      </View>

                      <Text style={styles.destAddressText} numberOfLines={1}>
                        {dest.address || dest.category || 'Popular Destination'}
                      </Text>

                      <View style={styles.destFooterRow}>
                        <View style={styles.destEtaBadge}>
                          <Icon name="schedule" size={12} color="#0052e0" />
                          <Text style={styles.destEtaText}>{etaMins} mins away</Text>
                        </View>
                        <View style={styles.rideHereActionPill}>
                          <Text style={styles.rideHereActionText}>Ride Here</Text>
                          <Icon name="arrow_forward" size={12} color="#0052e0" />
                        </View>
                      </View>
                    </View>
                  </TouchableOpacity>
                );
              })
            )}
          </View>
        </View>
      </ScrollView>

      {/* 7. INTERACTIVE SERVICE MODALS */}

      {/* RESERVE CAB MODAL */}
      <Modal visible={activeModal === 'reserve'} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHeader}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Icon name="calendar_month" size={22} color="#7c3aed" />
                <Text style={styles.modalTitle}>Reserve a Ride in Advance</Text>
              </View>
              <Pressable onPress={() => setActiveModal(null)} hitSlop={8} style={styles.modalCloseCircle}>
                <Icon name="close" size={18} color="#64748b" />
              </Pressable>
            </View>

            <Text style={styles.modalSubText}>
              Lock your fare with guaranteed on-time pickup up to 30 days in advance.
            </Text>

            <View style={styles.modalCardFeatureBox}>
              <View style={styles.modalFeatureRow}>
                <Icon name="check_circle" size={16} color="#059669" />
                <Text style={styles.modalFeatureLabel}>Zero wait-time driver assignment</Text>
              </View>
              <View style={styles.modalFeatureRow}>
                <Icon name="check_circle" size={16} color="#059669" />
                <Text style={styles.modalFeatureLabel}>Complimentary 15-min wait time included</Text>
              </View>
              <View style={styles.modalFeatureRow}>
                <Icon name="check_circle" size={16} color="#059669" />
                <Text style={styles.modalFeatureLabel}>Free cancellation up to 60 mins before pickup</Text>
              </View>
            </View>

            <TouchableOpacity
              style={[styles.modalPrimaryBtn, { backgroundColor: '#7c3aed' }]}
              onPress={() => {
                setActiveModal(null);
                if (onNavigate) onNavigate('home');
                addToast('Select your destination to schedule your reserved ride.', 'info');
              }}
              activeOpacity={0.88}
            >
              <Text style={styles.modalPrimaryBtnText}>Choose Pickup & Dropoff</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* HOURLY RENTAL MODAL */}
      <Modal visible={activeModal === 'hourly'} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHeader}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Icon name="timer" size={22} color="#0052e0" />
                <Text style={styles.modalTitle}>RapidRentals • Hourly Cabs</Text>
              </View>
              <Pressable onPress={() => setActiveModal(null)} hitSlop={8} style={styles.modalCloseCircle}>
                <Icon name="close" size={18} color="#64748b" />
              </Pressable>
            </View>

            <Text style={styles.modalSubText}>
              Keep one cab with you for multiple stops, business meetings, or city shopping.
            </Text>

            <View style={{ gap: 10, marginVertical: 12 }}>
              {[
                { time: '2 Hours • 20 km', price: '₹399', desc: 'Ideal for quick errands & doctor visits' },
                { time: '4 Hours • 40 km', price: '₹749', desc: 'Perfect for business meetings & shopping' },
                { time: '8 Hours • 80 km', price: '₹1,399', desc: 'Full-day city sightseeing & events' },
              ].map((pkg, idx) => (
                <TouchableOpacity
                  key={idx}
                  style={styles.packageCard}
                  onPress={() => {
                    setActiveModal(null);
                    if (onNavigate) onNavigate('home');
                    addToast(`Selected ${pkg.time} Rental Package!`, 'success');
                  }}
                  activeOpacity={0.82}
                >
                  <View style={{ flex: 1 }}>
                    <Text style={styles.packageTitle}>{pkg.time}</Text>
                    <Text style={styles.packageSub}>{pkg.desc}</Text>
                  </View>
                  <View style={styles.packagePricePill}>
                    <Text style={styles.packagePriceText}>{pkg.price}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      </Modal>

      {/* INTERCITY MODAL */}
      <Modal visible={activeModal === 'intercity'} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHeader}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Icon name="alt_route" size={22} color="#d97706" />
                <Text style={styles.modalTitle}>Intercity Outstation Cabs</Text>
              </View>
              <Pressable onPress={() => setActiveModal(null)} hitSlop={8} style={styles.modalCloseCircle}>
                <Icon name="close" size={18} color="#64748b" />
              </Pressable>
            </View>

            <Text style={styles.modalSubText}>
              Highway verified Captains with toll inclusive pricing & comfortable AC cabs.
            </Text>

            <View style={{ gap: 10, marginVertical: 10 }}>
              {[
                { route: 'Lucknow ➔ Kanpur', dist: '82 km • 1.5 hrs', fare: '₹1,249' },
                { route: 'Lucknow ➔ Ayodhya', dist: '135 km • 2.5 hrs', fare: '₹1,899' },
                { route: 'Lucknow ➔ Prayagraj', dist: '200 km • 3.5 hrs', fare: '₹2,699' },
              ].map((item, idx) => (
                <TouchableOpacity
                  key={idx}
                  style={styles.packageCard}
                  onPress={() => {
                    setActiveModal(null);
                    if (onNavigate) onNavigate('home', { presetDropoff: item.route.split('➔')[1]?.trim() });
                    addToast(`Selected ${item.route}!`, 'info');
                  }}
                  activeOpacity={0.82}
                >
                  <View style={{ flex: 1 }}>
                    <Text style={styles.packageTitle}>{item.route}</Text>
                    <Text style={styles.packageSub}>{item.dist}</Text>
                  </View>
                  <View style={[styles.packagePricePill, { backgroundColor: '#fef3c7' }]}>
                    <Text style={[styles.packagePriceText, { color: '#b45309' }]}>{item.fare}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      </Modal>

      {/* RAPIDFOOD & RAPIDMART MODALS */}
      <Modal visible={activeModal === 'food' || activeModal === 'grocery' || activeModal === 'package'} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHeader}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Icon
                  name={activeModal === 'food' ? 'restaurant' : activeModal === 'grocery' ? 'shopping_basket' : 'local_shipping'}
                  size={22}
                  color={activeModal === 'food' ? '#ea580c' : activeModal === 'grocery' ? '#10b981' : '#4f46e5'}
                />
                <Text style={styles.modalTitle}>
                  {activeModal === 'food' ? 'RapidFood Hub' : activeModal === 'grocery' ? 'RapidMart 10-Min Delivery' : 'RapidSend Express Courier'}
                </Text>
              </View>
              <Pressable onPress={() => setActiveModal(null)} hitSlop={8} style={styles.modalCloseCircle}>
                <Icon name="close" size={18} color="#64748b" />
              </Pressable>
            </View>

            <Text style={styles.modalSubText}>
              {activeModal === 'food'
                ? 'Order freshly prepared North Indian & Lucknow specialty biryanis delivered hot.'
                : activeModal === 'grocery'
                ? 'Fresh fruits, veggies, dairy, snacks & grocery essentials at your doorstep in 10 minutes.'
                : 'Send keys, documents, chargers, or packages anywhere across the city with secure OTP delivery.'}
            </Text>

            <View style={styles.promoCouponBox}>
              <Text style={styles.promoCouponCode}>USE CODE: RAPIDFIRST</Text>
              <Text style={styles.promoCouponSub}>Get Flat 30% OFF on your first 3 orders!</Text>
            </View>

            <TouchableOpacity
              style={[
                styles.modalPrimaryBtn,
                {
                  backgroundColor:
                    activeModal === 'food' ? '#ea580c' : activeModal === 'grocery' ? '#10b981' : '#4f46e5',
                },
              ]}
              onPress={() => {
                setActiveModal(null);
                addToast('Opening service store in Lucknow...', 'success');
              }}
              activeOpacity={0.88}
            >
              <Text style={styles.modalPrimaryBtnText}>Explore Stores & Order</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  topHeaderBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 24) + 10 : 14,
    paddingBottom: 14,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1.5,
    borderBottomColor: '#f1f5f9',
  },
  headerBrandCol: {
    flex: 1,
  },
  brandBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 2,
  },
  brandIconDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: '#0052e0',
  },
  brandNameText: {
    fontSize: 10,
    fontWeight: '900',
    color: '#0052e0',
    letterSpacing: 0.8,
  },
  headerMainTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#0f172a',
    letterSpacing: -0.3,
  },
  profileAvatarBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#eff6ff',
    borderWidth: 1.5,
    borderColor: '#bfdbfe',
    alignItems: 'center',
    justifyContent: 'center',
  },
  mainScroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 36,
  },
  searchHeroBox: {
    marginBottom: 16,
  },
  searchBarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  searchGlassInput: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
    borderRadius: 16,
    paddingHorizontal: 12,
    height: 48,
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    fontWeight: '700',
    color: '#0f172a',
    paddingVertical: 0,
  },
  scheduleSelectorPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#eff6ff',
    borderWidth: 1.5,
    borderColor: '#bfdbfe',
    borderRadius: 16,
    height: 48,
    paddingHorizontal: 12,
    gap: 5,
  },
  scheduleSelectorText: {
    fontSize: 12,
    fontWeight: '900',
    color: '#0052e0',
  },
  scheduleDropdownMenu: {
    backgroundColor: '#ffffff',
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
    borderRadius: 16,
    marginTop: 8,
    padding: 6,
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  scheduleDropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
  },
  scheduleDropdownText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0f172a',
  },
  quickTagsScroll: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 10,
    paddingVertical: 2,
  },
  quickTagChip: {
    backgroundColor: '#ffffff',
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  quickTagText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#334155',
  },
  spotlightHeroCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#0f172a',
    borderRadius: 22,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 5,
  },
  spotlightLeft: {
    flex: 1,
    paddingRight: 10,
  },
  spotlightBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  spotlightPillGreen: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#059669',
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 6,
    gap: 3,
  },
  spotlightPillGreenText: {
    fontSize: 9,
    fontWeight: '900',
    color: '#ffffff',
    letterSpacing: 0.4,
  },
  spotlightDiscountBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 6,
  },
  spotlightDiscountText: {
    fontSize: 9,
    fontWeight: '900',
    color: '#60a5fa',
  },
  spotlightTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: '#ffffff',
    letterSpacing: -0.2,
  },
  spotlightSub: {
    fontSize: 10,
    color: 'rgba(255, 255, 255, 0.75)',
    marginTop: 2,
    fontWeight: '500',
  },
  spotlightActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0052e0',
    alignSelf: 'flex-start',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 10,
    marginTop: 10,
  },
  spotlightActionText: {
    fontSize: 11,
    fontWeight: '900',
    color: '#ffffff',
  },
  spotlightGraphicBox: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionHeaderWrap: {
    marginBottom: 12,
  },
  sectionMainTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: '#0f172a',
    letterSpacing: -0.2,
  },
  sectionSubTitle: {
    fontSize: 11,
    color: '#64748b',
    marginTop: 1,
    fontWeight: '600',
  },
  servicesGridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 22,
  },
  serviceTileCard: {
    width: (SCREEN_WIDTH - 42) / 2,
    backgroundColor: '#f8fafc',
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
    padding: 12,
    position: 'relative',
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  serviceTagPill: {
    position: 'absolute',
    top: 10,
    right: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  serviceTagText: {
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 0.3,
  },
  serviceGraphicBox: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 4,
  },
  serviceTileTitle: {
    fontSize: 13,
    fontWeight: '900',
    color: '#0f172a',
    marginTop: 4,
  },
  serviceTileDesc: {
    fontSize: 10,
    color: '#64748b',
    marginTop: 1,
    fontWeight: '600',
  },
  passesSectionWrap: {
    marginBottom: 22,
  },
  passesScrollContent: {
    flexDirection: 'row',
    gap: 12,
    paddingVertical: 2,
  },
  passHighlightCard: {
    width: SCREEN_WIDTH * 0.76,
    borderRadius: 20,
    padding: 16,
    justifyContent: 'space-between',
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
  passBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  passBadgeText: {
    fontSize: 9,
    fontWeight: '900',
    color: '#ffffff',
    letterSpacing: 0.5,
  },
  passCardTitle: {
    fontSize: 15,
    fontWeight: '900',
    color: '#ffffff',
  },
  passCardSub: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.82)',
    marginTop: 4,
    marginBottom: 12,
    lineHeight: 15,
  },
  passCardBtnWhite: {
    backgroundColor: '#ffffff',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  passCardBtnWhiteText: {
    fontSize: 11,
    fontWeight: '900',
    color: '#0052e0',
  },
  destinationsSectionWrap: {
    marginBottom: 10,
  },
  destinationsHeaderLine: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  categoryPillsScroll: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 14,
    paddingVertical: 2,
  },
  categoryPill: {
    backgroundColor: '#ffffff',
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 14,
  },
  categoryPillActive: {
    backgroundColor: '#0052e0',
    borderColor: '#0052e0',
  },
  categoryPillText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#64748b',
  },
  categoryPillTextActive: {
    color: '#ffffff',
  },
  destinationsListWrap: {
    gap: 10,
  },
  destinationRowCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
    padding: 12,
    gap: 12,
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  destIconBox: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#f8fafc',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  destInfoBlock: {
    flex: 1,
  },
  destTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  destNameText: {
    fontSize: 13,
    fontWeight: '900',
    color: '#0f172a',
    flex: 1,
    marginRight: 6,
  },
  destDistPill: {
    backgroundColor: '#eff6ff',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#bfdbfe',
  },
  destDistText: {
    fontSize: 10,
    fontWeight: '900',
    color: '#0052e0',
  },
  destAddressText: {
    fontSize: 11,
    color: '#64748b',
    marginTop: 2,
    fontWeight: '600',
  },
  destFooterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 6,
  },
  destEtaBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  destEtaText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#0052e0',
  },
  rideHereActionPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  rideHereActionText: {
    fontSize: 11,
    fontWeight: '900',
    color: '#0052e0',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
    padding: 20,
    paddingBottom: 34,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: '#0f172a',
  },
  modalCloseCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalSubText: {
    fontSize: 12,
    color: '#64748b',
    lineHeight: 18,
    marginBottom: 12,
  },
  modalCardFeatureBox: {
    backgroundColor: '#f8fafc',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    gap: 10,
    marginBottom: 16,
  },
  modalFeatureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  modalFeatureLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1e293b',
    flex: 1,
  },
  modalPrimaryBtn: {
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
  },
  modalPrimaryBtnText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '900',
  },
  packageCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    padding: 12,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
    gap: 10,
  },
  packageTitle: {
    fontSize: 13,
    fontWeight: '900',
    color: '#0f172a',
  },
  packageSub: {
    fontSize: 11,
    color: '#64748b',
    marginTop: 1,
  },
  packagePricePill: {
    backgroundColor: '#eff6ff',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#bfdbfe',
  },
  packagePriceText: {
    fontSize: 12,
    fontWeight: '900',
    color: '#0052e0',
  },
  promoCouponBox: {
    backgroundColor: '#fef3c7',
    borderWidth: 1,
    borderColor: '#fde68a',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    marginBottom: 16,
  },
  promoCouponCode: {
    fontSize: 12,
    fontWeight: '900',
    color: '#92400e',
    letterSpacing: 0.5,
  },
  promoCouponSub: {
    fontSize: 10,
    fontWeight: '700',
    color: '#b45309',
    marginTop: 2,
  },
});
