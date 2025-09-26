import React, { createContext, useContext, useEffect, useMemo } from 'react';
import { AppStoreProvider, useAppStore } from '../providers/AppProvider';
import { IAPStoreProvider, useIAPStore } from '../providers/IAPProvider';

const AppContext = createContext();

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

// Inner component that has access to both stores
const AppProviderInner = ({ children }) => {
  const appStore = useAppStore();
  const iapStore = useIAPStore();
  const { start } = appStore;

  // Initialize the app when the provider mounts
  useEffect(() => {
    start();
  }, [start]);

  const value = useMemo(() => ({
    ...appStore,
    iap: iapStore
  }), [appStore, iapStore]);


  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};

export const AppProvider = ({ children }) => {
  return (
    <IAPStoreProvider>
      <AppStoreProvider>
        <AppProviderInner>
          {children}
        </AppProviderInner>
      </AppStoreProvider>
    </IAPStoreProvider>
  );
};
