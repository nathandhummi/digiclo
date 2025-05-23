import React from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet } from 'react-native';

interface UploadModalProps {
  visible: boolean;
  onClose: () => void;
  onUploadClothes: () => void;
  onCreateOutfit: () => void;
}

const UploadModal: React.FC<UploadModalProps> = ({
  visible,
  onClose,
  onUploadClothes,
  onCreateOutfit,
}) => {
  return (
    <Modal
      transparent
      animationType="fade"
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.backdrop}>
        {/* This layer catches background taps */}
        <TouchableOpacity style={styles.modalWrapper} onPress={onClose} activeOpacity={1} />

        {/* Modal content stays fixed on top */}
        <View style={styles.modal}>
          <TouchableOpacity style={styles.button} onPress={onUploadClothes}>
            <Text style={styles.text}>Upload Clothes</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={onCreateOutfit}>
            <Text style={styles.text}>Create Outfit</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalWrapper: {
    ...StyleSheet.absoluteFillObject,
  },
  modal: {
    backgroundColor: '#fff',
    paddingVertical: 20,
    paddingHorizontal: 30,
    borderRadius: 10,
    elevation: 5,
    zIndex: 10,
  },
  button: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  text: {
    fontSize: 16,
    fontWeight: '500',
  },
});

export default UploadModal;
