import { useState, useEffect, useContext } from 'react';
import { View, Text, Pressable, StyleSheet, Dimensions, FlatList } from 'react-native';
import { DbContext } from '../database/DbContext';

const DEVICE_WIDTH = Dimensions.get('window').width;

const tColl = [
  {
    title: 'Fadi gets a job permit',
    content: '"Я люблю Германию", говорит брат Фади. Оба разговаривают по телефону уже почти целый час. Брат Фади звонит из другой страны. "Папа очень доволен работой. Он свободно говорит по-немецки. А я учу каждый день новые слова. Немецкий - тяжёлый язык, но ты выучишь его быстро", говорит он.',
  },
  {
    title: 'David goes to the supermarket',
    content: '«Эй, Дэвид, пойдем в супермаркет», — сказал Йонатан. Они сели в машину Йонатана и поехали в ближайший супермаркет. Когда они прибыли, Дэвид сказал, что им нужно купить молока, хлеба и яиц. «Я плачу на этот раз или ты платишь», — спросил Дэвид Йонатана.'
  },
];

export default function Texts({ navigation }) {
  const { textsCollection, addText, fetchGoogleTexts } = useContext(DbContext);

  const handleAddTexts = () => {};

  return (
    <View style={styles.container}>
      <View style={styles.textsContainer}>
        <FlatList
          data={tColl}
          style={styles.textsFlatList}
          renderItem={() => {}}
        />
      </View>
      <Pressable
        style={styles.addTextsButton}
        onPress={handleAddTexts}
      >
        <Text style={styles.addTextsText}>
          Add texts
        </Text>
      </Pressable>
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
  textsContainer: {
    borderWidth: 6,
    borderColor: 'red',
    borderRadius: 12,
    backgroundColor: 'black',
    width: DEVICE_WIDTH - 10,
    paddingBottom: 10,
    // padding: 5,
  },
  addTextsText: {
    fontFamily: 'Agright',
    fontSize: 16,
    color: 'white',
    textAlign: 'center',
  },
});