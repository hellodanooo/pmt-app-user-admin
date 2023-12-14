import React, { useState, useEffect } from 'react';
import { TextInput, View, FlatList, Text, TouchableOpacity, Modal } from 'react-native';
import { getFirestore, collection, getDocs, query, where, doc, updateDoc, deleteDoc, writeBatch, startAfter } from "firebase/firestore";
import { app } from '../../database/firebaseDb';
import globalStyles from '../utils/globalStyles';
import { WeighinFighter, ResultsFighter, FighterProfile, Event, ResultBout, GymProfile } from '../../types';
import { Alert } from 'react-native';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import { getStorage, ref, uploadBytes } from 'firebase/storage';
import { launchImageLibrary, ImagePickerResponse, ImageLibraryOptions } from 'react-native-image-picker';


const GymProfiles = () => {
  // Explicitly define the type for the useState hook
  const [gyms, setGyms] = useState<GymProfile[]>([]); // Now gyms is an array of GymProfile
  const [selectedGym, setSelectedGym] = useState<GymProfile | null>(null);
  const [gymResults, setGymResults] = useState<Array<any>>([]); // Holds the fetched results
  const [showAllGyms, setShowAllGyms] = useState(false); // false will show gyms with >3 wins
  const [sortByWins, setSortByWins] = useState(true); // true will sort by wins, false will sort alphabetically
  const [progressMessages, setProgressMessages] = useState<string[]>([]);
  const [isCalculating, setIsCalculating] = useState<boolean>(false);



  useEffect(() => {
    const db = getFirestore(app);

    const fetchGymProfiles = async () => {
      const gymProfilesRef = collection(db, 'gym_profiles');
      const q = query(gymProfilesRef, where("win", ">", showAllGyms ? 0 : 3));
      const gymProfilesSnapshot = await getDocs(q);
      // Map the documents to GymProfile objects
      const gymProfiles: GymProfile[] = gymProfilesSnapshot.docs.map(doc => ({ ...doc.data() as GymProfile, id: doc.id }));

      if (sortByWins) {
        gymProfiles.sort((a, b) => b.win - a.win);
      } else {
        gymProfiles.sort((a, b) => a.gym.localeCompare(b.gym));
      }

      setGyms(gymProfiles);
    };
    fetchGymProfiles();
  }, [showAllGyms, sortByWins]);


  const findResults = async (item: GymProfile) => {

    console.log("Setting selected gym: ", item);
    setSelectedGym(item);

    const db = getFirestore();
    const gymName = item.gym;
    let resultsArray: Array<any> = []; // This will hold the results

    try {
      const eventsRef = collection(db, 'events');
      const eventsSnapshot = await getDocs(eventsRef);

      for (const eventDoc of eventsSnapshot.docs) {
        const eventName = eventDoc.data().event_name;
        const resultsRef = collection(db, 'events', eventDoc.id, 'results');

        // Query for results where the fighter is from the gym of interest
        const fighter1Query = query(resultsRef, where("fighter1.gym", "==", gymName));
        const fighter2Query = query(resultsRef, where("fighter2.gym", "==", gymName));

        // Process fighter1 and fighter2 results
        const fighter1Results = await getDocs(fighter1Query);
        const fighter2Results = await getDocs(fighter2Query);

        const processResults = (resultsSnapshot: any, fighterKey: string, eventId: string) => {
          resultsSnapshot.forEach((resultDoc: any) => {
            const resultData = resultDoc.data();
            const fighterData: ResultsFighter = {
              ...resultData[fighterKey],
              event: eventName, // Assuming you have eventName from the context
              docId: resultDoc.id,
              eventId: eventId, 
              fighterNumber: fighterKey === "fighter1" ? '1' : '2', // Store if it's fighter1 or fighter2
              // Add other fields as needed
            };

            if (fighterData && fighterData.gym === gymName) {
              resultsArray.push(fighterData);
            }
          });
        };

        // When calling processResults, pass the event document ID as well
        processResults(fighter1Results, "fighter1", eventDoc.id);
        processResults(fighter2Results, "fighter2", eventDoc.id);
      }

      console.log(resultsArray); // Or handle the array as needed, e.g., setting state
      setGymResults(resultsArray); // Update state with fetched results
      setSelectedGym(item);

    } catch (error) {
      console.error('An error occurred while finding results:', error);
    }
  };


  const deleteGymProfile = async (gymId: string) => {
    const db = getFirestore(app);
    const gymProfileRef = doc(db, 'gym_profiles', gymId);

    try {
      await deleteDoc(gymProfileRef);
      alert('Gym profile deleted successfully');

      // Update the gyms state to reflect the deletion
      setGyms(previousGyms => previousGyms.filter(gym => gym.id !== gymId));
    } catch (error) {
      console.error('Error deleting gym profile:', error);
      alert('Error deleting gym profile');
    }
  };

  const calculateAge = (dob: string, pmt_id: string, bout_id: string, event: string,  invalidDates: { details: Array<{ dob: string , pmt_id: string, bout_id: string, event: string }> }): number => {
    // Regular expression to check if the format is month/day/year
    const dateFormatRegex = /^\d{1,2}\/\d{1,2}\/\d{4}$/;
  
    if (!dateFormatRegex.test(dob)) {
      invalidDates.details.push({ dob, pmt_id, event, bout_id});
      return NaN;
    }
  
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

  type InvalidDateDetail = {
    dob: string;
    event: string;
    pmt_id: string;
    bout_id: string;
  };

  const calculateGymRecords = async () => {
    setIsCalculating(true);
    setProgressMessages(["Starting calculation..."]);
  
    const db = getFirestore(app);
    const gymProfilesRef = collection(db, 'gym_profiles');
    const gymProfilesSnapshot = await getDocs(gymProfilesRef);
    const existingGymProfiles: { [key: string]: GymProfile } = {};
  
    let invalidDates: { details: InvalidDateDetail[] } = { details: [] };
            let invalidDateCounter = { count: 0 };

    // Populate existingGymProfiles with data from Firebase
    gymProfilesSnapshot.docs.forEach(doc => {
      const gymProfile = doc.data() as GymProfile;
      existingGymProfiles[gymProfile.gym] = gymProfile;
    });
  
    // Log the number of original gym profiles
    setProgressMessages(prevMessages => [...prevMessages, `Number of Original Profiles: ${gymProfilesSnapshot.docs.length}`]);
  
    const gymProfiles: { [key: string]: GymProfile } = { ...existingGymProfiles };
  
    Object.keys(existingGymProfiles).forEach(gymName => {
      gymProfiles[gymName] = {
        ...gymProfiles[gymName],
        win: 0,
        loss: 0,
        total: 0,
        boysWin: 0,
        boysLoss: 0,
        girlsWin: 0,
        girlsLoss: 0,
        menWin: 0,
        menLoss: 0,
        womanWin: 0,
        womanLoss: 0,
      };
    });

    try {
      const eventsRef = collection(db, 'events');
      const eventsSnapshot = await getDocs(eventsRef);
  
      for (const eventDoc of eventsSnapshot.docs) {
        let uniqueGymsCounter = 0; // Counter for unique gyms in the event
        let under18Counter = 0; // Counter for fighters under 18
  
        setProgressMessages(prevMessages => [...prevMessages, "Processing event: " + eventDoc.id]);
        const resultsRef = collection(db, 'events', eventDoc.id, 'results');
        let resultsSnapshot = await getDocs(resultsRef);
  
        while (resultsSnapshot.docs.length > 0) {
          const lastDoc = resultsSnapshot.docs[resultsSnapshot.docs.length - 1];
          
          resultsSnapshot.docs.forEach((resultDoc) => {
            const boutData = resultDoc.data() as ResultBout;
            const { fighter1, fighter2 } = boutData;
            
            [fighter1, fighter2].forEach((fighter) => {
              const gym = fighter.gym;
              const bout_id = resultDoc.id; // Assuming bout_id is the document ID of the result
              const age = calculateAge(fighter.dob, fighter.pmt_id, bout_id, eventDoc.id, invalidDates);

              const isMale = fighter.gender.toLowerCase() === 'male';
              const isFemale = !isMale;
              const wins = fighter.result.toLowerCase() === 'w' ? 1 : 0;
              const losses = fighter.result.toLowerCase() === 'l' ? 1 : 0;
              const isYouth = age < 18;
          
              if (isYouth) under18Counter++; // Increment under 18 counter
          
              if (!gymProfiles[gym]) {
                console.log(`Creating new profile for gym: ${gym}`);
                uniqueGymsCounter++; // Increment unique gyms counter
                gymProfiles[gym] = {
                  gym,
                  win: 0,
                  loss: 0,
                  total: 0,
                  boysWin: 0,
                  boysLoss: 0,
                  girlsWin: 0,
                  girlsLoss: 0,
                  menWin: 0,
                  menLoss: 0,
                  womanWin: 0,
                  womanLoss: 0,
                  logo: "",
                  address: "",
                  webpage: "",
                  city: "",
                  state: "",
                };
              } 
          
              // Accumulate the wins and losses
              gymProfiles[gym].win += wins;
              gymProfiles[gym].loss += losses;
              gymProfiles[gym].total = gymProfiles[gym].win + gymProfiles[gym].loss;
          
              // Update counts based on age and gender
              if (isYouth) {
                if (isMale) {
                  gymProfiles[gym].boysWin += wins;
                  gymProfiles[gym].boysLoss += losses;
                } else if (isFemale) {
                  gymProfiles[gym].girlsWin += wins;
                  gymProfiles[gym].girlsLoss += losses;
                }
              } else {
                if (isMale) {
                  gymProfiles[gym].menWin += wins;
                  gymProfiles[gym].menLoss += losses;
                } else if (isFemale) {
                  gymProfiles[gym].womanWin += wins;
                  gymProfiles[gym].womanLoss += losses;
                }
              }
            });
          });
  
          const nextQuery = query(resultsRef, startAfter(lastDoc));
          resultsSnapshot = await getDocs(nextQuery);
        }
  
        // Log number of unique gyms for the event
        setProgressMessages(prevMessages => [...prevMessages, `Unique Gyms for Event ${eventDoc.id}: ${uniqueGymsCounter}`]);
        // Log the number of fighters under 18 after each event
        setProgressMessages(prevMessages => [...prevMessages, `Fighters Under 18 for Event ${eventDoc.id}: ${under18Counter}`]);
      }
  

   if (invalidDates.details.length > 0) {
  console.log("Invalid date formats encountered:");
  invalidDates.details.forEach(detail => {
    console.log(`DOB: ${detail.dob}, Event: ${detail.event}, PMT ID: ${detail.pmt_id}, Bout ID: ${detail.bout_id}`);
  });
}

      const batch = writeBatch(db);
      Object.keys(gymProfiles).forEach((gymName) => {
        if (gymName && gymName !== '#VALUE!') {
          try {
            const profileRef = doc(db, 'gym_profiles', gymName);
            const profileData = gymProfiles[gymName];
    
            // If gym profile exists, update only win-loss fields
            if (existingGymProfiles[gymName]) {
              batch.update(profileRef, {
                win: profileData.win,
                loss: profileData.loss,
                boysWin: profileData.boysWin,
                boysLoss: profileData.boysLoss,
                girlsWin: profileData.girlsWin,
                girlsLoss: profileData.girlsLoss,
                menWin: profileData.menWin,
                menLoss: profileData.menLoss,
                womanWin: profileData.womanWin,
                womanLoss: profileData.womanLoss,
                total: profileData.total,
                // Add other fields that need to be updated
              });
            } else {
              // If gym profile doesn't exist, set the entire profile
              batch.set(profileRef, profileData, { merge: true });
            }
          } catch (error) {
            console.error('An error occurred setting gym profile:', gymName, error);
          }
        }
      });
    
      await batch.commit();
      setProgressMessages(prevMessages => [...prevMessages, "Calculation completed."]);

  } catch (error) {
    console.error('An unexpected error occurred:', error);
    setProgressMessages(prevMessages => [...prevMessages, "Error: " + (error as any).message]);
  }

  setIsCalculating(false);
};

  return (
    <View style={globalStyles.gymScreen}>

      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>

        <TouchableOpacity onPress={calculateGymRecords} style={globalStyles.calcButton}>
          <Text style={globalStyles.recordButtonText}>Calc Gym Profiles</Text>
        </TouchableOpacity>
        <View>
          <TouchableOpacity
            onPress={() => setShowAllGyms(!showAllGyms)} // Toggle the win filter
            style={globalStyles.button}
          >
            <Text>{showAllGyms ? 'Show Top Gyms' : 'Display All'}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setSortByWins(!sortByWins)} // Toggle the sort order
            style={globalStyles.button}
          >
            <Text>{sortByWins ? 'Sort Alphabetically' : 'Sort by Wins'}</Text>
          </TouchableOpacity>
        </View>
      </View>
      <FlatList
        data={gyms}
        keyExtractor={(item, index) => item.id || `gym-${index}`} // Fallback to `gym-${index}` if `id` is undefined
        renderItem={({ item }) => (
          <View style={globalStyles.listItem}>
            <TouchableOpacity
              onPress={() => findResults(item)}
              style={globalStyles.listItemTouchable}
              activeOpacity={0.6}
            >
              <Text style={globalStyles.gymNameText}>
                {item.gym}
              </Text>
              <Text style={globalStyles.listItemText}>
                Total: ({item.win}-{item.loss}) Men: ({item.menWin}-{item.menLoss}) Boys: ({item.boysWin}-{item.boysLoss})
              </Text>
              <Text style={globalStyles.listItemText}>
                Address: {item.address ? '✅' : '❌'}
                Logo: {item.logo ? '✅' : '❌'}
                Website: {item.webpage ? '✅' : '❌'}
              </Text>
            </TouchableOpacity>
          </View>
        )}
      />

      {selectedGym && (
        <GymModal
          gym={selectedGym}
          onClose={() => setSelectedGym(null)}
          onDelete={deleteGymProfile}
          setSelectedGym={setSelectedGym} // Pass the function here
          results={gymResults}
        />
      )}

      {isCalculating && (
        <Modal
          animationType="slide"
          transparent={true}
          visible={isCalculating}
          onRequestClose={() => setIsCalculating(false)}
        >
          <View style={globalStyles.modalContainer}>
            <View style={globalStyles.modalContent}>
              <Text style={globalStyles.modalTitle}>Calculation Progress</Text>
              {progressMessages.map((message, index) => (
                <Text key={index}>{message}</Text>
              ))}
              <TouchableOpacity style={globalStyles.closeButton} onPress={() => setIsCalculating(false)}>
                <Text style={globalStyles.closeButtonText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}

    </View>
  );

};

interface GymModalProps {
  gym: GymProfile;
  onClose: () => void;
  onDelete: (gymId: string) => void;
  setSelectedGym: React.Dispatch<React.SetStateAction<GymProfile | null>>;
  results: ResultsFighter[];
}

const GymModal = ({ gym, onClose, onDelete, setSelectedGym, results }: GymModalProps) => {

  const [editAddress, setEditAddress] = useState('');
  const [editGymName, setEditGymName] = useState('');
  const [editWebsite, setEditWebsite] = useState('');

 const handleSelectFile = () => {
    const options: ImageLibraryOptions = {
      mediaType: 'photo',
    };

    launchImageLibrary(options, (response: ImagePickerResponse) => {
      if (response.didCancel) {
        console.log('User cancelled image picker');
      } else if (response.errorCode) {
        console.log('ImagePicker Error: ', response.errorMessage);
      } else {
        uploadImageToFirebase(response.assets);
      }
    });
    

  };
  
const uploadImageToFirebase = (assets: ImagePickerResponse['assets']) => {
  // Check if assets array is defined and not empty
  if (!assets || assets.length === 0) {
    console.error("No assets found.");
    return;
  }

  // Now you can safely access the first element
  const asset = assets[0];
  if (!asset.uri) {
    console.error("Asset URI is undefined.");
    return;
  }

  const storage = getStorage();
  const storageRef = ref(storage, `your/path/${asset.fileName}`);

  fetch(asset.uri)
    .then((res) => res.blob())
    .then((blob) => {
      uploadBytes(storageRef, blob).then((snapshot) => {
        console.log('Uploaded a blob or file!');
        // Handle the upload completion...
      });
    })
    .catch((error) => {
      console.error("Error uploading file to Firebase Storage", error);
    });
};

  
  



  useEffect(() => {
    setEditAddress(gym.address || '');
    setEditWebsite(gym.webpage || ''); // Initialize editWebsite with current webpage value
  }, [gym]);


  const handleUpdateAddress = async () => {
    const db = getFirestore(app);

    if (typeof gym.id === 'string') {
      const gymProfileRef = doc(db, 'gym_profiles', gym.id);

      try {
        await updateDoc(gymProfileRef, {
          address: editAddress,
        });
        alert('Address updated successfully');

        // Now this line should work as setSelectedGym is passed as a prop
        setSelectedGym({ ...gym, address: editAddress });
      } catch (error) {
        console.error('Error updating address:', error);
        alert('Error updating address');
      }
    }
    else {
      console.error('Gym ID is undefined or not a string');
    }
  };



  const handleUpdateGym = async (fighter: ResultsFighter, newGymName: string) => {
    const db = getFirestore(app);

    if (fighter.docId && fighter.eventId && fighter.fighterNumber) {
      const resultRef = doc(db, 'events', fighter.eventId, 'results', fighter.docId);

      try {
        await updateDoc(resultRef, {
          [`fighter${fighter.fighterNumber}.gym`]: newGymName,
        });
        alert('Gym updated successfully');
        // Optionally refresh the results list to show the updated data
      } catch (error) {
        console.error('Error updating gym:', error);
        alert('Error updating gym');
      }
    } else {
      alert('Error: No fighter document ID, event document ID, or fighter number provided.');
    }
  };


  const handleUpdateWebsite = async () => {
    const db = getFirestore(app);
  
    if (typeof gym.id === 'string') {
      const gymProfileRef = doc(db, 'gym_profiles', gym.id);
  
      try {
        await updateDoc(gymProfileRef, {
          webpage: editWebsite, // Update webpage field
        });
        alert('Website updated successfully');
        setSelectedGym({ ...gym, webpage: editWebsite }); // Update selectedGym state
      } catch (error) {
        console.error('Error updating website:', error);
        alert('Error updating website');
      }
    } else {
      console.error('Gym ID is undefined or not a string');
    }
  };
  

  const renderItem = ({ item }: { item: ResultsFighter }) => (
    <View style={globalStyles.resultItem}>
      <Text>Fighter: {item.first} {item.last}</Text>
      <TextInput
        style={globalStyles.input}
        onChangeText={text => setEditGymName(text)}
        defaultValue={item.gym}
        placeholder="Edit Gym"
      />
      <Text>Gender: {item.gender}</Text>
      <Text>Weight Class: {item.weightclass}</Text>
      <Text>Result: {item.result}</Text>
      <Text>Event: {item.event}</Text>
      {/* Button to save the updated gym name */}
      <TouchableOpacity onPress={() => handleUpdateGym(item, editGymName)}>
        <Text>Save Gym</Text>
      </TouchableOpacity>
    </View>
  );

  const confirmDelete = () => {
    Alert.alert(
      "Delete Gym",
      "Are you sure you want to delete this gym?",
      [
        {
          text: "Cancel",
          onPress: () => console.log("Cancel Pressed"),
          style: "cancel"
        },
        {
          text: "OK",
          onPress: () => {
            if (typeof gym.id === 'string') {
              onDelete(gym.id);
            } else {
              console.error('Gym ID is undefined');
            }
          }
        }
      ]
    );
  };


  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={true}
      onRequestClose={onClose}
    >
      <View style={globalStyles.modalContainer_gym}>
        <View style={globalStyles.modalContent}>
          <Text style={globalStyles.modalTitle}>{gym.gym}</Text>
          <Text>Wins: {gym.win}</Text>
          <Text>Losses: {gym.loss}</Text>
         
         
          <TextInput
            style={globalStyles.input}
            onChangeText={text => setEditAddress(text)}
            value={editAddress}
            placeholder="Address"
          />
          <TouchableOpacity
            style={globalStyles.saveButton}
            onPress={handleUpdateAddress}
          >
            <Text>Save Address</Text>
          </TouchableOpacity>
         
         
          <TextInput
  style={globalStyles.input}
  onChangeText={text => setEditWebsite(text)}
  value={editWebsite}
  placeholder="Website"
/>
<TouchableOpacity
  style={globalStyles.saveButton}
  onPress={handleUpdateWebsite}
>
  <Text>Save Website</Text>
</TouchableOpacity>



<TouchableOpacity onPress={handleSelectFile}>
      <Text>Select Logo</Text>
    </TouchableOpacity>



          <TouchableOpacity
            style={globalStyles.deleteButton}
            onPress={confirmDelete}
          >
            <Text>Delete Gym</Text>
          </TouchableOpacity>



          <FlatList
            data={results}
            renderItem={renderItem}
            keyExtractor={(item, index) => `result-${item.id || index}`} // Use item.id if available
          />

          <TouchableOpacity style={globalStyles.closeButton} onPress={onClose}>
            <Text style={globalStyles.closeButtonText}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );


  ////////// GymModal END //
};



export default GymProfiles;