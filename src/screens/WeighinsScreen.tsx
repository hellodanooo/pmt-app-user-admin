
import React, { useState, useEffect } from 'react';
import { View, Text, Button, FlatList, TextInput } from 'react-native';
import {WeighinFighter} from '../../types';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/AppNavigator';

type MainScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Main'>;

const WeighinItem = ({ item, handleWeightUpdate }: { item: WeighinFighter, handleWeightUpdate: (newWeight: string, id: string) => void }) => {
const [tempWeight, setTempWeight] = useState(item['WEIGHT'].toString());


  return (
    <View style={{ padding: 10, borderBottomWidth: 1 }}>
      <TextInput
        value={tempWeight}
        style={{ borderBottomWidth: 1, borderColor: '#d3d3d3', marginBottom: 5 }}
        keyboardType="numeric"
        onChangeText={text => setTempWeight(text)}
        onEndEditing={(e) => {
          handleWeightUpdate(e.nativeEvent.text, item.id);
          setTempWeight(e.nativeEvent.text);
        }}
      />
      <Text>{`${item['FIRST']} ${item['LAST']} ${item['GYM']} ${item['WEIGHTCLASS']} ${item['AGE']}`}</Text>
    </View>
  );
}



const WeighinScreen = () => {
  const [weighins, setWeighins] = useState<WeighinFighter[]>([]);
  const [responseMessage, setResponseMessage] = useState<string | null>(null);
  const navigation = useNavigation<MainScreenNavigationProp>();



  useEffect(() => {
    fetchData('weighins/display', setWeighins);
  }, []);

  
//////////////////// FUNCTION BELOW //////////////////

const fetchData = async (apiEndpoint: string, setData: React.Dispatch<any>) => {
  try {
    const response = await fetch(`https://pmt-admin-server-c0554bfe6b60.herokuapp.com/${apiEndpoint}`);
    

    if (response.status !== 200) {
      console.error(`Weghin Error: received status code ${response.status}`);
      // TODO: Display an error to users
      return;
    }
    
    console.log("LOGCHECK ",response)
    const dataObj = await response.json();
    
    if (typeof dataObj !== 'object' || dataObj === null) {
      console.error("Expected an object from server");
      // TODO: Display an error to users
      return;
    }

    const dataArray = Object.keys(dataObj).map(key => dataObj[key]);
    console.log("Data received:", dataArray);
    setData(dataArray);
  } catch (error) {
    console.error(`Error fetching ${apiEndpoint}:`, error);
    // TODO: Display an error to users
  }
};

  const makeWeighins = () => {
    console.log("someshit Button Pushed"); // Logs when the button is clicked
  
    fetch('https://pmt-admin-server-c0554bfe6b60.herokuapp.com/weighins/makeMatches', {
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
  
  const goToMatchScreen = () => {
    navigation.navigate('Matches'); // Navigate to match screen
  };

  const handleWeightUpdate = async (newWeight: string, id: string) => {
    try {
      const response = await fetch(`https://pmt-admin-server-c0554bfe6b60.herokuapp.com/weighins/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ WEIGHT: newWeight })
      });
  
      if (response.status !== 200) {
        throw new Error(`Server responded with status: ${response.status}`);
      }
  
      const result = await response.json();
      console.log(result.message);
  
      // Optionally, refetch weigh-ins data here or just update the state locally.
  
    } catch (error) {
      console.error("Error updating weight:", error);
    }
  };
  //////////////////// FUNCTION ABOVE //////////////////

    <View style={{ flex: 1, paddingTop: 20 }}> 
      {/* Padding just to ensure the message doesn't stick to the very top of the screen */}
      
      {responseMessage && <Text style={{ color: 'red', textAlign: 'center' }}>{responseMessage}</Text>}
      {/* The color and textAlign styles are just examples; adjust based on your UI preferences */}
      
      <Button title="Make Weighins" onPress={makeWeighins} />
      <FlatList
        data={weighins}
        keyExtractor={item => item.id}
        renderItem={({ item }) => <WeighinItem item={item} handleWeightUpdate={handleWeightUpdate} />}
      />
    </View>

return (
  <View style={{ flex: 1, paddingTop: 20 }}>
    {responseMessage && <Text style={{ color: 'red', textAlign: 'center' }}>{responseMessage}</Text>}
    <Button title="Make Weighins" onPress={makeWeighins} />
    <FlatList
      data={weighins}
      keyExtractor={item => item.id}
      renderItem={({ item }) => <WeighinItem item={item} handleWeightUpdate={handleWeightUpdate} />}
    />
  </View>
);
  
}

export default WeighinScreen;