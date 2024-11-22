import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Image } from 'react-native';
import { Audio } from 'expo-av';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  textContainer: {
    backgroundColor: '#ffffff',
    padding: 20,
    borderRadius: 10,
    elevation: 5, 
    shadowColor: '#000', // iOS 그림자
    shadowOpacity: 0.1,
    shadowRadius: 5,
    marginBottom: 20,
    alignItems: 'center',
  },
  text: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333', // 텍스트 색상 변경
    textAlign: 'center',
  },
  statusText: {
    fontSize: 16,
    color: '#666',
    marginTop: 10,
  },
});

const CprStep2 = ({ onNext, delay = 3000 }) => { // delay 기본값: 3000ms (3초)
  const [isPlaying, setIsPlaying] = useState(false); // 재생 상태 관리
  const [loading, setLoading] = useState(true); // 로딩 상태 관리
  const [countdown, setCountdown] = useState(Math.round(delay / 1000)); // 카운트다운 상태
  const soundRef = useRef(null); // 사운드 객체 참조

  useEffect(() => {
    let interval;
    if (countdown > 0) {
      interval = setInterval(() => {
        setCountdown((prev) => prev - 1); // 1초마다 감소
      }, 1000);
    } else {
      clearInterval(interval); // 카운트다운 완료 시 타이머 종료
      (async () => {
        try {
          // 사운드 객체 생성 및 설정
          const { sound } = await Audio.Sound.createAsync(
            require('../assets/cprstep2.mp3'), // MP3 파일 경로
            { shouldPlay: true }
          );
          soundRef.current = sound;

          // 오디오가 끝났을 때 호출되는 이벤트 리스너 등록
          sound.setOnPlaybackStatusUpdate((status) => {
            if (status.didJustFinish) {
              setIsPlaying(false);
              onNext(); // 오디오 종료 시 다음 단계로 전환
            }
          });

          setIsPlaying(true);
          setLoading(false);
        } catch (error) {
          console.error('오디오 재생 중 오류 발생:', error);
        }
      })();
    }

    return () => {
      clearInterval(interval); // 컴포넌트가 언마운트될 때 타이머 종료
    };
  }, [countdown, onNext]);

  useEffect(() => {
    // 컴포넌트가 언마운트되거나, 나갈 때 오디오 완전 중지
    return () => {
      if (soundRef.current) {
        soundRef.current.stopAsync(); // 오디오 중지
        soundRef.current.unloadAsync(); // 메모리 해제
      }
    };
  }, []);

  return (
    <View style={styles.container}>
       <Image
    source={require('./cprstepimages/cpr2.png')} // 이미지 파일 경로
    style={{ width: 300, height: 300, marginBottom: 10 }} // 이미지 스타일
  />
      <View style={styles.textContainer}>
        <Text style={styles.text}>인공호흡2회</Text>
      </View>
      {countdown > 0 ? (
        <Text style={styles.statusText}>{countdown}초 후에 오디오가 시작됩니다...</Text>
      ) : loading ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : (
        <Text style={styles.statusText}>
          {isPlaying ? '오디오 재생 중...' : '오디오 종료'}
        </Text>
      )}
    </View>
  );
};

export default CprStep2;
