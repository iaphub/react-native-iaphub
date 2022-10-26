import {makeAutoObservable} from "mobx"
import AsyncStorage from '@react-native-async-storage/async-storage';
import iap from './iap';

class AppStore {

  isLogged = false;

  constructor() {
    makeAutoObservable(this)
    this.start()
  }

  start = async () => {
    await iap.init();
    this.isLogged = (await AsyncStorage.getItem('isLogged')) == "true" ? true : false;
    if (this.isLogged) {
      await this.login();
    }
  }

  login = async () => {
    await iap.login("42");
    await iap.refreshProducts();
    await AsyncStorage.setItem('isLogged', "true");
    this.isLogged = true;
  }

  loginAnonymously = async () => {
    await iap.refreshProducts();
    await AsyncStorage.setItem('isLogged', "false");
    this.isLogged = true;
  }
  
  logout = async () => {
    await iap.logout();
    await AsyncStorage.setItem('isLogged', "false");
    this.isLogged = false;
  }

}

export default new AppStore();