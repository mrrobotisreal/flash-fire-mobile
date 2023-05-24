import { useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import Modal from 'react-native-modal';

export default function Login() {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <View>
      {/* <ImageBackground
        source={require('../assets/Flash-Fire.gif')}
        style={styles.image}
      > */}
      {/* <Modal
        isVisible={isVisible}
        onRequestClose={() => setIsSearchModalVisible(!isVisible)}
        animationInTiming={1000}
        animationOutTiming={1000}
        backdropTransitionInTiming={1000}
        backdropTransitionOutTiming={1000}
      > */}
        <View style={styles.container}>
          <Text style={styles.text}>
            Login
          </Text>
        </View>
      {/* </Modal> */}
      {/* </ImageBackground> */}
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
  text: {
    color: 'white',
    fontFamily: 'Varukers'
  },
  image: {
    flex: 1,
    contentFit: 'cover'
  }
});