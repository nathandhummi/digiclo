import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, ScrollView, Image, TouchableOpacity, ActivityIndicator } from 'react-native';

export default function HomeScreen() {
  const [clothingItems, setClothingItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

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

  const filteredItems = clothingItems.filter(item => {
    if (mode === 'outfits') return item.label === 'Full Outfit';
    if (selectedCategory === 'accessories') return item.type === null;
    return item.type === selectedCategory;
  });

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Wardrobe</Text>
      {loading ? (
        <View>
          <ActivityIndicator size="large" />
          <Text>{JSON.stringify(clothingItems, null, 2)}</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.gridContainer}>
          {clothingItems.map((item) => (
            <TouchableOpacity key={item._id} onPress={() => handleItemPress(item._id)}>
              <Image
                source={{ uri: item.imageUrl }}
                style={styles.clothingImage}
                resizeMode="cover"
              />
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#ffffff',
  },
  sidebar: {
    width: '32%',
    backgroundColor: '#ffffff',
    borderRightColor: '#e0e0e0',
    borderRightWidth: 0.5,
    justifyContent: 'space-between',
  },
  toggleSection: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomColor: '#e0e0e0',
    borderBottomWidth: 0.5,
  },
  toggleButton: {
    paddingHorizontal: 12,
  },
  icon: {
    fontSize: 28,
    color: '#bbb',
    marginVertical: 0,
    marginHorizontal: 4,
  },
  activeIcon: {
    color: '#111',
  },
  clothingList: {
    flex: 1,
    paddingHorizontal: 12,
  },
  categoryBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 14,
    borderTopColor: '#e0e0e0',
    borderTopWidth: 0.5,
  },
  categoryIcon: {
    fontSize: 24,
    color: '#ccc',
  },
  activeCategoryIcon: {
    color: '#000',
  },
  avatarArea: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  clothingImage: {
    width: 100,
    height: 100,
    margin: 8,
    borderRadius: 8,
  },
}); 