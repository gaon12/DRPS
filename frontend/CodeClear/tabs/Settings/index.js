import React, { useContext, useEffect, useState } from 'react';
import { ScrollView, SafeAreaView, StyleSheet, Text, Alert, TouchableOpacity } from 'react-native';
import { List, Switch, IconButton, Divider, ProgressBar } from 'react-native-paper';
import * as SecureStore from 'expo-secure-store';
import * as WebBrowser from 'expo-web-browser'; // For opening in-app browser
import { Linking } from 'react-native'; // For opening external browser
import * as Updates from 'expo-updates'; // Import Updates for reloading the app
import { SettingsContext } from '../../Context';
import { useNavigation } from '@react-navigation/native';
import Toast from 'react-native-toast-message';

const SettingsScreen = () => {
  const { settings, updateSetting } = useContext(SettingsContext);
  const [isDarkMode, setIsDarkMode] = useState(settings.isDarkMode);
  const [useWebview, setUseWebview] = useState(settings.useWebview); // Fetch Webview usage setting
  const [enableLabs, setEnableLabs] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isPressing, setIsPressing] = useState(false);
  const navigation = useNavigation();

  useEffect(() => {
  const fetchSettings = async () => {
    try {
      const darkModeValue = await SecureStore.getItemAsync('Settings_DarkMode');
      const webviewValue = await SecureStore.getItemAsync('Settings_WebviewUsage');
      const labsValue = await SecureStore.getItemAsync('Settings_Enable_Labs');

      setIsDarkMode(darkModeValue === 'Yes'); // No need to JSON parse, just check string value
      setUseWebview(webviewValue === 'Yes');  // Same for webview
      setEnableLabs(labsValue === 'Yes');     // And for labs mode
    } catch (error) {
      console.error('Failed to load settings:', error); // Log the error for debugging
    }
  };

  fetchSettings();
}, []);


  const toggleDarkMode = async () => {
    const newDarkMode = !isDarkMode;
    setIsDarkMode(newDarkMode);
    await SecureStore.setItemAsync('Settings_DarkMode', newDarkMode ? 'Yes' : 'No'); // Use 'Yes' and 'No'
    updateSetting('isDarkMode', newDarkMode);
  };

  const handleVersionPress = () => {
    navigation.navigate('VersionInfo');
  };

  const handleVersionLongPress = () => {
    if (enableLabs) return;

    setIsPressing(true);
    let progressTimer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 1) {
          clearInterval(progressTimer);
          enableLabsFeature();
          return prev;
        }
        return prev + 0.01;
      });
    }, 50);

    setTimeout(() => {
      setIsPressing(false);
      setProgress(0);
    }, 5000);
  };

  const enableLabsFeature = async () => {
    await SecureStore.setItemAsync('Settings_Enable_Labs', 'Yes'); // Use 'Yes'
    setEnableLabs(true);
    Toast.show({
      type: 'success',
      text1: 'Labs feature enabled!',
      position: 'top',
    });
  };

  const handleReset = () => {
    Alert.alert(
      "Reset Settings",
      "Are you sure you want to reset all settings? This action cannot be undone.",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Yes", 
          onPress: async () => {
            await SecureStore.deleteItemAsync('Settings_DarkMode');
            await SecureStore.deleteItemAsync('Settings_WebviewUsage');
            await SecureStore.deleteItemAsync('Settings_Enable_Labs');
            // Add other keys if necessary

            // Reload the app using expo-updates
            await Updates.reloadAsync(); // Reload the app completely after reset
          }
        }
      ]
    );
  };

  const navigateToLabs = () => {
    navigation.navigate('LabsScreen'); // Navigate to the Labs section
  };

  // Function to handle opening URL based on Webview usage
  const openURL = async (url) => {
    if (useWebview) {
      await WebBrowser.openBrowserAsync(url); // Open in in-app browser
    } else {
      Linking.openURL(url); // Open in external browser
    }
  };

  const iconColor = isDarkMode ? '#ffffff' : '#000000';

  return (
    <SafeAreaView style={isDarkMode ? styles.darkContainer : styles.lightContainer}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* Display Settings */}
        <List.Section>
          <Text style={isDarkMode ? styles.darkText : styles.lightText}>Display Settings</Text>
          <List.Item
            title="Light/Dark Mode"
            description="Set light or dark mode"
            left={() => <IconButton icon="theme-light-dark" color={iconColor} />}
            right={() => <Switch value={isDarkMode} onValueChange={toggleDarkMode} />}
            titleStyle={isDarkMode ? styles.darkText : styles.lightText}
            descriptionStyle={isDarkMode ? styles.darkDescription : styles.lightDescription}
          />
        </List.Section>

        <Divider />

        {/* App Notification */}
        <List.Section>
          <Text style={isDarkMode ? styles.darkText : styles.lightText}>App Notification</Text>
          <List.Item
            title="Set Notification"
            left={() => <IconButton icon="bell-outline" color={iconColor} />}
            onPress={() => { /* Add functionality if needed */ }}
            titleStyle={isDarkMode ? styles.darkText : styles.lightText}
          />
          <List.Item
            title="Server Uptime Check"
            left={() => <IconButton icon="server" color={iconColor} />}
            onPress={() => openURL('https://www.naver.com')} // Navigate to Naver based on webview setting
            titleStyle={isDarkMode ? styles.darkText : styles.lightText}
          />
        </List.Section>

        <Divider />

        {/* App Information */}
        <List.Section>
          <Text style={isDarkMode ? styles.darkText : styles.lightText}>App Information</Text>
          <TouchableOpacity onPress={handleVersionPress} onLongPress={handleVersionLongPress}>
            <List.Item
              title="Version Information"
              description="Version 1.0.0"
              left={() => <IconButton icon="information-outline" color={iconColor} />}
              titleStyle={isDarkMode ? styles.darkText : styles.lightText}
              descriptionStyle={isDarkMode ? styles.darkDescription : styles.lightDescription}
            />
          </TouchableOpacity>
          {isPressing && <ProgressBar progress={progress} color="#6200ee" />}
          {enableLabs && (
            <List.Item
              title="Experimental Features"
              left={() => <IconButton icon="flask" color={iconColor} />}
              onPress={navigateToLabs} // Navigate to Labs on press
              titleStyle={isDarkMode ? styles.darkText : styles.lightText}
            />
          )}
        </List.Section>

        <Divider />

        {/* Other Settings */}
        <List.Section>
          <Text style={isDarkMode ? styles.darkText : styles.lightText}>Other Settings</Text>
          <List.Item
            title="Donation"
            description="Support the project"
            left={() => <IconButton icon="gift-outline" color={iconColor} />}
            onPress={() => { /* Add functionality if needed */ }}
            titleStyle={isDarkMode ? styles.darkText : styles.lightText}
            descriptionStyle={isDarkMode ? styles.darkDescription : styles.lightDescription}
          />
          <List.Item
            title="GitHub/Discord Links"
            left={() => <IconButton icon="github" color={iconColor} />}
            onPress={() => { /* Add functionality if needed */ }}
            titleStyle={isDarkMode ? styles.darkText : styles.lightText}
          />
          <List.Item
            title="Backup Data"
            left={() => <IconButton icon="backup-restore" color={iconColor} />}
            onPress={() => { /* Add functionality if needed */ }}
            titleStyle={isDarkMode ? styles.darkText : styles.lightText}
          />
          <List.Item
            title="Reset Settings"
            left={() => <IconButton icon="restore" color={iconColor} />}
            onPress={handleReset} // Trigger the reset logic
            titleStyle={isDarkMode ? styles.darkText : styles.lightText}
          />
        </List.Section>
      </ScrollView>
      <Toast />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  lightContainer: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  darkContainer: {
    flex: 1,
    backgroundColor: '#121212',
  },
  scrollContainer: {
    padding: 16,
  },
  lightText: {
    color: '#000000',
    fontSize: 16,
    marginBottom: 8,
  },
  darkText: {
    color: '#ffffff',
    fontSize: 16,
    marginBottom: 8,
  },
  lightDescription: {
    color: '#757575',
  },
  darkDescription: {
    color: '#cfcfc',
  },
  darkDescription: {
    color: '#cfcfcf',
  },
});

export default SettingsScreen;

