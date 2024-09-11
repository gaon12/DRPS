import React, { useState, useEffect, useContext } from 'react';
import { View, Text, ScrollView, ActivityIndicator, StyleSheet, TouchableOpacity, Modal, Share, TouchableWithoutFeedback } from 'react-native';
import axios from 'axios';
import { useRoute } from '@react-navigation/native';
import * as Speech from 'expo-speech';
import { MaterialIcons, AntDesign } from '@expo/vector-icons';
import { SettingsContext } from '../../Context';
import * as SecureStore from 'expo-secure-store';

const NewsDetail = () => {
  const route = useRoute();
  const { yna_no } = route.params;
  const [newsData, setNewsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [summary, setSummary] = useState('');
  const [alternativeSummary, setAlternativeSummary] = useState('');
  const [showAlternative, setShowAlternative] = useState(false);
  const [settingsLang, setSettingsLang] = useState('ko');

  const { settings } = useContext(SettingsContext);
  const isDarkMode = settings.isDarkMode;

  useEffect(() => {
    const fetchSettingsLang = async () => {
      const lang = await SecureStore.getItemAsync('Settings_Language');
      setSettingsLang(lang || 'ko');
    };

    const fetchNewsData = async () => {
      try {
        const response = await axios.get(`https://apis.uiharu.dev/drps/news/api.php`, {
          params: { yna_no },
        });
        if (response.data.StatusCode === 200) {
          let cleanedData = cleanContent(response.data.data[0]);
          if (settingsLang !== 'ko') {
            cleanedData = await translateContent(cleanedData);
          }
          setNewsData(cleanedData);
        } else {
          setError('뉴스 데이터를 가져오는데 실패했습니다.');
        }
      } catch (err) {
        setError('요청 중 오류가 발생했습니다.');
      } finally {
        setLoading(false);
      }
    };

    fetchSettingsLang();
    fetchNewsData();
  }, [yna_no, settingsLang]);

  const cleanContent = (data) => {
    const { yna_cn, yna_ttl } = data;
    const cleanedContent = yna_cn
      .split('\n')
      .filter((line, index) => !(index === 0 && line.trim() === yna_ttl.trim()))
      .map((line) => line.replace(/.+=연합뉴스\) .+ 기자 = /, '').replace(/\s{2,}/g, ' ').trim())
      .filter((line) => line !== '');

    data.yna_cn = cleanedContent.join('\n');
    return data;
  };

  const translateContent = async (data) => {
    try {
      const response = await axios.post('https://apis.uiharu.dev/trans/api2.php', {
        transSentence: `${data.yna_ttl}\n${data.yna_cn}`,
        originLang: 'ko',
        targetLang: settingsLang,
      });
      if (response.data.StatusCode === 200) {
        const [translatedTitle, ...translatedContent] = response.data.translatedText.split('\n');
        data.yna_ttl = translatedTitle;
        data.yna_cn = translatedContent.join('\n');
      }
    } catch (error) {
      console.error('번역 중 오류가 발생했습니다:', error);
    }
    return data;
  };

  const handleShare = async () => {
    if (newsData) {
      try {
        await Share.share({
          message: `${newsData.yna_ttl}\n\n${newsData.yna_cn}`,
        });
      } catch (error) {
        console.log('공유 실패:', error);
      }
    }
  };

  const handleTTS = () => {
    if (isSpeaking) {
      Speech.stop();
      setIsSpeaking(false);
    } else {
      Speech.speak(newsData.yna_cn, { language: settingsLang });
      setIsSpeaking(true);
    }
  };

  const toggleModal = async () => {
    setModalVisible(!modalVisible);
    if (!modalVisible && !summary) {
      await fetchSummary();
    }
  };

  const fetchSummary = async () => {
    try {
      const response = await axios.post('https://apis.uiharu.dev/summarize', {
        text: newsData.yna_cn,
      });
      if (response.data.StatusCode === 200) {
        setSummary(response.data.data.result);
        setAlternativeSummary(response.data.data.result2);
      }
    } catch (error) {
      console.error('요약 요청 중 오류가 발생했습니다:', error);
    }
  };

  const toggleAlternativeSummary = () => {
    setShowAlternative(!showAlternative);
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  if (!newsData) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>뉴스 데이터를 찾을 수 없습니다.</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={isDarkMode ? darkStyles.container : styles.container} style={isDarkMode ? darkStyles.scrollView : styles.scrollView}>
      <Text style={isDarkMode ? darkStyles.title : styles.title}>{newsData.yna_ttl}</Text>
      <View style={isDarkMode ? darkStyles.metaContainer : styles.metaContainer}>
        <Text style={isDarkMode ? darkStyles.subtitle : styles.subtitle}>
          {newsData.yna_reg_ymd} | {newsData.team_nm}
        </Text>
        <View style={styles.iconContainer}>
          <TouchableOpacity onPress={handleShare} style={styles.iconButton}>
            <MaterialIcons name="share" size={20} color={isDarkMode ? '#fff' : 'black'} />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleTTS} style={styles.iconButton}>
            <MaterialIcons name={isSpeaking ? 'volume-off' : 'volume-up'} size={20} color={isDarkMode ? '#fff' : 'black'} />
          </TouchableOpacity>
          <TouchableOpacity onPress={toggleModal} style={styles.iconButton}>
            <AntDesign name="filetext1" size={20} color={isDarkMode ? '#fff' : 'black'} />
          </TouchableOpacity>
        </View>
      </View>

      <Modal
        visible={modalVisible}
        animationType="fade"
        transparent={true}
        onRequestClose={toggleModal}
      >
        <TouchableWithoutFeedback onPress={toggleModal}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback>
              <View style={isDarkMode ? darkStyles.modalContainer : styles.modalContainer}>
                <View style={styles.modalContent}>
                  <View style={styles.modalHeader}>
                    <Text style={isDarkMode ? darkStyles.modalTitle : styles.modalTitle}>요약</Text>
                    <TouchableOpacity onPress={toggleAlternativeSummary} style={styles.refreshButton}>
                      <AntDesign name="sync" size={16} color={isDarkMode ? '#fff' : 'black'} />
                    </TouchableOpacity>
                  </View>
                  <View style={styles.separator}></View>
                  <View style={isDarkMode ? darkStyles.summaryContainer : styles.summaryContainer}>
                    <Text style={isDarkMode ? darkStyles.summaryText : styles.summaryText}>
                      {showAlternative ? alternativeSummary : summary}
                    </Text>
                  </View>
                  <View style={styles.separator}></View>
                  <Text style={isDarkMode ? darkStyles.infoText : styles.infoText}>
                    본문의 주요 내용을 간추려 보여주기 때문에, 전체적인 맥락을 이해하려면 기사 전문을 읽는 것이 좋습니다.
                  </Text>
                  <TouchableOpacity onPress={toggleModal} style={styles.closeButton}>
                    <Text style={styles.closeButtonText}>닫기</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      <Text style={isDarkMode ? darkStyles.body : styles.body}>{newsData.yna_cn}</Text>
    </ScrollView>
  );
};

const baseStyles = {
  container: {
    padding: 20,
    backgroundColor: 'white',
  },
  scrollView: {
    backgroundColor: 'white',
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  metaContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  subtitle: {
    fontSize: 16,
    color: '#888',
  },
  iconContainer: {
    flexDirection: 'row',
  },
  iconButton: {
    marginHorizontal: 8,
  },
  body: {
    fontSize: 18,
    lineHeight: 26,
    color: '#444',
    marginBottom: 20,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  modalContainer: {
    width: '85%',
    padding: 20,
    backgroundColor: 'white',
    borderRadius: 15,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  summaryContainer: {
    paddingHorizontal: 15,
    paddingVertical: 10,
    backgroundColor: '#f0f0f0',
    borderRadius: 10,
    marginBottom: 20,
  },
  summaryText: {
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
    lineHeight: 24,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#333',
    flex: 1,
  },
  refreshButton: {
    padding: 10,
  },
  separator: {
    width: '100%',
    height: 1,
    backgroundColor: '#ddd',
    marginVertical: 10,
  },
  infoText: {
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
    marginTop: 10,
  },
  closeButton: {
    marginTop: 20,
    paddingVertical: 10,
    paddingHorizontal: 25,
    backgroundColor: '#2196F3',
    borderRadius: 20,
  },
  closeButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
};

const darkStyles = StyleSheet.create({
  ...baseStyles,
  container: {
    ...baseStyles.container,
    backgroundColor: '#1E1E1E',
  },
  scrollView: {
    ...baseStyles.scrollView,
    backgroundColor: '#1E1E1E',
  },
  title: {
    ...baseStyles.title,
    color: '#fff',
  },
  subtitle: {
    ...baseStyles.subtitle,
    color: '#ccc',
  },
  body: {
    ...baseStyles.body,
    color: '#ddd',
  },
  modalContainer: {
    ...baseStyles.modalContainer,
    backgroundColor: '#1E1E1E',
  },
  modalTitle: {
	...baseStyles.modalTitle,
    color: '#aaa',
  },
  summaryContainer: {
    ...baseStyles.summaryContainer,
    backgroundColor: '#333',
  },
  summaryText: {
    ...baseStyles.summaryText,
    color: '#ddd',
  },
  infoText: {
    ...baseStyles.infoText,
    color: '#aaa',
  },
});

const styles = StyleSheet.create(baseStyles);

export default NewsDetail;
