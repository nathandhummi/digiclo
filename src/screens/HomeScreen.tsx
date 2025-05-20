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
    backgroundColor: '#fff',
  },
  splitContainer: {
    flex: 1,
    flexDirection: 'row',
  },
  leftHalf: {
    flex: 1,
    backgroundColor: '#f0f0f0',
  },
  rightHalf: {
    flex: 1,
    backgroundColor: '#f8f8f8',
    justifyContent: 'center',
    alignItems: 'center',
  },
  divider: {
    width: 1,
    backgroundColor: '#000',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    padding: 16,
    textAlign: 'center',
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 5,
  },
  clothingImage: {
    width: 100,
    height: 100,
    margin: 8,
    borderRadius: 8,
  },
}); 