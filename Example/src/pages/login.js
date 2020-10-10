import React from 'react';
import {Observer} from 'mobx-react/custom';
import {StyleSheet, View, Button, Text} from 'react-native';
import app from '../stores/app';
import iap from '../stores/iap';

export default class LoginPage extends React.Component {

  renderContent() {
    return (
      <View style={styles.root}>
        <Button title="Login" onPress={app.login}/>
        <Text style={{marginTop: 20, marginBottom: 10}}>IAP platform: {iap.platform}</Text>
        {iap.platform == 'android' &&
          <Button title="Force amazon" onPress={() => iap.setPlatform('amazon')}/>
        }
        {iap.platform == 'amazon' &&
          <Button title="Force android" onPress={() => iap.setPlatform('android')}/>
        }
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
    justifyContent: 'center',
    alignItems: 'center'
  }
});