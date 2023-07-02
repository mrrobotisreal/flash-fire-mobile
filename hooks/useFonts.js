import * as Font from 'expo-font';

export default async function useFonts() {
  await Font.loadAsync({
    Fridays: require('../assets/fonts/Fridays-AWjM.ttf'),
    MyChemicalRomance: require('../assets/fonts/MyChemicalRomance-1X5Z.ttf'),
    Toxia: require('../assets/fonts/Toxia-OwOA.ttf'),
    Varukers: require('../assets/fonts/VarukersPersonalUse-K70Be.ttf'),
  })
}