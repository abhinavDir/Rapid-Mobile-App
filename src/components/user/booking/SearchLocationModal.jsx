import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Pressable,
  StyleSheet,
  ScrollView,
  Modal,
  SafeAreaView,
  Platform,
  StatusBar,
  Dimensions,
  Animated,
} from 'react-native';
import Icon from '../../Icon';
import { searchPlacesApi } from '../../../services/api';
import { calculateDistance } from '../../../utils/distance';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

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

// Comprehensive Curated Destinations in BKT (Bakshi Ka Talab) and Lucknow
const RECOMMENDED_PLACES = [
  // --- BKT Immediate Vicinity (0 - 5 km) ---
  {
    title: 'Bakshi Ka Talab Market (BKT)',
    address: 'BKT Main Bazaar, NH-24, Lucknow',
    lat: 27.0045,
    lng: 80.9183,
    icon: 'storefront',
    category: 'Market',
    keywords: ['bkt', 'market', 'bazaar', 'talab', 'nh24', 'sitapur road', 'shop', 'main'],
  },
  {
    title: 'Ram Sagar Mishra Hospital (RSM)',
    address: 'RSM Hospital, Sitapur Road, BKT, Lucknow',
    lat: 27.0089,
    lng: 80.9142,
    icon: 'local_hospital',
    category: 'Hospital',
    keywords: ['rsm', 'hospital', 'ram', 'sagar', 'mishra', 'doctor', 'medical', 'emergency', 'bkt'],
  },
  {
    title: 'SR Institute of Management & Tech (SRIMT)',
    address: 'NH-24, Bakshi Ka Talab, Lucknow',
    lat: 27.0028,
    lng: 80.9221,
    icon: 'apartment',
    category: 'College',
    keywords: ['sr', 'srimt', 'institute', 'college', 'engineering', 'tech', 'bkt', 'campus', 'srg'],
  },
  {
    title: 'Bakshi Ka Talab Railway Station',
    address: 'BKT Station Road, Bakshi Ka Talab, Lucknow',
    lat: 27.0012,
    lng: 80.9248,
    icon: 'train',
    category: 'Transit',
    keywords: ['bkt', 'railway', 'station', 'train', 'platform', 'talab', 'junction'],
  },
  {
    title: 'Apex Trauma & Multi-speciality Hospital',
    address: 'Sitapur Highway, Bakshi Ka Talab, Lucknow',
    lat: 27.0058,
    lng: 80.9161,
    icon: 'local_hospital',
    category: 'Hospital',
    keywords: ['apex', 'hospital', 'trauma', 'medical', 'bkt', 'highway', 'doctor'],
  },
  {
    title: 'Bhaisamau Puliya',
    address: 'Bhaisamau Road, Bakshi Ka Talab, Lucknow',
    lat: 27.0075,
    lng: 80.9192,
    icon: 'navigation',
    category: 'Hub',
    keywords: ['bhaisamau', 'puliya', 'bridge', 'road', 'bkt'],
  },
  {
    title: 'BKT Tehsil & SDM Office',
    address: 'Tehsil Road, Bakshi Ka Talab, Lucknow',
    lat: 27.0062,
    lng: 80.9135,
    icon: 'account_balance',
    category: 'Government',
    keywords: ['tehsil', 'sdm', 'office', 'court', 'bkt', 'talab', 'block'],
  },
  {
    title: 'Chandrika Devi Temple',
    address: 'Kathwara, Bakshi Ka Talab, Lucknow',
    lat: 27.0258,
    lng: 80.8924,
    icon: 'place',
    category: 'Temple',
    keywords: ['chandrika', 'devi', 'temple', 'mandir', 'kathwara', 'bkt', 'puja'],
  },
  {
    title: 'Air Force Station BKT',
    address: 'AFS Bakshi Ka Talab, Lucknow',
    lat: 26.9882,
    lng: 80.9021,
    icon: 'flight_takeoff',
    category: 'Defense',
    keywords: ['air', 'force', 'station', 'afs', 'military', 'bkt', 'base'],
  },
  {
    title: 'Bansal Institute of Engg & Tech (BIET)',
    address: 'NH-24, Sitapur Road, Lucknow',
    lat: 26.9685,
    lng: 80.9256,
    icon: 'apartment',
    category: 'College',
    keywords: ['bansal', 'biet', 'college', 'engineering', 'sitapur road', 'institute'],
  },
  {
    title: 'Indaura Morh',
    address: 'Sitapur National Highway 24, BKT, Lucknow',
    lat: 27.0018,
    lng: 80.9175,
    icon: 'alt_route',
    category: 'Hub',
    keywords: ['indaura', 'morh', 'mod', 'highway', 'bkt', 'chauraha'],
  },
  // --- North Lucknow & Jankipuram (5 - 12 km) ---
  {
    title: 'Engineering College Chauraha',
    address: 'Jankipuram, Ring Road, Lucknow',
    lat: 26.9148,
    lng: 80.9442,
    icon: 'apartment',
    category: 'Hub',
    keywords: ['engineering', 'college', 'chauraha', 'jankipuram', 'ring road', 'iet'],
  },
  {
    title: 'IET Lucknow Campus',
    address: 'Sitapur Road, Jankipuram, Lucknow',
    lat: 26.9142,
    lng: 80.9418,
    icon: 'school',
    category: 'College',
    keywords: ['iet', 'lucknow', 'institute', 'engineering', 'technology', 'campus'],
  },
  {
    title: 'Jankipuram Extension Market',
    address: '60 Feet Road, Jankipuram Extension, Lucknow',
    lat: 26.9325,
    lng: 80.9582,
    icon: 'shopping_bag',
    category: 'Market',
    keywords: ['jankipuram', 'extension', 'market', '60 feet', 'shop'],
  },
  {
    title: 'Tedhi Pulia Sabzi Mandi',
    address: 'Tedhi Pulia, Ring Road, Aliganj, Lucknow',
    lat: 26.8985,
    lng: 80.9521,
    icon: 'storefront',
    category: 'Market',
    keywords: ['tedhi', 'pulia', 'mandi', 'market', 'ring road', 'aliganj', 'sabzi'],
  },
  {
    title: 'Purania Chauraha',
    address: 'Purania Flyover, Aliganj, Lucknow',
    lat: 26.8852,
    lng: 80.9385,
    icon: 'alt_route',
    category: 'Hub',
    keywords: ['purania', 'chauraha', 'flyover', 'aliganj', 'crossing'],
  },
  {
    title: 'Kapoorthala Shopping Hub',
    address: 'Kapoorthala, Aliganj, Lucknow',
    lat: 26.8785,
    lng: 80.9425,
    icon: 'shopping_bag',
    category: 'Shopping',
    keywords: ['kapoorthala', 'shopping', 'aliganj', 'bazaar', 'coaching'],
  },
  {
    title: 'IT Chauraha / Lucknow University',
    address: 'University Road, Babuganj, Lucknow',
    lat: 26.8665,
    lng: 80.9362,
    icon: 'school',
    category: 'University',
    keywords: ['it', 'chauraha', 'lucknow', 'university', 'lu', 'metro', 'babuganj'],
  },
  // --- Central Lucknow & Major Hubs (12 - 25 km) ---
  {
    title: 'Charbagh Railway Station',
    address: 'Lucknow Junction, Charbagh, Lucknow',
    lat: 26.8322,
    lng: 80.9197,
    icon: 'train',
    category: 'Transit',
    keywords: ['charbagh', 'railway', 'station', 'junction', 'train', 'metro', 'lucknow jn'],
  },
  {
    title: 'Hazratganj Market & Love Lane',
    address: 'City Center, Hazratganj, Lucknow',
    lat: 26.8467,
    lng: 80.9462,
    icon: 'shopping_bag',
    category: 'Shopping',
    keywords: ['hazratganj', 'ganj', 'market', 'love lane', 'shopping', 'metro', 'center'],
  },
  {
    title: 'Gomti Nagar Wave Mall',
    address: 'Vibhuti Khand, Gomti Nagar, Lucknow',
    lat: 26.8624,
    lng: 81.0012,
    icon: 'movie',
    category: 'Mall',
    keywords: ['wave', 'mall', 'gomti', 'nagar', 'cinepolis', 'vibhuti khand'],
  },
  {
    title: 'Chowk Heritage Market & Tunday',
    address: 'Chowk, Old Lucknow, Lucknow',
    lat: 26.8687,
    lng: 80.9082,
    icon: 'restaurant',
    category: 'Food & Heritage',
    keywords: ['chowk', 'heritage', 'tunday', 'kababi', 'old lucknow', 'chikan', 'food'],
  },
  {
    title: 'KGMU (King George Medical University)',
    address: 'Shah Mina Road, Chowk, Lucknow',
    lat: 26.8698,
    lng: 80.9142,
    icon: 'local_hospital',
    category: 'Hospital',
    keywords: ['kgmu', 'king george', 'medical', 'hospital', 'trauma center', 'chowk'],
  },
  {
    title: 'Dr. Ram Manohar Lohia Hospital',
    address: 'Vibhuti Khand, Gomti Nagar, Lucknow',
    lat: 26.8524,
    lng: 80.9995,
    icon: 'local_hospital',
    category: 'Hospital',
    keywords: ['lohia', 'ram manohar', 'hospital', 'gomti nagar', 'medical', 'doctor'],
  },
  {
    title: 'Lulu Mall Lucknow',
    address: 'Amar Shaheed Path, Sushant Golf City, Lucknow',
    lat: 26.7656,
    lng: 80.9855,
    icon: 'shopping_bag',
    category: 'Mall',
    keywords: ['lulu', 'mall', 'shopping', 'shaheed path', 'hypermarket'],
  },
  {
    title: 'Chaudhary Charan Singh Airport (Amausi)',
    address: 'Amausi, Airport Road, Lucknow',
    lat: 26.7606,
    lng: 80.8893,
    icon: 'flight_takeoff',
    category: 'Airport',
    keywords: ['airport', 'flight', 'amausi', 'ccs', 'terminal', 'aerodrome', 'plane'],
  },
  {
    title: 'Alambagh Bus Terminal & Metro',
    address: 'Alambagh ISBT, Lucknow',
    lat: 26.8142,
    lng: 80.9048,
    icon: 'directions_bus',
    category: 'Transit',
    keywords: ['alambagh', 'bus', 'stand', 'isbt', 'terminal', 'metro'],
  },
  {
    title: 'Phoenix United Mall',
    address: 'Kanpur Road, Sector B, Alambagh, Lucknow',
    lat: 26.8048,
    lng: 80.8975,
    icon: 'shopping_bag',
    category: 'Mall',
    keywords: ['phoenix', 'united', 'mall', 'alambagh', 'pvr', 'kanpur road'],
  },
  {
    title: 'Ekana International Cricket Stadium',
    address: 'Sector 7, Gomti Nagar Extension, Lucknow',
    lat: 26.8125,
    lng: 81.0152,
    icon: 'sports_cricket',
    category: 'Stadium',
    keywords: ['ekana', 'stadium', 'cricket', 'shaheed path', 'sports', 'match'],
  },
  {
    title: 'Medanta Hospital Lucknow',
    address: 'Sector A, Pocket 1, Sushant Golf City, Lucknow',
    lat: 26.7725,
    lng: 80.9782,
    icon: 'local_hospital',
    category: 'Hospital',
    keywords: ['medanta', 'hospital', 'super specialty', 'shaheed path', 'doctor'],
  },
];

export default function SearchLocationModal({
  visible,
  onClose,
  ridePickup,
  rideDropoff,
  pickupCoords,
  dropoffCoords,
  onSelectPickup,
  onSelectDropoff,
  onUseLiveLocation,
  onChooseOnMap,
  onConfirmRoute,
  initialFocus = 'dropoff', // 'pickup' | 'dropoff'
}) {
  const [activeInput, setActiveInput] = useState(initialFocus);
  const [pickupText, setPickupText] = useState(ridePickup || '');
  const [dropoffText, setDropoffText] = useState(rideDropoff || '');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const shimmerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    let anim;
    if (isSearching) {
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
  }, [isSearching, shimmerAnim]);

  const pickupInputRef = useRef(null);
  const dropoffInputRef = useRef(null);
  const debounceTimerRef = useRef(null);

  useEffect(() => {
    if (visible) {
      setPickupText(ridePickup || '');
      setDropoffText(rideDropoff || '');
      setActiveInput(initialFocus);

      // Pre-populate with nearest destinations instantly
      const userLat = pickupCoords?.latitude;
      const userLng = pickupCoords?.longitude;
      const initialList = RECOMMENDED_PLACES.slice(0, 15).map((p) => {
        let d = null;
        if (userLat && userLng) {
          d = calculateDistance(userLat, userLng, p.lat, p.lng);
        }
        return {
          ...p,
          distKm: d ? parseFloat(d.toFixed(1)) : null,
        };
      });
      if (userLat && userLng) {
        initialList.sort((a, b) => (a.distKm || 999) - (b.distKm || 999));
      }
      setSearchResults(initialList);

      requestAnimationFrame(() => {
        if (initialFocus === 'pickup') {
          pickupInputRef.current?.focus();
        } else {
          dropoffInputRef.current?.focus();
        }
      });
    }
  }, [visible, initialFocus, ridePickup, rideDropoff]);

  // Word-by-word matching algorithm with nearest distance sorting
  const handleQueryChange = (text, field) => {
    if (field === 'pickup') {
      setPickupText(text);
    } else {
      setDropoffText(text);
    }

    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);

    const userLat = pickupCoords?.latitude;
    const userLng = pickupCoords?.longitude;

    if (!text.trim() || text.trim().length < 1) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    // Split user input into individual word tokens
    const queryWords = text.toLowerCase().trim().split(/\s+/).filter(Boolean);

    // Filter curated places where every typed word matches
    const matched = [];
    for (const p of RECOMMENDED_PLACES) {
      const searchTokens = [
        p.title.toLowerCase(),
        p.address.toLowerCase(),
        p.category.toLowerCase(),
        ...(p.keywords || []).map((k) => k.toLowerCase()),
      ].join(' ');

      const isMatch = queryWords.every((word) => searchTokens.includes(word));
      if (isMatch) {
        const dist = calculateDistance(userLat, userLng, p.lat, p.lng);
        matched.push({
          title: p.title,
          address: p.address,
          lat: p.lat,
          lng: p.lng,
          distKm: dist ? parseFloat(dist.toFixed(1)) : 999,
          category: p.category,
          icon: p.icon || 'place',
        });
      }
    }

    // CRITICAL: Sort matched places strictly by nearest distance!
    matched.sort((a, b) => a.distKm - b.distKm);

    // Instant local results
    setSearchResults(matched);

    if (text.trim().length < 2) return;

    // Debounced API search for wider addresses
    setIsSearching(true);
    debounceTimerRef.current = setTimeout(async () => {
      try {
        const res = await searchPlacesApi(text.trim(), userLat, userLng);
        if (res.success && Array.isArray(res.data) && res.data.length > 0) {
          const apiList = res.data.map((item) => {
            const lat = parseFloat(item.lat);
            const lng = parseFloat(item.lng || item.lon);
            const dist = calculateDistance(userLat, userLng, lat, lng);
            return {
              title: item.title || item.name.split(',')[0],
              address: item.name,
              lat,
              lng,
              distKm: dist ? parseFloat(dist.toFixed(1)) : 999,
              category: item.type || 'Location',
              icon: 'location_on',
            };
          });

          // Merge: keep local matches first, add API items that don't duplicate
          const merged = [...matched];
          for (const item of apiList) {
            if (
              !merged.some(
                (m) =>
                  Math.abs(m.lat - item.lat) < 0.001 &&
                  Math.abs(m.lng - item.lng) < 0.001
              )
            ) {
              merged.push(item);
            }
          }
          // Sort entire list by nearest distance!
          merged.sort((a, b) => a.distKm - b.distKm);
          setSearchResults(merged);
        }
      } catch (e) {
        // Keep instant matches
      } finally {
        setIsSearching(false);
      }
    }, 100);
  };

  const handleSelectPlace = (place) => {
    const placeName = place.address || place.title;
    if (activeInput === 'pickup') {
      setPickupText(place.title || place.address);
      onSelectPickup({
        name: placeName,
        lat: place.lat,
        lng: place.lng,
      });
      // Auto move to Dropoff if not set
      if (!dropoffText) {
        setActiveInput('dropoff');
        dropoffInputRef.current?.focus();
        setSearchResults([]);
      } else {
        onClose();
        setTimeout(() => {
          onConfirmRoute && onConfirmRoute({ name: dropoffText, lat: dropoffCoords?.latitude, lng: dropoffCoords?.longitude });
        }, 150);
      }
    } else {
      setDropoffText(place.title || place.address);
      onSelectDropoff({
        name: placeName,
        lat: place.lat,
        lng: place.lng,
      });
      // Both set, close modal and automatically view vehicle selection and route!
      onClose();
      setTimeout(() => {
        onConfirmRoute && onConfirmRoute({ name: placeName, lat: place.lat, lng: place.lng });
      }, 150);
    }
  };



  const handleSwap = () => {
    const tempText = pickupText;
    const tempCoords = pickupCoords;

    setPickupText(dropoffText);
    setDropoffText(tempText);

    if (dropoffCoords) {
      onSelectPickup({ name: dropoffText, lat: dropoffCoords.latitude, lng: dropoffCoords.longitude });
    }
    if (tempCoords) {
      onSelectDropoff({ name: tempText, lat: tempCoords.latitude, lng: tempCoords.longitude });
    }
  };

  const isRouteReady = Boolean(dropoffText);

  return (
    <Modal
      visible={visible}
      animationType="none"
      transparent={false}
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.safeContainer}>
        {/* Material 3 App Bar */}
        <View style={styles.topHeader}>
          <Pressable
            style={styles.backButton}
            onPress={onClose}
            accessibilityRole="button"
            accessibilityLabel="Back"
          >
            <Icon name="arrow_back" size={22} color="#0f172a" />
          </Pressable>
          <Text style={styles.headerTitle}>Plan your ride</Text>
          {(pickupText || dropoffText) ? (
            <TouchableOpacity
              onPress={() => {
                if (activeInput === 'pickup') {
                  setPickupText('');
                  setSearchResults([]);
                } else {
                  setDropoffText('');
                  setSearchResults([]);
                }
              }}
              style={styles.clearHeaderBtn}
            >
              <Text style={styles.clearHeaderText}>Clear</Text>
            </TouchableOpacity>
          ) : (
            <View style={{ width: 40 }} />
          )}
        </View>

        {/* Dual Material Search Card */}
        <View style={styles.searchCard}>
          {/* Connector timeline graphics */}
          <View style={styles.timelineColumn}>
            <View style={styles.pointDotA} />
            <View style={styles.timelineDashedLine} />
            <View style={styles.pointSquareB} />
          </View>

          {/* Input Fields Column */}
          <View style={styles.inputsColumn}>
            {/* POINT A INPUT */}
            <View
              style={[
                styles.materialInputField,
                activeInput === 'pickup' && styles.materialInputFieldFocused,
              ]}
            >
              <TextInput
                ref={pickupInputRef}
                style={styles.textInputStyle}
                value={pickupText}
                onChangeText={(txt) => handleQueryChange(txt, 'pickup')}
                onFocus={() => {
                  setActiveInput('pickup');
                  setSearchResults([]);
                }}
                placeholder="Enter pickup spot (Point A)"
                placeholderTextColor="#94a3b8"
                returnKeyType="next"
                onSubmitEditing={() => dropoffInputRef.current?.focus()}
              />
              {pickupText ? (
                <Pressable
                  onPress={() => {
                    setPickupText('');
                    setSearchResults([]);
                    pickupInputRef.current?.focus();
                  }}
                  style={styles.clearFieldBtn}
                  accessibilityRole="button"
                  accessibilityLabel="Clear pickup location"
                >
                  <Icon name="close" size={14} color="#64748b" />
                </Pressable>
              ) : null}
            </View>

            {/* Divider with Swap Button */}
            <View style={styles.inputDividerRow}>
              <View style={styles.horizontalDividerLine} />
              <Pressable
                onPress={handleSwap}
                style={styles.swapButton}
                accessibilityRole="button"
                accessibilityLabel="Swap pickup and destination"
              >
                <Icon name="sync" size={16} color="#0052e0" />
              </Pressable>
            </View>

            {/* POINT B INPUT */}
            <View
              style={[
                styles.materialInputField,
                activeInput === 'dropoff' && styles.materialInputFieldFocused,
              ]}
            >
              <TextInput
                ref={dropoffInputRef}
                style={styles.textInputStyle}
                value={dropoffText}
                onChangeText={(txt) => handleQueryChange(txt, 'dropoff')}
                onFocus={() => {
                  setActiveInput('dropoff');
                  setSearchResults([]);
                }}
                placeholder="Where to? (Point B Destination)"
                placeholderTextColor="#94a3b8"
                returnKeyType="search"
              />
              {dropoffText ? (
                <Pressable
                  onPress={() => {
                    setDropoffText('');
                    setSearchResults([]);
                    dropoffInputRef.current?.focus();
                  }}
                  style={styles.clearFieldBtn}
                  accessibilityRole="button"
                  accessibilityLabel="Clear destination location"
                >
                  <Icon name="close" size={14} color="#64748b" />
                </Pressable>
              ) : null}
            </View>
          </View>
        </View>

        {/* Quick Action Chips: Point A Live, Point A Pin, Point B Pin */}
        <View style={styles.quickChipsRow}>
          <TouchableOpacity
            style={styles.chipButton}
            onPress={() => {
              onUseLiveLocation && onUseLiveLocation();
              onClose();
            }}
            activeOpacity={0.8}
          >
            <View style={styles.chipIconCircleGreen}>
              <Icon name="my_location" size={13} color="#ffffff" />
            </View>
            <Text style={styles.chipText}>Live GPS</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.chipButton,
              activeInput === 'pickup' ? styles.chipButtonActive : null,
            ]}
            onPress={() => {
              onChooseOnMap && onChooseOnMap('pickup');
              onClose();
            }}
            activeOpacity={0.8}
          >
            <View style={styles.chipIconCircleGreen}>
              <Icon name="push_pin" size={13} color="#ffffff" />
            </View>
            <Text style={styles.chipText}>Pin Point A</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.chipButton,
              activeInput === 'dropoff' ? styles.chipButtonActive : null,
            ]}
            onPress={() => {
              onChooseOnMap && onChooseOnMap('dropoff');
              onClose();
            }}
            activeOpacity={0.8}
          >
            <View style={styles.chipIconCircleBlue}>
              <Icon name="push_pin" size={13} color="#ffffff" />
            </View>
            <Text style={styles.chipText}>Pin Point B</Text>
          </TouchableOpacity>
        </View>

        {/* Search Results OR Curated Nearest Places */}
        <ScrollView
          style={styles.resultsScroll}
          contentContainerStyle={styles.resultsContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {isSearching ? (
            <View style={{ paddingVertical: 6, paddingHorizontal: 2 }}>
              {[1, 2, 3, 4, 5].map((k) => (
                <View key={`skel-res-${k}`} style={styles.skeletonResultRow}>
                  <ShimmerBar
                    style={{ width: 38, height: 38, borderRadius: 12, marginRight: 12 }}
                    shimmerAnim={shimmerAnim}
                  />
                  <View style={{ flex: 1 }}>
                    <ShimmerBar
                      style={{ width: '65%', height: 14, borderRadius: 6, marginBottom: 7 }}
                      shimmerAnim={shimmerAnim}
                    />
                    <ShimmerBar
                      style={{ width: '90%', height: 11, borderRadius: 5 }}
                      shimmerAnim={shimmerAnim}
                    />
                  </View>
                  <ShimmerBar
                    style={{ width: 44, height: 20, borderRadius: 10, marginLeft: 8 }}
                    shimmerAnim={shimmerAnim}
                  />
                </View>
              ))}
            </View>
          ) : searchResults.length > 0 ? (
            <View>
              <View style={styles.sectionTitleRow}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <Icon name="my_location" size={14} color="#0052e0" />
                  <Text style={styles.sectionHeaderLabel}>
                    NEAREST MATCHING LOCATIONS ({searchResults.length})
                  </Text>
                </View>
              </View>
              {searchResults.map((place, idx) => {
                const isNear = place.distKm < 2.0;
                return (
                  <TouchableOpacity
                    key={`res-${idx}`}
                    style={styles.resultItemCard}
                    onPress={() => handleSelectPlace(place)}
                    activeOpacity={0.7}
                  >
                    <View
                      style={[
                        styles.resultIconBox,
                        isNear ? styles.resultIconBoxNear : null,
                      ]}
                    >
                      <Icon
                        name={place.icon || 'location_on'}
                        size={18}
                        color={isNear ? '#059669' : '#0052e0'}
                      />
                    </View>
                    <View style={styles.resultDetailsCol}>
                      <Text style={styles.resultTitleText} numberOfLines={1}>
                        {place.title}
                      </Text>
                      <Text style={styles.resultAddressText} numberOfLines={1}>
                        {place.address}
                      </Text>
                    </View>
                    {place.distKm !== undefined && place.distKm !== null && (
                      <View
                        style={[
                          styles.distPillBadge,
                          isNear
                            ? styles.distPillBadgeNear
                            : place.distKm < 10
                            ? styles.distPillBadgeMedium
                            : styles.distPillBadgeFar,
                        ]}
                      >
                        <Text
                          style={[
                            styles.distPillText,
                            isNear ? styles.distPillTextNear : null,
                          ]}
                        >
                          {`${place.distKm} km`}
                        </Text>
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          ) : (
            <View>
              <View style={styles.sectionTitleRow}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <Icon name="star" size={14} color="#f59e0b" />
                  <Text style={styles.sectionHeaderLabel}>
                    POPULAR DESTINATIONS
                  </Text>
                </View>
              </View>

              {(() => {
                const userLat = pickupCoords?.latitude;
                const userLng = pickupCoords?.longitude;
                // Sort curated list by ascending distance so nearest places appear first!
                const sortedPlaces = [...RECOMMENDED_PLACES]
                  .map((item) => {
                    const dist = calculateDistance(
                      userLat,
                      userLng,
                      item.lat,
                      item.lng
                    );
                    return {
                      ...item,
                      distKm: dist ? parseFloat(dist.toFixed(1)) : 999,
                    };
                  })
                  .sort((a, b) => a.distKm - b.distKm);

                return sortedPlaces.map((item, idx) => {
                  const isNear = item.distKm < 2.0;
                  return (
                    <TouchableOpacity
                      key={`rec-${idx}`}
                      style={styles.resultItemCard}
                      onPress={() => handleSelectPlace(item)}
                      activeOpacity={0.7}
                    >
                      <View
                        style={[
                          styles.recommendedIconBox,
                          isNear ? styles.recommendedIconBoxNear : null,
                        ]}
                      >
                        <Icon
                          name={item.icon || 'place'}
                          size={18}
                          color={isNear ? '#059669' : '#0f172a'}
                        />
                      </View>
                      <View style={styles.resultDetailsCol}>
                        <Text style={styles.resultTitleText} numberOfLines={1}>
                          {item.title}
                        </Text>
                        <Text style={styles.resultAddressText} numberOfLines={1}>
                          {item.address}
                        </Text>
                      </View>
                      <View
                        style={[
                          styles.distPillBadge,
                          isNear
                            ? styles.distPillBadgeNear
                            : item.distKm < 10
                            ? styles.distPillBadgeMedium
                            : styles.distPillBadgeFar,
                        ]}
                      >
                        <Text
                          style={[
                            styles.distPillText,
                            isNear ? styles.distPillTextNear : null,
                          ]}
                        >
                          {`${item.distKm} km`}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  );
                });
              })()}
            </View>
          )}
        </ScrollView>


        {/* Floating Confirm Button when route is filled */}
        {isRouteReady && (
          <View style={styles.confirmBottomBar}>
            <TouchableOpacity
              style={styles.confirmRouteButton}
              onPress={() => {
                const finalDropoff = dropoffText || rideDropoff;
                const finalPickup = pickupText || ridePickup || 'Current Location';
                onConfirmRoute && onConfirmRoute({
                  name: finalDropoff,
                  lat: dropoffCoords?.latitude,
                  lng: dropoffCoords?.longitude,
                  pickupName: finalPickup,
                  pickupLat: pickupCoords?.latitude,
                  pickupLng: pickupCoords?.longitude,
                });
                onClose();
              }}
              activeOpacity={0.88}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                <Text style={styles.confirmRouteButtonText}>
                  Choose Vehicle & View Rates
                </Text>
                <Icon name="arrow_forward" size={18} color="#ffffff" />
              </View>
            </TouchableOpacity>
          </View>
        )}
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  topHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 24) + 8 : 12,
    paddingBottom: 12,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#ffffff',
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 4,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '900',
    color: '#0f172a',
  },
  clearHeaderBtn: {
    paddingVertical: 6,
    paddingHorizontal: 10,
  },
  clearHeaderText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#dc2626',
  },
  searchCard: {
    backgroundColor: '#ffffff',
    marginHorizontal: 14,
    marginTop: 12,
    borderRadius: 20,
    padding: 14,
    flexDirection: 'row',
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  timelineColumn: {
    width: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
    paddingVertical: 12,
  },
  pointDotA: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#10b981',
    borderWidth: 2,
    borderColor: '#d1fae5',
  },
  timelineDashedLine: {
    width: 2,
    flex: 1,
    backgroundColor: '#cbd5e1',
    marginVertical: 4,
  },
  pointSquareB: {
    width: 12,
    height: 12,
    borderRadius: 2,
    backgroundColor: '#ef4444',
    borderWidth: 2,
    borderColor: '#fee2e2',
  },
  inputsColumn: {
    flex: 1,
  },
  materialInputField: {
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
    paddingHorizontal: 12,
    height: 44,
    flexDirection: 'row',
    alignItems: 'center',
  },
  materialInputFieldFocused: {
    borderColor: '#0052e0',
    backgroundColor: '#ffffff',
    shadowColor: '#0052e0',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 2,
  },
  textInputStyle: {
    flex: 1,
    fontSize: 14,
    fontWeight: '700',
    color: '#0f172a',
    paddingVertical: 0,
  },
  clearFieldBtn: {
    padding: 6,
  },
  clearFieldText: {
    fontSize: 12,
    color: '#94a3b8',
    fontWeight: 'bold',
  },
  inputDividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 6,
  },
  horizontalDividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#f1f5f9',
  },
  swapButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#eff6ff',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#bfdbfe',
    shadowColor: '#0052e0',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 3,
    elevation: 2,
  },
  swapButtonText: {
    fontSize: 14,
    color: '#0052e0',
    fontWeight: '900',
  },
  quickChipsRow: {
    flexDirection: 'row',
    paddingHorizontal: 14,
    marginTop: 10,
    gap: 8,
  },
  chipButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  chipButtonActive: {
    borderColor: '#0052e0',
    backgroundColor: '#eff6ff',
  },
  chipIconCircleGreen: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#10b981',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 6,
  },
  chipIconCircleBlue: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#0052e0',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 6,
  },
  chipText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1e293b',
  },
  resultsScroll: {
    flex: 1,
    marginTop: 12,
  },
  resultsContent: {
    paddingHorizontal: 14,
    paddingBottom: 90,
  },
  sectionTitleRow: {
    marginBottom: 8,
    marginTop: 4,
  },
  sectionHeaderLabel: {
    fontSize: 11,
    fontWeight: '900',
    color: '#64748b',
    letterSpacing: 0.6,
    marginBottom: 8,
  },
  resultItemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    padding: 12,
    borderRadius: 14,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#f1f5f9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  resultIconBox: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#eff6ff',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  resultIconBoxNear: {
    backgroundColor: '#ecfdf5',
  },
  recommendedIconBox: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  recommendedIconBoxNear: {
    backgroundColor: '#ecfdf5',
  },
  resultDetailsCol: {
    flex: 1,
  },
  resultTitleText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0f172a',
    marginBottom: 2,
  },
  resultAddressText: {
    fontSize: 11,
    color: '#64748b',
  },
  distPillBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    borderWidth: 1,
  },
  distPillBadgeNear: {
    backgroundColor: '#ecfdf5',
    borderColor: '#a7f3d0',
  },
  distPillBadgeMedium: {
    backgroundColor: '#eff6ff',
    borderColor: '#bfdbfe',
  },
  distPillBadgeFar: {
    backgroundColor: '#f8fafc',
    borderColor: '#e2e8f0',
  },
  distPillText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#475569',
  },
  distPillTextNear: {
    color: '#047857',
  },

  categoryBadge: {
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  categoryBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#475569',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    gap: 8,
  },
  loadingText: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '600',
  },
  confirmBottomBar: {
    position: 'absolute',
    bottom: Platform.OS === 'android' ? 16 : 28,
    left: 14,
    right: 14,
  },
  confirmRouteButton: {
    backgroundColor: '#0052e0',
    height: 52,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#0052e0',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 6,
  },
  confirmRouteButtonText: {
    fontSize: 15,
    fontWeight: '900',
    color: '#ffffff',
    letterSpacing: 0.3,
  },
  skeletonResultRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    marginBottom: 8,
    borderRadius: 14,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
});
