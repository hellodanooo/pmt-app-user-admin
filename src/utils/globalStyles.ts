// globalStyles.ts

import { StyleSheet } from 'react-native';

const globalStyles = StyleSheet.create({
  toggleButton: {
    padding: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    backgroundColor: '#f8f8f8',
  },
  toggleButtonActive: {
    backgroundColor: '#007bff',
    borderColor: '#007bff',
    color: 'white',
  },
  fixedButtonContainer: {
    position: 'absolute', // Fixed at the bottom
    bottom: 0, // Ensure it's at the very bottom
    left: 0,
    right: 0,
    padding: 20, // Safe area padding
    backgroundColor: '#007bff', // example color
    justifyContent: 'center',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#ccc',
    zIndex: 1, // Make sure it's above other elements
  },
  filterButton: {
    padding: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },

  fixedBottomMenu: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'white',
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: 'grey',
    // Add additional styling as needed
  },


  input: {
    height: 40,
    margin: 12,
    borderWidth: 1,
    padding: 10,
    backgroundColor: 'white',
    borderColor: 'gray',
    borderRadius: 4,
  },

  listItem: {
    backgroundColor: '#FFFFFF',  // A light background color for the list items
    borderBottomWidth: 1,        // A border bottom to separate items
    borderColor: '#E8E8E8',      // A light border color
    padding: 15,                 // Padding inside each list item for spacing
    flexDirection: 'row',        // Align items in a row
    justifyContent: 'center', // Centers content vertically in the container
    alignItems: 'center',       // Center items vertically
  },
  
  listItemText: {
    fontSize: 16, 
    textAlign: 'center',              
  },

  listItemTouchable: {
    width: '100%',
  },

  container: {
    flex: 1,
    paddingBottom: 70, // Add padding to account for the absolute button
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 20, // Add padding to ensure ScrollView content doesn't overlap the button
  },
  header: {
    backgroundColor: '#f2f2f2',
    padding: 10,
  },
  body: {
    backgroundColor: '#fff',
  },
  
      picker: {
        margin: 5,
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 5,
      },
      pickerItem: {
        fontSize: 16,
      },

      button: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 10,
        margin: 5,
        backgroundColor: '#eaeaea',
      },
   

   
    boutCard: {
      backgroundColor: '#fff',
      borderRadius: 10,
      padding: 15,
      marginBottom: 15,
      elevation: 3, // for Android
      shadowOffset: { width: 1, height: 1 }, // for iOS
      shadowColor: '#333',
      shadowOpacity: 0.3,
      shadowRadius: 2,
    },
    boutText: {
      fontSize: 10,
      color: '#333',
    },
    titleText: {
      fontFamily: 'Helvetica-Bold',
      fontSize: 18,
      color: '#333',
    },
    fighterList: {
      backgroundColor: '#fff',
      borderRadius: 10,
      padding: 15,
      marginBottom: 15,
    },
    clickableText: {
      color: '#007BFF', // or use a brand color
    },
    modalContainer: {
      justifyContent: 'flex-end', // Align to bottom
      margin: 0, // Remove margin to ensure it fits well in all screens
    },
    modalContent: {
      backgroundColor: 'white',
      padding: 20,
      borderRadius: 20, // Rounded corners
      maxHeight: '80%', // Limit the height of the modal
    },

    resultItem: {
      padding: 10,
      borderBottomWidth: 1,
      borderColor: '#E0E0E0',
    },
    modalContainer_gym: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'rgba(0, 0, 0, 0.5)', // Semi-transparent background
    },
 
    modalTitle: {
      fontWeight: 'bold',
      fontSize: 18,
      marginBottom: 10,
    },
    closeButton: {
      marginTop: 20,
      alignSelf: 'flex-end',
    },
    closeButtonText: {
      fontSize: 18,
      color: '#1A1A1A',
    },
   
    loadingOverlay: {
      padding: 20,
      backgroundColor: 'rgba(0,0,0,0.5)',
    },
    fighterRow: {
      flexDirection: 'row', // Align items in a horizontal row
      justifyContent: 'space-around', // Spread out the items evenly
      alignItems: 'center', // Align items vertically in the center
      paddingVertical: 10, // Add vertical padding
    },
    fighterDetail: {
      flex: 1, // Each detail will take equal space within the row
      textAlign: 'center', // Center the text
      fontSize: 10, // Increase font size for better readability
    },
    clickableElement: {
      padding: 10,
      marginVertical: 5,
      backgroundColor: '#eaeaea',
      borderRadius: 5,
    },
    buttonText: {
      fontSize: 16,
      color: '#333',
    },


    dropdownMenu: {
      backgroundColor: '#fff',
      padding: 10,
      borderRadius: 5,
      elevation: 3, // for Android
      shadowOffset: { width: 1, height: 1 }, // for iOS
      shadowColor: '#333',
      shadowOpacity: 0.3,
      shadowRadius: 2,
    },

    recordsButton: {
      backgroundColor: '#93a35a',
      padding: 10,
      borderRadius: 5,
      margin: 5,               // Add margin around buttons
      flexBasis: '48%',        // Each button takes up roughly half the container width
      shadowColor: '#000',     // Button shadow color
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
      elevation: 5,
    },
    recordButtonText: {
      fontSize: 16,
      color: '#fff',           // Adjust for better contrast with button color
      textAlign: 'center',     // Center the text horizontally
    },
    calcButton: {
      backgroundColor: '#be8018',
      padding: 5,
      borderRadius: 3,
      margin: 5,               // Add margin around buttons
      flexBasis: '48%',        // Each button takes up roughly half the container width
      shadowColor: '#000',     // Button shadow color
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
      elevation: 5,
    },

    showMenueText:  {
 fontSize: 16,
      color: '#49443a',           // Adjust for better contrast with button color
      textAlign: 'center',
    },


    filterMenuContainer: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      backgroundColor: '#fff',
      borderTopWidth: 1,
      borderColor: '#ccc',
      paddingBottom: 20,
    },
    filterRow: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      padding: 10,
    },

    recordFighter: {
      flexDirection: 'column',
       alignItems: 'center',
        justifyContent: 'center',
        padding: 10,
        borderBottomWidth: 1,
        borderColor: '#E0E0E0',

    },
 
deleteButton: {
backgroundColor: '#b8182b',
padding: 10,
borderRadius: 5,
// Centering the button
alignSelf: 'center',
},

saveButton: {
  backgroundColor: '#fdd60b',
  padding: 10,
  borderRadius: 5,
  alignSelf: 'center',

},

gymScreen: {
  flexDirection: 'column',

},
gymHeader: {
height: '15%',
},

gymNameText: {
  textAlign: 'center',
  fontSize: 20, 
  backgroundColor: 'black',
  color: 'white'
},

loadingContainer: {
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: 'rgba(0, 0, 0, 0.5)',
  justifyContent: 'center',
  alignItems: 'center',
},

itemContainer: {
  padding: 10,
  borderBottomWidth: 1,
},
nameContainer: {
  alignItems: 'center',
  marginBottom: 10,
},
nameText: {
  fontSize: 18,
  fontWeight: 'bold',
},
detailsContainer: {
  alignItems: 'center',
  marginBottom: 10,
},
detailText: {
  fontSize: 16,
},
weightInput: {
  fontSize: 20,
  padding: 10,
  borderWidth: 1,
  borderRadius: 5,
  borderColor: 'gray',
  backgroundColor: '#f2f2f2',
  marginBottom: 10,
  textAlign: 'center',
},

    
});

export default globalStyles;
