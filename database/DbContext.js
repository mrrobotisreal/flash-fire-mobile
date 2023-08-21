import { useState, useEffect, createContext } from 'react';
import axios from 'axios';
import * as SQLite from 'expo-sqlite';
import * as FileSystem from 'expo-file-system';
import * as Sentry from 'sentry-expo';
import { Asset } from 'expo-asset';
import * as Sharing from 'expo-sharing';
// import * as bcrypt from 'bcryptjs';
import isaac from 'isaac';
import * as bcrypt from 'react-native-bcrypt';
import { v4 as uuidv4 } from 'uuid';

bcrypt.setRandomFallback((len) => {
  const buf = new Uint8Array(len);

  return buf.map(() => Math.floor(isaac.random() * 256));
})
const salt = bcrypt.genSaltSync(10);

export const DbContext = createContext();

// const db = SQLite.openDatabase('flashFire.db');

// async function openDatabase() {
//   if (!(await FileSystem.getInfoAsync(FileSystem.documentDirectory + 'SQLite')).exists) {
//     await FileSystem.makeDirectoryAsync(FileSystem.documentDirectory + 'SQLite');
//   }
//   await FileSystem.downloadAsync(
//     Asset.fromModule(require('./assets/flashFire.db')).uri,
//     FileSystem.documentDirectory + 'SQLite/flashFire.db'
//   );
//   return SQLite.openDatabase('flashFire.db');
// }

let flashfireDB;
async function initDB() {
  // Check if the directory where we are going to put the database exists
  let dirInfo;
  try {
      dirInfo = await FileSystem.getInfoAsync(`${FileSystem.documentDirectory}SQLite`);
  } catch(err) { Sentry.Native.captureException(err) };

  if (!dirInfo.exists) {
    try {
      await FileSystem.makeDirectoryAsync(`${FileSystem.documentDirectory}SQLite`, { intermediates: true });
    } catch(err) { Sentry.Native.captureException(err) }
  };

  // Downloads the db from the original file
  // The db gets loaded as read only
  FileSystem.downloadAsync(
    Asset.fromModule(require('../databases/flashfire.db')).uri,
      `${FileSystem.documentDirectory}SQLite/flashfire.db`
    ).then(() => {
    flashfireDB = SQLite.openDatabase(`flashfire.db`); // We open our downloaded db
  }).catch(err => Sentry.Native.captureException(err));
}
// initDB();

const openDB = () => {
  return SQLite.openDatabase('flashFire.db');
};

// const checkShare = async () => {
//   await Sharing.shareAsync(
//     FileSystem.documentDirectory + 'SQLite/main',
//     {dialogTitle: 'share or copy your DB via'}
//  ).catch(error =>{
//     console.log(error);
//  })
// }

export const DbContextProvider = ({ children }) => {
  // const db = SQLite.openDatabase('flashFire.db');
  const [db, setDb] = useState(SQLite.openDatabase('flashFire.db'));
  // const [db, setDb] = useState();
  const [dbItem, setDbItem] = useState('this is just a placeholder for now');
  const [users, setUsers] = useState([]);
  const [currentUser, setCurrentUser] = useState();
  const [collections, setCollections] = useState();
  const [currentCollection, setCurrentCollection] = useState();
  const [flashcards, setFlashcards] = useState();
  const [currentFlashcards, setCurrentFlashcards] = useState();
  const [textsCollection, setTextsCollection] = useState();
  const [contacts, setContacts] = useState();
  const [contactChatHistory, setContactChatHistory] = useState();

  useEffect(() => {
    // openDatabase
    //   .then((value) => {
    //     setDb(value);
    //   })
    //   .catch((err) => console.error(err));
    // console.log('DIR=', FileSystem.documentDirectory);
    // checkShare();
    if (!db) {
      setDb(openDB());
    }
  }, []);

  useEffect(() => {
    db.transaction(tx => {
      tx.executeSql('CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY AUTOINCREMENT, username TEXT, password TEXT, email TEXT)')
    },
    (err) => {
      console.log('I think this is the error callback?');
      console.error(err);
    },
    () => {
      console.log('I think this is the success callback?')
    });

    // db.transaction(tx => {
    //   tx.executeSql('CREATE TABLE IF NOT EXISTS collections (id INTEGER PRIMARY KEY AUTOINCREMENT, username TEXT, collectionname TEXT, category TEXT');
    // });

    // db.transaction(tx => {
    //   tx.executeSql('CREATE TABLE IF NOT EXISTS flashcards (id INTEGER PRIMARY KEY AUTOINCREMENT, username TEXT, collectionname TEXT, question TEXT, answer TEXT, audiouri TEXT, imageuri TEXT');
    // });

    db.transaction(tx => {
      tx.executeSql('SELECT * FROM users', null,
        (txObj, resultSet) => setUsers(resultSet.rows._array),
        (txObj, error) => {
          console.error(error);
          return true;
        },
      );
    });

    // SQLite.openDatabase('flashFire.db')
  }, [db]);

  useEffect(() => {
    db.transaction(tx => {
      tx.executeSql('CREATE TABLE IF NOT EXISTS collections (id INTEGER PRIMARY KEY AUTOINCREMENT, username TEXT, collectionname TEXT, category TEXT)');
    },
    (err) => {
      console.error(err);
      return true;
    },
    () => {});
  }, []);

  useEffect(() => {
    db.transaction(tx => {
      tx.executeSql('CREATE TABLE IF NOT EXISTS flashcards (id INTEGER PRIMARY KEY AUTOINCREMENT, username TEXT, collectionname TEXT, question TEXT, answer TEXT, audiouri TEXT, imageuri TEXT)');
    },
    (err) => {
      console.error(err);
      return true;
    },
    () => {});
  }, []);

  const checkDB = async () => {
    db.transaction(tx => {
      tx.executeSql('SELECT * FROM collections', null,
        (txObj, resultSet) => setCollections(resultSet.rows._array),
        (txObj, error) => {
          console.error(error);
          return true;
        },
      );
    },
    (err) => {
      console.error(err);
      return true;
    },
    () => {});
    db.transaction(tx => {
      tx.executeSql('SELECT * FROM flashcards', null,
        (txObj, resultSet) => setFlashcards(resultSet.rows._array),
        (txObj, error) => {
          console.error(error);
          return true;
        },
      );
    },
    (err) => {
      console.error(err);
      return true;
    },
    () => {});
  };

  useEffect(() => {
    console.log('COLLECTIONS:', collections);
    console.log('FLASHCARDS:', flashcards);
  }, [collections, flashcards]);

  const getUsers = () => {
    db.transaction(tx => {
      tx.executeSql('SELECT * FROM users', null,
        (txObj, resultSet) => setUsers(resultSet.rows._array),
        (txObj, error) => {
          console.error(error);
          return true;
        },
      );
    })
  };

  /**
   * Google
   */
  const getUserWithGoogle = () => {};

  const addUserWithGoogle = () => {};

  /**
   * Username and Password
   */
  const getUserWithUnameAndPword = async (username, password) => {
    // let user;
    console.log('checking uname and pword:', username, password);
    db.transaction(tx => {
      tx.executeSql('SELECT * FROM users WHERE username = ?', [username],
        (txObj, resultSet) => {
          console.log('get resultSet:', resultSet.rows._array);
          let user = resultSet.rows._array.length > 0 ? resultSet.rows._array[0] : null;
          console.log('user is:', user);
          console.log('user.password', user?.password);
          console.log('password', password);
          user.isAuthenticated = checkUnamePword(username, user?.password, password);
          console.log('USER after auth:', user)
          setCurrentUser(user);
        },
        (txObj, error) => {
          console.log('error looking up username and password during login');
          console.error(error);
          return true;
        },
      );
    });
    // console.log('user after:', user);
    // return user;
    try {
      //
    } catch (e) {
      console.error(e);
    } finally {
      // return boolean
    }
  };

  const addUserWithUnameAndPword = (username, password, email) => {
    // const hashedPassword = hashPassword(password);
    console.log('ADDING USER!');
    axios.post('http://10.0.2.2:8889/createUser', {
      username,
      password,
      email,
    })
      .then(({ data }) => {
        //
      })
      .catch((err) => console.error(err));
    db.transaction(tx => {
      tx.executeSql(`INSERT INTO users (username, password, email) VALUES (?, ?, ?)`, [username, password, email],
        (txObj, resultSet) => {
          console.log('ADD USER resultSet:', resultSet.rows._array);
          getUserWithUnameAndPword(username, password);
        },
        (txObj, error) => {
          console.log('An error happened adding the new user')
          console.error(error);
          return true;
        },
      );
    },
    () => {
      console.log('Is there an error??? WTF is wrong?')
    },
    () => {
      console.log('Is it successful???  I have no freaking clue because this does not work AT ALL')
    })
  };

  const checkUnamePword = (username, userPassword, password) => {
    return userPassword === password;
    // const hashedPassword = hashPassword(password);
    // return userPassword === hashedPassword;
    // return bcrypt.compareSync(password, userPassword);
  };

  const hashPassword = (password) => {
    const hash = bcrypt.hashSync(password, salt);
    return hash;
  };

  /**
   * Storing / Retrieving collections
   */
  const getAllCollections = async () => {
    db.transaction(tx => {
      tx.executeSql('SELECT * FROM collections WHERE username = ?', [currentUser.username],
        (txObj, resultSet) => setCollections(resultSet.rows._array),
        (txObj, error) => {
          console.error(error);
          return true;
        }
      );
    });
  };

  const storeCollection = async (collection) => {
    // store collection and cards
    const name = collection.name;
    const category = collection.category;
    const cards = collection.cards;
    db.transaction(tx => {
      tx.executeSql('INSERT INTO collections (username, collectionname, category) VALUES (?, ?, ?)', [currentUser?.username, name, category],
        (txObj, resultSet) => {},
        (txObj, error) => {
          console.error(error);
          return true;
        },
      );
    });
    cards.forEach(card => {
      db.transaction(async tx => {
        await tx.executeSql('INSERT INTO flashcards (username, collectionname, question, answer, audiouri, imageuri) VALUES (?, ?, ?, ?, ?, ?)', [currentUser?.username, name, card.question, card.answer, card.audioUri ? card.audioUri : null, card.imageUri ? card.imageUri : null],
          (txObj, resultSet) => {},
          (txObj, error) => {
            console.error(error);
            return true;
          },
        );
      });
    });
  };

  const getCollection = async (collectionName) => {
    console.log('currentUser in getCollection:', currentUser);
    db.transaction(tx => {
      tx.executeSql('SELECT * FROM collections WHERE collectionname = ? AND username = ?', [collectionName, currentUser?.username],
        (txObj, resultSet) => setCurrentCollection(resultSet.rows._array[0]),
        (txObj, error) => {
          console.error(error);
          return true;
        },
      );
    });
    db.transaction(tx => {
      tx.executeSql('SELECT * FROM flashcards WHERE collectionname = ? AND username = ?', [collectionName, currentUser?.username],
        (txObj, resultSet) => setCurrentFlashcards(resultSet.rows._array),
        (txObj, error) => {
          console.error(error);
          return true;
        }
      );
    });
  };

  /**
   * Texts
   */
  const addText = () => {};

  const fetchGoogleTexts = () => {};

  /**
   * Chat
   */
  const getContacts = () => {};

  const getMessagesFromContact = (contact) => {
    db.transaction(tx => {
      tx.executeSql('SELECT * FROM messages WHERE username = ? AND contactname = ?', [currentUser?.username, contact],
        (txObj, resultSet) => setContactChatHistory(resultSet.rows._array),
        (txObj, error) => {
          console.error(error);
          return true;
        }
      );
    });
  };

  /**
   * My tools
   */
  const manualDelete = async (table, collectionName) => {
    db.transaction(tx => {
      tx.executeSql('DELETE FROM flashcards WHERE collectionname = ?', [collectionName],
        (txObj, resultSet) => {},
        (txObj, error) => {
          console.error(error);
          return true;
        }
      );
    })
    db.transaction(tx => {
      tx.executeSql('DELETE FROM collections WHERE collectionname = ?', [collectionName],
        (txObj, resultSet) => {},
        (txObj, error) => {
          console.error(error);
          return true;
        }
      );
    })
  };

  const checkTheDB = async () => {
    console.log('CHECKING DB');
    console.log(FileSystem.documentDirectory);
    console.log('Does SQLite exist?');
    const exists = await FileSystem.getInfoAsync(FileSystem.documentDirectory + 'SQLite');
    console.log('exists?', exists);
    if (!exists) {
      console.log('inside')
      await FileSystem.makeDirectoryAsync(FileSystem.documentDirectory + 'SQLite');
      const existsNow = await FileSystem.getInfoAsync(FileSystem.documentDirectory + 'SQLite').exists;
      console.log('Checking after making:\n', existsNow);
    }
  };

  const values = {
    db: db,
    currentUser,
    getUsers,
    getUserWithGoogle,
    addUserWithGoogle,
    getUserWithUnameAndPword,
    addUserWithUnameAndPword,
    storeCollection,
    manualDelete,
    textsCollection,
    addText,
    fetchGoogleTexts,
    checkTheDB,
    getAllCollections,
    currentCollection,
    currentFlashcards,
    getCollection,
    collections,
    contacts,
    contactChatHistory,
    getContacts,
    getMessagesFromContact,
  }

  return (
    <DbContext.Provider value={values}>
      {children}
    </DbContext.Provider>
  )
};
