import React from 'react';
import {View, StyleSheet} from 'react-native';
import IAP from './pages/iap';
import Login from './pages/login';
import { AppProvider, useApp } from './context/AppContext';

function AppContent() {
  const { isLogged } = useApp();

  return (
    <View style={styles.root}>
      {isLogged && <IAP/>}
      {!isLogged && <Login/>}
    </View>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: 'white'
  }
});