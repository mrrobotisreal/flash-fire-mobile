import { useState, useEffect, createContext } from 'react';
import { Platform, NativeModules } from 'react-native';
import en from '../locales/en.json';
import he from '../locales/he.json';
import ru from '../locales/ru.json';
import uk from '../locales/uk.json';
import vi from '../locales/vi.json';

/**
 * Messages (Localization)
 */
const messages = {
  'en': en,
  'en_US': en,
  'he': he,
  'ru': ru,
  'uk': uk,
  'vi': vi,
};
const devicePlatform = Platform.OS;
const _deviceLocale = devicePlatform === 'android' ?
  NativeModules.I18nManager.localeIdentifier :
  NativeModules.SettingsManager.settings.AppleLocale ||
  NativeModules.SettingsManager.settings.AppleLanguages[0];
const deviceLocale = _deviceLocale.split(/[-_]/)[0];

export const LocaleContext = createContext({
  currentLang: deviceLocale,
  changeLanguage: () => {},
});

export function LocaleContextProvider({ children }) {
  const [currentLang, setCurrentLang] = useState(deviceLocale || 'en');

  const changeLanguage = (newLang) => {
    setCurrentLang(newLang);
  };

  const values = {
    currentLang,
    changeLanguage,
  };

  return (
    <LocaleContext.Provider value={values}>
      {children}
    </LocaleContext.Provider>
  )
}