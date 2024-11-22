import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, TextInput, Pressable, Alert } from 'react-native';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fffff',
  },
  title: {
    fontSize: 42,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 50,
  },
  button: {
    backgroundColor: '#f2f2f2',
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 10,
    width: 300,
    height: 100,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 30,
  },
  PracticeText: {
    fontSize: 37,
    fontWeight: 'bold',
    color: '#F5A9A9',
  },
  RealText: {
    fontSize: 37,
    fontWeight: 'bold',
    color: '#81BEF7',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // 반투명 배경
  },
  modalContent: {
    width: 320,
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 25,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5, // Android 그림자
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  input: {
    width: '100%',
    height: 50,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    paddingHorizontal: 15,
    fontSize: 18,
    marginVertical: 20,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  modalButton: {
    flex: 1,
    backgroundColor: '#4CAF50', // 버튼 색상
    paddingVertical: 12,
    marginHorizontal: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  modalButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

const CprStep0 = ({ onModeSelect }) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [inputValue, setInputValue] = useState('');

  const handleRealMode = () => {
    setModalVisible(true);
  };

  const handleConfirm = () => {
    const count = parseInt(inputValue, 10);
    if (!isNaN(count) && count > 0) {
      onModeSelect('real', count);
      setModalVisible(false);
      setInputValue('');
    } else {
      Alert.alert('오류', '1 이상의 숫자를 입력하세요.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>심폐소생술</Text>
      <TouchableOpacity style={styles.button} onPress={() => onModeSelect('practice')}>
        <Text style={styles.PracticeText}>훈련</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.button} onPress={handleRealMode}>
        <Text style={styles.RealText}>실전</Text>
      </TouchableOpacity>

      <Modal visible={modalVisible} transparent={true} animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>반복 횟수를 입력하세요</Text>
            <TextInput
              style={styles.input}
              keyboardType="number-pad"
              value={inputValue}
              onChangeText={(text) => setInputValue(text.replace(/[^0-9]/g, ''))}
              placeholder="숫자 입력"
              placeholderTextColor="#999"
            />
            <View style={styles.buttonRow}>
              <Pressable style={styles.modalButton} onPress={handleConfirm}>
                <Text style={styles.modalButtonText}>확인</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default CprStep0;
