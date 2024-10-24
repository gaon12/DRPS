import React, { useState, useEffect, useContext } from 'react';
import { ScrollView, Text, ActivityIndicator, StyleSheet, Alert } from 'react-native';
import { RadioButton, Button, List } from 'react-native-paper';
import axios from 'axios';
import { SettingsContext } from '../../../../Context'; // Context 가져오기

const LANGUAGE_LABELS = {
    ko: '한국어',
    en: '영어',
    ja: '일본어',
    zh: '중국어',
};
const SUPPORTED_LANGUAGES = ['ko', 'en', 'ja', 'zh']; // 지원되는 언어 목록

const TTSModal = ({ onSave }) => {
    const { settings, updateSetting } = useContext(SettingsContext); // 설정 불러오기

    const [ttsList, setTtsList] = useState([]);
    const [loading, setLoading] = useState(false);

    const initialTTS = settings.ttsOption.ttsService || 'gtts';
    const initialLanguage = settings.ttsOption.language || {};

    const [selectedTTS, setSelectedTTS] = useState(initialTTS);
    const [selectedLanguage, setSelectedLanguage] = useState(initialLanguage[settings.language] || '');

    // 선택된 TTS 서비스에 맞는 목록 불러오기
    useEffect(() => {
        if (selectedTTS === 'edgetts') {
            fetchTTSList();
        } else {
            setTtsList([]);
        }
    }, [selectedTTS]);

    const fetchTTSList = async () => {
        setLoading(true);
        try {
            const response = await axios.get(`https://api.gaon.xyz/tts?action=langlist&service=edgetts`);
            const filteredList = response.data.data.filter(item =>
                item.ShortName.startsWith(settings.language) // 현재 앱 언어와 일치하는 옵션만 필터링
            );
            setTtsList(filteredList);
        } catch (error) {
            console.error('Error fetching TTS list:', error.message);
            setTtsList([]);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = () => {
        const newTTSOption = {
            ttsService: selectedTTS,
            language: {
                ...settings.ttsOption.language,
                [settings.language]: selectedLanguage, // 현재 언어에 맞게 저장
            },
        };
        updateSetting('ttsOption', newTTSOption); // Context에 저장
        onSave(newTTSOption);
        Alert.alert('완료', 'TTS 설정이 저장되었습니다.');
    };

    return (
        <ScrollView style={styles.container}>
            <Text style={styles.header}>TTS 서비스 선택</Text>
            <RadioButton.Group
                onValueChange={setSelectedTTS}
                value={selectedTTS} // 초기 선택값 유지
            >
                <RadioButton.Item label="Google TTS" value="gtts" />
                <RadioButton.Item label="Edge TTS" value="edgetts" />
            </RadioButton.Group>

            {selectedTTS === 'edgetts' && (
                <>
                    <Text style={styles.subHeader}>언어 선택: {LANGUAGE_LABELS[settings.language]}</Text>
                    {loading ? (
                        <ActivityIndicator size="large" color="#6200ee" />
                    ) : (
                        ttsList.map((item, index) => (
                            <RadioButton.Item
                                key={index}
                                label={item.ShortName}
                                value={item.ShortName}
                                status={selectedLanguage === item.ShortName ? 'checked' : 'unchecked'}
                                onPress={() => setSelectedLanguage(item.ShortName)}
                            />
                        ))
                    )}
                </>
            )}

            <Button mode="contained" onPress={handleSave} style={styles.saveButton}>
                선택 저장
            </Button>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: { padding: 20 },
    header: { fontSize: 18, fontWeight: 'bold', marginBottom: 10 },
    subHeader: { fontSize: 16, fontWeight: '600', marginTop: 16, marginBottom: 8 },
    saveButton: { marginTop: 20 },
});

export default TTSModal;
