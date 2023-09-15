// client/src/screens/UnMatched.tsx

import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import axios from 'axios';
import { WeighinFighter} from '../../types';
import { Modal, TouchableOpacity, ScrollView } from 'react-native';

const UnMatched = () => {
    const [unmatchedFighters, setUnmatchedFighters] = useState<WeighinFighter[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalVisible, setModalVisible] = useState(false);
    const [selectedFighter, setSelectedFighter] = useState<WeighinFighter | null>(null);
    const [weighinFighters, setWeighinFighters] = useState<WeighinFighter[]>([]);
    const [selectedWeighinFighter, setSelectedWeighinFighter] = useState<WeighinFighter | null>(null);


  // Fetch data from MongoDB collection 'Unmatched'
  useEffect(() => {
    //
    const fetchData = async () => {
      try {
        const response = await axios.get('https://pmt-admin-server-c0554bfe6b60.herokuapp.com/api/unmatched'); // Replace with your server URL
        setUnmatchedFighters(response.data);
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching unmatched fighters:", error);
      }
    };

    fetchData();

    // New logic for fetching weighin fighters
  const fetchWeighinFighters = async () => {
    try {
      const response = await axios.get('https://pmt-admin-server-c0554bfe6b60.herokuapp.com/api/weighins');
      setWeighinFighters(response.data);
    } catch (error) {
      console.error("Error fetching weighin fighters:", error);
    }
  };
  
  fetchWeighinFighters();

}, []);
  //
  

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
  data={unmatchedFighters}
  keyExtractor={(item, index) => index.toString()}
  renderItem={({ item }: { item: WeighinFighter }) => (
    <TouchableOpacity 
      onPress={() => {
        setSelectedFighter(item);
        setModalVisible(true);
      }}
    >
      <Text style={styles.listItem}>
        {`${item['First Name']} ${item['Last Name']}`}
      </Text>
    </TouchableOpacity>
  )}
/>
<Modal
  animationType="slide"
  transparent={true}
  visible={isModalVisible}
  onRequestClose={() => {
    setModalVisible(!isModalVisible);
  }}
>
  <View style={styles.centeredView}>
    <View style={styles.modalView}>
      {selectedFighter && (
        <Text style={styles.modalText}>
          Selected Fighter: {selectedFighter['First Name']} {selectedFighter['Last Name']}
        </Text>
      )}
    <ScrollView>
  {weighinFighters.map((fighter, index) => (
    fighter.Weight > 0 ? (
      <TouchableOpacity key={index} onPress={() => setSelectedWeighinFighter(fighter)}>
        <Text>
          {fighter['First Name']} {fighter['Last Name']}
        </Text>
      </TouchableOpacity>
    ) : null
  ))}
</ScrollView>

{selectedFighter && selectedWeighinFighter && (
  <View style={styles.boutContainer}>
    <Text style={styles.boutText}>
      Bout Details:
    </Text>
    <Text>
      Fighter1: {selectedFighter['First Name']} {selectedFighter['Last Name']}
    </Text>
    <Text>
      Fighter2: {selectedWeighinFighter['First Name']} {selectedWeighinFighter['Last Name']}
    </Text>
  </View>
)}


<TouchableOpacity
  onPress={async () => {
    if (selectedFighter && selectedWeighinFighter) {
      const bout = {
        Fighter1: selectedFighter,
        Fighter2: selectedWeighinFighter,
        FighterID1: selectedFighter.FighterID
      };

      try {
        await axios.post('https://pmt-admin-server-c0554bfe6b60.herokuapp.com/api/matches/createBout', bout);

        await axios.delete(`https://pmt-admin-server-c0554bfe6b60.herokuapp.com/api/matches/deleteUnmatched/${bout.FighterID1}`);

        setModalVisible(false);
        setSelectedFighter(null);
        setSelectedWeighinFighter(null);
      } catch (error) {
        console.error("Error in operations:", error);
      }
    }
  }}
>
  <Text>Submit Bout</Text>
</TouchableOpacity>


<TouchableOpacity
  style={styles.closeButton}
  onPress={() => {
    setModalVisible(false);
    setSelectedWeighinFighter(null);
  }}
>
  <Text>Close</Text>
</TouchableOpacity>

    </View>
  </View>
</Modal>

    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  modalView: {
    margin: 20,
    backgroundColor: "white",
    borderRadius: 20,
    padding: 35,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5
  },
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 22
  },
  modalText: {
    marginBottom: 15,
    textAlign: "center"
  },
  closeButton: {
    backgroundColor: "#2196F3",
    borderRadius: 20,
    padding: 10,
    elevation: 2
  },
  boutContainer: {
    marginVertical: 15,
    padding: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
  },
  boutText: {
    fontWeight: 'bold',
  },
  
  
});

export default UnMatched;
