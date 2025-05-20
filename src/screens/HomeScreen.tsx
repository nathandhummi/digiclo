import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, ScrollView, Image, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Dimensions } from 'react-native';
import { ViewStyle } from 'react-native';


export default function HomeScreen() {
  const [clothingItems, setClothingItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

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
      const res = await fetch('https://localhost:4000/api/clothes');
      const data = await res.json();
      setClothingItems(data);
    } catch (err) {
      console.error('Failed to fetch clothing items', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchClothing = async () => {
      try {
        const res = await fetch('http://localhost:4000/api/clothes');
        const data = await res.json();
        console.log('Fetched:', data);
        setClothingItems(data);
      } catch (err) {
        console.error('Failed to fetch:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchClothing();
  }, []);

  const handleItemPress = (itemId: string) => {
    console.log('Selected:', itemId);
  };

  const renderSection = (label: string, items: any[]) => (
    <View style={[styles.section, sectionStyle]}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionLabel}>{label}:</Text>
        <Ionicons name="arrow-forward" size={18} color="gray" />
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

  const outfits = clothingItems.filter(item => item.type === 'outfit');
  const tops = clothingItems.filter(item => item.type === 'top');
  const bottoms = clothingItems.filter(item => item.type === 'bottom');

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
    {renderSection('OUTFITS', outfits)}
    <View style={styles.divider} />

    {renderSection('TOPS', tops)}
    <View style={styles.divider} />

    {renderSection('BOTTOMS', bottoms)}
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