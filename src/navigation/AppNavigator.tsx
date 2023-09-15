// src/navigation/AppNavigator.tsx
import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import MainScreen from '../screens/MainScreen';
import WeighinsScreen from '../screens/WeighinsScreen';
import RosterScreen from '../screens/RosterScreen';
import MatchesScreen from '../screens/MatchScreen';
import UnMatched from '../screens/UnMatched';
import EventDetailsScreen from '../screens/EventDetailsScreen';



export type RootStackParamList = {
    Main: undefined;
    Weighins: undefined;
    Roster: undefined;
    Matches: undefined;
    UnMatched: undefined;
    EventDetails: undefined;

  };

const Stack = createStackNavigator<RootStackParamList>();

const AppNavigator = () => {
  return (
    <Stack.Navigator initialRouteName="Main">
      <Stack.Screen name="Main" component={MainScreen} />
      <Stack.Screen name="Weighins" component={WeighinsScreen} />
      <Stack.Screen name="Roster" component={RosterScreen} />
      <Stack.Screen name="Matches" component={MatchesScreen} />
      <Stack.Screen name="UnMatched" component={UnMatched} />
      <Stack.Screen name="EventDetails" component={EventDetailsScreen} />

    </Stack.Navigator>
  );
};

export default AppNavigator;