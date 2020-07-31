import {decorate, observable} from 'mobx';
import {AsyncStorage, AppState} from 'react-native';
import iap from './iap';

class AppStore {

  isLogged = false;
  appState = null;

  constructor() {
    this.start()
  }

  start = async () => {
    iap.init();
    AppState.addEventListener("change", this.onAppStateChange);
    this.isLogged = (await AsyncStorage.getItem('isLogged')) == "true" ? true : false;
    if (this.isLogged) {
      this.login();
    }
  }

  stop = () => {
    AppState.removeEventListener("change", this.onAppStateChange);
  }

  onAppStateChange = (nextAppState) => {
    if (this.appState && this.appState.match(/inactive|background/) && nextAppState === "active") {
      iap.getActiveProducts();
    }
    this.appState = nextAppState;
  }

  login = async () => {
    iap.setUserId("1");
    await iap.getActiveProducts();
    await iap.getProductsForSale();
    await AsyncStorage.setItem('isLogged', "true");
    this.isLogged = true;
  }
  
  logout = async () => {
    await AsyncStorage.setItem('isLogged', "false");
    iap.setUserId(null);
    this.isLogged = false;
  }

}

decorate(AppStore, {
  isLogged: observable
})
export default new AppStore();