import React from 'react'
import { createAppContainer, createDrawerNavigator } from 'react-navigation'

import Explore from './src/Explore.js'
import History from './src/History.js'
import Plan from './src/Plan.js'
import Settings from './src/Settings.js'
import Travel from './src/Travel.js'


class ExploreScreen extends React.Component {
  static navigationOptions = {
    drawerLabel: 'Explore',
  };
  render() {
    return (<Explore navigation={this.props.navigation} />)
  }
}

class HistoryScreen extends React.Component {
  static navigationOptions = {
    drawerLabel: 'History',
  };
  render() {
    return (<History navigation={this.props.navigation} />)
  }
}
class SettingsScreen extends React.Component {
  static navigationOptions = {
    drawerLabel: 'Settings',
  };
  render() {
    return (<Settings />)
  }
}

class TravelPlanScreen extends React.Component {
  static navigationOptions = {
    drawerLabel: 'Plan',
  };
  constructor(props){
    super(props)
    this.state ={
      changeView: true,
      journeyKey: ''
    }
    this.change = this.change.bind(this)
  }
  //Function to switch to travel mode
  change(jKey){
    this.setState(
      {
        changeView: !this.state.changeView,
        journeyKey: jKey
      }
    )
  }
  render() {
    return (
      this.state.changeView
          ? <Travel change={this.change} jKey={this.state.journeyKey} />
          : <Plan change={this.change} />
    )
  }
}

const DrawerNavigator = createDrawerNavigator({
  Explore: {
    screen: ExploreScreen,
  },
  TravelPlan: {
    screen: TravelPlanScreen
  },
  History: {
    screen: HistoryScreen,
  },
  Settings: {
    screen: SettingsScreen
  }
});

export default createAppContainer(DrawerNavigator);
