import React, { useEffect, useRef, useState, useMemo, forwardRef, useImperativeHandle } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Pressable,
  Platform,
  Dimensions,
} from 'react-native';
import { WebView } from 'react-native-webview';
import Icon from '../../Icon';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const MapView = forwardRef(function MapView({
  currentCoords,
  pickupCoords,
  dropoffCoords,
  pickupAddress = '',
  dropoffAddress = '',
  shops = [],
  nearbyRiders = [],
  isServiceAvailable = null,
  onStartNavigation,
  onSelectRoute,
  navigationState = 'IDLE',
  routeData = null,
  onMapClick,
  distanceKm,
  selectedFare,
  selectedLocationPreview,
  onConfirmPreview,
  selectedVehicleType = 'Bike',
  activeRide = null,
  mapSelectionMode = 'dropoff',
  setMapSelectionMode = () => { },
  onGpsDetected,
}, ref) {
  const webViewRef = useRef(null);
  const [isSatellite, setIsSatellite] = useState(false);
  const [mapReady, setMapReady] = useState(false);

  useImperativeHandle(ref, () => ({
    locateUser: () => {
      if (webViewRef.current) {
        webViewRef.current.injectJavaScript('if(window.locateUser) window.locateUser(); true;');
      }
    },
    centerMap: (lat, lng, zoom = 16) => {
      if (webViewRef.current && lat && lng) {
        webViewRef.current.injectJavaScript(`if(window.centerMap) window.centerMap(${lat}, ${lng}, ${zoom}); true;`);
      }
    }
  }));

  // Serialize map props for the Leaflet script
  const mapStateData = useMemo(() => {
    return {
      currentCoords: currentCoords || null,
      pickupCoords: pickupCoords || null,
      dropoffCoords: dropoffCoords || null,
      pickupAddress: pickupAddress || '',
      dropoffAddress: dropoffAddress || '',
      distanceKm: distanceKm || 3.5,
      selectedFare: selectedFare || 0,
      selectedVehicleType: selectedVehicleType || 'Bike',
      selectedLocationPreview: selectedLocationPreview || null,
      nearbyRiders: Array.isArray(nearbyRiders) ? nearbyRiders : [],
      activeRide: activeRide || null,
      isSatellite: isSatellite,
      mapSelectionMode: mapSelectionMode || 'dropoff',
    };
  }, [
    currentCoords,
    pickupCoords,
    dropoffCoords,
    pickupAddress,
    dropoffAddress,
    distanceKm,
    selectedFare,
    selectedVehicleType,
    selectedLocationPreview,
    nearbyRiders,
    activeRide,
    isSatellite,
    mapSelectionMode,
  ]);

  // Push state updates into the Leaflet WebView
  useEffect(() => {
    if (mapReady && webViewRef.current) {
      const script = `
        try {
          if (window.updateMapState) {
            window.updateMapState(${JSON.stringify(mapStateData)});
          }
        } catch(e) {}
        true;
      `;
      webViewRef.current.injectJavaScript(script);
    }
  }, [mapStateData, mapReady]);

  // Handle messages from Leaflet map
  const handleMessage = (event) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.type === 'MAP_CLICK') {
        if (onMapClick) {
          onMapClick(data.lat, data.lng);
        }
      } else if (data.type === 'SELECT_ROUTE') {
        if (onSelectRoute) {
          onSelectRoute(data.route);
        }
      } else if (data.type === 'GPS_FOUND') {
        if (onGpsDetected) {
          onGpsDetected(data.lat, data.lng);
        }
      } else if (data.type === 'MAP_READY') {
        setMapReady(true);
      }
    } catch (e) {
      console.warn('MapView message parse error:', e);
    }
  };

  const initialLat = pickupCoords?.latitude || currentCoords?.latitude || 25.4501;
  const initialLng = pickupCoords?.longitude || currentCoords?.longitude || 81.8500;

  // Complete 1:1 Leaflet HTML with real road routes, prominent vehicle markers, GPS detection & Google tiles
  const htmlContent = useMemo(() => {
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css" />
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; -webkit-tap-highlight-color: transparent; }
    html, body {
      width: 100%;
      height: 100%;
      margin: 0;
      padding: 0;
      overflow: hidden;
      background: #e5e3df;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
    }
    #map {
      position: absolute;
      top: 0;
      bottom: 0;
      left: 0;
      right: 0;
      width: 100%;
      height: 100%;
      z-index: 1;
      background: #e5e3df;
    }
    @keyframes pulse {
      0% { transform: scale(0.95); opacity: 0.9; }
      50% { transform: scale(1.6); opacity: 0.2; }
      100% { transform: scale(0.95); opacity: 0.9; }
    }
    .leaflet-popup-content-wrapper {
      border-radius: 12px;
      box-shadow: 0 4px 20px rgba(0,0,0,0.18);
      padding: 0;
      border: 1px solid rgba(0,0,0,0.06);
    }
    .leaflet-popup-content {
      margin: 8px 12px;
      line-height: 1.4;
    }
    .leaflet-popup-tip-container {
      margin-top: -1px;
    }
    .modern-vehicle-marker {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
    }
    .route-tooltip {
      background: rgba(15, 23, 42, 0.92) !important;
      border: 1px solid rgba(255, 255, 255, 0.2) !important;
      color: #ffffff !important;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important;
      border-radius: 8px !important;
      padding: 5px 8px !important;
      box-shadow: 0 4px 12px rgba(0,0,0,0.35) !important;
    }
    .route-tooltip::before {
      border-top-color: rgba(15, 23, 42, 0.92) !important;
    }
    .active-route-tooltip {
      background: #0f172a !important;
      border: 1.5px solid #3b82f6 !important;
    }
  </style>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.js"></script>
</head>
<body>
  <div id="map"></div>

  <script>
    var map = null;
    var markersGroup = null;
    var vehiclesGroup = null;
    var polylinesGroup = null;
    var tileLayer = null;
    var activeRouteIdx = 0;
    var isUserInteracting = false;
    var interactionTimer = null;
    var currentBounds = [];
    var currentState = ${JSON.stringify(mapStateData)};

    // Stable route caching keys
    var activeStaticRouteKey = null;
    var activeTrackingRouteKey = null;
    var cachedUniqueRoutes = [];

    function postAppMessage(msg) {
      if (window.ReactNativeWebView && window.ReactNativeWebView.postMessage) {
        window.ReactNativeWebView.postMessage(JSON.stringify(msg));
      }
    }

    function handleInteractionStart() {
      isUserInteracting = true;
      if (interactionTimer) {
        clearTimeout(interactionTimer);
        interactionTimer = null;
      }
    }

    function handleInteractionEnd() {
      if (interactionTimer) clearTimeout(interactionTimer);
      interactionTimer = setTimeout(function() {
        isUserInteracting = false;
      }, 3000);
    }

    function initMap() {
      if (map) return;
      if (typeof L === 'undefined') {
        setTimeout(initMap, 100);
        return;
      }

      var defaultLat = ${initialLat};
      var defaultLng = ${initialLng};

      map = L.map('map', {
        center: [defaultLat, defaultLng],
        zoom: 15,
        zoomControl: false,
        trackResize: true,
        fadeAnimation: false
      });

      var tileUrl = currentState.isSatellite
        ? 'https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}'
        : 'https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}';

      tileLayer = L.tileLayer(tileUrl, {
        attribution: '&copy; Google Maps',
        maxZoom: 20,
        maxNativeZoom: 20,
        keepBuffer: 8,
        updateWhenIdle: false,
        updateWhenZooming: true
      }).addTo(map);

      markersGroup = L.layerGroup().addTo(map);
      vehiclesGroup = L.layerGroup().addTo(map);
      polylinesGroup = L.layerGroup().addTo(map);

      map.on('click', function(e) {
        if (currentState.activeRide) return;
        var hasBothPoints = Boolean(currentState.pickupCoords && currentState.dropoffCoords);
        if (hasBothPoints && !currentState.mapSelectionMode) {
          return;
        }
        postAppMessage({ type: 'MAP_CLICK', lat: e.latlng.lat, lng: e.latlng.lng });
      });

      map.on('dragstart', handleInteractionStart);
      map.on('zoomstart', handleInteractionStart);
      map.on('movestart', handleInteractionStart);

      map.on('dragend', handleInteractionEnd);
      map.on('zoomend', handleInteractionEnd);
      map.on('moveend', handleInteractionEnd);

      // Handle GPS detection
      map.on('locationfound', function(e) {
        postAppMessage({ type: 'GPS_FOUND', lat: e.latlng.lat, lng: e.latlng.lng });
        map.setView(e.latlng, 16);
      });

      map.on('locationerror', function(e) {
        postAppMessage({ type: 'GPS_ERROR', message: e.message });
      });

      setTimeout(function() {
        if (map) map.invalidateSize();
      }, 80);
      setTimeout(function() {
        if (map) map.invalidateSize();
      }, 300);

      renderMapElements(currentState);
      postAppMessage({ type: 'MAP_READY' });
      setTimeout(function() {
        if (!currentState.pickupCoords) {
          if (window.locateUser) window.locateUser();
        }
      }, 250);
    }

    function createUserIcon() {
      return L.divIcon({
        className: 'modern-user-gps-dot',
        html: '<div style="position: relative; width: 30px; height: 30px; display: flex; align-items: center; justify-content: center;">' +
              '<div style="position: absolute; width: 30px; height: 30px; border-radius: 50%; background: rgba(0, 82, 224, 0.25); animation: pulse 1.8s infinite ease-out;"></div>' +
              '<div style="width: 15px; height: 15px; border-radius: 50%; background: #0052e0; border: 3px solid #ffffff; box-shadow: 0 2px 8px rgba(0, 82, 224, 0.55);"></div>' +
              '</div>',
        iconSize: [30, 30],
        iconAnchor: [15, 15]
      });
    }

    function createPickupIcon() {
      return L.divIcon({
        className: 'modern-pickup-marker',
        html: '<div style="position: relative; display: flex; flex-direction: column; align-items: center; z-index: 5000;">' +
              '<div style="width: 32px; height: 32px; border-radius: 16px; background: linear-gradient(135deg, #059669, #10b981); color: #ffffff; display: flex; align-items: center; justify-content: center; font-size: 13px; font-weight: 900; box-shadow: 0 4px 12px rgba(5, 150, 105, 0.5); border: 2.5px solid #ffffff;">A</div>' +
              '<div style="background: #065f46; color: #ffffff; font-size: 8.5px; font-weight: 800; border-radius: 3px; padding: 1px 4px; margin-top: 1px; white-space: nowrap; box-shadow: 0 1px 3px rgba(0,0,0,0.25);">Point A</div>' +
              '<div style="width: 2px; height: 5px; background: #059669;"></div>' +
              '</div>',
        iconSize: [40, 50],
        iconAnchor: [20, 50]
      });
    }

    function createDropoffIcon() {
      return L.divIcon({
        className: 'modern-dropoff-marker',
        html: '<div style="position: relative; display: flex; flex-direction: column; align-items: center;">' +
              '<div style="width: 30px; height: 30px; border-radius: 50%; background: linear-gradient(135deg, #0f172a, #1e293b); color: #ffffff; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 900; box-shadow: 0 3px 10px rgba(15, 23, 42, 0.45); border: 2.5px solid #ffffff;">B</div>' +
              '<div style="width: 2px; height: 6px; background: #0f172a;"></div>' +
              '</div>',
        iconSize: [30, 36],
        iconAnchor: [15, 36]
      });
    }

    // High-fidelity Vehicle Icons with Vector SVG, Medallion and Live ETA Badge
    function createRiderIcon(vType, isSelected, distText) {
      var width = 42;
      var height = 64;
      
      var svgIcon = '';
      if (vType === 'Car') {
        svgIcon = '<svg width="32" height="60" viewBox="0 0 32 60" fill="none" xmlns="http://www.w3.org/2000/svg" style="filter: drop-shadow(0px 6px 6px rgba(0,0,0,0.45));">' +
                    '<defs>' +
                      '<linearGradient id="carBody" x1="0" y1="0" x2="32" y2="0" gradientUnits="userSpaceOnUse">' +
                        '<stop offset="0%" stop-color="#1e293b"/>' +
                        '<stop offset="50%" stop-color="#334155"/>' +
                        '<stop offset="100%" stop-color="#0f172a"/>' +
                      '</linearGradient>' +
                      '<linearGradient id="glass" x1="0" y1="0" x2="0" y2="60" gradientUnits="userSpaceOnUse">' +
                        '<stop offset="0%" stop-color="#020617"/>' +
                        '<stop offset="100%" stop-color="#1e293b"/>' +
                      '</linearGradient>' +
                    '</defs>' +
                    '<rect x="1" y="8" width="4" height="10" rx="2" fill="#000"/>' +
                    '<rect x="27" y="8" width="4" height="10" rx="2" fill="#000"/>' +
                    '<rect x="1" y="40" width="4" height="10" rx="2" fill="#000"/>' +
                    '<rect x="27" y="40" width="4" height="10" rx="2" fill="#000"/>' +
                    '<rect x="3" y="2" width="26" height="56" rx="9" fill="url(#carBody)"/>' +
                    '<rect x="5" y="4" width="22" height="52" rx="7" fill="url(#carBody)" stroke="#475569" stroke-width="0.5"/>' +
                    '<path d="M6 14 Q16 11 26 14 L24 24 Q16 22 8 24 Z" fill="url(#glass)"/>' +
                    '<path d="M8 44 Q16 46 24 44 L25 36 Q16 38 7 36 Z" fill="url(#glass)"/>' +
                    '<rect x="7" y="24" width="18" height="12" rx="2" fill="#1e293b"/>' +
                    '<rect x="5" y="2" width="5" height="3" rx="1.5" fill="#fef08a" style="filter: drop-shadow(0 -2px 4px rgba(254,240,138,0.8));"/>' +
                    '<rect x="22" y="2" width="5" height="3" rx="1.5" fill="#fef08a" style="filter: drop-shadow(0 -2px 4px rgba(254,240,138,0.8));"/>' +
                    '<rect x="4" y="55" width="6" height="3" rx="1.5" fill="#ef4444" style="filter: drop-shadow(0 2px 4px rgba(239,68,68,0.8));"/>' +
                    '<rect x="22" y="55" width="6" height="3" rx="1.5" fill="#ef4444" style="filter: drop-shadow(0 2px 4px rgba(239,68,68,0.8));"/>' +
                    '<rect x="1" y="20" width="3" height="5" rx="1.5" fill="#334155"/>' +
                    '<rect x="28" y="20" width="3" height="5" rx="1.5" fill="#334155"/>' +
                  '</svg>';
      } else if (vType === 'Auto') {
        svgIcon = '<svg width="28" height="48" viewBox="0 0 28 48" fill="none" xmlns="http://www.w3.org/2000/svg" style="filter: drop-shadow(0px 5px 5px rgba(0,0,0,0.45));">' +
                    '<defs>' +
                      '<linearGradient id="autoRoof" x1="0" y1="0" x2="28" y2="0">' +
                        '<stop offset="0%" stop-color="#d97706"/>' +
                        '<stop offset="50%" stop-color="#fbbf24"/>' +
                        '<stop offset="100%" stop-color="#b45309"/>' +
                      '</linearGradient>' +
                      '<linearGradient id="autoBody" x1="0" y1="0" x2="28" y2="0">' +
                        '<stop offset="0%" stop-color="#166534"/>' +
                        '<stop offset="50%" stop-color="#22c55e"/>' +
                        '<stop offset="100%" stop-color="#14532d"/>' +
                      '</linearGradient>' +
                    '</defs>' +
                    '<rect x="12" y="1" width="4" height="8" rx="2" fill="#000"/>' +
                    '<rect x="2" y="38" width="5" height="9" rx="2.5" fill="#000"/>' +
                    '<rect x="21" y="38" width="5" height="9" rx="2.5" fill="#000"/>' +
                    '<path d="M5 6 Q14 2 23 6 L25 44 Q14 48 3 44 Z" fill="url(#autoBody)"/>' +
                    '<path d="M6 14 L22 14 L24 40 L4 40 Z" fill="url(#autoRoof)"/>' +
                    '<path d="M7 15 Q14 12 21 15 L19 22 Q14 20 9 22 Z" fill="#0f172a"/>' +
                    '<circle cx="14" cy="5" r="3" fill="#fef08a" style="filter: drop-shadow(0 -2px 4px rgba(254,240,138,0.8));"/>' +
                  '</svg>';
      } else {
        svgIcon = '<svg width="20" height="44" viewBox="0 0 20 44" fill="none" xmlns="http://www.w3.org/2000/svg" style="filter: drop-shadow(0px 4px 4px rgba(0,0,0,0.45));">' +
                    '<defs>' +
                      '<linearGradient id="bikeBody" x1="0" y1="0" x2="20" y2="0">' +
                        '<stop offset="0%" stop-color="#b91c1c"/>' +
                        '<stop offset="50%" stop-color="#ef4444"/>' +
                        '<stop offset="100%" stop-color="#991b1b"/>' +
                      '</linearGradient>' +
                    '</defs>' +
                    '<rect x="7" y="0" width="6" height="12" rx="3" fill="#000"/>' +
                    '<rect x="7" y="32" width="6" height="12" rx="3" fill="#000"/>' +
                    '<rect x="5" y="8" width="10" height="28" rx="5" fill="url(#bikeBody)"/>' +
                    '<rect x="6" y="22" width="8" height="12" rx="3" fill="#1e293b"/>' +
                    '<rect x="6" y="12" width="8" height="8" rx="3" fill="#7f1d1d"/>' +
                    '<path d="M2 12 Q10 8 18 12" stroke="#475569" stroke-width="2.5" fill="none" stroke-linecap="round"/>' +
                    '<circle cx="10" cy="6" r="2.5" fill="#fef08a" style="filter: drop-shadow(0 -2px 4px rgba(254,240,138,0.8));"/>' +
                  '</svg>';
      }

      var html = 
        '<div style="display: flex; flex-direction: column; align-items: center; cursor: pointer; transition: transform 0.2s; ' + (isSelected ? 'transform: scale(1.15);' : '') + '">' +
          svgIcon +
          '<div style="background: rgba(15, 23, 42, 0.9); color: #ffffff; border-radius: 4px; padding: 2.5px 6px; margin-top: 5px; box-shadow: 0 2px 6px rgba(0,0,0,0.4); display: flex; align-items: center; gap: 3px; white-space: nowrap; border: 0.5px solid rgba(255,255,255,0.15);">' +
            '<span style="font-size: 9.5px; font-weight: 800; color: #f8fafc; letter-spacing: 0.2px;">' + (distText || 'Nearby') + '</span>' +
          '</div>' +
        '</div>';

      return L.divIcon({
        className: 'modern-vehicle-marker',
        html: html,
        iconSize: [width, height],
        iconAnchor: [width / 2, height / 2]
      });
    }

    function renderStaticRoutes(uniqueRoutes, vehicleType) {
      if (!polylinesGroup || !uniqueRoutes || uniqueRoutes.length === 0) return;
      polylinesGroup.clearLayers();

      var allPoints = [];
      var isTwoWheelerOrAuto = (vehicleType === 'Bike' || vehicleType === 'Auto');
      var primaryColor = isTwoWheelerOrAuto ? '#0052e0' : '#7c3aed';
      var altColors = ['#059669', '#ea580c', '#0891b2'];

      var nonSelected = [];
      var selectedRouteObj = null;

      uniqueRoutes.forEach(function(route, rIdx) {
        if (rIdx === activeRouteIdx) {
          selectedRouteObj = { route: route, index: rIdx };
        } else {
          nonSelected.push({ route: route, index: rIdx });
        }
      });

      // 1. Draw non-selected alternative routes first (underneath)
      nonSelected.forEach(function(item) {
        var route = item.route;
        var rIdx = item.index;
        var coords = route.geometry.coordinates.map(function(c) { return [c[1], c[0]]; });
        coords.forEach(function(pt) { allPoints.push(pt); });

        var altColor = altColors[rIdx % altColors.length] || '#059669';

        // Hit-area for touch/click selection
        var hitPoly = L.polyline(coords, {
          weight: 24,
          opacity: 0,
          interactive: true,
          bubblingMouseEvents: false
        });

        // Dashed alternative road line
        var altPoly = L.polyline(coords, {
          color: altColor,
          weight: 4.5,
          opacity: 0.9,
          dashArray: '6, 6',
          lineJoin: 'round',
          lineCap: 'round',
          interactive: true
        });

        function selectThisRoute() {
          activeRouteIdx = rIdx;
          renderStaticRoutes(uniqueRoutes, vehicleType);
        }

        hitPoly.on('click', selectThisRoute);
        altPoly.on('click', selectThisRoute);

        polylinesGroup.addLayer(hitPoly);
        polylinesGroup.addLayer(altPoly);
      });

      // 2. Draw selected primary route on top
      if (selectedRouteObj) {
        var sRoute = selectedRouteObj.route;
        var sIdx = selectedRouteObj.index;
        var sCoords = sRoute.geometry.coordinates.map(function(c) { return [c[1], c[0]]; });
        sCoords.forEach(function(pt) { allPoints.push(pt); });

        var sDurationMin = Math.max(1, Math.ceil(sRoute.duration / 60));

        // Outer soft glow casing
        var casingPoly = L.polyline(sCoords, {
          color: isTwoWheelerOrAuto ? 'rgba(0, 82, 224, 0.28)' : 'rgba(124, 58, 237, 0.28)',
          weight: 12,
          opacity: 0.95,
          lineJoin: 'round',
          lineCap: 'round'
        });
        polylinesGroup.addLayer(casingPoly);

        // Inner solid primary polyline
        var fgPoly = L.polyline(sCoords, {
          color: primaryColor,
          weight: 6,
          opacity: 1.0,
          lineJoin: 'round',
          lineCap: 'round'
        });
        polylinesGroup.addLayer(fgPoly);

        postAppMessage({
          type: 'SELECT_ROUTE',
          route: sRoute,
          distanceKm: (sRoute.distance / 1000).toFixed(1),
          durationMin: sDurationMin
        });
      }

      // Smoothly fit the entire route in full map view
      if (allPoints.length > 0 && !isUserInteracting && map) {
        map.fitBounds(allPoints, {
          paddingTopLeft: [50, 40],
          paddingBottomRight: [40, 50],
          maxZoom: 16
        });
      }
    }

    function renderMapElements(state) {
      if (!map || !markersGroup || !vehiclesGroup) return;

      markersGroup.clearLayers();
      vehiclesGroup.clearLayers();

      var bounds = [];
      var pLat = state.pickupCoords ? state.pickupCoords.latitude : (state.currentCoords ? state.currentCoords.latitude : null);
      var pLng = state.pickupCoords ? state.pickupCoords.longitude : (state.currentCoords ? state.currentCoords.longitude : null);

      var isRideActive = Boolean(
        state.activeRide &&
        (state.activeRide._id || state.activeRide.status) &&
        !['COMPLETED', 'CANCELLED'].includes(state.activeRide.status)
      );

      // 1. Pickup Marker (Point A)
      if (state.pickupCoords && state.pickupCoords.latitude) {
        if (!state.activeRide || state.activeRide.status !== 'IN_PROGRESS') {
          var pLatLng = [state.pickupCoords.latitude, state.pickupCoords.longitude];
          bounds.push(pLatLng);
          var pMarker = L.marker(pLatLng, { icon: createPickupIcon(), zIndexOffset: 5000 });
          markersGroup.addLayer(pMarker);
        }
      }

      // 2. User Live Location Dot
      if (state.currentCoords && state.currentCoords.latitude) {
        var userLat = state.currentCoords.latitude;
        var userLng = state.currentCoords.longitude;
        var hasPickup = Boolean(state.pickupCoords && state.pickupCoords.latitude);

        if (!hasPickup) {
          var userLatLng = [userLat, userLng];
          bounds.push(userLatLng);
          var userMarker = L.marker(userLatLng, { icon: createUserIcon() });
          markersGroup.addLayer(userMarker);
        }
      }

      // 3. Dropoff Marker (Point B)
      if (state.dropoffCoords && state.dropoffCoords.latitude) {
        var dLatLng = [state.dropoffCoords.latitude, state.dropoffCoords.longitude];
        if (!state.activeRide || state.activeRide.status === 'IN_PROGRESS') {
          bounds.push(dLatLng);
        }

        var dMarker = L.marker(dLatLng, { icon: createDropoffIcon() });
        markersGroup.addLayer(dMarker);
      }

      // 4. Preview Marker
      if (state.selectedLocationPreview && state.selectedLocationPreview.lat && !state.dropoffCoords) {
        var prevLatLng = [state.selectedLocationPreview.lat, state.selectedLocationPreview.lng];
        bounds.push(prevLatLng);
        var prevMarker = L.marker(prevLatLng, { icon: createPickupIcon() });
        markersGroup.addLayer(prevMarker);
      }

      // 5. Draw Road Routes (Includes Local / Residential / Private Alleys via Multi-profile shortest path)
      var targetDestLat = (state.dropoffCoords && state.dropoffCoords.latitude) || (state.selectedLocationPreview && state.selectedLocationPreview.lat);
      var targetDestLng = (state.dropoffCoords && state.dropoffCoords.longitude) || (state.selectedLocationPreview && state.selectedLocationPreview.lng);

      if (!isRideActive && pLat && pLng && targetDestLat && targetDestLng) {
        activeTrackingRouteKey = null;
        var staticKey = pLat.toFixed(5) + '_' + pLng.toFixed(5) + '_' + targetDestLat.toFixed(5) + '_' + targetDestLng.toFixed(5) + '_' + (state.selectedVehicleType || 'Bike');

        if (staticKey === activeStaticRouteKey && cachedUniqueRoutes.length > 0) {
          // Keep existing polylines without re-clearing or re-fetching on background polls!
        } else {
          activeStaticRouteKey = staticKey;
          activeRouteIdx = 0;

          // Draw instant baseline route so map is never blank
          if (polylinesGroup) {
            polylinesGroup.clearLayers();
            var directCoords = [[pLat, pLng], [targetDestLat, targetDestLng]];
            var initCasing = L.polyline(directCoords, {
              color: 'rgba(0, 82, 224, 0.25)',
              weight: 10,
              lineJoin: 'round',
              lineCap: 'round'
            });
            var initPoly = L.polyline(directCoords, {
              color: '#0052e0',
              weight: 5,
              dashArray: '6, 8',
              lineJoin: 'round',
              lineCap: 'round'
            });
            polylinesGroup.addLayer(initCasing);
            polylinesGroup.addLayer(initPoly);
          }

          // Multi-profile queries allowing local residential roads, alleys (gali), private routes, shortcuts:
          var osrmUrlBike = 'https://router.project-osrm.org/route/v1/bike/' + pLng + ',' + pLat + ';' + targetDestLng + ',' + targetDestLat + '?overview=full&geometries=geojson&alternatives=3&steps=true&radiuses=unlimited;unlimited&continue_straight=false';
          var osrmUrlFoot = 'https://router.project-osrm.org/route/v1/foot/' + pLng + ',' + pLat + ';' + targetDestLng + ',' + targetDestLat + '?overview=full&geometries=geojson&alternatives=3&steps=true&radiuses=unlimited;unlimited&continue_straight=false';
          var osrmUrlDrive = 'https://router.project-osrm.org/route/v1/driving/' + pLng + ',' + pLat + ';' + targetDestLng + ',' + targetDestLat + '?overview=full&geometries=geojson&alternatives=3&steps=true&radiuses=unlimited;unlimited&continue_straight=false';
          var deBikeUrl = 'https://routing.openstreetmap.de/routed-bike/route/v1/driving/' + pLng + ',' + pLat + ';' + targetDestLng + ',' + targetDestLat + '?overview=full&geometries=geojson&alternatives=3&steps=true';
          var deFootUrl = 'https://routing.openstreetmap.de/routed-foot/route/v1/driving/' + pLng + ',' + pLat + ';' + targetDestLng + ',' + targetDestLat + '?overview=full&geometries=geojson&alternatives=3&steps=true';
          var deCarUrl = 'https://routing.openstreetmap.de/routed-car/route/v1/driving/' + pLng + ',' + pLat + ';' + targetDestLng + ',' + targetDestLat + '?overview=full&geometries=geojson&alternatives=3&steps=true';

          var nearPUrl = 'https://router.project-osrm.org/nearest/v1/driving/' + pLng + ',' + pLat + '?number=3';
          var nearDUrl = 'https://router.project-osrm.org/nearest/v1/driving/' + targetDestLng + ',' + targetDestLat + '?number=3';

          Promise.all([
            fetch(osrmUrlBike).then(function(r) { return r.json(); }).catch(function() { return null; }),
            fetch(osrmUrlFoot).then(function(r) { return r.json(); }).catch(function() { return null; }),
            fetch(osrmUrlDrive).then(function(r) { return r.json(); }).catch(function() { return null; }),
            fetch(deBikeUrl).then(function(r) { return r.json(); }).catch(function() { return null; }),
            fetch(deFootUrl).then(function(r) { return r.json(); }).catch(function() { return null; }),
            fetch(deCarUrl).then(function(r) { return r.json(); }).catch(function() { return null; }),
            fetch(nearPUrl).then(function(r) { return r.json(); }).catch(function() { return null; }),
            fetch(nearDUrl).then(function(r) { return r.json(); }).catch(function() { return null; })
          ]).then(function(results) {
            if (staticKey !== activeStaticRouteKey) return;
            var bikeRes = results[0];
            var footRes = results[1];
            var driveRes = results[2];
            var deBikeRes = results[3];
            var deFootRes = results[4];
            var deCarRes = results[5];
            var nearPRes = results[6];
            var nearDRes = results[7];

            var rawRoutes = [];
            [bikeRes, footRes, driveRes, deBikeRes, deFootRes, deCarRes].forEach(function(res) {
              if (res && res.routes && Array.isArray(res.routes)) {
                res.routes.forEach(function(rt) {
                  if (rt && rt.geometry && rt.geometry.coordinates && rt.geometry.coordinates.length >= 2) {
                    rawRoutes.push(rt);
                  }
                });
              }
            });

            var nodePromises = [];
            if (nearPRes && Array.isArray(nearPRes.waypoints) && nearDRes && Array.isArray(nearDRes.waypoints)) {
              var pWps = nearPRes.waypoints.slice(0, 2);
              var dWps = nearDRes.waypoints.slice(0, 2);
              for (var i = 0; i < pWps.length; i++) {
                for (var j = 0; j < dWps.length; j++) {
                  if (i === 0 && j === 0) continue;
                  var wpP = pWps[i];
                  var wpD = dWps[j];
                  if (wpP && wpP.location && wpD && wpD.location) {
                    var cUrl = 'https://router.project-osrm.org/route/v1/bike/' + wpP.location[0] + ',' + wpP.location[1] + ';' + wpD.location[0] + ',' + wpD.location[1] + '?overview=full&geometries=geojson&steps=true';
                    nodePromises.push(
                      fetch(cUrl)
                        .then(function(r) { return r.json(); })
                        .then(function(d) {
                          if (d && d.routes && Array.isArray(d.routes)) {
                            d.routes.forEach(function(rt) {
                              if (rt && rt.geometry && rt.geometry.coordinates && rt.geometry.coordinates.length >= 2) {
                                rawRoutes.push(rt);
                              }
                            });
                          }
                        })
                        .catch(function() { return null; })
                    );
                  }
                }
              }
            }

            return Promise.all(nodePromises).then(function() {
              return rawRoutes;
            });
          }).then(function(rawRoutes) {
            if (staticKey !== activeStaticRouteKey) return;
            if (!rawRoutes || rawRoutes.length === 0) return;

            // Deduplicate routes based on distance and geometric midpoint
            var uniqueRoutes = [];
            rawRoutes.forEach(function(candidate) {
              var candCoords = candidate.geometry.coordinates;
              var candMid = candCoords[Math.floor(candCoords.length / 2)];

              var isDuplicate = uniqueRoutes.some(function(existing) {
                var distDiff = Math.abs(existing.distance - candidate.distance);
                if (distDiff < 15) {
                  var existCoords = existing.geometry.coordinates;
                  var existMid = existCoords[Math.floor(existCoords.length / 2)];
                  if (existMid && candMid) {
                    var midLatDiff = Math.abs(existMid[1] - candMid[1]);
                    var midLngDiff = Math.abs(existMid[0] - candMid[0]);
                    if (midLatDiff < 0.0002 && midLngDiff < 0.0002) {
                      return true;
                    }
                  }
                }
                return false;
              });

              if (!isDuplicate) {
                uniqueRoutes.push(candidate);
              }
            });

            // SORT STRICTLY BY DISTANCE ASCENDING (Shortest road path is ALWAYS Route 0)
            uniqueRoutes.sort(function(a, b) {
              return a.distance - b.distance;
            });

            uniqueRoutes = uniqueRoutes.slice(0, 3);
            cachedUniqueRoutes = uniqueRoutes;

            if (uniqueRoutes.length > 0 && polylinesGroup) {
              renderStaticRoutes(uniqueRoutes, state.selectedVehicleType);
            }
          }).catch(function(err) {
            console.warn('Road routing issue:', err);
          });
        }
      } else if (!isRideActive) {
        activeStaticRouteKey = null;
        cachedUniqueRoutes = [];
        if (polylinesGroup) polylinesGroup.clearLayers();
      }

      // 6. AVAILABLE REAL VEHICLE MARKERS (From MongoDB database ONLY - NO fake dummy vehicles)
      if (!isRideActive && Array.isArray(state.nearbyRiders) && state.nearbyRiders.length > 0) {
        state.nearbyRiders.forEach(function(rider) {
          var rLat = null;
          var rLng = null;

          if (rider.location && Array.isArray(rider.location.coordinates) && rider.location.coordinates.length >= 2) {
            rLng = Number(rider.location.coordinates[0]);
            rLat = Number(rider.location.coordinates[1]);
          } else if (rider.latitude && rider.longitude) {
            rLat = Number(rider.latitude);
            rLng = Number(rider.longitude);
          } else if (rider.lat && rider.lng) {
            rLat = Number(rider.lat);
            rLng = Number(rider.lng);
          }

          if (!rLat || !rLng || isNaN(rLat) || isNaN(rLng)) return;

          // STRICT: Discard any vehicle beyond 3 km radius (3000m)
          if (rider.distanceKm !== undefined && rider.distanceKm !== null && Number(rider.distanceKm) > 3.0) return;
          if (rider.distanceMeters !== undefined && rider.distanceMeters !== null && Number(rider.distanceMeters) > 3000) return;

          var vType = rider.vehicleType || 'Bike';
          var isSelected = (state.selectedVehicleType || 'Bike').toLowerCase() === vType.toLowerCase();
          var distText = (rider.distanceKm !== undefined && rider.distanceKm !== null) ? (rider.distanceKm + ' km') : 'Nearby';

          var riderMarker = L.marker([rLat, rLng], { 
            icon: createRiderIcon(vType, isSelected, distText),
            zIndexOffset: 1000
          });

          vehiclesGroup.addLayer(riderMarker);

          if (!state.dropoffCoords && bounds.length < 5) {
            bounds.push([rLat, rLng]);
          }
        });
      }

      // 7. Active Ride Driver Tracking & Direct Route (Directly via Gali / Colony Streets)
      if (state.activeRide && (state.activeRide.status === 'ACCEPTED' || state.activeRide.status === 'IN_PROGRESS')) {
        activeStaticRouteKey = null;
        cachedUniqueRoutes = [];
        var isPhase1 = state.activeRide.status === 'ACCEPTED';
        var rLat = state.activeRide.riderLocation ? state.activeRide.riderLocation.lat : (state.activeRide.pickupLocation && state.activeRide.pickupLocation.coordinates ? state.activeRide.pickupLocation.coordinates[1] : null);
        var rLng = state.activeRide.riderLocation ? state.activeRide.riderLocation.lng : (state.activeRide.pickupLocation && state.activeRide.pickupLocation.coordinates ? state.activeRide.pickupLocation.coordinates[0] : null);

        if (rLat && rLng && rLat !== 0 && rLng !== 0) {
          bounds.push([rLat, rLng]);
          var markerSvg = (state.activeRide.vehicleType === 'Car')
            ? '<svg width="18" height="18" viewBox="0 0 24 24" fill="#0052e0"><path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z"/></svg>'
            : (state.activeRide.vehicleType === 'Auto')
            ? '<svg width="18" height="18" viewBox="0 0 24 24" fill="#15803d"><path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99z"/></svg>'
            : '<svg width="18" height="18" viewBox="0 0 24 24" fill="#0052e0"><path d="M19 7c0-1.66-1.34-3-3-3h-3.41l-.9-2.03A1.996 1.996 0 009.83 1H5v2h4.83l1.8 4.05L7.26 9.8C6.39 9.3 5.4 9 4.33 9 1.94 9 0 10.94 0 13.33c0 2.4 1.94 4.34 4.33 4.34 2.15 0 3.93-1.57 4.27-3.63L11.5 16h3.5v-2h-2.35l-1.33-2.67 2.18-2.18V11H15v-2h-1.5l-1.07-2.14L13.8 5H16c.55 0 1 .45 1 1v1h2V7z"/></svg>';

          var activeIcon = L.divIcon({
            className: 'active-driver-marker',
            html: '<div style="position: relative; width: 44px; height: 44px; display: flex; align-items: center; justify-content: center;">' +
                  '<div style="position: absolute; width: 44px; height: 44px; border-radius: 50%; background: ' + (isPhase1 ? 'rgba(16, 185, 129, 0.3)' : 'rgba(0, 82, 224, 0.3)') + '; animation: pulse 1.6s infinite ease-out;"></div>' +
                  '<div style="position: relative; z-index: 2; width: 32px; height: 32px; border-radius: 16px; background: #ffffff; display: flex; align-items: center; justify-content: center; border: 2.5px solid ' + (isPhase1 ? '#10b981' : '#0052e0') + '; box-shadow: 0 2px 8px rgba(0,0,0,0.3);">' +
                  markerSvg +
                  '</div>' +
                  '</div>',
            iconSize: [44, 44],
            iconAnchor: [22, 22]
          });

          var activeMarker = L.marker([rLat, rLng], { icon: activeIcon, zIndexOffset: 2000 })
            .bindPopup(
              '<div style="padding: 3px;">' +
              '<strong style="color: ' + (isPhase1 ? '#10b981' : '#0052e0') + '; font-size: 11px;">' + (isPhase1 ? 'Driver En-Route to Pickup' : 'Heading to Destination') + '</strong>' +
              '<p style="margin: 2px 0 0; font-size: 10px;">' + (state.activeRide.assignedRiderName || 'Rider') + ' (' + (state.activeRide.vehicleType || 'Bike') + ')</p>' +
              '</div>'
            );
          markersGroup.addLayer(activeMarker);

          var endLat = isPhase1 ? pLat : targetDestLat;
          var endLng = isPhase1 ? pLng : targetDestLng;
          if (endLat && endLng) {
            var trackingKey = rLat.toFixed(4) + '_' + rLng.toFixed(4) + '_' + endLat.toFixed(4) + '_' + endLng.toFixed(4) + '_' + state.activeRide.status;
            if (trackingKey !== activeTrackingRouteKey) {
              activeTrackingRouteKey = trackingKey;
              
              var activeOsrmUrlBike = 'https://router.project-osrm.org/route/v1/bike/' + rLng + ',' + rLat + ';' + endLng + ',' + endLat + '?overview=full&geometries=geojson&steps=true&radiuses=unlimited;unlimited';
              var activeOsrmUrlFoot = 'https://router.project-osrm.org/route/v1/foot/' + rLng + ',' + rLat + ';' + endLng + ',' + endLat + '?overview=full&geometries=geojson&steps=true&radiuses=unlimited;unlimited';
              var activeOsrmUrlDrive = 'https://router.project-osrm.org/route/v1/driving/' + rLng + ',' + rLat + ';' + endLng + ',' + endLat + '?overview=full&geometries=geojson&steps=true&radiuses=unlimited;unlimited';

              Promise.all([
                fetch(activeOsrmUrlBike).then(function(r) { return r.json(); }).catch(function() { return null; }),
                fetch(activeOsrmUrlFoot).then(function(r) { return r.json(); }).catch(function() { return null; }),
                fetch(activeOsrmUrlDrive).then(function(r) { return r.json(); }).catch(function() { return null; })
              ]).then(function(resList) {
                if (trackingKey !== activeTrackingRouteKey) return;
                var candidateDriverRoutes = [];
                resList.forEach(function(res) {
                  if (res && res.routes && res.routes.length > 0) {
                    res.routes.forEach(function(r) { candidateDriverRoutes.push(r); });
                  }
                });
                candidateDriverRoutes.sort(function(a, b) { return a.distance - b.distance; });

                if (candidateDriverRoutes.length > 0 && polylinesGroup) {
                  polylinesGroup.clearLayers();
                  var bestRoute = candidateDriverRoutes[0];
                  var liveCoords = bestRoute.geometry.coordinates.map(function(c) { return [c[1], c[0]]; });

                  var casing = L.polyline(liveCoords, {
                    color: isPhase1 ? 'rgba(16, 185, 129, 0.25)' : 'rgba(0, 82, 224, 0.25)',
                    weight: 10,
                    opacity: 0.9,
                    lineJoin: 'round',
                    lineCap: 'round'
                  });
                  polylinesGroup.addLayer(casing);

                  var livePoly = L.polyline(liveCoords, {
                    color: isPhase1 ? '#10b981' : '#0052e0',
                    weight: 6,
                    opacity: 0.98,
                    dashArray: isPhase1 ? '6, 8' : undefined,
                    lineJoin: 'round',
                    lineCap: 'round'
                  });
                  polylinesGroup.addLayer(livePoly);
                }
              }).catch(function() {});
            }
          }
        }
      }

      currentBounds = bounds;

      // Center view on active markers if not in route mode
      if (!isUserInteracting && bounds.length > 0 && !activeStaticRouteKey) {
        if (bounds.length === 1) {
          map.setView(bounds[0], 16, { animate: true });
        } else {
          map.fitBounds(bounds, {
            paddingTopLeft: [50, 40],
            paddingBottomRight: [40, 50],
            maxZoom: 16
          });
        }
      }
    }

    window.updateMapState = function(newState) {
      currentState = newState;
      if (tileLayer) {
        var newTileUrl = newState.isSatellite
          ? 'https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}'
          : 'https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}';
        tileLayer.setUrl(newTileUrl);
      }
      renderMapElements(newState);
    };

    window.triggerGpsLocate = function() {
      if (window.locateUser) window.locateUser();
    };

    window.locateUser = function() {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          function(pos) {
            var lat = pos.coords.latitude;
            var lng = pos.coords.longitude;
            if (map) {
              map.setView([lat, lng], 16, { animate: true });
            }
            postAppMessage({
              type: 'GPS_FOUND',
              lat: lat,
              lng: lng,
              accuracy: pos.coords.accuracy
            });
          },
          function(err) {
            if (map) {
              map.locate({ setView: true, maxZoom: 16, enableHighAccuracy: true });
            }
          },
          { enableHighAccuracy: true, timeout: 8000, maximumAge: 0 }
        );
      } else if (map) {
        map.locate({ setView: true, maxZoom: 16, enableHighAccuracy: true });
      }
    };

    window.centerMap = function(lat, lng, zoom) {
      if (map && lat && lng) {
        map.setView([lat, lng], zoom || 16, { animate: true });
      }
    };

    function startMap() {
      if (typeof L !== 'undefined') {
        initMap();
      } else {
        setTimeout(startMap, 80);
      }
    }

    if (document.readyState === 'complete' || document.readyState === 'interactive') {
      startMap();
    } else {
      window.addEventListener('DOMContentLoaded', startMap);
      window.addEventListener('load', startMap);
    }
  </script>
</body>
</html>
    `;
  }, []);

  return (
    <View style={styles.container}>
      <WebView
        ref={webViewRef}
        source={{ html: htmlContent, baseUrl: 'https://google.com' }}
        style={styles.webView}
        originWhitelist={['*']}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        geolocationEnabled={true}
        allowFileAccess={true}
        allowUniversalAccessFromFileURLs={true}
        mixedContentMode="always"
        onMessage={handleMessage}
        scalesPageToFit={false}
        scrollEnabled={false}
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
      />

      {/* Floating Map Controls (Distinctive Layer / Satellite Switcher) */}
      <View style={styles.floatingControls}>
        <Pressable
          style={[
            styles.satellitePillBtn,
            isSatellite && styles.satellitePillBtnActive,
          ]}
          onPress={() => setIsSatellite(!isSatellite)}
          accessibilityRole="button"
          accessibilityLabel={isSatellite ? 'Switch to standard map' : 'Switch to satellite map'}
          android_ripple={{ color: 'rgba(0, 82, 224, 0.15)', borderless: false }}
        >
          <View
            style={[
              styles.satelliteIconBox,
              isSatellite && styles.satelliteIconBoxActive,
            ]}
          >
            <Icon
              name={isSatellite ? 'satellite_alt' : 'layers'}
              size={15}
              color={isSatellite ? '#ffffff' : '#0052e0'}
            />
          </View>
          <Text
            style={[
              styles.satellitePillText,
              isSatellite && styles.satellitePillTextActive,
            ]}
          >
            {isSatellite ? 'Satellite' : 'Layers'}
          </Text>
          {isSatellite && <View style={styles.activeSatellitePulseDot} />}
        </Pressable>
      </View>
    </View>
  );
});

export default MapView;

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    backgroundColor: '#e5e3df',
  },
  webView: {
    flex: 1,
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    backgroundColor: '#e5e3df',
  },
  floatingControls: {
    position: 'absolute',
    top: Platform.OS === 'android' ? 115 : 105,
    right: 14,
    zIndex: 30,
  },
  satellitePillBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderColor: '#e2e8f0',
    borderWidth: 1.5,
    borderRadius: 24,
    paddingVertical: 5,
    paddingLeft: 6,
    paddingRight: 12,
    gap: 6,
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.14,
    shadowRadius: 10,
    elevation: 6,
  },
  satellitePillBtnActive: {
    backgroundColor: '#0f172a',
    borderColor: '#334155',
  },
  satelliteIconBox: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#eff6ff',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#bfdbfe',
  },
  satelliteIconBoxActive: {
    backgroundColor: '#0052e0',
    borderColor: '#3b82f6',
  },
  satellitePillText: {
    color: '#0f172a',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
  satellitePillTextActive: {
    color: '#ffffff',
  },
  activeSatellitePulseDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10b981',
    marginLeft: -1,
  },
});
