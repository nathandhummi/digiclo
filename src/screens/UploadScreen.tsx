import React, { useState } from 'react';
import { StyleSheet, View, Text, Image, TouchableOpacity, TextInput, ScrollView } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { MaterialCommunityIcons } from '@expo/vector-icons';
const CLOUDINARY_UPLOAD_PRESET = 'unsigned_upload';
const CLOUDINARY_CLOUD_NAME = 'dkduycn6h';

type ClothingType = 'shirt' | 'pants' | 'shoes' | 'other';

interface UploadedImage {
  uri: string;
  type: string;
  name: string;
}

export default function UploadScreen() {
  const [image, setImage] = useState<UploadedImage | null>(null);
  const [clothingType, setClothingType] = useState<ClothingType>('other');
  const [description, setDescription] = useState('');

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (status !== 'granted') {
      alert('Sorry, we need camera roll permissions to make this work!');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      const selectedAsset = result.assets[0];
      setImage({
        uri: selectedAsset.uri,
        type: 'image/jpeg',
        name: 'upload.jpg',
      });
    }
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    
    if (status !== 'granted') {
      alert('Sorry, we need camera permissions to make this work!');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      const selectedAsset = result.assets[0];
      setImage({
        uri: selectedAsset.uri,
        type: 'image/jpeg',
        name: 'upload.jpg',
      });
    }
  };

  const uploadImageToCloudinary = async (image: UploadedImage) => {
    const formData = new FormData();
    formData.append('file', {
      uri: image.uri,
      type: image.type,
      name: image.name,
    } as any); // "as any" to bypass TS warning

    formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);

    try {
      const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`, {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      return data.secure_url;
    } catch (err) {
      console.error('Upload error:', err);
      return null;
    }
  };


  const handleUpload = async () => {
    if (!image) return;

    const imageUrl = await uploadImageToCloudinary(image);

    if (!imageUrl) {
      alert('Image upload failed.');
      return;
    }

    const clothingData = {
      imageUrl,
      type: clothingType,
      description,
      // add userId or other fields here as needed
    };

    console.log('Uploaded item:', clothingData);
    alert('Upload successful!');
    // TODO: Send clothingData to your backend or store in MongoDB
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Add New Item</Text>
        
        {image ? (
          <View style={styles.imageContainer}>
            <Image source={{ uri: image.uri }} style={styles.image} />
            <TouchableOpacity 
              style={styles.removeButton}
              onPress={() => setImage(null)}
            >
              <MaterialCommunityIcons name="close" size={24} color="white" />
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.uploadButtons}>
            <TouchableOpacity style={styles.button} onPress={pickImage}>
              <MaterialCommunityIcons name="image" size={24} color="white" />
              <Text style={styles.buttonText}>Choose from Gallery</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.button} onPress={takePhoto}>
              <MaterialCommunityIcons name="camera" size={24} color="white" />
              <Text style={styles.buttonText}>Take Photo</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.form}>
          <Text style={styles.label}>Clothing Type</Text>
          <View style={styles.typeButtons}>
            {(['shirt', 'pants', 'shoes', 'other'] as ClothingType[]).map((type) => (
              <TouchableOpacity
                key={type}
                style={[
                  styles.typeButton,
                  clothingType === type && styles.typeButtonSelected,
                ]}
                onPress={() => setClothingType(type)}
              >
                <Text style={[
                  styles.typeButtonText,
                  clothingType === type && styles.typeButtonTextSelected,
                ]}>
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.label}>Description</Text>
          <TextInput
            style={styles.input}
            value={description}
            onChangeText={setDescription}
            placeholder="Add a description..."
            multiline
          />

          {image && (
            <TouchableOpacity 
              style={[styles.button, styles.uploadButton]}
              onPress={handleUpload}
            >
              <MaterialCommunityIcons name="upload" size={24} color="white" />
              <Text style={styles.buttonText}>Upload Item</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  uploadButtons: {
    gap: 10,
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#4A90E2',
    padding: 15,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  imageContainer: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: 10,
    overflow: 'hidden',
    marginBottom: 20,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  removeButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 20,
    padding: 5,
  },
  form: {
    gap: 15,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  typeButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 15,
  },
  typeButton: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#4A90E2',
  },
  typeButtonSelected: {
    backgroundColor: '#4A90E2',
  },
  typeButtonText: {
    color: '#4A90E2',
    fontSize: 14,
    fontWeight: '500',
  },
  typeButtonTextSelected: {
    color: 'white',
  },
  uploadButton: {
    marginTop: 10,
  },
}); 