import { createContext, useContext, useState, useEffect } from "react";
import { io } from "socket.io-client";

/**
 * Context
 */
import { UserContext } from "./UserContext";

/**
 * Constants
 */
import ENV from "../env/env.json";
const chatWsEm = ENV.CHAT_WS_URL_EMULATOR;
const chatWsEC2 = ENV.CHAT_WS_URL_EC2;
const flashcardsWsEm = ENV.FLASHCARDS_WS_URL_EMULATOR;

export const SocketContext = createContext();

export const SocketContextProvider = ({ children }) => {
  const { user } = useContext(UserContext);
  const [currentContact, setCurrentContact] = useState(null);
  const [chatSocket, setChatSocket] = useState();
  const [flashcardsSocket, setFlashcardsSocket] = useState();

  useEffect(() => {
    let newChatSocket;
    if (user.user_id) {
      console.log("connecting new chat socket!!");
      newChatSocket = io(chatWsEm, {
        query: {
          id: user.user_id,
          username: user.username,
        },
      });
      // const newSocket = io(chatWsEC2, {
      //   query: user.user_id,
      // });
      setChatSocket(newChatSocket);
    }

    return () => {
      if (user.user_id && newChatSocket) {
        // newChatSocket.close();
      }
    };
  }, [user]);

  useEffect(() => {
    let newFlashcardsSocket;
    if (user.user_id) {
      console.log("connecting new flashcards socket!");
      newFlashcardsSocket = io(flashcardsWsEm);
      // newFlashcardsSocket = io('ws://ec2');
    }
    setFlashcardsSocket(newFlashcardsSocket);

    return () => {
      if (user.user_id && newFlashcardsSocket) {
        // newFlashcardsSocket.close();
      }
    };
  }, [user]);

  const values = {
    chatSocket,
    flashcardsSocket,
    currentContact,
    setCurrentContact,
  };

  return (
    <SocketContext.Provider value={values}>{children}</SocketContext.Provider>
  );
};
