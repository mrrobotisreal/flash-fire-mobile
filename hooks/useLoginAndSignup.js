/**
 * Module Imports
 */
import { useContext } from "react";
import axios from "axios";
/**
 * Context Imports
 */
import { UserContext } from "../context/UserContext";
/**
 * Constants
 */
import ENV from "../env/env.json";
const httpEm = ENV.CHAT_HTTP_URL_EMULATOR;
const httpEC2 = ENV.CHAT_HTTP_URL_EC2;

export const useLogin = () => {
  const { setUser, setIsAuthN } = useContext(UserContext);

  const checkLogin = (username, password) => {
    console.log("checkLogin params:", {
      username,
      password,
    });
    const params = {
      username,
      password,
    };
    axios
      .post(httpEm + "/checkLogin", params)
      .then(({ data }) => {
        console.log("checkLogin data:", data);
        if (data.isAuthN) {
          setUser(data.user);
          setIsAuthN(true);
        } else {
          console.log("user failed to authenticate");
        }
      })
      .catch((err) => console.error(err));
  };

  return {
    checkLogin,
  };
};

export const useSignup = () => {
  const { setUser, setIsAuthN } = useContext(UserContext);

  const createUser = (username, email, password) => {
    const params = {
      username,
      email,
      password,
    };
    axios
      .post(httpEm + "/createUser", params)
      .then(({ data }) => {
        if (data) {
          setUser(data);
          setIsAuthN(true);
        } else {
          console.log("ERROR creating user");
        }
      })
      .catch((err) => console.error(err));
  };

  return {
    createUser,
  };
};

export const useGetUser = () => {
  const { user } = useContext(UserContext);

  return {
    user,
  };
};
