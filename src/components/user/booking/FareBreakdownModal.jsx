import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Pressable,
  StyleSheet,
  Modal,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import Icon from '../../Icon';

export default function FareBreakdownModal({ show, onClose, activeRide }) {
  if (!show) return null;

  const fare = Number(activeRide?.fare) || 120;
  const baseFare = Math.round(fare * 0.38);
  const distanceFare = Math.round(fare * 0.52);
  const taxes = Math.max(5, fare - baseFare - distanceFare);
  const distKmText = activeRide?.distanceKm
    ? `${Number(activeRide.distanceKm).toFixed(1)} km`
    : 'Standard route';

  return (
    <Modal
      visible={show}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <TouchableOpacity
          style={styles.backdropTouchable}
          activeOpacity={1}
          onPress={onClose}
        />
        <SafeAreaView style={styles.modalSheet}>
          {/* Top Drag / Dismiss Indicator Handle */}
          <View style={styles.handleContainer}>
            <View style={styles.handleBar} />
          </View>

          {/* Header Row */}
          <View style={styles.headerRow}>
            <View style={styles.headerTextCol}>
              <Text style={styles.title}>Fare Breakdown</Text>
              <Text style={styles.subtitle}>
                Upfront guaranteed rate • Zero surprise charges
              </Text>
            </View>

            <Pressable
              onPress={onClose}
              style={styles.closeBtn}
              accessibilityRole="button"
              accessibilityLabel="Close fare breakdown"
            >
              <Icon name="close" size={18} color="#475569" />
            </Pressable>
          </View>

          {/* Smooth Scrollable Body */}
          <ScrollView
            style={styles.contentScroll}
            contentContainerStyle={styles.scrollContentContainer}
            showsVerticalScrollIndicator={false}
            nestedScrollEnabled={true}
            bounces={true}
          >
            {/* Total Fare Hero Card */}
            <View style={styles.totalFareCard}>
              <View style={styles.guaranteedPill}>
                <Icon name="verified" size={13} color="#059669" />
                <Text style={styles.guaranteedPillText}>LOCKED PRICE</Text>
              </View>

              <Text style={styles.totalLabel}>Total Estimated Payable</Text>
              <Text style={styles.totalAmount}>₹{fare}</Text>

              <View style={styles.paymentMethodRow}>
                <Icon name="payments" size={15} color="#0052e0" />
                <Text style={styles.paymentMethodText}>
                  Pay via Cash, UPI (GPay/PhonePe/Paytm) to Captain
                </Text>
              </View>
            </View>

            {/* Line Items Card */}
            <View style={styles.breakdownCard}>
              <Text style={styles.sectionHeaderLabel}>FARE DETAILS</Text>

              {/* Base Fare */}
              <View style={styles.breakdownRow}>
                <View style={styles.rowLeft}>
                  <View style={styles.itemIconCircle}>
                    <Icon name="flag" size={14} color="#0f172a" />
                  </View>
                  <View>
                    <Text style={styles.itemLabel}>Base Fare & Flagdown</Text>
                    <Text style={styles.itemSublabel}>Initial pickup fee</Text>
                  </View>
                </View>
                <Text style={styles.itemValue}>₹{baseFare}</Text>
              </View>

              {/* Distance Charges */}
              <View style={styles.breakdownRow}>
                <View style={styles.rowLeft}>
                  <View style={styles.itemIconCircle}>
                    <Icon name="alt_route" size={14} color="#0f172a" />
                  </View>
                  <View>
                    <Text style={styles.itemLabel}>Distance Charge</Text>
                    <Text style={styles.itemSublabel}>{distKmText}</Text>
                  </View>
                </View>
                <Text style={styles.itemValue}>₹{distanceFare}</Text>
              </View>

              {/* Ride Safety Cover */}
              <View style={styles.breakdownRow}>
                <View style={styles.rowLeft}>
                  <View style={[styles.itemIconCircle, styles.itemIconCircleGreen]}>
                    <Icon name="shield" size={14} color="#059669" />
                  </View>
                  <View>
                    <Text style={styles.itemLabel}>Ride Safety Protection</Text>
                    <Text style={styles.itemSublabel}>24x7 SOS & trip tracking</Text>
                  </View>
                </View>
                <View style={styles.freeBadge}>
                  <Text style={styles.freeBadgeText}>FREE</Text>
                </View>
              </View>

              {/* Taxes & GST */}
              <View style={styles.breakdownRow}>
                <View style={styles.rowLeft}>
                  <View style={styles.itemIconCircle}>
                    <Icon name="receipt" size={14} color="#0f172a" />
                  </View>
                  <View>
                    <Text style={styles.itemLabel}>Taxes & GST</Text>
                    <Text style={styles.itemSublabel}>Govt. applicable taxes</Text>
                  </View>
                </View>
                <Text style={styles.itemValue}>₹{taxes}</Text>
              </View>

              {/* Promotional Discount */}
              <View style={[styles.breakdownRow, styles.discountRow]}>
                <View style={styles.rowLeft}>
                  <View style={styles.discountIconCircle}>
                    <Icon name="local_offer" size={14} color="#059669" />
                  </View>
                  <View>
                    <Text style={styles.discountLabel}>Promotional Discount</Text>
                    <Text style={styles.discountSublabel}>Applied to this ride</Text>
                  </View>
                </View>
                <Text style={styles.discountValue}>- ₹0.00</Text>
              </View>

              <View style={styles.dividerLine} />

              {/* Total Row */}
              <View style={styles.finalRow}>
                <View>
                  <Text style={styles.finalLabel}>Total Price</Text>
                  <Text style={styles.finalSublabel}>Includes all taxes and fees</Text>
                </View>
                <Text style={styles.finalValue}>₹{fare}</Text>
              </View>
            </View>

            {/* Terms notice */}
            <View style={styles.termsBox}>
              <Icon name="info" size={14} color="#64748b" />
              <Text style={styles.termsText}>
                Fare is based on the initial estimated route. Additional waiting time or tolls, if applicable, may adjust the total.
              </Text>
            </View>
          </ScrollView>

          {/* Bottom Action Button */}
          <View style={styles.bottomBar}>
            <TouchableOpacity
              style={styles.doneBtn}
              onPress={onClose}
              activeOpacity={0.85}
            >
              <Text style={styles.doneBtnText}>Got it, Close</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'flex-end',
  },
  backdropTouchable: {
    flex: 1,
  },
  modalSheet: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '82%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 10,
  },
  handleContainer: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  handleBar: {
    width: 44,
    height: 4.5,
    borderRadius: 3,
    backgroundColor: '#cbd5e1',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  headerTextCol: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: '900',
    color: '#0f172a',
  },
  subtitle: {
    fontSize: 11.5,
    fontWeight: '600',
    color: '#64748b',
    marginTop: 2,
  },
  closeBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 10,
  },
  contentScroll: {
    flexGrow: 0,
  },
  scrollContentContainer: {
    paddingHorizontal: 18,
    paddingTop: 14,
    paddingBottom: 20,
  },
  totalFareCard: {
    backgroundColor: '#f8fafc',
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
    borderRadius: 18,
    padding: 16,
    alignItems: 'center',
    marginBottom: 14,
  },
  guaranteedPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#ecfdf5',
    borderWidth: 1,
    borderColor: '#a7f3d0',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    marginBottom: 8,
  },
  guaranteedPillText: {
    fontSize: 10,
    fontWeight: '900',
    color: '#059669',
    letterSpacing: 0.5,
  },
  totalLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748b',
  },
  totalAmount: {
    fontSize: 36,
    fontWeight: '900',
    color: '#0f172a',
    marginVertical: 4,
  },
  paymentMethodRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#eff6ff',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    marginTop: 6,
  },
  paymentMethodText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#1d4ed8',
  },
  breakdownCard: {
    backgroundColor: '#ffffff',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    padding: 14,
    marginBottom: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  sectionHeaderLabel: {
    fontSize: 10.5,
    fontWeight: '900',
    color: '#64748b',
    letterSpacing: 0.6,
    marginBottom: 12,
  },
  breakdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 7,
  },
  rowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  itemIconCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemIconCircleGreen: {
    backgroundColor: '#ecfdf5',
  },
  discountIconCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#ecfdf5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemLabel: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0f172a',
  },
  itemSublabel: {
    fontSize: 10.5,
    color: '#64748b',
    marginTop: 1,
  },
  itemValue: {
    fontSize: 13.5,
    fontWeight: '900',
    color: '#0f172a',
  },
  freeBadge: {
    backgroundColor: '#ecfdf5',
    borderWidth: 1,
    borderColor: '#a7f3d0',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  freeBadgeText: {
    fontSize: 10,
    fontWeight: '900',
    color: '#059669',
  },
  discountRow: {
    backgroundColor: '#f0fdf4',
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 12,
    marginTop: 4,
    borderWidth: 1,
    borderColor: '#dcfce7',
  },
  discountLabel: {
    fontSize: 12.5,
    fontWeight: '900',
    color: '#15803d',
  },
  discountSublabel: {
    fontSize: 10,
    color: '#16a34a',
  },
  discountValue: {
    fontSize: 13,
    fontWeight: '900',
    color: '#15803d',
  },
  dividerLine: {
    height: 1,
    backgroundColor: '#e2e8f0',
    marginVertical: 10,
  },
  finalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 2,
  },
  finalLabel: {
    fontSize: 15,
    fontWeight: '900',
    color: '#0f172a',
  },
  finalSublabel: {
    fontSize: 10.5,
    color: '#64748b',
    marginTop: 1,
  },
  finalValue: {
    fontSize: 20,
    fontWeight: '900',
    color: '#0052e0',
  },
  termsBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
    backgroundColor: '#f8fafc',
    padding: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  termsText: {
    fontSize: 10.5,
    color: '#64748b',
    lineHeight: 15,
    flex: 1,
  },
  bottomBar: {
    paddingHorizontal: 18,
    paddingTop: 10,
    paddingBottom: 16,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    backgroundColor: '#ffffff',
  },
  doneBtn: {
    backgroundColor: '#0052e0',
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#0052e0',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 3,
  },
  doneBtnText: {
    fontSize: 15,
    fontWeight: '900',
    color: '#ffffff',
  },
});
