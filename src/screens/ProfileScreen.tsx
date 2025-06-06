import { StyleSheet, View, Text, TouchableOpacity, Image, Alert, Platform, TextInput, Pressable, Modal, ScrollView } from 'react-native';
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
  bio?: string;
}

export default function ProfileScreen() {
  const navigation = useNavigation<ProfileScreenNavigationProp>();
  const route = useRoute();
  const [user, setUser] = useState<User | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isEditingUsername, setIsEditingUsername] = useState(false);
  const [isEditingBio, setIsEditingBio] = useState(false);
  const [newUsername, setNewUsername] = useState('');
  const [newBio, setNewBio] = useState('');
  const [isHovering, setIsHovering] = useState(false);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const userData = await AsyncStorage.getItem('user');
        if (userData) {
          const parsedUser = JSON.parse(userData);
          console.log('🔍 Loaded user data:', parsedUser);
          console.log('🖼️ photoUrl:', parsedUser.photoUrl);
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

  const handleUsernameEdit = async () => {
    if (!newUsername.trim()) {
      Alert.alert('Error', 'Username cannot be empty');
      return;
    }

    try {
      setIsUpdating(true);
      const token = await AsyncStorage.getItem('token');
      if (!token) throw new Error('Missing auth token');

      const response = await axios.put(
        `${BACKEND_URL}/api/auth/update-username`,
        { username: newUsername },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (user) {
        const updatedUser: User = {
          ...user,
          username: newUsername,
        };
        await AsyncStorage.setItem('user', JSON.stringify(updatedUser));
        setUser(updatedUser);
      }

      setIsEditingUsername(false);
      Alert.alert('Success', 'Username updated successfully!');
    } catch (error) {
      console.error('Error updating username:', error);
      Alert.alert('Error', 'Failed to update username');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleBioEdit = async () => {
    try {
      setIsUpdating(true);
      const token = await AsyncStorage.getItem('token');
      if (!token) throw new Error('Missing auth token');

      const response = await axios.put(
        `${BACKEND_URL}/api/auth/update-bio`,
        { bio: newBio },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (user) {
        const updatedUser: User = {
          ...user,
          bio: newBio,
        };
        await AsyncStorage.setItem('user', JSON.stringify(updatedUser));
        setUser(updatedUser);
      }

      setIsEditingBio(false);
      Alert.alert('Success', 'Bio updated successfully!');
    } catch (error) {
      console.error('Error updating bio:', error);
      Alert.alert('Error', 'Failed to update bio');
    } finally {
      setIsUpdating(false);
    }
  };

  const imageUri = user?.photoUrl
    ? `${user.photoUrl}?t=${Date.now()}`
    : null;

  return (
    <View style={styles.container}>
      <TouchableOpacity 
        style={styles.backButton}
        onPress={() => navigation.navigate('Home')}
      >
        <Ionicons name="arrow-back" size={24} color="#172251" />
      </TouchableOpacity>

      <ScrollView style={styles.scrollView}>
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
          <TouchableOpacity 
            style={styles.usernameContainer}
            onPress={() => {
              setIsEditingUsername(true);
              setNewUsername(user?.username || '');
            }}
          >
            <Text style={styles.username}>{user?.username || 'User'}</Text>
            <Ionicons name="pencil" size={16} color="#666" style={styles.editIcon} />
          </TouchableOpacity>
          <Text style={styles.email}>{user?.email || ''}</Text>

          <TouchableOpacity 
            style={styles.bioContainer}
            onPress={() => {
              setIsEditingBio(true);
              setNewBio(user?.bio || '');
            }}
          >
            <Text style={styles.bioText}>
              {user?.bio || 'Add a bio...'}
            </Text>
            <Ionicons name="pencil" size={14} color="#666" style={styles.editIcon} />
          </TouchableOpacity>

          <Text style={styles.comingSoon}>Coming Soon</Text>
        </View>
      </ScrollView>

      <View style={styles.logoutButtonContainer}>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutButtonText}>Logout</Text>
        </TouchableOpacity>
      </View>

      <Modal
        visible={isEditingUsername}
        transparent
        animationType="fade"
        onRequestClose={() => setIsEditingUsername(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Edit Username</Text>
            <TextInput
              style={styles.usernameInput}
              value={newUsername}
              onChangeText={setNewUsername}
              placeholder="Enter new username"
              autoFocus
              maxLength={30}
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => {
                  setIsEditingUsername(false);
                  setNewUsername('');
                }}
              >
                <Text style={styles.modalButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton]}
                onPress={handleUsernameEdit}
                disabled={isUpdating}
              >
                <Text style={styles.modalButtonText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal
        visible={isEditingBio}
        transparent
        animationType="fade"
        onRequestClose={() => setIsEditingBio(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Edit Bio</Text>
            <TextInput
              style={styles.bioInput}
              value={newBio}
              onChangeText={setNewBio}
              placeholder="Tell us about yourself..."
              autoFocus
              multiline
              maxLength={500}
              numberOfLines={4}
            />
            <Text style={styles.charCount}>{newBio.length}/500</Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => {
                  setIsEditingBio(false);
                  setNewBio('');
                }}
              >
                <Text style={styles.modalButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton]}
                onPress={handleBioEdit}
                disabled={isUpdating}
              >
                <Text style={styles.modalButtonText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollView: {
    flex: 1,
    padding: 20,
  },
  profileSection: {
    alignItems: 'center',
    marginTop: 40,
    marginBottom: 40,
  },
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
  usernameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  username: {
    fontSize: 24,
    fontWeight: '600',
    color: '#172251',
    marginRight: 8,
  },
  editIcon: {
    marginLeft: 2,
  },
  email: { fontSize: 16, color: '#666', marginBottom: 8 },
  logoutButtonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    backgroundColor: '#fff',
    // borderTopWidth: ,
    borderTopColor: '#eee',
    alignItems: 'center',
  },
  logoutButton: {
    backgroundColor: '#ff4444',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
    width: 100,
  },
  logoutButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    width: '80%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#172251',
    marginBottom: 16,
    textAlign: 'center',
  },
  usernameInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 16,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#f0f0f0',
  },
  saveButton: {
    backgroundColor: '#172251',
  },
  modalButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  bioContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 16,
    paddingHorizontal: 20,
    width: '10%',
    alignSelf: 'center',
  },
  bioText: {
    fontSize: 16,
    color: '#666',
    flex: 1,
    textAlign: 'center',
    fontStyle: 'italic',
    // marginRight: 4,
  },
  bioInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 8,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  charCount: {
    fontSize: 12,
    color: '#666',
    textAlign: 'right',
    marginBottom: 16,
  },
  comingSoon: {
    fontSize: 14,
    color: '#999',
    fontStyle: 'italic',
    marginTop: 150,
    marginBottom: 20,
  },
  backButton: {
    position: 'absolute',
    top: 20,
    left: 20,
    zIndex: 1,
    padding: 8,
  },
});
