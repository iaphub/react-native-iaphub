import {NativeModules, Platform, TurboModuleRegistry} from 'react-native';

function isTurboModuleAvailable(name: string): boolean {
  try {
    return TurboModuleRegistry.get(name) != null;
  } catch (err) {
    return false;
  }
}

export const LINKING_ERROR =
  "The package 'react-native-iaphub' doesn't seem to be linked. Make sure: \n\n" +
  (Platform.OS === 'ios' ? "- You have run 'pod install'\n" : '') +
  '- You rebuilt the app after installing the package\n' +
  '- You are not using Expo managed workflow\n';

export const NativeIaphub = isTurboModuleAvailable('NativeIaphub')
  ? require('./specs/NativeIaphub').default
  : NativeModules.NativeIaphub ?? (() => {
      throw new Error(LINKING_ERROR);
    })();