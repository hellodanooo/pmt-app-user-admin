// client/src/screens/Matches.tsx

import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, Button } from 'react-native';
import axios from 'axios';
import { ListItem } from 'react-native-elements';
import { Bout } from '../../types';  // Make sure the path is correct

import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/AppNavigator';

// Define the navigation prop type
type MatchesScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Matches'>;


// Add the navigation prop to your Matches component
const Matches = ({ navigation }: { navigation: MatchesScreenNavigationProp }) => {  const [matches, setMatches] = useState<Bout[]>([]);  // <-- Type set here
  const [isLoading, setIsLoading] = useState(true);

  // Fetch data from MongoDB collection 'Matches'
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get('https://pmt-admin-server-c0554bfe6b60.herokuapp.com/api/matches/display'); // Replace 'your-server-url' with the URL of your server
        setMatches(response.data.bouts);
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching matches:", error);
      }
    };

    fetchData();
  }, []);



  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading...</Text>
      </View>
    );
  }

  console.log("CHECK MATCHES",matches)

  return (
    <View style={styles.container}>
       <Button 
        title="Go to UnMatched"
        onPress={() => navigation.navigate('UnMatched')}
      />
    <FlatList
      data={matches}
      keyExtractor={(item, index) => index.toString()}
      renderItem={({ item }) => (
        <ListItem bottomDivider>
          <ListItem.Content>
            <View style={styles.fighterContainer}>
              <Text style={styles.fighterText}>
                {`${item.Fighter1['First Name']} ${item.Fighter1['Last Name']} ${item.Fighter1['Gym Name']} ${item.Fighter1['Age']} ${item.Fighter1['Weight']}`}
              </Text>
              <Text style={styles.fighterText}>
                {`${item.Fighter2['First Name']} ${item.Fighter2['Last Name']} ${item.Fighter2['Gym Name']} ${item.Fighter2['Age']} ${item.Fighter2['Weight']}`}
              </Text>
            </View>
          </ListItem.Content>
        </ListItem>
      )}
    />
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
  fighterContainer: {
    flexDirection: 'column',  // This ensures the layout is vertical
    alignItems: 'flex-start', // Aligns text to the left
  },
  fighterText: {
    fontSize: 16, // You can set this to any suitable value
  },
});

export default Matches;
