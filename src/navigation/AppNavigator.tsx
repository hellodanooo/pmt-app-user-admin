// src/navigation/AppNavigator.tsx
import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import MainScreen from '../screens/MainScreen';
import WeighinsScreen from '../screens/WeighinsScreen';
import RosterScreen from '../screens/RosterScreenTwo';
import MatchesScreen from '../screens/MatchScreen';
import OfficialsScreen from '../screens/OfficialsScreen';
import UnMatched from '../screens/UnMatched';
import EventDetailsScreen from '../screens/EventDetailsPage';
import { Event } from '../../types';  // Ensure you have the 'Event' type imported
import { NavigationProp } from '@react-navigation/native';
import ResultsScreen from '../screens/ResultsScreen';
import RecordsScreen from '../screens/RecordsScreen';
import GymRecords from '../screens/GymRecords';


export type RootStackParamList = {
  Main: undefined;
  Weighins: {
    eventId: string;
  };
  Roster: {
      eventId: string;
  };
  Officials: { eventId: string;};
  Matches: { eventId: string;}

  UnMatched: undefined;
  EventDetails: {
      event: Event; // Adding this line
  };
  Results: {
    eventId: string;
};
Records: undefined;

GymRecords: undefined;

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
      <Stack.Screen name="Officials" component={OfficialsScreen} />
      <Stack.Screen name="Results" component={ResultsScreen} />
      <Stack.Screen name="Records" component={RecordsScreen} />
      <Stack.Screen name="GymRecords" component={GymRecords} />

    </Stack.Navigator>
  );
};

export default AppNavigator;
