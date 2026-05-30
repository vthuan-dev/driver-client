import { createContext, useContext, useState } from 'react';

type Tab = 'login' | 'register';

interface AuthModalContextValue {
  isOpen: boolean;
  tab: Tab;
  openAuth: (tab?: Tab) => void;
  closeAuth: () => void;
  switchTab: (tab: Tab) => void;
}

const AuthModalContext = createContext<AuthModalContextValue>({
  isOpen: false,
  tab: 'login',
  openAuth: () => {},
  closeAuth: () => {},
  switchTab: () => {},
});

export const AuthModalProvider = ({ children }: { children: React.ReactNode }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [tab, setTab] = useState<Tab>('login');

  const openAuth = (t: Tab = 'login') => { setTab(t); setIsOpen(true); };
  const closeAuth = () => setIsOpen(false);
  const switchTab = (t: Tab) => setTab(t);

  return (
    <AuthModalContext.Provider value={{ isOpen, tab, openAuth, closeAuth, switchTab }}>
      {children}
    </AuthModalContext.Provider>
  );
};

export const useAuthModal = () => useContext(AuthModalContext);
