import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

type ClothingItemProps = {
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  label: string;
  onPress: () => void;
  isSelected?: boolean;
};

export default function ClothingItem({ icon, label, onPress, isSelected }: ClothingItemProps) {
  return (
    <TouchableOpacity 
      style={[styles.container, isSelected && styles.selected]} 
      onPress={onPress}
    >
      <MaterialCommunityIcons 
        name={icon} 
        size={32} 
        color={isSelected ? "#fff" : "#333"} 
      />
      <Text style={[styles.label, isSelected && styles.selectedLabel]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '45%',
    aspectRatio: 1,
    backgroundColor: 'white',
    borderRadius: 12,
    margin: '2.5%',
    padding: 10,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  selected: {
    backgroundColor: '#4A90E2',
  },
  label: {
    marginTop: 8,
    fontSize: 14,
    color: '#333',
    textAlign: 'center',
  },
  selectedLabel: {
    color: '#fff',
  },
}); 