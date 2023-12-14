// src/screens/AllResults.tsx
import React, { useState, useEffect } from 'react';
import { View, FlatList, Text } from 'react-native';
import { app } from '../../database/firebaseDb';
import { getFirestore, collection, getDocs } from "firebase/firestore";
import globalStyles from '../utils/globalStyles';

interface Fighter {
  id: string;
  name: string;
  // add more fields here based on your Fighter schema
}

const RecordsScreen = () => {
  const [fighters, setFighters] = useState<Fighter[]>([]);

  useEffect(() => {
    const fetchFighters = async () => {
      const db = getFirestore(app);
      const fightersRef = collection(db, 'Fighters');
      try {
        const querySnapshot = await getDocs(fightersRef);
        const fightersArray: Fighter[] = querySnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Fighter));
        setFighters(fightersArray);
      } catch (error) {
        console.error("Error fetching fighters:", error);
      }
    };

    fetchFighters();
  }, []);

  return (
    <View style={globalStyles.container}>
      <FlatList
        data={fighters}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={globalStyles.button}>
            <Text style={globalStyles.buttonText}>{item.name}</Text>
          </View>
        )}
      />
    </View>
  );
};

export default RecordsScreen;
