// src/screens/clothes/ItemDetail.tsx
import React, { useState, useEffect, useCallback } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import type { RootStackParamList } from '../../App'; // adjust path as needed
import TagsInput from '../../components/TagsInput';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BACKEND_URL } from '../../config';

type Props = NativeStackScreenProps<RootStackParamList, 'Item'>;

export default function ItemDetail({ route, navigation }: Props) {
  const { id } = route.params;

  // We’ll keep local state for imageUrl, isFavorite, and tags
  const [imageUrl, setImageUrl] = useState<string>(route.params.imageUrl);
  const [isFavorite, setIsFavorite] = useState<boolean>(route.params.isFavorite);
  const [tags, setTags] = useState<string[]>(route.params.tags);

  const [loading, setLoading] = useState<boolean>(false);
  const [loadingFavorite, setLoadingFavorite] = useState<boolean>(false);
  const [loadingTags, setLoadingTags] = useState<boolean>(false);

  /**
   * Whenever the screen comes into focus, re-fetch the item from the server
   * to get up-to-date { imageUrl, isFavorite, tags }. This ensures that if you
   * deleted tags (or toggled favorite) previously, the fresh data shows up now.
   */
  useFocusEffect(
    useCallback(() => {
      const fetchItem = async () => {
        setLoading(true);
        try {
          const token = await AsyncStorage.getItem('token');
          if (!token) throw new Error('Not authenticated');

          const res = await fetch(`${BACKEND_URL}/api/clothes/${id}`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          if (!res.ok) {
            const errBody = await res.json();
            throw new Error(errBody.error || 'Failed to fetch item');
          }
          const item = await res.json();
          // Update all local state from the server response
          setImageUrl(item.imageUrl);
          setIsFavorite(item.isFavorite);
          setTags(item.tags);
        } catch (err: any) {
          Alert.alert('Error', err.message || 'Could not load item.');
        } finally {
          setLoading(false);
        }
      };

      fetchItem();
    }, [id])
  );

  /**
   * Toggle the "favorite" flag on the backend, then update local state.
   */
  const toggleFavorite = async () => {
    if (loadingFavorite) return;
    setLoadingFavorite(true);
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) throw new Error('Not authenticated');

      const res = await fetch(`${BACKEND_URL}/api/clothes/${id}/favorite`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
      if (!res.ok) {
        const errBody = await res.json();
        throw new Error(errBody.error || 'Failed to toggle favorite');
      }
      const updatedItem = await res.json();
      setIsFavorite(updatedItem.isFavorite);
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Could not update favorite.');
    } finally {
      setLoadingFavorite(false);
    }
  };

  /**
   * Whenever `tags` array changes locally, PATCH the new array to the server.
   */
  const updateTagsOnServer = useCallback(
    async (newTags: string[]) => {
      setLoadingTags(true);
      try {
        const token = await AsyncStorage.getItem('token');
        if (!token) throw new Error('Not authenticated');

        const res = await fetch(`${BACKEND_URL}/api/clothes/${id}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ tags: newTags }),
        });
        if (!res.ok) {
          const errBody = await res.json();
          throw new Error(errBody.error || 'Failed to update tags');
        }
        // We do NOT update local state here from the patch response,
        // because the focus‐effect above will re-fetch fresh data next time.
      } catch (err: any) {
        Alert.alert('Error', err.message || 'Could not update tags.');
      } finally {
        setLoadingTags(false);
      }
    },
    [id]
  );

  /**
   * Any time `tags` changes (e.g. you tap the “×” on a chip), push to the server.
   */
  useEffect(() => {
    // If tags array came from the server on focus, we skip immediate patch.
    // But on subsequent edits, `tags` will differ, so we PATCH.
    // Simplest detection: always patch except while `loading` initial fetch.
    if (!loading) {
      updateTagsOnServer(tags);
    }
  }, [tags, loading, updateTagsOnServer]);

  if (loading) {
    // Show a full-screen spinner while we fetch for the first time
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#000" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.card}>
          <Image source={{ uri: imageUrl }} style={styles.image} />

          <TouchableOpacity
            style={styles.favoriteBtn}
            onPress={toggleFavorite}
            disabled={loadingFavorite}
          >
            {loadingFavorite ? (
              <ActivityIndicator size="small" color="red" />
            ) : (
              <Ionicons
                name={isFavorite ? 'heart' : 'heart-outline'}
                size={28}
                color={isFavorite ? 'red' : 'gray'}
              />
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.tagsSection}>
          <Text style={styles.sectionTitle}>Tags</Text>
          {loadingTags && (
            <View style={styles.loadingOverlay}>
              <ActivityIndicator size="small" color="#000" />
              <Text style={styles.loadingText}>Updating tags…</Text>
            </View>
          )}
          <TagsInput tags={tags} onChangeTags={setTags} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const IMAGE_SIZE = 250;

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  container: { flex: 1, backgroundColor: '#fff' },
  content: { alignItems: 'center', padding: 16 },

  card: {
    width: IMAGE_SIZE,
    height: IMAGE_SIZE,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#f0f0f0',
    marginBottom: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: IMAGE_SIZE,
    height: IMAGE_SIZE,
  },
  favoriteBtn: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 20,
    padding: 4,
  },

  tagsSection: {
    width: '100%',
    paddingHorizontal: 16,
    marginTop: 16,
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },

  loadingOverlay: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  loadingText: {
    marginLeft: 6,
    fontSize: 12,
    color: '#555',
  },
});
