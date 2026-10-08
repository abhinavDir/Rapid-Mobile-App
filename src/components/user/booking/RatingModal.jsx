import React from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Pressable,
  StyleSheet,
  Modal,
  ScrollView,
  ActivityIndicator,
  SafeAreaView,
} from 'react-native';
import Icon from '../../Icon';

export default function RatingModal({
  completedRide,
  customerRating,
  setCustomerRating,
  customerFeedback,
  setCustomerFeedback,
  isSubmittingRating,
  onSubmitRating,
  onClose,
}) {
  if (!completedRide) return null;

  const feedbackTags = [
    'Polite Captain',
    'Clean Vehicle',
    'Smooth Driving',
    'On-time Pickup',
    'Followed Safety Rules',
  ];

  return (
    <Modal visible={Boolean(completedRide)} transparent animationType="slide">
      <View style={styles.overlay}>
        <SafeAreaView style={styles.modalSheet}>
          {/* Material Handle */}
          <View style={styles.handleContainer}>
            <View style={styles.handleBar} />
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            nestedScrollEnabled={true}
            contentContainerStyle={styles.content}
            bounces={true}
          >
            {/* Completion Badge */}
            <View style={styles.badgeWrapper}>
              <Icon name="check_circle" size={32} color="#059669" />
            </View>

            <Text style={styles.title}>Trip Completed!</Text>
            <Text style={styles.subtitle}>
              How was your journey with{' '}
              <Text style={{ fontWeight: '900', color: '#0f172a' }}>
                {completedRide.assignedRiderName || 'your Captain'}
              </Text>
              ?
            </Text>

            {/* Fare Summary Card */}
            <View style={styles.fareSummaryCard}>
              <Text style={styles.fareSummaryLabel}>Total Paid (Cash / UPI)</Text>
              <Text style={styles.fareSummaryAmount}>
                ₹{completedRide.fare || 120}
              </Text>
            </View>

            {/* 5-Star Selector */}
            <View style={styles.starsRow}>
              {[1, 2, 3, 4, 5].map((star) => (
                <Pressable
                  key={star}
                  onPress={() => setCustomerRating(star)}
                  style={styles.starBtn}
                  accessibilityRole="button"
                  accessibilityLabel={`Rate ${star} star${star > 1 ? 's' : ''}`}
                >
                  <Icon
                    name="star"
                    size={30}
                    color={customerRating >= star ? '#f59e0b' : '#cbd5e1'}
                  />
                </Pressable>
              ))}
            </View>

            {/* Feedback Tags */}
            <View style={styles.tagsContainer}>
              {feedbackTags.map((tag, idx) => {
                const isSelected = customerFeedback?.includes(tag);
                return (
                  <TouchableOpacity
                    key={idx}
                    onPress={() => setCustomerFeedback(tag)}
                    style={[styles.tagPill, isSelected && styles.tagPillActive]}
                    activeOpacity={0.75}
                  >
                    <Text
                      style={[
                        styles.tagText,
                        isSelected && styles.tagTextActive,
                      ]}
                    >
                      {tag}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Comment Input */}
            <TextInput
              style={styles.commentInput}
              placeholder="Additional feedback for your driver partner..."
              placeholderTextColor="#94a3b8"
              value={customerFeedback}
              onChangeText={setCustomerFeedback}
              multiline
              numberOfLines={3}
            />

            {/* Submit Button with Material Forward Arrow */}
            <TouchableOpacity
              style={[
                styles.submitBtn,
                isSubmittingRating && styles.submitBtnDisabled,
              ]}
              onPress={onSubmitRating}
              disabled={isSubmittingRating}
              activeOpacity={0.88}
            >
              {isSubmittingRating ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <View style={styles.submitBtnContent}>
                  <Text style={styles.submitBtnText}>Submit Rating & Done</Text>
                  <Icon name="arrow_forward" size={18} color="#ffffff" />
                </View>
              )}
            </TouchableOpacity>
          </ScrollView>
        </SafeAreaView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.7)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '88%',
    paddingHorizontal: 20,
    paddingBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
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
  content: {
    alignItems: 'center',
    paddingBottom: 16,
  },
  badgeWrapper: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#ecfdf5',
    borderWidth: 2,
    borderColor: '#a7f3d0',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 8,
  },
  title: {
    fontSize: 22,
    fontWeight: '900',
    color: '#0f172a',
  },
  subtitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748b',
    textAlign: 'center',
    marginTop: 4,
    marginBottom: 14,
  },
  fareSummaryCard: {
    backgroundColor: '#f8fafc',
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    alignItems: 'center',
    width: '100%',
    marginBottom: 14,
  },
  fareSummaryLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748b',
  },
  fareSummaryAmount: {
    fontSize: 24,
    fontWeight: '900',
    color: '#059669',
    marginTop: 2,
  },
  starsRow: {
    flexDirection: 'row',
    gap: 8,
    marginVertical: 10,
  },
  starBtn: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
    marginVertical: 12,
  },
  tagPill: {
    backgroundColor: '#f1f5f9',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  tagPillActive: {
    backgroundColor: '#eff6ff',
    borderColor: '#0052e0',
  },
  tagText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#475569',
  },
  tagTextActive: {
    color: '#0052e0',
    fontWeight: '900',
  },
  commentInput: {
    width: '100%',
    backgroundColor: '#f8fafc',
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
    borderRadius: 14,
    padding: 12,
    fontSize: 13,
    fontWeight: '600',
    color: '#0f172a',
    textAlignVertical: 'top',
    minHeight: 70,
    marginBottom: 16,
  },
  submitBtn: {
    width: '100%',
    backgroundColor: '#0052e0',
    height: 50,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#0052e0',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  submitBtnDisabled: {
    backgroundColor: '#94a3b8',
    shadowOpacity: 0,
  },
  submitBtnContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  submitBtnText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '900',
  },
});
