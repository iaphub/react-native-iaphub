import React, {useState} from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  Modal,
  TouchableOpacity,
  SafeAreaView
} from 'react-native';
import { useApp } from '../context/AppContext';

export default function LoginPage() {
  const { login, loginAnonymously } = useApp();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [storedUserId, setStoredUserId] = useState('42');
  const [pendingUserId, setPendingUserId] = useState('42');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const openUserIdModal = () => {
    setPendingUserId(storedUserId);
    setIsModalVisible(true);
  };

  const closeUserIdModal = () => {
    if (!isSubmitting) {
      setIsModalVisible(false);
    }
  };

  const handleConfirmLogin = async () => {
    if (isSubmitting) {
      return;
    }

    const sanitizedUserId = pendingUserId.trim() || '42';

    try {
      setIsSubmitting(true);
      await login(sanitizedUserId);
      setStoredUserId(sanitizedUserId);
      setIsModalVisible(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.root}>
      <View style={styles.card}>
        <Text style={styles.title}>Welcome back</Text>
        <Text style={styles.subtitle}>
          Sign in to personalize the in-app purchase experience or continue as a guest to
          explore the catalog.
        </Text>
        <TouchableOpacity style={styles.primaryButton} onPress={openUserIdModal}>
          <Text style={styles.primaryButtonText}>Login</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.secondaryButton} onPress={loginAnonymously}>
          <Text style={styles.secondaryButtonText}>Continue as guest</Text>
        </TouchableOpacity>
      </View>

      <Modal
        animationType="fade"
        transparent
        visible={isModalVisible}
        onRequestClose={closeUserIdModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Enter user ID</Text>
            <Text style={styles.modalDescription}>
              Provide the user identifier you want to authenticate with. Using the default will
              load demo data associated with that account.
            </Text>
            <TextInput
              style={styles.input}
              value={pendingUserId}
              onChangeText={setPendingUserId}
              placeholder="User ID"
              autoFocus
              editable={!isSubmitting}
              keyboardType="number-pad"
              returnKeyType="done"
            />
            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.modalCancelButton} onPress={closeUserIdModal} disabled={isSubmitting}>
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalConfirmButton, isSubmitting && styles.modalConfirmButtonDisabled]}
                onPress={handleConfirmLogin}
                disabled={isSubmitting}
              >
                <Text style={styles.modalConfirmText}>{isSubmitting ? 'Logging in...' : 'Login'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#10152C',
    paddingHorizontal: 24,
    justifyContent: 'center'
  },
  card: {
    backgroundColor: '#1B2341',
    borderRadius: 16,
    paddingVertical: 32,
    paddingHorizontal: 24,
    alignSelf: 'center',
    width: '100%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.25,
    shadowRadius: 24,
    elevation: 6
  },
  title: {
    fontSize: 28,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 12
  },
  subtitle: {
    fontSize: 16,
    color: '#A7B3D2',
    lineHeight: 22,
    marginBottom: 32
  },
  primaryButton: {
    backgroundColor: '#6C63FF',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 12
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600'
  },
  secondaryButton: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#6C63FF',
    paddingVertical: 14,
    alignItems: 'center'
  },
  secondaryButtonText: {
    color: '#6C63FF',
    fontSize: 16,
    fontWeight: '600'
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24
  },
  modalContent: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#0C1230',
    marginBottom: 8
  },
  modalDescription: {
    fontSize: 14,
    color: '#4A5A82',
    marginBottom: 16
  },
  input: {
    borderWidth: 1,
    borderColor: '#C7CDE0',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    color: '#0C1230',
    marginBottom: 24
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end'
  },
  modalCancelButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    marginRight: 8
  },
  modalCancelText: {
    color: '#4A5A82',
    fontSize: 16,
    fontWeight: '500'
  },
  modalConfirmButton: {
    backgroundColor: '#6C63FF',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 18
  },
  modalConfirmButtonDisabled: {
    opacity: 0.7
  },
  modalConfirmText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600'
  }
});
