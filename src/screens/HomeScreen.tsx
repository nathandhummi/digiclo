// src/screens/HomeScreen.tsx
import React, { useState, useEffect, useCallback } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../types';
import AsyncStorage from '@react-native-async-storage/async-storage';

type NavProp = NativeStackNavigationProp<RootStackParamList>;

// only the list screens that take no params
type ClothesRoute = 'Outfits' | 'Tops' | 'Bottoms' | 'Shoes';

export default function HomeScreen() {
  const [clothingItems, setClothingItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const navigation = useNavigation<NavProp>();

  const fetchClothing = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) throw new Error('Not authenticated');

      const res = await fetch('http://localhost:4000/api/clothes', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setClothingItems(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClothing();
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchClothing();
    }, [])
  );

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  const sectionStyle = {
    height: (Dimensions.get('window').height - 80) / 3,
    paddingHorizontal: 16,
    paddingTop: 8,
  };

  const renderSection = (
    label: string,
    items: any[],
    routeName: ClothesRoute
  ) => (
    <View style={[styles.section, sectionStyle]}>
      <View style={styles.headerRow}>
        <Text style={styles.sectionLabel}>{label}</Text>
        <TouchableOpacity onPress={() => navigation.navigate(routeName)}>
          <Ionicons name="arrow-forward" size={18} color="gray" />
        </TouchableOpacity>
      </View>

      {items.length === 0 ? (
        <Text style={styles.emptyText}>No {label.toLowerCase()} yet</Text>
      ) : (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.itemsRow}
        >
          {items.map(item => (
            <TouchableOpacity
              key={item._id}
              style={styles.itemContainer}
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
                style={styles.itemImage}
                resizeMode="cover"
              />
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}
    </View>
  );

  const outfits = clothingItems.filter(i => i.type === 'outfit');
  const tops = clothingItems.filter(i => i.category === 'top');
  const bottoms = clothingItems.filter(i => i.category === 'bottom');
  const shoes = clothingItems.filter(i => i.category === 'shoe');

  return (
    <ScrollView style={styles.container}>
      <View style={styles.topBar}>
        <Image
          source={require('../../croplogo.png')}
          style={styles.logo}
          resizeMode="contain"
        />
        <TouchableOpacity onPress={() => navigation.navigate('Profile')}>
          <Ionicons name="person-circle-outline" size={32} color="black" />
        </TouchableOpacity>
      </View>

      {renderSection('Tops', tops, 'Tops')}
      <View style={styles.divider} />

      {renderSection('Bottoms', bottoms, 'Bottoms')}
      <View style={styles.divider} />

      {renderSection('Shoes', shoes, 'Shoes')}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  loader: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  section: { width: '100%' },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionLabel: { fontSize: 16, fontWeight: '600' },
  emptyText: {
    marginLeft: 16,
    color: 'gray',
    fontSize: 14,
    fontStyle: 'italic',
  },
  itemsRow: { paddingVertical: 8 },
  itemContainer: {
    marginRight: 12,
    width: 120,
    height: 150,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#f5f5f5',
  },
  itemImage: { width: '100%', height: '100%' },
  divider: {
    height: 1,
    backgroundColor: '#ddd',
    marginVertical: 12,
    marginHorizontal: 16,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingTop: 10,
    paddingBottom: 6,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  logo: {
    width: 180,
    height: 40,
    margin: 0,
    padding: 0,
  },
});
