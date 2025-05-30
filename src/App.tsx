import 'react-native-url-polyfill/auto';
import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { registerRootComponent } from 'expo';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import HomeScreen         from './screens/HomeScreen';
import UploadScreen       from './screens/UploadScreen';
import OutfitsScreen      from './screens/OutfitsScreen';
import CreateOutfitScreen from './screens/createOutfit';
import Tops               from './screens/clothes/Tops';
import Bottoms            from './screens/clothes/Bottoms';
import Shoes              from './screens/clothes/Shoes';

import LoginScreen  from './screens/LoginScreen';
import SignupScreen from './screens/SignupScreen';
import TabBar       from './screens/TabBar';

export type RootStackParamList = {
  Login:        { setIsLoggedIn: (b: boolean) => void };
  Signup:       { setIsLoggedIn: (b: boolean) => void };
  Home:         undefined;
  Upload:       undefined;
  Outfits:      undefined;
  CreateOutfit: undefined;
  Tops:         undefined;
  Bottoms:      undefined;
  Shoes:        undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

// HOC to wrap any screen with your TabBar
function withTabBar<T extends {}>(Screen: React.ComponentType<T>) {
  return (props: T) => (
    <View style={styles.flex}>
      <Screen {...props} />
      <TabBar />
    </View>
  );
}

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(true);

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
          <>
            <Stack.Screen name="Home"         component={withTabBar(HomeScreen)} />
            <Stack.Screen name="Upload"       component={withTabBar(UploadScreen)} />
            <Stack.Screen name="Outfits"      component={withTabBar(OutfitsScreen)} />
            <Stack.Screen name="CreateOutfit" component={withTabBar(CreateOutfitScreen)} />
            <Stack.Screen name="Tops"         component={withTabBar(Tops)} />
            <Stack.Screen name="Bottoms"      component={withTabBar(Bottoms)} />
            <Stack.Screen name="Shoes"        component={withTabBar(Shoes)} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
});

registerRootComponent(App);
