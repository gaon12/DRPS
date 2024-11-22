import * as Speech from "expo-speech";
import { Audio } from 'expo-av';

const TTS_API_BASE = 'https://api.gaon.xyz/tts';

export const handleTTS = async (isSpeaking, setIsSpeaking, newsData, settings) => {
  if (isSpeaking) {
    // TTS 중지
    if (settings.ttsService) {
      await stopTTS(); // 서버 TTS 중지
    } else {
      Speech.stop(); // 로컬 TTS 중지
    }
    setIsSpeaking(false);
    console.log("TTS stopped.");
    return;
  }

  try {
    const content = newsData.formattedContent
      .filter(item => item.type !== "quote") // 인용구 제외
      .map(item => item.text)
      .join("\n");

    // TTS 서비스와 언어 설정 확인
    const ttsService = settings.ttsService || 'gtts'; // 기본값으로 'gtts' 사용
    const language = settings.language || 'ko-KR'; // 기본값으로 'ko-KR' 사용

    if (ttsService === 'gtts') {
      // 로컬 TTS 사용
      Speech.speak(content, {
        language,
        onDone: () => setIsSpeaking(false),
        onError: (error) => {
          console.error("로컬 TTS 오류:", error);
          setIsSpeaking(false);
        },
      });
      setIsSpeaking(true);
      console.log("로컬 TTS started.");
    } else {
      // 서버 TTS 사용
      await handleServerTTS(content, { ttsService, language }, setIsSpeaking);
    }
  } catch (error) {
    console.error("TTS 처리 중 오류 발생:", error);
    setIsSpeaking(false);
    throw error;
  }
};

// 서버 TTS 처리 함수
const handleServerTTS = async (content, { ttsService, language }, setIsSpeaking) => {
  try {
    const url = `${TTS_API_BASE}?action=tts&service=${ttsService}&text=${encodeURIComponent(content)}&language=${language}`;
    console.log(`TTS 요청 URL: ${url}`);

    const response = await fetch(url);
    const result = await response.json();

    if (result.StatusCode === 200 && result.data?.audio) {
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
        console.log(`서버 TTS started with service: ${ttsService}, language: ${language}`);
      } catch (error) {
        console.error("오디오 재생 중 오류:", error);
        await soundObject.unloadAsync();
        setIsSpeaking(false);
      }
    } else {
      throw new Error("TTS API 응답이 올바르지 않습니다.");
    }
  } catch (error) {
    console.error("서버 TTS 처리 중 오류 발생:", error);
    setIsSpeaking(false);
    throw error;
  }
};

// 서버 TTS 중지 함수 - stopTTS로 내보내기
export const stopTTS = async () => {
  try {
    // 로컬 TTS 중지
    Speech.stop();

    // 서버 TTS 중지 - Audio 권한 초기화
    await Audio.setIsEnabledAsync(false);
    await Audio.setIsEnabledAsync(true);

    console.log("TTS 중지 완료.");
  } catch (error) {
    console.error("TTS 중지 중 오류:", error);
  }
};

export const stopTTSAndWait = async () => {
  return new Promise((resolve, reject) => {
    stopTTS()
      .then(() => {
        console.log("TTS 중단 완료 후 처리됨.");
        resolve();
      })
      .catch((error) => {
        console.error("TTS 중단 중 오류:", error);
        reject(error);
      });
  });
};

