import React, { useState, useEffect } from 'react';
import { View, Text, Button, Alert, Image, ScrollView, TouchableOpacity, Modal, FlatList, ActivityIndicator } from 'react-native';
import axios from 'axios';
import { BACKEND_URL } from '../config';
import { useNavigation } from '@react-navigation/native';


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
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);
  const [items, setItems] = useState<ClothingItem[]>([]);
  const [categoryModal, setCategoryModal] = useState<null | 'top' | 'bottom' | 'shoe'>(null);
  const [loadingItems, setLoadingItems] = useState(true);
  const navigation = useNavigation() as any;

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

    const prompt = "faceless mockup with these pieces. Follow details, fit, color, logos, of each piece exactly. Stay accurate to the original image, just fit it onto a light colored mannequin with white background";

    try {
        setLoading(true);

        // Step 1: Send prompt + image URLs to backend
        const imageRes = await axios.post(`${BACKEND_URL}/api/outfits/generate-image`, {
          prompt,
          images: [top.imageUrl, bottom.imageUrl, shoe.imageUrl],
        });

        const imageUrl = imageRes.data.imageUrl;
        setGeneratedImageUrl(imageUrl);

        // Step 2: Save outfit to DB
        await axios.post(`${BACKEND_URL}/api/outfits`, {
          top: top._id,
          bottom: bottom._id,
          shoe: shoe._id,
          prompt,
          imageUrl,
        });

        Alert.alert('Outfit saved!');
    } catch (err) {
        console.error('Error creating outfit:', err);
        Alert.alert('Failed to create outfit');
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
    <ScrollView contentContainerStyle={{ padding: 16 }}>
      <Text style={{ fontWeight: 'bold', fontSize: 16, marginBottom: 12 }}>Select your outfit pieces</Text>

      <Button title="Select Top" onPress={() => setCategoryModal('top')} />
      <Button title="Select Bottom" onPress={() => setCategoryModal('bottom')} />
      <Button title="Select Shoe" onPress={() => setCategoryModal('shoe')} />


      {loading ? (
        <ActivityIndicator style={{ marginTop: 20 }} size="large" />
      ) : (
        <View style={{ marginTop: 20 }}>
          <Button title="Generate Outfit" onPress={handleGenerateOutfit} disabled={loading} />
        </View>
      )}

      {generatedImageUrl && (
        <View style={{ marginTop: 20 }}>
          <Text style={{ fontWeight: 'bold' }}>Generated Outfit:</Text>
          <Image source={{ uri: generatedImageUrl }} style={{ width: 300, height: 300, marginTop: 10 }} />
        </View>
      )}

      {renderClothingModal('top')}
      {renderClothingModal('bottom')}
      {renderClothingModal('shoe')}
    </ScrollView>
  );
};

export default CreateOutfit;