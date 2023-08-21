/**
 * Module imports
 */
import { useContext, useState, useEffect } from "react";
import axios from "axios";
/**
 * Context imports
 */
import { SocketContext } from "../context/SocketContext";
import { UserContext } from "../context/UserContext";
/**
 * Constants
 */
import ENV from "../env/env.json";
const chatHttpEm = ENV.CHAT_HTTP_URL_EMULATOR;
const chatHttpEC2 = ENV.CHAT_HTTP_URL_EC2;

export const useChat = () => {
  const { chatSocket, currentContact, setCurrentContact } =
    useContext(SocketContext);
  const { user } = useContext(UserContext);
  const [chatSocketId, setChatSocketId] = useState(null);
  const [contactSocketId, setContactSocketId] = useState(null);
  const [chatIsOpen, setChatIsOpen] = useState({
    contact: null,
    isOpen: false,
  });

  useEffect(() => {
    // Initial connection handler
    chatSocket.on("connect", () => {
      console.log("socket is now connected to the socket server");
      const params = {
        username: user.username,
        id: chatSocket.id,
      };
      chatSocket.emit("storeSocketId", params);
      // storeSocketId({
      //   username: user.username,
      //   id: socket.id,
      // });
      setChatSocketId(chatSocket.id);
    });

    // ... handler
  }, [chatSocket]);

  /**
   * Returns
   */
  const getChatSocket = () => {
    return chatSocket;
  };

  const getChatSocketId = () => {
    return chatSocketId;
  };

  const getContactSocketId = () => {
    return contactSocketId;
  };

  const fetchContactSocketId = (contactUsername) => {
    const params = {
      username: user.username,
      contactUsername,
    };
    axios
      .post(`${chatHttpEm}/getContactSocketId`, params)
      .then(({ data }) => {
        console.log("getContactSocketId return data:", data);
        setContactSocketId(data);
      })
      .catch((err) => console.error(err));
  };

  const resetContactSocketId = () => {
    setContactSocketId(null);
  };

  const getCurrentContact = () => {
    return currentContact;
  };

  const setContact = (username) => {
    setCurrentContact(username);
  };

  const putChatOpen = (contact) => {
    setChatIsOpen({
      contact,
      isOpen: true,
    });
  };

  const putChatClosed = () => {
    setChatIsOpen({
      contact: null,
      isOpen: false,
    });
  };

  const getChatIsOpen = () => {
    return chatIsOpen;
  };

  /**
   * Emitters
   */
  const storeSocketId = (params) => {
    chatSocket.emit("storeSocketId", params);
  };

  return {
    getChatSocket,
    getChatSocketId,
    getContactSocketId,
    fetchContactSocketId,
    resetContactSocketId,
    getCurrentContact,
    setContact,
    putChatOpen,
    putChatClosed,
    getChatIsOpen,
  };
};
