// src/screens/weighinsScreen
import React, { useState, useEffect, useCallback, memo } from 'react';
import { View, Text, FlatList, TextInput, Button, PermissionsAndroid, Platform, Linking } from 'react-native';
import { WeighinFighter } from '../../types';
import { useRoute } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/AppNavigator';
import { app } from '../../database/firebaseDb';
import { getFirestore } from "firebase/firestore";
import { collection, doc, getDoc, getDocs, updateDoc, query, where } from 'firebase/firestore';
import { RouteProp } from '@react-navigation/native';
import globalStyles from '../utils/globalStyles';

////////////////////////////////////////////////////////////////
console.log("Before importing react-native-permissions");
import { check, request, PERMISSIONS, RESULTS } from 'react-native-permissions';
console.log("After importing react-native-permissions");

import QRReader from './QRreader';

////////////////////////////////////////////////////////////////
const handleQRCodeScanned = (code: string) => {
  console.log('Scanned QR Code:', code);
  // Handle the scanned QR code as needed
};
////////////////////////////////////////////////////////////////

////////////////////////////////////////////////////////////////


const WeighinItem: React.FC<{
  item: WeighinFighter;
  handleWeightUpdate: (fighter: WeighinFighter) => void;
}> = ({ item, handleWeightUpdate }) => {
  const [localFighter, setLocalFighter] = useState<WeighinFighter>(item);
  const [isInputFocused, setInputFocused] = useState<boolean>(false);

  const handleEndEditing = (key: keyof WeighinFighter, value: string | number) => {
    const updatedFighter = { ...localFighter, [key]: value };
    setLocalFighter(updatedFighter);
  };

  const handleWeightSubmit = () => {
    handleWeightUpdate(localFighter);
    setInputFocused(false);  // Reset focus state
  };


  useEffect(() => {
    checkAndRequestCameraPermission();
  }, []);

  const checkAndRequestCameraPermission = async () => {
    try {
      let cameraPermission = await check(PERMISSIONS.IOS.CAMERA);
  
      if (cameraPermission === RESULTS.DENIED) {
        cameraPermission = await request(PERMISSIONS.IOS.CAMERA);
      }
  
      console.log('Camera Permission: ', cameraPermission);
  
      if (cameraPermission !== RESULTS.GRANTED) {
        console.error('Camera permission is not granted');
        // Handle the case when camera permission is not granted
      }
    } catch (error) {
      console.error('Error checking or requesting Camera permission: ', error);
    }
  };

  return (

    <View style={globalStyles.itemContainer}>

      <View style={globalStyles.nameContainer}>

        <Text style={globalStyles.nameText}>

          {localFighter.first} {localFighter.last}

        </Text>

      </View>

      <View style={globalStyles.detailsContainer}>

        <Text style={globalStyles.detailText}>{localFighter.gym} {localFighter.gender} {localFighter.weightclass}</Text>

     

      </View>

      <TextInput
        style={globalStyles.weightInput}
        value={localFighter.weight.toString()}
        placeholder="Update Weight"
        keyboardType="numeric"
        onChangeText={text => setLocalFighter(prev => ({ ...prev, weight: parseFloat(text) || 0 }))}
        onFocus={() => setInputFocused(true)}
        onEndEditing={() => setInputFocused(false)}
      />

      {/* Submit Button */}
      {isInputFocused && (
        <Button title="Save Weight" onPress={handleWeightSubmit} />
      )}
    </View>
  );

};

const WeighinScreen: React.FC = () => {
  const [weighins, setWeighins] = useState<WeighinFighter[]>([]);
  const db = getFirestore(app);
  const route = useRoute<RouteProp<RootStackParamList, 'Weighins'>>();
  const eventId = route.params.eventId;
  const [stats, setStats] = useState<{ total: number, withWeight: number, percentage: number }>({ total: 0, withWeight: 0, percentage: 0 });
  const [isScreenVisible, setIsScreenVisible] = useState(false);
  const [pmtIdCounter, setTotalPmtIds] = useState<number>(0);


  const computeStats = () => {
    const total = weighins.length;
    const withWeight = weighins.filter(fighter => fighter.weight > 0).length;
    const percentage = total === 0 ? 0 : Math.round((withWeight / total) * 100);

    setStats({ total, withWeight, percentage });
};

  console.log('WeighinScreen mounted.');
  console.log(`Fetching weighins for event ID: ${eventId}`);


  const fetchWeighins = async () => {
    console.log('Inside fetchWeighins. Event ID:', eventId);
    try {
        const weighinsRef = collection(db, 'events', eventId, 'weighins');
        const weighinsSnapshot = await getDocs(weighinsRef);
        const weighinFighters: WeighinFighter[] = [];

        weighinsSnapshot.forEach((doc) => {
            const weighinFighterData = doc.data() as WeighinFighter;
            weighinFighterData.id = doc.id;
            weighinFighters.push(weighinFighterData);

        });
        console.log('Fetched weighins:', weighinFighters);
        setWeighins(weighinFighters); 
        computeStats();
    } catch (error) {
        console.error("Error fetching weighin fighters:", error);
    }
};

useEffect(() => {
  console.log('WeighinScreen component mounted');
  fetchWeighins();
}, []);
  
//////////////////////////////////////// Weigh In Functions ////////////////
//////////////////////////////////////// Weigh In Functions ////////////////
//////////////////////////////////////// Weigh In Functions ////////////////
//////////////////////////////////////// Weigh In Functions ////////////////
const handleWeightUpdate = async (updatedFighter: WeighinFighter) => {
  console.log("Update attempting");
  console.log("ID:", updatedFighter.id);
  console.log("New Weight:", updatedFighter.weight);
  
  try {
      const docRef = doc(db, 'events', eventId, 'weighins', updatedFighter.id!);
      console.log("Document Reference:", docRef);
      await updateDoc(docRef, { ...updatedFighter });
      console.log("Document updated");
      
      // Refetch the weigh-ins data to get the latest state
      await fetchWeighins();
      computeStats();
  } catch (error) {
      console.error("Error updating fighter:", error);
  }
};


  console.log("pmt_id values from weighins:", weighins.map(weighin => weighin.pmt_id));

  useEffect(() => {
    fetchPmtIdsFromFighters();
  }, []);



  const fetchPmtIdsFromFighters = async () => {
    const fightersRef = collection(db, 'Fighters');
    const fightersSnapshot = await getDocs(fightersRef);
    const pmtIds = fightersSnapshot.docs.map(doc => doc.data().pmt_id);
  };
  
  const weightClasses = [
    { min: 50.1, max: 60 },
    { min: 60.1, max: 70 },
    { min: 70.1, max: 80 },
    { min: 80.1, max: 90 },
    { min: 90.1, max: 100 },
    { min: 100.1, max: 110 },
    { min: 110.1, max: 120 },
    { min: 120.1, max: 130 },
    { min: 130.1, max: 140 },
    { min: 140.1, max: 150 },
    { min: 150.1, max: 160 },
    { min: 160.1, max: 170 },
    { min: 170.1, max: 180 },
    { min: 180.1, max: 190 },
    { min: 190.1, max: 200 },
    { min: 200.1, max: 215 },
    { min: 115.1, max: 230 },
    { min: 230.1, max: 400 },
  ];

  const handleSubmitWeighins = () => {
    // Filter the weighins to only those with weight above 0
    const validWeighins = weighins.filter(fighter => fighter.weight > 0);
  
    // Categorize by gender, age, and weight class
    const categorizedFighters: { [key: string]: WeighinFighter[] } = {};
  
    validWeighins.forEach(fighter => {
      const gender = fighter.gender; // Assuming WeighinFighter type has a 'gender' property
      const ageGroup = fighter.age && fighter.age <= 18 ? "youth" : "adult"; // Assuming WeighinFighter type has an 'age' property
  
      const weightClass = weightClasses.find(
        wc => fighter.weight >= wc.min && fighter.weight <= wc.max
      );
  
      if (weightClass) {
        const category = `${gender}_${ageGroup}_${weightClass.min}-${weightClass.max}`;
  
        if (!categorizedFighters[category]) {
          categorizedFighters[category] = [];
        }

        categorizedFighters[category].push(fighter);
        categorizedFighters[category].sort((a, b) => b.win - a.win);
      }
    });
  
    console.log(categorizedFighters);
};
//////////////////////////////////////// Weigh In Functions ////////////////
//////////////////////////////////////// Weigh In Functions ////////////////
//////////////////////////////////////// Weigh In Functions ////////////////
//////////////////////////////////////// Weigh In Functions ////////////////




  // Render camera view
  



return (
  <View style={{ flex: 1 }}>
   <QRReader onQRCodeScanned={handleQRCodeScanned} />
    <View style={{ flex: 5 }}>
    </View>

  </View>
);
};


export default WeighinScreen;