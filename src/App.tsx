// App.tsx
import 'react-native-url-polyfill/auto';

import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { registerRootComponent } from 'expo';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import HomeScreen from './screens/HomeScreen';
import UploadScreen from './screens/UploadScreen';
import ProfileScreen from './screens/ProfileScreen';
import LoginScreen from './screens/LoginScreen';
import SignupScreen from './screens/SignupScreen';
import CreateOutfitScreen from './screens/createOutfit';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import OutfitsScreen      from './screens/OutfitsScreen';
import Tops               from './screens/clothes/Tops';
import Bottoms            from './screens/clothes/Bottoms';
import Shoes              from './screens/clothes/Shoes';
import TabBar       from './screens/TabBar';

export type RootStackParamList = {
  Login:        { setIsLoggedIn: (b: boolean) => void };
  Signup:       { setIsLoggedIn: (b: boolean) => void };
  Home:         undefined;
  Upload:       undefined;
  Profile:      undefined;
  Outfits:      undefined;
  CreateOutfit: undefined;
  Tops:         undefined;
  Bottoms:      undefined;
  Shoes:        undefined;
};

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator<RootStackParamList>();

function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap;

          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Upload') {
            iconName = focused ? 'cloud-upload' : 'cloud-upload-outline';
          } else {
            iconName = focused ? 'person' : 'person-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#000',
        tabBarInactiveTintColor: 'gray',
        headerShown: false,
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Upload" component={UploadScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

// HOC to wrap any screen with your TabBar
function withTabBar<T extends {}>(Screen: React.ComponentType<T>) {
  return (props: T) => (
    <View style={styles.flex}>
      <Screen {...props} />
      <TabNavigator />
    </View>
  );
}

function Navigation() {
  const { user, loading } = useAuth();

  if (loading) return null;

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {!user ? (
        <>
          <Stack.Screen name="Login" component={LoginScreen} initialParams={{}} />
          <Stack.Screen name="Signup" component={SignupScreen} initialParams={{}} />
        </>
      ) : (
        <>
          <Stack.Screen name="Home"         component={withTabBar(HomeScreen)} />
          <Stack.Screen name="Upload"       component={withTabBar(UploadScreen)} />
          <Stack.Screen name="Profile"      component={withTabBar(ProfileScreen)} />
          <Stack.Screen name="Outfits"      component={withTabBar(OutfitsScreen)} />
          <Stack.Screen name="CreateOutfit" component={CreateOutfitScreen} />
          <Stack.Screen name="Tops"         component={withTabBar(Tops)} />
          <Stack.Screen name="Bottoms"      component={withTabBar(Bottoms)} />
          <Stack.Screen name="Shoes"        component={withTabBar(Shoes)} />
        </>
      )}
    </Stack.Navigator>
  );
}

function App() {
  return (
    <AuthProvider>
      <NavigationContainer>
        <Navigation />
      </NavigationContainer>
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
});

export default registerRootComponent(App);

