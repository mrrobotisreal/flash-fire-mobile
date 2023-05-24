import { useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import * as SplashScreen from 'expo-splash-screen';
import * as Font from 'expo-font';

/**
 * Components
 */
import Login from './screens/Login';
import Home from './screens/Home';

SplashScreen.preventAutoHideAsync();

const Stack = createNativeStackNavigator();
const loaded = true;
const screenOptions = {
  headerStyle: {
    backgroundColor: '#000000',
  },
  headerTintColor: '#ffffff',
  headerTitleStyle: {
    fontFamily: 'Varukers',
    textAlign: 'center'
  },
  headerTitleAlign: 'center',
}

export default function App() {
  const [appIsReady, setAppIsReady] = useState(false);
  const [isAuthNd, setIsAuthNd] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  const loadFonts = async () => {
    try {
      await Font.loadAsync({
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
    loadFonts();
  }, []);

  useEffect(() => {
    loadHomeScreen();
  }, [appIsReady])

  return (
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
      </Stack.Navigator>
    </NavigationContainer>
    // <View style={styles.container}>
    //   <Text style={styles.text}>Welcome to Flash-Fire!</Text>
    //   <StatusBar style="auto" />
    // </View>
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
