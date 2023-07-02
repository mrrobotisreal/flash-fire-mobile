import { useState, useEffect, useContext } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, Button } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import 'react-native-gesture-handler';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import * as SplashScreen from 'expo-splash-screen';
import * as Font from 'expo-font';
import { Platform, NativeModules } from 'react-native';
import { IntlProvider } from 'react-intl';
import en from './locales/en.json';
import he from './locales/he.json';
import ru from './locales/ru.json';
import uk from './locales/uk.json';
import vi from './locales/vi.json';

/**
 * Components
 */
import Login from './screens/Login';
import Home from './screens/Home';
import Flashcards from './screens/Flashcards';
import CreateCollection from './screens/CreateCollection';
import StudyMode from './screens/StudyMode';
import Texts from './screens/Texts';
import Translator from './screens/Translator';
import Dictionary from './screens/Dictionary';
import Chat from './screens/Chat';

/**
 * Hooks
 */
import useFonts from './hooks/useFonts';

/**
 * Context
 */
import { LocaleContextProvider, LocaleContext } from './context/LocaleContext';
import { DbContextProvider } from './database/DbContext';

/**
 * Messages (Localization)
 */
const messages = {
  'en': en,
  'en_US': en,
  'he': he,
  'ru': ru,
  'uk': uk,
  'vi': vi,
};
const devicePlatform = Platform.OS;
// console.log('PLATFORM -> ', devicePlatform);
const _deviceLocale = devicePlatform === 'android' ?
  NativeModules.I18nManager.localeIdentifier :
  NativeModules.SettingsManager.settings.AppleLocale ||
  NativeModules.SettingsManager.settings.AppleLanguages[0];
const deviceLocale = _deviceLocale.split(/[-_]/)[0];
// console.log('DEVICE LOCALE -> ', deviceLocale);

SplashScreen.preventAutoHideAsync();

const Stack = createNativeStackNavigator();
const loaded = true;
const screenOptions = {
  headerStyle: {
    backgroundColor: '#000000',
  },
  headerTintColor: '#ffffff',
  headerTitleStyle: {
    fontFamily: 'Agright',
    textAlign: 'center'
  },
  headerTitleAlign: 'center',
};
const subScreenOptions = {
  headerStyle: {
    backgroundColor: 'black',
  },
  headerTintColor: 'white',
  headerTitleStyle: {
    fontFamily: 'Agright',
    textAlign: 'center',
  },
  headerTitleAlign: 'center',
};

export default function App() {
  const [appIsReady, setAppIsReady] = useState(false);
  const [isAuthNd, setIsAuthNd] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [fontsLoaded] = Font.useFonts({
    Agright: require('./assets/fonts/AgrightRegular-qZ5dr.otf'),
    Fridays: require('./assets/fonts/Fridays-AWjM.ttf'),
    MyChemicalRomance: require('./assets/fonts/MyChemicalRomance-1X5Z.ttf'),
    Toxia: require('./assets/fonts/Toxia-OwOA.ttf'),
    Varukers: require('./assets/fonts/VarukersPersonalUse-K70Be.ttf'),
  })

  const { changeLanguage, currentLang } = useContext(LocaleContext);

  const loadFonts = async () => {
    try {
      await Font.loadAsync({
        Agright: require('./assets/fonts/AgrightRegular-qZ5dr.otf'),
        Fridays: require('./assets/fonts/Fridays-AWjM.ttf'),
        MyChemicalRomance: require('./assets/fonts/MyChemicalRomance-1X5Z.ttf'),
        Toxia: require('./assets/fonts/Toxia-OwOA.ttf'),
        Varukers: require('./assets/fonts/VarukersPersonalUse-K70Be.ttf'),
      });
      await new Promise(resolve => setTimeout(resolve, 2000));
    } catch (err) {
      console.error(err, err.stack);
    } finally {
      setAppIsReady(true);
    }
  };

  const loadHomeScreen = async () => {
    if (appIsReady) {
      await SplashScreen.hideAsync();
    }
  };

  useEffect(() => {
    if (fontsLoaded) {
      setAppIsReady(true);
    }
  }, [fontsLoaded]);

  useEffect(() => {
    if (appIsReady) {
      loadHomeScreen();
    }
  }, [appIsReady])

  if (!fontsLoaded) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{flex: 1}}>
      <SafeAreaProvider>
        <DbContextProvider>
          <LocaleContextProvider>
            <IntlProvider messages={messages[currentLang]} locale={deviceLocale} defaultLocale="en">
              <NavigationContainer>
                <Stack.Navigator>
                  {!isAuthNd
                    ? (
                      <Stack.Screen
                        name="Login"
                        component={Login}
                        options={{
                          ...screenOptions,
                          title: 'Geo Rekcart',
                          headerShown: false,
                        }}
                      />
                    )
                    : (
                      <Stack.Screen
                        name="Home"
                        component={Home}
                        options={{
                          ...screenOptions,
                          title: 'Geo Rekcart',
                          headerShown: false,
                        }}
                      />
                    )
                  }
                  <Stack.Screen
                    name="Home"
                    component={Home}
                    options={{
                      ...screenOptions,
                      title: 'Geo Rekcart',
                      headerShown: false,
                    }}
                  />
                  <Stack.Screen
                    name="Flashcards"
                    component={Flashcards}
                    options={{
                      ...subScreenOptions,
                      title: '',
                      headerShown: false,
                    }}
                  />
                  <Stack.Screen
                    name="CreateCollection"
                    component={CreateCollection}
                    options={{
                      ...subScreenOptions,
                      title: '',
                      headerShown: false,
                    }}
                  />
                  <Stack.Screen
                    name="StudyMode"
                    component={StudyMode}
                    options={{
                      ...subScreenOptions,
                      title: '',
                      headerShown: false,
                    }}
                  />
                  <Stack.Screen
                    name="Texts"
                    component={Texts}
                    options={{
                      ...subScreenOptions,
                      title: 'Geo Rekcart',
                      headerShown: false,
                    }}
                  />
                  <Stack.Screen
                    name="Translator"
                    component={Translator}
                    options={{
                      ...subScreenOptions,
                      title: 'Geo Rekcart',
                      headerShown: false,
                    }}
                  />
                  <Stack.Screen
                    name="Dictionary"
                    component={Dictionary}
                    options={{
                      ...screenOptions,
                      title: 'Geo Rekcart',
                      headerShown: false,
                    }}
                  />
                  <Stack.Screen
                    name="Chat"
                    component={Chat}
                    options={{
                      ...subScreenOptions,
                      title: 'Geo Rekcart',
                      headerShown: false,
                    }}
                  />
                </Stack.Navigator>
              </NavigationContainer>
            </IntlProvider>
          </LocaleContextProvider>
        </DbContextProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    color: 'white',
  }
});
