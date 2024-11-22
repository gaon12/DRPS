import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';

// JSON 파일 가져오기
import instructions from './instructions.json';

const StepSix = ({ onNext, onPrevious }) => {
  const [stepData, setStepData] = useState(null);

  useEffect(() => {
    // JSON 데이터에서 필요한 단계 데이터 불러오기
    setStepData(instructions.stepSix);
  }, []);

  if (!stepData) return null; // 데이터가 로드되기 전까지는 아무것도 표시하지 않음

  return (
    <View style={styles.container}>
      {/* 상단 이미지 가로 정렬 */}
      <View style={styles.imageContainer}>
        <Image source={require('./cprimages/cpr5.png')} style={styles.image} />
        <Image source={require('./cprimages/cpr4.png')} style={styles.image} />
      </View>

      {/* 제목 표시 */}
      <Text style={styles.title}>{stepData.title}</Text>

      {/* 안내 메시지 텍스트 */}
      <View style={styles.alertMessageContainer}>
        {stepData.instructions.map((instruction, index) => (
          <Text key={index} style={styles.alertMessage}>
            {`\u2022 ${instruction}`}
          </Text>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  imageContainer: {
    flexDirection: 'row', // 가로 정렬
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  image: {
    width: 150,
    height: 150,
    marginHorizontal: 10, // 이미지 간격 설정
    resizeMode: 'contain',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  alertMessageContainer: {
    width: '90%', // 텍스트 컨테이너를 화면의 90% 너비로 설정하여 좌우 여백 확보
    marginVertical: 10,
    paddingHorizontal: 10,
  },
  alertMessage: {
    fontSize: 18,
    color: 'black',
    textAlign: 'justify', // 양쪽 정렬
    marginVertical: 5,
    lineHeight: 24,
  },
  buttonContainer: {
    flexDirection: 'row', // 버튼을 가로로 정렬
    justifyContent: 'space-between', // 버튼 사이에 간격 추가
    width: '100%', // 버튼 컨테이너 너비 설정
    marginTop: 20,
  },
  navigationButton: {
    padding: 10,
    borderRadius: 5,
    width: '45%', // 각 버튼 너비 설정
    alignItems: 'center',
  },
  navigationButtonText: {
    color: 'white',
    fontSize: 18,
  },
});

export default StepSix;
