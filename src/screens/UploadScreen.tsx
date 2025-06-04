// src/screens/clothes/UploadScreen.tsx
import React, { useState } from 'react';
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  StyleSheet,
  Platform,
} from 'react-native';
import { Dropdown } from 'react-native-element-dropdown';
import * as ImagePicker from 'expo-image-picker';
import TagsInput from '../components/TagsInput';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../types';
import { BACKEND_URL, TAGGER_URL } from '../config';
import AsyncStorage from '@react-native-async-storage/async-storage';

type NavProp = NativeStackNavigationProp<RootStackParamList, 'Upload'>;
type CategoryOption = { label: string; value: string };

const CATEGORIES: CategoryOption[] = [
  { label: 'Top', value: 'top' },
  { label: 'Bottom', value: 'bottom' },
  { label: 'Shoe', value: 'shoe' },
];

export default function UploadScreen() {
  const navigation = useNavigation<NavProp>();
  const [label, setLabel] = useState('');
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [category, setCategory] = useState<string>('');
  const [tags, setTags] = useState<string[]>([]);
  const [uploading, setUploading] = useState<boolean>(false);
  const [tagging, setTagging] = useState<boolean>(false);

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      alert('Permission required');
      return;
    }

    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      base64: true,
      quality: 0.8,
    });

    if (!res.canceled && res.assets.length > 0) {
      const asset = res.assets[0];
      setImageBase64(`data:image/jpeg;base64,${asset.base64}`);
      setImageUri(asset.uri);
      fetchTagsFromTagger(asset.uri);
    }
  };

  const fetchTagsFromTagger = async (uri: string) => {
    setTagging(true);
    try {
      const formData = new FormData();
      if (uri.startsWith('data:')) {
        const response = await fetch(uri);
        const blob = await response.blob();
        formData.append('file', blob, 'upload.jpg');
      } else {
        formData.append('file', {
          uri,
          name: 'upload.jpg',
          type: 'image/jpeg',
        } as any);
      }
  
      const res = await fetch(`${TAGGER_URL}/tag-image?top_k=8`, {
        method: 'POST',
        body: formData,
      });
  
      if (!res.ok) {
        console.warn('Tagger responded with status', res.status);
        setTags([]);
      } else {
        const json = await res.json();
        console.log('Raw tagger response:', json);    // ← log the entire JSON
        if (Array.isArray(json.tags)) {
          setTags(json.tags);
        } else {
          // If tags came back under a different key, log that too
          console.warn('Expected json.tags to be an array, but got:', json);
          setTags([]);
        }
      }
    } catch (err) {
      console.error('Error fetching tags:', err);
      setTags([]);
    } finally {
      setTagging(false);
    }
  };

  const uploadImageToNode = async (): Promise<string | null> => {
    if (!imageBase64) return null;
    try {
      const res = await fetch(`${BACKEND_URL}/api/upload`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: imageBase64 }),
      });
      if (!res.ok) {
        console.warn('Node upload failed:', res.status);
        return null;
      }
      const data = await res.json();
      return data.url as string;
    } catch (err) {
      console.error('Error uploading to Node:', err);
      return null;
    }
  };

  const saveClothingItem = async () => {
    if (uploading) return;
    if (!label.trim()) {
      alert('Please enter a name for your item.');
      return;
    }
    if (!category) {
      alert('Please select a category.');
      return;
    }
    if (!imageBase64) {
      alert('Please pick an image first.');
      return;
    }

    setUploading(true);
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        alert('User not authenticated');
        return;
      }

      const imageUrl = await uploadImageToNode();
      if (!imageUrl) throw new Error('Image upload failed');

      const res = await fetch(`${BACKEND_URL}/api/clothes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ label, category, imageUrl, tags }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Save failed');
      }

      navigation.goBack();
    } catch (err: any) {
      console.error(err);
      alert(`Upload failed: ${err.message}`);
    } finally {
      setUploading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Upload New Item</Text>

        <TouchableOpacity
          style={imageUri ? styles.imageBoxLarge : styles.uploadButton}
          onPress={pickImage}
          disabled={uploading || tagging}
        >
          {imageUri ? (
            <Image source={{ uri: imageUri }} style={styles.imagePreview} />
          ) : (
            <Text style={styles.uploadButtonText}>+</Text>
          )}
        </TouchableOpacity>

        {tagging && (
          <View style={styles.taggingOverlay}>
            <ActivityIndicator size="large" color="white" />
            <Text style={styles.taggingText}>Tagging...</Text>
          </View>
        )}

        <Text style={styles.label}>Name</Text>
        <TextInput
          style={styles.textInput}
          placeholder="e.g. Blue Jeans"
          value={label}
          onChangeText={setLabel}
          editable={!uploading}
        />

        <Text style={styles.label}>Category</Text>
        <Dropdown
          style={styles.dropdown}
          data={CATEGORIES}
          labelField="label"
          valueField="value"
          placeholder="Select category..."
          value={category}
          onChange={(item) => setCategory(item.value)}
          disable={uploading}
        />

        <Text style={styles.label}>Tags</Text>
        <TagsInput tags={tags} onChangeTags={setTags} editable={!uploading} />

        <TouchableOpacity
          onPress={saveClothingItem}
          disabled={uploading || tagging}
          style={[
            styles.uploadButtonFullWidth,
            (uploading || tagging) && styles.disabledButton,
          ]}
        >
          <Text style={styles.buttonText}>
            {uploading ? 'Uploading...' : 'Upload'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  content: { padding: 20 },
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
  taggingOverlay: {
    position: 'absolute',
    top: 200,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  taggingText: {
    marginTop: 8,
    color: 'white',
    fontWeight: '600',
  },
  label: {
    fontWeight: '600',
    fontSize: 14,
    marginBottom: 8,
  },
  textInput: {
    height: 44,
    borderWidth: 1,
    borderColor: '#000',
    borderRadius: 4,
    paddingHorizontal: 10,
    marginBottom: 16,
    backgroundColor: '#fff',
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
  disabledButton: {
    backgroundColor: '#ccc',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});
