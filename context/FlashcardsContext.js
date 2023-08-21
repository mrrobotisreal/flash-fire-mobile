import { useState, createContext } from 'react';

export const FlashcardsContext = createContext();

export const FlashcardsContextProvider = ({ children }) => {
  const [allCollections, setAllCollections] = useState([]);
  const [currentCollection, setCurrentCollection] = useState([]);

  const values = {
    allCollections,
    setAllCollections,
    currentCollection,
    setCurrentCollection,
  };

  return (
    <FlashcardsContext.Provider value={values}>
      {children}
    </FlashcardsContext.Provider>
  )
};