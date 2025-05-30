// src/screens/clothes/Shoes.tsx
import React, { useState, useCallback } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  TouchableOpacity,
  FlatList,
  Image,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../types';
import AsyncStorage from '@react-native-async-storage/async-storage';

type NavProp = NativeStackNavigationProp<RootStackParamList, 'Shoes'>;

const { width } = Dimensions.get('window');
const ITEM_SIZE = (width - 32 - 16) / 3;

export default function Shoes() {
  const navigation = useNavigation<NavProp>();
  const [viewMode, setViewMode] = useState<'all' | 'favorites'>('all');
  const [sortKey, setSortKey] = useState<'newest' | 'price'>('newest');
  const [items, setItems] = useState<any[]>([]);

  // Fetch & filter shoes on focus
  useFocusEffect(
    useCallback(() => {
      const fetchShoes = async () => {
        try {
          const token = await AsyncStorage.getItem('token');
          if (!token) throw new Error('Token not found');

          const res = await fetch('http://localhost:4000/api/clothes', {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          const data: any[] = await res.json();
          setItems(data.filter(item => item.category === 'shoe'));
        } catch (err) {
          console.error('Failed to fetch shoes:', err);
        }
      };

      fetchShoes();
    }, [])
  );

  const renderHeader = () => (
    <View style={styles.headerContainer}>
      <View style={styles.tabGroup}>
        {(['all', 'favorites'] as const).map(mode => (
          <TouchableOpacity
            key={mode}
            style={[styles.tab, viewMode === mode && styles.tabActive]}
            onPress={() => setViewMode(mode)}
          >
            <Text
              style={[
                styles.tabText,
                viewMode === mode && styles.tabTextActive,
              ]}
            >
              {mode === 'all' ? 'SHOES' : 'FAVORITES'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      <View style={styles.controls}>
        <TouchableOpacity
          style={styles.sortButton}
          onPress={() =>
            setSortKey(k => (k === 'newest' ? 'price' : 'newest'))
          }
        >
          <Text style={styles.sortText}>
            SORT BY: {sortKey === 'newest' ? 'Newest' : 'Price'}
          </Text>
          <Ionicons name="chevron-down" size={16} color="#000" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => {/* open filter modal */}}>
          <Ionicons name="filter" size={20} color="#000" />
        </TouchableOpacity>
      </View>
    </View>
  );

  const filtered =
    viewMode === 'favorites' ? items.filter(i => i.isFavorite) : items;

  const sorted = [...filtered].sort((a, b) =>
    sortKey === 'newest'
      ? new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      : a.price - b.price
  );

  return (
    <SafeAreaView style={styles.container}>
      {renderHeader()}
      <FlatList
        data={sorted}
        keyExtractor={i => i._id}
        numColumns={3}
        contentContainerStyle={styles.list}
        columnWrapperStyle={{ justifyContent: 'space-between' }}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            onPress={() =>
              navigation.navigate('Item', {
                id: item._id,
                imageUrl: item.imageUrl,
                isFavorite: item.isFavorite,
                tags: item.tags,
              })
            }
          >
            <Image
              source={{ uri: item.imageUrl }}
              style={styles.image}
              resizeMode="cover"
            />
            {item.isFavorite && (
              <View style={styles.heartOverlay}>
                <Ionicons name="heart" size={20} color="red" />
              </View>
            )}
          </TouchableOpacity>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 4,
  },
  tabGroup: { flexDirection: 'row', flex: 1 },
  tab: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderBottomWidth: 2,
    borderColor: 'transparent',
  },
  tabActive: { borderColor: '#000' },
  tabText: { fontSize: 14, color: 'gray' },
  tabTextActive: { color: '#000', fontWeight: '600' },
  controls: { flexDirection: 'row', alignItems: 'center' },
  sortButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#ccc',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 4,
  },
  sortText: { fontSize: 12, marginRight: 4, color: '#000' },
  list: { paddingHorizontal: 16, paddingTop: 8 },
  card: {
    width: ITEM_SIZE,
    height: ITEM_SIZE + 20,
    marginBottom: 12,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#f5f5f5',
  },
  image: { width: '100%', height: '100%' },
  heartOverlay: {
    position: 'absolute',
    top: 6,
    right: 6,
    backgroundColor: 'rgba(255,255,255,0.8)',
    borderRadius: 10,
    padding: 2,
  },
});
