import React, { useState, useEffect, useRef } from 'react';
import { View, Image, ScrollView, Dimensions, StyleSheet, TouchableOpacity, Text, Share } from 'react-native';
import { Provider as PaperProvider, Modal, Portal, Button, ProgressBar } from 'react-native-paper';
import axios from 'axios';
import { PinchGestureHandler, State, GestureHandlerRootView } from 'react-native-gesture-handler';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Markdown from 'react-native-markdown-display';
import * as Speech from 'expo-speech';

const { width, height } = Dimensions.get('window');

export default function App({ navigation }) {
  const [pages, setPages] = useState([]);
  const [textContent, setTextContent] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isPageViewMode, setIsPageViewMode] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [scale, setScale] = useState(1);
  const scrollViewRef = useRef(null);
  const pageViewRef = useRef(null);
  const [activeTab, setActiveTab] = useState('image');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  useEffect(() => {
    fetchPages();
  }, []);

  const fetchPages = async () => {
    try {
      const response = await axios.get('https://apis.uiharu.dev/drps/NationalActionTips/api.php?category=naturaldisaster&id=01011&returnfile=webp');
      const { data } = response.data;
      
      const pageData = Object.entries(data)
        .filter(([key]) => key.startsWith('webp'))
        .sort(([a], [b]) => parseInt(a.slice(4)) - parseInt(b.slice(4)))
        .map(([_, value]) => `data:image/webp;base64,${value}`);
      
      const decodedText = decodeURIComponent(escape(atob(data.text)));
      
      setPages(pageData);
      setTotalPages(pageData.length);
      setTextContent(decodedText);
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching pages:', error);
      setIsLoading(false);
    }
  };

  const handleShare = async () => {
    try {
      const result = await Share.share({
        message: textContent,
      });
      if (result.action === Share.sharedAction) {
        if (result.activityType) {
          console.log('shared with activity type of', result.activityType);
        } else {
          console.log('shared');
        }
      } else if (result.action === Share.dismissedAction) {
        console.log('dismissed');
      }
    } catch (error) {
      alert(error.message);
    }
  };

  const handleTTS = async () => {
    if (isSpeaking) {
      await Speech.stop();
      setIsSpeaking(false);
    } else {
      setIsSpeaking(true);
      Speech.speak(textContent, {
        onDone: () => setIsSpeaking(false),
        onError: () => setIsSpeaking(false),
      });
    }
  };

  // 썸네일 뷰에서 페이지 뷰로 전환
  const handlePagePress = (index) => {
    setCurrentPage(index + 1);
    setIsPageViewMode(true);

    setTimeout(() => {
      if (pageViewRef.current) {
        pageViewRef.current.scrollTo({ x: index * width, animated: false });
      }
    }, 0);
  };

  // 슬라이드 이미지 뷰에서 썸네일 뷰로 복귀
  const handleBackToThumbnails = () => {
    setIsPageViewMode(false);
    setTimeout(() => {
      if (scrollViewRef.current) {
        scrollViewRef.current.scrollTo({ y: (currentPage - 1) * (((width - 40) * 1.414) + 10), animated: true });
      }
    }, 100);
  };

  const handlePinchGesture = (event) => {
    if (event.nativeEvent.state === State.ACTIVE) {
      setScale(event.nativeEvent.scale);
    }
  };

  const handleScroll = (event) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const page = Math.round(offsetX / width) + 1;
    setCurrentPage(page);
  };

  const goToPage = (page) => {
    if (pageViewRef.current) {
      pageViewRef.current.scrollTo({ x: (page - 1) * width, animated: true });
    }
    setCurrentPage(page);
    setModalVisible(false);
  };

  const renderPageView = () => (
    <View style={{ flex: 1 }}>
      <ScrollView
        ref={pageViewRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        style={styles.pageViewScrollContainer}
      >
        {pages.map((page, index) => (
          <PinchGestureHandler
            key={index}
            onGestureEvent={handlePinchGesture}
            onHandlerStateChange={handlePinchGesture}
          >
            <ScrollView 
              style={styles.pageContainer}
              contentContainerStyle={styles.pageContentContainer}
              maximumZoomScale={3}
              minimumZoomScale={1}
              showsVerticalScrollIndicator={false}
            >
              <Image
                source={{ uri: page }}
                style={[styles.pageImage, { transform: [{ scale }] }]}
                resizeMode="contain"
              />
            </ScrollView>
          </PinchGestureHandler>
        ))}
      </ScrollView>

      {/* 하단에 뒤로가기 버튼 UI 개선 */}
      <TouchableOpacity style={styles.backButton} onPress={handleBackToThumbnails}>
        <MaterialIcons name="arrow-back" size={16} color="white" />
        <Text style={styles.backButtonText}>뒤로 가기</Text>
      </TouchableOpacity>
    </View>
  );

  const renderScrollView = () => (
    <ScrollView
      ref={scrollViewRef}
      showsVerticalScrollIndicator={false}
      style={styles.thumbnailScrollContainer}
      contentContainerStyle={styles.thumbnailContentContainer}
    >
      {pages.map((page, index) => (
        <TouchableOpacity key={index} onPress={() => handlePagePress(index)} style={styles.thumbnailButton}>
          <Image
            source={{ uri: page }}
            style={styles.thumbnailImage}
            resizeMode="contain"
          />
        </TouchableOpacity>
      ))}
    </ScrollView>
  );

  if (isLoading) {
    return (
      <PaperProvider>
        <View style={styles.loadingContainer}>
          <Text>Loading pages...</Text>
          <ProgressBar indeterminate style={styles.progressBar} />
        </View>
      </PaperProvider>
    );
  }

  if (pages.length === 0) {
    return (
      <PaperProvider>
        <View style={styles.noDataContainer}>
          <Text>No image information available.</Text>
        </View>
      </PaperProvider>
    );
  }

  return (
    <PaperProvider>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <View style={styles.container}>
          <View style={styles.tabContainer}>
            <View style={styles.tabs}>
              <TouchableOpacity
                style={[styles.tabButton, activeTab === 'image' && styles.activeTabButton]}
                onPress={() => setActiveTab('image')}
              >
                <Text style={[styles.tabButtonText, activeTab === 'image' && styles.activeTabButtonText]}>이미지</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.tabButton, activeTab === 'text' && styles.activeTabButton]}
                onPress={() => setActiveTab('text')}
              >
                <Text style={[styles.tabButtonText, activeTab === 'text' && styles.activeTabButtonText]}>텍스트</Text>
              </TouchableOpacity>
            </View>

            {activeTab === 'image' ? (
              <TouchableOpacity style={styles.iconContainer} onPress={() => setModalVisible(true)}>
                <MaterialIcons name="menu" size={24} color={isDarkMode ? "#fff" : "black"} />
              </TouchableOpacity>
            ) : (
              <View style={styles.iconContainer}>
                <TouchableOpacity style={styles.iconButton} onPress={handleShare}>
                  <MaterialIcons name="share" size={24} color={isDarkMode ? "#fff" : "black"} />
                </TouchableOpacity>
                <TouchableOpacity style={styles.iconButton} onPress={handleTTS}>
                  <MaterialIcons name={isSpeaking ? "volume-off" : "volume-up"} size={24} color={isDarkMode ? "#fff" : "black"} />
                </TouchableOpacity>
                <TouchableOpacity style={styles.iconButton} onPress={() => console.log('Summarize 기능 실행')}>
                  <MaterialIcons name="summarize" size={24} color={isDarkMode ? "#fff" : "black"} />
                </TouchableOpacity>
              </View>
            )}
          </View>

          {activeTab === 'image' ? (
            isPageViewMode ? renderPageView() : renderScrollView()
          ) : (
            <View style={{ flex: 1 }}>
              <ScrollView contentContainerStyle={styles.textContainer}>
                <Markdown style={markdownStyles}>{textContent}</Markdown>
              </ScrollView>
            </View>
          )}

          <Portal>
            <Modal visible={modalVisible} onDismiss={() => setModalVisible(false)} contentContainerStyle={styles.modalContent}>
              <Text style={styles.modalTitle}>Go to Page</Text>
              <ScrollView style={styles.pageButtonContainer}>
                {pages.map((_, index) => (
                  <Button
                    key={index}
                    mode="outlined"
                    onPress={() => goToPage(index + 1)}
                    style={styles.pageButton}
                  >
                    Page {index + 1}
                  </Button>
                ))}
              </ScrollView>
              <Button mode="contained" onPress={() => setModalVisible(false)} style={styles.closeButton}>
                Close
              </Button>
            </Modal>
          </Portal>
        </View>
      </GestureHandlerRootView>
    </PaperProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f0f0',
  },
  tabContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between', // 탭과 아이콘 간 간격 유지
    backgroundColor: '#f0f0f0',
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    alignItems: 'center',
    paddingHorizontal: 10,
  },
  tabs: {
    flexDirection: 'row',
  },
  tabButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,  // 탭 간 간격 조절
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
  iconContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconButton: {
    marginLeft: 15,
  },
  pageViewScrollContainer: {
    flex: 1,
  },
  pageContainer: {
    flex: 1,
  },
  pageContentContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pageImage: {
    width,
    height,
  },
  thumbnailScrollContainer: {
    flex: 1,
  },
  thumbnailContentContainer: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  thumbnailButton: {
    marginBottom: 10,
  },
  thumbnailImage: {
    width: (width - 40) * 0.8, // 80% 크기로 줄임
    height: ((width - 40) * 1.414) * 0.8, // 높이도 비율에 맞춰 조정
    borderRadius: 8,
  },  
  textContainer: {
    flexGrow: 1,
    padding: 10,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#007BFF',
    paddingVertical: 5,  // 패딩을 줄여 버튼 크기 조정
    paddingHorizontal: 14,
    borderRadius: 25,
    marginVertical: 10,  // 버튼 위아래 여백을 줄여 공간 최소화
    alignSelf: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5, // Android 용 그림자
  },
  backButtonText: {
    color: 'white',
    fontSize: 14,  // 텍스트 크기를 줄여서 버튼이 더 작게 보이도록 조정
    marginLeft: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressBar: {
    width: 200,
    marginTop: 20,
  },
  noDataContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    margin: 20,
    borderRadius: 8,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  pageButtonContainer: {
    maxHeight: 300,
  },
  pageButton: {
    marginBottom: 10,
  },
  closeButton: {
    marginTop: 20,
  },
});

const markdownStyles = StyleSheet.create({
  body: {
    fontSize: 16,
    lineHeight: 24,
    color: '#333',
  },
  heading1: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    marginTop: 20,
  },
  heading2: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
    marginTop: 16,
  },
  paragraph: {
    marginBottom: 10,
  },
  list: {
    marginLeft: 20,
  },
  listItem: {
    marginBottom: 5,
  },
  strong: {
    fontWeight: 'bold',
  },
  em: {
    fontStyle: 'italic',
  },
});
