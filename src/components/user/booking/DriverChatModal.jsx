import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Pressable,
  StyleSheet,
  Modal,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
} from 'react-native';
import Icon from '../../Icon';

export default function DriverChatModal({
  show,
  onClose,
  activeRide,
  chatMessages = [],
  chatInputText,
  setChatInputText,
  onSendMessage,
}) {
  if (!show) return null;

  const quickReplies = [
    'I am at the pickup location',
    'Coming down in 2 mins',
    'Wearing a black jacket',
    'Please wait near the main gate',
  ];

  return (
    <Modal visible={show} transparent animationType="slide" onRequestClose={onClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.overlay}
      >
        <SafeAreaView style={styles.modalSheet}>
          {/* Material Handle */}
          <View style={styles.handleContainer}>
            <View style={styles.handleBar} />
          </View>

          {/* Header */}
          <View style={styles.headerRow}>
            <Pressable
              onPress={onClose}
              style={styles.backBtn}
              accessibilityRole="button"
              accessibilityLabel="Back"
            >
              <Icon name="arrow_back" size={20} color="#0f172a" />
            </Pressable>

            <View style={styles.driverProfile}>
              <View style={styles.avatarBubble}>
                <Icon name="person" size={20} color="#0052e0" />
                <View style={styles.onlineDot} />
              </View>
              <View>
                <Text style={styles.driverName}>
                  {activeRide?.assignedRiderName || 'Captain'}
                </Text>
                <Text style={styles.onlineStatus}>Online • Verified Captain</Text>
              </View>
            </View>

            <Pressable
              onPress={onClose}
              style={styles.closeBtn}
              accessibilityRole="button"
              accessibilityLabel="Close chat"
            >
              <Icon name="close" size={18} color="#475569" />
            </Pressable>
          </View>

          {/* Quick Reply Chips (Scrollable) */}
          <View style={styles.quickChipsWrapper}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.chipsScrollContent}
              nestedScrollEnabled={true}
            >
              {quickReplies.map((reply, i) => (
                <TouchableOpacity
                  key={i}
                  style={styles.chipBtn}
                  onPress={() => onSendMessage && onSendMessage(reply)}
                  activeOpacity={0.75}
                >
                  <Text style={styles.chipText}>{reply}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Messages Scroll Area */}
          <ScrollView
            style={styles.messagesScroll}
            contentContainerStyle={styles.messagesContent}
            showsVerticalScrollIndicator={false}
            nestedScrollEnabled={true}
            bounces={true}
          >
            {chatMessages.length === 0 ? (
              <View style={styles.emptyChatBox}>
                <Icon name="chat" size={32} color="#cbd5e1" />
                <Text style={styles.emptyChatText}>
                  Send a message or pick a quick reply above
                </Text>
              </View>
            ) : (
              chatMessages.map((msg, idx) => {
                const isUser = msg.sender === 'user';
                return (
                  <View
                    key={idx}
                    style={[
                      styles.msgWrapper,
                      isUser ? styles.msgWrapperUser : styles.msgWrapperDriver,
                    ]}
                  >
                    <View
                      style={[
                        styles.msgBubble,
                        isUser ? styles.msgBubbleUser : styles.msgBubbleDriver,
                      ]}
                    >
                      <Text style={[styles.msgText, isUser && styles.msgTextUser]}>
                        {msg.text}
                      </Text>
                      <Text style={[styles.msgTime, isUser && styles.msgTimeUser]}>
                        {msg.time}
                      </Text>
                    </View>
                  </View>
                );
              })
            )}
          </ScrollView>

          {/* Material Input Bar with Send Arrow Button */}
          <View style={styles.inputBar}>
            <TextInput
              style={styles.textInput}
              placeholder="Type message to Captain..."
              placeholderTextColor="#94a3b8"
              value={chatInputText}
              onChangeText={setChatInputText}
              onSubmitEditing={() => onSendMessage && onSendMessage(chatInputText)}
              returnKeyType="send"
            />
            <TouchableOpacity
              style={[
                styles.sendBtn,
                !chatInputText?.trim() && styles.sendBtnDisabled,
              ]}
              onPress={() => onSendMessage && onSendMessage(chatInputText)}
              disabled={!chatInputText?.trim()}
              activeOpacity={0.85}
            >
              <Icon name="arrow_forward" size={20} color="#ffffff" />
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    height: '80%',
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
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  driverProfile: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  avatarBubble: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#eff6ff',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#bfdbfe',
    position: 'relative',
  },
  onlineDot: {
    position: 'absolute',
    bottom: -1,
    right: -1,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#10b981',
    borderWidth: 1.5,
    borderColor: '#ffffff',
  },
  driverName: {
    fontSize: 15,
    fontWeight: '900',
    color: '#0f172a',
  },
  onlineStatus: {
    fontSize: 11,
    fontWeight: '700',
    color: '#059669',
    marginTop: 1,
  },
  closeBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickChipsWrapper: {
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f8fafc',
    backgroundColor: '#f8fafc',
  },
  chipsScrollContent: {
    paddingHorizontal: 16,
    gap: 8,
  },
  chipBtn: {
    backgroundColor: '#ffffff',
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 1,
  },
  chipText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#334155',
  },
  messagesScroll: {
    flex: 1,
    paddingHorizontal: 16,
  },
  messagesContent: {
    paddingVertical: 14,
    gap: 10,
  },
  emptyChatBox: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    gap: 8,
  },
  emptyChatText: {
    fontSize: 12.5,
    fontWeight: '600',
    color: '#94a3b8',
    textAlign: 'center',
  },
  msgWrapper: {
    flexDirection: 'row',
  },
  msgWrapperUser: {
    justifyContent: 'flex-end',
  },
  msgWrapperDriver: {
    justifyContent: 'flex-start',
  },
  msgBubble: {
    maxWidth: '78%',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 1,
  },
  msgBubbleUser: {
    backgroundColor: '#0052e0',
    borderBottomRightRadius: 4,
  },
  msgBubbleDriver: {
    backgroundColor: '#f1f5f9',
    borderBottomLeftRadius: 4,
  },
  msgText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0f172a',
    lineHeight: 20,
  },
  msgTextUser: {
    color: '#ffffff',
  },
  msgTime: {
    fontSize: 10,
    fontWeight: '700',
    color: '#94a3b8',
    marginTop: 4,
    alignSelf: 'flex-end',
  },
  msgTimeUser: {
    color: '#bfdbfe',
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    backgroundColor: '#ffffff',
    gap: 10,
  },
  textInput: {
    flex: 1,
    height: 48,
    backgroundColor: '#f8fafc',
    borderRadius: 24,
    paddingHorizontal: 18,
    fontSize: 14,
    fontWeight: '600',
    color: '#0f172a',
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
  },
  sendBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#0052e0',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#0052e0',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.35,
    shadowRadius: 6,
    elevation: 4,
  },
  sendBtnDisabled: {
    backgroundColor: '#cbd5e1',
    shadowOpacity: 0,
  },
});
