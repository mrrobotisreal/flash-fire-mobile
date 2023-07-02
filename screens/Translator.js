import { useState, useEffect } from 'react';
import { View, Text, Pressable, StyleSheet, Dimensions } from 'react-native';
import Checkbox from 'expo-checkbox';

const DEVICE_WIDTH = Dimensions.get('window').width;

export default function Translator({ navigation }) {
  const [isChecked, setIsChecked] = useState(false);
  return (
    <View style={styles.container}>
      <Text style={styles.translateTextTitle}>{'Target language:'}</Text>
      <Text style={styles.translateText}>Russian</Text>
      <Checkbox
        style={styles.checkbox} value={isChecked} onValueChange={setIsChecked}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    // marginTop: StatusBar.currentHeight - 25 || 10,
    marginTop: 0,
    backgroundColor: '#000000',
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 80,
    paddingTop: 80,
  },
  translateContainer: {
    borderWidth: 6,
    borderColor: 'red',
    borderRadius: 12,
    backgroundColor: 'black',
    width: DEVICE_WIDTH - 10,
    paddingBottom: 10,
    // padding: 5,
  },
  translateTextTitle: {
    fontFamily: 'Agright',
    fontSize: 24,
    color: 'white',
    textAlign: 'center',
  },
  translateText: {
    fontFamily: 'Agright',
    fontSize: 16,
    color: 'white',
    // textAlign: 'center',
  },
  checkbox: {
    margin: 8,
  },
});