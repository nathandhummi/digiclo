import React, { useState } from 'react';
import { StyleSheet, View, ScrollView, TouchableOpacity } from 'react-native';
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
  { icon: 'archive', label: 'Pants', type: 'pants' as const },
];

const categoryIcons = {
  shirt: 'tshirt-crew',
  pants: 'archive',
  shoes: 'shoe-formal',
  accessories: 'hat-fedora',
};

const categories = ['shirt', 'pants', 'shoes', 'accessories'] as const;

export default function HomeScreen() {
  const [mode, setMode] = useState<'pieces' | 'outfits'>('pieces');
  const [selectedCategory, setSelectedCategory] = useState<typeof categories[number]>('shirt');
  const [selectedClothing, setSelectedClothing] = useState<{
    shirt?: string;
    pants?: string;
    shoes?: string;
  }>({});

  const handleItemPress = (label: string, type: 'shirt' | 'pants' | 'shoes' | null) => {
    if (type) {
      setSelectedClothing(prev => ({
        ...prev,
        [type]: prev[type] === label ? undefined : label,
      }));
    }
  };

  const filteredItems = clothingItems.filter(item => {
    if (mode === 'outfits') return item.label === 'Full Outfit';
    if (selectedCategory === 'accessories') return item.type === null;
    return item.type === selectedCategory;
  });

  return (
    <View style={styles.container}>
      <View style={styles.sidebar}>
        {/* Top Toggle */}
        <View style={styles.toggleSection}>
          <TouchableOpacity onPress={() => setMode('pieces')} style={styles.toggleButton}>
            <MaterialCommunityIcons
              name="tshirt-crew"
              style={[styles.icon, mode === 'pieces' && styles.activeIcon]}
            />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setMode('outfits')} style={styles.toggleButton}>
            <MaterialCommunityIcons
              name="hanger"
              style={[styles.icon, mode === 'outfits' && styles.activeIcon]}
            />
          </TouchableOpacity>
        </View>

        {/* Clothing Items */}
        <ScrollView style={styles.clothingList}>
          {filteredItems.map((item, index) => (
            <ClothingItem
              key={index}
              icon={item.icon as any}
              label={item.label}
              onPress={() => handleItemPress(item.label, item.type)}
              isSelected={item.type ? selectedClothing[item.type] === item.label : false}
            />
          ))}
        </ScrollView>

        {/* Bottom Category Bar (only in "pieces" mode) */}
        {mode === 'pieces' && (
          <View style={styles.categoryBar}>
            {categories.map(cat => (
              <TouchableOpacity key={cat} onPress={() => setSelectedCategory(cat)}>
                <MaterialCommunityIcons
                  name={categoryIcons[cat]}
                  style={[
                    styles.categoryIcon,
                    selectedCategory === cat && styles.activeCategoryIcon,
                  ]}
                />
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>

      {/* Avatar View */}
      <View style={styles.avatarArea}>
        <View style={styles.avatarContainer}>
          <AvatarBase />
          {selectedClothing.shirt && <ClothingLayer type="shirt" color="#4A90E2" />}
          {selectedClothing.pants && <ClothingLayer type="pants" color="#2ECC71" />}
          {selectedClothing.shoes && <ClothingLayer type="shoes" color="#E74C3C" />}
        </View>
      </View>
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
  avatarContainer: {
    width: '100%',
    maxWidth: 350,
    aspectRatio: 1,
    position: 'relative',
    flexShrink: 1,
  },
});
