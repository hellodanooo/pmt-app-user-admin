import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, Button, Modal, ScrollView, TouchableOpacity, Linking, TextInput } from 'react-native';
import { getFirestore, collection, getDocs, writeBatch, doc, getDoc, query, orderBy, limit, setDoc } from 'firebase/firestore';

import { useRoute } from '@react-navigation/native';
import { RosterFighter, WeighinFighter } from '../../types';
import { app } from '../../database/firebaseDb';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/AppNavigator';

import QRCode from 'react-native-qrcode-svg';



const RosterScreen: React.FC = () => {
    const [roster, setRoster] = useState<RosterFighter[]>([]);
    const route = useRoute<RouteProp<RootStackParamList, 'Roster'>>();
    const eventId = route.params.eventId;
    const db = getFirestore(app);
  
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [stats, setStats] = useState<any>(null);
    const [selectedFighter, setSelectedFighter] = useState<RosterFighter | null>(null);
    const [showMenu, setShowMenu] = useState(false);
    const [addFighterModalVisible, setAddFighterModalVisible] = useState(false);
    const [searchPmtId, setSearchPmtId] = useState('');
    
    const [loadingStatus, setLoadingStatus] = useState<string>('');
    
    
    const addFighter = () => {
      setAddFighterModalVisible(true);
    };
    const handleSearch = async () => {
      try {
        const docRef = doc(db, 'pmt_profile', searchPmtId);
        const docSnapshot = await getDoc(docRef);
  
        if (docSnapshot.exists()) {
          const fighterProfile = docSnapshot.data();
          // Copy this fighter's details to the roster
          const rosterRef = collection(db, 'events', eventId, 'roster');
          await setDoc(doc(rosterRef, fighterProfile.pmt_id), fighterProfile);
  
          console.log('Fighter added to roster:', fighterProfile);
        } else {
          console.log('No fighter found with pmt_id:', searchPmtId);
        }
      } catch (error) {
        console.error('Error adding fighter to roster:', error);
      }
  
      setAddFighterModalVisible(false);
    };



    const onFighterPress = (fighter: RosterFighter) => {
      setSelectedFighter(fighter);
      setShowMenu(true);
    };

    const hideMenu = () => {
      setShowMenu(false);
      setSelectedFighter(null);
    };
  
    const handleDelete = () => {
      console.log(`Deleting fighter: ${selectedFighter?.first} ${selectedFighter?.last}`);
      // Implement delete logic here
      hideMenu();
    };


    const TEST_PHONE_NUMBER = '6197946356'; 

    const sendMessage = () => {
      if (selectedFighter) {
        // For testing, use a fixed phone number
        const phoneNumber = TEST_PHONE_NUMBER;
    
        // Logic to send a text message
        console.log(`Sending message to ${phoneNumber}`);
        // Example implementation (uncomment when ready to test):
        Linking.openURL(`sms:${phoneNumber}?body=PMT Admin App Test Message`);
      }
    };

    const logFirstFiveFighters = async () => {
      try {
          const fightersRef = collection(db, 'Fighters');  // Reference to the 'Fighters' collection
          const q = query(fightersRef, orderBy('last'), limit(5)); // Replace 'someField' with an appropriate field that exists in your documents
          
          const firstFiveSnapshot = await getDocs(q);
  
          const fighters: any[] = [];  // Create an array to hold the fighter data
  
          firstFiveSnapshot.forEach((doc) => {
              const fighterData = doc.data();  // Get the data of each document
              fighters.push(fighterData);     // Push the data to the fighters array
          });
  
          console.log("First 5 fighters:", fighters.map(f => f.pmt_id));
          
      } catch (error) {
          console.error("Error fetching first 5 fighters:", error);
      }
  };
  
  useEffect(() => {
    logFirstFiveFighters();  // Log the first 5 fighters when the component mounts
    fetchRoster();
  }, [eventId]);
  

  const calculateStats = (fighters: RosterFighter[]) => {
    const totalFighters = fighters.length;
    const averageAge = fighters.reduce((acc, fighter) => acc + calculateAge(fighter.dob), 0) / totalFighters;
  
    let boys = 0, girls = 0, men = 0, women = 0;
    const weightClassCounts: { [key: string]: number } = {};
    const fightersByWeightClass: { [key: string]: RosterFighter[] } = {};
  
    fighters.forEach(fighter => {
      const age = calculateAge(fighter.dob);
      if (fighter.gender.toLowerCase() === 'male') {
        age < 18 ? boys++ : men++;
      } else if (fighter.gender.toLowerCase() === 'female') {
        age < 18 ? girls++ : women++;
      }
  
      if (!weightClassCounts[fighter.weightclass]) {
        weightClassCounts[fighter.weightclass] = 0;
      }
      weightClassCounts[fighter.weightclass]++;
      
      if (!fightersByWeightClass[fighter.weightclass]) {
        fightersByWeightClass[fighter.weightclass] = [];
      }
      fightersByWeightClass[fighter.weightclass].push(fighter);
    });
  
    const finalStats = {
      totalFighters,
      averageAge,
      boys,
      girls,
      men,
      women,
      weightClassCounts, // This will now have the correct counts
      fightersByWeightClass
    };
  
    console.log("Final Statistics:", finalStats);
    setStats(finalStats);
  };

  
    
    const groupAndSortFighters = (fighters: RosterFighter[]): RosterFighter[] => {
      const categories = {
        boys: fighters.filter(f => f.gender.toLowerCase() === 'male' && calculateAge(f.dob) < 18),
        girls: fighters.filter(f => f.gender.toLowerCase() === 'female' && calculateAge(f.dob) < 18),
        men: fighters.filter(f => f.gender.toLowerCase() === 'male' && calculateAge(f.dob) >= 18),
        women: fighters.filter(f => f.gender.toLowerCase() === 'female' && calculateAge(f.dob) >= 18)
      };
    
      type CategoryKey = keyof typeof categories;
    
      Object.keys(categories).forEach((key) => {
        const categoryKey = key as CategoryKey;
        categories[categoryKey].sort((a, b) => a.weightclass - b.weightclass);
      });
    
      return ([] as RosterFighter[]).concat(categories.boys, categories.girls, categories.men, categories.women);
    };
    
    
    

    const fetchRoster = async () => {
      try {
        setLoadingStatus('Loading Roster');
        const rosterRef = collection(db, 'events', eventId, 'roster');
        const rosterSnapshot = await getDocs(rosterRef);
        let fighters: RosterFighter[] = [];
    
        for (const doc of rosterSnapshot.docs) {
          setLoadingStatus('Loading Records');
          const fighterData = doc.data() as RosterFighter;
          fighterData.id = doc.id;
    
          // Fetch win-loss record from 'profiles'
          const profile = await getFighterDetails(fighterData.pmt_id);
          fighterData.win = profile.win;
          fighterData.loss = profile.loss;
    
          fighters.push(fighterData);
        }
    
        // Group and sort the fighters
        fighters = groupAndSortFighters(fighters);
        setRoster(fighters);
    
        // Calculate stats right after fetching the roster
        calculateStats(fighters);
        setLoadingStatus('');
      } catch (error) {
        console.error(`Error fetching roster fighters:`, error);
        setLoadingStatus(''); // Clear status on error
      }
    };
    
    



    useEffect(() => {
      fetchRoster();
    }, [eventId]);
    
    
  

    const calculateAge = (dob: string): number => {
        const [month, day, year] = dob.split('/').map(num => parseInt(num, 10));
        const birthDate = new Date(year, month - 1, day); // month is 0-indexed
        const today = new Date();
    
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDifference = today.getMonth() - birthDate.getMonth();
    
        if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < birthDate.getDate())) {
            age--; // Decrease age if birth date hasn't occurred this year yet
        }
    
        return age;
    };
    





    const getFighterDetails = async (pmt_id: string): Promise<{ win: number, loss: number }> => {
      try {    
          const docRef = doc(db, 'profiles', pmt_id);
          const docSnapshot = await getDoc(docRef);
          
          if (docSnapshot.exists()) {
              const data = docSnapshot.data();
              console.log(`Checking Fighters collection for pmt_id: ${pmt_id}`);

              if (data) {
                  console.log(`[Fighters DB] Found fighter with pmt_id ${pmt_id}:`, data);
                  return {
                      win: data.win || 0,
                      loss: data.loss || 0
                  };
              } else {
                  console.log(`Data is undefined for fighter with pmt_id ${pmt_id}`);
              }
          } else {
              console.log(`No fighter found with pmt_id ${pmt_id}`);
          }
      } catch (error) {
          console.error("Error fetching fighter details:", error);
      }
      return { win: 0, loss: 0 };
  }
  

  const convertToWeighinFighter = async (rosterFighter: RosterFighter): Promise<WeighinFighter> => {
      const age = calculateAge(rosterFighter.dob);
      const [month, day, year] = rosterFighter.dob.split('/');
      const pmt_id = `${rosterFighter.first.toUpperCase()}${rosterFighter.last.toUpperCase()}${month}${day}${year}`;
      const fighterDetails = await getFighterDetails(pmt_id);
  
      return {
          pmt_id: pmt_id,
          first: rosterFighter.first,
          last: rosterFighter.last,
          gym: rosterFighter.gym,
          gender: rosterFighter.gender,
          weightclass: rosterFighter.weightclass,
          weight: 0,
          ...fighterDetails,
          age: age,
          dob: rosterFighter.dob
      };
  };
    

  const makeWeighins = async () => {
    console.log("Initiating the makeWeighins function...");
    
    if (!roster || roster.length === 0) {
        console.error("Roster data is empty or not available");
        return;
    }
    
    const batch = writeBatch(db);
    
    for (const fighter of roster) {
      console.log(`Converting fighter ${fighter.first} ${fighter.last} to WeighinFighter...`);
      const weighinFighter = await convertToWeighinFighter(fighter);
      console.log(`[Converted Data]`, weighinFighter);  // Logs the converted weighinFighter
  
          
        const docRef = doc(db, 'events', eventId, 'weighins', weighinFighter.pmt_id);
        console.log(`Setting data for fighter with pmt_id: ${weighinFighter.pmt_id} in Firestore...`);
        batch.set(docRef, weighinFighter);
    }

    try {
        await batch.commit();
        console.log('Weigh-in data saved successfully.');
    } catch (error) {
        console.error('Error saving weigh-in data:', error);
    }
};


const getColorByCount = (count: number): string => {
  if (count === 1) {
    return 'rgba(173, 97, 0, 0.3)'; 
  } else if (count === 2) {
    return 'rgba(125, 225, 102, 0.3)'; 
  } else if (count === 3) {
    return 'rgba(143, 171, 4, 0.3)'; 
  } else if (count === 4) {
    return 'rgba(164, 187, 48, 0.3)'; 
  } else if (count === 5) {
    return 'rgba(0, 100, 0, 0.3)'; 
  } else {
    return 'rgba(216, 252, 33, 0.3)'; 
  }
};


    
return (
  <View style={{ flex: 1, padding: 10 }}>
      {loadingStatus ? (
          // Loading screen with status message
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
              <Text style={{ fontSize: 20, marginBottom: 10 }}>Loading...</Text>
              <Text>{loadingStatus}</Text>
          </View>
      ) : (
          <>
              <View style={{
                  flexDirection: 'row', 
                  justifyContent: 'space-evenly', 
                  alignItems: 'center', 
                  marginBottom: 20 
              }}>
                  <Button title="Make Weigh-ins" onPress={makeWeighins} />
                  <Button title="Add Fighter" onPress={addFighter} />
                  <Button title="Analyze" onPress={() => {
                      calculateStats(roster);
                      setIsModalVisible(true);
                  }} />
              </View>

              <Modal
                  animationType="slide"
                  transparent={true}
                  visible={addFighterModalVisible}
                  onRequestClose={() => setAddFighterModalVisible(false)}
              >
        <View style={{ margin: 20, backgroundColor: 'white', borderRadius: 20, padding: 35, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 4, elevation: 5 }}>
          <TextInput
            style={{ height: 40, borderColor: 'gray', borderWidth: 1, marginBottom: 10, width: 200, padding: 10 }}
            onChangeText={setSearchPmtId}
            value={searchPmtId}
            placeholder="Enter PMT ID"
          />
          <Button title="Search and Add Fighter" onPress={handleSearch} />
        </View>
      </Modal>


<Modal
  animationType="slide"
  transparent={false}
  visible={isModalVisible}
  onRequestClose={() => setIsModalVisible(false)}
>
  <ScrollView style={{ marginTop: 22 }}>
    <View style={{ alignItems: 'center' }}>
      <View>
        <Text style={{ textAlign: 'center' }}>Total Fighters: {stats?.totalFighters}</Text>
        <Text style={{ textAlign: 'center' }}>Average Age: {stats?.averageAge.toFixed(2)}</Text>
        <Text style={{ textAlign: 'center' }}>Boys: {stats?.boys}</Text>
        <Text style={{ textAlign: 'center' }}>Girls: {stats?.girls}</Text>
        <Text style={{ textAlign: 'center' }}>Men: {stats?.men}</Text>
        <Text style={{ textAlign: 'center' }}>Women: {stats?.women}</Text>
        <Text style={{ textAlign: 'center' }}>Weight Class Counts:</Text>
        {Object.entries(stats?.weightClassCounts || {}).map(([weightclass, count]) => (
          <View key={weightclass} style={{ alignItems: 'center' }}>
            <Text style={{ textAlign: 'center' }}>{`${weightclass}: ${count}`}</Text>
            {stats?.fightersByWeightClass[weightclass]?.map((fighter: RosterFighter, index: number) => (
              <Text key={index} style={{ textAlign: 'center' }}>{`${fighter.first} ${fighter.last}`}</Text>
            ))}
          </View>
        ))}

        <Button title="Close" onPress={() => setIsModalVisible(false)} />
      </View>
    </View>
  </ScrollView>
</Modal>

<FlatList
    data={roster}
    keyExtractor={(item) => item.id || 'defaultId'}
    renderItem={({ item }) => {
        const categoryCount = stats?.weightClassCounts[item.weightclass] || 0;
        const backgroundColor = getColorByCount(categoryCount);
        const totalFights = item.win + item.loss;

        console.log(`Rendering item for fighter with pmt_id: ${item.pmt_id}`);

        if (!item.pmt_id) {
            console.log('No pmt_id available for this fighter:', item);
            return (
                <TouchableOpacity onPress={() => onFighterPress(item)}>
                    <View style={{ /* styles */ }}>
                        <Text>No PMT ID</Text>
                        {/* Rest of the view for fighters without a pmt_id */}
                    </View>
                </TouchableOpacity>
            );
        }

        try {
            
          
          return (
                <TouchableOpacity onPress={() => onFighterPress(item)}>
                    <View style={{
                        padding: 10,
                        borderBottomWidth: 1,
                        backgroundColor: backgroundColor,
                        alignItems: 'center',
                        position: 'relative',
                    }}>
                        <View style={{ flexDirection: 'row', justifyContent: 'flex-start', width: '100%' }}>
                            
                        {item.pmt_id && (
                            <QRCode
                                value={item.pmt_id}
                                size={60}
                                color="black"
                                backgroundColor="white"
                            />
                        )}
                            
                            <View style={{ padding: 5}}>
                            <Text style={{ fontWeight: 'bold', fontSize: 18, textAlign: 'left' }}>{`${item.first} ${item.last}`}</Text>
                                                            <Text style={{ textAlign: 'left' }}>{`${item.gym} ${item.weightclass} ${item.gender} ${calculateAge(item.dob)}`}</Text>
                                <Text style={{ textAlign: 'left' }}>{`${item.win}-${item.loss}`}</Text>
                            </View>

                            <Text style={{
                                position: 'absolute',
                                right: 10,
                                fontSize: 30,
                                color: 'rgba(0, 0, 0, 0.4)',
                            }}>
                                {totalFights}
                            </Text>
                        </View>
                      
                    </View>
                </TouchableOpacity>
            );


        } catch (error) {
            console.error(`Error rendering QR code for pmt_id ${item.pmt_id}:`, error);
            return (
                <View style={{ /* styles */ }}>
                    <Text>Error rendering QR Code</Text>
                </View>
            );
        } finally {
            console.log(`Finished rendering item for fighter with ID: ${item.id}`);
        }
    }}
    onScroll={hideMenu}
/>

     {showMenu && (
        <Modal
          animationType="slide"
          transparent={true}
          visible={showMenu}
          onRequestClose={hideMenu}
        >
          <View style={{ margin: 20, backgroundColor: 'white', borderRadius: 20, padding: 35, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 4, elevation: 5 }}>
            <Text style={{ marginBottom: 15, textAlign: 'center' }}>{selectedFighter ? `${selectedFighter.first} ${selectedFighter.last}` : ''}</Text>
            <Button title="Send Message" onPress={sendMessage} />
            <Button title="Delete" onPress={handleDelete} />
            <Button title="Close" onPress={hideMenu} />
          </View>
          </Modal>
                )}
            </>
        )}
    </View>
);



};
  


  export default RosterScreen;
  