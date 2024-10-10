import React, { useEffect, useState } from 'react';
import { View, Text, Image, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';

const ApiScreen = ({ route }) => {
  const { disasterType } = route.params;
  const [apiData, setApiData] = useState({ text: '', image: '' });
  const [activeTab, setActiveTab] = useState('image'); // 디폴트로 'image' 탭이 선택됨

  useEffect(() => {
    const fetchDisasterInfo = async () => {
      try {
        const response = await fetch(
          'https://apis.uiharu.dev/drps/NationalActionTips/api.php?category=naturaldisaster&id=01011&returnfile=webp&returntype=base64'
        );
        const data = await response.json();
  
        if (data && data.data) {
          const decodedText = decodeURIComponent(escape(atob(data.data.text))); // Base64 텍스트 디코딩
          
          // Base64 이미지 데이터를 URI로 변환 (webp 형식으로 변경)
          const imageUri = `data:image/webp;base64,${data.data.image}`; // 이미지 데이터가 있는 경우
          setApiData({ text: decodedText, image: imageUri });
        } else {
          console.error('API 응답에 텍스트 또는 이미지 데이터가 없습니다.');
        }
      } catch (error) {
        console.error('API 요청 중 오류 발생:', error);
      }
    };
  
    fetchDisasterInfo();
  }, [disasterType]);

  return (
    <View style={styles.container}>
      <View style={styles.tabContainer}>
        {/* 이미지 탭 */}
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'image' && styles.activeTabButton]}
          onPress={() => setActiveTab('image')}
        >
          <Text style={[styles.tabButtonText, activeTab === 'image' && styles.activeTabButtonText]}>이미지</Text>
        </TouchableOpacity>

        {/* 텍스트 탭 */}
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'text' && styles.activeTabButton]}
          onPress={() => setActiveTab('text')}
        >
          <Text style={[styles.tabButtonText, activeTab === 'text' && styles.activeTabButtonText]}>텍스트</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.contentContainer}>
        {activeTab === 'image' ? (
          // 이미지 탭 선택 시
          apiData.image ? (
            <Image source={{ uri: apiData.image }} style={styles.image} />
          ) : (
            <Text>이미지를 불러오는 중입니다...</Text>
          )
        ) : (
          // 텍스트 탭 선택 시
          <Text style={styles.text}>{apiData.text}</Text>
        )}
      </ScrollView>
    </View>
  );
};

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  tabContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-start', // 탭 왼쪽 정렬
    backgroundColor: '#f0f0f0',
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  tabButton: {
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTabButton: {
    borderBottomColor: '#007BFF',
  },
  tabButtonText: {
    fontSize: 16,
    color: '#666',
  },
  activeTabButtonText: {
    color: '#007BFF',
    fontWeight: 'bold',
  },
  contentContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'flex-start', // 탭 내용 왼쪽 정렬
    padding: 20,
  },
  image: {
    width: width - 40,
    height: 300,
    resizeMode: 'contain',
    marginBottom: 20,
  },
  text: {
    fontSize: 16,
    textAlign: 'left',
    marginBottom: 20,
  },
});

export default ApiScreen;
