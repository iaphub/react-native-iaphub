import {decorate, observable} from 'mobx';
import {AsyncStorage} from 'react-native';
import iap from './iap';

class AppStore {

  isLogged = false;

  constructor() {
    this.init()
  }

  init = async () => {
    iap.init();
    this.isLogged = (await AsyncStorage.getItem('isLogged')) == "true" ? true : false;
    if (this.isLogged) {
      this.login();
    }
  }

  login = async () => {
    this.isLogged = true;
    await AsyncStorage.setItem('isLogged', "true");
    iap.login("1");
  }
  
  logout = async () => {
    this.isLogged = false;
    await AsyncStorage.setItem('isLogged', "false");
    iap.logout();
  }

}

decorate(AppStore, {
  isLogged: observable
})
export default new AppStore();