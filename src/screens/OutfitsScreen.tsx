import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, ActivityIndicator, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
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

  const handleDeleteOutfit = async (id: string) => {
    const confirm = window.confirm('Delete this outfit?');
    if (!confirm) return;

    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) throw new Error('Not authenticated');

      const res = await fetch(`${BACKEND_URL}/api/outfits/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        let msg = 'Failed to delete outfit';
        try {
          const body = await res.json();
          msg = body.error || msg;
        } catch (e) {}
        throw new Error(msg);
      }

      // Remove outfit from UI
      setOutfits((prev) => prev.filter((o) => o._id !== id));
    } catch (err: any) {
      window.alert(err.message || 'Could not delete outfit');
    }
  };

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
              {/* Trash Icon */}
              <TouchableOpacity
                style={styles.deleteBtn}
                onPress={() => handleDeleteOutfit(outfit._id)}
              >
                <Ionicons name="trash-outline" size={24} color="#666" />
              </TouchableOpacity>

              {/* Images */}
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
    position: 'relative',
  },
  outfitImage: {
    width: 140,
    height: 140,
    resizeMode: 'contain',
    marginVertical: 4,
  },
  deleteBtn: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 20,
    padding: 4,
    zIndex: 10,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 2,
    elevation: 2,
  },
});