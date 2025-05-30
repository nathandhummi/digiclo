import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, ActivityIndicator } from 'react-native';
import axios from 'axios';
import { BACKEND_URL } from '../config';
import AsyncStorage from '@react-native-async-storage/async-storage';

type ClothingItem = {
  _id: string;
  label: string;
  imageUrl: string;
};

type Outfit = {
  _id: string;
  top: ClothingItem;
  bottom: ClothingItem;
  shoe: ClothingItem;
};

export default function OutfitsScreen() {
  const [outfits, setOutfits] = useState<Outfit[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOutfits = async () => {
      try {
        const token = await AsyncStorage.getItem('token'); // 👈 Get the saved token

        const res = await fetch(`http://localhost:4000/api/outfits`, {
          headers: {
            Authorization: `Bearer ${token}`, // 👈 Send it in the header
          },
        });

        const data = await res.json();
        console.log("Fetched outfits:", data);

        if (Array.isArray(data)) {
          setOutfits(data);
        } else {
          console.warn("Unexpected response format:", data);
          setOutfits([]);
        }
      } catch (err) {
        console.error("Failed to fetch outfits:", err);
        setOutfits([]);
      } finally {
        setLoading(false);
      }
    };

    fetchOutfits();
  }, []);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
        <Text>Loading outfits...</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Saved Outfits</Text>
      <View style={styles.grid}>
        {outfits
          .filter(o => o.top && o.bottom && o.shoe)
          .map((outfit) => (
            <View key={outfit._id} style={styles.outfitBlock}>
              <Image source={{ uri: outfit.top.imageUrl }} style={styles.outfitImage} />
              <Image source={{ uri: outfit.bottom.imageUrl }} style={styles.outfitImage} />
              <Image source={{ uri: outfit.shoe.imageUrl }} style={styles.outfitImage} />
            </View>
          ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    paddingBottom: 60,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
  },
  outfitCard: {
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    padding: 12,
    backgroundColor: '#fff',
  },
  label: {
    fontWeight: '600',
    marginBottom: 4,
  },
  image: {
    width: 100,
    height: 100,
    resizeMode: 'contain',
    marginBottom: 12,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 16, // or use margin
    padding: 12,
  },
  outfitBlock: {
    width: 160,
    alignItems: 'center',
    margin: 8,
    padding: 8,
    backgroundColor: '#fff',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2, // for Android
  },
  outfitImage: {
    width: 140,
    height: 140,
    resizeMode: 'contain',
    marginVertical: 4,
  },
});