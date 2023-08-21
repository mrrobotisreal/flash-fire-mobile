import { useContext } from "react";
import axios from "axios";

/**
 * Context
 */
import { UserContext } from "../context/UserContext";
import { FlashcardsContext } from "../context/FlashcardsContext";
import { SocketContext } from "../context/SocketContext";

/**
 * Hooks
 */

/**
 * Constants
 */
import ENV from "../env/env.json";
const httpUrlEm = ENV.FLASHCARDS_HTTP_URL_EMULATOR;
const wsUrlEm = ENV.FLASHCARDS_WS_URL_EMULATOR;

export const useGetAllCollections = () => {
  const { user } = useContext(UserContext);
  const { setAllCollections } = useContext(FlashcardsContext);
  const { flashcardsSocket } = useContext(SocketContext);

  const getAllCollections = async () => {
    const params = {
      userId: user.user_id,
      username: user.username,
    };
    axios
      .post(`${httpUrlEm}/getAllCollections`, params)
      .then(({ data }) => {
        setAllCollections(data);
      })
      .catch((err) => console.error(err));
  };

  return {
    getAllCollections,
    flashcardsSocket,
    user,
  };
};

export const useSetCurrentCollection = () => {
  const { allCollections, setCurrentCollection } =
    useContext(FlashcardsContext);

  const _setCurrentCollection = async (name) => {
    const selectedCollection = allCollections.find((c) => c.name === name);
    setCurrentCollection(selectedCollection);
  };

  return {
    _setCurrentCollection,
  };
};

export const useGetCurrentCollection = () => {
  const { currentCollection } = useContext(FlashcardsContext);

  return {
    name: currentCollection.name,
    category: currentCollection.category,
    cards: currentCollection.cards,
  };
};

export const useCreateCollection = () => {
  const { user } = useContext(UserContext);
  const { setAllCollections } = useContext(FlashcardsContext);
  const { flashcardsSocket } = useContext(SocketContext);

  const createCollection = async (collection) => {
    const params = {
      userId: user.user_id,
      username: user.username,
      collection: collection,
    };

    axios
      .post(`${httpUrlEm}/createCollection`, params)
      .then(({ data }) => {
        // maybe this should actually be a socket
        setAllCollections(data);
      })
      .catch((err) => console.error(err));
  };

  return {
    createCollection,
    flashcardsSocket,
    user,
  };
};

/**
 * Helper
 */
export const useClear = () => {
  const { allCollections, setAllCollections } = useContext(FlashcardsContext);

  const clear = async () => {
    setAllCollections([]);
  };

  const get = async () => {
    console.log("get allCollections:\n", allCollections);
  };

  return {
    clear,
    get,
  };
};
