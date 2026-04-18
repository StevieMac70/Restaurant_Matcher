import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { RootStackParamList } from '../types';

import WelcomeScreen from '../screens/WelcomeScreen';
import LobbyScreen from '../screens/LobbyScreen';
import SwipeScreen from '../screens/SwipeScreen';
import MatchScreen from '../screens/MatchScreen';
import MapViewScreen from '../screens/MapViewScreen';
import PrivacyPolicyScreen from '../screens/PrivacyPolicyScreen';

const Stack = createStackNavigator<RootStackParamList>();

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Welcome"
        screenOptions={{
          headerStyle: { backgroundColor: '#FF6B35' },
          headerTintColor: '#fff',
          headerTitleStyle: { fontWeight: 'bold' },
          headerBackTitleVisible: false,
          cardStyle: { backgroundColor: '#F7F7F7' },
        }}
      >
        <Stack.Screen
          name="Welcome"
          component={WelcomeScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Lobby"
          component={LobbyScreen}
          options={{ title: 'Session Lobby' }}
        />
        <Stack.Screen
          name="Swipe"
          component={SwipeScreen}
          options={{ title: 'Find a Restaurant', headerLeft: () => null, gestureEnabled: false }}
        />
        <Stack.Screen
          name="Match"
          component={MatchScreen}
          options={{ title: "It's a Match!", headerLeft: () => null }}
        />
        <Stack.Screen
          name="MapView"
          component={MapViewScreen}
          options={{ title: 'Restaurant Location' }}
        />
        <Stack.Screen
          name="PrivacyPolicy"
          component={PrivacyPolicyScreen}
          options={{ title: 'Privacy Policy' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
