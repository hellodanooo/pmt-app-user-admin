import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, FlatList, Modal, TouchableOpacity } from 'react-native';
import { RouteProp, useRoute } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/AppNavigator';
import { app } from '../../database/firebaseDb';
import { getFirestore, collection, getDocs, writeBatch, doc } from 'firebase/firestore';
import { Official } from '../../types';
import { Picker } from '@react-native-picker/picker';
import { ScrollView } from 'react-native'; // Import ScrollView


type OfficialsScreenRouteProp = RouteProp<RootStackParamList, 'Officials'>;

const OfficialsScreen: React.FC = () => {
  const route = useRoute<OfficialsScreenRouteProp>();
  const eventId = route.params.eventId;
  const db = getFirestore(app);

  const [modalVisible, setModalVisible] = useState(false); // New state for modal visibility
  const [filterState, setFilterState] = useState(''); // New state to hold the filter value

  const [officials, setOfficials] = useState<Official[]>([]);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [position, setPosition] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [payment, setPayment] = useState('');
  const [photo, setPhoto] = useState('');
  const [allOfficials, setAllOfficials] = useState<Official[]>([]); // New state for allOfficials



  useEffect(() => {
    async function fetchData() {
      const data = await fetchOfficials(eventId);
      setOfficials(data);

      const allData = await fetchAllOfficials(); // Fetch all officials
      setAllOfficials(allData); // Set all officials
    }
    fetchData();
  }, [eventId]);

  const fetchOfficials = async (eventId: string): Promise<Official[]> => {
    try {
      const officialsRef = collection(db, 'events', eventId, 'officials');
      const officialsSnapshot = await getDocs(officialsRef);
      const officialsList: Official[] = [];

      officialsSnapshot.forEach((doc) => {
        const officialData = doc.data() as Official;
        officialData.id = doc.id;
        officialsList.push(officialData);
      });

      return officialsList;
    } catch (error) {
      console.error(`Error fetching officials:`, error);
      return [];
    }
  };

  const addOfficial = async (eventId: string, official: Official) => {
    try {
      const officialsRef = collection(db, 'events', eventId, 'officials');
      const batch = writeBatch(db);
      const newDocRef = doc(officialsRef);
      batch.set(newDocRef, official);
      await batch.commit();
    } catch (error) {
      console.error(`Error adding official:`, error);
    }
  };

  const handleAddOfficial = async () => {
    const newOfficial: Official = { first: firstName, last: lastName, position, email, phone, city, state, payment, photo };
    await addOfficial(eventId, newOfficial);
    setOfficials([...officials, newOfficial]);
    setFirstName('');
    setLastName('');
    setPosition('');
    setEmail('');
    setPhone('');
    setCity('');
    setState('');
    setPayment('');
    setPhoto('');

  };



  const fetchAllOfficials = async (): Promise<Official[]> => {
    try {
      const officialsAllRef = collection(db, 'officials_all');
      const officialsAllSnapshot = await getDocs(officialsAllRef);
      const officialsAllList: Official[] = [];

      officialsAllSnapshot.forEach((doc) => {
        const officialData = doc.data() as Official;
        officialData.id = doc.id;
        officialsAllList.push(officialData);
      });

      return officialsAllList;
    } catch (error) {
      console.error(`Error fetching all officials:`, error);
      return [];
    }
  };


  const handleAddExistingOfficial = async (official: Official) => {
    await addOfficial(eventId, official);
    setOfficials([...officials, official]);
  };

  const filteredOfficials = allOfficials.filter((official) => {
    if (filterState === '') return true; // If no filter is set, show all officials
    return official.state === filterState; // Else, show only the officials with the matching state
  });


  return (
    <View style={{ flex: 1, padding: 20 }}>
      {/* New button to toggle modal */}
      <Button title="All Officials" onPress={() => setModalVisible(true)} />


      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          setModalVisible(!modalVisible);
        }}
      >
        <View style={{ margin: 20, backgroundColor: "white", borderRadius: 10 }}>
          <ScrollView>

            <Text style={{ fontWeight: 'bold' }}>All Officials</Text>

            <Picker
              selectedValue={filterState}
              onValueChange={(itemValue) => setFilterState(itemValue.toString())}
            >
              <Picker.Item label="All States" value="" />
              <Picker.Item label="California" value="CA" />
              <Picker.Item label="Texas" value="TX" />
            </Picker>

            <FlatList
              data={filteredOfficials}  
              renderItem={({ item }) => (
                <TouchableOpacity onPress={() => handleAddExistingOfficial(item)}>
                  <View style={{ marginBottom: 10 }}>
                    <Text>{item.first} {item.last}</Text>
                    <Text>{item.position}</Text>
                  </View>
                </TouchableOpacity>
              )}
              keyExtractor={(item) => item.id || Math.random().toString()}
            />
            <Button title="Close" onPress={() => setModalVisible(false)} />
          </ScrollView> 
        </View>
      </Modal>

      {officials.length > 0 ? (
        <FlatList
          data={officials}
          renderItem={({ item }) => (
            <View style={{ marginBottom: 10 }}>
              <Text>{item.first} {item.last}</Text>
              <Text>{item.position}</Text>
            </View>
          )}
          keyExtractor={(item) => item.id || Math.random().toString()}
        />
      ) : (
        <Text>No officials found. Add the first official:</Text>
      )}

      <View style={{ marginTop: 20 }}>
        <TextInput
          style={{ borderColor: 'gray', borderWidth: 1, padding: 10, marginBottom: 10 }}
          placeholder="First Name"
          value={firstName}
          onChangeText={setFirstName}
        />
        <TextInput
          style={{ borderColor: 'gray', borderWidth: 1, padding: 10, marginBottom: 10 }}
          placeholder="Last Name"
          value={lastName}
          onChangeText={setLastName}
        />
        <TextInput
          style={{ borderColor: 'gray', borderWidth: 1, padding: 10, marginBottom: 10 }}
          placeholder="Position"
          value={position}
          onChangeText={setPosition}
        />

        <Button title="Add Official" onPress={handleAddOfficial} />
      </View>
    </View>
  );
};

export default OfficialsScreen;
