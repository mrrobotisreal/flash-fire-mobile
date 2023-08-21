import { useState, useEffect, createContext } from 'react';

export const UserContext = createContext();

export const UserContextProvider = ({children}) => {
  const [user, setUser] = useState({});
  const [isAuthN, setIsAuthN] = useState(false);

  useEffect(() => {
    console.log('isAuthN updated to:', isAuthN);
  }, [isAuthN])

  const values = {
    user,
    setUser,
    isAuthN,
    setIsAuthN,
  };

  return (
    <UserContext.Provider value={values}>
      {children}
    </UserContext.Provider>
  )
};