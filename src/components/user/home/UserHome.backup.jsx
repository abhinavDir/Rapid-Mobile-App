import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Pressable,
  Dimensions,
  SafeAreaView,
  Platform,
  Alert,
  StatusBar,
  PermissionsAndroid,
  BackHandler,
} from 'react-native';
import {
  fetchNearbyVendors,
  fetchAllVendors,
  requestRideApi,
  fetchRideStatusApi,
  searchPlacesApi,
  cancelRideApi,
  rateRideApi,
} from '../../../services/api';
import { calculateDistance } from '../../../utils/distance';
import storage from '../../../utils/storage';
import MapView from '../map/MapView';
import useNavigation from '../../../hooks/useNavigation';
import Navigation from '../../Navigation';
import Icon from '../../Icon';

// Modular Booking Components & Modals
import LocationStep from '../booking/LocationStep';
import VehicleStep from '../booking/VehicleStep';
import ActiveRideCard from '../booking/ActiveRideCard';
import DriverChatModal from '../booking/DriverChatModal';
import SafetySosModal from '../booking/SafetySosModal';
import FareBreakdownModal from '../booking/FareBreakdownModal';
import RatingModal from '../booking/RatingModal';
import SearchLocationModal from '../booking/SearchLocationModal';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function UserHome({
  user,
  onNavigate,
  routeParams = {},
  addToast = () => { },
}) {
  const [currentCoords, setCurrentCoords] = useState(null);
  const [isDetecting, setIsDetecting] = useState(false);
  const mapRef = useRef(null);

  const [shops, setShops] = useState([]);
  const [activeTab, setActiveTab] = useState('home');

  // Navigation Hook
  const {
    navigationState,
    routeData,
    startNavigation,
    selectRoute,
  } = useNavigation();

  // Booking States
  const [isLiveGpsEnabled, setIsLiveGpsEnabled] = useState(true);
  const [ridePickup, setRidePickup] = useState('');
  const [rideDropoff, setRideDropoff] = useState('');
  const [pickupCoords, setPickupCoords] = useState(null);
  const [dropoffCoords, setDropoffCoords] = useState(null);
  const [selectedVehicleType, setSelectedVehicleType] = useState('Bike');
  const [activeRide, setActiveRide] = useState(null);
  const [completedRide, setCompletedRide] = useState(null);
  const [isRequestingRide, setIsRequestingRide] = useState(false);
  const [customerRating, setCustomerRating] = useState(5);
  const [customerFeedback, setCustomerFeedback] = useState('Polite Captain');
  const [isSubmittingRating, setIsSubmittingRating] = useState(false);

  // Modals
  const [showSafetyModal, setShowSafetyModal] = useState(false);
  const [showChatModal, setShowChatModal] = useState(false);
  const [showFareModal, setShowFareModal] = useState(false);
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [searchModalInitialFocus, setSearchModalInitialFocus] = useState('dropoff');
  const [chatMessages, setChatMessages] = useState([
    {
      sender: 'driver',
      text: 'Hello! I am your Captain. I am heading towards your pickup location.',
      time: 'Just now',
    },
  ]);
  const [chatInputText, setChatInputText] = useState('');

  // 2-Step Flow: "location" | "vehicle"
  const [bookingStep, setBookingStep] = useState('location');

  // Nearby Rider Availability
  const [nearbyRiders, setNearbyRiders] = useState([]);
  const [isServiceAvailable, setIsServiceAvailable] = useState(null);

  // Live Location Search Suggestions
  const [realSuggestions, setRealSuggestions] = useState([]);
  const [showDropoffSuggestions, setShowDropoffSuggestions] = useState(false);
  const [showPickupSuggestions, setShowPickupSuggestions] = useState(false);
  const [pickupSuggestions, setPickupSuggestions] = useState([]);
  const [mapSelectionMode, setMapSelectionMode] = useState(null);

  const searchDebounceRef = useRef(null);
  const pickupDebounceRef = useRef(null);

  // Handle incoming route params (e.g. from Explore or Activity)
  useEffect(() => {
    if (routeParams.rebookRide) {
      const ride = routeParams.rebookRide;
      setRidePickup(ride.pickupAddress || '');
      setRideDropoff(ride.dropoffAddress || '');
      if (ride.pickupLocation?.coordinates) {
        setPickupCoords({
          latitude: ride.pickupLocation.coordinates[1],
          longitude: ride.pickupLocation.coordinates[0],
        });
      }
      if (ride.dropoffLocation?.coordinates) {
        setDropoffCoords({
          latitude: ride.dropoffLocation.coordinates[1],
          longitude: ride.dropoffLocation.coordinates[0],
        });
      }
      setBookingStep('vehicle');
    }
    if (routeParams.presetDropoff) {
      setRideDropoff(routeParams.presetDropoff);
      if (routeParams.dropoffCoords) {
        setDropoffCoords(routeParams.dropoffCoords);
      }
      setBookingStep('vehicle');
    }
    if (routeParams.preferredVehicle) {
      setSelectedVehicleType(routeParams.preferredVehicle);
      if (routeParams.isEcoEV) {
        addToast('Eco EV 20% discount coupon applied!', 'success');
      }
    }
  }, [routeParams]);

  // Mobile Hardware / Gesture Back Button Handling
  useEffect(() => {
    const handleHardwareBackPress = () => {
      // 1. Close open modals first
      if (showSearchModal) {
        setShowSearchModal(false);
        return true;
      }
      if (showSafetyModal) {
        setShowSafetyModal(false);
        return true;
      }
      if (showChatModal) {
        setShowChatModal(false);
        return true;
      }
      if (showFareModal) {
        setShowFareModal(false);
        return true;
      }

      // 2. Cancel map pin selection mode
      if (mapSelectionMode) {
        setMapSelectionMode(null);
        return true;
      }

      // 3. Step 2 (Choose Vehicle) -> go back to Step 1 (Set Route)
      if (bookingStep === 'vehicle' && !activeRide) {
        setBookingStep('location');
        return true;
      }

      // 4. If sheet is minimized (70% map / 30% sheet), mobile back button expands it back to 50%
      if (isSheetMinimized) {
        setIsSheetMinimized(false);
        return true;
      }

      // 5. If destination is filled on Step 1, mobile back button clears it
      if (rideDropoff && !activeRide) {
        setRideDropoff('');
        setDropoffCoords(null);
        return true;
      }

      // Return false to allow default Android behavior
      return false;
    };

    const backSub = BackHandler.addEventListener(
      'hardwareBackPress',
      handleHardwareBackPress
    );
    return () => backSub.remove();
  }, [
    showSearchModal,
    showSafetyModal,
    showChatModal,
    showFareModal,
    mapSelectionMode,
    bookingStep,
    activeRide,
    isSheetMinimized,
    rideDropoff,
  ]);

  // Cache and restore last known location immediately
  useEffect(() => {
    loadAllShops();
    // 1. Immediately restore saved location from cache if present
    try {
      const savedLoc = storage.getItem('user_last_known_location');
      if (savedLoc) {
        const parsed = JSON.parse(savedLoc);
        if (parsed && parsed.latitude && parsed.longitude) {
          setCurrentCoords(parsed);
          setPickupCoords(parsed);
          if (parsed.address) setRidePickup(parsed.address);
          checkNearbyRiderAvailability(parsed.latitude, parsed.longitude);
          return; // Skip auto-detect if we already have a saved location
        }
      }
    } catch (e) { }

    // 2. Immediately detect fresh live location (only if not found in storage)
    handleDetectLocation();
  }, []);

  const activeCoords = currentCoords || pickupCoords;

  const checkNearbyRiderAvailability = async (lat, lng) => {
    const targetLat = lat || pickupCoords?.latitude || activeCoords?.latitude;
    const targetLng = lng || pickupCoords?.longitude || activeCoords?.longitude;

    if (!targetLat || !targetLng) return;

    try {
      let riders = [];
      const res = await fetchNearbyVendors(targetLat, targetLng, 100000, false);
      if (res && res.success && Array.isArray(res.data) && res.data.length > 0) {
        riders = res.data;
      } else {
        const allRes = await fetchAllVendors();
        if (allRes && allRes.success && Array.isArray(allRes.data)) {
          riders = allRes.data;
        }
      }

      setNearbyRiders(riders);
      setIsServiceAvailable(riders.length > 0);
    } catch (err) {
      try {
        const allRes = await fetchAllVendors();
        if (allRes && allRes.success && Array.isArray(allRes.data)) {
          setNearbyRiders(allRes.data);
          setIsServiceAvailable(allRes.data.length > 0);
          return;
        }
      } catch (e) { }
      setNearbyRiders([]);
      setIsServiceAvailable(false);
    }
  };

  const isBikeAvailable = nearbyRiders.some(
    (r) => (r.vehicleType || 'Bike').toLowerCase() === 'bike'
  );
  const isAutoAvailable = nearbyRiders.some(
    (r) => (r.vehicleType || '').toLowerCase() === 'auto'
  );
  const isCarAvailable = nearbyRiders.some(
    (r) => ['car', 'cab', 'mini', 'sedan', 'suv'].includes((r.vehicleType || '').toLowerCase())
  );

  const isSelectedVehicleAvailable =
    selectedVehicleType === 'Bike'
      ? isBikeAvailable
      : selectedVehicleType === 'Auto'
        ? isAutoAvailable
        : isCarAvailable;

  useEffect(() => {
    if (isBikeAvailable && !isCarAvailable && !isAutoAvailable && selectedVehicleType !== 'Bike') {
      setSelectedVehicleType('Bike');
    }
  }, [isBikeAvailable, isCarAvailable, isAutoAvailable, selectedVehicleType]);

  // Pricing calculation
  let calculatedDistKm = 2.5;
  if (pickupCoords?.latitude && dropoffCoords?.latitude) {
    calculatedDistKm = calculateDistance(
      pickupCoords.latitude,
      pickupCoords.longitude,
      dropoffCoords.latitude,
      dropoffCoords.longitude
    );
    if (typeof calculatedDistKm !== 'number' || isNaN(calculatedDistKm)) {
      calculatedDistKm = 3.2;
    }
  } else if (rideDropoff) {
    calculatedDistKm = 3.8;
  }

  const bikePrice = Math.max(30, Math.round(calculatedDistKm * 12 + 25));
  const carPrice = Math.max(70, Math.round(calculatedDistKm * 22 + 50));
  const autoPrice = Math.max(40, Math.round(calculatedDistKm * 15 + 30));

  const getFare = (type) => {
    switch (type) {
      case 'Bike':
        return bikePrice;
      case 'Car':
        return carPrice;
      case 'Auto':
        return autoPrice;
      default:
        return bikePrice;
    }
  };
  const selectedFare = getFare(selectedVehicleType);

  const reverseGeocode = async (lat, lng) => {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&accept-language=en`,
        { headers: { 'User-Agent': 'UserApp/1.0' } }
      );
      const data = await res.json();
      if (data && data.display_name) {
        return data.display_name;
      }
    } catch (e) { }

    try {
      const res2 = await fetch(
        `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=en`
      );
      const data2 = await res2.json();
      if (data2 && (data2.locality || data2.city)) {
        return [data2.locality, data2.city, data2.principalSubdivision, data2.countryName].filter(Boolean).join(', ');
      }
    } catch (e) { }

    return `Live Location (${lat.toFixed(4)}, ${lng.toFixed(4)})`;
  };

  const [isSheetMinimized, setIsSheetMinimized] = useState(false);

  // Dynamic Map & Content Split:
  // Normal/Expanded: 50% Map & 50% Content
  // Minimized: 70% Map & 30% Content
  const MAP_HEIGHT_50 = Math.round(SCREEN_HEIGHT * 0.50);
  const MAP_HEIGHT_70 = Math.round(SCREEN_HEIGHT * 0.70);
  const currentMapHeight = isSheetMinimized ? MAP_HEIGHT_70 : MAP_HEIGHT_50;

  const requestLocationPermission = async () => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.requestMultiple([
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION,
        ]);
        return (
          granted[PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION] === PermissionsAndroid.RESULTS.GRANTED ||
          granted[PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION] === PermissionsAndroid.RESULTS.GRANTED
        );
      } catch (err) {
        console.warn('Location permission error:', err);
        return false;
      }
    }
    return true;
  };

  const fetchIpLocation = async () => {
    const endpoints = [
      'https://ipapi.co/json/',
      'https://ipwho.is/',
      'https://freeipapi.com/api/json',
    ];
    for (const url of endpoints) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3500);
        const res = await fetch(url, { signal: controller.signal });
        clearTimeout(timeoutId);
        const data = await res.json();
        const lat = parseFloat(data.latitude || data.lat);
        const lng = parseFloat(data.longitude || data.lon);
        if (!isNaN(lat) && !isNaN(lng) && lat !== 0 && lng !== 0) {
          return {
            latitude: lat,
            longitude: lng,
            city: data.city || data.region || '',
          };
        }
      } catch (e) { }
    }
    return null;
  };

  const applyDetectedCoords = async (lat, lng, source = 'GPS') => {
    if (!lat || !lng) return;
    const coords = { latitude: lat, longitude: lng };
    setCurrentCoords(coords);
    setPickupCoords(coords);

    // Keep location saved persistently
    try {
      storage.setItem(
        'user_last_known_location',
        JSON.stringify({ latitude: lat, longitude: lng, address: ridePickup || '' })
      );
    } catch (e) { }

    if (mapRef.current && mapRef.current.centerMap) {
      mapRef.current.centerMap(lat, lng, 16);
    }

    setIsDetecting(false);

    try {
      const fullAddr = await reverseGeocode(lat, lng);
      if (fullAddr) {
        setRidePickup(fullAddr);
        try {
          storage.setItem(
            'user_last_known_location',
            JSON.stringify({ latitude: lat, longitude: lng, address: fullAddr })
          );
        } catch (e) { }
      }
    } catch (e) { }

    await checkNearbyRiderAvailability(lat, lng);
  };

  const handleDetectLocation = async () => {
    setIsDetecting(true);
    setIsLiveGpsEnabled(true);

    // If we already have coordinates, immediately keep them visible while refreshing
    if (pickupCoords?.latitude && pickupCoords?.longitude) {
      if (mapRef.current && mapRef.current.centerMap) {
        mapRef.current.centerMap(pickupCoords.latitude, pickupCoords.longitude, 16);
      }
    }

    // 1. Request Android native permissions
    await requestLocationPermission();

    // 2. Instruct WebView Leaflet map to locate user via hardware GPS immediately
    if (mapRef.current && mapRef.current.locateUser) {
      mapRef.current.locateUser();
    }

    // 3. Try native geolocation API concurrently
    let hasDetected = false;
    try {
      const geo = navigator.geolocation || (typeof global !== 'undefined' && global.navigator?.geolocation);
      if (geo && typeof geo.getCurrentPosition === 'function') {
        geo.getCurrentPosition(
          async (position) => {
            if (position?.coords) {
              hasDetected = true;
              await applyDetectedCoords(position.coords.latitude, position.coords.longitude, 'GPS');
            }
          },
          (err) => {
            console.warn('Native geolocation info:', err);
          },
          { enableHighAccuracy: true, timeout: 5000, maximumAge: 10000 }
        );
      }
    } catch (e) { }

    // 4. Parallel IP geolocation fallback immediately if no coordinates exist yet
    if (!currentCoords && !pickupCoords) {
      fetchIpLocation().then(async (ipLoc) => {
        if (ipLoc && !hasDetected && !currentCoords) {
          hasDetected = true;
          await applyDetectedCoords(ipLoc.latitude, ipLoc.longitude, 'Network');
        }
      });
    }

    // Fallback safety timeout to stop spinner
    setTimeout(() => {
      setIsDetecting(false);
    }, 3500);
  };

  const handleGpsDetected = async (lat, lng) => {
    if (!lat || !lng) return;
    await applyDetectedCoords(lat, lng, 'GPS');
  };

  const toggleLiveGps = () => {
    handleDetectLocation();
  };

  // Autocomplete Pickup
  const handlePickupInputChange = (text) => {
    setShowDropoffSuggestions(false);
    setRidePickup(text);
    setShowPickupSuggestions(true);

    if (pickupDebounceRef.current) clearTimeout(pickupDebounceRef.current);
    if (!text.trim()) {
      setPickupSuggestions([]);
      return;
    }

    const userLat = activeCoords?.latitude || 26.8467;
    const userLng = activeCoords?.longitude || 80.9462;

    pickupDebounceRef.current = setTimeout(async () => {
      try {
        const query = text.trim();
        const res = await searchPlacesApi(query, userLat, userLng);
        const results = [];

        if (res.success && Array.isArray(res.data) && res.data.length > 0) {
          res.data.forEach((item) => {
            results.push({
              title: item.title || item.name.split(',')[0],
              name: item.name,
              type: item.distKm
                ? `${item.distKm.toFixed(1)} km • ${item.type}`
                : item.type || 'LOCATION',
              lat: parseFloat(item.lat),
              lng: parseFloat(item.lng),
            });
          });
        }
        setPickupSuggestions(results);
      } catch (err) {
        console.warn('Pickup place search error:', err);
      }
    }, 250);
  };

  const handleSelectPickupSuggestion = (place) => {
    setRidePickup(place.name);
    setShowPickupSuggestions(false);
    if (place.lat && place.lng) {
      setPickupCoords({ latitude: place.lat, longitude: place.lng });
      checkNearbyRiderAvailability(place.lat, place.lng);
    }
  };

  // Autocomplete Dropoff
  const handleDropoffInputChange = (text) => {
    setShowPickupSuggestions(false);
    setRideDropoff(text);
    setShowDropoffSuggestions(true);

    if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
    if (!text.trim()) {
      setRealSuggestions([
        {
          title: 'Hazratganj Market',
          name: 'Hazratganj Market, Lucknow, Uttar Pradesh',
          address: 'City Center, Lucknow',
          type: '12.4 km away',
          lat: 26.8467,
          lng: 80.9462,
        },
        {
          title: 'Charbagh Railway Station',
          name: 'Charbagh Railway Station, Lucknow, Uttar Pradesh',
          address: 'Transit Hub, Lucknow',
          type: '14.8 km away',
          lat: 26.832,
          lng: 80.918,
        },
        {
          title: 'Chowk Heritage Market',
          name: 'Chowk Heritage Market, Lucknow, Uttar Pradesh',
          address: 'Market Hub, Lucknow',
          type: '11.2 km away',
          lat: 26.8687,
          lng: 80.908,
        },
        {
          title: 'Gomti Nagar Wave Mall',
          name: 'Gomti Nagar Wave Mall, Lucknow, Uttar Pradesh',
          address: 'Shopping Hub, Lucknow',
          type: '16.5 km away',
          lat: 26.85,
          lng: 81.0,
        },
      ]);
      return;
    }

    const userLat = pickupCoords?.latitude || activeCoords?.latitude || 26.8467;
    const userLng = pickupCoords?.longitude || activeCoords?.longitude || 80.9462;

    searchDebounceRef.current = setTimeout(async () => {
      try {
        const query = text.trim();
        const res = await searchPlacesApi(query, userLat, userLng);
        const results = [];

        if (res.success && Array.isArray(res.data) && res.data.length > 0) {
          res.data.forEach((item) => {
            const lat = parseFloat(item.lat);
            const lng = parseFloat(item.lng || item.lon);
            const dist =
              item.distKm !== undefined && item.distKm !== null
                ? item.distKm
                : calculateDistance(userLat, userLng, lat, lng);
            if (dist <= 100) {
              results.push({
                title: item.title || item.name.split(',')[0],
                name: item.name,
                type: `${dist.toFixed(1)} km away • ${item.type || 'Place'}`,
                lat,
                lng,
                dist,
              });
            }
          });
        }
        setRealSuggestions(results);
      } catch (err) {
        console.warn('Live place search error:', err);
      }
    }, 250);
  };

  const handleSelectSuggestion = (place) => {
    setRideDropoff(place.name);
    setShowDropoffSuggestions(false);
    if (place.lat && place.lng) {
      setDropoffCoords({
        latitude: parseFloat(place.lat),
        longitude: parseFloat(place.lng),
      });
    }
  };

  const handleMapClick = async (lat, lng) => {
    setShowPickupSuggestions(false);
    setShowDropoffSuggestions(false);
    if (activeRide) return;
    try {
      if (mapSelectionMode === 'pickup') {
        setIsLiveGpsEnabled(false);
        const fullAddr = await reverseGeocode(lat, lng);
        setRidePickup(fullAddr);
        setPickupCoords({ latitude: lat, longitude: lng });
        checkNearbyRiderAvailability(lat, lng);
        setMapSelectionMode(null);
        addToast('Point A (Pickup) pinned on map!', 'success');
      } else {
        const fullAddr = await reverseGeocode(lat, lng);
        setRideDropoff(fullAddr);
        setDropoffCoords({ latitude: lat, longitude: lng });
        setMapSelectionMode(null);
        addToast('Point B (Dropoff) pinned on map!', 'success');
      }
    } catch (e) {
      console.warn('Map click error:', e);
    }
  };

  // Step 1 -> Step 2
  const handleProceedToVehicles = (overridePickup, overrideDropoff) => {
    const pickup = (overridePickup !== undefined && overridePickup !== '')
      ? overridePickup
      : (ridePickup || 'Current Location');
    const dropoff = (overrideDropoff !== undefined && overrideDropoff !== '')
      ? overrideDropoff
      : rideDropoff;

    if (!dropoff) {
      addToast('Please choose your destination (Point B).', 'warning');
      return;
    }

    if (!ridePickup) {
      setRidePickup(pickup);
    }
    if (dropoff && dropoff !== rideDropoff) {
      setRideDropoff(dropoff);
    }

    if (calculatedDistKm > 100) {
      addToast(
        `Max ride distance is 100 km (Current: ${calculatedDistKm.toFixed(1)} km).`,
        'error'
      );
      return;
    }
    setBookingStep('vehicle');
    setIsSheetMinimized(false);
  };


  // Poll Active Ride Status
  useEffect(() => {
    if (!activeRide || activeRide.status === 'CANCELLED') return;

    let isMounted = true;
    const checkRideStatus = async () => {
      try {
        const res = await fetchRideStatusApi(activeRide._id);
        if (res.success && res.data && isMounted) {
          const oldStatus = activeRide.status;

          if (res.data.status === 'COMPLETED') {
            setCompletedRide(res.data);
            setActiveRide(null);
            addToast('Journey Completed! Thank you for choosing RapidRide.', 'success');
            return;
          }

          setActiveRide(res.data);
          if (res.data.status === 'ACCEPTED' && oldStatus !== 'ACCEPTED') {
            addToast(
              `Captain ${res.data.assignedRiderName || 'Rider'} is coming to pick you up!`,
              'success'
            );
          } else if (res.data.status === 'IN_PROGRESS' && oldStatus !== 'IN_PROGRESS') {
            addToast('Journey Started! Heading to destination', 'info');
          }
        }
      } catch (err) {
        console.warn('Error polling ride status:', err);
      }
    };

    const interval = setInterval(checkRideStatus, 2000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [activeRide?._id, activeRide?.status]);

  const handleBookRide = async (overrideVehicleType, overrideFare) => {
    const vType = overrideVehicleType || selectedVehicleType || 'Bike';
    const finalPickup = ridePickup || 'Current Location';
    const finalDropoff = rideDropoff;

    if (!finalDropoff) {
      addToast('Please specify a destination to request ride.', 'error');
      return;
    }

    let pLat = pickupCoords?.latitude || activeCoords?.latitude || 26.8467;
    let pLng = pickupCoords?.longitude || activeCoords?.longitude || 80.9462;
    let dLat = dropoffCoords?.latitude || pLat + 0.02;
    let dLng = dropoffCoords?.longitude || pLng + 0.02;

    const finalDistKm = calculateDistance(pLat, pLng, dLat, dLng) || calculatedDistKm || 3.5;
    const finalFare = overrideFare || getFare(vType);

    // 1. Immediately switch to PENDING state (Radar / Finding captain screen)
    const initialPendingRide = {
      _id: `RR-${Date.now().toString().slice(-6)}`,
      status: 'PENDING',
      vehicleType: vType,
      pickupAddress: finalPickup,
      dropoffAddress: finalDropoff,
      pickupLocation: {
        type: 'Point',
        coordinates: [pLng, pLat],
      },
      dropoffLocation: {
        type: 'Point',
        coordinates: [dLng, dLat],
      },
      fare: finalFare,
      distanceKm: finalDistKm,
      otp: Math.floor(1000 + Math.random() * 9000).toString(),
      createdAt: new Date().toISOString(),
    };

    setActiveRide(initialPendingRide);
    setIsRequestingRide(false);
    setIsSheetMinimized(false);

    try {
      const res = await requestRideApi({
        userId: user?._id || user?.id || null,
        userName: user?.name || 'Passenger',
        userPhone: user?.phone || '9876543210',
        vehicleType: vType,
        pickupAddress: finalPickup,
        dropoffAddress: finalDropoff,
        pickupLat: pLat,
        pickupLng: pLng,
        dropoffLat: dLat,
        dropoffLng: dLng,
        fare: finalFare,
        distanceKm: finalDistKm,
      });

      if (res && res.success && res.data) {
        setActiveRide(res.data);
      }
    } catch (err) {
      console.warn('Ride request background notice:', err);
    }
  };

  const handleSendChatMessage = (text) => {
    const msg = (text || chatInputText).trim();
    if (!msg) return;
    const newMsg = {
      sender: 'user',
      text: msg,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setChatMessages((prev) => [...prev, newMsg]);
    setChatInputText('');

    setTimeout(() => {
      const replies = [
        'Understood! Arriving shortly at the pickup spot.',
        'Got it! Thanks for the update.',
        'Noted! Driving carefully to your location.',
        'Yes, see you in 2 minutes!',
      ];
      const selected = replies[Math.floor(Math.random() * replies.length)];
      setChatMessages((prev) => [
        ...prev,
        {
          sender: 'driver',
          text: selected,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    }, 1100);
  };

  const loadAllShops = async () => {
    try {
      const data = await fetchAllVendors();
      if (data.success) setShops(data.data || []);
    } catch (err) { }
  };

  // Dynamic live distance & ETA
  let liveTripDistKm = null;
  let liveTripEtaMins = null;
  if (activeRide && (activeRide.status === 'ACCEPTED' || activeRide.status === 'IN_PROGRESS')) {
    const rLat = activeRide.riderLocation?.lat || activeRide.pickupLocation?.coordinates?.[1];
    const rLng = activeRide.riderLocation?.lng || activeRide.pickupLocation?.coordinates?.[0];
    const isPhase1 = activeRide.status === 'ACCEPTED';
    const targetLat = isPhase1
      ? activeRide.pickupLocation?.coordinates?.[1] || pickupCoords?.latitude
      : activeRide.dropoffLocation?.coordinates?.[1] || dropoffCoords?.latitude;
    const targetLng = isPhase1
      ? activeRide.pickupLocation?.coordinates?.[0] || pickupCoords?.longitude
      : activeRide.dropoffLocation?.coordinates?.[0] || dropoffCoords?.longitude;

    if (rLat && rLng && targetLat && targetLng) {
      liveTripDistKm = calculateDistance(rLat, rLng, targetLat, targetLng);
      liveTripEtaMins = Math.max(1, Math.round(liveTripDistKm * 2.5));
    }
  }

  return (
    <View style={styles.root}>
      {/* 1. TOP 55% INTERACTIVE MAP SECTION */}
      <View style={[styles.mapSection, { height: currentMapHeight }]}>
        <MapView
          ref={mapRef}
          currentCoords={activeCoords}
          pickupCoords={pickupCoords}
          dropoffCoords={dropoffCoords}
          pickupAddress={ridePickup}
          dropoffAddress={rideDropoff}
          nearbyRiders={nearbyRiders}
          isServiceAvailable={isServiceAvailable}
          distanceKm={calculatedDistKm}
          selectedFare={selectedFare}
          selectedVehicleType={selectedVehicleType}
          activeRide={activeRide}
          mapSelectionMode={mapSelectionMode}
          setMapSelectionMode={setMapSelectionMode}
          onMapClick={handleMapClick}
          onGpsDetected={handleGpsDetected}
        />

        {/* FLOATING TOP APP BAR (LOCATION PILL + PROFILE AVATAR) */}
        {!activeRide && bookingStep === 'location' && (
          <SafeAreaView style={styles.topBarSafe}>
            <View style={styles.floatingTopBar}>
              {/* Current Location Pill */}
              <TouchableOpacity
                onPress={handleDetectLocation}
                style={styles.locationPill}
                activeOpacity={0.8}
              >
                <View style={styles.locDotWrapper}>
                  <View
                    style={[
                      styles.liveGpsDot,
                      isDetecting && styles.liveGpsDotDetecting,
                    ]}
                  />
                </View>
                <View style={styles.locTextCol}>
                  <Text style={styles.locLabelSmall}>CURRENT LOCATION</Text>
                  <Text style={styles.locAddressText} numberOfLines={1}>
                    {isDetecting
                      ? 'Detecting GPS...'
                      : ridePickup
                        ? ridePickup.split(',')[0]
                        : 'Locating...'}
                  </Text>
                </View>
                <Icon
                  name={isDetecting ? 'sync' : 'my_location'}
                  size={16}
                  color="#0052e0"
                />
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => onNavigate && onNavigate('profile')}
                style={styles.avatarBtn}
              >
                <Text style={styles.avatarInitial}>
                  {user?.name ? user.name.slice(0, 1).toUpperCase() : 'U'}
                </Text>
              </TouchableOpacity>
            </View>
          </SafeAreaView>
        )}

        {/* FLOATING BACK BUTTON ON VEHICLE STEP */}
        {bookingStep === 'vehicle' && !activeRide && (
          <SafeAreaView style={styles.backBtnSafe}>
            <Pressable
              onPress={() => setBookingStep('location')}
              style={styles.floatingBackBtn}
              accessibilityRole="button"
              accessibilityLabel="Back to location step"
              hitSlop={8}
            >
              <Icon name="arrow_back" size={20} color="#0f172a" />
            </Pressable>
          </SafeAreaView>
        )}

        {/* FLOATING MY LOCATION FAB ON MAP */}
        <View style={styles.mapFabContainer}>
          <Pressable
            onPress={handleDetectLocation}
            style={styles.fabBtn}
            accessibilityRole="button"
            accessibilityLabel="Detect current location"
            hitSlop={8}
          >
            <Icon
              name={isDetecting ? 'sync' : 'my_location'}
              size={20}
              color="#0052e0"
            />
          </Pressable>
        </View>
      </View>

      {/* 2. BOTTOM 50% / 30% SCROLLABLE CONTENT SECTION */}
      <View style={[styles.contentSection, { flex: 1 }]}>
        {isSheetMinimized ? (
          /* DEDICATED 30% MINIMIZED PANEL */
          <TouchableOpacity
            onPress={() => setIsSheetMinimized(false)}
            style={styles.minimizedFullBar}
            activeOpacity={0.9}
          >
            <View style={styles.sheetHandleMini} />
            <View style={styles.minimizedBarRow}>
              <View style={styles.minimizedIconBox}>
                <Icon
                  name={activeRide ? 'directions_car' : bookingStep === 'vehicle' ? 'two_wheeler' : 'location_on'}
                  size={18}
                  color="#0052e0"
                />
              </View>

              <View style={styles.minimizedTextCol}>
                <View style={styles.minimizedStepRow}>
                  <Text style={styles.minimizedStepTag}>
                    {activeRide
                      ? 'LIVE TRIP'
                      : bookingStep === 'vehicle'
                        ? 'STEP 2 OF 2'
                        : 'STEP 1 OF 2'}
                  </Text>
                  <Text style={styles.minimizedStepTitle}>
                    {activeRide
                      ? (activeRide.status === 'PENDING' ? 'Finding Captain' : 'In Progress')
                      : bookingStep === 'vehicle'
                        ? 'Choose Vehicle'
                        : 'Set Route'}
                  </Text>
                </View>
                <Text style={styles.minimizedSubtitle} numberOfLines={1}>
                  {activeRide
                    ? `Destination: ${activeRide.dropoffAddress?.split(',')[0] || 'Selected'}`
                    : rideDropoff
                      ? `To: ${rideDropoff.split(',')[0]}`
                      : '70% Map View active'}
                </Text>
              </View>

              {/* HIGH VISIBILITY PROMINENT EXPAND BUTTON */}
              <Pressable
                onPress={() => setIsSheetMinimized(false)}
                style={styles.prominentExpandBtn}
                accessibilityRole="button"
                accessibilityLabel="Expand booking panel"
                hitSlop={8}
              >
                <Icon name="expand_less" size={16} color="#ffffff" />
                <Text style={styles.prominentExpandText}>Expand 50%</Text>
              </Pressable>
            </View>

            {/* Quick destination or summary preview in 30% sheet */}
            <View style={styles.minimizedQuickPreview}>
              <View style={styles.minimizedPreviewLeft}>
                <Icon name="travel_explore" size={14} color="#0052e0" />
                <Text style={styles.minimizedPreviewText} numberOfLines={1}>
                  {rideDropoff
                    ? `Destination: ${rideDropoff}`
                    : '70% Map • Press mobile back to expand'}
                </Text>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 2 }}>
                <Text style={styles.minimizedTapHint}>Expand</Text>
                <Icon name="expand_less" size={12} color="#0052e0" />
              </View>
            </View>
          </TouchableOpacity>
        ) : (
          /* EXPANDED 50% STATE */
          <View style={styles.expandedWrapper}>
            <View style={styles.sheetHeaderBar}>
              <View style={styles.sheetHandle} />
              <View style={styles.headerControlsRow}>
                {/* Step Status Pill */}
                <View style={styles.stepBadgePill}>
                  <View
                    style={[
                      styles.stepDot,
                      activeRide ? styles.stepDotActive : styles.stepDotNormal,
                    ]}
                  />
                  <Text style={styles.stepBadgeText}>
                    {activeRide
                      ? (activeRide.status === 'PENDING' ? 'FINDING CAPTAIN' : 'LIVE TRIP')
                      : bookingStep === 'vehicle'
                        ? 'STEP 2 OF 2 • CHOOSE VEHICLE'
                        : 'STEP 1 OF 2 • SET ROUTE'}
                  </Text>
                </View>

                {/* Minimize / Full Map Button */}
                <Pressable
                  onPress={() => setIsSheetMinimized(true)}
                  style={styles.minimizeBtn}
                  accessibilityRole="button"
                  accessibilityLabel="Minimize panel for 70% map"
                  hitSlop={8}
                >
                  <Icon name="expand_more" size={14} color="#0052e0" />
                  <Text style={styles.minimizeBtnText}>70% Map</Text>
                </Pressable>
              </View>
            </View>

            <View style={styles.stepContentScrollableWrapper}>
              {activeRide ? (
                <ActiveRideCard
                  activeRide={activeRide}
                  liveTripDistKm={liveTripDistKm}
                  liveTripEtaMins={liveTripEtaMins}
                  onCancelRequest={async () => {
                    if (activeRide?._id) {
                      try {
                        await cancelRideApi(activeRide._id, 'Cancelled by user');
                      } catch (e) { }
                    }
                    setActiveRide(null);
                    addToast('Ride search cancelled.', 'info');
                  }}
                  onOpenChat={() => setShowChatModal(true)}
                  onOpenSafety={() => setShowSafetyModal(true)}
                  onOpenFare={() => setShowFareModal(true)}
                />
              ) : bookingStep === 'location' ? (
                <LocationStep
                  ridePickup={ridePickup}
                  rideDropoff={rideDropoff}
                  mapSelectionMode={mapSelectionMode}
                  isLiveGpsEnabled={isLiveGpsEnabled}
                  onOpenSearchModal={(field) => {
                    setSearchModalInitialFocus(field || 'dropoff');
                    setShowSearchModal(true);
                  }}
                  onToggleMapMode={(mode) => {
                    const nextMode = mapSelectionMode === mode ? null : mode;
                    setMapSelectionMode(nextMode);
                    if (nextMode === 'dropoff') {
                      addToast('Tap on the map to pin Dropoff', 'info');
                    }
                  }}
                  onToggleLiveGps={toggleLiveGps}
                  onClearDropoff={() => {
                    setRideDropoff('');
                    setDropoffCoords(null);
                  }}
                  onSubmitRoute={handleProceedToVehicles}
                />
              ) : (
                <VehicleStep
                  calculatedDistKm={calculatedDistKm}
                  ridePickup={ridePickup}
                  rideDropoff={rideDropoff}
                  pickupCoords={pickupCoords}
                  nearbyRiders={nearbyRiders}
                  selectedVehicleType={selectedVehicleType}
                  setSelectedVehicleType={setSelectedVehicleType}
                  isBikeAvailable={isBikeAvailable}
                  isCarAvailable={isCarAvailable}
                  isAutoAvailable={isAutoAvailable}
                  bikePrice={bikePrice}
                  carPrice={carPrice}
                  autoPrice={autoPrice}
                  selectedFare={selectedFare}
                  isSelectedVehicleAvailable={isSelectedVehicleAvailable}
                  isRequestingRide={isRequestingRide}
                  onBack={() => setBookingStep('location')}
                  onConfirmBooking={(type, fare) => handleBookRide(type, fare)}
                />
              )}
            </View>
          </View>
        )}
      </View>



      {/* MODALS */}
      <RatingModal
        completedRide={completedRide}
        customerRating={customerRating}
        setCustomerRating={setCustomerRating}
        customerFeedback={customerFeedback}
        setCustomerFeedback={setCustomerFeedback}
        isSubmittingRating={isSubmittingRating}
        onSubmitRating={async () => {
          setIsSubmittingRating(true);
          try {
            if (completedRide?._id && customerRating) {
              await rateRideApi(completedRide._id, customerRating, customerFeedback);
              addToast(`Rated ${customerRating} stars for Captain.`, 'success');
            }
          } catch (e) {
          } finally {
            setIsSubmittingRating(false);
            setCompletedRide(null);
            setActiveRide(null);
            setRideDropoff('');
            setDropoffCoords(null);
            setBookingStep('location');
            handleDetectLocation();
          }
        }}
      />

      <SafetySosModal
        show={showSafetyModal}
        onClose={() => setShowSafetyModal(false)}
        activeRide={activeRide}
      />

      <DriverChatModal
        show={showChatModal}
        onClose={() => setShowChatModal(false)}
        activeRide={activeRide}
        chatMessages={chatMessages}
        chatInputText={chatInputText}
        setChatInputText={setChatInputText}
        onSendMessage={handleSendChatMessage}
      />

      <FareBreakdownModal
        show={showFareModal}
        onClose={() => setShowFareModal(false)}
        activeRide={activeRide}
      />

      <SearchLocationModal
        visible={showSearchModal}
        onClose={() => setShowSearchModal(false)}
        ridePickup={ridePickup}
        rideDropoff={rideDropoff}
        pickupCoords={pickupCoords}
        dropoffCoords={dropoffCoords}
        initialFocus={searchModalInitialFocus}
        onSelectPickup={(place) => {
          setRidePickup(place.name);
          if (place.lat && place.lng) {
            const detected = { latitude: place.lat, longitude: place.lng };
            setPickupCoords(detected);
            checkNearbyRiderAvailability(place.lat, place.lng);
            if (mapRef.current && mapRef.current.centerMap) {
              mapRef.current.centerMap(place.lat, place.lng, 16);
            }
          }
        }}
        onSelectDropoff={(place) => {
          setRideDropoff(place.name);
          if (place.lat && place.lng) {
            const dCoords = { latitude: place.lat, longitude: place.lng };
            setDropoffCoords(dCoords);
          }
        }}
        onUseLiveLocation={() => {
          handleDetectLocation();
        }}
        onChooseOnMap={(targetField) => {
          const mode = targetField === 'pickup' ? 'pickup' : 'dropoff';
          setMapSelectionMode(mode);
          addToast(`Tap on map to pin ${mode === 'pickup' ? 'Point A' : 'Point B'}`, 'info');
        }}
        onConfirmRoute={(placeB) => {
          const dropoffName = placeB?.name || rideDropoff;
          const pickupName = placeB?.pickupName || ridePickup || 'Current Location';

          if (placeB?.lat && placeB?.lng) {
            setDropoffCoords({ latitude: placeB.lat, longitude: placeB.lng });
          }
          if (placeB?.pickupLat && placeB?.pickupLng) {
            setPickupCoords({ latitude: placeB.pickupLat, longitude: placeB.pickupLng });
          }
          if (dropoffName) {
            setRideDropoff(dropoffName);
          }
          if (pickupName && !ridePickup) {
            setRidePickup(pickupName);
          }
          setShowSearchModal(false);
          handleProceedToVehicles(pickupName, dropoffName);
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  mapSection: {
    width: '100%',
    position: 'relative',
    overflow: 'hidden',
  },
  contentSection: {
    width: '100%',
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: -6 },
    shadowOpacity: 0.14,
    shadowRadius: 16,
    elevation: 20,
    overflow: 'hidden',
    borderTopWidth: 1.5,
    borderColor: '#e2e8f0',
    marginTop: -16,
    zIndex: 50,
  },
  stepContentScrollableWrapper: {
    flex: 1,
    overflow: 'hidden',
  },
  mapFabContainer: {
    position: 'absolute',
    right: 16,
    bottom: 24,
    zIndex: 40,
  },
  sheetHeaderBar: {
    paddingTop: 6,
    paddingBottom: 2,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  sheetHandle: {
    width: 44,
    height: 4.5,
    borderRadius: 3,
    backgroundColor: '#cbd5e1',
    alignSelf: 'center',
    marginBottom: 6,
  },
  headerControlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 6,
  },
  stepBadgePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f1f5f9',
    paddingVertical: 3.5,
    paddingHorizontal: 9,
    borderRadius: 12,
    gap: 6,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  stepDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  stepDotNormal: {
    backgroundColor: '#0052e0',
  },
  stepDotActive: {
    backgroundColor: '#10b981',
  },
  stepBadgeText: {
    fontSize: 9.5,
    fontWeight: '900',
    color: '#334155',
    letterSpacing: 0.5,
  },
  minimizeBtn: {
    backgroundColor: '#eff6ff',
    paddingVertical: 3.5,
    paddingHorizontal: 9,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#bfdbfe',
  },
  minimizeBtnText: {
    fontSize: 10.5,
    fontWeight: '800',
    color: '#0052e0',
  },
  topBarSafe: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 50,
  },
  floatingTopBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 24) + 8 : 10,
    gap: 10,
  },
  topBarBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 5,
  },
  locationPill: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 24,
    height: 44,
    paddingHorizontal: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 5,
    gap: 8,
  },
  locDotWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  liveGpsDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#10b981',
  },
  liveGpsDotDetecting: {
    backgroundColor: '#f59e0b',
  },
  locTextCol: {
    flex: 1,
  },
  locLabelSmall: {
    fontSize: 9,
    fontWeight: '900',
    color: '#0052e0',
    letterSpacing: 0.5,
  },
  locAddressText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#0f172a',
  },
  avatarBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#ffffff',
    borderWidth: 1.5,
    borderColor: '#3b82f6',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 5,
  },
  avatarInitial: {
    color: '#0052e0',
    fontSize: 18,
    fontWeight: '900',
  },
  backBtnSafe: {
    position: 'absolute',
    top: Platform.OS === 'android' ? (StatusBar.currentHeight || 24) + 8 : 12,
    left: 16,
    zIndex: 50,
  },
  floatingBackBtn: {
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
  fabBtn: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: '#ffffff',
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.18,
    shadowRadius: 6,
    elevation: 6,
  },
  bottomSheetWrapper: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 50,
  },
  bottomSheet: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingTop: 8,
    paddingBottom: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.18,
    shadowRadius: 14,
    elevation: 25,
    overflow: 'hidden',
  },
  expandedWrapper: {
    flex: 1,
  },
  minimizedFullBar: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 76,
    justifyContent: 'flex-start',
    backgroundColor: '#ffffff',
  },
  minimizedQuickPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginTop: 10,
    gap: 8,
  },
  minimizedPreviewLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  minimizedPreviewText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#334155',
    flex: 1,
  },
  minimizedTapHint: {
    fontSize: 11,
    fontWeight: '800',
    color: '#0052e0',
  },
  sheetHandleMini: {
    width: 38,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#cbd5e1',
    alignSelf: 'center',
    marginBottom: 8,
  },
  minimizedBarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  minimizedIconBox: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#eff6ff',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#bfdbfe',
  },
  minimizedTextCol: {
    flex: 1,
    minWidth: 0,
  },
  minimizedStepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 2,
  },
  minimizedStepTag: {
    fontSize: 9,
    fontWeight: '900',
    color: '#0052e0',
    letterSpacing: 0.5,
    backgroundColor: '#eff6ff',
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 4,
  },
  minimizedStepTitle: {
    fontSize: 12.5,
    fontWeight: '800',
    color: '#0f172a',
  },
  minimizedSubtitle: {
    fontSize: 11,
    color: '#64748b',
    fontWeight: '600',
  },
  prominentExpandBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0052e0',
    paddingVertical: 9,
    paddingHorizontal: 14,
    borderRadius: 18,
    gap: 5,
    shadowColor: '#0052e0',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.35,
    shadowRadius: 6,
    elevation: 6,
  },
  prominentExpandText: {
    fontSize: 12,
    fontWeight: '900',
    color: '#ffffff',
    letterSpacing: 0.3,
  },
  drawerOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    zIndex: 100,
  },
  drawerSheet: {
    width: '78%',
    height: '100%',
    backgroundColor: '#ffffff',
    paddingTop: Platform.OS === 'android' ? 40 : 54,
    paddingHorizontal: 20,
    justifyContent: 'space-between',
    paddingBottom: 24,
  },
  drawerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    paddingBottom: 16,
  },
  drawerProfileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  drawerAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#0052e0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  drawerAvatarText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '900',
  },
  drawerName: {
    fontSize: 16,
    fontWeight: '900',
    color: '#0f172a',
  },
  drawerPhone: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 2,
  },
  drawerCloseBtn: {
    padding: 6,
  },
  drawerCloseText: {
    fontSize: 18,
    fontWeight: '900',
    color: '#94a3b8',
  },
  drawerLinks: {
    gap: 14,
    marginTop: 20,
    flex: 1,
  },
  drawerLinkItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 6,
  },
  drawerIconBox: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  drawerLinkText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0f172a',
  },
  drawerFooter: {
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    paddingTop: 14,
  },
  drawerBrandTag: {
    fontSize: 12,
    fontWeight: '800',
    color: '#0052e0',
  },
});
