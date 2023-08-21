import { useState, useEffect, useContext } from "react";
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  FlatList,
  Dimensions,
  ImageBackground,
  StatusBar,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import axios from "axios";
import Logo from "../assets/flash-fire-mobile-background-without-logo.gif";
import moment from "moment";
// import Tts from 'react-native-tts';

/**
 * Context
 */
import { FlashcardsContext } from "../context/FlashcardsContext";

/**
 * Hooks
 */
import {
  useSetCurrentCollection,
  useClear,
  useGetAllCollections,
} from "../hooks/useFlashcards";

/**
 * Constants
 */
const DEVICE_WIDTH = Dimensions.get("window").width;
const DEVICE_HEIGHT = Dimensions.get("window").height;

export default function Flashcards({ navigation }) {
  const { allCollections } = useContext(FlashcardsContext);
  const { _setCurrentCollection } = useSetCurrentCollection();
  const { clear, get } = useClear();
  const { getAllCollections, flashcardsSocket, user } = useGetAllCollections();
  const [data, setData] = useState([]);
  const [selectedCollection, setSelectedCollection] = useState(null);

  useEffect(() => {
    getAllCollections();
  }, []);

  useEffect(() => {
    flashcardsSocket.on("successfullyStoredCollection", (collections) => {
      console.log("successfullyStoredCollection", collections);
      setData(collections);
    });
  }, [flashcardsSocket]);

  useEffect(() => {
    console.log("collections updated:", allCollections);
    // setCollections(collections);
    setData(allCollections);
  }, [allCollections]);

  const Item = ({
    id,
    collectionname,
    onPress,
    category,
    created,
    lastView,
  }) => (
    <Pressable key={id} id={id} onPress={onPress} style={styles.item}>
      <Text style={styles.itemTitle}>{collectionname}</Text>
      <Text style={styles.itemDescription}>Category - {category}</Text>
      <Text style={styles.itemDescription}>
        Created - {moment(created).fromNow()}
      </Text>
      <Text style={styles.itemDescription}>
        Last viewed - {moment(lastView).fromNow()}
      </Text>
    </Pressable>
  );

  const handleClick = (item) => {
    _setCurrentCollection(item.name);
    console.log("You selected:", item.name);
    console.log("With the id:", item.id);
    navigation.navigate("StudyMode", {
      collectionname: item.name,
    });
  };

  const createCollection = () => {
    navigation.navigate("CreateCollection");
    // getAllCollections();
    // get();
    // setTimeout(() => {
    //   get();
    // }, 500);
    // clear();
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        hidden
        backgroundColor="black"
        // translucent
        style="dark"
        barStyle="dark-content"
      />
      <ImageBackground
        source={Logo}
        // placeholder={Platform.OS === 'ios' ? blurhash : null}
        // contentFit="cover"
        // transition={1000}
        style={styles.image}
        resizeMode="cover"
      >
        <View style={styles.titleContainer}>
          <Text style={styles.title}>Flashcards</Text>
        </View>
        <View style={styles.collectionsContainer}>
          <FlatList
            data={data}
            style={styles.flatlist}
            // inverted
            renderItem={({ item }) => {
              return (
                <Item
                  onPress={() => handleClick(item)}
                  id={item._id}
                  collectionname={item.name}
                  category={item.category}
                  created={item.created}
                  lastview={item.lastView}
                />
              );
            }}
            keyExtractor={(item) => item._id}
          />
        </View>
        <Pressable
          style={styles.createCollectionButton}
          onPress={createCollection}
        >
          <Text style={styles.buttonText}>Create Collection</Text>
        </Pressable>
      </ImageBackground>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: {},
  container: {
    flex: 1,
    flexDirection: "column",
    // marginTop: StatusBar.currentHeight - 25 || 10,
    marginTop: 0,
    backgroundColor: "#000000",
    alignItems: "center",
    justifyContent: "center",
    paddingBottom: 80,
    paddingTop: 80,
  },
  image: {
    flex: 1,
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
    marginBottom: 10,
  },
  title: {
    color: "white",
    fontFamily: "Agright",
    fontSize: 32,
  },
  collectionsContainer: {
    borderWidth: 6,
    borderColor: "red",
    borderRadius: 12,
    backgroundColor: "black",
    width: DEVICE_WIDTH - 10,
    // padding: 5,
  },
  flatlist: {
    flexGrow: 0,
    height: "100%",
  },
  item: {
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "red",
    width: "99%",
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
  itemDescription: {
    fontFamily: "Agright",
    fontSize: 13,
    color: "white",
  },
  createCollectionButton: {
    borderRadius: 12,
    borderColor: "red",
    borderWidth: 2,
    width: "80%",
    alignSelf: "center",
    marginVertical: 6,
    padding: 6,
    backgroundColor: "black",
  },
  buttonText: {
    fontFamily: "Agright",
    fontSize: 16,
    color: "white",
  },
});
