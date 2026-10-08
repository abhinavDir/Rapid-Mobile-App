import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Pressable,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import Icon from '../../Icon';
import {
  BikeGraphic,
  AutoGraphic,
  SharedAutoGraphic,
  CabGraphic,
  SedanGraphic,
  SuvGraphic,
} from '../../SvgIcons';
import { calculateDistance } from '../../../utils/distance';

export default function VehicleStep({
  calculatedDistKm,
  ridePickup,
  rideDropoff,
  pickupCoords,
  nearbyRiders = [],
  selectedVehicleType,
  setSelectedVehicleType,
  isBikeAvailable,
  isCarAvailable,
  isAutoAvailable,
  bikePrice,
  carPrice,
  autoPrice,
  selectedFare,
  isSelectedVehicleAvailable,
  isRequestingRide,
  isPanelExpanded = false,
  headerPanHandlers,
  onBack,
  onConfirmBooking,
  onScroll,
  onScrollEndDrag,
}) {
  const [paymentMethod, setPaymentMethod] = useState('Cash / UPI');
  const [showPaymentMenu, setShowPaymentMenu] = useState(false);

  const getNearestMetrics = (type) => {
    let minDist = Infinity;
    if (Array.isArray(nearbyRiders) && nearbyRiders.length > 0) {
      const matching = nearbyRiders.filter((r) => {
        const v = (r.vehicleType || 'bike').toLowerCase();
        if (type === 'Bike') return v === 'bike';
        if (type === 'Auto') return v === 'auto';
        if (type === 'Car') return ['car', 'mini', 'sedan', 'suv'].includes(v);
        return false;
      });

      matching.forEach((r) => {
        let d = r.distKm;
        if (typeof d !== 'number' && pickupCoords?.latitude) {
          const rLat = r.location?.coordinates
            ? r.location.coordinates[1]
            : r.latitude || r.lat;
          const rLng = r.location?.coordinates
            ? r.location.coordinates[0]
            : r.longitude || r.lng;
          if (rLat && rLng) {
            d = calculateDistance(
              pickupCoords.latitude,
              pickupCoords.longitude,
              rLat,
              rLng
            );
          }
        }
        if (typeof d === 'number' && !isNaN(d) && d < minDist) {
          minDist = d;
        }
      });
    }

    if (minDist === Infinity) {
      minDist = type === 'Bike' ? 0.3 : type === 'Auto' ? 0.8 : 1.2;
    }

    const multiplier = type === 'Bike' ? 2.5 : type === 'Auto' ? 3.0 : 3.2;
    const etaMins = Math.max(1, Math.round(minDist * multiplier));

    return {
      isAvailable: true,
      distKm: minDist,
      etaMins,
    };
  };

  const bikeMetrics = getNearestMetrics('Bike');
  const autoMetrics = getNearestMetrics('Auto');
  const carMetrics = getNearestMetrics('Car');

  const getRecommendedType = () => {
    if (isBikeAvailable || bikeMetrics.isAvailable) return 'Bike';
    if (isAutoAvailable || autoMetrics.isAvailable) return 'Auto';
    if (isCarAvailable || carMetrics.isAvailable) return 'Car';
    return 'Bike';
  };

  const recommendedType = getRecommendedType();

  const DISCOUNT_AMOUNT = 25;

  const sharedAutoPrice = Math.max(25, Math.round(autoPrice * 0.65));
  const sedanPrice = Math.round(carPrice * 1.25);
  const suvPrice = Math.round(carPrice * 1.5);

  const vehicleList = [
    {
      type: 'Bike',
      title: 'Bike',
      desc: 'Fastest route • Beat traffic',
      price: bikePrice,
      originalPrice: bikePrice + DISCOUNT_AMOUNT,
      discountAmount: DISCOUNT_AMOUNT,
      isAvailable: Boolean(isBikeAvailable),
      etaMins: bikeMetrics.etaMins || 2,
      distKm: bikeMetrics.distKm,
      graphic: <BikeGraphic width={40} height={24} />,
      isRecommended: true,
    },
    {
      type: 'Auto',
      title: 'Auto',
      desc: 'Pocket-friendly • Doorstep pickup',
      price: autoPrice,
      originalPrice: autoPrice + DISCOUNT_AMOUNT,
      discountAmount: DISCOUNT_AMOUNT,
      isAvailable: Boolean(isAutoAvailable),
      etaMins: autoMetrics.etaMins || 4,
      distKm: autoMetrics.distKm,
      graphic: <AutoGraphic width={40} height={24} />,
      isRecommended: false,
    },
    {
      type: 'Shared Auto',
      title: 'Shared Auto',
      desc: 'Eco electric • Flat budget fare',
      price: sharedAutoPrice,
      originalPrice: sharedAutoPrice + DISCOUNT_AMOUNT,
      discountAmount: DISCOUNT_AMOUNT,
      isAvailable: Boolean(isAutoAvailable),
      etaMins: (autoMetrics.etaMins || 4) + 1,
      distKm: autoMetrics.distKm,
      graphic: <SharedAutoGraphic width={40} height={24} />,
      isRecommended: false,
    },
    {
      type: 'Car',
      title: 'Cab',
      desc: 'AC Comfort • Dedicated compact ride',
      price: carPrice,
      originalPrice: carPrice + DISCOUNT_AMOUNT,
      discountAmount: DISCOUNT_AMOUNT,
      isAvailable: Boolean(isCarAvailable),
      etaMins: carMetrics.etaMins || 6,
      distKm: carMetrics.distKm,
      graphic: <CabGraphic width={40} height={24} />,
      isRecommended: false,
    },
    {
      type: 'Sedan',
      title: 'Sedan',
      desc: 'Executive comfort • Spacious boot',
      price: sedanPrice,
      originalPrice: sedanPrice + DISCOUNT_AMOUNT,
      discountAmount: DISCOUNT_AMOUNT,
      isAvailable: Boolean(isCarAvailable),
      etaMins: (carMetrics.etaMins || 6) + 2,
      distKm: carMetrics.distKm,
      graphic: <SedanGraphic width={42} height={24} />,
      isRecommended: false,
    },
    {
      type: 'SUV',
      title: 'SUV',
      desc: 'Extra legroom • Fits 6 passengers',
      price: suvPrice,
      originalPrice: suvPrice + DISCOUNT_AMOUNT,
      discountAmount: DISCOUNT_AMOUNT,
      isAvailable: Boolean(isCarAvailable),
      etaMins: (carMetrics.etaMins || 6) + 3,
      distKm: carMetrics.distKm,
      graphic: <SuvGraphic width={42} height={24} />,
      isRecommended: false,
    },
  ];

  const currentSelection =
    vehicleList.find((v) => v.type === selectedVehicleType) ||
    vehicleList.find((v) => v.isAvailable) ||
    vehicleList[0];

  const handleBookClick = () => {
    if (isRequestingRide || !currentSelection.isAvailable) return;
    onConfirmBooking && onConfirmBooking(currentSelection.type, currentSelection.price);
  };

  return (
    <View style={styles.container}>
      {/* TOP HEADER ROW WITH BACK TO HOME BUTTON */}
      <View {...headerPanHandlers} style={styles.topHeaderNavRow}>
        <TouchableOpacity
          style={styles.backButtonPill}
          onPress={onBack}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel="Back to home"
        >
          <Icon name="arrow_back" size={16} color="#0f172a" />
          <Text style={styles.backButtonText}>Home</Text>
        </TouchableOpacity>
        <View style={styles.topHeaderTitleCol}>
          <Text style={styles.topHeaderNavTitle}>Choose Vehicle</Text>
          <Text style={styles.topHeaderNavSubtitle}>Direct booking • Upfront pricing</Text>
        </View>
      </View>

      {/* FULLY SCROLLABLE CONTENT */}
      <ScrollView
        style={styles.optionsScrollView}
        contentContainerStyle={styles.optionsScrollContent}
        showsVerticalScrollIndicator={false}
        nestedScrollEnabled={true}
        bounces={false}
        overScrollMode="never"
        scrollEnabled={Boolean(isPanelExpanded)}
        onScroll={onScroll}
        onScrollEndDrag={onScrollEndDrag}
        scrollEventThrottle={16}
      >
        {/* 1. ROUTE SUMMARY */}
        <View style={styles.routeVerticalContainer}>
          <View style={styles.routeVerticalLeft}>
            <View style={styles.greenLiveDot} />
            <View style={styles.timelineVertical} />
            <View style={styles.redLiveSquare} />
          </View>
          <View style={styles.routeVerticalRight}>
            <View style={styles.routeTextRow}>
              <Text style={styles.routeLabelText}>PICKUP</Text>
              <Text style={styles.routeValueText} numberOfLines={1}>
                {ridePickup || 'Current Location'}
              </Text>
            </View>
            <View style={styles.routeDivider} />
            <View style={styles.routeTextRow}>
              <Text style={styles.routeLabelText}>DROPOFF</Text>
              <Text style={styles.routeValueText} numberOfLines={1}>
                {rideDropoff || 'Destination'}
              </Text>
            </View>
          </View>
        </View>

        {/* 2. VEHICLE OPTIONS */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionLabel}>
            Available Vehicles (~{calculatedDistKm} km)
          </Text>
          <View style={styles.guaranteedRatePill}>
            <Icon name="verified" size={11} color="#059669" />
            <Text style={styles.guaranteedRateText}>UPFRONT FARE</Text>
          </View>
        </View>

        {vehicleList.map((v) => {
          const isSelected = selectedVehicleType === v.type;
          return (
            <TouchableOpacity
              key={v.type}
              onPress={() => setSelectedVehicleType(v.type)}
              style={[
                styles.optionCard,
                isSelected && styles.optionCardSelected,
                !v.isAvailable && styles.optionCardUnavailable,
              ]}
              activeOpacity={0.82}
            >
              <View
                style={[
                  styles.radioCircle,
                  isSelected && styles.radioCircleSelected,
                ]}
              >
                {isSelected && <View style={styles.radioDot} />}
              </View>
              <View style={styles.cardLeft}>
                <View style={styles.minimalVehicleIconWrapper}>
                  {v.graphic}
                </View>
                <View
                  style={[
                    styles.etaBadge,
                    v.isAvailable ? styles.etaBadgeActive : styles.etaBadgeInactive,
                  ]}
                >
                  <Text style={styles.etaText}>
                    {v.isAvailable ? `${v.etaMins} min` : '—'}
                  </Text>
                </View>
              </View>
              <View style={styles.cardCenter}>
                <View style={styles.titleRow}>
                  <Text style={styles.vehicleTitle}>{v.title}</Text>
                  {v.isRecommended && (
                    <View style={styles.recommendedPill}>
                      <Icon name="star" size={10} color="#0052e0" />
                      <Text style={styles.recommendedText}>Top Choice</Text>
                    </View>
                  )}
                </View>
                <Text style={styles.vehicleDesc}>{v.desc}</Text>
                <View style={styles.availStatusRow}>
                  <View
                    style={[
                      styles.statusDotSmall,
                      { backgroundColor: v.isAvailable ? '#10b981' : '#ef4444' },
                    ]}
                  />
                  <Text
                    style={[
                      styles.availStatusText,
                      { color: v.isAvailable ? '#059669' : '#dc2626' },
                    ]}
                  >
                    {v.isAvailable
                      ? `Available nearby ${v.distKm ? `(~${v.distKm.toFixed(1)} km)` : ''}`
                      : 'No captains nearby right now'}
                  </Text>
                </View>
              </View>
              <View style={styles.cardRight}>
                <View style={styles.priceRow}>
                  <Text style={[styles.priceText, isSelected && styles.priceTextSelected]}>
                    ₹{v.price}
                  </Text>
                  <Text style={styles.originalPriceText}>
                    ₹{v.originalPrice}
                  </Text>
                </View>
                <View style={styles.discountBadge}>
                  <Icon name="local_offer" size={9} color="#047857" />
                  <Text style={styles.discountBadgeText}>₹{v.discountAmount} OFF</Text>
                </View>
                <View
                  style={[
                    styles.availBadgeCustom,
                    v.isAvailable ? styles.availBadgeOnline : styles.unavailBadge,
                  ]}
                >
                  <Text
                    style={[
                      styles.availBadgeText,
                      v.isAvailable ? styles.availTextOnline : styles.unavailText,
                    ]}
                  >
                    {v.isAvailable ? 'Available' : 'Unavailable'}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          );
        })}

        {/* PROMO / CASHBACK STRIP */}
        <View style={styles.promoStrip}>
          <View style={styles.promoIconCircle}>
            <Icon name="local_offer" size={14} color="#0052e0" />
          </View>
          <View style={styles.promoContentCol}>
            <View style={styles.promoHeadingRow}>
              <View style={styles.promoCodePill}>
                <Text style={styles.promoCodePillText}>RAPID25</Text>
              </View>
              <Text style={styles.promoSavedText}>₹25 Discount Applied</Text>
            </View>
            <Text style={styles.promoText}>
              Upfront ₹25 off applied automatically on this ride
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* 3. PINNED BOTTOM ACTION BAR (PERFECTED PAYMENT ROW + FULL WIDTH BOOK BUTTON) */}
      <View style={styles.bottomBarWrapper}>
        {/* ROW 1: PAYMENT METHOD SELECTOR & COUPON TAG WITH PROPER GAP */}
        <View style={styles.paymentMethodRow}>
          <TouchableOpacity
            style={[styles.paymentMethodPill, showPaymentMenu && styles.paymentMethodPillActive]}
            onPress={() => setShowPaymentMenu(!showPaymentMenu)}
            activeOpacity={0.82}
            accessibilityRole="button"
            accessibilityLabel="Select payment mode"
          >
            <View style={styles.payIconCircle}>
              <Icon
                name={paymentMethod.includes('UPI') ? 'qr_code' : 'payments'}
                size={14}
                color="#059669"
              />
            </View>
            <View style={styles.payTextCol}>
              <Text style={styles.payLabel}>PAY METHOD</Text>
              <Text style={styles.paymentPillText} numberOfLines={1}>
                {paymentMethod}
              </Text>
            </View>
            <Icon
              name={showPaymentMenu ? 'expand_less' : 'expand_more'}
              size={16}
              color="#0f172a"
            />
          </TouchableOpacity>

          <View style={styles.couponBadgePill}>
            <Icon name="local_offer" size={11} color="#0052e0" />
            <Text style={styles.couponBadgeText}>RAPID25 (-₹25)</Text>
          </View>
        </View>

        {/* PAYMENT SELECTION DROPDOWN POPUP */}
        {showPaymentMenu && (
          <View style={styles.paymentMenuPopup}>
            <View style={styles.paymentMenuHeader}>
              <Text style={styles.paymentMenuTitle}>Select Payment Method</Text>
              <TouchableOpacity onPress={() => setShowPaymentMenu(false)} hitSlop={8}>
                <Icon name="close" size={16} color="#64748b" />
              </TouchableOpacity>
            </View>
            <TouchableOpacity
              style={[
                styles.paymentMenuItem,
                paymentMethod.includes('Cash') && styles.paymentMenuItemActive,
              ]}
              onPress={() => {
                setPaymentMethod('Cash to Captain');
                setShowPaymentMenu(false);
              }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                <View style={styles.payItemIconCircle}>
                  <Icon name="payments" size={16} color="#059669" />
                </View>
                <View>
                  <Text style={styles.paymentMenuText}>Cash to Captain</Text>
                  <Text style={styles.paymentMenuSubtext}>Pay exact fare after trip ends</Text>
                </View>
              </View>
              {paymentMethod.includes('Cash') && (
                <Icon name="check_circle" size={18} color="#059669" />
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.paymentMenuItem,
                paymentMethod.includes('UPI') && styles.paymentMenuItemActive,
              ]}
              onPress={() => {
                setPaymentMethod('UPI / QR (GPay, PhonePe)');
                setShowPaymentMenu(false);
              }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                <View style={[styles.payItemIconCircle, { backgroundColor: '#eff6ff' }]}>
                  <Icon name="qr_code" size={16} color="#0052e0" />
                </View>
                <View>
                  <Text style={styles.paymentMenuText}>UPI QR Code</Text>
                  <Text style={styles.paymentMenuSubtext}>Scan QR via GPay, PhonePe, Paytm</Text>
                </View>
              </View>
              {paymentMethod.includes('UPI') && (
                <Icon name="check_circle" size={18} color="#0052e0" />
              )}
            </TouchableOpacity>
          </View>
        )}

        {/* ROW 2: FULL-WIDTH CLEAN CONFIRM BUTTON */}
        <TouchableOpacity
          style={[
            styles.bookRideButton,
            (!currentSelection.isAvailable || isRequestingRide) && styles.bookRideButtonDisabled,
          ]}
          onPress={() => {
            if (!currentSelection.isAvailable) return;
            handleBookClick();
          }}
          disabled={!currentSelection.isAvailable || isRequestingRide}
          activeOpacity={0.88}
        >
          {isRequestingRide ? (
            <ActivityIndicator color="#ffffff" size="small" />
          ) : !currentSelection.isAvailable ? (
            <View style={styles.bookRideBtnContent}>
              <Text style={styles.bookRideBtnTitle} numberOfLines={1}>
                No {currentSelection.title} Available
              </Text>
            </View>
          ) : (
            <View style={styles.bookRideBtnContent}>
              <Text style={styles.bookRideBtnTitle} numberOfLines={1}>
                Confirm {currentSelection.title}
              </Text>
              <View style={styles.bookRidePriceContainer}>
                <Text style={styles.bookRideFareText} numberOfLines={1}>
                  ₹{currentSelection.price}
                </Text>
                <View style={styles.bookRideArrowCircle}>
                  <Icon name="arrow_forward" size={16} color="#0052e0" />
                </View>
              </View>
            </View>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 14,
    paddingTop: 2,
    paddingBottom: 4,
  },
  topHeaderNavRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 10,
    marginTop: 2,
    paddingHorizontal: 2,
  },
  backButtonPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#f1f5f9',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  backButtonText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#0f172a',
  },
  topHeaderTitleCol: {
    flex: 1,
  },
  topHeaderNavTitle: {
    fontSize: 15,
    fontWeight: '900',
    color: '#0f172a',
  },
  topHeaderNavSubtitle: {
    fontSize: 10,
    fontWeight: '600',
    color: '#64748b',
  },
  paymentSelectorActive: {
    borderColor: '#059669',
    backgroundColor: '#f0fdf4',
  },
  payVerifiedDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: '#10b981',
  },
  paymentMenuHeader: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  paymentMenuTitle: {
    fontSize: 10,
    fontWeight: '900',
    color: '#64748b',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  paymentMenuItemActive: {
    backgroundColor: '#f8fafc',
  },
  payItemIconCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#ecfdf5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  paymentMenuSubtext: {
    fontSize: 9.5,
    color: '#64748b',
    fontWeight: '600',
  },
  routeVerticalContainer: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 16,
    padding: 15,
    marginBottom: 12,
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  routeVerticalLeft: {
    alignItems: 'center',
    marginRight: 10,
    marginTop: 4,
  },
  greenLiveDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#10b981',
    borderWidth: 2,
    borderColor: '#d1fae5',
  },
  timelineVertical: {
    width: 2,
    height: 24,
    backgroundColor: '#cbd5e1',
    marginVertical: 4,
  },
  redLiveSquare: {
    width: 10,
    height: 10,
    borderRadius: 2,
    backgroundColor: '#ef4444',
  },
  routeVerticalRight: {
    flex: 1,
    justifyContent: 'space-between',
  },
  routeTextRow: {
    flexDirection: 'column',
  },
  routeLabelText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#64748b',
    letterSpacing: 0.5,
  },
  routeValueText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0f172a',
    marginTop: 1,
  },
  routeDivider: {
    height: 1,
    backgroundColor: '#f1f5f9',
    marginVertical: 8,
  },
  redDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: '#dc2626',
  },
  routeTextCol: {
    flex: 1,
    minWidth: 0,
  },
  addrText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#0f172a',
  },
  addrSeparator: {
    height: 1,
    backgroundColor: '#f1f5f9',
    marginVertical: 2,
  },
  nowBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ecfdf5',
    paddingVertical: 3,
    paddingHorizontal: 7,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#a7f3d0',
    gap: 3,
  },
  nowText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#059669',
  },
  optionsScrollView: {
    flex: 1,
  },
  optionsScrollContent: {
    paddingBottom: 50,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '800',
    color: '#64748b',
  },
  guaranteedRatePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#ecfdf5',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  guaranteedRateText: {
    fontSize: 8.5,
    fontWeight: '900',
    color: '#059669',
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
    borderRadius: 16,
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginBottom: 8,
    gap: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  optionCardSelected: {
    borderColor: '#0052e0',
    backgroundColor: '#eff6ff',
    borderWidth: 2,
    shadowColor: '#0052e0',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 3,
  },
  optionCardUnavailable: {
    opacity: 0.65,
    backgroundColor: '#f8fafc',
  },
  radioCircle: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 1.5,
    borderColor: '#cbd5e1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioCircleSelected: {
    borderColor: '#0052e0',
  },
  radioDot: {
    width: 9,
    height: 9,
    borderRadius: 4.5,
    backgroundColor: '#0052e0',
  },
  cardLeft: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 46,
    gap: 3,
  },
  minimalVehicleIconWrapper: {
    width: 44,
    height: 26,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    borderWidth: 0,
  },
  etaBadge: {
    paddingVertical: 1.5,
    paddingHorizontal: 6,
    borderRadius: 6,
  },
  etaBadgeActive: {
    backgroundColor: '#f1f5f9',
  },
  etaBadgeInactive: {
    backgroundColor: '#fee2e2',
  },
  etaText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#334155',
  },
  cardCenter: {
    flex: 1,
    minWidth: 0,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  vehicleTitle: {
    fontSize: 15,
    fontWeight: '900',
    color: '#0f172a',
  },
  recommendedPill: {
    backgroundColor: '#fef3c7',
    paddingVertical: 1,
    paddingHorizontal: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#fde68a',
  },
  recommendedText: {
    fontSize: 9,
    fontWeight: '900',
    color: '#b45309',
  },
  vehicleDesc: {
    fontSize: 11,
    color: '#64748b',
    marginTop: 1,
  },
  availStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 3,
  },
  statusDotSmall: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
  },
  availStatusText: {
    fontSize: 10,
    fontWeight: '800',
  },
  cardRight: {
    alignItems: 'flex-end',
    minWidth: 85,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
  },
  priceText: {
    fontSize: 17,
    fontWeight: '900',
    color: '#0f172a',
  },
  priceTextSelected: {
    color: '#0052e0',
  },
  originalPriceText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#94a3b8',
    textDecorationLine: 'line-through',
  },
  discountBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    backgroundColor: '#dcfce7',
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 4,
    marginTop: 2,
  },
  discountBadgeText: {
    fontSize: 8.5,
    fontWeight: '900',
    color: '#15803d',
  },
  availBadgeCustom: {
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 6,
    marginTop: 3,
    borderWidth: 1,
  },
  availBadgeOnline: {
    backgroundColor: '#ecfdf5',
    borderColor: '#a7f3d0',
  },
  unavailBadge: {
    backgroundColor: '#fef2f2',
    borderColor: '#fecaca',
  },
  availBadgeText: {
    fontSize: 9,
    fontWeight: '900',
  },
  availTextOnline: {
    color: '#059669',
  },
  unavailText: {
    color: '#dc2626',
  },
  promoStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#eff6ff',
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 12,
    gap: 10,
    marginTop: 6,
    borderWidth: 1.5,
    borderColor: '#bfdbfe',
  },
  promoIconCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#dbeafe',
    alignItems: 'center',
    justifyContent: 'center',
  },
  promoContentCol: {
    flex: 1,
  },
  promoHeadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 2,
  },
  promoCodePill: {
    backgroundColor: '#1e40af',
    paddingHorizontal: 5,
    paddingVertical: 1.5,
    borderRadius: 4,
  },
  promoCodePillText: {
    color: '#ffffff',
    fontSize: 8.5,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  promoSavedText: {
    fontSize: 11,
    fontWeight: '900',
    color: '#059669',
  },
  promoText: {
    fontSize: 10.5,
    fontWeight: '600',
    color: '#3b82f6',
  },
  bottomBarWrapper: {
    backgroundColor: '#ffffff',
    paddingTop: 10,
    paddingBottom: 80,
    borderTopWidth: 1.2,
    borderTopColor: '#f1f5f9',
    position: 'relative',
  },
  paymentMethodRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
    paddingHorizontal: 2,
  },
  paymentMethodPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#f8fafc',
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
    maxWidth: '60%',
  },
  paymentMethodPillActive: {
    borderColor: '#0052e0',
    backgroundColor: '#eff6ff',
  },
  paymentPillText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#0f172a',
  },
  couponBadgePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#eff6ff',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#bfdbfe',
  },
  couponBadgeText: {
    fontSize: 10.5,
    fontWeight: '800',
    color: '#0052e0',
  },
  paymentMenuPopup: {
    position: 'absolute',
    bottom: 80,
    left: 0,
    right: 0,
    backgroundColor: '#ffffff',
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
    padding: 12,
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.18,
    shadowRadius: 14,
    elevation: 12,
    zIndex: 999,
  },
  paymentMenuHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
    paddingBottom: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  paymentMenuTitle: {
    fontSize: 13,
    fontWeight: '900',
    color: '#0f172a',
  },
  paymentMenuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderRadius: 10,
  },
  paymentMenuItemActive: {
    backgroundColor: '#f0fdf4',
  },
  payItemIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#ecfdf5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  paymentMenuText: {
    fontSize: 12.5,
    fontWeight: '800',
    color: '#0f172a',
  },
  paymentMenuSubtext: {
    fontSize: 10,
    color: '#64748b',
    marginTop: 1,
  },
  bookRideButton: {
    backgroundColor: '#0052e0',
    borderRadius: 18,
    height: 56,
    justifyContent: 'center',
    shadowColor: '#0052e0',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 5,
  },
  bookRideButtonDisabled: {
    backgroundColor: '#94a3b8',
    shadowOpacity: 0,
    elevation: 0,
  },
  bookRideBtnContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    height: '100%',
  },
  bookRideLeftCol: {
    flex: 1,
    justifyContent: 'center',
  },
  bookRideBtnTitle: {
    color: '#ffffff',
    fontSize: 16.5,
    fontWeight: '900',
    letterSpacing: 0.3,
  },
  bookRideBtnSub: {
    color: '#bfdbfe',
    fontSize: 10,
    fontWeight: '700',
    marginTop: 2,
  },
  bookRidePriceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flexShrink: 0,
    gap: 8,
  },
  priceColumn: {
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  bookRideFareText: {
    color: '#ffffff',
    fontSize: 17,
    fontWeight: '900',
    lineHeight: 20,
  },
  bookRideOrigFareText: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 11,
    fontWeight: '700',
    textDecorationLine: 'line-through',
    marginTop: 1,
  },
  bookRideArrowCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 2,
  },
  payRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  payIconCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#ecfdf5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  payTextCol: {
    flex: 1,
  },
  payLabel: {
    fontSize: 8,
    fontWeight: '900',
    color: '#64748b',
    letterSpacing: 0.5,
  },
});
