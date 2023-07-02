import { useState, useEffect, useContext } from 'react';
import { Audio } from 'expo-av';

export const SOUNDS = {};

export const useSound = () => {
  // const [sounds, setSounds] = useState({});
  const [sources, setSources] = useState({});
  const [reloadTrueStopFalse, setReloadTrueStopFalse] = useState(true);

  /**
   * Preparing sound
   */
  const prepareSound = async () => {
    await Audio.setIsEnabledAsync(true);
    await Audio.setAudioModeAsync({
      playsInSilentModeIOS: true,
      allowsRecordingIOS: true,
      interruptionModeIOS: Audio.INTERRUPTION_MODE_IOS_DO_NOT_MIX,
      shouldDuckAndroid: false,
      interruptionModeAndroid: Audio.INTERRUPTION_MODE_ANDROID_DO_NOT_MIX,
      playThroughEarpieceAndroid: true,
      staysActiveInBackground: true,
    });
  };

  useEffect(() => {
    prepareSound();
  }, []);

  /**
   * Load all audio uri sources from flashcards in collection
   * @param [{ uri: string}] sources
   */
  const loadSources = (sources) => {
    setSources((prevSources) => ({
      ...prevSources,
      ...sources,
    }));
  };

  const getKeyForUri = (uri) => {
    let foundKey = null;

    Object.keys(sources).some(key => {
      if (sources[key].uri === uri) {
        foundKey = key;
        return true;
      }
    });

    return foundKey;
  };

  const onPlaybackStatusUpdate = ({ uri, didJustFinish }) => {
    if (!didJustFinish) {
      return;
    }

    const key = getKeyForUri(uri);

    if (!key || !SOUNDS[key]) {
      return;
    }

    reloadSoundForKey(key);
  };

  const reloadSoundForKey = (key, initialStatus) => {
    if (reloadTrueStopFalse) {
      unloadSoundForKey(key);
      loadSoundForKey(key, initialStatus);
    } else {
      rewind(key, initialStatus);
    }
  };

  const rewind = async (key, initialStatus) => {
    await SOUNDS[key].stopAsync();
    await SOUNDS[key].setStatusAsync(initialStatus);
  };

  const unloadSoundForKey = async (key) => {
    await SOUNDS[key].unloadAsync();
  };

  const loadSoundForKey = async (key, initialStatus) => {
    await SOUNDS[key].loadAsync(sources[key], initialStatus);
  };

  const playSound = async (uriKey, setIsPlaying) => {
    if (!SOUNDS[uriKey]) {
      SOUNDS[uriKey] = new Audio.Sound();
      SOUNDS[uriKey].setOnPlaybackStatusUpdate(onPlaybackStatusUpdate);
      loadSoundForKey(key, { shouldPlay: true });
    } else {
      const { isPlaying, isLoaded } = await SOUNDS[key].getStatusAsync();
      if (isPlaying) {
        reloadSoundForKey(key, { shouldPlay: true });
      } else if (isLoaded) {
        await SOUNDS[key].playFromPositionAsync(0);
      }
    }
  };

  return {
    loadSources,
    playSound,
  }
};