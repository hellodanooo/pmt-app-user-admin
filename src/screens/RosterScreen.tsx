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
  /* const [responseMessage, setResponseMessage] = useState<string | null>(null);
  
  const makeWeighins = () => {
    console.log("makeWeighins Button Pushed"); // Logs when the button is clicked
  
    fetch('https://pmt-admin-server-c0554bfe6b60.herokuapp.com/roster/makeWeighins', {
      method: 'POST',
    })
    .then(response => response.text()) // Directly reading text from the response
    .then(text => {
      // Log the raw response text
      setResponseMessage(text); // text should be "Weigh-in data created successfully"
      console.log("Raw response:", text); // Here, text should be "Weigh-in data created successfully"
    // Make the message disappear after 3 seconds
    setTimeout(() => {
      setResponseMessage(null);
    }, 3000);
    })
    .catch((error) => {
      console.error('Error:', error); // Logs if an error occurs
      setResponseMessage(`Error: ${error.message}`);

 // Make the error message disappear after 3 seconds as well
 setTimeout(() => {
  setResponseMessage(null);
}, 3000);

    });
  };
  
  const goToWeighinsScreen = () => {
    navigation.navigate('Weighins'); // Navigate to WeighinsScreen
  }; */



  return (
    <View>
  <Button title="Make Weighins" onPress={makeWeighins}/>      
  <FlatList
        data={roster}
        keyExtractor={item => item.id}
        renderItem={({ item }: { item: RosterFighter }) => (
          <View style={{ padding: 10, borderBottomWidth: 1 }}>
            <Text>{`Name: ${item['FIRST']}, Gym: ${item['GYM']}`}</Text>
          </View>
        )}
      />
    </View>
  );
};


export default RosterScreen;
