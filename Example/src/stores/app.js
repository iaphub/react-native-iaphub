import {decorate, observable} from 'mobx';
import {AppState} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import iap from './iap';

class AppStore {

  isLogged = false;

  constructor() {
    this.start()
  }

  start = async () => {
    iap.init();
    this.isLogged = (await AsyncStorage.getItem('isLogged')) == "true" ? true : false;
    if (this.isLogged) {
      this.login();
    }
  }

  login = async () => {
    iap.setUserId("1");
    await iap.refreshProducts();
    await AsyncStorage.setItem('isLogged', "true");
    this.isLogged = true;
  }
  
  logout = async () => {
    await AsyncStorage.setItem('isLogged', "false");
    this.isLogged = false;
  }

}

decorate(AppStore, {
  isLogged: observable
})
export default new AppStore();