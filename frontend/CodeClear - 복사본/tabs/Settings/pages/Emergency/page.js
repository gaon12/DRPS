import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert, Linking, Modal, Image } from 'react-native';
import { AntDesign, MaterialIcons, FontAwesome5 } from '@expo/vector-icons';
import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system';
import * as ImagePicker from 'expo-image-picker';

const CallScreen = () => {
  const [countdown, setCountdown] = useState(5);
  const [showModal, setShowModal] = useState(false);
  const intervalRef = useRef(null);
  const [recording, setRecording] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);

  const startRecording = async () => {
    if (isRecording) {
      return;
    }

    if (recording) {
      await stopRecordingAndReport();
    }

    try {
      console.log('녹음 시작');
      await Audio.requestPermissionsAsync();
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const { recording: newRecording } = await Audio.Recording.createAsync(
        Audio.RECORDING_OPTIONS_PRESET_HIGH_QUALITY
      );
      setRecording(newRecording);
      setIsRecording(true);
      setCountdown(5); // 5초 타이머 초기화
      setShowModal(true); // Modal 표시

      intervalRef.current = setInterval(() => {
        setCountdown((prev) => {
          if (prev === 1) {
            clearInterval(intervalRef.current);
            stopRecordingAndReport();
          }
          return prev - 1;
        });
      }, 1000);

    } catch (err) {
      console.error('녹음 시작 중 오류 발생:', err);
      Alert.alert('오류', '녹음을 시작할 수 없습니다.');
    }
  };

  const stopRecordingAndReport = async () => {
    console.log('녹음 종료 및 신고');
    setShowModal(false); // Modal 숨기기
    try {
      if (recording) {
        await recording.stopAndUnloadAsync();
        const uri = recording.getURI();
        console.log('녹음된 파일 경로:', uri);

        const newUri = `${FileSystem.documentDirectory}recording_${Date.now()}.m4a`;
        await FileSystem.moveAsync({
          from: uri,
          to: newUri,
        });
        console.log('녹음 파일이 저장되었습니다:', newUri);

        setRecording(null); // 녹음 객체 초기화
      }
      setIsRecording(false);
      makeCall('112'); // 112로 전화 걸기
    } catch (err) {
      console.error('녹음 종료 중 오류 발생:', err);
      Alert.alert('오류', '녹음을 종료할 수 없습니다.');
    }
  };

  const makeCall = (number) => {
    const url = `tel:${number}`;
    Linking.openURL(url).catch(() => {
      Alert.alert('오류', '전화 연결을 할 수 없습니다.');
    });
  };

  const pickImageAndCall = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      Alert.alert('권한 필요', '이미지 선택을 위해 갤러리 접근 권한이 필요합니다.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: false,
      quality: 1,
    });

    if (!result.canceled) {
      setSelectedImage(result.assets[0].uri);
      Alert.alert('이미지 선택됨', '선택한 이미지로 전화 신고를 진행합니다.');
      makeCall('112'); // 이미지 선택 후 112로 전화 연결
    }
  };

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>신고 유형을 선택하여 문자 신고</Text>

      <View style={styles.row}>
        <ReportButton
          type="범죄"
          color="#FA5858"
          icon={<AntDesign name="warning" size={40} color="white" />}
          onPress={() => handleReport('범죄')}
        />
        <ReportButton
          type="화재"
          color="#DF0101"
          icon={<MaterialIcons name="fire-extinguisher" size={40} color="white" />}
          onPress={() => handleReport('화재')}
        />
      </View>

      <View style={styles.row}>
        <ReportButton
          type="구조/구급"
          color="#31B404"
          icon={<FontAwesome5 name="first-aid" size={40} color="white" />}
          onPress={() => handleReport('구조/구급')}
        />
        <ReportButton
          type="해양사고"
          color="#01A9DB"
          icon={<FontAwesome5 name="ship" size={40} color="white" />}
          onPress={() => handleReport('해양사고')}
        />
      </View>

      <View style={styles.extraOptions}>
        <SmallButton label="그림을 선택하여 신고" icon="picture" onPress={pickImageAndCall} />
        <SmallButton label="5초간 녹음 후 112 자동 신고" icon="sound" onPress={startRecording} />
        <SmallButton label="민원상담은 110" icon="phone" onPress={() => makeCall('110')} />
      </View>

      <View style={styles.footer}>
        <FooterButton label="112 전화신고" color="#013ADF" onPress={() => makeCall('112')} />
        <FooterButton label="119 전화신고" color="#DF0101" onPress={() => makeCall('119')} />
      </View>

      <Modal
        transparent={true}
        animationType="slide"
        visible={showModal}
        onRequestClose={() => setShowModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalText}>녹음 중</Text>
            <Text style={styles.modalCountdown}>{countdown}초 후 신고됩니다</Text>
          </View>
        </View>
      </Modal>

      {selectedImage && (
        <View style={styles.imagePreviewContainer}>
          <Text style={styles.imagePreviewText}>선택한 이미지:</Text>
          <Image source={{ uri: selectedImage }} style={styles.imagePreview} />
        </View>
      )}
    </ScrollView>
  );
};

const ReportButton = ({ type, color, icon, onPress }) => (
  <TouchableOpacity style={[styles.button, { backgroundColor: color }]} onPress={onPress}>
    {icon}
    <Text style={styles.buttonText}>{type}</Text>
  </TouchableOpacity>
);

const SmallButton = ({ label, icon, onPress }) => (
  <TouchableOpacity style={styles.smallButton} onPress={onPress}>
    <AntDesign name={icon} size={24} color="black" />
    <Text style={styles.smallButtonText}>{label}</Text>
  </TouchableOpacity>
);

const FooterButton = ({ label, color, onPress }) => (
  <TouchableOpacity style={[styles.callButton, { backgroundColor: color }]} onPress={onPress}>
    <Text style={styles.callButtonText}>{label}</Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F0F4F8', padding: 16 },
  header: { fontSize: 20, fontWeight: 'bold', textAlign: 'center', marginBottom: 20 },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  button: { flex: 1, margin: 5, padding: 20, borderRadius: 10, alignItems: 'center' },
  buttonText: { color: 'white', fontSize: 18, fontWeight: 'bold', marginTop: 8 },
  extraOptions: { marginVertical: 20 },
  smallButton: {
    backgroundColor: '#AED6F1',
    padding: 15,
    borderRadius: 10,
    marginVertical: 5,
    flexDirection: 'row',
    alignItems: 'center',
  },
  smallButtonText: { marginLeft: 10, fontSize: 16 },
  footer: { flexDirection: 'row', justifyContent: 'space-around', marginTop: 20 },
  callButton: { padding: 15, borderRadius: 10, width: '45%', alignItems: 'center' },
  callButtonText: { color: 'white', fontSize: 18, fontWeight: 'bold' },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: 300,
    padding: 20,
    backgroundColor: 'white',
    borderRadius: 10,
    alignItems: 'center',
  },
  modalText: { fontSize: 20, fontWeight: 'bold', marginBottom: 10 },
  modalCountdown: { fontSize: 24, fontWeight: 'bold', color: '#FF3B30' },
  imagePreviewContainer: { alignItems: 'center', marginTop: 20 },
  imagePreviewText: { fontSize: 16, fontWeight: 'bold' },
  imagePreview: { width: 200, height: 200, resizeMode: 'contain', marginTop: 10 },
});

export default CallScreen;
