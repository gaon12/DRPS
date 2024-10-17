import React, { useState, useEffect, useRef } from 'react';
import { View, Image, ScrollView, Dimensions, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { Provider as PaperProvider, Appbar, Modal, Portal, Button, ProgressBar } from 'react-native-paper';
import axios from 'axios';
import { PinchGestureHandler, State, GestureHandlerRootView } from 'react-native-gesture-handler';
import Markdown from 'react-native-markdown-display';

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
  const [fileName, setFileName] = useState('');
  const scrollViewRef = useRef(null);
  const pageViewRef = useRef(null);
  const [activeTab, setActiveTab] = useState('image');

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
      setFileName('Natural Disaster Guide');
      setTextContent(decodedText);
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching pages:', error);
      setIsLoading(false);
    }
  };

  const handlePagePress = (index) => {
    setCurrentPage(index + 1);
    setIsPageViewMode(true);

    setTimeout(() => {
      if (pageViewRef.current) {
        pageViewRef.current.scrollTo({ x: index * width, animated: false });
      }
    }, 0);
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

  const handleBackPress = () => {
    setIsPageViewMode(false);
    setTimeout(() => {
      if (scrollViewRef.current) {
        scrollViewRef.current.scrollTo({ y: (currentPage - 1) * (((width - 40) * 1.414) + 10), animated: true });
      }
    }, 100);
  };

  const renderPageView = () => (
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
          <Appbar.Header>
            {isPageViewMode && (
              <Appbar.BackAction onPress={handleBackPress} />
            )}
            <Appbar.Content title={fileName} subtitle={`${currentPage}/${totalPages}`} />
            <Appbar.Action icon="menu" onPress={() => setModalVisible(true)} />
          </Appbar.Header>
          
          <View style={styles.tabContainer}>
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
            isPageViewMode ? renderPageView() : renderScrollView()
          ) : (
            <ScrollView contentContainerStyle={styles.textContainer}>
              <Markdown style={markdownStyles}>{textContent}</Markdown>
            </ScrollView>
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
    justifyContent: 'flex-start',
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
    padding: 20,
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

