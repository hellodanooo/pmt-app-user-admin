// src/screens/MainScreen.tsx
import React, { useState, useEffect } from 'react';
import { View, Button, FlatList, Text, TouchableOpacity, TextInput } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { app } from '../../database/firebaseDb';
import { getFirestore, collection, getDocs, addDoc, doc, setDoc } from "firebase/firestore";
import {Event} from '../../types';
import globalStyles from '../utils/globalStyles';
import { Timestamp } from 'firebase/firestore'; // or your specific Timestamp import


type MainScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Main'>;

const MainScreen = () => {
  const navigation = useNavigation<MainScreenNavigationProp>();
  const [events, setEvents] = useState<Event[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [newEvent, setNewEvent] = useState<Event>({
    event_name: '',
    venue_name: '',
    Venue_location: '',
    'Day Before Weigh ins': '',
    'Day Before Weight Location': '',
    'Weigh ins info': '',
    'Competition Date': '',
    'Doors Open': '',
    'Rules Meeting': '',
    'Bouts Start': '',
    'Number Mats': '',
    address: '',
    id: ''
  });


  useEffect(() => {


    const getComparableDate = (date: Timestamp | string): number => {
      if (date instanceof Timestamp) {
        return date.toMillis(); // Converts the Timestamp to milliseconds
      } else {
        return new Date(date).getTime(); // Converts the string to a Date, then to milliseconds
      }
    };

    const fetchEvents = async () => {
      const db = getFirestore(app);
      const eventsRef = collection(db, 'events');
      try {
        const querySnapshot = await getDocs(eventsRef);
        let eventsArray: Event[] = querySnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Event));
        
        // Sort events based on the 'Competition Date'
        eventsArray = eventsArray.sort((b, a) => getComparableDate(a['Competition Date']) - getComparableDate(b['Competition Date']));
    
        setEvents(eventsArray);
      } catch (error) {
        console.error("Error fetching events:", error);
      }
    };
    fetchEvents();
  }, []);



  const [message, setMessage] = useState<string | null>(null);
  
  
  
  const addEventToDb = async () => {    const db = getFirestore(app);

    if (!newEvent.id) {
      setMessage('No ID provided for the new event.');
      return;
    }
    const eventRef = doc(db, 'events', newEvent.id);

    try {
      await setDoc(eventRef, newEvent);  // Set the newEvent object in the document with the ID
      setMessage('Event added successfully');
    } catch (e) {
      console.error('Error adding event: ', e);
      setMessage('Failed to add event');
    }
    setShowForm(false);
  };


  const formatDate = (date: Timestamp | string): string => {
    if (date instanceof Timestamp) {
      // Convert Timestamp to a Date and format as string
      // Adjust the formatting as per your requirements
      return date.toDate().toISOString().split('T')[0];
    }
    return date; // If it's already a string, return as is
  };
  
  // Function to parse string to Timestamp
  const parseDate = (dateString: string): Timestamp | string => {
    // Here, you can add logic to convert string to Timestamp
    // For now, I am keeping it as string for simplicity
    return dateString;
  };

    return (
        <View style={globalStyles.container}>
            <View style={{ flex: 1 }}>
            <FlatList
  data={events}
  keyExtractor={(item) => item.id}
  renderItem={({ item }) => (
    <TouchableOpacity
      style={globalStyles.button}
      onPress={() => navigation.navigate('EventDetails', { event: item })}
    >
      <Text style={globalStyles.buttonText}>
        {item.event_name} {formatDate(item['Competition Date'])}
      </Text>
    </TouchableOpacity>
  )}
/>
            </View>
            <View style={{ marginBottom: 10 }}>
                <Button
                    title="Records"
                    onPress={() => navigation.navigate('Records')}
                />
                 <Button
                    title="Gyms"
                    onPress={() => navigation.navigate('GymRecords')}
                />
                <Button
                    title="Create Event"
                    onPress={() => setShowForm(!showForm)}
                />
            </View>
            {showForm && (
  <View>
    <TextInput
      placeholder="Event Name"
      value={newEvent.event_name}
      onChangeText={(text) => setNewEvent({ ...newEvent, event_name: text })}
    />
    <TextInput
      placeholder="Venue Name"
      value={newEvent.venue_name}
      onChangeText={(text) => setNewEvent({ ...newEvent, venue_name: text })}
    />
    <TextInput
      placeholder="Venue Location"
      value={newEvent.Venue_location}
      onChangeText={(text) => setNewEvent({ ...newEvent, Venue_location: text })}
    />
    <TextInput
      placeholder="Day Before Weigh ins"
      value={newEvent['Day Before Weigh ins']}
      onChangeText={(text) => setNewEvent({ ...newEvent, 'Day Before Weigh ins': text })}
    />
    <TextInput
      placeholder="Day Before Weight Location"
      value={newEvent['Day Before Weight Location']}
      onChangeText={(text) => setNewEvent({ ...newEvent, 'Day Before Weight Location': text })}
    />
    <TextInput
      placeholder="Weigh ins info"
      value={newEvent['Weigh ins info']}
      onChangeText={(text) => setNewEvent({ ...newEvent, 'Weigh ins info': text })}
    />
   <TextInput
  placeholder="Competition Date"
  value={formatDate(newEvent['Competition Date'])}
  onChangeText={(text) => setNewEvent({ ...newEvent, 'Competition Date': parseDate(text) })}
/>
    <TextInput
      placeholder="Doors Open"
      value={newEvent['Doors Open']}
      onChangeText={(text) => setNewEvent({ ...newEvent, 'Doors Open': text })}
    />
    <TextInput
      placeholder="Rules Meeting"
      value={newEvent['Rules Meeting']}
      onChangeText={(text) => setNewEvent({ ...newEvent, 'Rules Meeting': text })}
    />
    <TextInput
      placeholder="Bouts Start"
      value={newEvent['Bouts Start']}
      onChangeText={(text) => setNewEvent({ ...newEvent, 'Bouts Start': text })}
    />
    <TextInput
      placeholder="Number Mats"
      value={newEvent['Number Mats']}
      onChangeText={(text) => setNewEvent({ ...newEvent, 'Number Mats': text })}
    />
    <TextInput
      placeholder="Address"
      value={newEvent.address}
      onChangeText={(text) => setNewEvent({ ...newEvent, address: text })}
    />
   <TextInput
  placeholder="ID (location_month_day_year)"
  value={newEvent.id}
  onChangeText={(text) => setNewEvent(prevState => ({ ...prevState, id: text }))}
/>
<Button title="Submit" onPress={() => addEventToDb()} />
  </View>
)}

{message && (
  <Text>{message}</Text>
)}




        </View>
    );

};

export default MainScreen;
