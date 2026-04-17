import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { RootStackParamList } from '../types';

import WelcomeScreen from '../screens/WelcomeScreen';
import LobbyScreen from '../screens/LobbyScreen';
import SwipeScreen from '../screens/SwipeScreen';
import MatchScreen from '../screens/MatchScreen';
import MapViewScreen from '../screens/MapViewScreen';

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
        }}
      >
        <Stack.Screen
          name="Welcome"
          component={WelcomeScreen}
          options={{ title: 'Restaurant Matcher', headerShown: false }}
        />
        <Stack.Screen
          name="Lobby"
          component={LobbyScreen}
          options={{ title: 'Session Lobby' }}
        />
        <Stack.Screen
          name="Swipe"
          component={SwipeScreen}
          options={{ title: 'Find a Restaurant', headerLeft: () => null }}
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
      </Stack.Navigator>
    </NavigationContainer>
  );
}
