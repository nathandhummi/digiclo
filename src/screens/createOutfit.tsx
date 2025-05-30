import React, { useState, useEffect } from 'react';
import { View, Text, Button, Alert, Image, ScrollView, TouchableOpacity, Modal, FlatList, ActivityIndicator, StyleSheet } from 'react-native';
import axios from 'axios';
import { BACKEND_URL } from '../config';
import { useNavigation } from '@react-navigation/native';
import { Trash2 } from 'lucide-react-native';


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
        const res = await axios.get(`http://localhost:4000/api/clothes`);
        console.log("Clothing response:", res.data);
        setItems(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        console.error('Failed to fetch clothing items:', err);
        Alert.alert('Error loading clothing items');
      } finally {
        setLoadingItems(false); // <-- make sure this runs no matter what
      }
    };

    fetchClothingItems();
  }, []);


  const handleGenerateOutfit = async () => {
    if (!top || !bottom || !shoe) {
      Alert.alert('Please select a top, bottom, and shoe.');
      return;
    }

    try {
      setLoading(true);

      // Step 1: Save outfit (no prompt/imageUrl needed)
      await axios.post(`${BACKEND_URL}/api/outfits`, {
        top: top._id,
        bottom: bottom._id,
        shoe: shoe._id,
      });

      Alert.alert('Outfit saved!');
    } catch (err) {
      console.error('Error saving outfit:', err);
      Alert.alert('Failed to save outfit');
    } finally {
      setLoading(false);
    }
  };

  const renderClothingModal = (category: 'top' | 'bottom' | 'shoe') => {
    const filteredItems = items.filter(item =>
      typeof item.category === 'string' &&
      item.category.toLowerCase().trim() === category
    );
    console.log("Modal opened for:", category);
    console.log(items);
    console.log("Filtered items:", filteredItems);
    
    return (
      <Modal visible={categoryModal === category} animationType="slide">
        <View style={{ flex: 1, padding: 16 }}>
          <Text style={{ fontWeight: 'bold', fontSize: 18, marginBottom: 10 }}>
            Select a {category}
          </Text>

          <FlatList
            data={items.filter(item => item.category === category)}
            keyExtractor={(item) => item._id}
            renderItem={({ item }) => (
              <TouchableOpacity
                onPress={() => {
                  if (category === 'top') setTop(item);
                  if (category === 'bottom') setBottom(item);
                  if (category === 'shoe') setShoe(item);
                  setCategoryModal(null);
                }}
                style={{ marginBottom: 12, borderBottomWidth: 1, paddingBottom: 8 }}
              >
                <Image source={{ uri: item.imageUrl }} style={{ width: 100, height: 100 }} />
                <Text>{item.label}</Text>
              </TouchableOpacity>
            )}
          />

          <Button title="Close" onPress={() => setCategoryModal(null)} />
        </View>
      </Modal>
    )
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
              <TouchableOpacity onPress={() => {
                setTop(null);
                setBottom(null);
                setShoe(null);
              }}>
                <Trash2 size={32} color="#444" />
              </TouchableOpacity>
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
    marginVertical: 8,
  },
  canvasItem: {
    width: 150,
    height: 150,
    resizeMode: 'contain',
    marginVertical: 2,
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