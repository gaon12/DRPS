import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

const EvacMain = ({ navigation }) => {
  const [buttonWidth, setButtonWidth] = useState(null);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>대피 시작 장소 정하기</Text>

      <MaterialCommunityIcons
        name="map-marker"
        size={150}
        color="#666666"
        style={{
          marginBottom: 20,
        }}
      />

      <Text style={styles.subtitle}>아래의 방법 중 하나를 선택하세요.</Text>

      <TouchableOpacity
        style={[styles.button, buttonWidth ? { width: buttonWidth } : null]}
        onLayout={(event) => {
          const { width } = event.nativeEvent.layout;
          setButtonWidth(width);
        }}
        onPress={() => navigation.navigate('EvacwithAddress')}
      >
        <Text style={styles.buttonText}>주소나 건물로 선택</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, buttonWidth ? { width: buttonWidth } : null]}
        onPress={() => navigation.navigate('EvacwithMap')}
      >
        <Text style={styles.buttonText}>지도에서 선택</Text>
      </TouchableOpacity>
    </View>
  );
};

export default EvacMain;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    paddingTop: 30,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#003366',
    marginBottom: 20,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    color: '#666666',
    marginBottom: 30,
  },
  button: {
    backgroundColor: '#003366',
    borderRadius: 10,
    paddingVertical: 15,
    paddingHorizontal: 50,
    marginVertical: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 18,
    textAlign: 'center',
  },
});
