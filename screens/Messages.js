import { useState, useEffect, useRef, useContext } from "react";
import {
  Dimensions,
  FlatList,
  Image,
  ImageBackground,
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Pressable,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  ToastAndroid,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { FontAwesome } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import Logo from "../assets/spaceWhatsApp.jpg";
import axios from "axios";
import moment from "moment";

/**
 * Context
 */
import { UserContext } from "../context/UserContext";

/**
 * Hooks
 */
import { useChat } from "../hooks/useChat";

/**
 * Constants
 */
import ENV from "../env/env.json";
const httpEm = ENV.CHAT_HTTP_URL_EMULATOR;
const httpEC2 = ENV.CHAT_HTTP_URL_EC2;
const DEVICE_WIDTH = Dimensions.get("window").width;
const DEVICE_HEIGHT = Dimensions.get("window").height;

/* eslint-disable */
const Message = ({
  onLongPress,
  username,
  content,
  timestamp,
  isFromUser,
  sender,
  recipient,
  has_been_read,
  hasImage,
}) => (
  <Pressable
    onLongPress={onLongPress}
    style={{
      ...styles.message,
      backgroundColor: isFromUser ? "green" : "#5A5A5A",
      alignSelf: isFromUser ? "flex-end" : "flex-start",
    }}
  >
    {hasImage ? null : (
      <View>
        <View style={styles.dateAndTime}>
          <Text style={styles.timestamp}>
            {moment(timestamp).format("LTS")}
          </Text>
          <Text style={styles.timestamp}>
            {moment(timestamp).format("YYYY-MM-DD")}
          </Text>
        </View>
        <Text style={styles.messageContent}>{content}</Text>
        <View style={styles.bottomMessage}>
          <Text style={styles.timestamp}>{moment(timestamp).fromNow()}</Text>
          {isFromUser ? (
            has_been_read ? (
              <Ionicons name="checkmark-done-sharp" size={24} color="blue" />
            ) : (
              <Ionicons name="checkmark-done-sharp" size={24} color="#363636" />
            )
          ) : null}
        </View>
      </View>
    )}
  </Pressable>
);
/* eslint-enable */

export default function Messages({ navigation, route }) {
  const { getChatSocket, putChatOpen, putChatClosed, getChatIsOpen } =
    useChat();
  const socket = getChatSocket();
  const flatlistRef = useRef();
  const [keyboardIsVisible, setKeyboardIsVisible] = useState(false);
  const [translateModalIsVisible, setTranslateModalIsVisible] = useState(false);
  const [itemToTranslate, setItemToTranslate] = useState(null);
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState();
  const [isFocused, setIsFocused] = useState(false);
  const [image, setImage] = useState();
  const [isSendingImage, setIsSendingImage] = useState(false);
  const { contactName } = route.params;
  const { user } = useContext(UserContext);

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      "keyboardDidShow",
      () => {
        setKeyboardIsVisible(true);
      }
    );
    const keyboardDidHideListener = Keyboard.addListener(
      "keyboardDidHide",
      () => {
        setKeyboardIsVisible(false);
      }
    );
    return () => {
      keyboardDidHideListener.remove();
      keyboardDidShowListener.remove();
    };
  }, []);

  useEffect(() => {
    axios
      .post(httpEm + "/getMessages", {
        username: user.username,
        contactUsername: contactName,
      })
      .then(({ data }) => {
        setMessages(data.messageList);
        // send read messages update
        // sendReadMessagesUpdate(user.username, contactName);
      })
      .catch((err) => {
        console.log("getMessages ERROR:");
        console.error(err);
      });
  }, []);

  useEffect(() => {
    console.log("chatIsOpen:", getChatIsOpen());
    socket.on("newMessage", (msgs) => {
      // msgs.forEach((m) => {
      //   if (m.recipient_username === user.username) {
      //     m.has_been_read = true;
      //   }
      // });
      setMessages(msgs);
      // setNewMessages(msgs);
      socket.emit("hasBeenRead", {
        username: user.username,
        contactUsername: contactName,
      });
    });
    socket.on("updatedHasBeenRead", (msgs) => {
      console.log("msgs =", msgs);
      setMessages(msgs);
    });
  }, [socket]);

  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(
        () => flatlistRef.current.scrollToEnd({ animated: true }),
        200
      );
    }
  }, [messages]);

  const sendReadMessagesUpdate = (username, contactUsername) => {
    const params = {
      username,
      contactUsername,
    };
    socket.emit("hasBeenRead", {
      username,
      contactUsername,
    });
    // axios
    //   .post(httpEm + "/updateReadMessages", params)
    //   .then(({ data }) => {})
    //   .catch((err) => console.error(err));
  };

  const setNewMessages = (msgs) => {
    setMessages(msgs);
  };

  const formatMessages = (msgs) => {
    console.log("made it inside formatMessages");
    msgs.forEach((msg) => {
      const content = msg.message_content;
      const msgObj = {
        hasImage: false,
        messageContent: content,
      };
      msg.message_content = msgObj;
    });
    return msgs;
  };

  const handleLongPress = (item) => {
    // handle translate modal
    setItemToTranslate(item);
  };

  const handleCloseTranslateModal = () => {
    setItemToTranslate(null);
  };

  const handleTranslateMessage = () => {
    // access itemToTranslate
  };

  useEffect(() => {
    if (itemToTranslate) {
      setTranslateModalIsVisible(true);
    } else {
      setTranslateModalIsVisible(false);
    }
  }, [itemToTranslate]);

  const addImage = async () => {
    // No permissions request is necessary for launching the image library
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    delete result.cancelled;
    if (!result.canceled) {
      console.log("image result uri:", result);
      setImage(result.assets[0].uri);
    }
    console.log(result);
  };

  const sendMessage = async () => {
    if (!message || message === "") {
      // ToastAndroid
      return;
    }
    const params = {
      username: user.username,
      contactUsername: contactName,
      messageContent: message,
    };
    socket.emit("sendMessage", params);
    setMessage("");
    Keyboard.dismiss();
  };

  const refreshMessages = async () => {
    axios
      .post("http://10.0.2.2:8889/getMessages", {
        username: "iamwintrow",
        contactUsername: "alina.ranok",
      })
      .then(({ data }) => {
        console.log(
          "refreshed messages\n",
          JSON.stringify(data.messageList, null, data.messageList.length)
        );
        data.messageList.forEach((m) => {
          const content = m.message_content;
          const msgObj = {
            hasImage: false,
            messageContent: content,
          };
          m.message_content = msgObj;
        });
        setMessages(data.messageList);
      })
      .catch((err) => console.error(err));
  };

  const goBackToContacts = () => {
    console.log("go back to contacts...");
    putChatClosed();
    navigation.navigate("Chat");
  };

  return (
    <View style={styles.container}>
      {/* <StatusBar
        hidden
        backgroundColor="black"
        style="dark"
        barStyle="dark-content"
      /> */}
      <ImageBackground
        source={Logo}
        style={styles.imageBackground}
        resizeMode="cover"
      >
        {/* <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior="padding"
          enabled={false}
        > */}
        <View style={styles.titleContainer}>
          <Pressable onPress={goBackToContacts} style={styles.goBackIcon}>
            <Ionicons name="arrow-back-circle" size={32} color="white" />
          </Pressable>
          <Text style={styles.title}>{contactName}</Text>
        </View>
        <View>
          <FlatList
            ref={flatlistRef}
            data={messages}
            style={{
              ...styles.flatlist,
              height: keyboardIsVisible ? "100%" : "100%",
            }}
            renderItem={({ item }) => {
              return (
                <Message
                  onLongPress={() => handleLongPress(item)}
                  username={item.username}
                  content={item.message_content}
                  timestamp={item.send_date}
                  isFromUser={item.sender_username === user.username}
                  sender={item.sender_username}
                  recipient={item.recipient_username}
                  has_been_read={item.has_been_read}
                  hasImage={false}
                />
              );
            }}
          />
          <View style={styles.messageInputContainer}>
            <Pressable onPress={addImage} style={styles.addImageIcon}>
              <Ionicons name="add-sharp" size={24} color="white" />
            </Pressable>
            {isSendingImage ? null : (
              // <View>
              //   <Image/>
              //   <Pressable onPress={sendImage}>
              //     <Text>
              //       SEND
              //     </Text>
              //   </Pressable>
              // </View>
              <TextInput
                onChangeText={setMessage}
                onFocus={setIsFocused}
                value={message}
                placeholder="Type a message"
                style={styles.messageInput}
                multiline
              />
            )}
            <Pressable onPress={sendMessage} style={styles.sendIcon}>
              <FontAwesome name="send" size={24} color="white" />
            </Pressable>
          </View>
        </View>
        <Modal
          animationType="slide"
          transparent={true}
          visible={translateModalIsVisible}
        >
          <View style={styles.modal}>
            <View style={styles.modalView}>
              <Text style={styles.modalTitle}>Translate Text</Text>
              <View style={styles.translateView}>
                <Text style={styles.modalButtonText}>
                  {itemToTranslate?.message_content}
                </Text>
              </View>
              <View style={styles.modalButtonsView}>
                <Pressable
                  onPress={handleTranslateMessage}
                  style={styles.modalButton}
                >
                  <Text style={styles.modalButtonText}>Translate</Text>
                </Pressable>
                <Pressable
                  onPress={handleCloseTranslateModal}
                  style={styles.modalButton}
                >
                  <Text style={styles.modalButtonText}>Close</Text>
                </Pressable>
              </View>
            </View>
          </View>
        </Modal>
        {/* </KeyboardAvoidingView> */}
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
    paddingBottom: 40,
    paddingTop: 20,
    // minHeight: Math.round(DEVICE_HEIGHT),
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
    flexDirection: "row",
    // marginBottom: 10,
  },
  title: {
    color: "white",
    fontFamily: "Agright",
    fontSize: 32,
  },
  translateContainer: {
    borderWidth: 6,
    borderColor: "red",
    borderRadius: 12,
    backgroundColor: "black",
    width: DEVICE_WIDTH - 10,
    paddingBottom: 10,
    marginTop: 10,
  },
  translateTextLabel: {
    fontFamily: "Agright",
    fontSize: 18,
    color: "white",
    textAlign: "center",
    padding: 6,
  },
  translateText: {
    fontFamily: "Agright",
    fontSize: 16,
    color: "white",
    alignSelf: "center",
    // paddingLeft: 10,
  },
  translatedText: {
    fontFamily: "Agright",
    fontSize: 14,
    color: "white",
    alignSelf: "center",
    // paddingLeft: 10,
  },
  translateTextInput: {
    backgroundColor: "#5A5A5A",
    color: "white",
    fontFamily: "Agright",
    width: "90%",
    alignSelf: "center",
    // marginLeft: 10,
    // paddingLeft: 5,
    marginBottom: 10,
  },
  checkbox: {
    margin: 8,
    alignSelf: "center",
    // paddingLeft: 10,
  },
  targetLangButton: {
    borderRadius: 12,
    borderColor: "red",
    borderWidth: 2,
    width: "50%",
    alignSelf: "center",
    marginTop: 6,
    marginHorizontal: 6,
    padding: 6,
    backgroundColor: "black",
  },
  targetLangText: {
    fontFamily: "Agright",
    fontSize: 16,
    color: "white",
    textAlign: "center",
  },
  translateButton: {
    borderRadius: 12,
    borderColor: "red",
    borderWidth: 2,
    width: "50%",
    alignSelf: "center",
    marginTop: 6,
    marginHorizontal: 6,
    padding: 6,
    backgroundColor: "black",
  },
  translateButtonText: {
    fontFamily: "Agright",
    fontSize: 16,
    color: "white",
    textAlign: "center",
  },
  flatlist: {
    flexGrow: 0,
    // height: "100%",
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
  /** BELOW */
  message: {
    margin: 6,
    padding: 6,
    borderRadius: 12,
  },
  timestamp: {
    fontFamily: "Agright",
    fontSize: 10,
    color: "white",
    fontStyle: "italic",
    padding: 4,
  },
  messageContent: {
    fontFamily: "Agright",
    fontSize: 16,
    color: "white",
    // fontStyle: 'bold',
  },
  messageList: {},
  messageInputContainer: {
    flexDirection: "row",
    padding: 8,
    // backgroundColor: '#5A5A5A',
    backgroundColor: "#444444",
    borderTopWidth: 2,
    borderColor: "black",
  },
  messageInput: {
    borderWidth: 1,
    borderColor: "black",
    backgroundColor: "grey",
    color: "white",
    fontFamily: "Agright",
    fontSize: 16,
    padding: 4,
    borderRadius: 12,
    width: "82%",
  },
  sendIcon: {
    color: "white",
    padding: 4,
  },
  addImageIcon: {
    padding: 4,
  },
  dateAndTime: {
    flexDirection: "row",
  },
  bottomMessage: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  goBackIcon: {
    alignSelf: "center",
    paddingRight: 20,
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
  modalButton: {
    margin: 5,
    borderRadius: 12,
    borderWidth: 4,
    borderColor: "red",
    width: DEVICE_WIDTH - 200,
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
  },
  modalButtonText: {
    fontFamily: "Agright",
    fontSize: 16,
    color: "white",
  },
  translateView: {
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
  translateText: {
    fontFamily: "Agright",
    fontSize: 16,
    color: "white",
  },
});
