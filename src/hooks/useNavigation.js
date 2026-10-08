import { useState, useEffect, useRef, useCallback } from 'react';
import {
  fetchRoute,
  calculateDistanceMeters,
  distanceToSegmentMeters,
  formatDistanceText,
  formatDurationText,
} from '../services/navigationService';

export default function useNavigation() {
  const [navigationState, setNavigationState] = useState('IDLE'); // 'IDLE' | 'CALCULATING' | 'NAVIGATING' | 'REROUTING' | 'ARRIVED'
  const [targetShop, setTargetShop] = useState(null);
  const [travelMode, setTravelMode] = useState('driving'); // 'driving' | 'walking' | 'bicycling'
  const [currentCoords, setCurrentCoords] = useState(null);
  const [routeData, setRouteData] = useState(null);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  const lastRerouteTimeRef = useRef(0);
  const routeDataRef = useRef(routeData);

  useEffect(() => {
    routeDataRef.current = routeData;
  }, [routeData]);

  // Recalculate route helper
  const calculateRoute = useCallback(async (originLat, originLng, shop, mode) => {
    if (!shop?.location?.coordinates || shop.location.coordinates.length < 2) return null;
    const [destLng, destLat] = shop.location.coordinates;

    const data = await fetchRoute({
      originLat,
      originLng,
      destLat,
      destLng,
      mode,
    });

    return data;
  }, []);

  // Select specific alternative route by index
  const selectRoute = useCallback((index) => {
    setRouteData((prev) => {
      if (!prev || !prev.routes || !prev.routes[index]) return prev;
      const selected = prev.routes[index];
      return {
        ...prev,
        activeRouteIndex: index,
        coordinates: selected.coordinates,
        distanceMeters: selected.distanceMeters,
        durationSeconds: selected.durationSeconds,
        distanceText: selected.distanceText,
        durationText: selected.durationText,
        steps: selected.steps,
      };
    });
    setCurrentStepIndex(0);
  }, []);

  const nextStep = useCallback(() => {
    setCurrentStepIndex((prev) => {
      if (!routeDataRef.current?.steps) return prev;
      return Math.min(prev + 1, routeDataRef.current.steps.length - 1);
    });
  }, []);

  const prevStep = useCallback(() => {
    setCurrentStepIndex((prev) => Math.max(prev - 1, 0));
  }, []);

  const stopNavigation = useCallback(() => {
    setNavigationState('IDLE');
    setTargetShop(null);
    setRouteData(null);
    setCurrentStepIndex(0);
  }, []);

  const isOffRoute = (lat, lng, polylineCoords) => {
    if (!polylineCoords || polylineCoords.length < 2) return false;
    let minDistance = Infinity;

    for (let i = 0; i < polylineCoords.length - 1; i++) {
      const [aLat, aLng] = polylineCoords[i];
      const [bLat, bLng] = polylineCoords[i + 1];
      const dist = distanceToSegmentMeters(lat, lng, aLat, aLng, bLat, bLng);
      if (dist < minDistance) {
        minDistance = dist;
      }
    }

    return minDistance > 35;
  };

  const startNavigation = useCallback(
    async (shop, initialCoords = null) => {
      if (!shop) return;
      setNavigationState('CALCULATING');
      setTargetShop(shop);

      let startLat = initialCoords?.latitude || 26.8467;
      let startLng = initialCoords?.longitude || 80.9462;
      setCurrentCoords({ latitude: startLat, longitude: startLng });

      const data = await calculateRoute(startLat, startLng, shop, travelMode);
      if (data) {
        setRouteData(data);
        setNavigationState('NAVIGATING');
        setCurrentStepIndex(0);
      } else {
        setNavigationState('IDLE');
      }
    },
    [calculateRoute, travelMode]
  );

  const changeTravelMode = useCallback(
    async (mode) => {
      setTravelMode(mode);
      if (navigationState === 'NAVIGATING' && targetShop && currentCoords) {
        setNavigationState('CALCULATING');
        const data = await calculateRoute(
          currentCoords.latitude,
          currentCoords.longitude,
          targetShop,
          mode
        );
        if (data) {
          setRouteData(data);
          setNavigationState('NAVIGATING');
          setCurrentStepIndex(0);
        }
      }
    },
    [calculateRoute, currentCoords, navigationState, targetShop]
  );

  const activeStep = routeData?.steps?.[currentStepIndex] || null;

  return {
    navigationState,
    targetShop,
    travelMode,
    currentCoords,
    routeData,
    currentStepIndex,
    activeStep,
    startNavigation,
    stopNavigation,
    changeTravelMode,
    selectRoute,
    nextStep,
    prevStep,
  };
}
