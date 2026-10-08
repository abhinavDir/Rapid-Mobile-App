import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import Icon from './Icon';

const ICON_MAP = {
  success: 'check',
  error: 'close',
  info: 'info',
  warning: 'shield',
};

const COLOR_MAP = {
  success: { bg: '#10b981', border: '#059669' },
  error: { bg: '#ef4444', border: '#dc2626' },
  info: { bg: '#0052e0', border: '#1d4ed8' },
  warning: { bg: '#f59e0b', border: '#d97706' },
};

function ToastCardItem({ toast, onRemove }) {
  const type = toast.type || 'success';
  const colors = COLOR_MAP[type] || COLOR_MAP.success;
  const iconName = ICON_MAP[type] || 'check';

  return (
    <View style={[styles.toastCard, { borderLeftColor: colors.bg }]}>
      <View style={[styles.iconBadge, { backgroundColor: colors.bg }]}>
        <Icon name={iconName} size={14} color="#ffffff" />
      </View>
      <Text style={styles.toastMessage} numberOfLines={3}>
        {toast.message}
      </Text>
      <Pressable
        onPress={() => onRemove && onRemove(toast.id)}
        style={styles.closeBtn}
        accessibilityRole="button"
        accessibilityLabel="Dismiss notification"
        hitSlop={8}
      >
        <Icon name="close" size={14} color="#94a3b8" />
      </Pressable>
    </View>
  );
}

export default function ToastContainer({ toasts = [], onRemove }) {
  if (!toasts || toasts.length === 0) return null;

  return (
    <View style={styles.container} pointerEvents="box-none">
      {toasts.map((toast) => (
        <ToastCardItem key={toast.id} toast={toast} onRemove={onRemove} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 50,
    left: 16,
    right: 16,
    zIndex: 9999,
    alignItems: 'center',
    gap: 8,
  },
  toastCard: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 8,
    width: '100%',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  iconBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  toastMessage: {
    flex: 1,
    fontSize: 13,
    fontWeight: '700',
    color: '#0f172a',
    lineHeight: 18,
  },
  closeBtn: {
    padding: 4,
    marginLeft: 8,
  },
});
