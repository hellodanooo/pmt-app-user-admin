// src/screens/RosterScreen.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, Button, FlatList } from 'react-native';
import { RosterFighter } from '../../types';
import { useNavigation } from '@react-navigation/native'; // Import useNavigation
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/AppNavigator';

import { app } from '../../database/firebaseDb';


import { getFirestore } from "firebase/firestore";

import { collection, doc, getDoc, getDocs } from 'firebase/firestore'; // Import Firestore functions



type MainScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Main'>;

const RosterScreen = () => {
  const [roster, setRoster] = useState<RosterFighter[]>([]);
  const navigation = useNavigation<MainScreenNavigationProp>();
  const db = getFirestore(app);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const rosterRef = collection(db, 'events', 'taVt1buUzGIT95axkgrh', 'roster');
    const dataArray: RosterFighter[] = []; // Explicitly set the type here

    try {
      const querySnapshot = await getDocs(rosterRef);
      querySnapshot.forEach((doc) => {
        dataArray.push(doc.data() as RosterFighter); // Cast to RosterFighter if needed
      });
  
      console.log("Data received:", dataArray);
      setRoster(dataArray);
    } catch (error) {
      console.error(`Error fetching data from Firestore:`, error);
      // TODO: Display an error to users
    }
  };



  // MAKE WEIGH IN BUTTON
   const [responseMessage, setResponseMessage] = useState<string | null>(null);
  

  
  const goToWeighinsScreen = () => {
    navigation.navigate('Weighins'); // Navigate to WeighinsScreen
  };



  return (
    <View>
  <FlatList
        data={roster}
        keyExtractor={item => item.id}
        renderItem={({ item }: { item: RosterFighter }) => (
          <View style={{ padding: 10, borderBottomWidth: 1 }}>
            <Text>{`${item['first_name']} ${item['gym']} ${item['weight']}`}</Text>
          </View>
        )}
      />
    </View>
  );
};


export default RosterScreen;
