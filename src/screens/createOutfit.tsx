import React, { useState } from 'react';
import { View, Text, Button, Alert, Image, ScrollView } from 'react-native';
import axios from 'axios';
import { BACKEND_URL } from '../config';


type ClothingItem = {
  _id: string;
  label: string;
  category: 'top' | 'bottom' | 'shoe';
  imageUrl: string;
};

const CreateOutfit: React.FC = () => {
  const [top, setTop] = useState<ClothingItem | null>(null);
  const [bottom, setBottom] = useState<ClothingItem | null>(null);
  const [shoe, setShoe] = useState<ClothingItem | null>(null);
  const [loading, setLoading] = useState(false);
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);


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


  return (
    <ScrollView contentContainerStyle={{ padding: 16 }}>
      <Text>Select a top, bottom, and shoe:</Text>

      {/* These are placeholders — swap with real item selectors */}
      <Button
        title="Select Top"
        onPress={() =>
            setTop({
            _id: '664c123456abcde0001', // MongoDB ObjectId from your real clothing item
            label: 'White Hoodie',
            category: 'top',
            imageUrl: 'https://res.cloudinary.com/your-cloud/image/upload/v123456/white-hoodie.png',
            })
        }
      />
      <Button
        title="Select Bottom"
        onPress={() =>
            setBottom({
            _id: '664c123456abcde0001', // MongoDB ObjectId from your real clothing item
            label: 'White Hoodie',
            category: 'bottom',
            imageUrl: 'https://res.cloudinary.com/your-cloud/image/upload/v123456/white-hoodie.png',
            })
        }
      />
      <Button
        title="Select Shoe"
        onPress={() =>
            setShoe({
            _id: '664c123456abcde0001', // MongoDB ObjectId from your real clothing item
            label: 'White Hoodie',
            category: 'shoe',
            imageUrl: 'https://res.cloudinary.com/your-cloud/image/upload/v123456/white-hoodie.png',
            })
        }
      />

      <View style={{ marginTop: 20 }}>
        <Button title="Generate Outfit" onPress={handleGenerateOutfit} disabled={loading} />
      </View>

      {generatedImageUrl && (
        <View style={{ marginTop: 20 }}>
          <Text style={{ fontWeight: 'bold' }}>Generated Outfit:</Text>
          <Image source={{ uri: generatedImageUrl }} style={{ width: 300, height: 300, marginTop: 10 }} />
        </View>
      )}
    </ScrollView>
  );
};

export default CreateOutfit;