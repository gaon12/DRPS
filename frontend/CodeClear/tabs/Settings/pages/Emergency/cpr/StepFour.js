import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';

// JSON 파일 가져오기
import instructions from './instructions.json';

const StepFour = ({ onNext, onPrevious }) => {
  const [stepData, setStepData] = useState(null);

  useEffect(() => {
    // JSON 데이터에서 필요한 단계 데이터 불러오기
    setStepData(instructions.stepFour);
  }, []);

  if (!stepData) return null; // 데이터가 로드되기 전까지는 아무것도 표시하지 않음

  return (
    <View style={styles.container}>
      {/* 상단 이미지 배치 */}
      <Image source={require('./cprimages/cpr4.png')} style={styles.image} />

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
  image: {
    marginTop: 10,
    width: 150,
    height: 150,
    marginBottom: 20,
    resizeMode: 'contain'
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  alertMessageContainer: {
    width: '95%', 
    marginVertical: 10,
    paddingHorizontal: 10,
  },
  alertMessage: {
    fontSize: 18,
    color: 'black',
    textAlign: 'justify', 
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

export default StepFour;
