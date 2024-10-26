// ./hooks/handleTTS.js
import * as Speech from "expo-speech";
import { Audio } from 'expo-av';

const TTS_API_BASE = 'https://api.gaon.xyz/tts';

export const handleTTS = async (isSpeaking, setIsSpeaking, newsData, settings) => {
  if (isSpeaking) {
    Speech.stop();
    setIsSpeaking(false);
    console.log("TTS stopped.");
    return;
  }

  try {
    const content = newsData.formattedContent
      .filter(item => item.type !== "quote") // 인용구 제외
      .map(item => item.text)
      .join("\n");
    
    // 설정에서 현재 언어와 TTS 옵션 가져오기
    const { language: currentLanguage, ttsOption } = settings;
    const { ttsService, language: ttsLanguages } = ttsOption;

    let selectedVoice;

    // TTS 서비스에 따른 음성 선택 분기 처리
    if (ttsService === 'edgetts') {
      selectedVoice = ttsLanguages[currentLanguage];
      if (!selectedVoice) {
        console.warn(`Edge TTS에 대한 언어 설정이 없습니다: ${currentLanguage}`);
        return;
      }
    } else if (ttsService === 'gtts') {
      selectedVoice = currentLanguage; // Google TTS는 기본 언어 코드 사용
    } else {
      console.warn(`지원되지 않는 TTS 서비스: ${ttsService}`);
      return;
    }

    // API 요청 URL 생성
    const url = `${TTS_API_BASE}?action=tts&service=${ttsService}&text=${encodeURIComponent(content)}&language=${selectedVoice}`;
    console.log(`TTS 요청 URL: ${url}`);

    const response = await fetch(url);
    const result = await response.json();

    if (result.StatusCode === 200 && result.data.audio) {
      const base64Audio = result.data.audio;

      // Audio 권한 요청 및 설정
      await Audio.requestPermissionsAsync();
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        playsInSilentModeIOS: true,
        staysActiveInBackground: true,
        shouldDuckAndroid: true,
      });

      const soundObject = new Audio.Sound();
      try {
        await soundObject.loadAsync({
          uri: `data:audio/mp3;base64,${base64Audio}`,
        });

        soundObject.setOnPlaybackStatusUpdate((status) => {
          if (status.didJustFinish) {
            setIsSpeaking(false);
            soundObject.unloadAsync();
          }
        });

        await soundObject.playAsync();
        setIsSpeaking(true);
        console.log(`TTS started with service: ${ttsService}, voice: ${selectedVoice}`);
      } catch (error) {
        console.error('오디오 재생 중 오류:', error);
        await soundObject.unloadAsync();
        setIsSpeaking(false);
      }
    } else {
      throw new Error('TTS API 응답이 올바르지 않습니다.');
    }
  } catch (error) {
    console.error('TTS 처리 중 오류 발생:', error);
    setIsSpeaking(false);
    throw error;
  }
};

export const stopTTS = async () => {
  try {
    await Audio.setIsEnabledAsync(false);
    await Audio.setIsEnabledAsync(true);
  } catch (error) {
    console.error('TTS 중지 중 오류:', error);
  }
};
