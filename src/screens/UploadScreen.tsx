import React, { useState } from 'react';
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
} from 'react-native';
import { Dropdown } from 'react-native-element-dropdown';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import TagsInput from '../components/TagsInput';
import { BACKEND_URL } from '../config';
import AsyncStorage from '@react-native-async-storage/async-storage';

type CategoryOption = { label: string; value: string };

const CATEGORIES: CategoryOption[] = [
  { label: 'Top',    value: 'top' },
  { label: 'Bottom', value: 'bottom' },
  { label: 'Shoe',   value: 'shoe' },
];

const UploadScreen: React.FC = () => {
  const [image, setImage] = useState<string | null>(null);
  const [category, setCategory] = useState<string>('');
  const [tags, setTags] = useState<string[]>([]);
  const [uploading, setUploading] = useState<boolean>(false);

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      alert('Permission required');
      return;
    }

    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      base64: true,
    });

    if (!res.canceled && res.assets.length > 0) {
      setImage(`data:image/jpeg;base64,${res.assets[0].base64}`);
    }
  };

  const uploadImage = async (): Promise<string | null> => {
    if (!image) return null;
    try {
      const res = await fetch(`${BACKEND_URL}/api/upload`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image }),
      });
      const data = await res.json();
      return data.url as string;
    } catch {
      return null;
    }
  };

  const saveClothingItem = async () => {
    if (uploading) return;
    if (!category) {
      alert('Please select a category.');
      return;
    }

    setUploading(true);
    try {
      const token = await AsyncStorage.getItem('token'); // 🔑 get token
      if (!token) {
        alert('User not authenticated');
        return;
      }

      const imageUrl = await uploadImage();
      if (!imageUrl) throw new Error('Image upload failed');

      await fetch(`${BACKEND_URL}/api/clothes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json',
                 Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ category, imageUrl, tags }),
      });

      alert('Upload complete!');
      setImage(null);
      setCategory('');
      setTags([]);
    } catch (err) {
      console.error(err);
      alert('Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
      <ScrollView contentContainerStyle={{ padding: 20 }}>
        <Text style={styles.title}>Upload</Text>

        <TouchableOpacity
          style={image ? styles.imageBoxLarge : styles.uploadButton}
          onPress={pickImage}
        >
          {image ? (
            <Image source={{ uri: image }} style={styles.imagePreview} />
          ) : (
            <Text style={styles.uploadButtonText}>+</Text>
          )}
        </TouchableOpacity>

        <Text style={styles.label}>Category</Text>
        <Dropdown
          style={styles.dropdown}
          data={CATEGORIES}
          labelField="label"
          valueField="value"
          placeholder="Select category..."
          value={category}
          onChange={item => setCategory(item.value)}
        />

        <Text style={styles.label}>Tags</Text>
        <TagsInput tags={tags} onChangeTags={setTags} />

        <TouchableOpacity
          onPress={saveClothingItem}
          disabled={uploading}
          style={[
            styles.uploadButtonFullWidth,
            uploading && { backgroundColor: '#ccc' },
          ]}
        >
          <Text style={styles.buttonText}>
            {uploading ? 'Uploading...' : 'Upload'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 24,
  },
  uploadButton: {
    backgroundColor: '#172251',
    width: 160,
    height: 160,
    borderRadius: 10,
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  imageBoxLarge: {
    width: 270,
    height: 270,
    alignSelf: 'center',
    marginBottom: 24,
  },
  uploadButtonText: {
    fontSize: 30,
    color: 'white',
    fontWeight: 'bold',
  },
  imagePreview: {
    width: '100%',
    height: '100%',
    borderRadius: 4,
  },
  label: {
    fontWeight: '600',
    fontSize: 14,
    marginBottom: 8,
  },
  dropdown: {
    height: 44,
    borderWidth: 1,
    borderColor: '#000',
    borderRadius: 4,
    paddingHorizontal: 10,
    marginBottom: 16,
    backgroundColor: '#fff',
  },
  uploadButtonFullWidth: {
    height: 44,
    borderRadius: 4,
    backgroundColor: '#172251',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default UploadScreen;
