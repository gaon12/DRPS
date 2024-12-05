import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Dimensions,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  TouchableWithoutFeedback,
  RefreshControl
} from 'react-native';
import * as SMS from 'expo-sms';
import { getImageData } from './imageData';
import * as Location from 'expo-location';
import axios from 'axios';

const { width } = Dimensions.get('window');

const ImageReportScreen = () => {
  const [selectedCategory, setSelectedCategory] = useState('crime');
  const [currentPage, setCurrentPage] = useState(0);
  const [selectedImageText, setSelectedImageText] = useState('');
  const [userName, setUserName] = useState('');
  const [userPhone, setUserPhone] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [locationText, setLocationText] = useState('위치정보 없음');

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchLocation();
    setRefreshing(false);
  };

  useEffect(() => {
    fetchLocation();
  }, []);

  const categories = [
    { id: 'crime', label: '범죄' },
    { id: 'fire', label: '화재' },
    { id: 'emergency', label: '구조/구급' },
    { id: 'water', label: '해양' },
  ];

  const imagesToDisplay = getImageData(selectedCategory);

  const chunkImages = (data, size) => {
    const chunks = [];
    for (let i = 0; i < data.length; i += size) {
      chunks.push(data.slice(i, i + size));
    }
    return chunks;
  };

  const imagePages = chunkImages(imagesToDisplay, 4);

  const fetchCityName = async (latitude, longitude) => {
    try {
      const response = await axios.get(
        `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}`,
        {
          headers: {
            'User-Agent': 'WeatherApp/1.0 (weather@app.com)',
          },
        }
      );

      const address = response.data.address;
      const combinedLocation = [
        address.city,
        address.borough,
        address.quarter,
      ]
        .filter(Boolean) // 값이 있는 것만 남기기
        .join(' '); // 공백으로 합치기

      return combinedLocation || '위치정보 없음';
    } catch (error) {
      console.error('Error fetching city name:', error);
      return '위치정보 없음';
    }
  };

  const fetchLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('오류', '위치 접근 권한이 필요합니다.');
        setLocationText('위치정보 없음');
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      const cityName = await fetchCityName(location.coords.latitude, location.coords.longitude);
      setLocationText(cityName);
    } catch (error) {
      console.error('Error fetching location:', error);
      setLocationText('위치정보 없음');
    }
  };

  const handleScroll = (event) => {
    const scrollX = event.nativeEvent.contentOffset.x;
    const pageIndex = Math.round(scrollX / width);
    setCurrentPage(pageIndex);
  };

  const handleImageSelect = (text) => {
    setSelectedImageText(text);
  };

  const handleReport = async () => {
    // 이름, 전화번호, 선택된 이미지 텍스트가 모두 입력되었는지 확인
    if (!userName || !userPhone || !selectedImageText) {
      Alert.alert('오류', '모든 필드를 입력하고 이미지를 선택해주세요.');
      return;
    }

    // 전화번호 유효성 검사 (한국 전화번호 형식: 010-XXXX-XXXX 또는 01X-XXX-XXXX)
    const phoneRegex = /^01[0|1|6|7|8|9]-\d{3,4}-\d{4}$/;
    if (!phoneRegex.test(userPhone)) {
      Alert.alert('오류', '올바른 전화번호 형식이 아닙니다. (예: 010-1234-5678)');
      return;
    }

    // SMS 전송 가능 여부 확인
    const isAvailable = await SMS.isAvailableAsync();
    if (!isAvailable) {
      Alert.alert('오류', 'SMS 전송을 지원하지 않는 기기입니다.');
      return;
    }

    // 메시지 내용 작성
    const message = `신고자 이름: ${userName}\n전화번호: ${userPhone}\n범죄 유형: ${selectedImageText}\n재난 위치: ${locationText} `;

    // SMS 전송
    const { result } = await SMS.sendSMSAsync(['112'], message);
    if (result === 'sent') {
      Alert.alert('성공', '신고가 성공적으로 접수되었습니다.');
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={{ paddingBottom: 200 }}
        keyboardShouldPersistTaps="handled"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={{ flex: 1 }}>
            {/* 카테고리 버튼 */}
            <View style={styles.categoryContainer}>
              {categories.map((category) => (
                <TouchableOpacity
                  key={category.id}
                  style={[
                    styles.categoryButton,
                    selectedCategory === category.id && styles.categoryButtonSelected,
                  ]}
                  onPress={() => setSelectedCategory(category.id)}
                >
                  <Text
                    style={[
                      styles.categoryText,
                      selectedCategory === category.id && styles.categoryTextSelected,
                    ]}
                  >
                    {category.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* 그림 목록 */}
            <Text style={styles.imageListTitle}>그림 목록</Text>
            <ScrollView
              horizontal
              pagingEnabled
              onScroll={handleScroll}
              scrollEventThrottle={16}
              showsHorizontalScrollIndicator={false}
            >
              {imagePages.map((page, pageIndex) => (
                <View key={pageIndex} style={styles.page}>
                  <View style={styles.row}>
                    {page.slice(0, 2).map((item) => (
                      <TouchableOpacity
                        key={item.text}
                        style={styles.imageItem}
                        onPress={() => handleImageSelect(item.text)}
                      >
                        <Image source={item.image} style={styles.image} />
                        <Text style={styles.imageText}>{item.text}</Text>
                        <View
                          style={[
                            styles.radioButton,
                            selectedImageText === item.text && styles.radioButtonSelected,
                          ]}
                        />
                      </TouchableOpacity>
                    ))}
                  </View>
                  <View style={styles.row}>
                    {page.slice(2, 4).map((item) => (
                      <TouchableOpacity
                        key={item.text}
                        style={styles.imageItem}
                        onPress={() => handleImageSelect(item.text)}
                      >
                        <Image source={item.image} style={styles.image} />
                        <Text style={styles.imageText}>{item.text}</Text>
                        <View
                          style={[
                            styles.radioButton,
                            selectedImageText === item.text && styles.radioButtonSelected,
                          ]}
                        />
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              ))}
            </ScrollView>

            {/* 기타 입력 필드 */}
            <View style={styles.footer}>
              <TextInput
                style={styles.input}
                placeholder="이름"
                value={userName}
                onChangeText={setUserName}
              />
              <TextInput
                style={styles.input}
                placeholder="전화번호"
                value={userPhone}
                onChangeText={setUserPhone}
                keyboardType="phone-pad"
              />
              <View style={styles.locationCard}>
                <Text style={styles.locationText}>재난위치 확인</Text>
                <Text style={styles.locationDetails}>{locationText}</Text>
              </View>
              <TouchableOpacity style={styles.button} onPress={handleReport}>
                <Text style={styles.buttonText}>신고하기</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F0F4F8' },
  categoryContainer: { flexDirection: 'row', justifyContent: 'space-between', padding: 7 },
  categoryButton: {
    paddingVertical: 8,
    paddingHorizontal: 24,
    backgroundColor: '#E0E0E0',
    borderRadius: 8,
  },
  categoryButtonSelected: { backgroundColor: '#007BFF' },
  categoryText: { fontSize: 14, color: '#333' },
  categoryTextSelected: { color: '#FFF', fontWeight: 'bold' },
  imageListTitle: { fontSize: 18, fontWeight: 'bold', textAlign: 'center', marginBottom: 10, color: '#333' },
  page: { width, paddingHorizontal: 16 },
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  imageItem: { width: '45%', alignItems: 'center', marginBottom: 16 },
  image: { width: '100%', height: 100, borderRadius: 8, marginBottom: 8 },
  imageText: { fontSize: 14, textAlign: 'center', color: '#333', marginBottom: 8 },
  radioButton: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#007BFF',
  },
  radioButtonSelected: { backgroundColor: '#007BFF' },
  pagination: { flexDirection: 'row', justifyContent: 'center' },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#E0E0E0', marginHorizontal: 3 },
  activeDot: { backgroundColor: '#007BFF' },
  footer: { marginTop: 10, alignItems: 'center', paddingHorizontal: 16 },
  input: {
    width: '100%',
    height: 50, // 세로 길이 증가
    borderColor: '#CCC',
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 16, // 입력 필드 간 간격
    paddingHorizontal: 16, // 좌우 여백 추가
    backgroundColor: '#FFF',
  },
  locationCard: {
    width: '100%',
    padding: 16,
    borderRadius: 8,
    backgroundColor: '#FFF',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginBottom: 16,
  },
  locationText: { fontSize: 16, fontWeight: 'bold', color: '#333', marginBottom: 4 },
  locationDetails: { fontSize: 14, color: '#666' },
  button: {
    backgroundColor: '#007BFF',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    width: '100%',
  },
  buttonText: { color: '#FFF', fontSize: 16, fontWeight: 'bold' },
});

export default ImageReportScreen;
