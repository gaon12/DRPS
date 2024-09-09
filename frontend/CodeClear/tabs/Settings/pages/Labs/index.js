import React, { useContext, useEffect, useState } from 'react';
import { SafeAreaView, StyleSheet, ScrollView, Text, View } from 'react-native';
import { List, Switch, IconButton, Divider } from 'react-native-paper';
import * as SecureStore from 'expo-secure-store';
import { SettingsContext } from '../../../../Context';

const LabsScreen = () => {
  const { settings, updateSetting } = useContext(SettingsContext);
  const [useWebview, setUseWebview] = useState(settings.useWebview);

  useEffect(() => {
    setUseWebview(settings.useWebview);
  }, [settings.useWebview]);

  const toggleWebviewUsage = async () => {
    const newWebviewUsage = !useWebview;
    setUseWebview(newWebviewUsage);
    await SecureStore.setItemAsync('Settings_WebviewUsage', newWebviewUsage ? 'True' : 'False');
    updateSetting('useWebview', newWebviewUsage);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <List.Section>
          <Text style={styles.text}>Experimental Features</Text>
          <List.Item
            title="Webview Usage"
            description="Use in-app browser for links"
            left={() => <IconButton icon="web" />}
            right={() => <Switch value={useWebview} onValueChange={toggleWebviewUsage} />}
          />
        </List.Section>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  scrollContainer: {
    padding: 16,
  },
  text: {
    color: '#000000',
    fontSize: 16,
  },
});

export default LabsScreen;
