import React, { useState } from 'react';
import { View, Text, TextInput, Button, Image, SafeAreaView, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { Dropdown } from 'react-native-element-dropdown';

import * as ImagePicker from 'expo-image-picker';

import { BACKEND_URL } from '../config';

const labelToCategory: Record<string, string> = {
  'T-Shirt': 'top',
  'Hoodie': 'top',
  'Sweater': 'top',
  'Jeans': 'bottom',
  'Shorts': 'bottom',
  'Skirt': 'bottom',
  'Sneakers': 'shoe',
  'Boots': 'shoe',
  'Heels': 'shoe',
  'Hat': 'accessory',
  'Bag': 'accessory',
};

export default function UploadScreen() {
  const [image, setImage] = useState<string | null>(null);
  const [label, setLabel] = useState('');
  const [uploading, setUploading] = useState(false);


  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      alert('Permission required');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      base64: true,
    });

    if (!result.canceled) {
      const base64 = `data:image/jpeg;base64,${result.assets[0].base64}`;
      setImage(base64);
    }
  };

  const uploadImage = async () => {
    if (!image) return null;

    try {
      const res = await fetch(`${BACKEND_URL}/api/upload`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image }),
      });

      const data = await res.json();
      console.log('Upload response:', data);
      return data.url;
    } catch (error) {
      console.error('Image upload failed:', error);
      return null;
    }
  };

  const saveClothingItem = async () => {
    if (uploading) return; // prevent double-tap
    setUploading(true);

    try {
      const imageUrl = await uploadImage();
      if (!imageUrl) {
        alert('Image upload failed');
        return;
      }

      const category = labelToCategory[label];
      if (!label || !category) {
        alert('Please select a valid label.');
        return;
      }

      const clothingItem = { label, category, imageUrl };

      const res = await fetch(`${BACKEND_URL}/api/clothes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(clothingItem),
      });

      const data = await res.json();
      console.log('Saved clothing item:', data);
      alert('Upload complete!');
      setImage(null);
      setLabel('');
    } catch(error) {
      console.error('Upload error:', error);
      alert('Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={{ padding: 20 }}>
        <Text style={styles.title}>Upload</Text>
        <View style={styles.topHalf}>
          <TouchableOpacity style={image ? styles.imageBoxLarge : styles.uploadButton} onPress={pickImage}>
            {image ? (
              <Image source={{ uri : image }} style={styles.imagePreview} />
            ) : (
              <Text style={styles.uploadButtonText}>+</Text>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.bottomHalf}>
          <Text style={styles.label}>Category</Text>
          <Dropdown 
            style={{ marginVertical: 10, ...styles.dropdown }}
            data={Object.keys(labelToCategory).map((item) => ({
              label: item,
              value: item,
            }))}
            labelField="label"
            valueField="value"
            placeholder="Select Category..."
            value={label}
            onChange={(item) => setLabel(item.value)}
          />

          <TouchableOpacity onPress={saveClothingItem} disabled={uploading} style={[ styles.uploadButtonFullWidth, uploading && { backgroundColor: '#ccc' }, ]}>
            <Text style={styles.buttonText}>
              {uploading ? 'Uploading...' : 'Upload'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  title: {
    fontFamily: 'Inter-Bold',
    fontSize: 24,
    padding: 16,
    textAlign: 'center',
  },

  uploadButtonFullWidth: {
    height: 44,
    borderRadius: 4,
    backgroundColor: '#172251',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 10,
    marginBottom: 16,
  },

  // button: {
  //   backgroundColor: '#172251',
  //   paddingVertical: 12,
  //   paddingHorizontal: 20,
  //   borderRadius: 5,
  //   alignItems: 'center',

  //   shadowColor: '#000',
  //   shadowOffset: { width: 0, height: 2 },
  //   shadowOpacity: 0.25,
  //   shadowRadius: 3.84,
  //   elevation: 5,
  // },

  buttonText: {
    fontFamily: 'Inter-Regular',
    color: 'white',
    fontSize: 16,
    textAlign: 'center',
  },

  uploadButton: {
    backgroundColor: '#172251',
    width: 160,
    height: 160,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
  },

  imageBoxLarge: {
    width: 270,
    height: 270,
  },

  uploadButtonText: {
    fontFamily: 'Inter-Bold',
    color: 'white',
    fontSize: 30,
    textAlign: 'center',
  },
    
  imagePreview: {
    width: '100%',
    height: '100%',
    borderRadius: 4,
    resizeMode: 'cover',
  },

  // input: {
  //   height: 44,
  //   borderWidth: 1,
  //   borderColor: '#000',
  //   paddingHorizontal: 10,
  //   borderRadius: 4,
  //   fontSize: 16,
  //   backgroundColor: '#fff',
  //   marginBottom: 16,
  // },

  topHalf: {
    marginTop: 24,
    marginBottom: 24,
    alignItems: 'center',
  },

  bottomHalf: {
    marginTop: 20,
    paddingHorizontal: 24,
  },

  label: {
    fontFamily: 'Inter-Bold',
    fontSize: 14,
    marginBottom: 4,
    color: '#000',
  },

  dropdown: {
    height: 44,
    borderColor: '#000',
    borderWidth: 1,
    borderRadius: 4,
    paddingHorizontal: 10,
    backgroundColor: '#fff',
    marginBottom: 16,
  },

});