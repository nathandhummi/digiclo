import 'react-native-url-polyfill/auto';
import React, {useState} from 'react';
import { registerRootComponent } from 'expo';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import HomeScreen from './screens/HomeScreen';
import UploadScreen from './screens/UploadScreen';
import ProfileScreen from './screens/ProfileScreen';
import OutfitsScreen from './screens/OutfitsScreen';
import LoginScreen from './screens/LoginScreen';
import SignupScreen from './screens/SignupScreen';
import TabBar from './screens/TabBar';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function MainApp() {
  return (
    <Tab.Navigator
      tabBar={(props) => <TabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Upload" component={UploadScreen} />
      <Tab.Screen name="Outfits" component={OutfitsScreen} />
    </Tab.Navigator>
  );
}

const App = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(true); //set state true temporarily to bypass login

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!isLoggedIn ? (
          <>
            <Stack.Screen 
              name="Login" 
              component={LoginScreen}
              initialParams={{ setIsLoggedIn }}
            />
            <Stack.Screen 
              name="Signup" 
              component={SignupScreen}
              initialParams={{ setIsLoggedIn }}
            />
          </>
        ) : (
          <Stack.Screen name="MainApp" component={MainApp} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

registerRootComponent(App);