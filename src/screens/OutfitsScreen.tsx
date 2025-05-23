import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function OutfitsScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Outfits screen is coming soon.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    fontSize: 18,
    color: 'gray',
  },
});
