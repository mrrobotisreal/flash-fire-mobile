import { useState, useEffect, useRef, useContext } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  FlatList,
  Dimensions,
  Image,
  ImageBackground,
  StatusBar,
  TouchableOpacity,
  Modal,
  ToastAndroid,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Logo from "../assets/flash-fire-mobile-background-without-logo.gif";
import { Icon } from "react-native-elements";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Audio } from "expo-av";
import * as ImagePicker from "expo-image-picker";

/**
 * Hooks
 */
import { useCreateCollection } from "../hooks/useFlashcards";

const DEVICE_WIDTH = Dimensions.get("window").width;

const label = "Select category";

const data = [
  { label: "One", value: "1" },
  { label: "Two", value: "2" },
  { label: "Three", value: "3" },
  { label: "Four", value: "4" },
  { label: "Five", value: "5" },
];

let recordedUri = null;

export default function CreateCollection({ navigation }) {
  const { createCollection, flashcardsSocket, user } = useCreateCollection();
  const [name, setName] = useState();
  const [category, setCategory] = useState();
  const [question, setQuestion] = useState();
  const [answer, setAnswer] = useState();
  const [cards, setCards] = useState([]);
  const [image, setImage] = useState();
  const AudioRecorder = useRef(new Audio.Recording());
  const AudioPlayer = useRef(new Audio.Sound());
  const [audioPermissions, setAudioPermissions] = useState(false);
  const [recording, setRecording] = useState();
  const [isRecording, setIsRecording] = useState(false);
  const [sound, setSound] = useState();
  const [isPlaying, setIsPlaying] = useState(false);

  // Initial Load to get the audio permission
  useEffect(() => {
    GetPermission();
  }, []);

  // Function to get the audio permission
  const GetPermission = async () => {
    const getAudioPerm = await Audio.requestPermissionsAsync();
    setAudioPermissions(getAudioPerm.granted);
  };

  async function startRecording() {
    setIsRecording(true);
    try {
      if (!audioPermissions) {
        console.log("Requesting permissions..");
        await Audio.requestPermissionsAsync();
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: true,
          playsInSilentModeIOS: true,
        });
      }
      // Prepare the Audio Recorder
      await AudioRecorder.current.prepareToRecordAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );

      // Start recording
      await AudioRecorder.current.startAsync();
    } catch (error) {
      console.log("startRecording error:", error);
    }
  }

  async function stopRecording() {
    console.log("Stopping recording..");
    try {
      // Stop recording
      await AudioRecorder.current.stopAndUnloadAsync();

      // Get the recorded URI here
      const result = AudioRecorder.current.getURI();

      if (result) {
        recordedUri = result;
      }

      // Reset the Audio Recorder
      AudioRecorder.current = new Audio.Recording();
    } catch (error) {
      console.log("stopRecording error:", error);
    }
    setIsRecording(false);
  }

  const PlayRecordedAudio = async () => {
    try {
      // Load the Recorded URI
      await AudioPlayer.current.loadAsync({ uri: recordedUri }, {}, true);

      // Get Player Status
      const playerStatus = await AudioPlayer.current.getStatusAsync();

      // Play if song is loaded successfully
      if (playerStatus.isLoaded) {
        console.log("player is loaded");
        if (playerStatus.isPlaying === false) {
          console.log("player about to playAsync");
          AudioPlayer.current.playAsync();
          setIsPlaying(true);
        }
      }
    } catch (error) {
      console.log("PlayRecordedAudio error:", error);
    }
  };

  const StopPlaying = async () => {
    try {
      //Get Player Status
      const playerStatus = await AudioPlayer.current.getStatusAsync();

      // If song is playing then stop it
      if (playerStatus.isLoaded === true)
        await AudioPlayer.current.unloadAsync();

      setIsPlaying(false);
    } catch (error) {
      console.log("StopPlaying error:", error);
    }
  };

  const onPlaybackStatusUpdate = ({ uri, didJustFinish }) => {
    if (didJustFinish) {
      console.log("sound did just finish playing!");
      setIsPlaying(false);
    }
  };

  const playSound = async () => {
    console.log("loading sound...");
    console.log("audiouri???", recordedUri);
    const sound = new Audio.Sound();
    sound.setOnPlaybackStatusUpdate(onPlaybackStatusUpdate);
    await sound.loadAsync({
      uri: recordedUri,
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

  const pickImage = async () => {
    // No permissions request is necessary for launching the image library
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    delete result.cancelled;
    if (!result.canceled) {
      console.log("image result uri:", result);
      setImage(result.assets[0].uri);
    }
    console.log(result);
  };

  const handleAddCard = () => {
    validateCard();
    setCards([
      ...cards,
      {
        question: question,
        answer: answer,
        audioUri: recordedUri ? recordedUri : null,
        imageUri: image ? image : null,
      },
    ]);
    setImage(null);
    recordedUri = null;
    setQuestion("");
    setAnswer("");
    console.log("[CARDS]:", cards);
  };

  const finishCreatingCollection = () => {
    const isValidated = validateCollection();
    const collection = {
      name: name,
      category: category,
      cards: cards,
    };
    // createCollection(collection);
    flashcardsSocket.emit("createCollection", {
      userId: user.user_id,
      username: user.username,
      collection: collection,
    });
    navigation.navigate("Flashcards");
  };

  const cancelCreatingCollection = () => {
    navigation.navigate("Flashcards");
  };

  const validateCard = () => {
    if (!question) {
      ToastAndroid.show("Please enter a question first", ToastAndroid.SHORT);
      return false;
    } else if (!answer) {
      ToastAndroid.show("Please enter an answer first", ToastAndroid.SHORT);
      return false;
    } else {
      return true;
    }
  };

  const validateCollection = () => {
    if (!name) {
      ToastAndroid.show("Please enter a name", ToastAndroid.SHORT);
      return false;
    } else if (!category) {
      ToastAndroid.show("Please enter a category", ToastAndroid.SHORT);
      return false;
    } else if (cards.length === 0) {
      ToastAndroid.show(
        "Please add at least 1 card, or 6+ cards for optimal testing",
        ToastAndroid.SHORT
      );
      return false;
    } else {
      return true;
    }
  };

  /**
   * For dropdown select
   */
  const DropdownButton = useRef();
  const [visible, setVisible] = useState(false);
  const [selected, setSelected] = useState(undefined);
  const [dropdownTop, setDropdownTop] = useState(0);

  const toggleDropdown = () => {
    visible ? setVisible(false) : openDropdown();
  };

  const openDropdown = () => {
    DropdownButton.current.measure(
      (
        _fx: number,
        _fy: number,
        _w: number,
        h: number,
        _px: number,
        py: number
      ) => {
        setDropdownTop(py + h);
      }
    );
    setVisible(true);
  };

  const onItemPress = (item) => {
    setSelected(item);
    setVisible(false);
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity style={styles.item} onPress={() => onItemPress(item)}>
      <Text>{item.label}</Text>
    </TouchableOpacity>
  );

  const renderDropdown = () => {
    return (
      <Modal visible={visible} transparent animationType="none">
        <TouchableOpacity
          style={styles.overlay}
          onPress={() => setVisible(false)}
        >
          <View style={[styles.dropdown, { top: dropdownTop }]}>
            <FlatList
              data={data}
              renderItem={renderItem}
              keyExtractor={(item, index) => index.toString()}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* <ScrollView> */}
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
        style={styles.imageBackground}
        resizeMode="cover"
      >
        <View style={styles.collectionsContainer}>
          <Text style={styles.itemTitle}>New Collection</Text>
          <Text style={styles.itemDescription}>Name:</Text>
          <TextInput
            onChangeText={setName}
            placeholder="Name"
            value={name}
            style={styles.textInput}
          />
          <Text style={styles.itemDescription}>Category:</Text>
          <TextInput
            onChangeText={setCategory}
            placeholder="Category"
            value={category}
            style={styles.textInput}
          />
          <View style={styles.innerContainer}>
            <Text style={styles.itemDescriptionTitle}>
              {`Add cards (${cards.length} cards)`}
            </Text>
            <Text style={styles.itemDescription}>Question:</Text>
            <TextInput
              style={styles.textInput}
              onChangeText={setQuestion}
              placeholder="Question"
              value={question}
            />
            <Text style={styles.itemDescription}>Answer:</Text>
            <TextInput
              style={styles.textInput}
              onChangeText={setAnswer}
              placeholder="Answer"
              value={answer}
            />
            <Text style={styles.itemDescription}>
              {"Record audio (optional):"}
            </Text>
            <View style={styles.audioButtonsContainer}>
              <Pressable
                onPress={isRecording ? stopRecording : startRecording}
                // onPress={stopRecording}
                style={{
                  ...styles.recordAudioButton,
                  borderColor: "red",
                }}
              >
                <MaterialCommunityIcons
                  style={styles.recordAudioIcon}
                  name="record-rec"
                  size={24}
                  color={isRecording ? "red" : "white"}
                />
              </Pressable>
              <Pressable
                onPress={playSound}
                style={{
                  ...styles.recordAudioButton,
                  borderColor: recordedUri
                    ? isPlaying
                      ? "green"
                      : "red"
                    : "grey",
                }}
              >
                <MaterialCommunityIcons
                  style={styles.recordAudioIcon}
                  name="play"
                  size={24}
                  color={recordedUri ? (isPlaying ? "green" : "white") : "grey"}
                />
              </Pressable>
              {recording ? (
                <Text style={styles.itemDescription}>{recordedUri}</Text>
              ) : null}
            </View>
            <Text style={styles.itemDescription}>
              {"Add image (optional):"}
            </Text>
            <View style={styles.audioButtonsContainer}>
              <Pressable onPress={pickImage} style={styles.addImageButton}>
                <Text style={styles.itemDescription}>Pick image</Text>
              </Pressable>
              {image ? (
                <Image source={{ uri: image }} style={styles.image} />
              ) : null}
            </View>
            <Pressable onPress={handleAddCard} style={styles.addCardButton}>
              <Text style={styles.addCardText}>Add card</Text>
            </Pressable>
          </View>
          <View style={styles.bottomButtonsContainer}>
            <Pressable
              onPress={cancelCreatingCollection}
              style={styles.finishCollectionButton}
            >
              <Text style={styles.addCardText}>Cancel</Text>
            </Pressable>
            <Pressable
              onPress={finishCreatingCollection}
              style={styles.finishCollectionButton}
            >
              <Text style={styles.addCardText}>Create</Text>
            </Pressable>
          </View>
          {/* <TouchableOpacity
              ref={DropdownButton}
              onPress={toggleDropdown}
              style={styles.overlay}
            >
              {renderDropdown()}
              <Text style={styles.buttonText}>
                {(!!selected && selected.label) || label}
              </Text>
              <Icon style={styles.icon} type="font-awesome" name="chevron-down" />
            </TouchableOpacity> */}
        </View>
      </ImageBackground>
      {/* </ScrollView> */}
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
  imageBackground: {
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
    paddingBottom: 10,
    // padding: 5,
  },
  innerContainer: {
    borderWidth: 2,
    borderColor: "red",
    borderRadius: 12,
    width: "98%",
    backgroundColor: "black",
    alignSelf: "center",
    // alignSelf: 'self',
    // marginBottom: 10,
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
    alignSelf: "center",
  },
  itemDescription: {
    fontFamily: "Agright",
    fontSize: 13,
    color: "white",
    paddingLeft: 10,
  },
  itemDescriptionTitle: {
    fontFamily: "Agright",
    fontSize: 18,
    color: "white",
    textAlign: "center",
    paddingVertical: 8,
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
  addCardButton: {
    borderRadius: 12,
    borderColor: "red",
    borderWidth: 2,
    width: "40%",
    alignSelf: "center",
    marginVertical: 6,
    padding: 6,
    backgroundColor: "black",
  },
  addCardText: {
    fontFamily: "Agright",
    fontSize: 16,
    color: "white",
    textAlign: "center",
  },
  recordAudioIcon: {
    alignSelf: "center",
  },
  image: {
    width: 200,
    height: 150,
    marginLeft: 10,
  },
  addImageButton: {
    borderRadius: 12,
    borderColor: "red",
    borderWidth: 2,
    width: "30%",
    marginVertical: 6,
    padding: 2,
    marginLeft: 10,
    backgroundColor: "black",
  },
  audioButtonsContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
  },
  recordAudioButton: {
    borderRadius: 12,
    // borderColor: 'red',
    borderWidth: 2,
    width: "10%",
    // alignSelf: 'center',
    marginVertical: 6,
    padding: 2,
    marginLeft: 10,
    backgroundColor: "black",
  },
  finishCollectionButton: {
    borderRadius: 12,
    borderColor: "red",
    borderWidth: 2,
    width: "30%",
    alignSelf: "center",
    marginTop: 6,
    marginHorizontal: 6,
    padding: 6,
    backgroundColor: "black",
  },
  bottomButtonsContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 6,
  },
  /**
   * Dropdown styles
   */
  button: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#efefef",
    height: 50,
    zIndex: 1,
  },
  buttonText: {
    fontFamily: "Agright",
    fontSize: 16,
    color: "white",
    // flex: 1,
    textAlign: "center",
  },
  textInput: {
    backgroundColor: "#5A5A5A",
    color: "white",
    fontFamily: "Agright",
    width: "90%",
    marginLeft: 10,
    paddingLeft: 5,
    marginBottom: 15,
  },
  dropdown: {
    position: "absolute",
    backgroundColor: "#fff",
    width: "100%",
    shadowColor: "#000000",
    shadowRadius: 4,
    shadowOffset: { height: 4, width: 0 },
    shadowOpacity: 0.5,
  },
  overlay: {
    width: "100%",
    height: "100%",
  },
});
