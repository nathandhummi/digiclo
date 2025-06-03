// src/screens/clothes/Shoes.tsx
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

type NavProp = NativeStackNavigationProp<RootStackParamList, 'Shoes'>;

const { width } = Dimensions.get('window');
const ITEM_SIZE = (width - 32 - 16) / 3;

export default function Shoes() {
  const navigation = useNavigation<NavProp>();

  // Tabs and sorting (though sorting controls are removed in favor of SEARCH)
  const [viewMode, setViewMode] = useState<'all' | 'favorites'>('all');
  const [items, setItems] = useState<any[]>([]);

  // Search dropdown state
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);
  const [searchText, setSearchText] = useState<string>('');

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

  // Filter by “All” vs “Favorites”
  const filteredByMode =
    viewMode === 'favorites' ? items.filter(i => i.isFavorite) : items;

  // Then filter by search text
  const filteredBySearch = filteredByMode.filter(item => {
    if (!searchText.trim()) return true;
    return item.tags.some((t: string) =>
      t.toLowerCase().includes(searchText.toLowerCase())
    );
  });

  // HEADER with tabs + SEARCH button
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

      {/* Compact Search Dropdown */}
      {isSearchOpen && (
        <View style={styles.searchDropdown}>
          <View style={styles.dropdownInputRow}>
            <TextInput
              style={[
                styles.dropdownInput,
                Platform.OS === 'web' && styles.dropdownInputWeb,
              ]}
              placeholder="Search SHOES"
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

      {/* Grid of Shoes */}
      <FlatList
        data={filteredBySearch}
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

  // Compact search dropdown, aligned under “SEARCH”
  searchDropdown: {
    position: 'absolute',
    top: 48,       // just below header (≈48px)
    right: 16,     // aligned under the SEARCH text
    width: 260,    // narrow fixed width
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
    height: 36,
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
    outlineWidth: 0,   // remove blue outline on web
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
