import React, { useState, useEffect } from 'react';
import { ScrollView, StyleSheet, View, TouchableWithoutFeedback, SafeAreaView, Text, Alert, Linking } from 'react-native';
import { Provider as PaperProvider, List, Switch, Divider, MD3LightTheme, MD3DarkTheme } from 'react-native-paper';
import Toast from 'react-native-toast-message';
import * as SecureStore from 'expo-secure-store';
import { RecoilRoot, useRecoilState } from 'recoil';
import { langState, themeState, webviewState } from '../atom';
import * as WebBrowser from 'expo-web-browser';
import { createStackNavigator } from '@react-navigation/stack';
import SelectLang from '../pages/select_lang/index';

const lightTheme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: '#6200ee',
    secondary: '#03dac4',
    background: '#f6f6f6',
    surface: '#ffffff',
    text: '#000000',
  },
};

const darkTheme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    primary: '#bb86fc',
    secondary: '#03dac6',
    background: '#121212',
    surface: '#121212',
    text: '#ffffff',
  },
};

const toastConfig = {
  info: ({ text1, props }) => (
    <View style={[styles.toast, props.isDarkMode && styles.toastDark]}>
      <Text style={[styles.toastText, props.isDarkMode && styles.toastTextDark]}>{text1}</Text>
    </View>
  ),
  success: ({ text1, props }) => (
    <View style={[styles.toast, props.isDarkMode && styles.toastDark]}>
      <Text style={[styles.toastText, props.isDarkMode && styles.toastTextDark]}>{text1}</Text>
    </View>
  ),
};

const DEVELOPER_MODE_KEY = 'developer_mode';
const VERSION = process.env.EXPO_PUBLIC_VERSION;

function HomeScreen({ navigation }) {
  const [lang, setLang] = useRecoilState(langState);
  const [theme, setTheme] = useRecoilState(themeState);
  const [isWebViewEnabled, setIsWebViewEnabled] = useRecoilState(webviewState);
  const [isDisasterAlertEnabled, setIsDisasterAlertEnabled] = useState(true);
  const [isWeatherAlertEnabled, setIsWeatherAlertEnabled] = useState(true);
  const [isAppNoticeAlertEnabled, setIsAppNoticeAlertEnabled] = useState(true);
  const [versionClickCount, setVersionClickCount] = useState(0);
  const [showSystemMenu, setShowSystemMenu] = useState(false);
  const [result, setResult] = useState(null);

  useEffect(() => {
    (async () => {
      const savedLang = await SecureStore.getItemAsync('langs');
      const savedTheme = await SecureStore.getItemAsync('theme');
      const savedWebView = await SecureStore.getItemAsync('settings_webview');
      const developerMode = await SecureStore.getItemAsync(DEVELOPER_MODE_KEY);

      if (savedLang) {
        setLang(savedLang);
      }

      if (savedTheme) {
        setTheme(savedTheme);
      }

      if (savedWebView) {
        setIsWebViewEnabled(savedWebView === 'true');
      }

      if (developerMode === 'true') {
        setShowSystemMenu(true);
      }
    })();
  }, []);

  useEffect(() => {
    if (versionClickCount > 0) {
      const timer = setTimeout(() => {
        setVersionClickCount(0);
      }, 700);
      return () => clearTimeout(timer);
    }
  }, [versionClickCount]);

  const handleVersionClick = async () => {
    if (showSystemMenu) {
      return;
    }

    const newCount = versionClickCount + 1;
    setVersionClickCount(newCount);

    const remainingClicks = 7 - newCount;

    if (remainingClicks > 0) {
      Toast.show({
        type: 'info',
        text1: `개발자 모드 활성화까지 ${remainingClicks}번 남았습니다.`,
        visibilityTime: 1000,
        props: { isDarkMode: theme === 'dark' },
      });
    } else if (remainingClicks === 0) {
      setShowSystemMenu(true);
      await SecureStore.setItemAsync(DEVELOPER_MODE_KEY, 'true');
      Toast.show({
        type: 'success',
        text1: '개발자 모드가 활성화되었습니다.',
        visibilityTime: 1000,
        props: { isDarkMode: theme === 'dark' },
      });
    }
  };

  const resetSettings = async () => {
    Alert.alert(
      '설정 초기화',
      '정말로 모든 설정을 초기화하시겠습니까?',
      [
        {
          text: '확인',
          onPress: async () => {
            await SecureStore.deleteItemAsync(DEVELOPER_MODE_KEY);
            setShowSystemMenu(false);
            setLang('en');
            setTheme('light');
            setIsWebViewEnabled(false);
            setIsDisasterAlertEnabled(true);
            setIsWeatherAlertEnabled(true);
            setIsAppNoticeAlertEnabled(true);
            await SecureStore.setItemAsync('langs', 'en');
            await SecureStore.setItemAsync('theme', 'light');
            await SecureStore.setItemAsync('settings_webview', 'false');
            Toast.show({
              type: 'success',
              text1: '설정이 초기화되었습니다.',
              visibilityTime: 2000,
              props: { isDarkMode: theme === 'dark' },
            });
          },
        },
        { text: '취소', style: 'cancel' },
      ]
    );
  };

  const openURL = async (url) => {
    if (isWebViewEnabled) {
      let result = await WebBrowser.openBrowserAsync(url);
      setResult(result);
    } else {
      Linking.openURL(url).catch((err) => console.error('An error occurred', err));
    }
  };

  const renderSwitchItem = (title, iconName, value, onValueChange) => (
    <TouchableWithoutFeedback onPress={() => onValueChange(!value)}>
      <View>
        <List.Item
          title={title}
          left={() => <List.Icon icon={iconName} />}
          right={() => (
            <View style={styles.switchContainer}>
              <Switch value={value} onValueChange={onValueChange} />
            </View>
          )}
        />
      </View>
    </TouchableWithoutFeedback>
  );

  return (
    <PaperProvider theme={theme === 'dark' ? darkTheme : lightTheme}>
      <SafeAreaView style={[styles.safeArea, theme === 'dark' && styles.darkBackground]}>
        <ScrollView contentContainerStyle={[styles.container, theme === 'dark' && styles.darkBackground]}>
          <View style={[styles.innerContainer, theme === 'dark' && styles.darkBackground]}>
            {/* 디스플레이 설정 섹션 */}
            <List.Section title="디스플레이">
              {renderSwitchItem("라이트모드/다크모드", "theme-light-dark", theme === 'dark', (value) => {
                const newTheme = value ? 'dark' : 'light';
                setTheme(newTheme);
                SecureStore.setItemAsync('theme', newTheme);
              })}
              <Divider />
              <List.Item
                title="언어값 설정"
                left={() => <List.Icon icon="translate" />}
                onPress={() => navigation.navigate('SelectLang', { returnToPrevious: true })}
              />
            </List.Section>

            {/* 알림 설정 섹션 */}
            <List.Section title="알림 설정">
              {renderSwitchItem("재난문자 알림", "alert", isDisasterAlertEnabled, setIsDisasterAlertEnabled)}
              <Divider />
              {renderSwitchItem("지진 및 기상특보 알림", "weather-lightning-rainy", isWeatherAlertEnabled, setIsWeatherAlertEnabled)}
              <Divider />
              {renderSwitchItem("앱 공지사항 알림", "bell", isAppNoticeAlertEnabled, setIsAppNoticeAlertEnabled)}
            </List.Section>

            {/* 서비스 섹션 */}
            <List.Section title="서비스">
              <List.Item
                title="공지사항"
                left={() => <List.Icon icon="alert-circle-outline" />}
                onPress={() => openURL('https://test.com')}
              />
              <Divider />
              <List.Item
                title="서버 상태 확인"
                left={() => <List.Icon icon="server" />}
                onPress={() => openURL('https://example.com')}
              />
            </List.Section>

            {/* 정보 섹션 */}
            <List.Section title="정보">
              <List.Item
                title="현재 버전"
                description={VERSION}
                left={() => <List.Icon icon="information" />}
                onPress={handleVersionClick}
              />
              <Divider />
              <List.Item
                title="버전 히스토리"
                left={() => <List.Icon icon="history" />}
                onPress={() => {}}
              />
              <Divider />
              <List.Item
                title="설정 초기화"
                left={() => <List.Icon icon="restore" />}
                onPress={resetSettings}
              />
            </List.Section>

            {/* 시스템 섹션 */}
            {showSystemMenu && (
              <List.Section title="시스템">
                {renderSwitchItem("웹뷰로 보기", "web", isWebViewEnabled, async (value) => {
                  setIsWebViewEnabled(value);
                  await SecureStore.setItemAsync('settings_webview', value.toString());
                })}
                <Divider />
                <List.Item
                  title="로그 기록"
                  left={() => <List.Icon icon="file-document" />}
                  onPress={() => {}}
                />
                <Divider />
                <List.Item
                  title="실험실"
                  left={() => <List.Icon icon="flask" />}
                  onPress={() => {}}
                />
              </List.Section>
            )}
          </View>
        </ScrollView>
      </SafeAreaView>
      <Toast config={toastConfig} />
    </PaperProvider>
  );
}

const Stack = createStackNavigator();

export default function App() {
  return (
    <RecoilRoot>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Home" component={HomeScreen} />
          <Stack.Screen name="SelectLang" component={SelectLang} />
        </Stack.Navigator>
    </RecoilRoot>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flexGrow: 1,
    paddingHorizontal: 20,
    marginRight: -30,
  },
  innerContainer: {
    paddingVertical: 10,
  },
  darkBackground: {
    backgroundColor: '#121212',
  },
  switchContainer: {
    justifyContent: 'center',
    alignItems: 'flex-end',
  },
  toast: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    padding: 15,
    borderRadius: 8,
    marginHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  toastDark: {
    backgroundColor: '#333333',
  },
  toastText: {
    color: '#000000',
    fontWeight: 'bold',
    marginLeft: 10,
  },
  toastTextDark: {
    color: '#ffffff',
    fontWeight: 'bold',
    marginLeft: 10,
  },
});
