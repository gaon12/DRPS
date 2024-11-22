import React, { useState } from 'react';
import { View, StyleSheet, Text, TouchableOpacity } from 'react-native';
import CprStep0 from './cprstep/CprStep0';
import CprStep1 from './cprstep/CprStep1';
import CprStep2 from './cprstep/CprStep2';
import CprStep3 from './cprstep/CprStep3';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  navigationButton: {
    padding: 10,
    borderRadius: 5,
    width: '45%',
    alignItems: 'center',
  },
  navigationButtonText: {
    color: 'white',
    fontSize: 16,
  },
});

const CprPractice = () => {
  const [currentStep, setCurrentStep] = useState(0); // 현재 단계
  const [repeatCount, setRepeatCount] = useState(0); // 실전 모드 반복 횟수
  const [realModeRepeat, setRealModeRepeat] = useState(0); // 현재 실전 모드 반복 진행 상태
  const isPracticeMode = repeatCount === 0 && realModeRepeat === 0; 

  const handleNextStep = () => {
    if (isPracticeMode) {
      // 연습 모드 동작
      if (currentStep === 1) {
        setCurrentStep(2);
      } else if (currentStep === 2) {
        setCurrentStep(3);
      }
    } else {
      // 실전 모드 동작
      if (currentStep === 1) {
        setCurrentStep(2);
      } else if (currentStep === 2) {
        if (realModeRepeat + 1 < repeatCount) {
          setRealModeRepeat(realModeRepeat + 1); // 반복 횟수 증가
          setCurrentStep(1); // 다시 Step1로 돌아가기
        } else {
          setCurrentStep(3); // 반복 종료 후 Step3로 이동
        }
      }
    }
  };
  
  const handlePreviousStep = () => {
    if (isPracticeMode) {
      // 연습 모드 뒤로가기
      if (currentStep === 1) {
        setCurrentStep(0);
      } else if (currentStep === 2) {
        setCurrentStep(1);
      } else if (currentStep === 3) {
        setCurrentStep(2);
      }
    } else {
      // 실전 모드 뒤로가기
      if (currentStep === 2) {
        setCurrentStep(1); // Step2에서 Step1로 돌아가기
      } else if (currentStep === 1) {
        setCurrentStep(0); // Step1에서 Step0으로 돌아가기
      }
    }
  };

  const handleModeSelect = (mode, count = 0) => {
    setRepeatCount(0); // 실전 모드 초기화
    setRealModeRepeat(0); // 실전 모드 현재 반복 상태 초기화
  
    if (mode === 'practice') {
      setCurrentStep(1); // 연습 모드 시작
    } else if (mode === 'real') {
      setRepeatCount(count); // 실전 모드 반복 횟수 설정
      setCurrentStep(1); // 실전 모드 Step1부터 시작
    }
  };

  const handleRestart = () => {
    setCurrentStep(0); // Step3에서 Step0로 돌아가기
    setRepeatCount(0); // 실전 모드 반복 횟수 초기화
    setRealModeRepeat(0); // 실전 모드 현재 반복 상태 초기화
  };

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return <CprStep0 onModeSelect={handleModeSelect} />;
      case 1:
        return <CprStep1 onNext={handleNextStep} />;
      case 2:
        return <CprStep2 onNext={handleNextStep} />;
      case 3:
        return <CprStep3 onRestart={handleRestart} />;
      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      {renderStep()}
      {isPracticeMode && currentStep !== 3 && (currentStep === 1 || currentStep === 2) && (
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.navigationButton, { backgroundColor: 'red' }]}
            onPress={handlePreviousStep}
          >
            <Text style={styles.navigationButtonText}>뒤로가기</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.navigationButton, { backgroundColor: 'blue' }]}
            onPress={handleNextStep}
          >
            <Text style={styles.navigationButtonText}>
              {currentStep === 1 ? '건너뛰기' : '완료'}
            </Text>
          </TouchableOpacity>
        </View>
      )}
      {isPracticeMode && currentStep === 3 && (
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.navigationButton, { backgroundColor: 'red' }]}
            onPress={handlePreviousStep}
          >
            <Text style={styles.navigationButtonText}>뒤로가기</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

export default CprPractice;
