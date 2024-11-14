import React, { useState, useEffect, useContext } from 'react';
import { ScrollView, Text, ActivityIndicator, StyleSheet, Alert } from 'react-native';
import { RadioButton, Button } from 'react-native-paper';
import axios from 'axios';
import { SettingsContext } from '../../../../Context'; // Context 가져오기

const LANGUAGE_LABELS = {
    ko: '한국어',
    en: '영어',
    ja: '일본어',
    zh: '중국어',
};

const TTSModal = ({ onSave }) => {
    const { settings, updateSetting } = useContext(SettingsContext); // 설정 불러오기

    const [ttsList, setTtsList] = useState([]);
    const [loading, setLoading] = useState(false);

    const initialTTS = settings.ttsOption.ttsService || 'gtts';
    const initialLanguage = settings.ttsOption.language || {};

    const [selectedTTS, setSelectedTTS] = useState(initialTTS);
    const [selectedLanguage, setSelectedLanguage] = useState(
        initialLanguage[settings.language] || ''
    );

    // TTS 서비스 변경 시 Edge TTS에 맞는 목록을 불러옴
    useEffect(() => {
        if (selectedTTS === 'edgetts') {
            fetchTTSList();
        } else {
            setTtsList([]); // Google TTS 선택 시 목록 초기화
        }
    }, [selectedTTS]);

    // TTS 목록이 로드된 후 기본 언어 설정
    useEffect(() => {
        if (ttsList.length > 0 && !selectedLanguage) {
            setSelectedLanguage(ttsList[0].ShortName); // 첫 번째 언어 선택
        }
    }, [ttsList]);

    const fetchTTSList = async () => {
        setLoading(true);
        try {
            const response = await axios.get(
                `https://api.gaon.xyz/tts?action=langlist&service=edgetts`
            );
            const filteredList = response.data.data.filter(item =>
                item.ShortName.startsWith(settings.language) // 현재 앱 언어와 일치하는 언어만 표시
            );
            setTtsList(filteredList);
        } catch (error) {
            console.error('TTS 목록 불러오기 오류:', error.message);
            setTtsList([]);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = () => {
        const newTTSOption = {
            ttsService: selectedTTS,
            language: selectedTTS === 'edgetts' 
                ? { ...settings.ttsOption.language, [settings.language]: selectedLanguage }
                : settings.ttsOption.language, // Google TTS는 언어 설정을 변경하지 않음
        };
        updateSetting('ttsOption', newTTSOption);
        onSave(newTTSOption);
        Alert.alert('완료', 'TTS 설정이 저장되었습니다.');
    };

    const renderLanguageOptions = () => {
        if (selectedTTS === 'edgetts') {
            return loading ? (
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
            );
        }
        return null; // Google TTS의 경우 언어 선택 UI 숨김
    };

    return (
        <ScrollView style={styles.container}>
            <Text style={styles.header}>TTS 서비스 선택</Text>
            <RadioButton.Group onValueChange={setSelectedTTS} value={selectedTTS}>
                <RadioButton.Item label="Google TTS" value="gtts" />
                <RadioButton.Item label="Edge TTS" value="edgetts" />
            </RadioButton.Group>

            {selectedTTS === 'edgetts' && (
                <Text style={styles.subHeader}>
                    언어 선택: {LANGUAGE_LABELS[settings.language]}
                </Text>
            )}
            {renderLanguageOptions()}

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
