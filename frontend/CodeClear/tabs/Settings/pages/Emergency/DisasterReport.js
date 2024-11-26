import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import * as SMS from 'expo-sms';

const DisasterReport = ({ route, navigation }) => {
  const { reportType } = route.params;
  const [message, setMessage] = useState('');

  const sendMessage = async () => {
    if (!message.trim()) {
      Alert.alert('오류', '메시지를 입력하세요.');
      return;
    }

    const isAvailable = await SMS.isAvailableAsync();
    if (!isAvailable) {
      Alert.alert('오류', 'SMS 전송이 지원되지 않습니다.');
      return;
    }

    const { result } = await SMS.sendSMSAsync(['112'], message.trim());
    if (result === 'sent') {
      Alert.alert('성공', '신고가 전송되었습니다.');
      setMessage(''); // 메시지 초기화
      navigation.goBack();
    } else {
      Alert.alert('실패', '신고 전송에 실패했습니다.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>{reportType} 신고</Text>
      <TextInput
        style={styles.textInput}
        placeholder="신고 내용을 입력하세요"
        value={message}
        onChangeText={setMessage}
        multiline
      />
      <TouchableOpacity style={styles.sendButton} onPress={sendMessage}>
        <Text style={styles.sendButtonText}>신고 전송</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#f9f9f9' },
  header: { fontSize: 22, fontWeight: 'bold', marginBottom: 15, color: '#333' },
  textInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    backgroundColor: '#fff',
    fontSize: 16,
    marginBottom: 20,
    height: 120,
    textAlignVertical: 'top',
  },
  sendButton: {
    backgroundColor: '#28a745',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  sendButtonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
});

export default DisasterReport;
