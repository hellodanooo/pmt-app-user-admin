import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TextInput, Button } from 'react-native';
import { RouteProp, useRoute } from '@react-navigation/native';
import { getFirestore, collection, doc, updateDoc, query, onSnapshot, getDoc } from 'firebase/firestore';
import { RootStackParamList } from '../navigation/AppNavigator';
import { app } from '../../database/firebaseDb';
import { ResultBout, ResultsFighter } from '../../types';

type ResultsScreenRouteProp = RouteProp<RootStackParamList, 'Results'>;

const ResultsScreen: React.FC = () => {
  const route = useRoute<ResultsScreenRouteProp>();
  const { eventId } = route.params;
  const db = getFirestore(app);
  const [editableResults, setEditableResults] = useState<ResultBout[]>([]);
  const [searchQuery, setSearchQuery] = useState('');



/////////////////////////////////
/////////////////////////////////

const determineBracketInfo = (fighter: ResultsFighter): string => {
  // Example logic to determine bracket information
  const genderPrefix = fighter.gender === 'FEMALE' ? 'girls' : 'boys';
  const weightBracket = fighter.weightclass;

  // Return a string representing the bracket, e.g., 'boys110'
  return `${genderPrefix}${weightBracket}`;
};


const mapResultsToPayload = (): any => {
  const mapFighterToParticipant = (fighter: ResultsFighter, seed: number): any => {
    return {
      seed,
      first_name: fighter.first || 'na',
      last_name: fighter.last || 'na',
      dob: fighter.dob || 'na',
      email: fighter.email || 'na',
      gender: fighter.gender || 'na',
      weight: fighter.weighin || 0,
      gym: fighter.gym || 'na'
      // Add additional fields as per your data structure
    };
  };

  const mapResultToBout = (result: ResultBout): any => {
    return {
      properties: {
        red_fighter_email: result.fighter1.email || 'na',
        blue_fighter_email: result.fighter2.email || 'na',
        // Add additional properties as per your data structure
      },
      result: {
        result_method: result.method || 'na',
        winning_color: result.winningColor || 'na',
        scores: {
          // Add scores, use placeholders if data is missing
        },
        notes: result.notes || 'na',
      },
      // Add suspensions and other data as per your data structure
    };
  };

  const brackets: any[] = [];

  // Group bouts by brackets
  editableResults.forEach(result => {
    const bracket = {
      properties: {
        // Fill in bracket properties, use placeholders if data is missing
      },
      participants: {
        fighters: [
          mapFighterToParticipant(result.fighter1, 1),
          mapFighterToParticipant(result.fighter2, 2)
        ],
      },
      bouts: [
        mapResultToBout(result)
      ]
    };

    brackets.push(bracket);
  });

  return {
    sportingEventUID: '20231129_abc123',
    brackets,
    eventsuspensions: [] // Fill this array as per your data structure
  };
};







const formatDataForPayload = (): any => {
  // Here, you'll format the editableResults into the required payload structure.
  // This is a placeholder function. You need to replace it with actual logic
  // based on your application's data structure and requirements.

  const payload = {
    sportingEventUID: "2023128_IFS70",
    bracket: {
      // ... fill in bracket details
    },
    participants: {
      // ... fill in participant details
    },
    bout: {
      // ... fill in bout details
    },
    result: {
      // ... fill in result details
    },
    suspensions: [
      // ... fill in suspension details if any
    ],
  };

  return payload;
};


const sendDataToOtherDatabase = async () => {
  const payload = mapResultsToPayload();

  console.log("Formatted payload:", JSON.stringify(payload, null, 2));

  // Placeholder for API Key
  const apiKey = 'YOUR_API_KEY_HERE';

  try {
    // If you're sending data to an API
    // await axios.post('your-api-endpoint', payload, { headers: { 'Authorization': `Bearer ${apiKey}` } });

    console.log("Data sent successfully");
  } catch (error) {
    console.error("Error sending data: ", error);
  }
};

/////////////////////////////////
/////////////////////////////////


  useEffect(() => {
    console.log(`Fetching results for eventId: ${eventId}`);
  
    const resultsCollection = collection(db, 'events', eventId, 'results');
    const q = query(resultsCollection);
  
    const unsubscribe = onSnapshot(q, async (querySnapshot) => {
      console.log(`Received query snapshot of size ${querySnapshot.size}`);
  
      if (querySnapshot.empty) {
        console.log("No results found. Checking if collection exists...");
    
        // Fetch a document to check if the collection exists (this is just for debugging)
        const docSnapshot = await getDoc(doc(db, 'events', eventId, 'results', "someDocId"));
        if (!docSnapshot.exists) {
          console.log("Collection or document does not exist");
        } else {
          console.log("Collection exists but no matching documents for the query");
        }
      } else {
        const fetchedResults: ResultBout[] = [];
        querySnapshot.forEach((docSnapshot) => {
          console.log(`Document data: `, docSnapshot.data());
          const data = docSnapshot.data() as ResultBout;
          data.boutid = docSnapshot.id; // Assign the document ID to boutid
          fetchedResults.push(data);
        });
        setEditableResults(fetchedResults);
      }
    });
  
    return () => {
      unsubscribe();
    };
  }, [eventId]);
  
  
  console.log(`Rendering with ${editableResults.length} results`);


  const handleInputChange = (index: number, fighter: 'fighter1' | 'fighter2', field: keyof ResultsFighter, value: string | number) => {
        const updatedResults = editableResults.map((result, idx) => {
      if (index === idx) {
        return { ...result, [fighter]: { ...result[fighter], [field]: value } };
      }
      return result;
    });

    setEditableResults(updatedResults);
  };

  const saveChanges = async (index: number) => {
    const result = editableResults[index];
    const boutId = result.boutid;
  
    if (!boutId) {
      console.error("Error: boutid is undefined or invalid");
      return;
    }
  
    const resultDocRef = doc(db, 'events', eventId, 'results', boutId);
  
    try {
      const docSnapshot = await getDoc(resultDocRef);
      if (!docSnapshot.exists()) {
        console.error("Error: Document does not exist");
        return;
      }
  
      await updateDoc(resultDocRef, {
        fighter1: result.fighter1,
        fighter2: result.fighter2
      });
      console.log("Document successfully updated!");
    } catch (error) {
      console.error("Error updating document: ", error);
    }
  };
  


  const renderFighterFields = (fighter: ResultsFighter, index: number, fighterNumber: 'fighter1' | 'fighter2') => (
    <>
      <TextInput
        value={fighter.first}
        onChangeText={(text) => handleInputChange(index, fighterNumber, 'first', text)}
        placeholder="First Name"
      />
<TextInput
        value={fighter.last}
        onChangeText={(text) => handleInputChange(index, fighterNumber, 'last', text)}
        placeholder="Last Name"
      />   
      <TextInput
        value={fighter.gym}
        onChangeText={(text) => handleInputChange(index, fighterNumber, 'gym', text)}
        placeholder="Gym"
      />  
      
       </>
  );


  const filterResults = () => {
    return editableResults.filter(result => {
      const { fighter1, fighter2 } = result;
      const query = searchQuery.toLowerCase();
      return (
        fighter1.first.toLowerCase().includes(query) ||
        fighter1.last.toLowerCase().includes(query) ||
        fighter1.gym.toLowerCase().includes(query) ||
        fighter2.first.toLowerCase().includes(query) ||
        fighter2.last.toLowerCase().includes(query) ||
        fighter2.gym.toLowerCase().includes(query)
      );
    });
  };
  
  const filteredResults = filterResults();

  return (
    
    <ScrollView style={{ flex: 1, padding: 20 }}>

      <Button title="Submit to IKF" onPress={sendDataToOtherDatabase} />

      <TextInput
        value={searchQuery}
        onChangeText={setSearchQuery}
        placeholder="Search..."
        style={{ height: 40, borderColor: 'gray', borderWidth: 1, marginBottom: 20 }}
      />
      {filteredResults.map((result, index) => (
        <View key={index} style={{ marginBottom: 20 }}>
          <Text>Fighter 1:</Text>
          {renderFighterFields(result.fighter1, index, 'fighter1')}
          <Text>Fighter 2:</Text>
          {renderFighterFields(result.fighter2, index, 'fighter2')}
          <Button title="Save" onPress={() => saveChanges(index)} />
        </View>
      ))}
    </ScrollView>
  );
};

export default ResultsScreen;

