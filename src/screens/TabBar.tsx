// src/screens/TabBar.tsx
import React, { useState } from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../types';
import UploadModal from '../components/UploadModal';

type NavProp = NativeStackNavigationProp<RootStackParamList>;

export default function TabBar() {
  const navigation = useNavigation<NavProp>();
  const route = useRoute();
  const [modalVisible, setModalVisible] = useState(false);

  const tabs: { name: keyof Pick<RootStackParamList, 'Home'|'Upload'|'Outfits'>; icons: [string,string] }[] = [
    { name: 'Home',   icons: ['home-outline','home'] },
    { name: 'Upload', icons: ['add-circle-outline','add-circle'] },
    { name: 'Outfits',icons: ['shirt-outline','shirt'] },
  ];

  return (
    <>
      <View style={styles.container}>
        {tabs.map(({ name, icons }) => {
          const focused = route.name === name;
          const icon = focused ? icons[1] : icons[0];
          return (
            <TouchableOpacity
              key={name}
              style={styles.tab}
              onPress={() => {
                if (name === 'Upload') {
                  setModalVisible(true);
                } else {
                  navigation.navigate(name);
                }
              }}
            >
              <Ionicons name={icon as any} size={24} color={focused ? '#000' : 'gray'} />
              {name !== 'Upload' && (
                <Text style={[styles.label, focused && styles.focused]}>
                  {name.toUpperCase()}
                </Text>
              )}
            </TouchableOpacity>
          );
        })}
      </View>

      <UploadModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onUploadClothes={() => {
          setModalVisible(false);
          navigation.navigate('Upload');
        }}
        onCreateOutfit={() => {
          setModalVisible(false);
          navigation.navigate('CreateOutfit');
        }}
      />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    height: 80,
    borderTopWidth: 0.5,
    borderColor: '#ccc',
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  tab: { alignItems: 'center' },
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
