import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TextInput } from 'react-native';
import {RosterFighter} from '../../types';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { app } from '../../database/firebaseDb';
import { getFirestore } from "firebase/firestore";
import { collection, doc, getDocs, updateDoc } from 'firebase/firestore';

type MainScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Main'>;

interface WeighinItemProps {
  item: RosterFighter;
  handleWeightUpdate: (newWeight: number, id: number) => void;
}

const WeighinItem: React.FC<WeighinItemProps> = ({item, handleWeightUpdate}) => {
const [tempWeight, setTempWeight] = useState(item.weight ? item.weight.toString() : "");

  return (
    <View style={{ padding: 10, borderBottomWidth: 1 }}>
      <Text>{`Name: ${item.first_name} | Gym: ${item.gym}`}</Text>
      <TextInput
        value={tempWeight} // it's already a string, so should be fine
        placeholder="Update Weight"
        keyboardType="numeric"
        onChangeText={text => setTempWeight(text)}
        onEndEditing={(e) => {
          // convert back to number before sending
          const newWeight = parseFloat(parseFloat(e.nativeEvent.text).toFixed(2));
          handleWeightUpdate(newWeight, item.id);
        }}
      />
    </View>
  );
};


const WeighinScreen = () => {
  const [weighins, setWeighins] = useState<RosterFighter[]>([]);
  const navigation = useNavigation<MainScreenNavigationProp>();
  const db = getFirestore(app);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const rosterRef = collection(db, 'events', 'taVt1buUzGIT95axkgrh', 'roster');
    const dataArray: RosterFighter[] = [];

    try {
      const querySnapshot = await getDocs(rosterRef);
      querySnapshot.forEach((doc) => {
        dataArray.push(doc.data() as RosterFighter);
      });

      setWeighins(dataArray); // Updated this line to set weighins, not roster
    } catch (error) {
      console.error(`Error fetching data from Firestore:`, error);
    }
  };

  const handleWeightUpdate = async (newWeight: number, id: number) => {
    console.log("Update attempting");
    console.log("ID:", id);  // Log the ID that you are using
    console.log("New Weight:", newWeight);  // Log the new weight that you are trying to set
    
    try {
      const docRef = doc(db, 'events', 'taVt1buUzGIT95axkgrh', 'roster', id.toString());

      console.log("Document Reference:", docRef);  // Log the document reference
  
      const response = await updateDoc(docRef, { 'weight': newWeight });
      console.log("Document updated");
      console.log("Response:", response);  // Log the response from Firebase
    } catch (error) {
      console.log("Caught Error:", error);  // Log the caught error
      console.error("Error updating weight:", error);
    }
  };
  

  return (
    <View style={{ flex: 1, paddingTop: 20 }}>
      <FlatList
        data={weighins}
        keyExtractor={item => item.id.toString()}
        renderItem={({ item }) => <WeighinItem item={item} handleWeightUpdate={handleWeightUpdate} />}
      />
    </View>
  );
};

export default WeighinScreen;
