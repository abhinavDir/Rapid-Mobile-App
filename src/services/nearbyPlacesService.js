/**
 * nearbyPlacesService.js
 * 
 * Production architecture service to fetch ONLY confirmed, real-world
 * places near the user's actual geographic coordinates.
 * 
 * Works in ANY city worldwide (Lucknow, Delhi, Mumbai, Prayagraj, Bangalore, etc.)
 * NEVER uses hardcoded/fake place lists or static templates.
 */

// In-memory cache keyed by "lat3,lng3"
const placesCache = new Map();

// Haversine distance calculator
export const calculateDistanceKm = (lat1, lon1, lat2, lon2) => {
  if (!lat1 || !lon1 || !lat2 || !lon2) return null;
  const R = 6371; // km
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

// Normalize categories into one of the designated categories
const normalizeCategory = (osmType = '', osmClass = '', name = '') => {
  const t = `${osmType} ${osmClass} ${name}`.toLowerCase();
  if (t.includes('rail') || t.includes('train') || t.includes('station') || t.includes('metro') || t.includes('subway') || t.includes('terminal')) {
    return 'Railway Station';
  }
  if (t.includes('air') || t.includes('flight') || t.includes('plane') || t.includes('aerodrome')) {
    return 'Airport';
  }
  if (t.includes('hosp') || t.includes('medic') || t.includes('clinic') || t.includes('health') || t.includes('doctor')) {
    return 'Hospital';
  }
  if (t.includes('college') || t.includes('univ') || t.includes('school') || t.includes('institute') || t.includes('academy') || t.includes('campus')) {
    return 'College';
  }
  if (t.includes('mall') || t.includes('shop') || t.includes('market') || t.includes('bazaar') || t.includes('supermarket')) {
    return 'Mall';
  }
  if (t.includes('park') || t.includes('garden') || t.includes('lake') || t.includes('forest') || t.includes('recreation')) {
    return 'Park';
  }
  if (t.includes('rest') || t.includes('food') || t.includes('cafe') || t.includes('dine') || t.includes('hotel') || t.includes('dhaba')) {
    return 'Restaurant';
  }
  if (t.includes('monu') || t.includes('temple') || t.includes('masjid') || t.includes('church') || t.includes('fort') || t.includes('palace') || t.includes('museum') || t.includes('herit') || t.includes('tour')) {
    return 'Landmark';
  }
  return 'Landmark';
};

/**
 * Fetch real places around the user's live coordinates
 * @param {number} lat - User latitude
 * @param {number} lng - User longitude
 * @returns {Promise<Array>} List of real-world places
 */
export async function getNearbyRealPlaces(lat, lng) {
  if (!lat || !lng || isNaN(lat) || isNaN(lng)) {
    return [];
  }

  const userLat = parseFloat(lat);
  const userLng = parseFloat(lng);

  // Check cache (within ~100m grid)
  const cacheKey = `${userLat.toFixed(3)},${userLng.toFixed(3)}`;
  if (placesCache.has(cacheKey)) {
    return placesCache.get(cacheKey);
  }

  const delta = 0.09; // ~9-10 km radius bounding box
  const viewbox = `${userLng - delta},${userLat + delta},${userLng + delta},${userLat - delta}`;

  const queries = [
    'railway station',
    'hospital',
    'mall',
    'park',
    'college',
    'landmark',
  ];

  const headers = { 'User-Agent': 'RapidRideApp/1.0 (contact@rapidride.app)' };
  const allResults = [];
  const seenTitles = new Set();

  try {
    // Run parallel queries against live OpenStreetMap Nominatim bounded viewbox
    const fetchPromises = queries.map(async (q) => {
      try {
        const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(q)}&viewbox=${viewbox}&bounded=1&limit=4&addressdetails=1`;
        const res = await fetch(url, { headers });
        if (!res.ok) return [];
        const items = await res.json();
        return Array.isArray(items) ? items : [];
      } catch {
        return [];
      }
    });

    const resultsByQuery = await Promise.all(fetchPromises);

    for (const group of resultsByQuery) {
      for (const item of group) {
        const placeLat = parseFloat(item.lat);
        const placeLng = parseFloat(item.lon);
        if (!placeLat || !placeLng) continue;

        // Clean place title
        const rawTitle = item.name || item.display_name?.split(',')[0] || '';
        const cleanTitle = rawTitle.trim();

        // Reject empty or purely generic 1-word categories like "park", "station" without specific name
        if (!cleanTitle || cleanTitle.length < 3) continue;
        if (/^(park|station|hospital|road|street|mall|college)$/i.test(cleanTitle)) continue;

        const normalizedKey = cleanTitle.toLowerCase();
        if (seenTitles.has(normalizedKey)) continue;
        seenTitles.add(normalizedKey);

        const dist = calculateDistanceKm(userLat, userLng, placeLat, placeLng);
        const category = normalizeCategory(item.type, item.class, cleanTitle);

        // Address locality snippet
        const addressParts = (item.display_name || '').split(',').map((s) => s.trim());
        const locality = addressParts.slice(1, 3).join(', ') || addressParts[1] || '';

        allResults.push({
          id: item.place_id ? String(item.place_id) : `${placeLat}_${placeLng}`,
          name: cleanTitle,
          locality,
          category,
          lat: placeLat,
          lng: placeLng,
          distKm: dist !== null ? dist : 999,
        });
      }
    }
  } catch (err) {
    console.warn('Nominatim places fetch error:', err);
  }

  // If Nominatim returned few or no places, supplement with live Photon OpenStreetMap POIs
  if (allResults.length < 4) {
    try {
      const photonUrl = `https://photon.komoot.io/api/?q=station&lat=${userLat}&lon=${userLng}&limit=8`;
      const pRes = await fetch(photonUrl);
      if (pRes.ok) {
        const pData = await pRes.json();
        if (pData.features) {
          for (const f of pData.features) {
            const fName = f.properties.name;
            if (!fName || fName.length < 3) continue;
            const normKey = fName.toLowerCase();
            if (seenTitles.has(normKey)) continue;
            seenTitles.add(normKey);

            const pLng = f.geometry.coordinates[0];
            const pLat = f.geometry.coordinates[1];
            const dist = calculateDistanceKm(userLat, userLng, pLat, pLng);

            allResults.push({
              id: `photon_${f.properties.osm_id || Math.random()}`,
              name: fName,
              locality: [f.properties.street, f.properties.city].filter(Boolean).join(', '),
              category: normalizeCategory(f.properties.osm_value, f.properties.osm_key, fName),
              lat: pLat,
              lng: pLng,
              distKm: dist !== null ? dist : 999,
            });
          }
        }
      }
    } catch (e) {
      console.warn('Photon fallback error:', e);
    }
  }

  // Sort strictly by nearest distance!
  allResults.sort((a, b) => a.distKm - b.distKm);

  // Take top 8 closest real places
  const finalPlaces = allResults.slice(0, 8);

  // Cache in memory if we received real places
  if (finalPlaces.length > 0) {
    placesCache.set(cacheKey, finalPlaces);
  }

  return finalPlaces;
}
