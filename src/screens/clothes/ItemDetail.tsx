// src/screens/clothes/ItemDetail.tsx
import React, { useState } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import type { RootStackParamList } from '../../App';
import TagsInput from '../../components/TagsInput';

type Props = NativeStackScreenProps<RootStackParamList, 'Item'>;

export default function ItemDetail({ route }: Props) {
  const { id, imageUrl, isFavorite: initialFav, tags: initialTags } = route.params;
  const [isFavorite, setIsFavorite] = useState<boolean>(initialFav);
  const [tags, setTags] = useState<string[]>(initialTags);

  const toggleFavorite = async () => {
    try {
      const res = await fetch(`http://localhost:4000/api/clothes/${id}/favorite`, {
        method: 'PATCH',
      });
      const updated = await res.json();
      setIsFavorite(updated.isFavorite);
    } catch {
      // Optionally show an error alert here
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.card}>
          <Image source={{ uri: imageUrl }} style={styles.image} />
          <TouchableOpacity style={styles.favoriteBtn} onPress={toggleFavorite}>
            <Ionicons
              name={isFavorite ? 'heart' : 'heart-outline'}
              size={28}
              color={isFavorite ? 'red' : 'gray'}
            />
          </TouchableOpacity>
        </View>

        <View style={styles.tagsSection}>
          <Text style={styles.sectionTitle}>Tags</Text>
          <TagsInput tags={tags} onChangeTags={setTags} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const IMAGE_SIZE = 250;

const styles = StyleSheet.create({
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
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
});
