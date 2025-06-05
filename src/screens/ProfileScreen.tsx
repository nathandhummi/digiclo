import { StyleSheet, View, Text, TouchableOpacity, Image, Alert, Platform } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { RootStackParamList } from '../App';
import { useState, useEffect } from 'react';
import { BACKEND_URL } from '../config';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import axios from 'axios';

type ProfileScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Profile'>;

interface User {
  id: string;
  email: string;
  username: string;
  photoUrl?: string;
}

export default function ProfileScreen() {
  const navigation = useNavigation<ProfileScreenNavigationProp>();
  const route = useRoute();
  const [user, setUser] = useState<User | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const userData = await AsyncStorage.getItem('user');
        if (userData) {
          const parsedUser = JSON.parse(userData);
          console.log('🔍 Loaded user data:', parsedUser);
          console.log('🖼️ photoUrl:', parsedUser.photoUrl);
          const fullUrl = parsedUser.photoUrl?.startsWith('http')
            ? parsedUser.photoUrl
            : `${BACKEND_URL}${parsedUser.photoUrl}`;
          console.log('🌐 Final image URL:', fullUrl);
          setUser(parsedUser);
        }
      } catch (error) {
        console.error('❌ Error loading user data:', error);
      }
    };

    loadUser();
  }, []);

  const pickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'We need permission to access your camera roll!');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.5,
      });

      if (!result.canceled) {
        await updateProfilePhoto(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image.');
    }
  };

  const updateProfilePhoto = async (uri: string) => {
    try {
      setIsUpdating(true);
      const token = await AsyncStorage.getItem('token');
      if (!token) throw new Error('Missing auth token');

      const filename = uri.split('/').pop() || 'photo.jpg';
      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `image/${match[1]}` : 'image/jpeg';

      let photoFile;
      if (Platform.OS === 'web') {
        const response = await fetch(uri);
        const blob = await response.blob();
        photoFile = new File([blob], filename, { type });
      } else {
        photoFile = {
          uri: Platform.OS === 'ios' ? uri.replace('file://', '') : uri,
          type,
          name: filename,
        };
      }

      const formData = new FormData();
      formData.append('photo', photoFile as any);

      const response = await axios.put(`${BACKEND_URL}/api/auth/update-photo`, formData, {
        headers: {
          Accept: 'application/json',
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`,
        },
      });

      if (user) {
        const updatedUser: User = {
          ...user,
          photoUrl: response.data.photoUrl,
        };
        await AsyncStorage.setItem('user', JSON.stringify(updatedUser));
        setUser(updatedUser);
      }

      Alert.alert('Success', 'Profile photo updated!');
    } catch (error) {
      console.error('Upload error:', error);
      Alert.alert('Error', 'Could not update photo.');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleLogout = async () => {
    await AsyncStorage.removeItem('token');
    await AsyncStorage.removeItem('user');
    const { setIsLoggedIn } = route.params as { setIsLoggedIn: (value: boolean) => void };
    setIsLoggedIn(false);
    navigation.reset({
      index: 0,
      routes: [{ name: 'Login', params: { setIsLoggedIn } }],
    });
  };

  const imageUri = user?.photoUrl
    ? user.photoUrl.startsWith('http')
      ? `${user.photoUrl}?t=${Date.now()}`
      : `${BACKEND_URL}${user.photoUrl}?t=${Date.now()}`
    : null;

  return (
    <View style={styles.container}>
      <View style={styles.profileSection}>
        <TouchableOpacity onPress={pickImage} disabled={isUpdating}>
          {imageUri ? (
            <View style={styles.photoContainer}>
              <Image
                source={{ uri: imageUri }}
                style={styles.profilePhoto}
                onError={(error) => {
                  console.error('❌ Image load error:', error.nativeEvent);
                  console.log('URL that failed:', imageUri);
                }}
                onLoad={() => console.log('✅ Image loaded successfully')}
              />
              <View style={styles.editOverlay}>
                <Ionicons name="camera" size={24} color="white" />
              </View>
            </View>
          ) : (
            <View style={styles.defaultProfilePhoto}>
              <Ionicons name="person" size={60} color="#666" />
              <View style={styles.editOverlay}>
                <Ionicons name="camera" size={24} color="white" />
              </View>
            </View>
          )}
        </TouchableOpacity>
        <Text style={styles.username}>{user?.username || 'User'}</Text>
        <Text style={styles.email}>{user?.email || ''}</Text>
      </View>

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutButtonText}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 20 },
  profileSection: { alignItems: 'center', marginTop: 40, marginBottom: 40 },
  photoContainer: { position: 'relative', marginBottom: 16 },
  profilePhoto: { width: 120, height: 120, borderRadius: 60 },
  defaultProfilePhoto: {
    width: 120, height: 120, borderRadius: 60,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center', alignItems: 'center',
    marginBottom: 16, position: 'relative',
  },
  editOverlay: {
    position: 'absolute', bottom: 0, right: 0,
    backgroundColor: '#172251',
    width: 36, height: 36, borderRadius: 18,
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 2, borderColor: '#fff',
  },
  username: { fontSize: 24, fontWeight: '600', color: '#172251', marginBottom: 8 },
  email: { fontSize: 16, color: '#666', marginBottom: 8 },
  logoutButton: {
    backgroundColor: '#ff4444',
    paddingHorizontal: 20, paddingVertical: 10,
    borderRadius: 8, alignSelf: 'center',
    marginTop: 'auto', marginBottom: 20,
  },
  logoutButtonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});
