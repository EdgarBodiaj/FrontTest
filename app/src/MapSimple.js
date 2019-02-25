import React, {Component} from 'react';
import {StyleSheet, TouchableOpacity, View, Picker, Text, Platform} from 'react-native';
import MapView, { PROVIDER_GOOGLE }  from 'react-native-maps';
import Stops from './Stops'
import POIS from './POIS'

export default class MapSimple extends Component {

    constructor(props){
      super(props) 
    }

    render() {
      return (
      <View style={styles.containerP}>
      <View style={styles.mapContainer}>
       <MapView
         provider={PROVIDER_GOOGLE}
         style={styles.map}
         onMapReady={this.ready}
         initialRegion={{
           latitude: 52.944351,
           longitude: -1.190312,
           latitudeDelta: 0.020,
           longitudeDelta: 0.0121,
         }}
       >
        <Stops/>
        <POIS />
       </MapView>
      </View>
    </View>
      );
    }
  }
  
  const styles = StyleSheet.create({
    mapContainer: {
      flex: 2
    },
    containerP:{
      flex: 1,
      flexDirection: 'column',
      justifyContent: 'flex-start',
      alignItems: 'stretch',
      alignSelf: 'stretch'
    },
    containerL:{
      flex: 1,
      flexDirection: 'row',
      justifyContent: 'flex-start',
      alignItems: 'stretch',
    },
    map: {
      ...StyleSheet.absoluteFillObject,
    },
    picker:{
      flex:1
    },
    tRow:{
      top:0,
      left:0,
      right:0,
      left:0,
      flex: 3,
      flexDirection: 'row',
      justifyContent: 'center',
    },
    button:{
      flex:1,
      backgroundColor: '#add8e6',
      borderColor: 'black',
      borderWidth: 1
    },
    text:{
      fontSize: 14,
      fontWeight: 'bold',
      alignSelf: 'center',
      color: 'white',
      
    }
  });
  