import React, { useState } from 'react';
import { View, Text, TextInput, Button, Image, SafeAreaView, ScrollView } from 'react-native';
import { Picker } from '@react-native-picker/picker';

import * as ImagePicker from 'expo-image-picker';

import { BACKEND_URL } from '../config';

const labelToCategory: Record<string, string> = {
  'T-Shirt': 'Top',
  'Hoodie': 'Top',
  'Sweater': 'Top',
  'Jeans': 'Bottom',
  'Shorts': 'Bottom',
  'Skirt': 'Bottom',
  'Sneakers': 'Shoes',
  'Boots': 'Shoes',
  'Heels': 'Shoes',
  'Hat': 'Accessory',
  'Bag': 'Accessory',
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
        <Button title="Pick Image" onPress={pickImage} />
        {image && (
          <Image
            source={{ uri: image }}
            style={{ width: 200, height: 200, marginVertical: 10 }}
          />
        )}
        <Text style={{ marginTop: 10, fontWeight: 'bold' }}>Select Clothing Label:</Text>
        <Picker
          selectedValue={label}
          onValueChange={(value: string) => setLabel(value)}
          style={{ marginVertical: 10 }}
        >
          <Picker.Item label="Select Label..." value="" />
          {Object.keys(labelToCategory).map((item) => (
            <Picker.Item key={item} label={item} value={item} />
          ))}
        </Picker>
        <Button
          title={uploading ? 'Uploading...' : 'Upload Clothing Item'}
          onPress={saveClothingItem}
          disabled={uploading}
        />
      </ScrollView>
    </SafeAreaView>
  );
}