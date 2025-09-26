import { useState, useCallback, useMemo, createContext, useContext } from 'react';
import { useIAPStore } from './IAPProvider';

// Create a context for the app store
const AppStoreContext = createContext();

// Provider component that manages the app state
export const AppStoreProvider = ({ children }) => {
  const [isLogged, setIsLogged] = useState(false);
  const {
    init: initIAP,
    login: loginIAP,
    refreshProducts,
    logout: logoutIAP
  } = useIAPStore();


  const start = useCallback(async () => {
    await initIAP();
  }, [initIAP]);

  const login = useCallback(async (userId = "42") => {
    await loginIAP(String(userId));
    await refreshProducts();
    setIsLogged(true);
  }, [loginIAP, refreshProducts]);

  const loginAnonymously = useCallback(async () => {
    await refreshProducts();
    setIsLogged(true);
  }, [refreshProducts]);
  
  const logout = useCallback(async () => {
    await logoutIAP();
    setIsLogged(false);
  }, [logoutIAP]);

  const value = useMemo(() => ({
    isLogged,
    start,
    login,
    loginAnonymously,
    logout
  }), [isLogged, start, login, loginAnonymously, logout]);

  return (
    <AppStoreContext.Provider value={value}>
      {children}
    </AppStoreContext.Provider>
  );
};

// Hook to use the app store
export const useAppStore = () => {
  const context = useContext(AppStoreContext);
  if (!context) {
    throw new Error('useAppStore must be used within an AppStoreProvider');
  }
  return context;
};
