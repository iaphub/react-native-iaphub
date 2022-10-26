import React from 'react';
import {StyleSheet, View, Button} from 'react-native';
import app from '../stores/app';

export default class LoginPage extends React.Component {

  render() {
    return (
      <View style={styles.root}>
        <Button title="Login" onPress={app.login}/>
        <Button title="Login anonymously" onPress={app.loginAnonymously}/>
      </View>
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