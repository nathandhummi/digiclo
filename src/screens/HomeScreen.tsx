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
  ViewStyle
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';
import AsyncStorage from '@react-native-async-storage/async-storage';

type ClothesRoute = 'Outfits' | 'Tops' | 'Bottoms' | 'Shoes';

export default function HomeScreen() {
  const [clothingItems, setClothingItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const screenHeight = Dimensions.get('window').height;
  const usableHeight = screenHeight - 80; // approx height of tab bar
  const sectionStyle: ViewStyle = {
    height: usableHeight / 3,
    paddingHorizontal: 16,
    paddingTop: 8,
    justifyContent: 'flex-start',
  };

  const fetchClothing = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) throw new Error('Token not found');

      const res = await fetch('http://localhost:4000/api/clothes', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      const data = await res.json();
      setClothingItems(data);
    } catch (err) {
      console.error('Failed to fetch:', err);
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

  const handleItemPress = (itemId: string) => {
    console.log('Selected:', itemId);
  };

  const renderSection = (
    label: string,
    items: any[],
    routeName: ClothesRoute
  ) => (
    <View style={[styles.section, sectionStyle]}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionLabel}>{label}</Text>
        <TouchableOpacity onPress={() => navigation.navigate(routeName)}>
          <Ionicons name="arrow-forward" size={18} color="gray" />
        </TouchableOpacity>
      </View>
      {items.length === 0 ? (
        <Text style={styles.emptyText}>No {label.toLowerCase()} yet</Text>
      ) : (
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {items.map((item) => (
            <TouchableOpacity
              key={item._id}
              onPress={() => handleItemPress(item._id)}
              style={styles.itemContainer}
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

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  const outfits = clothingItems.filter((i) => i.type === 'outfit');
  const tops    = clothingItems.filter((i) => i.category === 'top');
  const bottoms = clothingItems.filter((i) => i.category === 'bottom');
  const shoes   = clothingItems.filter((i) => i.category === 'shoe');

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      {renderSection('Outfits', outfits, 'Outfits')}
      <View style={styles.divider} />

      {renderSection('Tops', tops, 'Tops')}
      <View style={styles.divider} />

      {renderSection('Bottoms', bottoms, 'Bottoms')}
      <View style={styles.divider} />

      {renderSection('Shoes', shoes, 'Shoes')}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  contentContainer: {
    paddingVertical: 16,
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  section: {
    width: '100%',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: 16,
    marginBottom: 8,
  },
  sectionLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
  divider: {
    height: 1,
    backgroundColor: '#ddd',
    marginHorizontal: 16,
    marginVertical: 12,
  },
  itemContainer: {
    marginHorizontal: 8,
    width: 120,
    height: 150,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#f5f5f5',
  },
  emptyText: {
    marginLeft: 16,
    color: 'gray',
    fontSize: 14,
    fontStyle: 'italic',
  },
  itemImage: {
    width: '100%',
    height: '100%',
    borderRadius: 12,
  },
});
