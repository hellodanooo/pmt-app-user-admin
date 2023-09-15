// src/screens/MainScreen.tsx
import React from 'react';
import { View, Button } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/AppNavigator';

type MainScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Main'>;

const MainScreen = () => {
  const navigation = useNavigation<MainScreenNavigationProp>();

  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <Button
        title="Go to Weighins"
        onPress={() => navigation.navigate('Weighins')}
      />
      <Button
        title="Go to Roster"
        onPress={() => navigation.navigate('Roster')}
      />
      <Button
        title="Go to Matches"
        onPress={() => navigation.navigate('Matches')}
      />
      <Button
        title="Go to UnMatched"
        onPress={() => navigation.navigate('UnMatched')}
      />
      <Button
        title="Event Details"
        onPress={() => navigation.navigate('EventDetails')}
      />
      <Button
        title="Google Data"
        onPress={() => navigation.navigate('logDataScreen')}
      />
    </View>
  );
};

export default MainScreen;
