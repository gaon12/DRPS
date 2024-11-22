import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';

// JSON 파일 가져오기
import instructions from './instructions.json';

const StepOne = ({ onNext }) => {
  const [stepData, setStepData] = useState(null);

  useEffect(() => {
    // JSON 데이터에서 필요한 단계 데이터 불러오기
    setStepData(instructions.stepOne);
  }, []);

  if (!stepData) return null; // 데이터가 로드되기 전까지는 아무것도 표시하지 않음

  return (
    <View style={styles.container}>
      {/* 상단 이미지 배치 */}
      <Image source={require('./cprimages/cpr1.png')} style={styles.image} />

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
  },
  image: {
    marginTop:10,
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
    marginVertical: 10,
    paddingHorizontal: 15,
  },
  alertMessage: {
    fontSize: 18,
    color: 'black',
    textAlign: 'left',
    marginVertical: 5,
    lineHeight: 24,
  },
  nextButton: {
    padding: 10,
    borderRadius: 5,
    marginTop: 20,
  },
  nextButtonText: {
    color: 'white',
    fontSize: 18,
  },
});

export default StepOne;
