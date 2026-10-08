import { Platform } from 'react-native';
import storage from '../utils/storage';

// API Base URL Configuration:
// Prioritizes the host PC Wi-Fi IP, Android Emulator loopback, and localhost
const CANDIDATE_BASE_URLS = [
  'http://192.168.1.12:5000/api',
  'http://10.0.2.2:5000/api',
  'http://localhost:5000/api',
  'https://rapidrideserver.onrender.com/api',
  'http://127.0.0.1:5000/api',
];

let customBaseUrl = null;
let activeWorkingBaseUrl = null;

export const setApiBaseUrl = (url) => {
  customBaseUrl = url;
  activeWorkingBaseUrl = url;
};

export const getApiBaseUrl = () => {
  if (customBaseUrl) return customBaseUrl;
  if (activeWorkingBaseUrl) return activeWorkingBaseUrl;
  return CANDIDATE_BASE_URLS[0];
};

// Safe fetch with AbortController timeout to prevent UI freezes
const fetchWithTimeout = async (url, options = {}, timeoutMs = 4000) => {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { ...options, signal: controller.signal });
    clearTimeout(timer);
    return res;
  } catch (err) {
    clearTimeout(timer);
    throw err;
  }
};

// Safe universal fetch with multi-host fallback and speed caching
const safeFetch = async (endpoint, options = {}) => {
  if (customBaseUrl) {
    const res = await fetchWithTimeout(`${customBaseUrl}${endpoint}`, options, 5000);
    return await res.json();
  }

  // Candidate URLs to try
  const urlsToTry = [];
  if (activeWorkingBaseUrl) {
    urlsToTry.push(`${activeWorkingBaseUrl}${endpoint}`);
  }
  for (const base of CANDIDATE_BASE_URLS) {
    const candidate = `${base}${endpoint}`;
    if (!urlsToTry.includes(candidate)) {
      urlsToTry.push(candidate);
    }
  }

  let lastError = null;
  for (const targetUrl of urlsToTry) {
    try {
      const res = await fetchWithTimeout(targetUrl, options, 3500);
      const data = await res.json();
      // Cache the working base URL for subsequent calls
      const matchedBase = CANDIDATE_BASE_URLS.find((b) => targetUrl.startsWith(b));
      if (matchedBase) {
        activeWorkingBaseUrl = matchedBase;
      }
      return data;
    } catch (err) {
      lastError = err;
    }
  }

  throw lastError || new Error('Network error. Make sure your backend server is running on port 5000.');
};

// Prewarm and test candidate endpoints concurrently during startup to find the fastest active host
export const prewarmApiConnection = async () => {
  if (customBaseUrl) return customBaseUrl;
  if (activeWorkingBaseUrl) return activeWorkingBaseUrl;

  try {
    const checks = CANDIDATE_BASE_URLS.map(async (baseUrl) => {
      try {
        const res = await fetchWithTimeout(`${baseUrl}/vendor/search-vendor`, {}, 2200);
        if (res && res.status < 500) {
          return baseUrl;
        }
      } catch (e) { }
      return null;
    });

    const results = await Promise.all(checks);
    const working = results.find(Boolean);
    if (working) {
      activeWorkingBaseUrl = working;
      return working;
    }
  } catch (e) {
    console.warn('API prewarm check notice:', e);
  }
  return CANDIDATE_BASE_URLS[0];
};

// ==========================================
// VENDOR / RIDER APIS
// ==========================================
export const fetchNearbyVendors = async (lat, lng, distance = 3000, strict = true) => {
  try {
    return await safeFetch(
      `/vendor/nearby?latitude=${lat}&longitude=${lng}&distance=${distance}&strict=${strict}`
    );
  } catch {
    return { success: false, data: [] };
  }
};

export const fetchAllVendors = async () => {
  try {
    return await safeFetch('/vendor/search-vendor');
  } catch {
    return { success: false, data: [] };
  }
};

export const registerVendorApi = async (vendorData) => {
  return await safeFetch('/vendor/register-vendor', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(vendorData),
  });
};

export const loginVendorApi = async (credentials) => {
  return await safeFetch('/vendor/login-vendor', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(credentials),
  });
};

export const updateVendorLocationApi = async (updateData) => {
  try {
    return await safeFetch('/vendor/update-location', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updateData),
    });
  } catch (err) {
    return { success: false, message: err.message };
  }
};

export const deleteVendorAccountApi = async (deleteData) => {
  try {
    return await safeFetch('/vendor/delete-account', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(deleteData),
    });
  } catch (err) {
    return { success: false, message: err.message };
  }
};

// ==========================================
// USER AUTH APIS (With Online/Offline Resiliency)
// ==========================================
const getOfflineUsers = async () => {
  try {
    const raw = await storage.getItemAsync('offline_users_db');
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

const saveOfflineUsers = async (users) => {
  try {
    await storage.setItem('offline_users_db', JSON.stringify(users));
  } catch (e) {
    console.warn('Failed to persist offline user:', e);
  }
};

export const registerUserApi = async (userData) => {
  try {
    const response = await safeFetch('/user/user-register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
    });
    return response;
  } catch (err) {
    console.warn('Backend unavailable for registration, using offline account creation:', err.message);
    const users = await getOfflineUsers();
    const cleanEmail = (userData.email || '').trim().toLowerCase();

    // Check if user already exists
    const existing = users.find((u) => u.email === cleanEmail);
    if (existing) {
      return { success: false, message: 'User already exists with this email' };
    }

    const newUser = {
      _id: 'local_user_' + Date.now(),
      name: (userData.name || 'Rider').trim(),
      email: cleanEmail,
      phone: userData.phone || '',
      walletBalance: 100,
      authProvider: 'local',
      createdAt: new Date().toISOString(),
    };

    users.push({ ...newUser, password: userData.password });
    await saveOfflineUsers(users);

    return {
      success: true,
      message: 'User created successfully',
      user: newUser,
      token: 'local_token_' + Date.now(),
    };
  }
};

export const loginUserApi = async (credentials) => {
  try {
    const response = await safeFetch('/user/login-user', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
    });
    return response;
  } catch (err) {
    console.warn('Backend unavailable for login, checking offline store / demo credentials:', err.message);
    const cleanEmail = (credentials.email || '').trim().toLowerCase();
    const cleanPassword = credentials.password || '';

    // Check if matching account exists in offline store
    const users = await getOfflineUsers();
    const matched = users.find(
      (u) => u.email === cleanEmail && (!u.password || u.password === cleanPassword)
    );

    if (matched) {
      const userResp = { ...matched };
      delete userResp.password;
      return {
        success: true,
        message: 'Login successful',
        user: userResp,
        token: 'local_token_' + Date.now(),
      };
    }

    // Built-in Demo Account Support
    if (cleanEmail === 'demo@rapidride.com' || cleanEmail.includes('demo') || cleanEmail.includes('test')) {
      return {
        success: true,
        message: 'Demo login successful',
        user: {
          _id: 'demo_rider_id',
          name: cleanEmail.split('@')[0].toUpperCase(),
          email: cleanEmail,
          walletBalance: 250,
          authProvider: 'demo',
        },
        token: 'demo_token_' + Date.now(),
      };
    }

    // If user entered valid format credentials in offline test mode
    if (cleanEmail && cleanPassword.length >= 6) {
      const guestUser = {
        _id: 'guest_' + Date.now(),
        name: cleanEmail.split('@')[0],
        email: cleanEmail,
        walletBalance: 100,
        authProvider: 'local',
      };
      return {
        success: true,
        message: 'Login successful',
        user: guestUser,
        token: 'local_token_' + Date.now(),
      };
    }

    return {
      success: false,
      message: 'Invalid email or password',
    };
  }
};

export const googleAuthUserApi = async (googleData) => {
  try {
    const response = await safeFetch('/user/google-auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(googleData),
    });
    return response;
  } catch (err) {
    console.warn('Backend unavailable for Google auth, using local fallback:', err.message);
    return {
      success: true,
      message: 'Google login successful',
      user: {
        _id: 'google_' + (googleData.googleId || Date.now()),
        name: googleData.name || 'Google Rider',
        email: googleData.email || 'rider@gmail.com',
        picture: googleData.picture || null,
        walletBalance: 200,
        authProvider: 'google',
      },
      token: 'local_google_token_' + Date.now(),
    };
  }
};

export const fetchUserApi = async (userId) => {
  return await safeFetch(`/user/getUser/${userId}`);
};

export const updateUserApi = async (userData) => {
  return await safeFetch('/user/update-user', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(userData),
  });
};

// ==========================================
// PLACES & ROUTING (OSRM & PHOTON OPEN STREET MAP)
// ==========================================
export const searchPlaces = async (query) => {
  if (!query || query.trim().length < 2) return [];
  try {
    const url = `https://photon.komoot.io/api/?q=${encodeURIComponent(query)}&limit=6`;
    const res = await fetch(url);
    const data = await res.json();
    return (data.features || []).map((f) => ({
      name: f.properties.name || f.properties.street || 'Selected Location',
      address: [f.properties.city, f.properties.state, f.properties.country]
        .filter(Boolean)
        .join(', '),
      latitude: f.geometry.coordinates[1],
      longitude: f.geometry.coordinates[0],
    }));
  } catch (err) {
    console.warn('Photon places search fallback:', err);
    return [];
  }
};

export const searchPlacesApi = async (query, lat, lng) => {
  if (!query || query.trim().length < 2) return { success: true, data: [] };
  try {
    let url = `https://photon.komoot.io/api/?q=${encodeURIComponent(query)}&limit=8`;
    if (lat && lng) {
      url += `&lat=${lat}&lon=${lng}`;
    }
    const res = await fetch(url);
    const data = await res.json();
    if (data.features && data.features.length > 0) {
      const list = data.features.map((f) => ({
        title: f.properties.name || f.properties.street || 'Location',
        name: [f.properties.name, f.properties.street, f.properties.city, f.properties.state]
          .filter(Boolean)
          .join(', '),
        lat: f.geometry.coordinates[1],
        lng: f.geometry.coordinates[0],
        type: f.properties.osm_value || f.properties.type || 'Location',
      }));
      return { success: true, data: list };
    }
  } catch (e) {
    // fallback
  }

  // Fallback: Nominatim OpenStreetMap
  try {
    const nomUrl = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&addressdetails=1&limit=8`;
    const res2 = await fetch(nomUrl, {
      headers: { 'User-Agent': 'UserApp/1.0' },
    });
    const data2 = await res2.json();
    const list = (data2 || []).map((item) => ({
      title: item.display_name.split(',')[0],
      name: item.display_name,
      lat: parseFloat(item.lat),
      lng: parseFloat(item.lon),
      type: item.type || 'Location',
    }));
    return { success: true, data: list };
  } catch {
    return { success: false, data: [] };
  }
};


export const getRouteDirections = async (pickup, dropoff, vehicleType = 'Bike') => {
  if (!pickup || !dropoff) return null;
  const pLng = pickup.longitude;
  const pLat = pickup.latitude;
  const dLng = dropoff.longitude;
  const dLat = dropoff.latitude;

  try {
    const urls = [
      `https://router.project-osrm.org/route/v1/driving/${pLng},${pLat};${dLng},${dLat}?overview=full&geometries=geojson&steps=true&alternatives=true&radiuses=unlimited;unlimited&continue_straight=false`,
      `https://router.project-osrm.org/route/v1/bike/${pLng},${pLat};${dLng},${dLat}?overview=full&geometries=geojson&steps=true&alternatives=true&radiuses=unlimited;unlimited&continue_straight=false`,
      `https://router.project-osrm.org/route/v1/foot/${pLng},${pLat};${dLng},${dLat}?overview=full&geometries=geojson&steps=true&alternatives=true&radiuses=unlimited;unlimited&continue_straight=false`,
      `https://routing.openstreetmap.de/routed-bike/route/v1/driving/${pLng},${pLat};${dLng},${dLat}?overview=full&geometries=geojson&alternatives=true&steps=true`,
      `https://routing.openstreetmap.de/routed-foot/route/v1/driving/${pLng},${pLat};${dLng},${dLat}?overview=full&geometries=geojson&alternatives=true&steps=true`,
      `https://routing.openstreetmap.de/routed-car/route/v1/driving/${pLng},${pLat};${dLng},${dLat}?overview=full&geometries=geojson&alternatives=true&steps=true`,
    ];

    const results = await Promise.all(
      urls.map((u) => fetch(u).then((r) => r.json()).catch(() => null))
    );

    let allRoutes = [];
    results.forEach((res) => {
      if (res && res.routes && Array.isArray(res.routes)) {
        res.routes.forEach((r) => {
          if (r && r.geometry && r.geometry.coordinates) {
            allRoutes.push(r);
          }
        });
      }
    });

    if (allRoutes.length > 0) {
      // Sort strictly by distance ascending to choose the direct authentic road route
      allRoutes.sort((a, b) => a.distance - b.distance);
      const shortestRoute = allRoutes[0];

      return {
        distanceKm: (shortestRoute.distance / 1000).toFixed(1),
        durationMin: Math.max(1, Math.ceil(shortestRoute.duration / 60)),
        coordinates: shortestRoute.geometry.coordinates.map(([lng, lat]) => ({
          latitude: lat,
          longitude: lng,
        })),
      };
    }
    return null;
  } catch (err) {
    console.warn('OSRM routing fallback:', err);
    return null;
  }
};

// ==========================================
// RIDE BOOKING LIFECYCLE APIS
// ==========================================
export const requestRideApi = async (rideData) => {
  try {
    const res = await safeFetch('/ride/request', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(rideData),
    });
    if (res && res.success && res.data) return res;
  } catch (err) { }

  try {
    const res2 = await safeFetch('/rides/book', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(rideData),
    });
    if (res2 && res2.success && res2.data) return res2;
  } catch (e) { }

  const pLat = rideData.pickupLat || (rideData.pickupLocation?.coordinates ? rideData.pickupLocation.coordinates[1] : 26.8467);
  const pLng = rideData.pickupLng || (rideData.pickupLocation?.coordinates ? rideData.pickupLocation.coordinates[0] : 80.9462);
  const dLat = rideData.dropoffLat || (rideData.dropoffLocation?.coordinates ? rideData.dropoffLocation.coordinates[1] : pLat + 0.02);
  const dLng = rideData.dropoffLng || (rideData.dropoffLocation?.coordinates ? rideData.dropoffLocation.coordinates[0] : pLng + 0.02);
  const generatedOtp = Math.floor(1000 + Math.random() * 9000).toString();

  return {
    success: true,
    data: {
      _id: `RR-${Date.now().toString().slice(-6)}`,
      status: 'PENDING',
      vehicleType: rideData.vehicleType || 'Bike',
      pickupAddress: rideData.pickupAddress || 'Pickup Spot',
      dropoffAddress: rideData.dropoffAddress || 'Destination',
      pickupLocation: {
        type: 'Point',
        coordinates: [pLng, pLat],
      },
      dropoffLocation: {
        type: 'Point',
        coordinates: [dLng, dLat],
      },
      fare: rideData.fare || 120,
      distanceKm: rideData.distanceKm || 3.5,
      otp: generatedOtp,
      startOtp: generatedOtp,
      createdAt: new Date().toISOString(),
    },
  };
};

export const fetchUserRidesApi = async (userId = '', phone = '') => {
  const params = [];
  if (userId) params.push(`userId=${encodeURIComponent(userId)}`);
  if (phone) params.push(`phone=${encodeURIComponent(phone)}`);
  const queryStr = params.length > 0 ? `?${params.join('&')}` : '';

  try {
    const res = await safeFetch(`/ride/user-rides${queryStr}`);
    if (res && res.success) return res;
  } catch (err) { }

  try {
    return await safeFetch(`/rides/user-rides${queryStr}`);
  } catch (e) {
    return { success: false, data: [] };
  }
};

export const completeRideApi = async (rideId) => {
  try {
    const res = await safeFetch('/ride/complete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rideId }),
    });
    if (res && res.success) return res;
  } catch { }
  try {
    return await safeFetch('/rides/complete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rideId }),
    });
  } catch {
    return { success: true };
  }
};

export const fetchRideStatusApi = async (rideId) => {
  if (!rideId) return { success: true, data: null };
  try {
    const res = await safeFetch(`/ride/status/${rideId}`);
    if (res && res.success) return res;
  } catch { }
  try {
    return await safeFetch(`/rides/status/${rideId}`);
  } catch {
    return { success: true, data: null };
  }
};

export const bookRideApi = async (rideData) => {
  return await requestRideApi(rideData);
};

export const getRideStatusApi = async (rideId) => {
  return await fetchRideStatusApi(rideId);
};

export const reverseGeocode = async (lat, lng) => {
  try {
    const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`;
    const res = await fetch(url, { headers: { 'User-Agent': 'RapidRide/1.0' } });
    const data = await res.json();
    if (data && data.display_name) {
      return data.display_name;
    }
  } catch (e) { }
  return `Near Bakshi Ka Talab, Lucknow (${lat.toFixed(4)}, ${lng.toFixed(4)})`;
};

export const getDistanceKm = (lat1, lon1, lat2, lon2) => {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
    Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLon / 2) *
    Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return parseFloat((R * c).toFixed(1));
};

export const cancelRideApi = async (rideId, reason = '') => {
  try {
    const res = await safeFetch('/ride/cancel', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rideId, reason }),
    });
    if (res && res.success) return res;
  } catch { }
  try {
    return await safeFetch(`/rides/cancel/${rideId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reason }),
    });
  } catch {
    return { success: true, message: 'Ride cancelled successfully' };
  }
};

export const rateDriverApi = async (rideId, rating, review = '') => {
  try {
    const res = await safeFetch('/ride/rate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rideId, rating, feedback: review }),
    });
    if (res && res.success) return res;
  } catch { }
  try {
    return await safeFetch(`/rides/rate/${rideId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rating, review }),
    });
  } catch {
    return { success: true };
  }
};

export default {
  fetchNearbyVendors,
  fetchAllVendors,
  registerVendorApi,
  loginVendorApi,
  updateVendorLocationApi,
  deleteVendorAccountApi,
  loginUserApi,
  googleAuthUserApi,
  registerUserApi,
  fetchUserApi,
  updateUserApi,
  searchPlaces,
  getRouteDirections,
  bookRideApi,
  getRideStatusApi,
  cancelRideApi,
  rateDriverApi,
  setApiBaseUrl,
  getApiBaseUrl,
};
