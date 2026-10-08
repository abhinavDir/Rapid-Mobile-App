/**
 * Navigation Service supporting Google Directions API with fallback to
 * OpenRouteService (ORS) and OSRM (Open Source Routing Machine).
 * Multi-route support (Fastest Route + Shortest Alternative Routes).
 */

const GOOGLE_MAPS_API_KEY = "AIzaSyA-9IphPnVIWpCr7OkY7dFUQR2Xo5uM0S8";

// Helper to decode Google / Encoded Polylines to [lat, lng] arrays
export const decodePolyline = (encoded) => {
  if (!encoded) return [];
  let index = 0,
    len = encoded.length;
  let lat = 0,
    lng = 0;
  const coordinates = [];

  while (index < len) {
    let b,
      shift = 0,
      result = 0;
    do {
      b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);
    const dlat = result & 1 ? ~(result >> 1) : result >> 1;
    lat += dlat;

    shift = 0;
    result = 0;
    do {
      b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);
    const dlng = result & 1 ? ~(result >> 1) : result >> 1;
    lng += dlng;

    coordinates.push([lat / 1e5, lng / 1e5]);
  }
  return coordinates;
};

// Calculate Haversine distance in meters between two lat/lng points
export const calculateDistanceMeters = (lat1, lon1, lat2, lon2) => {
  const R = 6371000; // meters
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

// Minimum distance from a point P to a line segment AB (in meters)
export const distanceToSegmentMeters = (pLat, pLng, aLat, aLng, bLat, bLng) => {
  const l2 = calculateDistanceMeters(aLat, aLng, bLat, bLng);
  if (l2 === 0) return calculateDistanceMeters(pLat, pLng, aLat, aLng);

  let t =
    ((pLat - aLat) * (bLat - aLat) + (pLng - aLng) * (bLng - aLng)) /
    ((bLat - aLat) ** 2 + (bLng - aLng) ** 2);
  t = Math.max(0, Math.min(1, t));

  const projLat = aLat + t * (bLat - aLat);
  const projLng = aLng + t * (bLng - aLng);
  return calculateDistanceMeters(pLat, pLng, projLat, projLng);
};

// Format distance text (e.g. 850 m or 3.4 km)
export const formatDistanceText = (meters) => {
  if (meters < 1000) {
    return `${Math.round(meters)} m`;
  }
  return `${(meters / 1000).toFixed(1)} km`;
};

// Format duration text (e.g. 4 mins or 1 hr 12 mins)
export const formatDurationText = (seconds) => {
  const mins = Math.round(seconds / 60);
  if (mins < 60) {
    return `${mins} min${mins === 1 ? '' : 's'}`;
  }
  const hours = Math.floor(mins / 60);
  const remMins = mins % 60;
  return `${hours} hr ${remMins} min${remMins === 1 ? '' : 's'}`;
};

/**
 * Fetch Route & Alternative Routes from Google Directions API, ORS, or OSRM
 */
export const fetchRoute = async ({ originLat, originLng, destLat, destLng, mode = 'driving' }) => {
  // 1. Try Google Directions API (with alternatives=true)
  if (GOOGLE_MAPS_API_KEY) {
    try {
      const googleMode = mode === 'bicycling' ? 'bicycling' : mode === 'walking' ? 'walking' : 'driving';
      const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${originLat},${originLng}&destination=${destLat},${destLng}&mode=${googleMode}&alternatives=true&key=${GOOGLE_MAPS_API_KEY}`;

      const response = await fetch(url);
      const data = await response.json();

      if (data.status === 'OK' && data.routes?.length > 0) {
        const parsedRoutes = data.routes.map((route, idx) => {
          const leg = route.legs[0];
          const coordinates = decodePolyline(route.overview_polyline.points);
          return {
            id: `google-route-${idx}`,
            name: idx === 0 ? 'Fastest Route' : `Alternative Route ${idx}`,
            provider: 'Google',
            coordinates,
            distanceMeters: leg.distance.value,
            durationSeconds: leg.duration.value,
            distanceText: leg.distance.text,
            durationText: leg.duration.text,
            steps: leg.steps.map((s) => ({
              instruction: s.html_instructions.replace(/<[^>]*>/g, ''),
              distanceText: s.distance.text,
            })),
          };
        });

        return {
          routes: parsedRoutes,
          activeRouteIndex: 0,
          ...parsedRoutes[0],
        };
      }
    } catch (err) {
      console.warn('Google Directions API failed, falling back...', err);
    }
  }

  // 2. Fallback: Free Public OSRM with multi-profile (foot, bike, car) & shortest distance sorting
  try {
    const urls = [
      `https://router.project-osrm.org/route/v1/foot/${originLng},${originLat};${destLng},${destLat}?overview=full&geometries=geojson&steps=true&alternatives=true&radiuses=unlimited;unlimited&continue_straight=false`,
      `https://router.project-osrm.org/route/v1/bike/${originLng},${originLat};${destLng},${destLat}?overview=full&geometries=geojson&steps=true&alternatives=true&radiuses=unlimited;unlimited&continue_straight=false`,
      `https://router.project-osrm.org/route/v1/driving/${originLng},${originLat};${destLng},${destLat}?overview=full&geometries=geojson&steps=true&alternatives=true&radiuses=unlimited;unlimited&continue_straight=false`,
    ];

    const responses = await Promise.all(
      urls.map((u) => fetch(u).then((r) => r.json()).catch(() => null))
    );

    let candidateRoutes = [];
    responses.forEach((data, pIdx) => {
      if (data && data.code === 'Ok' && Array.isArray(data.routes)) {
        const prof = pIdx === 0 ? 'foot' : pIdx === 1 ? 'bike' : 'car';
        data.routes.forEach((r) => {
          if (r && r.geometry && r.geometry.coordinates) {
            candidateRoutes.push({ ...r, prof });
          }
        });
      }
    });

    if (candidateRoutes.length > 0) {
      // Deduplicate similar routes
      const unique = [];
      candidateRoutes.forEach((candidate) => {
        const isDup = unique.some((ex) => Math.abs(ex.distance - candidate.distance) < 35);
        if (!isDup) unique.push(candidate);
      });

      // Sort by shortest distance
      unique.sort((a, b) => a.distance - b.distance);

      const parsedRoutes = unique.map((route, idx) => {
        const coordinates = route.geometry.coordinates.map(([lng, lat]) => [lat, lng]);
        const isShortest = idx === 0;
        return {
          id: `osrm-route-${idx}`,
          name: isShortest ? '⚡ Direct Route / Gali Shortcut' : `🛣️ Main Road Route ${idx}`,
          provider: 'OSRM',
          coordinates,
          distanceMeters: route.distance,
          durationSeconds: route.duration,
          distanceText: formatDistanceText(route.distance),
          durationText: formatDurationText(route.duration),
          steps:
            route.legs[0]?.steps?.map((s) => ({
              instruction: s.name ? `Head on ${s.name}` : 'Proceed along route',
              distanceText: formatDistanceText(s.distance),
            })) || [],
        };
      });

      return {
        routes: parsedRoutes,
        activeRouteIndex: 0,
        ...parsedRoutes[0],
      };
    }
  } catch (err) {
    console.warn('OSRM Routing API failed:', err);
  }

  // Direct line fallback if all network routing fails
  const directMeters = calculateDistanceMeters(originLat, originLng, destLat, destLng);
  const speedMap = { driving: 13.8, bicycling: 4.1, walking: 1.4 };
  const estimatedSeconds = directMeters / (speedMap[mode] || 13.8);

  const fallbackRoute = {
    id: 'direct-route-0',
    name: 'Direct Route',
    provider: 'Direct',
    coordinates: [
      [originLat, originLng],
      [destLat, destLng],
    ],
    distanceMeters: directMeters,
    durationSeconds: estimatedSeconds,
    distanceText: formatDistanceText(directMeters),
    durationText: formatDurationText(estimatedSeconds),
    steps: [{ instruction: 'Follow straight path to destination', distanceText: formatDistanceText(directMeters) }],
  };

  return {
    routes: [fallbackRoute],
    activeRouteIndex: 0,
    ...fallbackRoute,
  };
};
