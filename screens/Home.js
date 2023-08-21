import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  Dimensions,
  ImageBackground,
  Pressable,
} from "react-native";
import Logo from "../assets/flash-fire-mobile-background-without-logo.gif";

import { useGetUser } from "../hooks/useLoginAndSignup";

const DEVICE_WIDTH = Dimensions.get("window").width;

const MENU_ITEMS = [
  {
    id: "chat",
    title: "Chat",
  },
  {
    id: "dictionary",
    title: "Dictionary",
  },
  {
    id: "translator",
    title: "Translator",
  },
  {
    id: "texts",
    title: "Texts",
  },
  {
    id: "flashcards",
    title: "Flashcards",
  },
];

// const Item = ({ title, onPress }) => (
//   <View onPress={onPress} style={styles.item}>
//     <Text style={styles.itemTitle}>{title}</Text>
//   </View>
// );

export default function Home({ navigation }) {
  const { user } = useGetUser();

  const Item = ({ title, onPress, item }) => (
    <Pressable onPress={onPress} style={styles.item}>
      <Text style={styles.itemTitle}>{title}</Text>
    </Pressable>
  );

  const handleClick = (item) => {
    console.log("THE ITEM TITTLE IS", item.id);
    switch (item.id) {
      case "flashcards":
        navigation.navigate("Flashcards");
        break;
      case "texts":
        navigation.navigate("Texts");
        break;
      case "translator":
        navigation.navigate("Translator");
        break;
      case "dictionary":
        navigation.navigate("Dictionary");
        break;
      case "chat":
        navigation.navigate("Chat");
        break;
    }
  };

  return (
    <View style={styles.container}>
      <ImageBackground source={Logo} style={styles.image} resizeMode="cover">
        <View style={styles.titleContainer}>
          <Text style={styles.title}>FlashFire</Text>
        </View>
        <FlatList
          data={MENU_ITEMS}
          inverted
          renderItem={({ item }) => {
            return (
              <Item onPress={() => handleClick(item)} title={item.title} />
            );
          }}
          keyExtractor={(item) => item.id}
        />
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "column",
    backgroundColor: "#000000",
    alignItems: "center",
    justifyContent: "center",
    // borderWidth: 2,
    // borderColor: 'blue',
    paddingBottom: 80,
  },
  image: {
    flex: 1,
    // resizeMode: 'cover',
    justifyContent: "center",
    contentFit: "cover",
  },
  titleContainer: {
    borderBottomWidth: 6,
    borderColor: "red",
    borderRadius: 12,
    backgroundColor: "black",
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 12,
    marginRight: 12,
    marginTop: 14,
  },
  title: {
    color: "white",
    fontFamily: "Agright",
    fontSize: 32,
  },
  text: {
    color: "white",
  },
  item: {
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "red",
    width: DEVICE_WIDTH - 10,
    alignItems: "center",
    marginLeft: 2,
    marginRight: 2,
    marginTop: 6,
    marginBottom: 6,
    paddingVertical: 6,
    backgroundColor: "#000000",
  },
  itemTitle: {
    fontFamily: "Agright",
    fontSize: 26,
    color: "white",
  },
});
