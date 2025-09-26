import type {TurboModule as RNTurboModule} from 'react-native/Libraries/TurboModule/RCTExport';
import type {TurboModuleRegistry as RNTurboModuleRegistry} from 'react-native/Libraries/TurboModule/TurboModuleRegistry';

declare module 'react-native' {
  export interface TurboModule extends RNTurboModule {}
  export const TurboModuleRegistry: RNTurboModuleRegistry;
}
