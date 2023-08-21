import { useState, useEffect, useContext, createContext } from 'react';
import axios from 'axios';
import { DbContext } from './DbContext';

export const ChatContext = createContext(null);

export const ChatContextProvider = ({ children }) => {
  const [currentMessages, setCurrentMessages] = useState([]);
  const [allUserMessages, setAllUserMessages] = useState([]);
  const { currentUser } = useContext(DbContext);

  useEffect(() => {}, []);

  const fetchAllMessages = async () => {
    //
  };

  const values = {
    currentMessages,
    allUserMessages,
  };

  return (
    <ChatContext.Provider value={values}>
      {children}
    </ChatContext.Provider>
  )
};