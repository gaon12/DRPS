import React, { useContext } from 'react';
import { SafeAreaView, StyleSheet, ScrollView, Text } from 'react-native';
import { List, Switch, IconButton } from 'react-native-paper';
import * as SecureStore from 'expo-secure-store';
import { SettingsContext } from '../../../../Context';

const LabsScreen = () => {
  const { settings, updateSetting } = useContext(SettingsContext);
  const { webviewUsage, isDarkMode } = settings; // Context에서 웹뷰 사용 여부와 다크모드 설정값 가져오기

  // 사용자가 스위치를 변경할 때 실행되는 함수
  const toggleWebviewUsage = async () => {
    const newWebviewUsage = !webviewUsage;
    // SecureStore에 값 저장
    await SecureStore.setItemAsync('Settings_WebviewUsage', newWebviewUsage ? 'Yes' : 'No');
    // Context 업데이트
    updateSetting('webviewUsage', newWebviewUsage);
  };

  return (
    <SafeAreaView style={[styles.container, isDarkMode ? styles.darkContainer : styles.lightContainer]}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <List.Section>
          <Text style={[styles.text, isDarkMode ? styles.darkText : styles.lightText]}>Experimental Features</Text>
          <List.Item
            title="Webview Usage"
            description="Use in-app browser for links"
            left={() => <IconButton icon="web" color={isDarkMode ? '#FFF' : '#000'} />}
            right={() => <Switch value={webviewUsage} onValueChange={toggleWebviewUsage} />} // Switch 기본 색상 사용
            titleStyle={isDarkMode ? styles.darkText : styles.lightText}
            descriptionStyle={isDarkMode ? styles.darkText : styles.lightText} // 스타일 간소화
          />
        </List.Section>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  lightContainer: {
    backgroundColor: '#FFFFFF',
  },
  darkContainer: {
    backgroundColor: '#1E1E1E',
  },
  scrollContainer: {
    padding: 16,
  },
  text: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  lightText: {
    color: '#000',
  },
  darkText: {
    color: '#FFF',
  },
});

export default LabsScreen;
