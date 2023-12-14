// client/src/screens/Matches.tsx
import React, { useEffect, useState, useRef } from 'react';
import { View, Text, ScrollView, Button, Modal, TouchableWithoutFeedback } from 'react-native';
import { RouteProp, useRoute, useNavigation } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/AppNavigator';
import { app } from '../../database/firebaseDb';
import { getFirestore, collection, query, where, onSnapshot, getDocs, getDoc, addDoc, writeBatch, doc } from 'firebase/firestore';
import { ResultBout, ResultsFighter, RosterFighter, WeighinFighter } from '../../types';
import moment from 'moment';
import globalStyles from '../utils/globalStyles';


type MatchScreenRouteProp = RouteProp<RootStackParamList, 'Matches'>;


const MatchesScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute<MatchScreenRouteProp>();
  const { eventId } = route.params;
  const db = getFirestore(app);
  const [weighins, setWeighins] = useState<WeighinFighter[]>([]);

  console.log("Matches Component Loaded");

  useEffect(() => {
    console.log(`Fetching Matches for eventId: ${eventId}`);

    const matchesCollection = collection(db, 'events', eventId, 'prematches');
    const q = query(matchesCollection);

    const unsubscribe = onSnapshot(q, async (querySnapshot) => {
      console.log(`Received query snapshot of size ${querySnapshot.size}`);

      if (querySnapshot.empty) {
        console.log("No matches found. Checking if collection exists...");

      } else {
        const fetchedMatches: ResultBout[] = [];
        querySnapshot.forEach((doc) => {
          console.log(`Document data: `, doc.data());
          const data = doc.data() as ResultBout;
          fetchedMatches.push(data);
        });
        setMatches(fetchedMatches);
      }
    });

    return () => {
      unsubscribe();
    };
  }, [eventId]);


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
    } catch (error) {
      console.error("Error fetching weighin fighters:", error);
    }
  };

  const [unmatchedFighters, setUnmatchedFighters] = useState<ResultsFighter[]>([]);

  useEffect(() => {
    const fetchUnmatchedFighters = async () => {
      try {
        const unmatchedCollection = collection(db, 'events', eventId, 'unmatched');
        const querySnapshot = await getDocs(unmatchedCollection);
        const fetchedUnmatchedFighters = querySnapshot.docs.map(doc => doc.data() as ResultsFighter);
        setUnmatchedFighters(fetchedUnmatchedFighters);
      } catch (error) {
        console.error('Error fetching unmatched fighters:', error);
      }
    };

    fetchUnmatchedFighters();
  }, []);

 
  const [logs, setLogs] = useState<string[]>([]);
  const appendLog = (message: string) => {
    setLogs((prevLogs) => [...prevLogs, message]);
  };
  const [matches, setMatches] = useState<ResultBout[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (logs.length > 0) {
      setIsLoading(true);
    }
  }, [logs]);


const [modalVisible, setModalVisible] = useState(false);
const [sameCategoryFighters, setSameCategoryFighters] = useState<WeighinFighter[]>([]);
const [filteredMatches, setFilteredMatches] = useState<any[]>([]);


const goToSameCategoryFighters = (fighter: ResultsFighter) => {
  const ageCategory = fighter.age < 18 ? 'youth' : 'adult';
  console.log('Age Category: ',ageCategory);
  const category = `${fighter.gender}-${fighter.weightclass}-${ageCategory}`;



  const filteredFighters = weighins.filter(w => 
    `${w.gender}-${w.weightclass}-${(w.age < 18 ? 'youth' : 'adult')}` === category
  );


  const relatedMatches = matches.filter(match => 
    `${match.fighter1?.gender}-${match.fighter1?.weightclass}-${(match.fighter1?.age < 18 ? 'youth' : 'adult')}` === category ||
    `${match.fighter2?.gender}-${match.fighter2?.weightclass}-${(match.fighter2?.age < 18 ? 'youth' : 'adult')}` === category
  );
  
  console.log('Category:', category);
  console.log('Filtered Fighters:', filteredFighters);
  console.log('Related Matches:', relatedMatches);


  setSameCategoryFighters(filteredFighters);
  setFilteredMatches(relatedMatches);
  setModalVisible(true);
};


const [unmatchedFightersY, setUnmatchedFightersY] = useState(0);

  const scrollViewRef = useRef<ScrollView>(null);

  const scrollToUnmatchedFighters = () => {
    scrollViewRef.current?.scrollTo({ y: unmatchedFightersY, animated: true });
  };


  
  const preMatches = async () => {
    setIsLoading(true); // Set loading status to true
    setLogs([]); // Clear previous logs

    appendLog('Fetching Weighin Fighters...');

    const tempLogs: string[] = [];
    const appendTempLog = (message: string) => {
      tempLogs.push(message);
    };
    appendTempLog('Fetching Weighin Fighters...');

    const weighinCollection = collection(db, 'events', eventId, 'weighins');
    const querySnapshot = await getDocs(weighinCollection);
    const weighins = querySnapshot.docs.map(doc => doc.data());

    console.log("Weighin data fetched: ", weighins); // Debug log 1

    const categorizedFighters: Record<string, typeof weighins[0][]> = {};

    for (const weighin of weighins) {
      const age = weighin.age; // Age
      const gender = weighin.gender; // Gender
      const weightclass = weighin.weightclass; // Weight class

      // Determine the age category based on the age
      const ageCategory = age < 18 ? 'youth' : 'adult';

      // Create a composite key based on gender, weightclass, and age category
      const category = `${gender}-${weightclass}-${ageCategory}`;

      // Initialize the category array if it doesn't exist
      if (!categorizedFighters[category]) {
        categorizedFighters[category] = [];
      }

      // Add the fighter to the appropriate category
      categorizedFighters[category].push(weighin);
    }

    // Log the categorized fighters for debugging
    console.log('Categorized Fighters:', categorizedFighters);
    appendLog('Categorizing Fighters complete.');

    // Log the number of fighters in each category
    for (const category in categorizedFighters) {
      const numFighters = categorizedFighters[category].length;
      appendTempLog(`Category: ${category}, Number of Fighters: ${numFighters}`);
    }


    const bouts: ResultBout[] = [];
    const unmatched: ResultsFighter[] = [];


    for (const category in categorizedFighters) {
      const fighters = categorizedFighters[category];
      
      // If the number of fighters is odd, add the last one to unmatched
      if (fighters.length % 2 !== 0) {
        const lastFighter = fighters.pop() as ResultsFighter; // remove and get the last element
        unmatched.push(lastFighter);
        appendTempLog(`Unmatched: ${lastFighter.first} ${lastFighter.last}`);
      }
      
      // Match remaining fighters in pairs
      for (let i = 0; i < fighters.length; i += 2) {
        const bout: ResultBout = { 
          fighter1: fighters[i] as ResultsFighter, 
          fighter2: fighters[i + 1] as ResultsFighter 
        };
        bouts.push(bout);
        appendTempLog(`Matched: ${fighters[i].first} ${fighters[i].last} vs ${fighters[i + 1].first} ${fighters[i + 1].last}`);
      }
    }
    // // /// //////////// //////////////////////////////////////////////////////////////////
    // // /// //////////// //////////////////////////////////////////////////////////////////

  // Log bouts and unmatched fighters for debugging
console.log("Bouts:", bouts);
console.log("Unmatched:", unmatched);

// Update the state for bouts and unmatched fighters
setMatches(bouts);
setUnmatchedFighters(unmatched);

// Write bouts and unmatched fighters to Firestore

const batch = writeBatch(db);

// Write unmatched fighters
for (const fighter of unmatched) {
  console.log(`adding unmatched fighter ${fighter.first} ${fighter.last} to Unmatched db...`);
  const docRef = doc(db, 'events', eventId, 'unmatched', fighter.pmt_id);
  console.log(`Setting data for fighter with pmt_id: ${fighter.pmt_id} in Firestore...`);
  batch.set(docRef, fighter);
}

// Create a reference for the bouts collection
const boutsCollection = collection(db, 'events', eventId, 'prematches');

// Write bouts
for (const bout of bouts) {
  const docRef = doc(boutsCollection); // Automatically generate a unique ID for each bout
  console.log(`Creating bout with fighter1: ${bout.fighter1.first} ${bout.fighter1.last} and fighter2: ${bout.fighter2.first} ${bout.fighter2.last}`);
  batch.set(docRef, {
    fighter1: bout.fighter1,
    fighter2: bout.fighter2
  });
}

// Commit the batch
try {
  await batch.commit();
  console.log('Unmatched fighters and bouts have been saved to Firebase.');
} catch (error) {
  console.error('Error saving data:', error);
}


  setLogs(tempLogs); // Update logs

  setTimeout(() => {
    setIsLoading(false); // Hide the loading screen after 5 seconds
  }, 5000);
};
  

return (
  <ScrollView ref={scrollViewRef} style={globalStyles.container}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        <Button title="Create Pre Matches" onPress={preMatches} />
        <Button title="Unmatched" onPress={scrollToUnmatchedFighters} />
      </View>

    {isLoading && (
      <View style={globalStyles.loadingOverlay}>
        <Text>Loading...</Text>
        {logs.map((log, index) => (
          <Text key={index}>{log}</Text>
        ))}
      </View>
    )}



    {matches.map((match, index) => (
      <View key={index} style={globalStyles.boutCard}>
        
        <Text style={globalStyles.boutText}>{match.fighter1?.first} {match.fighter1?.last} {match.fighter1?.gym} {match.fighter1?.weightclass} lbs {match.fighter1?.age} {match.fighter1?.gender} ({match.fighter1?.win} - {match.fighter1?.loss})</Text>
       
        <Text style={globalStyles.boutText}>{match.fighter2?.first} {match.fighter2?.last} {match.fighter2?.gym} {match.fighter2?.weightclass} lbs {match.fighter2?.age} {match.fighter2?.gender} ({match.fighter2?.win} - {match.fighter2?.loss})</Text>
      
      </View>
    ))}

  
<View onLayout={(event) => { const layout = event.nativeEvent.layout; setUnmatchedFightersY(layout.y); }} style={{ marginBottom: 20 }}>
 
        <Text style={{ fontSize: 18, fontWeight: 'bold' }}>Unmatched Fighters:</Text>
  {unmatchedFighters.map((fighter, index) => (
    <View key={index} style={globalStyles.clickableElement}>
      
      <Text style={globalStyles.clickableText} onPress={() => goToSameCategoryFighters(fighter)}>
        {fighter.first} {fighter.last}, Gym: {fighter.gym}, Weightclass: {fighter.weightclass}, Age: {fighter.age}, Gender: {fighter.gender}
      </Text>
    
    </View>
  ))}
</View>

  <Modal
  animationType="slide"
  transparent={true}
  visible={modalVisible}
  onRequestClose={() => {
    setModalVisible(!modalVisible);
  }}
>
  <View style={{ margin: 20, backgroundColor: "white", padding: 20, borderRadius: 10 }}>
    <Text style={{ fontWeight: 'bold' }}>Potential Opponents</Text>
    {sameCategoryFighters.map((fighter, index) => (
     
     <Text key={index}>
        {fighter.first} {fighter.last}, Gym: {fighter.gym}, Weightclass: {fighter.weightclass}, Age: {fighter.age}, Gender: {fighter.gender}
     </Text>
    
    ))}
    <Button title="Close" onPress={() => setModalVisible(false)} />
  </View>
</Modal>

  </ScrollView>
  );
};

export default MatchesScreen;
