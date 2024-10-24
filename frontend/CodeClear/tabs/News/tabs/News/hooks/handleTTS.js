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
      .filter(item => item.type !== "quote")  // 인용구 제외
      .map(item => item.text)
      .join("\n");
    
    // settings에서 현재 언어와 TTS 서비스 설정 가져오기
    const { language: currentLanguage, ttsOption } = settings;
    const { ttsService, language: ttsLanguages } = ttsOption;
    
    // 현재 언어에 맞는 TTS 음성 선택
    const selectedVoice = ttsLanguages[currentLanguage];
    
    if (!selectedVoice) {
      console.warn(`Invalid language configuration for ${currentLanguage}`);
      return;
    }

    // API 요청 URL 생성
    const url = `${TTS_API_BASE}?action=tts&service=${ttsService}&text=${encodeURIComponent(content)}&language=${selectedVoice}`;
    const response = await fetch(url);
    const result = await response.json();

	console.log(url)

    if (result.StatusCode === 200 && result.data.audio) {
      // Base64 데이터를 디코드
      const base64Audio = result.data.audio;
      
      // Audio 권한 요청
      await Audio.requestPermissionsAsync();
      
      // Audio 모드 설정
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        playsInSilentModeIOS: true,
        staysActiveInBackground: true,
        shouldDuckAndroid: true,
      });

      // 오디오 객체 생성
      const soundObject = new Audio.Sound();
      
      try {
        // Base64 데이터를 사용하여 오디오 로드
        await soundObject.loadAsync({
          uri: `data:audio/mp3;base64,${base64Audio}`
        });

        // 재생 완료 이벤트 리스너
        soundObject.setOnPlaybackStatusUpdate((status) => {
          if (status.didJustFinish) {
            setIsSpeaking(false);
            soundObject.unloadAsync();
          }
        });

        // 재생 시작
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
    // 현재 재생 중인 모든 소리 중지
    await Audio.setIsEnabledAsync(false);
    await Audio.setIsEnabledAsync(true);
  } catch (error) {
    console.error('TTS 중지 중 오류:', error);
  }
};