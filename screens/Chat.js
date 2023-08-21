import { useState, useEffect, useRef, useContext } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  Dimensions,
  ImageBackground,
  StatusBar,
  ToastAndroid,
  FlatList,
  Modal,
} from "react-native";
import { Entypo } from "@expo/vector-icons";
import Logo from "../assets/flash-fire-mobile-background-without-logo.gif";
import moment from "moment";
import axios from "axios";

/**
 * Hooks
 */
import { useGetUser } from "../hooks/useLoginAndSignup";
import { useChat } from "../hooks/useChat";

/**
 * Constants
 */
import ENV from "../env/env.json";
const httpEm = ENV.CHAT_HTTP_URL_EMULATOR;
const httpEC2 = ENV.CHAT_HTTP_URL_EC2;
const DEVICE_WIDTH = Dimensions.get("window").width;
const DEVICE_HEIGHT = Dimensions.get("window").height;

export default function Chat({ navigation }) {
  const { user } = useGetUser();
  const {
    getChatSocket,
    getChatSocketId,
    getContactSocketId,
    fetchContactSocketId,
    resetContactSocketId,
    getCurrentContact,
    setContact,
    putChatOpen,
  } = useChat();
  const socket = getChatSocket();
  // const [socket, setSocket] = useState(getChatSocket());
  const [socketId, setSocketId] = useState(getChatSocketId());
  const [contacts, setContacts] = useState([]);
  const [contactsWithMessages, setContactsWithMessages] = useState([]);
  const [contactList, setContactList] = useState([]);
  const [startChatModalIsVisible, setStartChatModalIsVisible] = useState(false);
  const [searchForUserIsVisible, setSearchForUserIsVisible] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [searchResult, setSearchResult] = useState(null);

  useEffect(() => {
    console.log("the currentUser is:\n", user);
    setContact(null);
    axios
      .post(httpEm + "/listContacts", {
        username: user.username,
        // username: 'iamwintrow',
      })
      .then(({ data }) => {
        console.log(
          "listContacts data:\n",
          JSON.stringify(data[0].messages, null, data[0].messages.length)
        );
        const cm = [];
        if (data.length > 0) {
          console.log("data.length > 0");
          data.forEach((c) => {
            const contact = c;
            const fromContact = c.messages.filter((m) => {
              if (m.recipient_username === user.username) {
                if (!m.has_been_read) {
                  return true;
                }
              }
              return false;
            });
            contact.hasNewMessages =
              fromContact.length > 0
                ? !fromContact[fromContact.length - 1].has_been_read
                : false;
            c = contact;
            contact.messages.length > 0 && cm.push(contact);
          });
          console.log("formattedContacts:\n", cm);
        }
        setContactsWithMessages(cm);
        setContacts(data);
      })
      .catch((err) => console.error(err));
  }, []);

  useEffect(() => {
    console.log("useEffect contacts:\n", contacts);
  }, [contacts]);

  useEffect(() => {
    socket.on("updatedInteraction", (contact) => {
      let updatedContacts = contacts;
      updatedContacts.forEach((c) => {
        if (contact.username === c.username) {
          c = contact;
          console.log(
            "c after = ",
            JSON.stringify(c.messages, null, c.messages.length)
          );
        }
      });
      setContacts(updatedContacts);
    });
    socket.on("foundUser", (contact) => {
      console.log("contact is:", contact);
      if (contact) {
        setSearchResult(contact);
      }
    });
  }, [socket]);

  const Item = ({ onPress, username, hasNewMessages, lastTimestamp }) => (
    <Pressable onPress={onPress} style={styles.item}>
      <Text style={styles.itemTitle}>
        {hasNewMessages && <Entypo name="new" size={24} color="blue" />}{" "}
        {username}
      </Text>
      <Text style={styles.itemDescription}>
        {moment(lastTimestamp).fromNow()}
      </Text>
    </Pressable>
  );

  const ContactItem = ({ username, onPress }) => {
    console.log("ContactItem username:", username);
    return (
      <Pressable onPress={onPress} style={styles.contactItem}>
        <Text style={styles.contactItemTitle}>{username}</Text>
      </Pressable>
    );
  };

  const handleClick = (item) => {
    setContact(item.username);
    const params = {
      username: user.username,
      contactUsername: item.username,
    };
    putChatOpen(item.username);
    socket.emit("startChat", params);
    navigation.navigate("Messages", {
      username: item.username,
      contactName: item.username,
    });
    // axios.put('http://10.0.2.2:8889/updateLastInteraction', {
    //   // username: currentUser.username,
    //   username: 'iamwintrow',
    //   contactUsername: item.username,
    // })
    //   .then(({ data }) => {
    //     console.log('successfully updated last interaction');
    //   })
    //   .catch((err) => console.error(err));
  };

  const startNewChat = () => {
    setStartChatModalIsVisible(true);
    // navigation.navigate('');
  };

  const closeStartNewChat = () => {
    setStartChatModalIsVisible(false);
  };

  const showSearchForUser = () => {
    setSearchForUserIsVisible(!searchForUserIsVisible);
  };

  const searchForUser = () => {
    if (!searchText || searchText === "") {
      return;
    }
    const params = {
      username: searchText,
    };
    console.log("socket is finding user");
    socket.emit("findUser", params);

    // maybe instead use http request here?

    setSearchText("");
  };

  const leaveChats = () => {
    navigation.navigate("Home");
  };

  const startChat = () => {
    const params = {
      username: user.username,
      contactUsername: searchResult.username,
    };
    putChatOpen(searchResult.username);
    socket.emit("startChat", params);
    navigation.navigate("Messages", {
      username: user.username,
      contactName: searchResult.username,
    });
  };

  return (
    <View style={styles.container}>
      <StatusBar
        hidden
        backgroundColor="black"
        style="dark"
        barStyle="dark-content"
      />
      <ImageBackground
        source={Logo}
        style={styles.imageBackground}
        resizeMode="cover"
      >
        <View style={styles.titleContainer}>
          <Text style={styles.title}>Chat</Text>
        </View>
        <View style={styles.chatContainer}>
          <FlatList
            data={contactsWithMessages}
            style={styles.flatlist}
            renderItem={({ item }) => {
              return (
                <Item
                  onPress={() => handleClick(item)}
                  username={item.username}
                  hasNewMessages={item.hasNewMessages}
                  lastTimestamp={item.last_interaction_date}
                />
              );
            }}
          />
        </View>
        <Pressable style={styles.startNewChat} onPress={startNewChat}>
          <Text style={styles.startNewChatText}>Start new chat</Text>
        </Pressable>
        <Pressable style={styles.startNewChat} onPress={leaveChats}>
          <Text style={styles.startNewChatText}>Main Menu</Text>
        </Pressable>
        <Modal
          animationType="slide"
          transparent={true}
          visible={startChatModalIsVisible}
        >
          <View style={styles.modal}>
            <View style={styles.modalView}>
              <Text style={styles.modalTitle}>Contacts</Text>
              <View style={styles.contactsView}>
                {searchForUserIsVisible ? (
                  <View style={styles.searchForUserView}>
                    <Text style={styles.startNewChatText}>Username:</Text>
                    <TextInput
                      onChangeText={setSearchText}
                      value={searchText}
                      placeholder="Username..."
                      style={styles.searchTextInput}
                    />
                    <Pressable
                      style={styles.startNewChat}
                      onPress={searchForUser}
                    >
                      <Text style={styles.startNewChatText}>Find</Text>
                    </Pressable>
                    {searchResult && (
                      <View style={styles.searchResultsView}>
                        <Text
                          style={{
                            ...styles.startNewChatText,
                            marginVertical: 5,
                            borderBottomWidth: 4,
                            borderColor: "orange",
                          }}
                        >
                          Results:
                        </Text>
                        <Pressable
                          style={styles.userResult}
                          onPress={startChat}
                        >
                          <Text style={styles.startNewChatText}>
                            {searchResult.username}
                          </Text>
                        </Pressable>
                      </View>
                    )}
                  </View>
                ) : (
                  <FlatList
                    style={styles.contactFlatlist}
                    data={contacts}
                    renderItem={({ item }) => {
                      console.log("contact FlatList item:", item);
                      return (
                        <ContactItem
                          username={item.username}
                          onPress={() => handleClick(item)}
                        />
                      );
                    }}
                  />
                )}
              </View>
              <View style={styles.modalButtonsView}>
                <Pressable
                  style={styles.startNewChat}
                  onPress={showSearchForUser}
                >
                  <Text style={styles.startNewChatText}>
                    {searchForUserIsVisible ? "Contacts" : "Search"}
                  </Text>
                </Pressable>
                <Pressable
                  style={styles.startNewChat}
                  onPress={closeStartNewChat}
                >
                  <Text style={styles.startNewChatText}>Close</Text>
                </Pressable>
              </View>
            </View>
          </View>
        </Modal>
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "column",
    marginTop: 0,
    backgroundColor: "#000000",
    alignItems: "center",
    justifyContent: "center",
    paddingBottom: 100,
    paddingTop: 100,
  },
  imageBackground: {
    flex: 1,
    justifyContent: "center",
    contentFit: "cover",
  },
  titleContainer: {
    borderBottomWidth: 6,
    borderColor: "red",
    borderRadius: 12,
    backgroundColor: "black",
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 12,
    marginRight: 12,
    marginTop: 14,
    // marginBottom: 10,
  },
  title: {
    color: "white",
    fontFamily: "Agright",
    fontSize: 32,
  },
  chatContainer: {
    borderWidth: 6,
    borderColor: "red",
    borderRadius: 12,
    backgroundColor: "black",
    width: DEVICE_WIDTH - 10,
    paddingBottom: 10,
    marginTop: 10,
  },
  flatlist: {
    flexGrow: 0,
    height: "100%",
  },
  item: {
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "red",
    width: "99%",
    alignItems: "center",
    marginLeft: 2,
    marginRight: 2,
    marginTop: 6,
    marginBottom: 6,
    paddingVertical: 6,
    backgroundColor: "#000000",
  },
  itemTitle: {
    fontFamily: "Agright",
    fontSize: 26,
    color: "white",
  },
  itemDescription: {
    fontFamily: "Agright",
    fontSize: 13,
    color: "white",
  },
  startNewChat: {
    margin: 5,
    borderRadius: 12,
    borderWidth: 4,
    borderColor: "red",
    width: DEVICE_WIDTH - 200,
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
  },
  startNewChatText: {
    fontFamily: "Agright",
    fontSize: 16,
    color: "white",
  },
  modal: {
    // backgroundColor: 'black',
    backgroundColor: "rgba(40,40,40,0.8)",
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
  },
  modalView: {
    borderWidth: 4,
    borderRadius: 12,
    borderColor: "red",
    backgroundColor: "black",
    padding: 20,
    alignSelf: "center",
    alignItems: "center",
    justifyContent: "space-between",
    width: DEVICE_WIDTH - 20,
    height: DEVICE_HEIGHT - 100,
  },
  modalTitle: {
    fontFamily: "Agright",
    fontSize: 20,
    color: "white",
    paddingBottom: 5,
  },
  modalButtonsView: {
    padding: 10,
  },
  contactsView: {
    borderWidth: 2,
    borderRadius: 12,
    borderColor: "red",
    backgroundColor: "black",
    padding: 10,
    alignSelf: "center",
    alignItems: "center",
    // justifyContent: 'space-between',
    width: DEVICE_WIDTH - 40,
    height: "80%",
  },
  contactFlatlist: {
    width: "95%",
  },
  contactItem: {
    width: "100%",
    borderWidth: 2,
    borderColor: "red",
    borderRadius: 8,
    padding: 5,
    alignItems: "center",
    justifyContent: "center",
  },
  contactItemTitle: {
    fontFamily: "Agright",
    fontSize: 18,
    color: "white",
  },
  searchForUserButton: {},
  searchForUserView: {
    width: "90%",
  },
  searchResultsView: {},
  searchTextInput: {
    width: "90%",
    backgroundColor: "grey",
    fontFamily: "Agright",
    padding: 4,
  },
  userResult: {
    width: "100%",
    borderWidth: 2,
    borderColor: "red",
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
    marginVertical: 5,
  },
});
