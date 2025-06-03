// src/screens/clothes/Tops.tsx
import React, { useState, useCallback } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  Image,
  StyleSheet,
  Dimensions,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../types';
import AsyncStorage from '@react-native-async-storage/async-storage';

type NavProp = NativeStackNavigationProp<RootStackParamList, 'Tops'>;

const { width } = Dimensions.get('window');
const ITEM_SIZE = (width - 32 - 16) / 3;

export default function Tops() {
  const navigation = useNavigation<NavProp>();

  // State for items, sorting, etc.
  const [viewMode, setViewMode] = useState<'all' | 'favorites'>('all');
  const [sortKey, setSortKey] = useState<'newest' | 'price'>('newest');
  const [items, setItems] = useState<any[]>([]);

  // State for search dropdown
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);
  const [searchText, setSearchText] = useState<string>('');

  // Fetch tops on focus
  useFocusEffect(
    useCallback(() => {
      const fetchTops = async () => {
        try {
          const token = await AsyncStorage.getItem('token');
          if (!token) throw new Error('Token not found');

          const res = await fetch('http://localhost:4000/api/clothes', {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          const data: any[] = await res.json();
          setItems(data.filter(item => item.category === 'top'));
        } catch (err) {
          console.error('Failed to fetch tops:', err);
        }
      };

      fetchTops();
    }, [])
  );

  // Filter by viewMode (all vs favorites)
  const filteredByMode =
    viewMode === 'favorites' ? items.filter(i => i.isFavorite) : items;

  // Then filter by searchText
  const filteredBySearch = filteredByMode.filter(item => {
    if (!searchText.trim()) return true;
    return item.tags.some((t: string) =>
      t.toLowerCase().includes(searchText.toLowerCase())
    );
  });

  // Finally sort
  const sorted = [...filteredBySearch].sort((a, b) =>
    sortKey === 'newest'
      ? new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      : a.price - b.price
  );

  // Header with tabs + SEARCH button
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
              {mode === 'all' ? 'TOPS' : 'FAVORITES'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      <TouchableOpacity
        style={styles.searchButton}
        onPress={() => setIsSearchOpen(open => !open)}
      >
        <Text style={styles.searchButtonText}>SEARCH</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {renderHeader()}

      {/* — Compact Search Dropdown — */}
      {isSearchOpen && (
        <View style={styles.searchDropdown}>
          <View style={styles.dropdownInputRow}>
            <TextInput
              style={[
                styles.dropdownInput,
                Platform.OS === 'web' && styles.dropdownInputWeb,
              ]}
              placeholder="Search TOPS"
              placeholderTextColor="#888"
              value={searchText}
              onChangeText={setSearchText}
              autoFocus
              selectionColor="#000"
              underlineColorAndroid="transparent"
            />
            <Ionicons
              name="search"
              size={18}
              color="#888"
              style={styles.dropdownIcon}
            />
          </View>

          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => {
              setSearchText('');
              setIsSearchOpen(false);
            }}
          >
            <Text style={styles.closeButtonText}>CLOSE</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* — Item Grid — */}
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

  searchButton: {
    marginLeft: 12,
    paddingVertical: 6,
    paddingHorizontal: 8,
  },
  searchButtonText: {
    fontSize: 14,
    color: '#000',
  },

  // — Compact search dropdown, aligned under “SEARCH” —
  searchDropdown: {
    position: 'absolute',
    top: 48,       // just below header
    right: 16,     // align under the SEARCH text/button
    width: 260,    // fixed compact width (adjust as desired)
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#000',
    borderRadius: 4,
    padding: 8,
    zIndex: 10,
  },
  dropdownInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#888',
    borderRadius: 4,
    paddingHorizontal: 8,
    height: 36,    // slim input height
  },
  dropdownInput: {
    flex: 1,
    height: '100%',
    fontSize: 16,
    padding: 0,
    margin: 0,
    color: '#000',
  },
  dropdownInputWeb: {
    outlineWidth: 0,   // remove web focus ring
  },
  dropdownIcon: {
    marginLeft: 8,
  },
  closeButton: {
    marginTop: 8,
    alignSelf: 'flex-end',
  },
  closeButtonText: {
    fontSize: 14,
    color: '#000',
  },

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
