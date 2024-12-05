import React, { useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert, Linking, Modal } from 'react-native';
import { AntDesign, MaterialIcons, FontAwesome5 } from '@expo/vector-icons';

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
  modalContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' },
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
    width: '80%',
  },
  modalButton: { marginTop: 10, padding: 15, borderRadius: 10, backgroundColor: '#007BFF', width: '100%' },
  modalButtonText: { color: 'white', fontSize: 16, textAlign: 'center' },
  modalCloseButton: { marginTop: 20, padding: 15, borderRadius: 10, backgroundColor: '#FF6F61', width: '100%' },
});

const ReportModal = ({ visible, onClose, onCall, onWeb, showWebOption }) => (
  <Modal transparent={true} visible={visible} animationType="fade">
    <View style={styles.modalContainer}>
      <View style={styles.modalContent}>
        <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 20 }}>신고 방법을 선택하세요</Text>
        <TouchableOpacity style={styles.modalButton} onPress={onCall}>
          <Text style={styles.modalButtonText}>전화로 신고</Text>
        </TouchableOpacity>
        {showWebOption && ( // This line ensures web option is only shown when showWebOption is true
          <TouchableOpacity style={styles.modalButton} onPress={onWeb}>
            <Text style={styles.modalButtonText}>웹으로 신고</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity style={styles.modalCloseButton} onPress={onClose}>
          <Text style={styles.modalButtonText}>닫기</Text>
        </TouchableOpacity>
      </View>
    </View>
  </Modal>
);

const CallScreen = () => {
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedNumber, setSelectedNumber] = useState(null);
  const navigation = useNavigation();

  const makeCall = (number) => {
    const url = `tel:${number}`;
    Linking.openURL(url).catch(() => {
      Alert.alert('오류', '전화 연결을 할 수 없습니다.');
    });
  };

  const openWeb = (number) => {
    Alert.alert('웹 신고', `${number} 웹 신고 페이지로 이동합니다.`);
  };

  const handleFooterButtonPress = (number) => {
    setSelectedNumber(number);
    setModalVisible(true);
  };

  const ReportButton = ({ type, color, icon, number }) => (
    <TouchableOpacity
      style={[styles.button, { backgroundColor: color }]}
      onPress={() => navigation.navigate('DisasterReport', { reportType: type, reportNumber: number })}
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
        <ReportButton
          type="범죄"
          color="#FA5858"
          icon={<AntDesign name="warning" size={40} color="white" />}
          number="112"
        />
        <ReportButton
          type="화재"
          color="#DF0101"
          icon={<MaterialIcons name="fire-extinguisher" size={40} color="white" />}
          number="119"
        />
      </View>

      <View style={styles.row}>
        <ReportButton
          type="구조/구급"
          color="#31B404"
          icon={<FontAwesome5 name="first-aid" size={40} color="white" />}
          number="119"
        />
        <ReportButton
          type="해양사고"
          color="#01A9DB"
          icon={<FontAwesome5 name="ship" size={40} color="white" />}
          number="122"
        />
      </View>

      <View style={styles.extraOptions}>
        <SmallButton
          label="그림 신고 화면으로 이동"
          icon="picture"
          onPress={() => navigation.navigate('ImageReportScreen')}
        />

        <SmallButton
          label="민원상담은 110"
          icon="phone"
          onPress={() => makeCall('110')}
        />
      </View>

      <View style={styles.footer}>
        <FooterButton
          label="112 전화신고"
          color="#013ADF"
          onPress={() => handleFooterButtonPress('112')}
        />
        <FooterButton
          label="119 전화신고"
          color="#DF0101"
          onPress={() => handleFooterButtonPress('119')}
        />
      </View>

      <ReportModal
  visible={modalVisible}
  onClose={() => setModalVisible(false)}
  onCall={() => {
    setModalVisible(false);
    makeCall(selectedNumber);
  }}
  onWeb={() => {
    setModalVisible(false);
    openWeb(selectedNumber);
  }}
  showWebOption={selectedNumber !== '112'} // 이 부분이 중요합니다
/>
    </ScrollView>
  );
};

export default CallScreen;
