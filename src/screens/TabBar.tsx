import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import UploadModal from '../components/UploadModal';

export default function TabBar({ state, navigation }: BottomTabBarProps) {
  const [modalVisible, setModalVisible] = useState(false);

  const handleUploadPress = () => {
    setModalVisible(true);
  };

  const handleUploadClothes = () => {
    setModalVisible(false);
    navigation.navigate('Upload');
  };

  const handleCreateOutfit = () => {
    setModalVisible(false);
    navigation.navigate('Profile'); // or a dedicated "Create Outfit" screen if needed
  };

  return (
    <>
      <View style={styles.container}>
        {state.routes.map((route, index) => {
          const isFocused = state.index === index;
          const label = route.name;

          const onPress = () => {
            if (label === 'Upload') {
              handleUploadPress();
              return;
            }

            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          let iconName: keyof typeof Ionicons.glyphMap;
          switch (label) {
            case 'Home':
              iconName = isFocused ? 'home' : 'home-outline';
              break;
            case 'Upload':
              iconName = 'add-circle'; // Use solid icon always
              break;
            case 'Profile':
              iconName = isFocused ? 'person' : 'person-outline';
              break;
            default:
              iconName = 'ellipse';
          }

          const isCenter = label === 'Upload';

          return (
            <TouchableOpacity
              key={route.key}
              onPress={onPress}
              style={[styles.tab, isCenter && styles.centerTab]}
            >
              <Ionicons
                name={iconName}
                size={isCenter ? 48 : 24}
                color={isCenter ? '#000' : isFocused ? '#000' : 'gray'}
              />
              {!isCenter && (
                <Text style={[styles.label, isFocused && styles.focused]}>
                  {label.toUpperCase()}
                </Text>
              )}
            </TouchableOpacity>
          );
        })}
      </View>

      <UploadModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onUploadClothes={handleUploadClothes}
        onCreateOutfit={handleCreateOutfit}
      />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    height: 80,
    backgroundColor: '#fff',
    borderTopWidth: 0.5,
    borderColor: '#ccc',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
  },
  centerTab: {
    marginTop: -20,
  },
  label: {
    fontSize: 12,
    color: 'gray',
    marginTop: 4,
  },
  focused: {
    color: '#000',
    fontWeight: '600',
  },
});
