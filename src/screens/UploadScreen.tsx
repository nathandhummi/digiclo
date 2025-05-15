import React, { useState } from 'react';
import { View, Text, TextInput, Button, Image, SafeAreaView, ScrollView } from 'react-native';

import * as ImagePicker from 'expo-image-picker';

import { BACKEND_URL } from '../config';

export default function UploadScreen() {
  const [image, setImage] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [type, setType] = useState('');
  const [color, setColor] = useState('');

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

    const res = await fetch(`${BACKEND_URL}/api/upload`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ image }),
    });

    const data = await res.json();
    return data.url;
  };

  const saveClothingItem = async () => {
    const imageUrl = await uploadImage();
    if (!imageUrl) {
      alert('Image upload failed');
      return;
    }

    const clothingItem = { name, type, color, imageUrl };

    const res = await fetch(`${BACKEND_URL}/api/clothes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(clothingItem),
    });

    const data = await res.json();
    console.log('Saved clothing item:', data);
    alert('Upload complete!');
    setImage(null);
    setName('');
    setType('');
    setColor('');
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
        <TextInput placeholder="Name" value={name} onChangeText={setName} />
        <TextInput placeholder="Type (e.g. shirt)" value={type} onChangeText={setType} />
        <TextInput placeholder="Color" value={color} onChangeText={setColor} />
        <Button title="Upload Clothing Item" onPress={saveClothingItem} />
      </ScrollView>
    </SafeAreaView>
  );
}