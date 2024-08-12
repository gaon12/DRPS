import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { RecoilRoot, useSetRecoilState } from 'recoil';
import { langState } from '../../atom';
import { createStackNavigator } from '@react-navigation/stack';
import Tabs from '../../tabs'; // Assuming you have a tabs.js file

const Stack = createStackNavigator();

const LanguageSelectionScreen = ({ navigation, route }) => {
  const setLang = useSetRecoilState(langState);

  const handleLanguageSelection = async (language) => {
    await SecureStore.setItemAsync('langs', language);
    setLang(language);
    if (route.params && route.params.returnToPrevious) {
      navigation.goBack();
    } else {
      navigation.replace('Tabs'); // Navigate to Tabs screen directly
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>언어를 선택하세요</Text>
      <TouchableOpacity style={styles.button} onPress={() => handleLanguageSelection('ko')}>
        <Image source={require('../../img/langs/ko.png')} style={styles.flag} />
        <Text style={styles.buttonText}>한국어</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.button} onPress={() => handleLanguageSelection('en')}>
        <Image source={require('../../img/langs/en.png')} style={styles.flag} />
        <Text style={styles.buttonText}>English</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.button} onPress={() => handleLanguageSelection('ja')}>
        <Image source={require('../../img/langs/ja.png')} style={styles.flag} />
        <Text style={styles.buttonText}>日本語</Text>
      </TouchableOpacity>
    </View>
  );
};

const App = () => {
  const [isLanguageSelected, setIsLanguageSelected] = useState(false);

  useEffect(() => {
    const checkLanguageSelection = async () => {
      const language = await SecureStore.getItemAsync('langs');
      if (language) {
        setIsLanguageSelected(true);
      } else {
        setIsLanguageSelected(false);
      }
    };

    checkLanguageSelection();
  }, []);

  return (
    <RecoilRoot>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {isLanguageSelected ? (
          <Stack.Screen name="Tabs" component={Tabs} />
        ) : (
          <Stack.Screen 
            name="LanguageSelection"
            options={{ headerShown: false }}
          >
            {(props) => <LanguageSelectionScreen {...props} />}
          </Stack.Screen>
        )}
      </Stack.Navigator>
    </RecoilRoot>
  );
};

export default App;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 30,
  },
  button: {
    alignItems: 'center',
    backgroundColor: '#007AFF',
    padding: 20,
    borderRadius: 10,
    marginBottom: 15,
    width: '80%',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    marginTop: 10,
  },
  flag: {
    width: 64,
    height: 64,
    borderRadius: 32,
  },
});
