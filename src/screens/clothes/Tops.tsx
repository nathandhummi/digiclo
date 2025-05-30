// src/screens/clothes/Tops.tsx
import React, { useState, useEffect } from 'react';
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
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../types';

type NavProp = NativeStackNavigationProp<RootStackParamList, 'Tops'>;

const { width } = Dimensions.get('window');
const ITEM_SIZE = (width - 32 - 16) / 3; // 32 = horizontal padding, 16 = space between items

export default function Tops() {
  const navigation = useNavigation<NavProp>();
  const [viewMode, setViewMode] = useState<'all' | 'favorites'>('all');
  const [sortKey, setSortKey] = useState<'newest' | 'price'>('newest');
  const [items, setItems] = useState<any[]>([]);

  useEffect(() => {
    fetch('http://localhost:4000/api/clothes')
      .then(r => r.json())
      .then((data: any[]) => {
        const topsOnly = data.filter(item => item.category === 'top');
        setItems(topsOnly);
      })
      .catch(console.error);
  }, []);

  const renderHeader = () => (
    <View style={styles.headerContainer}>
      <View style={styles.tabGroup}>
        <TouchableOpacity
          style={[styles.tab, viewMode === 'all' && styles.tabActive]}
          onPress={() => setViewMode('all')}
        >
          <Text style={[styles.tabText, viewMode === 'all' && styles.tabTextActive]}>
            SHIRTS
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, viewMode === 'favorites' && styles.tabActive]}
          onPress={() => setViewMode('favorites')}
        >
          <Text style={[styles.tabText, viewMode === 'favorites' && styles.tabTextActive]}>
            FAVORITES
          </Text>
        </TouchableOpacity>
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
    viewMode === 'favorites'
      ? items.filter(i => i.isFavorite)
      : items;

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
            onPress={() => navigation.goBack()}
          >
            <Image
              source={{ uri: item.imageUrl }}
              style={styles.image}
              resizeMode="cover"
            />
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
  tabGroup: {
    flexDirection: 'row',
    flex: 1,
  },
  tab: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderBottomWidth: 2,
    borderColor: 'transparent',
  },
  tabActive: {
    borderColor: '#000',
  },
  tabText: {
    fontSize: 14,
    color: 'gray',
  },
  tabTextActive: {
    color: '#000',
    fontWeight: '600',
  },

  controls: {
    flexDirection: 'row',
    alignItems: 'center',
  },
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
  sortText: {
    fontSize: 12,
    marginRight: 4,
    color: '#000',
  },

  list: {
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  card: {
    width: ITEM_SIZE,
    height: ITEM_SIZE + 20,
    marginBottom: 12,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#f5f5f5',
  },
  image: {
    width: '100%',
    height: '100%',
  },
});
