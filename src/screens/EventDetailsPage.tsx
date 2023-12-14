import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { RouteProp, useNavigation } from '@react-navigation/native'; 
import { RootStackParamList } from '../navigation/AppNavigator';
import { NavigationProp } from '@react-navigation/native';
type EventDetailScreenRouteProp = RouteProp<RootStackParamList, 'EventDetails'>;

interface Props {
  route: EventDetailScreenRouteProp;
}


const formatDate = (dateObj: any) => {
  if (dateObj.seconds) {
    // Assuming it's a Firebase Timestamp
    const date = new Date(dateObj.seconds * 1000);
    return date.toLocaleDateString("en-US"); // Format it as you need
  }
  return dateObj; 
};

const EventDetailScreen: React.FC<Props> = ({ route }) => {
  const { event } = route.params;
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  return (
    <View style={{ flex: 1, padding: 20, alignItems: 'center', justifyContent: 'center' }}>

    <Text style={{ fontSize: 24, fontWeight: 'bold', textAlign: 'center' }}>{event.event_name}</Text>
    <Text style={{ textAlign: 'center' }}>{event.venue_name}</Text>
    <Text style={{ textAlign: 'center' }}>{event.event_name}</Text>
    <Text style={{ textAlign: 'center' }}>Weigh-ins: {event['Day Before Weigh ins']}</Text>
    <Text style={{ textAlign: 'center' }}>Weight Location: {event['address']}</Text>
    <Text style={{ textAlign: 'center' }}>Info: {event['Venue_location']}</Text>

    <Text style={{ textAlign: 'center' }}>Date: {typeof event['Competition Date'] === 'string' ? event['Competition Date'] : formatDate(event['Competition Date'])}</Text>
       
    <Text style={{ textAlign: 'center' }}>Rules Meeting: {event['Rules Meeting']}</Text>
    <Text style={{ textAlign: 'center' }}>Bouts Start: {event['Bouts Start']}</Text>
    <Text style={{ textAlign: 'center' }}>Number of Mats: {event['Number Mats']}</Text>

      <TouchableOpacity 
        style={{ marginTop: 20, padding: 10, backgroundColor: '#2196F3', borderRadius: 5 }}
        onPress={() => navigation.navigate('Roster', { eventId: event.id })
      }
      >
        <Text style={{ color: 'white' }}>Roster</Text>
      </TouchableOpacity>
      <TouchableOpacity 
        style={{ marginTop: 20, padding: 10, backgroundColor: '#2196F3', borderRadius: 5 }}
        onPress={() => navigation.navigate('Weighins', { eventId: event.id })
      }
      >
        <Text style={{ color: 'white' }}>Weighins</Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={{ marginTop: 20, padding: 10, backgroundColor: '#2196F3', borderRadius: 5 }}
        onPress={() => navigation.navigate('Matches', { eventId: event.id })
      }
      >
        <Text style={{ color: 'white' }}>Matches</Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={{ marginTop: 20, padding: 10, backgroundColor: '#2196F3', borderRadius: 5 }}
        onPress={() => navigation.navigate('Officials', { eventId: event.id })}
      >
        <Text style={{ color: 'white' }}>Officials</Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={{ marginTop: 20, padding: 10, backgroundColor: '#2196F3', borderRadius: 5 }}
        onPress={() => navigation.navigate('Results', { eventId: event.id })}
      >
        <Text style={{ color: 'white' }}>Results</Text>
      </TouchableOpacity>

    </View>

  );
};


export default EventDetailScreen;
