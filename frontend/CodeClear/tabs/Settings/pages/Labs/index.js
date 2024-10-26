import React, { useContext, useState } from 'react';
import { SafeAreaView, StyleSheet, ScrollView, Text, View } from 'react-native';
import { List, Switch, IconButton, Portal, Provider } from 'react-native-paper'; 
import * as SecureStore from 'expo-secure-store';
import { SettingsContext } from '../../../../Context';
import TTSModal from './TTSModal'; // TTSModal import

const LabsScreen = () => {
    const { settings, updateSetting } = useContext(SettingsContext);
    const { webviewUsage, isDarkMode, useOpenStreetMap, useTTs } = settings;
    const [ttsModalVisible, setTtsModalVisible] = useState(false);

    // Toggle functions for settings
    const toggleWebviewUsage = async () => {
        const newWebviewUsage = !webviewUsage;
        await SecureStore.setItemAsync('Settings_WebviewUsage', newWebviewUsage ? 'Yes' : 'No');
        updateSetting('webviewUsage', newWebviewUsage);
    };

    const toggleOpenStreetMapUsage = async () => {
        const newUseOpenStreetMap = !useOpenStreetMap;
        await SecureStore.setItemAsync('Settings_UseOpenStreetMap', newUseOpenStreetMap ? 'Yes' : 'No');
        updateSetting('useOpenStreetMap', newUseOpenStreetMap);
    };

    const toggleTTSUsage = async () => {
        const newUseTTs = !settings.useTTs;
    
        try {
            await SecureStore.setItemAsync('Settings_UseTTs', newUseTTs ? 'Yes' : 'No');
            updateSetting('useTTs', newUseTTs);
    
            if (!newUseTTs) {
                const emptySettings = { language: {}, ttsService: '' };
                await SecureStore.setItemAsync('TTS_Settings', JSON.stringify(emptySettings));
                updateSetting('ttsOption', emptySettings);
            }
    
            setTtsModalVisible(newUseTTs);
        } catch (error) {
            console.error('TTS 설정 저장 중 오류가 발생했습니다:', error);
        }
    };

    const handleSave = async (settings) => {
        try {
            await SecureStore.setItemAsync('TTS_Settings', JSON.stringify(settings));
            console.log('TTS 설정이 저장되었습니다:', settings); // 콘솔 출력
            updateSetting('ttsOption', settings); // Context에 설정 전달
        } catch (error) {
            console.error('설정을 저장하는 중 오류가 발생했습니다:', error);
        }
    };
    

    return (
        <Provider>
            <SafeAreaView style={[styles.container, isDarkMode ? styles.darkContainer : styles.lightContainer]}>
                <ScrollView contentContainerStyle={styles.scrollContainer}>
                    <List.Section>
                        <Text style={[styles.header, isDarkMode ? styles.darkText : styles.lightText]}>
                            Webview Settings
                        </Text>
                        <List.Item
                            title="Webview Usage"
                            description="Use in-app browser for links"
                            left={() => <IconButton icon="web" color={isDarkMode ? '#FFF' : '#000'} />}
                            right={() => <Switch value={webviewUsage} onValueChange={toggleWebviewUsage} />}
                            titleStyle={isDarkMode ? styles.darkText : styles.lightText}
                            descriptionStyle={isDarkMode ? styles.darkText : styles.lightText}
                        />
                    </List.Section>

                    <List.Section>
                        <Text style={[styles.header, isDarkMode ? styles.darkText : styles.lightText]}>
                            Map Settings
                        </Text>
                        <List.Item
                            title="Use OpenStreetMap"
                            description="Use OpenStreetMap; if off, OS default map is used"
                            left={() => <IconButton icon="map" color={isDarkMode ? '#FFF' : '#000'} />}
                            right={() => <Switch value={useOpenStreetMap} onValueChange={toggleOpenStreetMapUsage} />}
                            titleStyle={isDarkMode ? styles.darkText : styles.lightText}
                            descriptionStyle={isDarkMode ? styles.darkText : styles.lightText}
                        />
                    </List.Section>
                    <List.Section>
                        <Text style={[styles.header, isDarkMode ? styles.darkText : styles.lightText]}>
                            TTS Settings
                        </Text>
                        <List.Item
    title="Use TTS"
    left={() => <IconButton icon="microphone" />}
    right={() => <Switch value={settings.useTTs} onValueChange={toggleTTSUsage} />}
/>
{settings.useTTs && <TTSModal onSave={handleSave} />}
                    </List.Section>
                </ScrollView>
            </SafeAreaView>
        </Provider>
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
    header: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    lightText: {
        color: '#000',
    },
    darkText: {
        color: '#FFF',
    },
});

export default LabsScreen;
