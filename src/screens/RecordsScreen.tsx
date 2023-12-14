// src/screens/RecordsScreen.tsx
import React, { useState, useEffect } from 'react';
import { View, FlatList, Text, Button, Switch, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import { app } from '../../database/firebaseDb';
import { getFirestore, collection, getDocs, doc, query, where, getDoc, setDoc, writeBatch, limit, startAfter } from "firebase/firestore";
import globalStyles from '../utils/globalStyles';
import { WeighinFighter, ResultsFighter, FighterProfile, Event, ResultBout, GymProfile } from '../../types';
import { Picker } from '@react-native-picker/picker'; // If you're using react-native-picker
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import Modal from 'react-native-modal';
import { Alert } from 'react-native';


type MainScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Main'>;
type AgeCategory = 'Youth' | 'Adult' | 'All';
type GenderCategory = 'Male' | 'Female' | 'All';

const RecordsScreen = () => {
  const [fighters, setFighters] = useState<FighterProfile[]>([]);
  const [selectedFighterDetails, setSelectedFighterDetails] = useState<any[]>([]);
  const navigation = useNavigation<MainScreenNavigationProp>();
  const [isFilterModalVisible, setFilterModalVisible] = useState(false);
  const [ageFilter, setAgeFilter] = useState<'Youth' | 'Adult' | 'All'>('All');
  const [genderFilter, setGenderFilter] = useState<'Male' | 'Female' | 'All'>('All');
  const [gymFilter, setGymFilter] = useState<string | 'All'>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filteredFighters, setFilteredFighters] = useState<FighterProfile[]>([]);
  const [weightClassFilter, setWeightClassFilter] = useState<number>(0);
  const [isFilterMenuVisible, setFilterMenuVisible] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [logMessages, setLogMessages] = useState<string[]>([]);
  const [isFighterDetailsModalVisible, setIsFighterDetailsModalVisible] = useState(false);

  interface StateRankings {
    [state: string]: FighterProfile[];
  }
  const calcStateRecords = async () => {
    const db = getFirestore();
    const eventsRef = collection(db, 'events');
    const stateRankings: { [key: string]: { [key: string]: FighterProfile } } = {};

    try {
      const eventsSnapshot = await getDocs(eventsRef);
      for (const eventDoc of eventsSnapshot.docs) {
        const eventState = eventDoc.data().state as string; // Assuming 'state' is a field in each event document
        if (!stateRankings[eventState]) {
          stateRankings[eventState] = {};
        }

        const resultsRef = collection(db, 'events', eventDoc.id, 'results');
        let resultsSnapshot = await getDocs(resultsRef);

        while (resultsSnapshot.docs.length > 0) {
          const lastDoc = resultsSnapshot.docs[resultsSnapshot.docs.length - 1];

          resultsSnapshot.docs.forEach((resultDoc) => {
            const boutData = resultDoc.data() as ResultBout;
            const { fighter1, fighter2 } = boutData;

            [fighter1, fighter2].forEach((fighter) => {
              // Initialize the fighter profile if it doesn't exist
              if (!stateRankings[eventState][fighter.pmt_id]) {
                stateRankings[eventState][fighter.pmt_id] = {
                  first: fighter.first,
                  last: fighter.last,
                  gym: fighter.gym,
                  dob: fighter.dob,
                  gender: fighter.gender,
                  win: 0,
                  loss: 0,
                  dq: 0,
                  ex: 0,
                  weightclass: fighter.weightclass,
                  pmt_id: fighter.pmt_id,
                  email: '',
                  pmt_rank: 0,
                  age: fighter.age,
                  total: 0
                };
              }

              // Update the fighter profile stats
              const profile = stateRankings[eventState][fighter.pmt_id];
              switch (fighter.result.toLowerCase()) {
                case 'w':
                  profile.win++;
                  break;
                case 'l':
                  profile.loss++;
                  break;
                case 'dq':
                  profile.dq++;
                  break;
                // Add cases for other possible outcomes, if any
                default:
                  // Handle unexpected results or add a case for draws/exhibitions if needed
                  break;
              }

              // Update any additional stats as necessary
              // For example, if you keep track of total fights:
              profile.total++;
            });

          });

          const nextQuery = query(resultsRef, startAfter(lastDoc));
          resultsSnapshot = await getDocs(nextQuery);
        }
      }

      // Now we have all the fighter profiles grouped by state, we can sort them
      for (const [state, profiles] of Object.entries(stateRankings)) {
        const profilesArray = Object.values(profiles);

        // Calculate age for each fighter and update the profile
        profilesArray.forEach(profile => {
          profile.age = calculateAge(profile.dob); // or calculateAge2(profile.dob) depending on the format of dob
        });

        // Sort the profiles by wins in descending order
        const sortedProfiles = profilesArray.sort((a, b) => b.win - a.win);

        console.log(`All fighters in ${state}:`, sortedProfiles);

        // Remove any undefined data from the profiles to be saved
        const sanitizedProfiles = sortedProfiles.map(profile => {
          return JSON.parse(JSON.stringify(profile));
        });

        // Save the sanitized profiles for each state to Firestore
        const stateRankingsRef = doc(db, `states/${state}_rankings`);
        await setDoc(stateRankingsRef, { rankings: sanitizedProfiles });

        console.log(`Saved all fighters for ${state} to Firestore.`);
      }

      // ... any logic to handle the sorted rankings

    } catch (error) {
      console.error('An error occurred:', error);
    }
  };
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
  function calculateAge2(dobString: string): number {
    // Convert the dobString to a Date object
    const dob = new Date(dobString);

    // Get the current date
    const today = new Date();

    // Calculate the difference in years
    let age = today.getFullYear() - dob.getFullYear();

    // Check if the current year's birthday has occurred; if not, subtract 1 from the age
    const m = today.getMonth() - dob.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) {
      age--;
    }

    return age;
  }
  const isValidAgeCategory = (ageCategory: AgeCategory): boolean => {
    return ['Youth', 'Adult', 'All'].includes(ageCategory);
  };
  const isValidGenderCategory = (genderCategory: GenderCategory): boolean => {
    return ['Male', 'Female', 'All'].includes(genderCategory);
  };

  useEffect(() => {
    console.log("isLoading state updated:", isLoading);
    console.log("Updated log messages:", logMessages);
  }, [isLoading, logMessages]);


  useEffect(() => {
    const fetchFighters = async () => {
      const db = getFirestore(app);

      // Log database information
      console.log("Firebase App Config:", app.options);

      const fightersRef = collection(db, 'profiles');
      const q = query(fightersRef, where("win", ">", 3));

      try {
        const querySnapshot = await getDocs(q);
        const fightersArray: FighterProfile[] = querySnapshot.docs.map((doc: any) => ({ ...doc.data(), id: doc.id } as FighterProfile));
        fightersArray.sort((a, b) => b.win - a.win);
        setFighters(fightersArray);

        // Log top 3 fighters with most wins
        console.log("Top 3 Fighters with most wins:", fightersArray.slice(0, 3));

      } catch (error) {
        console.error("Error fetching fighters:", error);
      }
    };

    fetchFighters();
  }, []);
  useEffect(() => {
    console.log('Selected Fighter Details:', selectedFighterDetails);
  }, [selectedFighterDetails]);

  /////////////////////////////////// PROFILES //////////////////////////////////
  const calculateRecords = async () => {
    console.log("Starting calculation...");
    setIsLoading(true); 
    setLogMessages(['Starting calculation...']);
    

    const db = getFirestore();
    const eventsRef = collection(db, 'events');
    const resultsSummary2022: any[] = []; 
    const resultsSummary2023: any[] = []; 
    const fighterProfiles: { [key: string]: FighterProfile } = {};
  
    try {
      setLogMessages(prev => [...prev, 'Processing data...']);
      
      const eventsSnapshot = await getDocs(eventsRef);
      for (const eventDoc of eventsSnapshot.docs) {
          const eventId = eventDoc.id;
          const eventData = eventDoc.data();
          // Convert Timestamp to Date
          const eventDate = eventData['Competition Date'].toDate();

          console.log(`Processing Event ID: ${eventId}, Date: ${eventDate}`);

          const eventYear = eventDate.getFullYear();
          console.log(`Event Year: ${eventYear}`);
       
       
        const resultsRef = collection(db, 'events', eventId, 'results');
        const resultsSnapshot = await getDocs(resultsRef);
  

        resultsSnapshot.docs.forEach((resultDoc) => {
          const boutData = resultDoc.data() as ResultBout;
          const { fighter1, fighter2 } = boutData;
      
          // Assign opponent IDs
          fighter1.opponent_id = fighter2.pmt_id;
          fighter2.opponent_id = fighter1.pmt_id;
      
          if (eventYear === 2022) {
              resultsSummary2022.push(fighter1);
              resultsSummary2022.push(fighter2);
          } else if (eventYear === 2023) {
              resultsSummary2023.push(fighter1);
              resultsSummary2023.push(fighter2);
          }

  

          [fighter1, fighter2].forEach((fighter, index) => {
            const opponent = index === 0 ? fighter2 : fighter1;
            fighter.opponent_id = opponent.pmt_id;
  
            if (!fighterProfiles[fighter.pmt_id]) {
              fighterProfiles[fighter.pmt_id] = {
                  first: fighter.first,
                  last: fighter.last,
                  gym: fighter.gym,
                  dob: fighter.dob,
                  gender: fighter.gender,
                  win: 0,
                  loss: 0,
                  dq: 0,
                  ex: 0,
                  weightclass: fighter.weightclass,
                  pmt_id: fighter.pmt_id,
                  email: '',
                  pmt_rank: 0,
                  age: fighter.age,
                  total: 0,
                  
                };
              }

              const wins = fighter.result.toLowerCase() === 'w' ? 1 : 0;
              const losses = fighter.result.toLowerCase() === 'l' ? 1 : 0;
              fighterProfiles[fighter.pmt_id].win += wins;
              fighterProfiles[fighter.pmt_id].loss += losses;
            });

          });
        }
        
        console.log('First 3 fighters from summary_2022:', resultsSummary2022.slice(0, 3));
        console.log('First 3 fighters from summary_2023:', resultsSummary2023.slice(0, 3));
   console.log(`Size of resultsSummary2022: ${resultsSummary2022.length}`);
    console.log(`Size of resultsSummary2023: ${resultsSummary2023.length}`);
    setLogMessages(prev => [...prev, `Size of resultsSummary2022: ${resultsSummary2022.length}`, `Size of resultsSummary2023: ${resultsSummary2023.length}`]);



        try {
        setLogMessages(prev => [...prev, 'Saving to Bulk Results Firestore...']);
       if (resultsSummary2022.length > 0) {
    }
    if (resultsSummary2023.length > 0) {
    }

    setLogMessages(prev => [...prev, 'Saving to Bulk Results Firestore...']);

      if (resultsSummary2022.length > 0) {
        const summary2022Ref = doc(db, 'all_results', 'summary_2022');
        await setDoc(summary2022Ref, { results: resultsSummary2022 });
        setLogMessages(prev => [...prev, 'Year 1 Saved']);

    }
    if (resultsSummary2023.length > 0) {
        const summary2023Ref = doc(db, 'all_results', 'summary_2023');
        await setDoc(summary2023Ref, { results: resultsSummary2023 });
        setLogMessages(prev => [...prev, 'Year 2 Saved']);

    }
      } catch (error) {
console.log("Error saving Year Summaries ",error)
      }

      const fighterProfilesArray = Object.values(fighterProfiles);
      const sortedFighterProfiles = fighterProfilesArray.sort((a, b) => b.win - a.win);
     
      // need to verify age or errors occur
      let ageNaNCount = 0;
      for (const profile of sortedFighterProfiles) {
        if (profile.dob) {
          profile.age = calculateAge(profile.dob);
        }

        if (isNaN(profile.age)) {
          profile.age = calculateAge2(profile.dob);
        }
      }

      console.log(`Total Profiles: ${sortedFighterProfiles.length}`);
      const top3Fighters = sortedFighterProfiles.slice(0, 3);
      console.log("TOP 3 ", top3Fighters);
  
      setLogMessages(prev => [...prev, 'Saving Profiles Firestore...']);


      const batch = writeBatch(db);
      Object.keys(fighterProfiles).forEach((pmt_id) => {
        if (pmt_id && pmt_id !== '#VALUE!') {
          const profileRef = doc(db, 'profiles', pmt_id);
          batch.set(profileRef, fighterProfiles[pmt_id]);
        }
      });
      await batch.commit();

      setLogMessages(prev => [...prev, 'Saving Profiles Complete']);

      setIsLoading(false); 

  
    } catch (error) {
      console.error('An error occurred:', error);
    }
  };
  

  const fetchFighterDetails = async (pmt_id: string) => {
    console.log('Fetching Details for:', pmt_id);
    const db = getFirestore(app);
    const eventsRef = collection(db, 'events');
    const allDetails: ResultsFighter[] = [];
  



    try {
      const eventsSnapshot = await getDocs(eventsRef);
      console.log('Total Events:', eventsSnapshot.docs.length);
  
      for (const eventDoc of eventsSnapshot.docs) {
        const eventId = eventDoc.id;
        const event = eventDoc.data();
        console.log('Processing Event:', eventId, event.event_name);
  
        const resultsRef = collection(doc(db, 'events', eventId), 'results');
        const resultsSnapshot = await getDocs(resultsRef);
  
        for (const resultDoc of resultsSnapshot.docs) {
          const boutId = resultDoc.id;
          const boutData = resultDoc.data();
          console.log('Processing Bout:', boutId);
  
          const { fighter1, fighter2 } = boutData;
  
          // Check if fighter1 and fighter2 are available and process them
          [fighter1, fighter2].forEach((fighter) => {
            if (fighter && fighter.pmt_id === pmt_id) {
              const detailedFighter = { ...fighter, eventId, boutId };
              console.log('Adding details for fighter:', fighter.first, fighter.last);
              allDetails.push(detailedFighter);
            }
          });
        }
      }
  
     setSelectedFighterDetails(allDetails);
  if (allDetails.length > 0) {
    setIsFighterDetailsModalVisible(true); // Open the modal if details are found
  }
  console.log('All Details for Fighter:', pmt_id, allDetails);

    } catch (error) {
      console.error('Error fetching fighter details:', error);
    }
  };
  



  const FighterDetailsModal: React.FC = () => {
    return (
      <Modal
        isVisible={isFighterDetailsModalVisible}
        onBackdropPress={() => setIsFighterDetailsModalVisible(false)}
        onBackButtonPress={() => setIsFighterDetailsModalVisible(false)}
      >
        <View>
          <Text>Selected Fighter Details:</Text>
          {selectedFighterDetails.map((detail, index) => (
            <View key={index}>
              <Text>{`Event Name: ${detail.eventName}`}</Text>
              <Text>{`Result: ${detail.result}`}</Text>
              <Text>{`First: ${detail.first}`}</Text>
        
            </View>
          ))}
        </View>
      </Modal>
    );
  };
  



  
  
  ///////////////// FILTER //////////////////////////
  const applyFilters = (fighterList: FighterProfile[], ageFilter: AgeCategory, genderFilter: GenderCategory) => {
    // Error checks
    if (!isValidAgeCategory(ageFilter) || !isValidGenderCategory(genderFilter)) {
      console.error(`Invalid filters - Age: ${ageFilter}, Gender: ${genderFilter}`);
      return []; // Return an empty array or handle the error as appropriate
    }

    return fighterList.filter(fighter => {
      const ageCondition = (ageFilter === 'Youth' && fighter.age < 18) ||
        (ageFilter === 'Adult' && fighter.age >= 18) ||
        ageFilter === 'All';
      // Convert both sides of the comparison to the same case for a case-insensitive comparison
      const genderCondition = fighter.gender.toUpperCase() === genderFilter.toUpperCase() || genderFilter === 'All';

      return ageCondition && genderCondition;
    });
  };
  useEffect(() => {
    // Use the refactored applyFilters function
    const filteredFighters = applyFilters(fighters, ageFilter, genderFilter);

    const filteredAndSearchedFighters = filteredFighters.filter(fighter => {
      return (
        fighter.first.toLowerCase().includes(searchQuery.toLowerCase()) ||
        fighter.last.toLowerCase().includes(searchQuery.toLowerCase()) ||
        fighter.gym.toLowerCase().includes(searchQuery.toLowerCase())
      );
    });

    setFilteredFighters(filteredAndSearchedFighters);

  }, [fighters, ageFilter, genderFilter, searchQuery]);


  useEffect(() => {
    const filteredFighters = applyFilters(fighters, ageFilter, genderFilter);

    const filteredAndSearchedFighters = filteredFighters.filter(fighter => {
      return (
        fighter.first.toLowerCase().includes(searchQuery.toLowerCase()) ||
        fighter.last.toLowerCase().includes(searchQuery.toLowerCase()) ||
        fighter.gym.toLowerCase().includes(searchQuery.toLowerCase())
      );
    });

    setFilteredFighters(filteredAndSearchedFighters);

  }, [fighters, ageFilter, genderFilter, searchQuery]);

  const [isDropdownVisible, setDropdownVisible] = useState(false);


  const FilterMenu = () => (
    <View style={globalStyles.filterMenuContainer}>
      <View style={globalStyles.filterRow}>
        <Button
          title="Youth"
          onPress={() => setAgeFilter('Youth')}
          color={ageFilter === 'Youth' ? 'blue' : 'gray'}
        />
        <Button
          title="Adult"
          onPress={() => setAgeFilter('Adult')}
          color={ageFilter === 'Adult' ? 'blue' : 'gray'}
        />
        <Button
          title="All"
          onPress={() => setAgeFilter('All')}
          color={ageFilter === 'All' ? 'blue' : 'gray'}
        />
      </View>
      <View style={globalStyles.filterRow}>
        <Button
          title="Male"
          onPress={() => setGenderFilter('Male')}
          color={genderFilter === 'Male' ? 'blue' : 'gray'}
        />
        <Button
          title="Female"
          onPress={() => setGenderFilter('Female')}
          color={genderFilter === 'Female' ? 'blue' : 'gray'}
        />
        <Button
          title="All"
          onPress={() => setGenderFilter('All')}
          color={genderFilter === 'All' ? 'blue' : 'gray'}
        />
      </View>
      {/* Additional filter options can be added here */}
    </View>
  );
const confirmCalculateRecords = () => {
  Alert.alert(
    "Calculate Fighter Profiles",
    "Are you sure you want to calculate fighter profiles?",
    [
      { text: "Cancel", style: "cancel" },
      { text: "OK", onPress: () => calculateRecords() }
    ]
  );
};

  const confirmCalcStateRecords = () => {
    Alert.alert(
      "Calculate State Profiles",
      "Are you sure you want to calculate state profiles?",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "OK",
          onPress: () => calcStateRecords()
        }
      ]
    );
  };


  interface LoadingScreenProps {
    isLoading: boolean;
    logMessages: string[];
  }
  const LoadingScreen: React.FC<LoadingScreenProps> = ({ isLoading, logMessages }) => {
    if (!isLoading) return null;
  
    return (
      <View style={globalStyles.loadingContainer}>
        <Text>Loading...</Text>
        <ScrollView>
          {logMessages.map((msg, index) => (
            <Text key={index}>{msg}</Text>
          ))}
        </ScrollView>
      </View>
    );
  };


  return (
    <View style={globalStyles.container}>

      <ScrollView contentContainerStyle={globalStyles.scrollContent}>

      <FighterDetailsModal />

        <View style={globalStyles.header}>

          <TouchableOpacity onPress={() => setDropdownVisible(!isDropdownVisible)}>
            <Text style={globalStyles.showMenueText}>Show Menu</Text>
          </TouchableOpacity>

          {isDropdownVisible && (
            <View style={globalStyles.dropdownMenu}>
              <TouchableOpacity onPress={confirmCalculateRecords} style={globalStyles.calcButton}>
                <Text style={globalStyles.recordButtonText}>Calc Fighter Profiles</Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={confirmCalcStateRecords} style={globalStyles.calcButton}>
                <Text style={globalStyles.recordButtonText}>Calc State Profiles</Text>
              </TouchableOpacity>



            </View>
          )}

          <View>
            <TextInput
              onChangeText={text => setSearchQuery(text)}
              value={searchQuery}
              placeholder="Search"
            />
          </View>
          {selectedFighterDetails.length > 0 && (
            <View>
              <Text style={globalStyles.buttonText}>Selected Fighter Details:</Text>
              {selectedFighterDetails.map((detail, index) => (
                <View key={index}>
                  <Text>{`Event Name: ${detail.eventName}`}</Text>
                  <Text>{`Result: ${detail.result}`}</Text>
                  <Text>{`First: ${detail.first}`}</Text>
                </View>
              ))}
            </View>
          )}
        </View>

        <View style={globalStyles.body}>
          <FlatList
            data={filteredFighters}
            keyExtractor={(item) => item.pmt_id}
            renderItem={({ item }) => (
              <View>
                <TouchableOpacity onPress={() => fetchFighterDetails(item.pmt_id)} style={globalStyles.recordFighter} >
                  <ScrollView horizontal={true} showsHorizontalScrollIndicator={false}>
                    <View style={{ flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                      <Text style={[globalStyles.buttonText, globalStyles.fighterDetail]}>{item.first} {item.last} {item.gender} {item.age}</Text>
                      <Text style={[globalStyles.buttonText, globalStyles.fighterDetail]}>{item.gym}</Text>
                      <Text style={[globalStyles.buttonText, globalStyles.fighterDetail]}>{item.weightclass}</Text>
                      <Text style={[globalStyles.buttonText, globalStyles.fighterDetail]}>Wins: ({item.win} - {item.loss})</Text>
                    </View>
                  </ScrollView>
                </TouchableOpacity>
              </View>
            )}
          />
        </View>

      </ScrollView>

      <View style={globalStyles.fixedButtonContainer}>
        {isFilterMenuVisible && <FilterMenu />}
      </View>

      <FilterModal
        isVisible={isFilterModalVisible}
        onClose={() => setFilterModalVisible(false)}
        ageFilter={ageFilter}
        setAgeFilter={setAgeFilter}
        genderFilter={genderFilter}
        setGenderFilter={setGenderFilter}
        gymFilter={gymFilter}
        setGymFilter={setGymFilter}
        weightClassFilter={weightClassFilter} // pass the weightClassFilter state
        setWeightClassFilter={setWeightClassFilter} // pass the setWeightClassFilter state setter
      />


<LoadingScreen isLoading={isLoading} logMessages={logMessages} />

    </View>

  );

};

type FilterModalProps = {
  isVisible: boolean;
  onClose: () => void;
  ageFilter: 'Youth' | 'Adult' | 'All';
  setAgeFilter: (value: 'Youth' | 'Adult' | 'All') => void;
  genderFilter: 'Male' | 'Female' | 'All';
  setGenderFilter: (value: 'Male' | 'Female' | 'All') => void;
  gymFilter: string | 'All';
  setGymFilter: (value: string | 'All') => void;
  weightClassFilter: number;
  setWeightClassFilter: (value: number) => void;
};


const FilterModal: React.FC<FilterModalProps> = ({
  isVisible,
  onClose,
  ageFilter,
  setAgeFilter,
  genderFilter,
  setGenderFilter,
  gymFilter,
  setGymFilter,
  weightClassFilter,
  setWeightClassFilter
}) => {
  // Handler functions
  const toggleAgeFilter = (selectedAge: 'Youth' | 'Adult' | 'All') => {
    setAgeFilter(selectedAge);
  };

  const toggleGenderFilter = (selectedGender: 'Male' | 'Female' | 'All') => {
    setGenderFilter(selectedGender);
  };

  const weightClasses = Array.from({ length: 15 }, (_, i) => 60 + i * 10);

  return (
    <Modal
      isVisible={isVisible}
      onBackdropPress={onClose}
      onBackButtonPress={onClose}
      style={{ justifyContent: 'flex-end', margin: 0 }}
    >
      <View style={globalStyles.modalContainer}>
        {/* Toggle Buttons for Age Filter */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-around', padding: 10 }}>
          <Button
            title="Youth"
            onPress={() => toggleAgeFilter('Youth')}
            color={ageFilter === 'Youth' ? 'blue' : 'gray'}
          />
          <Button
            title="Adult"
            onPress={() => toggleAgeFilter('Adult')}
            color={ageFilter === 'Adult' ? 'blue' : 'gray'}
          />
          <Button
            title="All"
            onPress={() => toggleAgeFilter('All')}
            color={ageFilter === 'All' ? 'blue' : 'gray'}
          />
        </View>

        <View style={{ flexDirection: 'row', justifyContent: 'space-around', padding: 10 }}>
          <Button
            title="Male"
            onPress={() => toggleGenderFilter('Male')}
            color={genderFilter === 'Male' ? 'blue' : 'gray'}
          />
          <Button
            title="Female"
            onPress={() => toggleGenderFilter('Female')}
            color={genderFilter === 'Female' ? 'blue' : 'gray'}
          />
          <Button
            title="All"
            onPress={() => toggleGenderFilter('All')}
            color={genderFilter === 'All' ? 'blue' : 'gray'}
          />
        </View>
      </View>
    </Modal>
  );
};

export default RecordsScreen;