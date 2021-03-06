import { AppState } from 'react-native';
import {Log} from '../Logger.js'

/**
 * Class to check if app is in the foreground
 */
export default class StateMan {
  constructor(){
      this.state = {
        appState: AppState.currentState,
      }
    this.returnState = this.returnState.bind(this)
  }

  returnState(){
      let temp = AppState.currentState
      return temp
  }

  componentDidMount() {
    AppState.addEventListener('change', this.handleAppStateChange);
  }

  componentWillUnmount() {
    AppState.removeEventListener('change', this.handleAppStateChange);
  }

  handleAppStateChange = (nextAppState) => {
    this.setState({appState: nextAppState});
  };

}
