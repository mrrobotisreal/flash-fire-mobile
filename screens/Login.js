import { useState, useEffect,useContext } from 'react';
import { StatusBar } from 'expo-status-bar';
import { ImageBackground, Pressable, StyleSheet, Text, TextInput, View, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Modal from 'react-native-modal';
import { Image } from 'expo-image';
import FlashFire from '../assets/Flash-Fire.gif';
import Logo from '../assets/flash-fire-mobile-background.gif';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import googleLogo from '../assets/Google__G__Logo.png';
import { FormattedMessage } from 'react-intl';

/**
 * Context
 */
import { LocaleContext } from '../context/LocaleContext';
import { DbContext } from '../database/DbContext';

const blurhash =
  '|rF?hV%2WCj[ayj[a|j[az_NaeWBj@ayfRayfQfQM{M|azj[azf6fQfQfQIpWXofj[ayj[j[fQayWCoeoeaya}j[ayfQa{oLj?j[WVj[ayayj[fQoff7azayj[ayj[j[ayofayayayj[fQj[ayayj[ayfjj[j[ayjuayj[';

WebBrowser.maybeCompleteAuthSession();

export default function Login({ navigation }) {
  /**
   * GOOGLE
   */
  const [accessToken, setAccessToken] = useState(null);
  const [user, setUser] = useState(null);
  const [userInfo, setUserInfo] = useState(null);
  const [request, response, promptAsync] = Google.useIdTokenAuthRequest({
    clientId: '694958641806-pbl22vau8p0s2a8d76bdoh0u63itblfk.apps.googleusercontent.com',
    iosClientId: '694958641806-t7f5174jg3qbdk9id7klbbrem9u97p0m.apps.googleusercontent.com',
    androidClientId: '694958641806-8p5sd9i93uuc0o754s3hh87087pq52hk.apps.googleusercontent.com',
  })

  useEffect(() => {
    // handleEffect();
  }, [response, accessToken]);

  const handleEffect = async () => {
    const _user = await getLocalUser();
    console.log("user - HANDLE EFFECT", _user);
    if (!_user) {
      if (response?.type === "success") {
        console.log('response is successful');
        console.log('ACCESS TOKEN', response);
        // setToken(response.authentication.accessToken);
        getUserInfo(response.authentication.accessToken);
      }
    } else {
      setUserInfo(_user);
      console.log("loaded locally");
    }
  }

  const getLocalUser = async () => {
    const data = await AsyncStorage.getItem("@user");
    if (!data) return null;
    return JSON.parse(data);
  };

  const getUserInfo = async (token) => {
    console.log('getting user info now')
    if (!token) return;
    try {
      const response = await fetch(
        "https://www.googleapis.com/userinfo/v2/me",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const _user = await response.json();
      await AsyncStorage.setItem("@user", JSON.stringify(_user));
      setUserInfo(_user);
    } catch (error) {
      // Add your own error handler here
      console.log('THERE IS AN ERROR')
    }
  };

  // const fetchUserInfo = async () => {
  //   let response = await fetch('https://www.googleapis.com/userinfo/v2/me', {
  //     headers: {
  //       Authorization: `Bearer ${accessToken}`,
  //     }
  //   });
  //   const userInfo = await response.json();
  //   setUser(userInfo);
  // };

  const showUserInfo = () => {
    if (user) {
      return (
        <View style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
          <Text style={{fontSize: 35}}>
            <FormattedMessage
              id="login.showUserInfo.google.button"
              defaultMessage="Sign in with Google"
            />
          </Text>
          <Image source={googleLogo} style={{width: 100, height: 'auto'}} />
        </View>
      )
    }
  }

  /**
   * MAIN
   */
  const [isVisible, setIsVisible] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [showLogin, setShowLogin] = useState(true);
  const [submitButtonBorderColor, setSubmitButtonBorderColor] = useState('white');
  const [submitButtonTextColor, setSubmitButtonTextColor] = useState('white');
  const [signupButtonBorderColor, setSignupButtonBorderColor] = useState('white');
  const [signupButtonTextColor, setSignupButtonTextColor] = useState('white');

  const { changeLanguage } = useContext(LocaleContext);
  const { db, currentUser, getUsers, getUserWithGoogle, getUserWithUnameAndPword, addUserWithGoogle, addUserWithUnameAndPword } = useContext(DbContext);

  const handlePressSignup = () => {
    setShowLogin(!showLogin);
  };
  const handlePressInSignup = () => {
    setSignupButtonBorderColor('red');
    setSignupButtonTextColor('red');
  };
  const handlePressOutSignup = () => {
    setSignupButtonBorderColor('white');
    setSignupButtonTextColor('white');
  };

  const handlePressSubmit = () => {
    console.log('[username]', username);
    console.log('[password]', password);
    console.log('[email]', email);
    console.log('[showlogin]', showLogin)
    /**
     * Pretend it's correct for now and move to home screen
     */
    // navigation.navigate('Home');
    // addUserWithUnameAndPword(username, password, email);

    if (showLogin) {
      getUserWithUnameAndPword(username, password);
    } else {
      //
    }

    setUsername('');
    setPassword('');
    setEmail('');
  };
  const handlePressInSubmit = () => {
    setSubmitButtonBorderColor('red');
    setSubmitButtonTextColor('red');
  };
  const handlePressOutSubmit = () => {
    setSubmitButtonBorderColor('white');
    setSubmitButtonTextColor('white');
  };

  useEffect(() => {
    if (currentUser?.isAuthenticated) {
      navigation.navigate('Home');
    }
  }, [currentUser])

  return (
    <View style={styles.container}>
        <ImageBackground
          source={Logo}
          // placeholder={Platform.OS === 'ios' ? blurhash : null}
          // contentFit="cover"
          // transition={1000}
          style={styles.image}
          resizeMode="cover"
        >
        <View style={styles.box}>
          {
            showLogin
            ? (
              <Text style={styles.headerText}>
                <FormattedMessage
                  id="login.login.title"
                  defaultMessage="Login"
                />
              </Text>
            )
            : (
              <Text style={styles.headerText}>
                <FormattedMessage
                  id="login.signup.title"
                  defaultMessage="Signup"
                />
              </Text>
            )
          }
          <View
            style={styles.content}
          >
            <Text
              style={styles.label}
            >
              <FormattedMessage
                id="login.username.label"
                defaultMessage="Username:"
              />
            </Text>
            <TextInput
              placeholder=""
              value={username}
              onChangeText={setUsername}
              style={styles.input}
            />
            <Text
              style={styles.label}
            >
              <FormattedMessage
                id="login.password.label"
                defaultMessage="Password:"
              />
            </Text>
            <TextInput
              placeholder=""
              value={password}
              onChangeText={setPassword}
              style={styles.input}
              secureTextEntry={true}
            />
            {
              !showLogin && (
                <>
                  <Text
                    style={styles.label}
                  >
                    <FormattedMessage
                      id="login.email.label"
                      defaultMessage="Email:"
                    />
                  </Text>
                  <TextInput
                    placeholder=""
                    value={email}
                    onChangeText={setEmail}
                    style={styles.input}
                  />
                </>
              )
            }
          </View>
          <View
            style={styles.buttonContainer}
          >
            <Pressable
              onPress={handlePressSignup}
              onPressIn={handlePressInSignup}
              onPressOut={handlePressOutSignup}
            >
              <View
                style={[
                  styles.button,
                  {
                    borderColor: signupButtonBorderColor,
                  }
                ]}
              >
                {
                  showLogin
                  ? (
                    <Text
                      style={[
                        styles.buttonText,
                        {
                          color: signupButtonTextColor,
                        }
                      ]}
                    >
                      <FormattedMessage
                        id="login.signup.button"
                        defaultMessage="Sign up"
                      />
                    </Text>
                  )
                  : (
                    <Text
                      style={[
                        styles.buttonText,
                        {
                          color: signupButtonTextColor,
                        }
                      ]}
                    >
                      <FormattedMessage
                        id="login.login.button"
                        defaultMessage="Login"
                      />
                    </Text>
                  )
                }
              </View>
            </Pressable>
            <Pressable
              onPress={handlePressSubmit}
              onPressIn={handlePressInSubmit}
              onPressOut={handlePressOutSubmit}
            >
              <View
                style={[
                  styles.button,
                  {
                    borderColor: submitButtonBorderColor,
                  }
                ]}
              >
                <Text
                  style={
                    {
                      ...styles.buttonText,
                      color: submitButtonTextColor,
                    }
                  }
                >
                  <FormattedMessage
                    id="login.submit.button"
                    defaultMessage="Submit"
                  />
                </Text>
              </View>
            </Pressable>
          </View>
          <View style={{
            paddingTop: 5,
            paddingBottom: 5,
            paddingLeft: 0,
            paddingRight: 15,
            borderColor: 'white',
            borderWidth: 4,
            borderRadius: 12,
          }}>
            {user && <ShowUserInfo />}
            {user === null &&
              <>
                <TouchableOpacity
                  // disabled={request}
                  onPress={() => {
                    promptAsync();
                  }}
                  style={{
                    ...styles.googleButtonText,
                    flexDirection: 'row',
                  }}
                >
                  <Image source={googleLogo} style={{width: 100, height: 30}} contentFit="contain" />
                  {
                    showLogin
                    ? (
                      <Text style={styles.googleButtonText}>
                        <FormattedMessage
                          id="login.signin.google.button"
                          defaultMessage="Login with Google"
                        />
                      </Text>
                    )
                    : (
                      <Text style={styles.googleButtonText}>
                        <FormattedMessage
                          id="login.signup.google.button"
                          defaultMessage="Sign up with Google"
                        />
                      </Text>
                    )
                  }
                </TouchableOpacity>
              </>
            }
          </View>
          {/* <View style={{
            ...styles.button,
            borderColor: 'yellow'
          }}>
            <Pressable onPress={() => {
              getUsers();
            }}>
              <Text style={{
                ...styles.buttonText,
                color: 'white'
              }}>
                Click me!
              </Text>
            </Pressable>
          </View> */}
        </View>
      </ImageBackground>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerText: {
    color: 'white',
    fontFamily: 'Agright',
    fontSize: 40,
    padding: 5,
  },
  image: {
    flex: 1,
    // resizeMode: 'cover',
    justifyContent: 'center',
    contentFit: 'cover',
  },
  box: {
    borderColor: 'white',
    borderWidth: 2,
    borderRadius: 12,
    padding: 10,
    width: '90%',
    height: 'auto',
    alignItems: 'center',
    backgroundColor: 'black',
  },
  input: {
    borderRadius: 12,
    backgroundColor: 'white',
    color: 'black',
    marginVertical: 2,
    width: 250,
    justifyContent: 'flex-start',
    fontSize: 20,
    padding: 5,
  },
  label: {
    marginVertical: 2,
    fontFamily: 'Agright',
    color: 'white',
    width: 100,
    justifyContent: 'flex-start',
    textAlign: 'left',
    fontSize: 15,
  },
  buttonContainer: {
    flexDirection: 'row',
    width: 300,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 5,
    paddingBottom: 5,
  },
  button: {
    borderWidth: Platform.OS === 'ios' ? '4px' : 4,
    borderRadius: Platform.OS === 'ios' ? '12px' : 12,
    marginTop: '5%',
    marginHorizontal: '5%',
    alignItems: 'center',
    padding: '5%',
  },
  buttonText: {
    fontSize: 15,
    // fontFamily: 'Varukers',
    fontFamily: 'Agright',
    padding: 2,
  },
  googleButtonText: {
    color: 'white',
    fontSize: 15,
    // fontFamily: 'Varukers'
    fontFamily: 'Agright',
  },
  content: {
    width: 100,
    justifyContent: 'flex-start',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'red',
    borderRadius: 12,
    paddingRight: 160,
    paddingLeft: 160,
    paddingTop: 20,
    paddingBottom: 20,
    // flex: 1,
  }
});