import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import StepOne from './cpr/StepOne';
import StepTwo from './cpr/StepTwo';
import StepThree from './cpr/StepThree';
import StepFour from './cpr/StepFour';
import StepFive from './cpr/StepFive';
import StepSix from './cpr/StepSix';
import StepSeven from './cpr/StepSeven';
import { handleTTS, stopTTS } from '../../../News/tabs/News/hooks/handleTTS';
import instructions from './cpr/instructions.json';

const CPRSteps = () => {
    const [currentStep, setCurrentStep] = useState(1);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const navigation = useNavigation();

    useFocusEffect(
        React.useCallback(() => {
            return () => {
                if (isSpeaking) {
                    stopTTS();
                    setIsSpeaking(false);
                }
            };
        }, [isSpeaking])
    );

    // TTS toggle handling
    const handleTTSPress = async () => {
        try {
            if (isSpeaking) {
                // TTS 실행 중일 경우 중지
                await stopTTS();
                setIsSpeaking(false);
                console.log('TTS 중지됨.');
                return;
            }
    
            const stepKey = `step${[
                'One',
                'Two',
                'Three',
                'Four',
                'Five',
                'Six',
                'Seven',
            ][currentStep - 1]}`;
            const stepData = instructions[stepKey];
    
            if (!stepData) {
                Alert.alert('오류', '현재 단계의 설명이 없습니다.');
                return;
            }
    
            const content = `${stepData.title}\n${stepData.instructions.join('\n')}`;
    
            // TTS 실행 및 종료 이벤트 감지
            setIsSpeaking(true);
            console.log('TTS 실행 중...');
    
            await handleTTS(
                isSpeaking,
                setIsSpeaking,
                { formattedContent: [{ text: content, type: 'text' }] },
                {
                    onDone: async () => {
                        console.log('TTS 종료 감지');
                        setIsSpeaking(false);
    
                        // TTS 종료 후 mp3 재생 (Two 단계에서만)
                        if (currentStep === 2) {
                            try {
                                const { sound } = await Audio.Sound.createAsync(
                                    require('./assets/press.mp3') // mp3 파일 경로
                                );
                                await sound.playAsync();
                                console.log('mp3 재생 완료');
                                sound.unloadAsync(); // 리소스 해제
                            } catch (error) {
                                console.error('mp3 재생 오류:', error);
                            }
                        }
                    },
                }
            );
        } catch (error) {
            console.error('TTS 처리 중 오류:', error);
            setIsSpeaking(false);
        }
    };
    

    useFocusEffect(
        React.useCallback(() => {
            return () => {
                if (isSpeaking) {
                    stopTTS();
                    setIsSpeaking(false); 
                }
            };
        }, [isSpeaking])
    );

    const handleNextStep = () => {
        if (isSpeaking) {
            stopTTS();
            setIsSpeaking(false);
        }
        if (currentStep < 7) {
            setCurrentStep(currentStep + 1);
        } else {
            Alert.alert('심폐소생술 완료!', '모든 단계를 완료했습니다.');
        }
    };

    // 이전 단계로 이동
    const handlePreviousStep = () => {
        if (isSpeaking) {
            stopTTS(); // 버튼 클릭 시 TTS 정지
            setIsSpeaking(false);
        }
        if (currentStep > 1) {
            setCurrentStep(currentStep - 1);
        }
    };

    // 4단계로 돌아가기
    const handleBackToStepFour = () => {
        if (isSpeaking) {
            stopTTS(); // 버튼 클릭 시 TTS 정지
            setIsSpeaking(false);
        }
        setCurrentStep(4);
    };

    const renderStep = () => {
        switch (currentStep) {
            case 1:
                return <StepOne onNext={handleNextStep} />;
            case 2:
                return <StepTwo onNext={handleNextStep} onPrevious={handlePreviousStep} />;
            case 3:
                return <StepThree onNext={handleNextStep} onPrevious={handlePreviousStep} />;
            case 4:
                return <StepFour onNext={handleNextStep} onPrevious={handlePreviousStep} />;
            case 5:
                return <StepFive onNext={handleNextStep} onPrevious={handlePreviousStep} />;
            case 6:
                return <StepSix onNext={handleNextStep} onPrevious={handlePreviousStep} />;
            case 7:
                return <StepSeven
                    onNext={handleNextStep}
                    onPrevious={handlePreviousStep}
                    onBackToStepFour={handleBackToStepFour}
                />;
            default:
                return null;
        }
    };

    return (
        <View style={styles.container}>
            {/* Volume Icon */}
            <TouchableOpacity style={styles.iconButton} onPress={handleTTSPress}>
                <MaterialIcons
                    name={isSpeaking ? 'volume-off' : 'volume-up'}
                    size={24}
                    color="black"
                />
            </TouchableOpacity>

            {/* Progress Bar */}
            <View style={styles.progressBarContainer}>
                <View
                    style={[
                        styles.progressBar,
                        { width: `${(currentStep / 7) * 100}%` },
                    ]}
                />
            </View>


            <Text style={styles.stepIndicator}>{`단계 ${currentStep} / ${7}`}</Text>

            {renderStep()}

            <View style={styles.buttonContainer}>
                <TouchableOpacity
                    style={[
                        styles.navigationButton,
                        { backgroundColor: currentStep > 1 ? 'red' : 'orange' },
                    ]}
                    onPress={
                        currentStep === 1
                            ? () => navigation.navigate('CprPracticeScreen')
                            : handlePreviousStep
                    }
                >
                    <Text style={styles.navigationButtonText}>
                        {currentStep === 1 ? '심폐소생술(실습)' : '이전 단계로 이동'}
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[
                        styles.navigationButton,
                        { backgroundColor: currentStep < 7 ? 'blue' : 'orange' },
                    ]}
                    onPress={
                        currentStep === 7
                            ? () => navigation.navigate('CprPracticeScreen')
                            : handleNextStep
                    }
                >
                    <Text style={styles.navigationButtonText}>
                        {currentStep === 7 ? '심폐소생술(실습)' : '다음 단계로 이동'}
                    </Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        backgroundColor: '#fff',
    },
    iconButton: {
        position: 'absolute',
        top: 20,
        right: 20,
    },
    progressBarContainer: {
        width: '90%',
        height: 10,
        backgroundColor: '#e0e0e0',
        borderRadius: 5,
        marginVertical: 15,
        marginTop: 60,
    },
    progressBar: {
        height: '100%',
        backgroundColor: '#4caf50',
        borderRadius: 5,
    },
    stepIndicator: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 10,
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

export default CPRSteps;
