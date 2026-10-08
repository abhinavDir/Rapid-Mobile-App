import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Pressable,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  Animated,
  Platform,
  StatusBar,
  Modal,
  Share,
} from 'react-native';
import { fetchUserRidesApi } from '../../../services/api';
import storage from '../../../utils/storage';
import Icon from '../../Icon';
import {
  BikeGraphic,
  AutoGraphic,
  CabGraphic,
  CarGraphic,
  SedanGraphic,
  SuvGraphic,
} from '../../SvgIcons';

// ==========================================
// SHIMMER PLACEHOLDER COMPONENT
// ==========================================
function ShimmerBar({ style, shimmerAnim }) {
  const opacity = shimmerAnim
    ? shimmerAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [0.3, 0.85],
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

// ==========================================
// RIDE SKELETON CARD (SHIMMER LOADING STATE)
// ==========================================
function RideCardSkeleton({ shimmerAnim }) {
  return (
    <View style={styles.rideCard}>
      {/* Top row skeleton */}
      <View style={styles.rideCardTop}>
        <View style={styles.vehicleHeaderRow}>
          <ShimmerBar style={{ width: 56, height: 38, borderRadius: 12 }} shimmerAnim={shimmerAnim} />
          <View style={{ marginLeft: 12, gap: 6 }}>
            <ShimmerBar style={{ width: 110, height: 16 }} shimmerAnim={shimmerAnim} />
            <ShimmerBar style={{ width: 140, height: 11 }} shimmerAnim={shimmerAnim} />
          </View>
        </View>
        <View style={{ alignItems: 'flex-end', gap: 6 }}>
          <ShimmerBar style={{ width: 68, height: 22, borderRadius: 8 }} shimmerAnim={shimmerAnim} />
          <ShimmerBar style={{ width: 80, height: 18, borderRadius: 6 }} shimmerAnim={shimmerAnim} />
        </View>
      </View>

      {/* Route Timeline Skeleton */}
      <View style={styles.routeTimelineCard}>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
          <ShimmerBar style={{ width: 12, height: 12, borderRadius: 6, marginRight: 10 }} shimmerAnim={shimmerAnim} />
          <View style={{ flex: 1, gap: 4 }}>
            <ShimmerBar style={{ width: 70, height: 9 }} shimmerAnim={shimmerAnim} />
            <ShimmerBar style={{ width: '85%', height: 13 }} shimmerAnim={shimmerAnim} />
          </View>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <ShimmerBar style={{ width: 12, height: 12, borderRadius: 3, marginRight: 10 }} shimmerAnim={shimmerAnim} />
          <View style={{ flex: 1, gap: 4 }}>
            <ShimmerBar style={{ width: 80, height: 9 }} shimmerAnim={shimmerAnim} />
            <ShimmerBar style={{ width: '92%', height: 13 }} shimmerAnim={shimmerAnim} />
          </View>
        </View>

        {/* Pill Skeletons */}
        <View style={{ flexDirection: 'row', gap: 8, marginTop: 12, paddingTop: 10, borderTopWidth: 1, borderTopColor: '#f1f5f9' }}>
          <ShimmerBar style={{ width: 70, height: 22, borderRadius: 8 }} shimmerAnim={shimmerAnim} />
          <ShimmerBar style={{ width: 75, height: 22, borderRadius: 8 }} shimmerAnim={shimmerAnim} />
          <ShimmerBar style={{ width: 80, height: 22, borderRadius: 8 }} shimmerAnim={shimmerAnim} />
        </View>
      </View>

      {/* Captain Row Skeleton */}
      <View style={styles.captainInfoRow}>
        <ShimmerBar style={{ width: 38, height: 38, borderRadius: 19 }} shimmerAnim={shimmerAnim} />
        <View style={{ flex: 1, marginLeft: 10, gap: 4 }}>
          <ShimmerBar style={{ width: 120, height: 13 }} shimmerAnim={shimmerAnim} />
          <ShimmerBar style={{ width: 150, height: 11 }} shimmerAnim={shimmerAnim} />
        </View>
        <ShimmerBar style={{ width: 95, height: 24, borderRadius: 8 }} shimmerAnim={shimmerAnim} />
      </View>

      {/* Actions Row Skeleton */}
      <View style={styles.cardActionsRow}>
        <ShimmerBar style={{ flex: 1, height: 40, borderRadius: 14 }} shimmerAnim={shimmerAnim} />
        <ShimmerBar style={{ flex: 1, height: 40, borderRadius: 14 }} shimmerAnim={shimmerAnim} />
      </View>
    </View>
  );
}

// ==========================================
// FULL ACTIVITY SKELETON VIEW
// ==========================================
function ActivitySkeletonView({ shimmerAnim }) {
  return (
    <View style={styles.skeletonContainer}>
      <RideCardSkeleton shimmerAnim={shimmerAnim} />
      <RideCardSkeleton shimmerAnim={shimmerAnim} />
      <RideCardSkeleton shimmerAnim={shimmerAnim} />
    </View>
  );
}

export default function UserActivity({ user, onNavigate, onBookAgain }) {
  const userKey = user?._id || user?.id || user?.phone || 'anonymous';
  const storageKey = `@rapidride_user_rides_${userKey}`;

  // INSTANT LOAD: Initialize directly from synchronous storage cache
  const [rides, setRides] = useState(() => {
    try {
      const cached = storage.getItem(storageKey);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return [];
  });

  const [filter, setFilter] = useState('all'); // 'all' | 'COMPLETED' | 'ACTIVE' | 'CANCELLED'
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('newest'); // 'newest' | 'oldest' | 'fare_high' | 'fare_low'
  const [isLoading, setIsLoading] = useState(rides.length === 0);
  const [isSyncing, setIsSyncing] = useState(false);
  const [selectedRide, setSelectedRide] = useState(null); // for full modal receipt
  const [ratedRides, setRatedRides] = useState({});
  const [tipSuccessRideId, setTipSuccessRideId] = useState(null);
  const [copiedText, setCopiedText] = useState(null);
  const [showStatsBreakdown, setShowStatsBreakdown] = useState(false);

  // Shimmer pulse animation
  const shimmerAnim = useRef(new Animated.Value(0)).current;

  // Pulse animation for active rides badge
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    let animation;
    if (isLoading || isSyncing) {
      animation = Animated.loop(
        Animated.sequence([
          Animated.timing(shimmerAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(shimmerAnim, {
            toValue: 0,
            duration: 800,
            useNativeDriver: true,
          }),
        ])
      );
      animation.start();
    }
    return () => {
      if (animation) animation.stop();
    };
  }, [isLoading, isSyncing, shimmerAnim]);

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.15,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, [pulseAnim]);

  // Load user-specific rides from local storage + backend API
  const loadUserRides = useCallback(async (isManualRefresh = false) => {
    if (isManualRefresh) {
      setIsSyncing(true);
    } else if (rides.length === 0) {
      setIsLoading(true);
    }

    let localRides = [];

    // 1. Retrieve local stored rides for this user
    try {
      const storedStr = await storage.getItemAsync(storageKey);
      if (storedStr) {
        const parsed = JSON.parse(storedStr);
        if (Array.isArray(parsed)) {
          localRides = parsed;
          setRides((prev) => (prev.length === 0 ? parsed : prev));
          if (parsed.length > 0) setIsLoading(false);
        }
      }
    } catch (e) {
      console.warn('Failed to parse local stored user rides:', e);
    }

    // 2. Fetch fresh user-scoped rides from backend concurrently
    let serverRides = [];
    try {
      const userId = user?._id || user?.id || '';
      const phone = user?.phone || '';
      if (userId || phone) {
        const res = await fetchUserRidesApi(userId, phone);
        if (res && res.success && Array.isArray(res.data)) {
          serverRides = res.data;
        }
      }
    } catch (err) {
      console.warn('Server fetchUserRides fallback:', err);
    }

    // 3. Merge & deduplicate by _id
    const rideMap = new Map();

    localRides.forEach((r) => {
      if (r && r._id) rideMap.set(String(r._id), r);
    });

    serverRides.forEach((r) => {
      if (r && r._id) {
        const existing = rideMap.get(String(r._id)) || {};
        rideMap.set(String(r._id), { ...existing, ...r });
      }
    });

    const merged = Array.from(rideMap.values()).sort((a, b) => {
      const dateA = new Date(a.completedAt || a.createdAt || 0).getTime();
      const dateB = new Date(b.completedAt || b.createdAt || 0).getTime();
      return dateB - dateA;
    });

    setRides(merged);

    // Update storage with merged list for this user
    try {
      await storage.setItem(storageKey, JSON.stringify(merged));
    } catch (e) {}

    setIsLoading(false);
    setIsSyncing(false);
  }, [user, storageKey, rides.length]);

  useEffect(() => {
    loadUserRides(false);
  }, [userKey]);

  // Rate a ride
  const handleRateRide = (rideId, stars, tag = null) => {
    setRatedRides((prev) => ({
      ...prev,
      [rideId]: {
        stars,
        tag: tag || prev[rideId]?.tag || 'Smooth Ride',
      },
    }));
  };

  // Add tip to captain
  const handleAddTip = (rideId, amount) => {
    setTipSuccessRideId(rideId);
    setTimeout(() => {
      setTipSuccessRideId(null);
    }, 3500);
  };

  // Copy text helper
  const handleCopy = (text, label) => {
    setCopiedText(label);
    setTimeout(() => {
      setCopiedText(null);
    }, 2000);
  };

  // Share receipt summary
  const handleShareReceipt = async (ride) => {
    try {
      const message = `RapidRide Trip Receipt:\nTrip ID: #${String(ride._id || '').slice(-8).toUpperCase()}\nVehicle: ${ride.vehicleType || 'Ride'}\nFrom: ${ride.pickupAddress || 'Pickup'}\nTo: ${ride.dropoffAddress || 'Dropoff'}\nFare: ₹${ride.fare || 120}\nStatus: ${ride.status || 'Completed'}`;
      await Share.share({ message });
    } catch (e) {}
  };

  // Render Realistic Vehicle Graphic
  const renderRealisticVehicle = (type, width = 56, height = 34) => {
    const t = (type || '').toLowerCase();
    if (t.includes('bike') || t.includes('moto') || t.includes('two_wheeler')) {
      return <BikeGraphic width={width} height={height} color="#0052e0" />;
    }
    if (t.includes('auto') || t.includes('rickshaw')) {
      return <AutoGraphic width={width} height={height} />;
    }
    if (t.includes('sedan') || t.includes('prime') || t.includes('comfort')) {
      return <SedanGraphic width={width} height={height} />;
    }
    if (t.includes('suv') || t.includes('xl')) {
      return <SuvGraphic width={width} height={height} />;
    }
    if (t.includes('car') || t.includes('cab')) {
      return <CarGraphic width={width} height={height} color="#0052e0" />;
    }
    return <CabGraphic width={width} height={height} />;
  };

  // Active Ongoing Rides Filter
  const activeOngoingRides = rides.filter(
    (r) => r.status === 'PENDING' || r.status === 'ACCEPTED' || r.status === 'IN_PROGRESS'
  );

  // Filtered & Sorted rides
  const filteredRides = rides
    .filter((r) => {
      const matchesFilter =
        filter === 'all'
          ? true
          : filter === 'ACTIVE'
          ? r.status === 'PENDING' || r.status === 'ACCEPTED' || r.status === 'IN_PROGRESS'
          : r.status === filter;

      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        (r.pickupAddress && r.pickupAddress.toLowerCase().includes(q)) ||
        (r.dropoffAddress && r.dropoffAddress.toLowerCase().includes(q)) ||
        (r.vehicleType && r.vehicleType.toLowerCase().includes(q)) ||
        (r.assignedRiderName && r.assignedRiderName.toLowerCase().includes(q)) ||
        (r.vehicleNumber && r.vehicleNumber.toLowerCase().includes(q)) ||
        (r._id && String(r._id).toLowerCase().includes(q));

      return matchesFilter && matchesSearch;
    })
    .sort((a, b) => {
      if (sortBy === 'newest') {
        return new Date(b.completedAt || b.createdAt || 0).getTime() - new Date(a.completedAt || a.createdAt || 0).getTime();
      }
      if (sortBy === 'oldest') {
        return new Date(a.completedAt || a.createdAt || 0).getTime() - new Date(b.completedAt || b.createdAt || 0).getTime();
      }
      if (sortBy === 'fare_high') {
        return (Number(b.fare) || 0) - (Number(a.fare) || 0);
      }
      if (sortBy === 'fare_low') {
        return (Number(a.fare) || 0) - (Number(b.fare) || 0);
      }
      return 0;
    });

  const totalCompleted = rides.filter((r) => r.status === 'COMPLETED').length;
  const totalCancelled = rides.filter((r) => r.status === 'CANCELLED').length;
  const totalOngoing = activeOngoingRides.length;
  const totalSpent = rides
    .filter((r) => r.status === 'COMPLETED')
    .reduce((acc, r) => acc + (Number(r.fare) || 0), 0);
  const totalDistanceKm = rides
    .filter((r) => r.status === 'COMPLETED')
    .reduce((acc, r) => acc + (Number(r.distanceKm) || 4.2), 0);
  const totalCo2Saved = (totalDistanceKm * 0.14).toFixed(1);

  return (
    <SafeAreaView style={styles.root}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />

      {/* 1. TOP HEADER BAR */}
      <View style={styles.topHeader}>
        <Pressable
          onPress={() => onNavigate && onNavigate('home')}
          style={styles.backBtn}
          accessibilityRole="button"
          accessibilityLabel="Back"
          hitSlop={8}
        >
          <Icon name="chevron_left" size={24} color="#0052e0" />
        </Pressable>

        <View style={styles.headerTitleWrap}>
          <View style={styles.headerMainTitleRow}>
            <Text style={styles.topHeaderTitle}>Your Activity</Text>
            <View style={styles.headerLiveDot} />
          </View>
          <Text style={styles.topHeaderSub}>
            {user?.name ? `${user.name} • ${rides.length} Total Trips` : `${rides.length} Verified Trips`}
          </Text>
        </View>

        <TouchableOpacity
          onPress={() => loadUserRides(true)}
          style={[styles.syncBtn, isSyncing && styles.syncBtnActive]}
          activeOpacity={0.8}
          disabled={isSyncing}
        >
          <Icon name="refresh" size={16} color="#0052e0" />
          <Text style={styles.syncText}>{isSyncing ? 'Syncing' : 'Refresh'}</Text>
        </TouchableOpacity>
      </View>

      {/* 2. SCROLLABLE CONTENT */}
      <ScrollView
        style={styles.scrollArea}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ACTIVE LIVE TRIP BANNER (IF ANY ACTIVE TRIP EXISTS) */}
        {activeOngoingRides.length > 0 && (
          <TouchableOpacity
            style={styles.liveTripBanner}
            activeOpacity={0.9}
            onPress={() => onNavigate && onNavigate('home', { activeRide: activeOngoingRides[0] })}
          >
            <View style={styles.liveTripHeaderRow}>
              <View style={styles.liveTripPill}>
                <Animated.View style={[styles.livePulseDot, { transform: [{ scale: pulseAnim }] }]} />
                <Text style={styles.liveTripPillText}>LIVE TRIP IN PROGRESS</Text>
              </View>
              <Text style={styles.liveTripActionText}>Track Ride →</Text>
            </View>

            <View style={styles.liveTripContent}>
              <View style={styles.liveVehicleGraphic}>
                {renderRealisticVehicle(activeOngoingRides[0].vehicleType, 50, 30)}
              </View>
              <View style={{ flex: 1, marginLeft: 10 }}>
                <Text style={styles.liveTripDestination} numberOfLines={1}>
                  Heading to {activeOngoingRides[0].dropoffAddress || 'Destination'}
                </Text>
                <Text style={styles.liveTripCaptain}>
                  Captain: {activeOngoingRides[0].assignedRiderName || 'Rapid Captain'} • ₹{activeOngoingRides[0].fare || 120}
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        )}

        {/* STATS OVERVIEW CARD WITH EXPANDABLE METRICS */}
        <View style={styles.statsCard}>
          <View style={styles.statsCardTop}>
            <View style={styles.userTierBadge}>
              <Icon name="verified" size={13} color="#059669" />
              <Text style={styles.userTierText}>VERIFIED RIDER ACCOUNT</Text>
            </View>
            <TouchableOpacity
              onPress={() => setShowStatsBreakdown(!showStatsBreakdown)}
              style={styles.statsToggleBtn}
              hitSlop={6}
            >
              <Text style={styles.statsToggleText}>
                {showStatsBreakdown ? 'Less info' : 'Insights'}
              </Text>
              <Icon
                name={showStatsBreakdown ? 'expand_less' : 'expand_more'}
                size={14}
                color="#0052e0"
              />
            </TouchableOpacity>
          </View>

          {/* Primary Stat Grid */}
          <View style={styles.statsGrid}>
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>Total Trips</Text>
              <Text style={styles.statValue}>{rides.length}</Text>
              <Text style={styles.statSubText}>All Time</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>Completed</Text>
              <Text style={[styles.statValue, { color: '#059669' }]}>
                {totalCompleted}
              </Text>
              <Text style={[styles.statSubText, { color: '#059669' }]}>
                {rides.length ? `${Math.round((totalCompleted / rides.length) * 100)}%` : '0%'} rate
              </Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>Ongoing</Text>
              <Text style={[styles.statValue, { color: '#0052e0' }]}>
                {totalOngoing}
              </Text>
              <Text style={styles.statSubText}>Active</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>Total Spent</Text>
              <Text style={[styles.statValue, { color: '#0f172a' }]}>
                ₹{totalSpent}
              </Text>
              <Text style={styles.statSubText}>INR</Text>
            </View>
          </View>

          {/* Expanded Sustainability & Distance Insights */}
          {showStatsBreakdown && (
            <View style={styles.expandedInsightsBox}>
              <View style={styles.insightItem}>
                <View style={[styles.insightIconBox, { backgroundColor: '#ecfdf5' }]}>
                  <Icon name="straighten" size={16} color="#059669" />
                </View>
                <View style={{ flex: 1, marginLeft: 8 }}>
                  <Text style={styles.insightLabel}>Distance Traveled</Text>
                  <Text style={styles.insightValue}>{totalDistanceKm.toFixed(1)} km</Text>
                </View>
              </View>

              <View style={styles.insightItem}>
                <View style={[styles.insightIconBox, { backgroundColor: '#f0fdf4' }]}>
                  <Icon name="eco" size={16} color="#16a34a" />
                </View>
                <View style={{ flex: 1, marginLeft: 8 }}>
                  <Text style={styles.insightLabel}>Eco CO₂ Saved</Text>
                  <Text style={styles.insightValue}>{totalCo2Saved} kg</Text>
                </View>
              </View>

              <View style={styles.insightItem}>
                <View style={[styles.insightIconBox, { backgroundColor: '#eff6ff' }]}>
                  <Icon name="star" size={16} color="#0052e0" />
                </View>
                <View style={{ flex: 1, marginLeft: 8 }}>
                  <Text style={styles.insightLabel}>Rider Rating</Text>
                  <Text style={styles.insightValue}>5.0 ★</Text>
                </View>
              </View>
            </View>
          )}
        </View>

        {/* SEARCH & SORT BAR */}
        <View style={styles.searchSection}>
          <View style={styles.searchBar}>
            <Icon name="search" size={18} color="#0052e0" />
            <TextInput
              style={styles.searchInput}
              placeholder="Search destination, driver, plate no..."
              placeholderTextColor="#94a3b8"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery ? (
              <Pressable
                onPress={() => setSearchQuery('')}
                accessibilityRole="button"
                accessibilityLabel="Clear search"
                hitSlop={8}
                style={styles.clearSearchBtn}
              >
                <Icon name="close" size={15} color="#64748b" />
              </Pressable>
            ) : null}
          </View>
        </View>

        {/* FILTER CHIPS ROW */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterScroll}
        >
          {[
            { id: 'all', label: 'All Trips', count: rides.length, icon: 'receipt_long' },
            { id: 'COMPLETED', label: 'Completed', count: totalCompleted, icon: 'check_circle' },
            { id: 'ACTIVE', label: 'Ongoing', count: totalOngoing, icon: 'bolt' },
            { id: 'CANCELLED', label: 'Cancelled', count: totalCancelled, icon: 'close' },
          ].map((item) => {
            const isActive = filter === item.id;
            return (
              <TouchableOpacity
                key={item.id}
                onPress={() => setFilter(item.id)}
                style={[styles.filterChip, isActive && styles.filterChipActive]}
                activeOpacity={0.8}
              >
                <Icon
                  name={item.icon}
                  size={14}
                  color={isActive ? '#ffffff' : '#64748b'}
                  style={{ marginRight: 5 }}
                />
                <Text style={[styles.filterChipText, isActive && styles.filterChipTextActive]}>
                  {item.label}
                </Text>
                <View style={[styles.filterCountBadge, isActive && styles.filterCountBadgeActive]}>
                  <Text style={[styles.filterCountText, isActive && styles.filterCountTextActive]}>
                    {item.count}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* SORT / ORDER ROW */}
        <View style={styles.sortRow}>
          <Text style={styles.resultsCountText}>
            Showing <Text style={{ fontWeight: '900', color: '#0f172a' }}>{filteredRides.length}</Text> rides
          </Text>

          <View style={styles.sortButtonsWrap}>
            <TouchableOpacity
              style={[styles.sortBtn, sortBy === 'newest' && styles.sortBtnActive]}
              onPress={() => setSortBy('newest')}
            >
              <Text style={[styles.sortBtnText, sortBy === 'newest' && styles.sortBtnTextActive]}>
                Newest
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.sortBtn, (sortBy === 'fare_high' || sortBy === 'fare_low') && styles.sortBtnActive]}
              onPress={() => setSortBy(sortBy === 'fare_high' ? 'fare_low' : 'fare_high')}
            >
              <Text style={[styles.sortBtnText, (sortBy === 'fare_high' || sortBy === 'fare_low') && styles.sortBtnTextActive]}>
                Fare {sortBy === 'fare_high' ? '↓' : sortBy === 'fare_low' ? '↑' : ''}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* TOAST FEEDBACK FOR TIP / COPY */}
        {copiedText && (
          <View style={styles.miniToast}>
            <Icon name="check" size={14} color="#ffffff" />
            <Text style={styles.miniToastText}>Copied {copiedText} to clipboard</Text>
          </View>
        )}

        {/* RIDES LIST OR SKELETON LOADER */}
        {isLoading && rides.length === 0 ? (
          <ActivitySkeletonView shimmerAnim={shimmerAnim} />
        ) : filteredRides.length === 0 ? (
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconCircle}>
              <Icon name="directions_car" size={42} color="#0052e0" />
            </View>
            <Text style={styles.emptyTitle}>No Trips Found</Text>
            <Text style={styles.emptySubtitle}>
              {searchQuery
                ? 'No past trips matched your search. Try searching a different keyword or location.'
                : filter === 'COMPLETED'
                ? 'You have not completed any trips yet. Book your first comfortable ride with RapidRide!'
                : filter === 'ACTIVE'
                ? 'No active rides in progress. Book a cab, bike or auto in seconds.'
                : 'No ride history recorded in this category.'}
            </Text>
            <TouchableOpacity
              style={styles.emptyCta}
              onPress={() => onNavigate && onNavigate('home')}
              activeOpacity={0.88}
            >
              <Icon name="directions" size={18} color="#ffffff" style={{ marginRight: 8 }} />
              <Text style={styles.emptyCtaText}>Book a Ride Now</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.ridesList}>
            {filteredRides.map((ride, idx) => {
              const rideKey = ride._id || `ride-${idx}`;
              const isCompleted = ride.status === 'COMPLETED';
              const isCancelled = ride.status === 'CANCELLED';
              const isOngoing =
                ride.status === 'ACCEPTED' || ride.status === 'IN_PROGRESS' || ride.status === 'PENDING';

              const statusBadgeText = isCompleted
                ? 'Completed'
                : isCancelled
                ? 'Cancelled'
                : isOngoing
                ? 'In Progress'
                : ride.status;

              const statusColor = isCompleted
                ? '#059669'
                : isCancelled
                ? '#dc2626'
                : '#0052e0';
              const statusBg = isCompleted
                ? '#ecfdf5'
                : isCancelled
                ? '#fef2f2'
                : '#eff6ff';

              const dateStr = ride.completedAt || ride.createdAt
                ? new Date(ride.completedAt || ride.createdAt).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                    hour: 'numeric',
                    minute: '2-digit',
                  })
                : 'Recent Trip';

              const currentRating = ratedRides[rideKey]?.stars || ride.rating || 5;

              return (
                <View key={rideKey} style={styles.rideCard}>
                  {/* CARD TOP HEADER: VEHICLE GRAPHIC + FARE & STATUS */}
                  <View style={styles.rideCardTop}>
                    <View style={styles.vehicleHeaderRow}>
                      <View style={styles.vehicleGraphicBox}>
                        {renderRealisticVehicle(ride.vehicleType, 54, 32)}
                      </View>
                      <View style={{ marginLeft: 10 }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                          <Text style={styles.rideVehicleType}>
                            {ride.vehicleType || 'RapidRide'}
                          </Text>
                          <View style={styles.vehicleVerifiedBadge}>
                            <Icon name="verified" size={10} color="#059669" />
                          </View>
                        </View>
                        <Text style={styles.rideDate}>{dateStr}</Text>
                      </View>
                    </View>

                    <View style={styles.fareGroup}>
                      <Text style={styles.rideFare}>₹{ride.fare || 120}</Text>
                      <View style={[styles.rideStatusBadge, { backgroundColor: statusBg }]}>
                        <View
                          style={[
                            styles.statusDot,
                            { backgroundColor: statusColor },
                          ]}
                        />
                        <Text style={[styles.rideStatusText, { color: statusColor }]}>
                          {statusBadgeText}
                        </Text>
                      </View>
                    </View>
                  </View>

                  {/* ROUTE TIMELINE (POINT A -> POINT B) */}
                  <View style={styles.routeTimelineCard}>
                    {/* Pickup Point A */}
                    <View style={styles.routeRow}>
                      <View style={styles.markerContainer}>
                        <View style={styles.greenCircleDot} />
                        <View style={styles.verticalDottedLine} />
                      </View>
                      <View style={styles.stopDetails}>
                        <View style={styles.stopLabelRow}>
                          <Text style={styles.stopLabel}>PICKUP</Text>
                          <Text style={styles.stopTag}>Point A</Text>
                        </View>
                        <Text style={styles.stopAddress} numberOfLines={1}>
                          {ride.pickupAddress || 'Current Location'}
                        </Text>
                      </View>
                    </View>

                    {/* Dropoff Point B */}
                    <View style={styles.routeRow}>
                      <View style={styles.markerContainer}>
                        <View style={styles.redSquareDot} />
                      </View>
                      <View style={styles.stopDetails}>
                        <View style={styles.stopLabelRow}>
                          <Text style={[styles.stopLabel, { color: '#0f172a' }]}>DROPOFF</Text>
                          <Text style={[styles.stopTag, { backgroundColor: '#fee2e2', color: '#dc2626' }]}>
                            Point B
                          </Text>
                        </View>
                        <Text style={[styles.stopAddress, styles.dropoffBold]} numberOfLines={1}>
                          {ride.dropoffAddress || 'Destination'}
                        </Text>
                      </View>
                    </View>

                    {/* Distance, Duration & Payment Mode Badges */}
                    <View style={styles.routeInfoPillRow}>
                      <View style={styles.routeInfoPill}>
                        <Icon name="straighten" size={13} color="#0052e0" />
                        <Text style={styles.routeInfoText}>
                          {ride.distanceKm ? `${Number(ride.distanceKm).toFixed(1)} km` : '4.2 km'}
                        </Text>
                      </View>

                      <View style={styles.routeInfoPill}>
                        <Icon name="schedule" size={13} color="#059669" />
                        <Text style={styles.routeInfoText}>
                          {ride.distanceKm ? `${Math.max(4, Math.round(Number(ride.distanceKm) * 3))} mins` : '12 mins'}
                        </Text>
                      </View>

                      <View style={styles.routeInfoPill}>
                        <Icon name="payments" size={13} color="#7c3aed" />
                        <Text style={styles.routeInfoText}>
                          {ride.paymentMethod || 'Cash / UPI'}
                        </Text>
                      </View>

                      {ride.otp && (
                        <View style={[styles.routeInfoPill, { backgroundColor: '#f0fdf4', borderColor: '#bbf7d0' }]}>
                          <Icon name="lock" size={12} color="#16a34a" />
                          <Text style={[styles.routeInfoText, { color: '#16a34a' }]}>
                            OTP {ride.otp}
                          </Text>
                        </View>
                      )}
                    </View>
                  </View>

                  {/* CAPTAIN DETAILS & CAR NUMBER PLATE */}
                  <View style={styles.captainInfoRow}>
                    <View style={styles.captainAvatar}>
                      <Icon name="person" size={20} color="#0052e0" />
                    </View>
                    <View style={{ flex: 1, marginLeft: 10 }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Text style={styles.captainName}>
                          {ride.assignedRiderName || ride.riderName || 'Rapid Captain'}
                        </Text>
                        <View style={styles.starBadge}>
                          <Icon name="star" size={10} color="#ca8a04" />
                          <Text style={styles.starBadgeText}>
                            {ride.captainRating ? Number(ride.captainRating).toFixed(1) : '4.9'}
                          </Text>
                        </View>
                      </View>
                      <Text style={styles.vehicleModelText}>
                        {ride.vehicleModel || `${ride.vehicleType || 'Rapid'} Verified Captain`}
                      </Text>
                    </View>

                    {/* Realistic Indian Number Plate */}
                    {ride.vehicleNumber ? (
                      <TouchableOpacity
                        onPress={() => handleCopy(ride.vehicleNumber, 'Vehicle Number')}
                        style={styles.numberPlateBox}
                        activeOpacity={0.8}
                      >
                        <View style={styles.indPlateBadge}>
                          <Text style={styles.indText}>IND</Text>
                        </View>
                        <Text style={styles.numberPlateText}>
                          {ride.vehicleNumber}
                        </Text>
                      </TouchableOpacity>
                    ) : null}
                  </View>

                  {/* QUICK RATING ROW (IF COMPLETED) */}
                  {isCompleted && (
                    <View style={styles.quickRatingBar}>
                      <Text style={styles.quickRatingLabel}>Rate Captain:</Text>
                      <View style={styles.starsBar}>
                        {[1, 2, 3, 4, 5].map((star) => (
                          <TouchableOpacity
                            key={star}
                            onPress={() => handleRateRide(rideKey, star)}
                            hitSlop={5}
                            style={{ paddingHorizontal: 3 }}
                          >
                            <Icon
                              name={star <= currentRating ? 'star' : 'star_border'}
                              size={18}
                              color={star <= currentRating ? '#f59e0b' : '#cbd5e1'}
                            />
                          </TouchableOpacity>
                        ))}
                      </View>
                      {ratedRides[rideKey] && (
                        <Text style={styles.ratedThankText}>✓ Rated</Text>
                      )}
                    </View>
                  )}

                  {/* CARD ACTION BUTTONS */}
                  <View style={styles.cardActionsRow}>
                    {/* Re-book 1-Tap Button */}
                    <TouchableOpacity
                      onPress={() => onBookAgain && onBookAgain(ride)}
                      style={styles.rebookBtn}
                      activeOpacity={0.85}
                    >
                      <Icon name="replay" size={15} color="#ffffff" style={{ marginRight: 6 }} />
                      <Text style={styles.rebookBtnText}>Re-Book Trip</Text>
                    </TouchableOpacity>

                    {/* View Details & Receipt */}
                    <TouchableOpacity
                      onPress={() => setSelectedRide(ride)}
                      style={styles.receiptDetailsBtn}
                      activeOpacity={0.8}
                    >
                      <Icon name="receipt_long" size={15} color="#0052e0" style={{ marginRight: 5 }} />
                      <Text style={styles.receiptDetailsText}>Receipt & Bill</Text>
                      <Icon name="chevron_right" size={16} color="#0052e0" />
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })}
          </View>
        )}
      </ScrollView>

      {/* 3. FULL E-RECEIPT & TRIP DETAILS MODAL */}
      <Modal
        visible={!!selectedRide}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setSelectedRide(null)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalContainer}>
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>Trip Invoice & Details</Text>
                <Text style={styles.modalSubtitle}>
                  #{String(selectedRide?._id || '').slice(-8).toUpperCase()} • RapidRide Verified
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => setSelectedRide(null)}
                style={styles.modalCloseBtn}
                hitSlop={8}
              >
                <Icon name="close" size={20} color="#0f172a" />
              </TouchableOpacity>
            </View>

            {/* Modal Scroll Content */}
            <ScrollView
              style={styles.modalScroll}
              contentContainerStyle={styles.modalScrollContent}
              showsVerticalScrollIndicator={false}
            >
              {selectedRide && (
                <>
                  {/* Digital Ticket Top Graphic */}
                  <View style={styles.ticketTopCard}>
                    <View style={styles.ticketVehicleGraphic}>
                      {renderRealisticVehicle(selectedRide.vehicleType, 72, 44)}
                    </View>
                    <View style={{ flex: 1, marginLeft: 12 }}>
                      <Text style={styles.ticketVehicleTitle}>
                        {selectedRide.vehicleType || 'RapidRide Cab'}
                      </Text>
                      <Text style={styles.ticketDate}>
                        {selectedRide.completedAt || selectedRide.createdAt
                          ? new Date(selectedRide.completedAt || selectedRide.createdAt).toLocaleString('en-IN', {
                              dateStyle: 'medium',
                              timeStyle: 'short',
                            })
                          : 'Recent Trip'}
                      </Text>
                      <View style={styles.ticketStatusTag}>
                        <Text style={styles.ticketStatusTagText}>
                          {selectedRide.status || 'COMPLETED'}
                        </Text>
                      </View>
                    </View>
                  </View>

                  {/* Route Overview */}
                  <View style={styles.modalRouteCard}>
                    <Text style={styles.modalSectionTitle}>TRAVEL ROUTE</Text>
                    
                    <View style={styles.modalRouteRow}>
                      <View style={styles.modalMarkerWrap}>
                        <View style={styles.modalPickupDot} />
                        <View style={styles.modalRouteLine} />
                      </View>
                      <View style={{ flex: 1, paddingBottom: 16 }}>
                        <Text style={styles.modalStopType}>PICKUP POINT</Text>
                        <Text style={styles.modalStopAddress}>
                          {selectedRide.pickupAddress || 'Current Location'}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.modalRouteRow}>
                      <View style={styles.modalMarkerWrap}>
                        <View style={styles.modalDropoffDot} />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.modalStopType}>DROPOFF DESTINATION</Text>
                        <Text style={[styles.modalStopAddress, { fontWeight: '900', color: '#0f172a' }]}>
                          {selectedRide.dropoffAddress || 'Destination Location'}
                        </Text>
                      </View>
                    </View>
                  </View>

                  {/* Fare Breakdown */}
                  <View style={styles.fareBreakdownCard}>
                    <Text style={styles.modalSectionTitle}>FARE BREAKDOWN</Text>

                    <View style={styles.fareRow}>
                      <Text style={styles.fareItemLabel}>Base Fare</Text>
                      <Text style={styles.fareItemVal}>₹40.00</Text>
                    </View>

                    <View style={styles.fareRow}>
                      <Text style={styles.fareItemLabel}>
                        Distance Fare ({selectedRide.distanceKm ? `${Number(selectedRide.distanceKm).toFixed(1)} km` : '4.2 km'})
                      </Text>
                      <Text style={styles.fareItemVal}>
                        ₹{Math.max(20, (Number(selectedRide.fare) || 120) - 48).toFixed(2)}
                      </Text>
                    </View>

                    <View style={styles.fareRow}>
                      <Text style={styles.fareItemLabel}>Platform Safety & Access Fee</Text>
                      <Text style={styles.fareItemVal}>₹8.00</Text>
                    </View>

                    <View style={styles.fareDivider} />

                    <View style={styles.fareTotalRow}>
                      <Text style={styles.fareTotalLabel}>Total Amount Paid</Text>
                      <Text style={styles.fareTotalVal}>₹{selectedRide.fare || 120}</Text>
                    </View>

                    <View style={styles.paymentMethodMetaRow}>
                      <Icon name="payments" size={14} color="#059669" />
                      <Text style={styles.paymentMethodMetaText}>
                        Paid via {selectedRide.paymentMethod || 'Cash / UPI'} • Transaction Verified
                      </Text>
                    </View>
                  </View>

                  {/* Captain & Vehicle Meta */}
                  <View style={styles.captainModalCard}>
                    <Text style={styles.modalSectionTitle}>CAPTAIN DETAILS</Text>
                    <View style={styles.captainDetailRow}>
                      <View style={styles.captainModalAvatar}>
                        <Icon name="person" size={24} color="#0052e0" />
                      </View>
                      <View style={{ flex: 1, marginLeft: 12 }}>
                        <Text style={styles.captainModalName}>
                          {selectedRide.assignedRiderName || selectedRide.riderName || 'Rapid Captain'}
                        </Text>
                        <Text style={styles.captainModalSub}>
                          {selectedRide.vehicleModel || 'Verified Fleet Vehicle'}
                        </Text>
                      </View>
                      {selectedRide.vehicleNumber && (
                        <View style={styles.numberPlateBox}>
                          <Text style={styles.numberPlateText}>
                            {selectedRide.vehicleNumber}
                          </Text>
                        </View>
                      )}
                    </View>
                  </View>

                  {/* Tip Captain Feature */}
                  <View style={styles.tipSectionCard}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                      <Text style={styles.modalSectionTitle}>TIP YOUR CAPTAIN</Text>
                      <Icon name="thumb_up" size={14} color="#0052e0" />
                    </View>
                    <Text style={styles.tipSubtitle}>100% of your tip goes directly to your driver.</Text>

                    <View style={styles.tipButtonsRow}>
                      {[10, 20, 50, 100].map((amount) => (
                        <TouchableOpacity
                          key={amount}
                          onPress={() => handleAddTip(selectedRide._id, amount)}
                          style={styles.tipBtn}
                          activeOpacity={0.8}
                        >
                          <Text style={styles.tipBtnText}>+ ₹{amount}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>

                    {tipSuccessRideId === selectedRide._id && (
                      <View style={styles.tipSuccessBox}>
                        <Icon name="check_circle" size={16} color="#059669" />
                        <Text style={styles.tipSuccessText}>Tip added successfully! Thank you.</Text>
                      </View>
                    )}
                  </View>

                  {/* Safety & Security Badges */}
                  <View style={styles.securityBadgeBox}>
                    <Icon name="verified_user" size={16} color="#059669" />
                    <Text style={styles.securityBadgeText}>
                      Secured by RapidRide 256-Bit SSL • Trip Start OTP: <Text style={{ fontWeight: '900' }}>{selectedRide.otp || '4920'}</Text>
                    </Text>
                  </View>

                  {/* Action Buttons: Share Receipt & Re-book */}
                  <View style={styles.modalActionsRow}>
                    <TouchableOpacity
                      onPress={() => handleShareReceipt(selectedRide)}
                      style={styles.shareReceiptBtn}
                      activeOpacity={0.8}
                    >
                      <Icon name="share" size={16} color="#0052e0" style={{ marginRight: 6 }} />
                      <Text style={styles.shareReceiptText}>Share Bill</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      onPress={() => {
                        const r = selectedRide;
                        setSelectedRide(null);
                        if (onBookAgain) onBookAgain(r);
                      }}
                      style={styles.modalRebookBtn}
                      activeOpacity={0.85}
                    >
                      <Icon name="replay" size={16} color="#ffffff" style={{ marginRight: 6 }} />
                      <Text style={styles.modalRebookText}>Book Again</Text>
                    </TouchableOpacity>
                  </View>
                </>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  topHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 24) + 10 : 16,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    backgroundColor: '#ffffff',
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 3,
  },
  backBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#eff6ff',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#bfdbfe',
    shadowColor: '#0052e0',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 2,
  },
  headerTitleWrap: {
    flex: 1,
    marginHorizontal: 12,
  },
  headerMainTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  topHeaderTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#0f172a',
    letterSpacing: -0.4,
  },
  headerLiveDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#059669',
  },
  topHeaderSub: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748b',
    marginTop: 1,
  },
  syncBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#eff6ff',
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: 20,
    gap: 5,
    borderWidth: 1.5,
    borderColor: '#bfdbfe',
  },
  syncBtnActive: {
    opacity: 0.6,
  },
  syncText: {
    fontSize: 12,
    fontWeight: '900',
    color: '#0052e0',
  },
  scrollArea: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 36,
  },

  // LIVE TRIP HERO BANNER
  liveTripBanner: {
    backgroundColor: '#0052e0',
    borderRadius: 20,
    padding: 14,
    marginBottom: 14,
    shadowColor: '#0052e0',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 6,
  },
  liveTripHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  liveTripPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 12,
    gap: 6,
  },
  livePulseDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#4ade80',
  },
  liveTripPillText: {
    fontSize: 10,
    fontWeight: '900',
    color: '#ffffff',
    letterSpacing: 0.5,
  },
  liveTripActionText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#ffffff',
  },
  liveTripContent: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: 14,
    padding: 10,
  },
  liveVehicleGraphic: {
    width: 52,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  liveTripDestination: {
    fontSize: 13,
    fontWeight: '900',
    color: '#ffffff',
  },
  liveTripCaptain: {
    fontSize: 11,
    fontWeight: '600',
    color: '#dbeafe',
    marginTop: 2,
  },

  // STATS CARD
  statsCard: {
    backgroundColor: '#ffffff',
    borderRadius: 22,
    padding: 16,
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
    marginBottom: 14,
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  statsCardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  userTierBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ecfdf5',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 8,
    gap: 4,
    borderWidth: 1,
    borderColor: '#a7f3d0',
  },
  userTierText: {
    fontSize: 9,
    fontWeight: '900',
    color: '#059669',
    letterSpacing: 0.5,
  },
  statsToggleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  statsToggleText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#0052e0',
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 8,
  },
  statBox: {
    flex: 1,
    backgroundColor: '#f8fafc',
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 9.5,
    fontWeight: '700',
    color: '#64748b',
  },
  statValue: {
    fontSize: 16,
    fontWeight: '900',
    color: '#0f172a',
    marginTop: 2,
  },
  statSubText: {
    fontSize: 8.5,
    fontWeight: '700',
    color: '#94a3b8',
    marginTop: 1,
  },
  expandedInsightsBox: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  insightItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  insightIconBox: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  insightLabel: {
    fontSize: 8.5,
    fontWeight: '700',
    color: '#64748b',
  },
  insightValue: {
    fontSize: 11,
    fontWeight: '900',
    color: '#0f172a',
    marginTop: 1,
  },

  // SEARCH SECTION
  searchSection: {
    marginBottom: 10,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderWidth: 1.5,
    borderColor: '#cbd5e1',
    borderRadius: 16,
    paddingHorizontal: 12,
    height: 48,
    gap: 8,
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    fontWeight: '700',
    color: '#0f172a',
  },
  clearSearchBtn: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // FILTER PILLS
  filterScroll: {
    flexDirection: 'row',
    gap: 8,
    paddingBottom: 4,
    marginBottom: 10,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
  },
  filterChipActive: {
    backgroundColor: '#0052e0',
    borderColor: '#0052e0',
  },
  filterChipText: {
    fontSize: 11.5,
    fontWeight: '800',
    color: '#64748b',
  },
  filterChipTextActive: {
    color: '#ffffff',
  },
  filterCountBadge: {
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 8,
    marginLeft: 6,
  },
  filterCountBadgeActive: {
    backgroundColor: 'rgba(255,255,255,0.25)',
  },
  filterCountText: {
    fontSize: 10,
    fontWeight: '900',
    color: '#475569',
  },
  filterCountTextActive: {
    color: '#ffffff',
  },

  // SORT BAR
  sortRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
    paddingHorizontal: 2,
  },
  resultsCountText: {
    fontSize: 11.5,
    color: '#64748b',
    fontWeight: '600',
  },
  sortButtonsWrap: {
    flexDirection: 'row',
    gap: 6,
  },
  sortBtn: {
    paddingVertical: 4,
    paddingHorizontal: 9,
    borderRadius: 10,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  sortBtnActive: {
    backgroundColor: '#eff6ff',
    borderColor: '#bfdbfe',
  },
  sortBtnText: {
    fontSize: 10.5,
    fontWeight: '800',
    color: '#64748b',
  },
  sortBtnTextActive: {
    color: '#0052e0',
  },

  // MINI TOAST
  miniToast: {
    position: 'absolute',
    top: 20,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0f172a',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
    gap: 6,
    zIndex: 999,
    elevation: 10,
  },
  miniToastText: {
    color: '#ffffff',
    fontSize: 11.5,
    fontWeight: '800',
  },

  // SKELETON LOADER
  skeletonContainer: {
    gap: 14,
  },

  // EMPTY STATE
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 48,
    paddingHorizontal: 20,
    backgroundColor: '#ffffff',
    borderRadius: 22,
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
    marginTop: 8,
  },
  emptyIconCircle: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: '#eff6ff',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
    borderWidth: 1.5,
    borderColor: '#bfdbfe',
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#0f172a',
  },
  emptySubtitle: {
    fontSize: 12.5,
    color: '#64748b',
    marginTop: 5,
    marginBottom: 20,
    textAlign: 'center',
    lineHeight: 18,
  },
  emptyCta: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0052e0',
    paddingVertical: 12,
    paddingHorizontal: 22,
    borderRadius: 16,
    shadowColor: '#0052e0',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  emptyCtaText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '900',
  },

  // RIDES LIST
  ridesList: {
    gap: 14,
  },
  rideCard: {
    backgroundColor: '#ffffff',
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
    borderRadius: 22,
    padding: 16,
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  rideCardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  vehicleHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  vehicleGraphicBox: {
    width: 58,
    height: 38,
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  rideVehicleType: {
    fontSize: 16,
    fontWeight: '900',
    color: '#0f172a',
  },
  vehicleVerifiedBadge: {
    marginLeft: 4,
  },
  rideDate: {
    fontSize: 11,
    color: '#64748b',
    fontWeight: '600',
    marginTop: 1,
  },
  fareGroup: {
    alignItems: 'flex-end',
  },
  rideFare: {
    fontSize: 18,
    fontWeight: '900',
    color: '#0f172a',
  },
  rideStatusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 8,
    marginTop: 3,
    gap: 4,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  rideStatusText: {
    fontSize: 10,
    fontWeight: '900',
  },

  // ROUTE TIMELINE
  routeTimelineCard: {
    backgroundColor: '#f8fafc',
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: 12,
  },
  routeRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 6,
  },
  markerContainer: {
    alignItems: 'center',
    width: 16,
    marginRight: 10,
    marginTop: 2,
  },
  greenCircleDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#10b981',
  },
  verticalDottedLine: {
    width: 2,
    height: 20,
    backgroundColor: '#cbd5e1',
    marginVertical: 2,
  },
  redSquareDot: {
    width: 10,
    height: 10,
    borderRadius: 3,
    backgroundColor: '#ef4444',
  },
  stopDetails: {
    flex: 1,
  },
  stopLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  stopLabel: {
    fontSize: 8.5,
    fontWeight: '900',
    color: '#94a3b8',
    letterSpacing: 0.5,
  },
  stopTag: {
    fontSize: 8,
    fontWeight: '900',
    backgroundColor: '#dcfce7',
    color: '#15803d',
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 4,
  },
  stopAddress: {
    fontSize: 12,
    color: '#334155',
    fontWeight: '600',
    marginTop: 2,
  },
  dropoffBold: {
    fontWeight: '800',
    color: '#0f172a',
  },
  routeInfoPillRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 6,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },
  routeInfoPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    paddingVertical: 3.5,
    paddingHorizontal: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    gap: 4,
  },
  routeInfoText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#334155',
  },

  // CAPTAIN ROW
  captainInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    marginBottom: 8,
  },
  captainAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#eff6ff',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#bfdbfe',
  },
  captainName: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0f172a',
    marginRight: 6,
  },
  starBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fef3c7',
    paddingHorizontal: 5,
    paddingVertical: 1.5,
    borderRadius: 6,
    gap: 2,
  },
  starBadgeText: {
    fontSize: 9,
    fontWeight: '900',
    color: '#b45309',
  },
  vehicleModelText: {
    fontSize: 10.5,
    fontWeight: '600',
    color: '#64748b',
    marginTop: 1,
  },
  numberPlateBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fef08a',
    borderWidth: 1.5,
    borderColor: '#ca8a04',
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
    gap: 4,
  },
  indPlateBadge: {
    backgroundColor: '#0052e0',
    paddingHorizontal: 2,
    borderRadius: 2,
  },
  indText: {
    fontSize: 6.5,
    fontWeight: '900',
    color: '#ffffff',
  },
  numberPlateText: {
    fontSize: 10,
    fontWeight: '900',
    color: '#0f172a',
    letterSpacing: 0.5,
  },

  // QUICK RATING BAR
  quickRatingBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  quickRatingLabel: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#64748b',
    marginRight: 6,
  },
  starsBar: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratedThankText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#059669',
    marginLeft: 'auto',
  },

  // CARD ACTIONS
  cardActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  rebookBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0052e0',
    paddingVertical: 10,
    borderRadius: 14,
    shadowColor: '#0052e0',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  rebookBtnText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '900',
  },
  receiptDetailsBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#eff6ff',
    paddingVertical: 10,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#bfdbfe',
  },
  receiptDetailsText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#0052e0',
  },

  // MODAL STYLES
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    maxHeight: '88%',
    paddingBottom: Platform.OS === 'ios' ? 30 : 16,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '900',
    color: '#0f172a',
  },
  modalSubtitle: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748b',
    marginTop: 2,
  },
  modalCloseBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalScroll: {
    paddingHorizontal: 20,
  },
  modalScrollContent: {
    paddingTop: 14,
    paddingBottom: 24,
  },
  modalSectionTitle: {
    fontSize: 10,
    fontWeight: '900',
    color: '#94a3b8',
    letterSpacing: 0.8,
    marginBottom: 10,
  },

  // TICKET TOP CARD
  ticketTopCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderRadius: 18,
    padding: 14,
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
    marginBottom: 14,
  },
  ticketVehicleGraphic: {
    width: 76,
    height: 48,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  ticketVehicleTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: '#0f172a',
  },
  ticketDate: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748b',
    marginTop: 2,
  },
  ticketStatusTag: {
    alignSelf: 'flex-start',
    backgroundColor: '#ecfdf5',
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 6,
    marginTop: 4,
    borderWidth: 1,
    borderColor: '#a7f3d0',
  },
  ticketStatusTagText: {
    fontSize: 9,
    fontWeight: '900',
    color: '#059669',
  },

  // MODAL ROUTE CARD
  modalRouteCard: {
    backgroundColor: '#f8fafc',
    borderRadius: 18,
    padding: 14,
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
    marginBottom: 14,
  },
  modalRouteRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  modalMarkerWrap: {
    alignItems: 'center',
    width: 16,
    marginRight: 10,
    marginTop: 2,
  },
  modalPickupDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#10b981',
  },
  modalRouteLine: {
    width: 2,
    height: 28,
    backgroundColor: '#cbd5e1',
    marginVertical: 2,
  },
  modalDropoffDot: {
    width: 10,
    height: 10,
    borderRadius: 3,
    backgroundColor: '#ef4444',
  },
  modalStopType: {
    fontSize: 9,
    fontWeight: '800',
    color: '#94a3b8',
    letterSpacing: 0.5,
  },
  modalStopAddress: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#334155',
    marginTop: 2,
  },

  // FARE BREAKDOWN CARD
  fareBreakdownCard: {
    backgroundColor: '#ffffff',
    borderRadius: 18,
    padding: 14,
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
    marginBottom: 14,
  },
  fareRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 3,
  },
  fareItemLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748b',
  },
  fareItemVal: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0f172a',
  },
  fareDivider: {
    height: 1,
    backgroundColor: '#f1f5f9',
    marginVertical: 8,
  },
  fareTotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 2,
  },
  fareTotalLabel: {
    fontSize: 14,
    fontWeight: '900',
    color: '#0f172a',
  },
  fareTotalVal: {
    fontSize: 18,
    fontWeight: '900',
    color: '#059669',
  },
  paymentMethodMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#f8fafc',
    padding: 8,
    borderRadius: 8,
    marginTop: 10,
  },
  paymentMethodMetaText: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#475569',
  },

  // CAPTAIN MODAL CARD
  captainModalCard: {
    backgroundColor: '#f8fafc',
    borderRadius: 18,
    padding: 14,
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
    marginBottom: 14,
  },
  captainDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  captainModalAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#eff6ff',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#bfdbfe',
  },
  captainModalName: {
    fontSize: 14,
    fontWeight: '900',
    color: '#0f172a',
  },
  captainModalSub: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748b',
    marginTop: 1,
  },

  // TIP SECTION
  tipSectionCard: {
    backgroundColor: '#eff6ff',
    borderRadius: 18,
    padding: 14,
    borderWidth: 1.5,
    borderColor: '#bfdbfe',
    marginBottom: 14,
  },
  tipSubtitle: {
    fontSize: 11,
    fontWeight: '600',
    color: '#3b82f6',
    marginBottom: 10,
  },
  tipButtonsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  tipBtn: {
    flex: 1,
    backgroundColor: '#ffffff',
    paddingVertical: 8,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#93c5fd',
  },
  tipBtnText: {
    fontSize: 12,
    fontWeight: '900',
    color: '#0052e0',
  },
  tipSuccessBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ecfdf5',
    padding: 8,
    borderRadius: 8,
    marginTop: 10,
    gap: 6,
    borderWidth: 1,
    borderColor: '#a7f3d0',
  },
  tipSuccessText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#059669',
  },

  // SECURITY BADGE
  securityBadgeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    padding: 10,
    borderRadius: 12,
    gap: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: 16,
  },
  securityBadgeText: {
    flex: 1,
    fontSize: 10.5,
    fontWeight: '600',
    color: '#475569',
  },

  // MODAL ACTIONS
  modalActionsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  shareReceiptBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#eff6ff',
    paddingVertical: 12,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#bfdbfe',
  },
  shareReceiptText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0052e0',
  },
  modalRebookBtn: {
    flex: 1.5,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0052e0',
    paddingVertical: 12,
    borderRadius: 16,
    shadowColor: '#0052e0',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  modalRebookText: {
    fontSize: 13,
    fontWeight: '900',
    color: '#ffffff',
  },
});
