import React, { useState } from 'react';
import { StyleSheet, View, Text, ScrollView } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import AvatarBase from '../components/LayeredAvatar/AvatarBase';
import ClothingLayer from '../components/LayeredAvatar/ClothingLayer';
import ClothingItem from '../components/ClothingItem';

const clothingItems = [
  { icon: 'tshirt-crew', label: 'T-Shirt', type: 'shirt' as const },
  { icon: 'tshirt-v', label: 'V-Neck', type: 'shirt' as const },
  { icon: 'shoe-formal', label: 'Formal Shoes', type: 'shoes' as const },
  { icon: 'shoe-sneaker', label: 'Sneakers', type: 'shoes' as const },
  { icon: 'hat-fedora', label: 'Hat', type: null },
  { icon: 'sunglasses', label: 'Sunglasses', type: null },
  { icon: 'tie', label: 'Tie', type: null },
  { icon: 'hanger', label: 'Full Outfit', type: null },
  { icon: 'shoe-heel', label: 'Heels', type: 'shoes' as const },
  { icon: 'pants', label: 'Pants', type: 'pants' as const },
];

export default function HomeScreen() {
  const [selectedClothing, setSelectedClothing] = useState<{
    shirt?: string;
    pants?: string;
    shoes?: string;
  }>({});

  const handleItemPress = (label: string, type: 'shirt' | 'pants' | 'shoes' | null) => {
    if (type) {
      setSelectedClothing(prev => ({
        ...prev,
        [type]: prev[type] === label ? undefined : label
      }));
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.splitContainer}>
        <View style={styles.leftHalf}>
          <Text style={styles.title}>Wardrobe</Text>
          <ScrollView contentContainerStyle={styles.gridContainer}>
            {clothingItems.map((item, index) => (
              <ClothingItem
                key={index}
                icon={item.icon as any}
                label={item.label}
                onPress={() => handleItemPress(item.label, item.type)}
                isSelected={item.type ? selectedClothing[item.type] === item.label : false}
              />
            ))}
          </ScrollView>
        </View>
        <View style={styles.divider} />
        <View style={styles.rightHalf}>
          <View style={styles.avatarContainer}>
            <AvatarBase />
            {selectedClothing.shirt && (
              <ClothingLayer type="shirt" color="#4A90E2" />
            )}
            {selectedClothing.pants && (
              <ClothingLayer type="pants" color="#2ECC71" />
            )}
            {selectedClothing.shoes && (
              <ClothingLayer type="shoes" color="#E74C3C" />
            )}
          </View>
        </View>
      </View>
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
  avatarContainer: {
    width: '80%',
    aspectRatio: 1,
    position: 'relative',
  },
}); 