import React from 'react';
import {View, StyleSheet} from 'react-native';
import {Observer} from 'mobx-react/custom';
import IAP from './pages/iap';
import Login from './pages/login';
import app from './stores/app';

export default class App extends React.Component {

  renderContent = () => {
    var {isLogged} = app;

    return (
      <View style={styles.root}>
        {isLogged && <IAP/>}
        {!isLogged && <Login/>}
      </View>
    )
  }

  render() {
    return (
      <Observer>
        {this.renderContent}
      </Observer>
    )
  }

}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: 'white'
  }
});