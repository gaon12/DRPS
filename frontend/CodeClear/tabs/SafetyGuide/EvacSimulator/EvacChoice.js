import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

const EvacChoice = () => {
  const buttonLabels = [
    "가까운 대피처 목록에서 선택",
    "주소나 목표물로 선택",
    "지도에서 선택"
  ];

  return (
    <View style={styles.container}>
      {/* 상단 제목 */}
      <Text style={styles.header}>대피처 정하기</Text>

      {/* 아이콘 대체 */}
      <MaterialCommunityIcons 
        name="account-group"  // 원하는 아이콘으로 변경 가능
        size={150}
        color="#000"
        style={styles.icon}
      />

      {/* 설명 텍스트 */}
      <Text style={styles.description}>
        대피할 장소를 설정하세요
      </Text>

      {/* 버튼 목록 */}
      <View style={styles.buttonContainer}>
        {buttonLabels.map((label, index) => (
          <TouchableOpacity key={index} style={styles.button}>
            <Text style={styles.buttonText}>{label}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

export default EvacChoice;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: 'white',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  icon: {
    alignSelf: 'center',
    marginBottom: 20,
  },
  description: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
  buttonContainer: {
    marginTop: 20,
  },
  button: {
    backgroundColor: '#0044cc',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 5,
    marginBottom: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    textAlign: 'center',
  },
});
