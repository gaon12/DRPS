import React, { useState, useEffect, useRef } from 'react';
import { useNavigation } from '@react-navigation/native';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert, Linking, Image } from 'react-native';
import { AntDesign, MaterialIcons, FontAwesome5 } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';

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

const CallScreen = () => {
  const intervalRef = useRef(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const navigation = useNavigation();

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

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
      makeCall('112');
    }
  };

  const ReportButton = ({ type, color, icon }) => (
    <TouchableOpacity
      style={[styles.button, { backgroundColor: color }]}
      onPress={() => navigation.navigate('DisasterReport', { reportType: type, selectedImage })}
    >
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

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>신고 유형을 선택하여 문자 신고</Text>

      <View style={styles.row}>
        <ReportButton type="범죄" color="#FA5858" icon={<AntDesign name="warning" size={40} color="white" />} />
        <ReportButton type="화재" color="#DF0101" icon={<MaterialIcons name="fire-extinguisher" size={40} color="white" />} />
      </View>

      <View style={styles.row}>
        <ReportButton type="구조/구급" color="#31B404" icon={<FontAwesome5 name="first-aid" size={40} color="white" />} />
        <ReportButton type="해양사고" color="#01A9DB" icon={<FontAwesome5 name="ship" size={40} color="white" />} />
      </View>

      <View style={styles.extraOptions}>
        <SmallButton label="그림을 선택하여 신고" icon="picture" onPress={pickImageAndCall} />
        <SmallButton label="민원상담은 110" icon="phone" onPress={() => makeCall('110')} />
      </View>

      <View style={styles.footer}>
        <FooterButton label="112 전화신고" color="#013ADF" onPress={() => makeCall('112')} />
        <FooterButton label="119 전화신고" color="#DF0101" onPress={() => makeCall('119')} />
      </View>

      {selectedImage && (
        <View style={styles.imagePreviewContainer}>
          <Text style={styles.imagePreviewText}>선택한 이미지:</Text>
          <Image source={{ uri: selectedImage }} style={styles.imagePreview} />
        </View>
      )}
    </ScrollView>
  );
};

export default CallScreen;
