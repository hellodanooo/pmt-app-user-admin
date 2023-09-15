// client/src/screens/EventDetails.tsx
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Alert,
  Button,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { EventDetails } from '../../types'; // Import the type

type MainScreenNavigationProp = StackNavigationProp<RootStackParamList, 'EventDetails'>;
type Props = {
  navigation: MainScreenNavigationProp;
  // Add any other props your component may receive
};

const EventDetailsScreen: React.FC<Props> = ({ navigation }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [details, setDetails] = useState<EventDetails[]>([]); // Use the type here

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('https://pmt-admin-server-c0554bfe6b60.herokuapp.com/api/eventdetails/fetchDetails');
      console.log('Fetched Response:', response);
      const data = await response.json();
      setDetails(data);
    } catch (error) {
      Alert.alert('Error', 'Something went wrong.');
      console.error('Error fetching event details:', error);
    }
    setIsLoading(false);
  };

  const updateData = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`https://pmt-admin-server-c0554bfe6b60.herokuapp.com/api/eventdetails/updateDetails`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(details[0]),
      });
  
      const responseData = await response.json(); // read the body only once
      console.log('Response:', responseData); 
  
      if (response.ok) {
        fetchData();
      } else {
        Alert.alert('Error', 'Something went wrong.');
      }
    } catch (error) {
      Alert.alert('Error', 'Something went wrong.');
      console.error('Error updating event details:', error);
    }
    setIsLoading(false);
  };
  
  

  return (
    <View style={styles.container}>
      {isLoading ? (
        <Text>Loading...</Text>
      ) : (
        <>
          {details && details.length > 0 ? (
            <>
              <TextInput
                value={details[0]['Event Name']}
                onChangeText={(text) => {
                  const updatedDetails = [...details];
                  updatedDetails[0]['Event Name'] = text;
                  setDetails(updatedDetails);
                }}
              />
              <TextInput
                value={details[0]['Venue Name']}
                onChangeText={(text) => {
                  const updatedDetails = [...details];
                  updatedDetails[0]['Venue Name'] = text; // Fixed here
                  setDetails(updatedDetails);
                }}
              />
              <Button title="Update Details" onPress={updateData} />
            </>
          ) : (
            <Text>No Data Found</Text>
          )}
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Add other styles as needed
});

export default EventDetailsScreen;
