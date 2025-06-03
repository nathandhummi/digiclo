import React, { useState, useEffect } from 'react';
import { View, Text, Button, Alert, Image, ScrollView, TouchableOpacity, Modal, FlatList, ActivityIndicator, StyleSheet } from 'react-native';
import axios from 'axios';
import { BACKEND_URL } from '../config';
import { Trash2 } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';


type ClothingItem = {
  _id: string;
  label: string;
  category: string; // <- allow all string inputs
  imageUrl: string;
};

const CreateOutfit: React.FC = () => {
  const [top, setTop] = useState<ClothingItem | null>(null);
  const [bottom, setBottom] = useState<ClothingItem | null>(null);
  const [shoe, setShoe] = useState<ClothingItem | null>(null);
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<ClothingItem[]>([]);
  const [categoryModal, setCategoryModal] = useState<null | 'top' | 'bottom' | 'shoe'>(null);
  const [loadingItems, setLoadingItems] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<'top' | 'bottom' | 'shoe'>('top');

  useEffect(() => {
    const fetchClothingItems = async () => {
      try {
        const token = await AsyncStorage.getItem('token'); // assuming you're using AsyncStorage to store the auth token
        const res = await axios.get(`http://localhost:4000/api/clothes`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        console.log("Clothing response:", res.data);
        setItems(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        console.error('Failed to fetch clothing items:', err);
        Alert.alert('Error loading clothing items');
      } finally {
        setLoadingItems(false);
      }
    };

    fetchClothingItems();
  }, []);


  const handleGenerateOutfit = async () => {
    console.log("🟢 handleGenerateOutfit called");

    if (!top || !bottom || !shoe) {
      Alert.alert('Please select a top, bottom, and shoe.');
      return;
    }

    try {
      setLoading(true);

      const token = await AsyncStorage.getItem('token'); // ✅ get the token
      if (!token) {
        Alert.alert('User not authenticated');
        return;
      }

      console.log("Saving outfit with:", {
        top: top._id,
        bottom: bottom._id,
        shoe: shoe._id,
      });

      const response = await axios.post(
        `http://localhost:4000/api/outfits`,
        {
          top: top._id,
          bottom: bottom._id,
          shoe: shoe._id,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`, // ✅ send the token
          },
        }
      );

      Alert.alert('Outfit saved!');
      console.log('Saved outfit:', response.data);

      // Clear selections
      setTop(null);
      setBottom(null);
      setShoe(null);
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        console.error('Axios error saving outfit:', err.response?.data || err.message);
      } else {
        console.error('Unexpected error saving outfit:', err);
      }
      Alert.alert('Failed to save outfit');
    }    finally {
      setLoading(false);
    }
  };


  if (loadingItems) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
        <Text>Loading clothing items...</Text>
      </View>
    );
  }


  return (
    <View style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={{ paddingBottom: 140 }}>
        <View style={styles.container}>
          <Text style={styles.title}>DIGITAL STYLER</Text>

          <View style={styles.canvasHeader}>
            <Text style={styles.canvasLabel}>CANVAS</Text>
            <TouchableOpacity style={styles.generateBtn} onPress={handleGenerateOutfit}>
              <Text style={styles.generateText}>SAVE OUTFIT</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.canvasPreview}>
            {top && <Image source={{ uri: top.imageUrl }} style={styles.canvasItem} />}
            {bottom && <Image source={{ uri: bottom.imageUrl }} style={styles.canvasItem} />}
            {shoe && <Image source={{ uri: shoe.imageUrl }} style={styles.canvasItem} />}
            {(top || bottom || shoe) && (
              <View style={{ paddingTop: 10 }}>
                <TouchableOpacity onPress={() => {
                  setTop(null);
                  setBottom(null);
                  setShoe(null);
                }}>
                <Trash2 size={32} color="#444" />
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </ScrollView>

      {/* Sticky Bottom Clothes Filter & Scroll Row */}
      <View style={styles.stickyScrollContainer}>
        <View style={{ flexDirection: 'row', justifyContent: 'center', marginBottom: 6 }}>
          <View style={styles.categoryButtonsContainer}>
            {['top', 'bottom', 'shoe'].map((type) => (
              <TouchableOpacity
                key={type}
                style={[
                  styles.categoryButton,
                  selectedCategory === type && styles.activeCategoryButton,
                ]}
                onPress={() => setSelectedCategory(type as 'top' | 'bottom' | 'shoe')}
              >
                <Text
                  style={[
                    styles.categoryButtonText,
                    selectedCategory === type && styles.activeCategoryButtonText,
                  ]}
                >
                  {type.toUpperCase()}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {items
            .filter(item => item.category === selectedCategory)
            .map(item => (
              <TouchableOpacity
                key={item._id}
                onPress={() => {
                  if (selectedCategory === 'top') setTop(item);
                  if (selectedCategory === 'bottom') setBottom(item);
                  if (selectedCategory === 'shoe') setShoe(item);
                }}
              >
                <Image source={{ uri: item.imageUrl }} style={styles.clothingThumb} />
              </TouchableOpacity>
            ))}
        </ScrollView>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    paddingBottom: 120, // ✅ prevent content from hiding behind sticky section
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 12,
  },
  canvasHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  canvasLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
  generateBtn: {
    backgroundColor: '#000',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
  },
  generateText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  canvasPreview: {
    alignItems: 'center',
    justifyContent: 'flex-start', // ✅ start from top
    height: 600, // 🔼 increase this from 450 to something bigger
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#eee',
    paddingTop: 20, // ✅ adds space from the top
    paddingBottom: 40, // ✅ allows space for the trash icon
  },
  canvasItem: {
    width: 150,
    height: 150,
    resizeMode: 'contain',
    marginVertical: 6, // ✅ consistent spacing between top/bottom/shoe
  },
  trash: {
    fontSize: 24,
    marginTop: 10,
  },
  clothesSection: {
    marginTop: 20,
  },
  clothesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  clothesTitle: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  clothingThumb: {
    width: 100,
    height: 100,
    marginHorizontal: 8,
    resizeMode: 'contain',
  },
  stickyScrollContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingVertical: 10,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderColor: '#ddd',
  },
  categoryButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 6,
  },
  categoryButton: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ccc',
    backgroundColor: '#f9f9f9',
  },
  activeCategoryButton: {
    backgroundColor: '#000',
    borderColor: '#000',
  },
  categoryButtonText: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  activeCategoryButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default CreateOutfit;