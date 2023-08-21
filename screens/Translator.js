import { useState, useEffect, useRef, useContext } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  Dimensions,
  ImageBackground,
  StatusBar,
  ToastAndroid,
} from "react-native";
import Checkbox from "expo-checkbox";
import Logo from "../assets/flash-fire-mobile-background-without-logo.gif";
import useTranslate from "../hooks/useTranslate";
import { LocaleContext } from "../context/LocaleContext";

const DEVICE_WIDTH = Dimensions.get("window").width;

const sourceLanguages = {
  en: "English",
  en_US: "English",
  ru: "Russian",
  he: "Hebrew",
  vi: "Vietnamese",
  uk: "Ukrainian",
  de: "German",
};

export default function Translator({ navigation }) {
  const { translateText, translatedText } = useTranslate();
  const { currentLang, changeLanguage } = useContext(LocaleContext);
  const RussianTRef = useRef(null);
  const [sourceLanguage, setSourceLanguage] = useState(
    sourceLanguages[currentLang]
  );
  const [sourceLangCode, setSourceLangCode] = useState(currentLang);
  const [currentTargetLanguage, setCurrentTargetLanguage] = useState(null);
  const [targetLangCode, setTargetLangCode] = useState(null);
  const [isSelectingTarget, setIsSelectingTarget] = useState(false);
  const [isSelectingSource, setIsSelectingSource] = useState(false);
  const [isCheckedRussian, setIsCheckedRussian] = useState(false);
  const [isCheckedHebrew, setIsCheckedHebrew] = useState(false);
  const [isCheckedVietnamese, setIsCheckedVietnamese] = useState(false);
  const [isCheckedGerman, setIsCheckedGerman] = useState(false);
  const [sourceEnglish, setSourceEnglish] = useState(false);
  const [sourceRussian, setSourceRussian] = useState(false);
  const [sourceHebrew, setSourceHebrew] = useState(false);
  const [sourceVietnamese, setSourceVietnamese] = useState(false);
  const [sourceGerman, setSourceGerman] = useState(false);
  const [textToBeTranslated, setTextToBeTranslated] = useState(null);

  useEffect(() => {
    switch (currentLang) {
      case "en":
        setSourceEnglish(true);
        setSourceRussian(false);
        setSourceHebrew(false);
        setSourceVietnamese(false);
        setSourceGerman(false);
        break;
      case "ru":
        setSourceRussian(true);
        setSourceEnglish(false);
        setSourceHebrew(false);
        setSourceVietnamese(false);
        setSourceGerman(false);
        break;
      case "he":
        setSourceHebrew(true);
        setSourceEnglish(false);
        setSourceRussian(false);
        setSourceVietnamese(false);
        setSourceGerman(false);
        break;
      case "vi":
        setSourceVietnamese(true);
        setSourceEnglish(false);
        setSourceRussian(false);
        setSourceHebrew(false);
        setSourceGerman(false);
        break;
      case "de":
        setSourceGerman(true);
        setSourceEnglish(false);
        setSourceRussian(false);
        setSourceHebrew(false);
        setSourceVietnamese(false);
        break;
    }
  }, [sourceLanguage]);

  useEffect(() => {
    switch (currentTargetLanguage) {
      case "Russian":
        setTargetLangCode("ru");
        setIsCheckedHebrew(false);
        setIsCheckedVietnamese(false);
        setIsCheckedGerman(false);
        break;
      case "Hebrew":
        setTargetLangCode("he");
        setIsCheckedRussian(false);
        setIsCheckedVietnamese(false);
        setIsCheckedGerman(false);
        break;
      case "Vietnamese":
        setTargetLangCode("vi");
        setIsCheckedRussian(false);
        setIsCheckedHebrew(false);
        setIsCheckedGerman(false);
        break;
      case "German":
        setTargetLangCode("de");
        setIsCheckedRussian(false);
        setIsCheckedHebrew(false);
        setIsCheckedVietnamese(false);
        break;
    }
  }, [currentTargetLanguage]);

  useEffect(() => {
    if (isCheckedRussian) {
      setCurrentTargetLanguage("Russian");
    }
  }, [isCheckedRussian]);
  useEffect(() => {
    if (isCheckedHebrew) {
      setCurrentTargetLanguage("Hebrew");
    }
  }, [isCheckedHebrew]);
  useEffect(() => {
    if (isCheckedVietnamese) {
      setCurrentTargetLanguage("Vietnamese");
    }
  }, [isCheckedVietnamese]);
  useEffect(() => {
    if (isCheckedGerman) {
      setCurrentTargetLanguage("German");
    }
  }, [isCheckedGerman]);

  useEffect(() => {
    if (
      !isCheckedRussian &&
      !isCheckedHebrew &&
      !isCheckedVietnamese &&
      !isCheckedGerman
    )
      setCurrentTargetLanguage(null);
  }, [isCheckedRussian, isCheckedHebrew, isCheckedVietnamese, isCheckedGerman]);

  useEffect(() => {
    switch (sourceLanguage) {
      case "English":
        setSourceLangCode("en");
        setSourceRussian(false);
        setSourceHebrew(false);
        setSourceVietnamese(false);
        setSourceGerman(false);
        break;
      case "Russian":
        setSourceLangCode("ru");
        setSourceEnglish(false);
        setSourceHebrew(false);
        setSourceVietnamese(false);
        setSourceGerman(false);
        break;
      case "Hebrew":
        setSourceLangCode("he");
        setSourceEnglish(false);
        setSourceRussian(false);
        setSourceVietnamese(false);
        setSourceGerman(false);
        break;
      case "Vietnamese":
        setSourceLangCode("vi");
        setSourceEnglish(false);
        setSourceRussian(false);
        setSourceHebrew(false);
        setSourceGerman(false);
        break;
      case "German":
        setSourceLangCode("de");
        setSourceEnglish(false);
        setSourceRussian(false);
        setSourceHebrew(false);
        setSourceVietnamese(false);
        break;
    }
  }, [sourceLanguage]);

  const chooseTargetLanguage = () => {
    if (isSelectingSource) {
      setIsSelectingSource(false);
    }
    setIsSelectingTarget(!isSelectingTarget);
  };

  const chooseSourceLanguage = () => {
    if (isSelectingTarget) {
      setIsSelectingTarget(false);
    }
    setIsSelectingSource(!isSelectingSource);
  };

  const handleTranslate = () => {
    setIsSelectingTarget(false);
    setIsSelectingSource(false);
    if (!sourceLangCode || !targetLangCode) {
      ToastAndroid.show("Please choose a target language", ToastAndroid.SHORT);
      return;
    }
    if (!textToBeTranslated || textToBeTranslated === "") {
      ToastAndroid.show("Please enter text to translate", ToastAndroid.SHORT);
      return;
    }
    translateText(textToBeTranslated, sourceLangCode, targetLangCode);
    setTextToBeTranslated(null);
  };

  useEffect(() => {
    console.log("The translated text is:", translatedText);
  }, [translatedText]);

  return (
    <View style={styles.container}>
      <StatusBar
        hidden
        backgroundColor="black"
        style="dark"
        barStyle="dark-content"
      />
      <ImageBackground
        source={Logo}
        style={styles.imageBackground}
        resizeMode="cover"
      >
        <View style={styles.titleContainer}>
          <Text style={styles.title}>Translator</Text>
        </View>
        <View style={styles.translateContainer}>
          <Text style={styles.translateTextLabel}>{"Target language:"}</Text>
          {isSelectingTarget ? (
            <>
              <Text style={styles.translateText}>Russian</Text>
              <Checkbox
                style={styles.checkbox}
                value={isCheckedRussian}
                onValueChange={setIsCheckedRussian}
                ref={RussianTRef}
              />
              <Text style={styles.translateText}>Hebrew</Text>
              <Checkbox
                style={styles.checkbox}
                value={isCheckedHebrew}
                onValueChange={setIsCheckedHebrew}
              />
              <Text style={styles.translateText}>Vietnamese</Text>
              <Checkbox
                style={styles.checkbox}
                value={isCheckedVietnamese}
                onValueChange={setIsCheckedVietnamese}
              />
              <Text style={styles.translateText}>German</Text>
              <Checkbox
                style={styles.checkbox}
                value={isCheckedGerman}
                onValueChange={setIsCheckedGerman}
              />
              <Pressable
                onPress={chooseTargetLanguage}
                style={styles.targetLangButton}
              >
                {currentTargetLanguage ? (
                  <Text style={styles.targetLangText}>
                    {currentTargetLanguage}
                  </Text>
                ) : (
                  <Text style={styles.targetLangText}>Choose Target</Text>
                )}
              </Pressable>
            </>
          ) : (
            <Pressable
              onPress={chooseTargetLanguage}
              style={styles.targetLangButton}
            >
              {currentTargetLanguage ? (
                <Text style={styles.targetLangText}>
                  {currentTargetLanguage}
                </Text>
              ) : (
                <Text style={styles.targetLangText}>Choose Target</Text>
              )}
            </Pressable>
          )}
          <Text style={styles.translateTextLabel}>
            {"Source language (optional):"}
          </Text>
          {isSelectingSource ? (
            <>
              <Text style={styles.translateText}>English</Text>
              <Checkbox
                style={styles.checkbox}
                value={sourceEnglish}
                onValueChange={setSourceEnglish}
              />
              <Text style={styles.translateText}>Russian</Text>
              <Checkbox
                style={styles.checkbox}
                value={sourceRussian}
                onValueChange={setSourceRussian}
                ref={RussianTRef}
              />
              <Text style={styles.translateText}>Hebrew</Text>
              <Checkbox
                style={styles.checkbox}
                value={sourceHebrew}
                onValueChange={setSourceHebrew}
              />
              <Text style={styles.translateText}>Vietnamese</Text>
              <Checkbox
                style={styles.checkbox}
                value={sourceVietnamese}
                onValueChange={setSourceVietnamese}
              />
              <Text style={styles.translateText}>German</Text>
              <Checkbox
                style={styles.checkbox}
                value={sourceGerman}
                onValueChange={setSourceGerman}
              />
              <Pressable
                onPress={chooseSourceLanguage}
                style={styles.targetLangButton}
              >
                {sourceLanguage ? (
                  <Text style={styles.targetLangText}>{sourceLanguage}</Text>
                ) : (
                  <Text style={styles.targetLangText}>Choose Source</Text>
                )}
              </Pressable>
            </>
          ) : (
            <Pressable
              onPress={chooseSourceLanguage}
              style={styles.targetLangButton}
            >
              {sourceLanguage ? (
                <Text style={styles.targetLangText}>{sourceLanguage}</Text>
              ) : (
                <Text style={styles.targetLangText}>Choose Source</Text>
              )}
            </Pressable>
          )}
          <Text style={styles.translateTextLabel}>
            {"Text to be translated:"}
          </Text>
          <TextInput
            style={styles.translateTextInput}
            onChangeText={setTextToBeTranslated}
            value={textToBeTranslated}
            placeholder="Text to be translated..."
            multiline
          />
          <Pressable style={styles.translateButton} onPress={handleTranslate}>
            <Text style={styles.translateButtonText}>Translate</Text>
          </Pressable>
        </View>
        {translatedText && (
          <View style={styles.translateContainer}>
            <Text style={styles.translateTextLabel}>{"Translated text:"}</Text>
            <Text style={styles.translatedText}>{translatedText}</Text>
          </View>
        )}
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "column",
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
    // marginBottom: 10,
  },
  title: {
    color: "white",
    fontFamily: "Agright",
    fontSize: 32,
  },
  translateContainer: {
    borderWidth: 6,
    borderColor: "red",
    borderRadius: 12,
    backgroundColor: "black",
    width: DEVICE_WIDTH - 10,
    paddingBottom: 10,
    marginTop: 10,
  },
  translateTextLabel: {
    fontFamily: "Agright",
    fontSize: 18,
    color: "white",
    textAlign: "center",
    padding: 6,
  },
  translateText: {
    fontFamily: "Agright",
    fontSize: 16,
    color: "white",
    alignSelf: "center",
    // paddingLeft: 10,
  },
  translatedText: {
    fontFamily: "Agright",
    fontSize: 14,
    color: "white",
    alignSelf: "center",
    // paddingLeft: 10,
  },
  translateTextInput: {
    backgroundColor: "#5A5A5A",
    color: "white",
    fontFamily: "Agright",
    width: "90%",
    alignSelf: "center",
    // marginLeft: 10,
    // paddingLeft: 5,
    marginBottom: 10,
  },
  checkbox: {
    margin: 8,
    alignSelf: "center",
    // paddingLeft: 10,
  },
  targetLangButton: {
    borderRadius: 12,
    borderColor: "red",
    borderWidth: 2,
    width: "50%",
    alignSelf: "center",
    marginTop: 6,
    marginHorizontal: 6,
    padding: 6,
    backgroundColor: "black",
  },
  targetLangText: {
    fontFamily: "Agright",
    fontSize: 16,
    color: "white",
    textAlign: "center",
  },
  translateButton: {
    borderRadius: 12,
    borderColor: "red",
    borderWidth: 2,
    width: "50%",
    alignSelf: "center",
    marginTop: 6,
    marginHorizontal: 6,
    padding: 6,
    backgroundColor: "black",
  },
  translateButtonText: {
    fontFamily: "Agright",
    fontSize: 16,
    color: "white",
    textAlign: "center",
  },
});
