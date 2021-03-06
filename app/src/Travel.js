import React, {Component} from 'react'
import { StyleSheet, View, AsyncStorage, ScrollView, Text } from 'react-native'
import MapView, { PROVIDER_GOOGLE, Polyline, Marker }  from 'react-native-maps'
import HTML from 'react-native-render-html'
import { mapStyle } from './components/Requests'
import Selector from './components/Selector'
import Geolocation from 'react-native-geolocation-service'
import { Overlay } from 'react-native-elements'
import Axios from 'axios';
import AppMan from './components/NotifMan'
import LocMan from './components/BackgroundService'
import {Log} from './Logger.js'

var PushNotification = require('react-native-push-notification');

var globRef = {}
var globalFollow = true
var globalOverlay = false
var globalClean = []

function globalShow(item){
  let temp = item
    var split = temp.split("<br>")

    var clean = []
    split.map(
        (item) => {
            switch (String(item).substr(0,4)){
                case "":
                break
                default:
                    clean.push(item)
                break
            }
        }
    )
    globalClean = clean
}

export default class Travel extends Component {

    constructor(props){
      super(props)
      this.state ={
        route: {},
        points: [],
        currentPos: {},
        Settings: {},
        VisiblePois: [],
        loaded: false,
        showPOI: false,
        showList: false,
        clean: [],
        polyOptsBus:['#00ff00' ,
                     '#0000ff' ,
                     '#000000' ,
                     '#fff000' ]
      }
      this.getFacticles = this.getFacticles.bind(this)
      this.showItem = this.showItem.bind(this)
    }

    viewPOI() {
      this.mView.animateCamera({center:this.state.currentPos, zoom: 17})
    }

    showItem(item){
      let temp = item.description
        var split = temp.split("<br>")

        var clean = []
        split.map(
            (item) => {
                switch (String(item).substr(0,4)){
                    case "":
                    break
                    default:
                        clean.push(item)
                    break
                }
            }
        )
        this.setState({
            clean: clean,
            showPOI: true
        })
    }

    getLoc(){
      Geolocation.getCurrentPosition(
        (position) => {
            this.setState({
              currentPos: {latitude: position.coords.latitude, longitude: position.coords.longitude}
            });
            if (globalFollow) {
              this.viewPOI();
            }
            AsyncStorage.getItem('Setting', (err,res) => {
              let obj = JSON.parse(res); this.setState({Settings: obj});
            })
            .catch(err => Log.error(err))
            AsyncStorage.getItem('VisPOIS', (err,res) => {
              if(JSON.parse(res) !== this.state.VisiblePois){
                this.setState({VisiblePois: JSON.parse(res)})
              }
            })
            .catch(err => Log.error(err))
            AppMan.setRate(this.state.Settings.NotifRate)
            //Check if facticles are turned on
            if(this.state.Settings.Facticle)
              AppMan.state.facticles.map( (item) => {
              //Make sure that only the facticle categories that the user selected show up
              if(this.state.Settings.Filter.includes(item.category)){
                //If a facticle is visible, add it to the list of visible POIS
                let vis = AppMan.checkDist(position.coords, item)
                if(vis){
                  if(!this.state.VisiblePois.includes(item) ){
                    this.state.VisiblePois.push(
                      item
                    )
                    this.mView.animateCamera({center:{latitude:item.latitude, longitude: item.longitude }, zoom: 17})

                    AsyncStorage.setItem('VisPOIS', JSON.stringify(this.state.VisiblePois))
                  }
                }
              }
              })
            if(this.state.Settings.Direct){
              AppMan.state.journey.changes.map( (item, i) => {
                  if(!item.hasOwnProperty('seen')){
                    let dir = item
                    let loc = AppMan.state.journey.route[i + 1][0]
                    let temp = Object.assign(dir, loc)
                    let seen = AppMan.checkDist(position.coords, temp)

                    if(seen){
                      item = Object.assign(item, {seen:false})
                    }
                  }
              })
            }


        },
        (error) => {
            // See error code charts below.
            Log.error(error.code);
        },
        { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
    );
    }

    getFacticles(){
      let request = {}
      AsyncStorage.getItem('username', (err,res)=>{
        request = {
          user_id: res,
          route: this.state.route.pure
        }
      })
      .then( () => {
        Axios.post("https://inmyseat.chronicle.horizon.ac.uk/api/v1/timeline", JSON.stringify(request) )
        .then( response => {
          this.setState({facticles: response.data})
          return response.data
        })
        .then( data =>
          AsyncStorage.setItem('facticles', JSON.stringify(data))
        )
      })
      .catch(err => Log.error(err))
    }

    componentDidMount(){
      AppMan.loadJourney(this.props.jKey)
      PushNotification.configure({
        // (required) Called when a remote or local notification is opened or received
        onNotification: function(notification) {
          Log.info({
            message: "User selected notification",
            notification: notification
          })
          // Register all the valid actions for notifications here and add the action handler for each action
          globRef.animateCamera({
            center: {
              latitude: notification.data.lat,
              longitude: notification.data.lon
            },zoom: 17 })
            globalFollow = false
            if(notification.data.hasOwnProperty('desc')){
              globalShow(notification.data.desc)
              globalOverlay = true
            }
        },
      permissions: {
        alert: true,
        badge: true,
        sound: true
      }
      })

      this.props.navigation.addListener('didFocus', (payload) => {
        Log.info('The Travel screen was activated');
      });

      AsyncStorage.getItem(
        this.props.jKey
        ,(err,res) =>{ let obj = JSON.parse(res); this.setState({route: obj, points: obj.route})}
      )
      .then(
        () => {
          var temp = []
          if(this.state.points.length < 6){
            for(let i = 0; i < this.state.points.length; i++){
              let part = []
              this.state.points[i].map( (item,i) => { part.push({latitude: item.latitude, longitude: item.longitude}) } )
              temp.push( part )
            }
          }
          else temp = this.state.points
            return temp
            }
          )
      .then( (res) => this.setState({points: res, loaded: true}) )
      .then( () => { AsyncStorage.setItem('CurrentJ',
        this.props.jKey
      ) } )
      .then( () => this.getFacticles())
      .catch(err => Log.error(err))

      this.getLoc()

      AsyncStorage.setItem('VisPOIS', '[]')
      this.intervalID = setInterval( () => this.getLoc(), 2000)

    }

    componentWillUnmount(){
      clearInterval(this.intervalID)
    }

    render() {
      //Stop background service
      LocMan.clean()
      return (
      <View style={styles.containerP}>
      <View style={styles.mapContainer}>
       <MapView
         provider={PROVIDER_GOOGLE}
         ref={mView => this.mView = globRef = mView}
         style={styles.map}
         customMapStyle={mapStyle}
         onMapReady={this.ready}

         initialRegion={{
           latitude: 52.944351,
           longitude: -1.190312,
           latitudeDelta: 0.020,
           longitudeDelta: 0.0121,
         }}
         onPanDrag={ () => {
            globalFollow ? globalFollow = false
            //this.state.following ? this.setState({following: false})
            : null } }
       >
       {
          this.state.loaded ?
          this.state.VisiblePois.map( (item,i) => {
            return(
              <Marker
                key={i}
                coordinate={{latitude: item.latitude, longitude: item.longitude}}
                image={require('../assets/icons8-point-of-interest-52.png')}
                onPress={ () => {
                  this.showItem(this.state.VisiblePois[i])
                } }
              /> )
          })
          : null
        }
       {
           this.state.loaded ?
           this.state.points.map(
             (item, i) =>
                {
                  return(
                    <View key={i} >
                      { i !== 0 ?
                      <Marker
                        coordinate={item[0]}
                        image={ require('../assets/icons8-synchronize-filled-96.png') }
                      /> : null }
                      <Polyline coordinates={item} strokeColor = {this.state.polyOptsBus[i]} strokeWidth = {3} />
                    </View>
                    )
                }
             )
            : null
       }
       {
         this.state.loaded ?
         this.state.currentPos.latitude === undefined ? null
         : <Marker coordinate={ this.state.currentPos }
            image={ require('../assets/mylocation.gif') }
            style={styles.image}
            />
         :
         null
       }
       </MapView>
       {/*POIS overlay*/}
       <Overlay
          animationType="fade"
          isVisible={this.state.showPOI}
          onBackdropPress={() => this.setState({ showPOI: false })}
        >
        <View style={styles.containerP} >
        <ScrollView contentContainerStyle={styles.scrollCont} >
          <Text>{this.state.clean.name}</Text>
          <Text>Category: {this.state.clean.category}</Text>
          {
            String(this.state.clean[0]).substr(0,4) === "<img" ?
              //<HTML html={this.state.clean[0]} />
              <></>
            :
              <Text>{this.state.clean[0]}</Text>
          }
          {
            this.state.clean.map(
              (item, i) => {
                if(i !== 0){
                  return(
                    <Text key={i} >{item}</Text>
                  )
                }
              }
            )
          }
        </ScrollView>
        </View>
        </Overlay>
      {/*Global POIS overlay*/}
      <Overlay
          animationType="fade"
          isVisible={globalOverlay}
          onBackdropPress={() => globalOverlay = false}
        >
        <View style={styles.containerP} >
        <ScrollView contentContainerStyle={styles.scrollCont} >
          <Text></Text>
          <Text>Category: {globalClean[globalClean-1]} </Text>
          {
            String(globalClean[0]).substr(0,4) === "<img" ?
              //<HTML html={globalClean[0]} />
              <></>
            :
              <Text>{globalClean[0]}</Text>
          }
          {
            globalClean.map(
              (item, i) => {
                if(i !== 0){
                  return(
                    <Text key={i} >{item}</Text>
                  )
                }
              }
            )
          }
        </ScrollView>
        </View>
        </Overlay>

        {/*POIS List overlay*/}
        <Overlay
          animationType="fade"
          isVisible={this.state.showList}
          onBackdropPress={() => this.setState({ showList: false })}
        >
        <View style={styles.containerP} >
        <ScrollView contentContainerStyle={styles.scrollCont} >
          {
            this.state.VisiblePois.map( (item, i) => {
              return(
                <Text key={i} onPress={ () => {
                  this.mView.animateCamera({center:{latitude: item.latitude, longitude: item.longitude}, zoom: 17})
                  this.setState({showList: false
                    //,following: false
                  })
                  globalFollow = false
                } } > {item.name} </Text>
              )
            })
          }
        </ScrollView>
        </View>
        </Overlay>

       <Selector
        change={this.props.change}
        mode={'Travel'}
        following={ () => { globalFollow = true, this.viewPOI() } }
        listPOIS ={ ()=> this.setState({showList: true})
        }
        navigation={this.props.navigation}/>
      </View>
    </View>
      )
    }
  }

  const styles = StyleSheet.create({
    mapContainer: {
      flex: 8,
      borderWidth: 4
    },
    containerP:{
      flex: 1,
      flexDirection: 'column',
      justifyContent: 'flex-start',
      alignItems: 'stretch',
      alignSelf: 'stretch'
    },
    map: {
      ...StyleSheet.absoluteFillObject,
    },
    image: {
      height: 22,
      width: 22
    }

  })
