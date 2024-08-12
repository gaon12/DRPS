import React, { useEffect, useState } from 'react';
import { View, Image, StyleSheet, Alert, Appearance } from 'react-native';
import * as SplashScreen from 'expo-splash-screen';
import * as SecureStore from 'expo-secure-store';
import Constants from 'expo-constants';
import { useNavigation } from '@react-navigation/native';
import { RecoilRoot, useSetRecoilState } from 'recoil';
import axios from 'axios';
import { langState, themeState } from './atom';
import { translate } from './translations';

SplashScreen.preventAutoHideAsync();

export default function SplashScreenComponent() {
  const [isReady, setIsReady] = useState(false);
  const [alertMessage, setAlertMessage] = useState(null);
  const setLangState = useSetRecoilState(langState);
  const setThemeState = useSetRecoilState(themeState);
  const navigation = useNavigation();

  const [lang, setLang] = useState(null); // Default language to null
  const systemTheme = Appearance.getColorScheme() || 'light'; // Get system theme

  useEffect(() => {
    const prepare = async () => {
      try {
        console.log('Fetching stored settings...');
        await SecureStore.deleteItemAsync('langs'); // for debugging

        const storedLang = await SecureStore.getItemAsync('langs');
        const storedTheme = (await SecureStore.getItemAsync('theme')) || systemTheme;

        if (storedLang) {
          setLang(storedLang);
          setLangState(storedLang);
          setThemeState(storedTheme);
          console.log('Settings applied:', storedLang, storedTheme);
        }

        console.log('Simulating slow loading...');
        await new Promise((resolve) => setTimeout(resolve, 1000)); // Reduced timeout to make the image appear faster

        if (storedLang) {
          console.log('Checking server status...');
          const serverStatus = await checkServerStatus(storedLang);
          if (serverStatus) {
            console.log('Checking app version...');
            await checkAppVersion(storedLang);
          }
        }
      } catch (e) {
        console.warn(e);
      } finally {
        console.log('Preparation complete');
        setIsReady(true);
        await SplashScreen.hideAsync(); // Hide the splash screen manually
      }
    };

    prepare();
  }, [setLangState, setThemeState]);

  useEffect(() => {
    if (isReady && !alertMessage) {
      if (lang) {
        console.log('Navigating to Home...');
        navigation.replace('tabs');
      } else {
        console.log('Navigating to SelectLang...');
        navigation.replace('SelectLang');
      }
    }
  }, [isReady, alertMessage, navigation, lang]);

  useEffect(() => {
    if (alertMessage) {
      setTimeout(() => {
        showAlert(alertMessage.title, alertMessage.message);
      }, 1000); // Show alert after 1 second delay
    }
  }, [alertMessage]);

  const checkServerStatus = async (lang) => {
    try {
      console.log('Pinging server...');
      const response = await axios.get(`${Constants.expoConfig.extra.SERVER_DOMAIN.replace(/\/$/, '')}/ping`);
      if (response.data.StatusCode !== 200) {
        setAlertMessage({ title: 'Error', message: translate(lang, 'internet_not_available') });
        return false;
      }
      const serverTime = new Date(response.data.RequestTime).getTime();
      const systemTime = new Date().getTime();
      if (Math.abs(serverTime - systemTime) > 5 * 60 * 1000) {
        setAlertMessage({ title: 'Warning', message: translate(lang, 'system_time_warning') });
      }
      return true;
    } catch (error) {
      setAlertMessage({ title: 'Error', message: translate(lang, 'internet_not_available') });
      return false;
    }
  };

  const checkAppVersion = async (lang) => {
    try {
      console.log('Fetching app version...');
      const response = await axios.get(`${Constants.expoConfig.extra.SERVER_DOMAIN.replace(/\/$/, '')}/version`);
      if (response.data.StatusCode !== 200) {
        setAlertMessage({ title: 'Error', message: translate(lang, 'version_check_failed') });
        return;
      }
      const serverVersion = response.data.data.version;
      if (compareVersions(Constants.expoConfig.extra.VERSION, serverVersion) < 0) {
        setAlertMessage({ title: 'Update Available', message: translate(lang, 'update_available') });
      }
    } catch (error) {
      setAlertMessage({ title: 'Error', message: translate(lang, 'version_check_failed') });
    }
  };

  const compareVersions = (v1, v2) => {
    const v1parts = v1.split('-')[0].split('.').map(Number);
    const v2parts = v2.split('-')[0].split('.').map(Number);
    for (let i = 0; i < Math.max(v1parts.length, v2parts.length); i++) {
      const v1part = v1parts[i] || 0;
      const v2part = v2parts[i] || 0;
      if (v1part > v2part) return 1;
      if (v1part < v2part) return -1;
    }
    return 0;
  };

  const showAlert = (title, message) => {
    Alert.alert(
      title,
      message,
      [{ text: 'OK', onPress: () => setAlertMessage(null) }],
      { cancelable: false }
    );
  };

  return (
    <View style={styles.container}>
      <Image source={require('./img/splash/splash.png')} style={styles.image} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fbfaf9',
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
  },
});
