import { useState, useEffect, useContext, useRef } from "react";
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  FlatList,
  Dimensions,
  Image,
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
import { Entypo, FontAwesome5 } from "@expo/vector-icons";
import { Audio } from "expo-av";
import Logo from "../assets/flash-fire-mobile-background-without-logo.gif";
import { DbContext } from "../database/DbContext";
import * as Speech from "expo-speech";
import moment from "moment";

/**
 * Hooks
 */
import { useGetCurrentCollection } from "../hooks/useFlashcards";

const DEVICE_WIDTH = Dimensions.get("window").width;

const SAMPLE_CARDS = [
  {
    id: 0,
    question: "ликую",
    answer: "to rejoice; to exult",
    hasAudio: false,
    audiouri: null,
    hasImage: false,
    imageuri: null,
    lastViewedDate: new Date().toDateString(),
    lastViewedTime: new Date().toTimeString(),
    lastDifficulty: "hard",
    totalViews: 0,
  },
  {
    id: 1,
    question: "каждую неделю Алина ездит в Сальцбург.",
    answer: "Alina travels to Salzburg every week.",
    hasAudio: false,
    audiouri: null,
    hasImage: false,
    imageuri: null,
    lastViewedDate: new Date().toDateString(),
    lastViewedTime: new Date().toTimeString(),
    lastDifficulty: "hard",
    totalViews: 0,
  },
  {
    id: 2,
    question: "Войдите. Очень приятно познакомиться.",
    answer: "Come in. It's very nice to meet you.",
    hasAudio: false,
    audiouri: null,
    hasImage: false,
    imageuri: null,
    lastViewedDate: new Date().toDateString(),
    lastViewedTime: new Date().toTimeString(),
    lastDifficulty: "hard",
    totalViews: 0,
  },
  {
    id: 3,
    question: "Я очень много работал сегодня.",
    answer: "I worked very hard today.",
    hasAudio: true,
    audiouri: null,
    hasImage: false,
    imageuri: null,
    lastViewedDate: new Date().toDateString(),
    lastViewedTime: new Date().toTimeString(),
    lastDifficulty: "hard",
    totalViews: 0,
  },
  {
    id: 4,
    question: "Официально, Алина самая удивительная женщина на свете.",
    answer: "It's official, Alina is the most amazing woman in the world.",
    hasAudio: false,
    audiouri: null,
    hasImage: false,
    imageuri: null,
    lastViewedDate: new Date().toDateString(),
    lastViewedTime: new Date().toTimeString(),
    lastDifficulty: "hard",
    totalViews: 0,
  },
  {
    id: 5,
    question: "Доброе утро, моё прекрасное солнышко.",
    answer: "Good morning, my beautiful sunshine.",
    hasAudio: false,
    audiouri: null,
    hasImage: false,
    imageuri: null,
    lastViewedDate: new Date().toDateString(),
    lastViewedTime: new Date().toTimeString(),
    lastDifficulty: "hard",
    totalViews: 0,
  },
  {
    id: 6,
    question: "Я счастлив, когда ты счастлив, что я счастлив.",
    answer: "I'm happy when you're happy that I'm happy.",
    hasAudio: false,
    audiouri: null,
    hasImage: false,
    imageuri: null,
    lastViewedDate: new Date().toDateString(),
    lastViewedTime: new Date().toTimeString(),
    lastDifficulty: "hard",
    totalViews: 0,
  },
  {
    id: 7,
    question:
      "Я самый счастливый человек на земле, потому что ты есть в моей жизни.",
    answer: "I'm the happiest person on earth, because you are in my life.",
    hasAudio: false,
    audiouri: null,
    hasImage: false,
    imageuri: null,
    lastViewedDate: new Date().toDateString(),
    lastViewedTime: new Date().toTimeString(),
    lastDifficulty: "hard",
    totalViews: 0,
  },
];

export default function Flashcards({ navigation, route }) {
  const { name, category, cards } = useGetCurrentCollection();
  const AudioRef = useRef(new Audio.Sound());
  const [_cards, _setCards] = useState(cards);
  const [collectionName, setCollectionName] = useState();
  // const [category, setCategory] = useState();
  const [showAnswer, setShowAnswer] = useState(false);
  const [selectedCollection, setSelectedCollection] = useState(null);
  const [cardIndex, setCardIndex] = useState(0);
  const [totalCards, setTotalCards] = useState(cards.length);
  const [sound, setSound] = useState();
  const [isPlaying, setIsPlaying] = useState(false);
  const { collectionname } = route.params;
  // const { getCollection, currentCollection, currentFlashcards } = useContext(DbContext);

  useEffect(() => {
    // console.log('incoming name:', collectionname);
    // getCollection(collectionname);
    // getCollection('test_collection');
    populateCards(name, cards);
  }, [name, cards]);

  // useEffect(() => {
  //   if (currentCollection && currentFlashcards) {
  //     populateCards(currentCollection, currentFlashcards);
  //   }
  // }, [currentCollection, currentFlashcards]);

  const populateCards = (name, flashcards) => {
    const cardList = [];
    const soundsObj = {};
    flashcards.forEach((card, i) => {
      console.log("CARD:\n", card);
      if (card.audioUri) {
        soundsObj[card.audioUri] = card.audioUri;
      }
      let ampm;
      let lastViewedTimeArray = moment(card.lastView)
        .format("HH:MM")
        .split(":");
      if (lastViewedTimeArray[0] === "00") {
        lastViewedTimeArray[0] = "12";
      } else if (
        Number(
          lastViewedTimeArray[0] >= 0 && Number(lastViewedTimeArray[0]) <= 12
        )
      ) {
        ampm = "AM";
      } else if (
        Number(
          lastViewedTimeArray[0] >= 13 && Number(lastViewedTimeArray[0]) <= 23
        )
      ) {
        ampm = "PM";
        let numTime = Number(lastViewedTimeArray[0]) - 12;
        lastViewedTimeArray[0] = String(numTime);
      }
      const cardObj = {
        id: i,
        question: card.question,
        answer: card.answer,
        hasAudio: card.audioUri ? true : false,
        audiouri: card.audioUri,
        hasImage: card.imageUri ? true : false,
        imageuri: card.imageUri,
        lastViewedDate: moment(card.lastView).format("MM-DD-YYYY"),
        lastViewedTime: lastViewedTimeArray.join(":") + ampm,
        lastDifficulty: "hard",
        totalViews: 0,
      };
      console.log("formatted CARD:\n", cardObj);
      const soundsObjKeys = Object.keys(soundsObj);
      if (soundsObjKeys.length > 0) {
        // loadSources(soundsObj);
      }
      console.log("soundsObj:", soundsObj);
      cardList.push(cardObj);
    });
    setCollectionName(name);
    // setSelectedCollection(collection);
    _setCards(cardList);
    setTotalCards(cardList.length);
  };

  useEffect(() => {
    // console.log('collectionName updated:', collectionName);
    // console.log('cards updated:', cards);
  }, [collectionName, cards]);

  const goBack = () => {
    console.log("going back...");
    console.log("index =", cardIndex);
    if (cardIndex === 0) {
      setCardIndex(totalCards - 1);
      setShowAnswer(false);
    } else {
      setCardIndex(cardIndex - 1);
      setShowAnswer(false);
    }
  };

  const goNext = () => {
    console.log("going next...");
    console.log("index =", cardIndex);
    if (cardIndex === totalCards - 1) {
      setCardIndex(0);
      setShowAnswer(false);
    } else {
      setCardIndex(cardIndex + 1);
      setShowAnswer(false);
    }
  };

  const revealAnswer = () => {
    setShowAnswer(!showAnswer);
  };

  const finishSession = () => {
    // handle studying logic here
    navigation.navigate("Flashcards");
  };

  const leaveSession = () => {
    navigation.navigate("Flashcards");
  };

  const handleLowConfidence = () => {
    console.log("confidence low");
  };

  const handleMediumConfidence = () => {
    console.log("confidence medium");
  };

  const handleHighConfidence = () => {
    console.log("confidence high");
  };

  const onPlaybackStatusUpdate = ({ uri, didJustFinish }) => {
    if (didJustFinish) {
      console.log("sound did just finish playing!");
      setIsPlaying(false);
    }
  };

  const playSound = async () => {
    console.log("loading sound...");
    console.log("audiouri???", _cards[cardIndex].audiouri);
    const sound = new Audio.Sound();
    sound.setOnPlaybackStatusUpdate(onPlaybackStatusUpdate);
    await sound.loadAsync({
      uri: _cards[cardIndex].audiouri,
    });
    const { isPlaying, isLoaded } = await sound.getStatusAsync();
    console.log("isLoaded?", isLoaded);
    setSound(sound);
    console.log("playing sound....");
    setIsPlaying(true);
    await sound.playAsync();
  };

  useEffect(() => {
    let _isLoaded;
    let _isPlaying;
    if (sound) {
      const { isLoaded, isPlaying } = sound.getStatusAsync();
      _isLoaded = isLoaded;
      _isPlaying = isPlaying;
    }
    if (_isPlaying) {
      console.log("is playing!!!!");
    }
    return sound
      ? () => {
          console.log("unloading sound...");
          sound.unloadAsync();
        }
      : undefined;
  }, [sound]);

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
        // { translateY: offset.value.y },
        { scale: withSpring(isPressed.value ? 1.2 : 1) },
      ],
      backgroundColor: isPressed.value ? "#5A5A5A" : "#000000",
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
      <ImageBackground
        source={Logo}
        style={styles.imageBackground}
        resizeMode="cover"
      >
        <View style={styles.titleContainer}>
          <Text style={styles.title}>{collectionname}</Text>
          <Text style={styles.subtitle}>{`${
            cardIndex + 1
          } of ${totalCards}`}</Text>
        </View>
        <GestureDetector gesture={gesture}>
          {/* <Animated.View style={{
              ...styles.collectionsContainer,
              borderColor: showAnswer ? 'green' : 'red',
            }}> */}
          <View
            style={{
              ...styles.collectionsContainer,
              borderColor: showAnswer ? "green" : "red",
            }}
          >
            <Pressable
              onPress={() => Speech.speak(_cards[cardIndex]?.question)}
            >
              <Text style={styles.cardText}>
                {!showAnswer
                  ? _cards[cardIndex]?.question
                  : _cards[cardIndex]?.answer}
              </Text>
            </Pressable>
            {_cards[cardIndex]?.hasAudio ? (
              <Pressable onPress={playSound}>
                <FontAwesome5
                  style={styles.icon}
                  name="volume-up"
                  size={32}
                  color={isPlaying ? "green" : "white"}
                />
              </Pressable>
            ) : (
              <FontAwesome5
                style={styles.icon}
                name="volume-mute"
                size={32}
                color="grey"
              />
            )}
            {_cards[cardIndex]?.hasImage && (
              <Image
                source={{ uri: _cards[cardIndex]?.imageuri }}
                style={styles.image}
              />
            )}
            <View style={styles.navContainer}>
              <Pressable
                style={{
                  ...styles.navButton,
                  borderColor: showAnswer ? "green" : "red",
                }}
                onPress={goBack}
              >
                {/* <Text></Text> */}
                <Entypo name="triangle-left" size={24} color="white" />
              </Pressable>
              <Pressable
                style={{
                  ...styles.navButton,
                  borderColor: showAnswer ? "green" : "red",
                }}
                onPress={goNext}
              >
                {/* <Text></Text> */}
                <Entypo name="triangle-right" size={24} color="white" />
              </Pressable>
            </View>
            <Pressable
              style={{
                ...styles.revealButton,
                borderColor: showAnswer ? "green" : "red",
              }}
              onPress={revealAnswer}
            >
              <Text style={styles.buttonText}>
                {showAnswer ? "Revealed!" : "Reveal"}
              </Text>
            </Pressable>
            <View style={styles.confidence}>
              <Pressable
                style={{
                  ...styles.confidenceButton,
                  borderColor: "red",
                }}
                onPress={handleLowConfidence}
              >
                <Text style={styles.confidenceText}>Low</Text>
              </Pressable>
              <Pressable
                style={{
                  ...styles.confidenceButton,
                  borderColor: "yellow",
                }}
                onPress={handleMediumConfidence}
              >
                <Text style={styles.confidenceText}>Medium</Text>
              </Pressable>
              <Pressable
                style={{
                  ...styles.confidenceButton,
                  borderColor: "blue",
                }}
                onPress={handleHighConfidence}
              >
                <Text style={styles.confidenceText}>High</Text>
              </Pressable>
            </View>
          </View>
          {/* </Animated.View> */}
        </GestureDetector>
        <Pressable
          style={{
            ...styles.button,
            marginTop: 10,
          }}
          onPress={finishSession}
        >
          <Text style={styles.buttonText}>Finish session</Text>
        </Pressable>
        <Pressable
          style={{
            ...styles.button,
            marginTop: 5,
          }}
          onPress={leaveSession}
        >
          <Text style={styles.buttonText}>Leave session</Text>
        </Pressable>
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "column",
    // marginTop: StatusBar.currentHeight + 10 || 10,
    marginTop: 0,
    backgroundColor: "#000000",
    alignItems: "center",
    justifyContent: "center",
    // paddingTop: 5,
    // paddingBottom: 5,
  },
  imageBackground: {
    flex: 1,
    justifyContent: "center",
    contentFit: "cover",
  },
  image: {
    width: 200,
    height: 150,
    alignSelf: "center",
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
    // marginTop: 5,
    marginBottom: 20,
  },
  title: {
    color: "white",
    fontFamily: "Agright",
    fontSize: 24,
    alignSelf: "center",
  },
  subtitle: {
    color: "white",
    fontFamily: "Agright",
    fontSize: 18,
    alignSelf: "center",
  },
  collectionsContainer: {
    borderWidth: 6,
    // borderColor: 'red',
    borderRadius: 12,
    backgroundColor: "black",
    width: DEVICE_WIDTH - 10,
    height: "60%",
    justifyContent: "center",
    alignItems: "center",
    padding: 15,
    marginTop: 20,
  },
  cardText: {
    color: "white",
    fontFamily: "Agright",
    fontSize: 20,
    marginTop: 5,
  },
  flatlist: {
    flexGrow: 0,
    height: "100%",
  },
  ball: {
    width: 100,
    height: 100,
    borderRadius: 100,
    backgroundColor: "blue",
    alignSelf: "center",
  },
  revealButton: {
    borderWidth: 6,
    // borderColor: 'red',
    borderRadius: 12,
    backgroundColor: "black",
    width: DEVICE_WIDTH - 200,
    justifyContent: "center",
    alignItems: "center",
    padding: 5,
    alignSelf: "center",
  },
  button: {
    borderWidth: 6,
    borderColor: "red",
    borderRadius: 12,
    backgroundColor: "black",
    width: DEVICE_WIDTH - 200,
    justifyContent: "center",
    alignItems: "center",
    padding: 5,
    // marginTop: 5,
    alignSelf: "center",
  },
  buttonText: {
    color: "white",
    fontFamily: "Agright",
    fontSize: 18,
  },
  confidence: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 10,
  },
  confidenceButton: {
    borderWidth: 2,
    // borderColor: 'red',
    borderRadius: 12,
    backgroundColor: "black",
    width: DEVICE_WIDTH - 300,
    justifyContent: "center",
    alignItems: "center",
    padding: 2,
    alignSelf: "center",
    marginHorizontal: 4,
    marginVertical: 12,
  },
  confidenceText: {
    color: "white",
    fontFamily: "Agright",
    fontSize: 10,
  },
  icon: {
    // marginVertical: 20,
    padding: 10,
  },
  navContainer: {
    flexDirection: "row",
    marginVertical: 10,
    padding: 10,
  },
  navButton: {
    marginHorizontal: 20,
    borderWidth: 4,
    // borderColor: 'red',
    borderRadius: 12,
    padding: 10,
  },
});
