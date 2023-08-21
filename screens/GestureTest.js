import { useState, useEffect } from "react";
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
import Animated, {
  useSharedValue,
  withTiming,
  useAnimatedStyle,
  Easing,
  withSpring,
} from "react-native-reanimated";
import { GestureDetector, Gesture } from "react-native-gesture-handler";
import axios from "axios";
import Logo from "../assets/flash-fire-mobile-background-without-logo.gif";

const DEVICE_WIDTH = Dimensions.get("window").width;

const SAMPLE_CARDS = [
  {
    id: 0,
    name: "Русские карточки",
    description: "These are sample Russian flashcards.",
  },
  {
    id: 1,
    name: "Flashcards tiếng Việt",
    description: "These are sample Vietnamese flashcards.",
  },
  {
    id: 2,
    name: "中文抽認卡",
    description: "These are sample Chinese flashcards.",
  },
  {
    id: 3,
    name: "כרטיסי פלאש בעברית",
    description: "These are sample Hebrew flashcards.",
  },
  {
    id: 4,
    name: "Data structures",
    description: "These are sample data structure flashcards.",
  },
  {
    id: 5,
    name: "Countries",
    description:
      "These are sample culture flashcards from countries around the world.",
  },
  {
    id: 6,
    name: "Alina",
    description:
      "Is amazing and beautiful and cool and I'm so thankful to have her in my life.",
  },
  {
    id: 7,
    name: "Final",
    description:
      "This is the final collection just being used to see if it will make it scrollable.",
  },
];

export default function Flashcards({ navigation, route }) {
  const [collections, setCollections] = useState([]);
  const [selectedCollection, setSelectedCollection] = useState(null);
  const [cardIndex, setCardIndex] = useState(0);
  const [totalCards, setTotalCards] = useState(SAMPLE_CARDS.length);
  const { name } = route.params;

  useEffect(() => {
    setCollections(SAMPLE_CARDS);
  }, []);

  const Item = ({ name, onPress, description }) => (
    <Pressable onPress={onPress} style={styles.item}>
      <Text style={styles.itemTitle}>{name}</Text>
      <Text style={styles.itemDescription}>{description}</Text>
    </Pressable>
  );

  const handleClick = (item) => {
    setSelectedCollection(item.id);
    console.log("You selected:", item.name);
    console.log("With the id:", item.id);
    navigation.navigate("StudyMode", {
      name: item.name,
    });
  };

  /**
   * Gestures here
   */
  const isPressed = useSharedValue(false);
  const offset = useSharedValue({ x: 0, y: 0 });

  const animatedStyles = useAnimatedStyle(() => {
    console.log(`animating... x: ${offset.value.x}; y: ${offset.value.y}`);
    return {
      transform: [
        { translateX: offset.value.x },
        { translateY: offset.value.y },
        { scale: withSpring(isPressed.value ? 1.2 : 1) },
      ],
      backgroundColor: isPressed.value ? "yellow" : "blue",
    };
  });

  const gesture = Gesture.Pan()
    .onBegin(() => {
      "worklet";
      isPressed.value = true;
    })
    .onChange((e) => {
      "worklet";
      offset.value = {
        x: e.changeX + offset.value.x,
        y: e.changeY + offset.value.y,
      };
    })
    .onFinalize(() => {
      "worklet";
      isPressed.value = false;
    });

  return (
    <View style={styles.container}>
      <StatusBar hidden />
      <ImageBackground source={Logo} style={styles.image} resizeMode="cover">
        <View style={styles.titleContainer}>
          <Text style={styles.title}>{name}</Text>
          <Text style={styles.subtitle}>{`${
            cardIndex + 1
          } of ${totalCards}`}</Text>
        </View>
        {/* <GestureDetector> */}
        <View style={styles.collectionsContainer}>
          {/* <View>
              <Text></Text>
            </View> */}
          <GestureDetector gesture={gesture}>
            <Animated.View style={[styles.ball, animatedStyles]} />
          </GestureDetector>
        </View>
        {/* </GestureDetector> */}
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {},
  container: {
    flex: 1,
    flexDirection: "column",
    marginTop: StatusBar.currentHeight + 10 || 10,
    backgroundColor: "#000000",
    alignItems: "center",
    justifyContent: "center",
    paddingBottom: 60,
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
    marginLeft: 0,
    marginRight: 0,
    marginTop: 14,
    marginBottom: 10,
  },
  title: {
    color: "white",
    fontFamily: "Agright",
    fontSize: 24,
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
  ball: {
    width: 100,
    height: 100,
    borderRadius: 100,
    backgroundColor: "blue",
    alignSelf: "center",
  },
});
