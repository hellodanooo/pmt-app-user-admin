// src/screens/RosterScreen.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, Button, FlatList, ScrollView, TouchableOpacity, Modal } from 'react-native';

import { RosterFighter, Event, WeighinFighter } from '../../types';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { app } from '../../database/firebaseDb';
import { getFirestore } from "firebase/firestore";
import { collection, doc, getDocs, writeBatch } from 'firebase/firestore';

type MainScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Main'>;

const RosterScreen = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [roster, setRoster] = useState<RosterFighter[]>([]);
  const db = getFirestore(app);

  const navigation = useNavigation<MainScreenNavigationProp>();
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
  const [stats, setStats] = useState<{ [key: string]: any }>({});
  

  const calculateStatistics = (roster: RosterFighter[]) => {
    // Example: Calculate average weight
    const totalWeight = roster.reduce((sum, fighter) => sum + fighter.weight, 0);
    const averageWeight = roster.length > 0 ? totalWeight / roster.length : 0;
  
    // Set other statistics as needed
    setStats({
      averageWeight,
      // ... add other statistics here
    });
  };


  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const eventsRef = collection(db, 'events');
      const querySnapshot = await getDocs(eventsRef);
      const eventsArray: Event[] = [];
  
      for (const doc of querySnapshot.docs) {
        const eventData = doc.data() as Event;
        eventData.id = doc.id;
  
        // Check if 'roster' collection exists for the current event
        const rosterRef = collection(db, 'events', eventData.id, 'roster');
        const rosterSnapshot = await getDocs(rosterRef);
        
        // Only push the event if it has at least one roster entry
        if (!rosterSnapshot.empty) {
          eventsArray.push(eventData);
        }
      }
  
      setEvents(eventsArray);
    } catch (error) {
      console.error(`Error fetching events from Firestore:`, error);
    }
  };

  const fetchData = async (eventId: string) => {
    const rosterRef = collection(db, 'events', eventId, 'roster');
    const dataArray: RosterFighter[] = []; // Explicitly set the type here
    try {
        const querySnapshot = await getDocs(rosterRef);
        querySnapshot.forEach((doc) => {
            const fighter = doc.data() as RosterFighter;
            console.log(`Fetching data for event ID: ${eventId}`);
            fighter.id = doc.id;

            const [month, day, year] = fighter.dob.split('/');

            // Generate pmt_id
            fighter.pmt_id = `${fighter.first}${fighter.last}${month}${day}${year}`;

            dataArray.push(fighter);
        });
        console.log("Data received:", dataArray);
        setRoster(dataArray);
    } catch (error) {
        console.error(`Error fetching roster from Firestore:`, error);
        // TODO: Display an error to users
    }
};


const onEventSelected = (eventId: string) => {
  console.log("Event selected:", eventId);  // Log the event ID

  setSelectedEventId(eventId);  // Set the selected event ID state
  fetchData(eventId);           // Fetch data for the selected event

};



  // MAKE WEIGH IN BUTTON
   const [responseMessage, setResponseMessage] = useState<string | null>(null);
  

 


  const convertToWeighinFighter = (rosterFighter: RosterFighter): WeighinFighter | null => {
    if (rosterFighter.weight === undefined) {
        console.warn(`Fighter ${rosterFighter.first} ${rosterFighter.last} has undefined weight. Using default value.`);
        rosterFighter.weight = 0;  // Default value if weight is undefined
    }

    return {
        pmt_id: rosterFighter.pmt_id,
        first: rosterFighter.first,
        last: rosterFighter.last,
        gym: rosterFighter.gym,
        gender: rosterFighter.gender,
        weight: rosterFighter.weight,
        win: 0,
        loss: 0,
        age: 0,
        weightclass: rosterFighter.weightclass,
        dob: rosterFighter.dob
    };
  };

  const createWeighins = async (eventId: string, roster: RosterFighter[]) => {
    try {
      const batch = writeBatch(db);

      roster.forEach((fighter) => {
          const weighinFighter = convertToWeighinFighter(fighter);
          if (weighinFighter) {
            const docRef = doc(db, 'events', eventId, 'weighins', weighinFighter.pmt_id);
            batch.set(docRef, weighinFighter);
          }
      });

      await batch.commit();
      console.log("WeighinFighter data for all fighters submitted successfully.");
    } catch (error) {
      console.error("Error submitting WeighinFighter data:", error);
    }
  };

  return (
    <View style={{ flex: 1 }}>

        {selectedEventId && (
          <Button 
              title="Submit Weigh-in for All Fighters" 
              onPress={() => createWeighins(selectedEventId, roster)}
          />
        )}

        <FlatList
            data={roster}
            keyExtractor={(item) => item.id?.toString() || 'defaultId'}
            renderItem={({ item }: { item: RosterFighter }) => (
              <View style={{ padding: 10, borderBottomWidth: 1 }}>
                  <Text>{`${item['first']} ${item['gym']} ${item['weightclass']}`}</Text>
              </View>
          )}
        />
    </View>
  );
};

export default RosterScreen;