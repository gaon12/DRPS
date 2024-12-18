import React, { useState, useEffect, useRef, useContext } from 'react';
import { View, ScrollView, Dimensions, StyleSheet, TouchableOpacity, Text, Share } from 'react-native';
import { Image } from 'expo-image';
import { ActivityIndicator, Provider as PaperProvider, Modal, Portal, Button, ProgressBar } from 'react-native-paper';
import axios from 'axios';
import { PinchGestureHandler, GestureHandlerRootView } from 'react-native-gesture-handler';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Markdown from 'react-native-markdown-display';
import { handleTTS, stopTTS } from '../../News/tabs/News/hooks/handleTTS';
import { SettingsContext } from '../../../Context';
import { handleSummaryGemini } from '../../News/tabs/News/hooks/handleSummaryGemini.js';

const { width, height } = Dimensions.get('window');

export default function ApiScreen({ route, navigation }) {
   const { disasterType, mappingId, category } = route.params || {};
   const { settings } = useContext(SettingsContext);
   const [pages, setPages] = useState([]);
   const [textContent, setTextContent] = useState('');
   const [thumbhashList, setThumbhashList] = useState([]);
   const [currentPage, setCurrentPage] = useState(1);
   const [totalPages, setTotalPages] = useState(0);
   const [isLoading, setIsLoading] = useState(true);
   const [loading, setLoading] = useState(true); // 요약 로딩 상태 추가
   const [isPageViewMode, setIsPageViewMode] = useState(false);
   const [modalVisible, setModalVisible] = useState(false);
   const [summaryModalVisible, setSummaryModalVisible] = useState(false);
   const [summaryText, setSummaryText] = useState([]);
   const [currentSummary, setCurrentSummary] = useState(0);
   const [scale, setScale] = useState(1);
   const scrollViewRef = useRef(null);
   const pageViewRef = useRef(null);
   const [activeTab, setActiveTab] = useState('image');
   const [isDarkMode, setIsDarkMode] = useState(false);
   const [isSpeaking, setIsSpeaking] = useState(false);
   const [scaleStates, setScaleStates] = useState([]);

   useEffect(() => {
      if (mappingId) {
         fetchPages(mappingId);
      }
   }, [mappingId]);

   useEffect(() => {
      if (mappingId && activeTab === 'image') {
         fetchPages(mappingId);
      }
   }, [mappingId]);

   useEffect(() => {
      // summaryText가 변경될 때 로딩 상태 업데이트
      if (summaryText[currentSummary]) {
         setLoading(false);
      } else {
         setLoading(true);
      }
   }, [summaryText, currentSummary]);

   useEffect(() => {
      if (pages.length > 0) {
         setScaleStates(pages.map(() => 1)); // 각 페이지마다 초기 확대 상태를 1로 설정
      }
   }, [pages]);

   const lastScale = useRef(1);

   const handlePinchGesture = (event, index) => {
      if (event.nativeEvent.scale) {
         const newScale = scaleStates[index] * event.nativeEvent.scale;
         setScaleStates((prevScaleStates) =>
            prevScaleStates.map((scale, i) => (i === index ? Math.max(1, Math.min(newScale, 3)) : scale))
         );
      }
   };

   // 제스처가 종료되었을 때 lastScale 갱신
   const handlePinchGestureStateChange = (event, index) => {
      if (event.nativeEvent.oldState === 4) {
         setScaleStates((prevScaleStates) =>
            prevScaleStates.map((scale, i) => (i === index ? scaleStates[index] : scale))
         );
      }
   };

   const fetchPages = async (id) => {
      setIsLoading(true);
      try {
         const apiUrl = `https://apis.uiharu.dev/drps/NationalActionTips/api.php?category=${category}&id=${id}&imagetype=avif`;
         console.log(`API 요청 URL: ${apiUrl}`);
         const response = await axios.get(apiUrl);
         const { data } = response.data;

         // 페이지 및 thumbhash 데이터 설정
         const pageData = Array.from({ length: data.thumbhash.length }, (_, index) => {
            const imageUrl = `https://apis.uiharu.dev/drps/NationalActionTips/data/${id}/img/avif/${index + 1}.avif`;
            return imageUrl;
         });

         setPages(pageData);
         setThumbhashList(data.thumbhash);  // thumbhash 리스트를 상태로 저장
         setTotalPages(pageData.length);

         // 마크다운 파일 요청
         if (data.md_exists) {
            const mdUrl = `https://apis.uiharu.dev/drps/NationalActionTips/data/${id}/${id}.md`;
            console.log(`마크다운 파일 요청 URL: ${mdUrl}`);
            const mdResponse = await axios.get(mdUrl);
            setTextContent(mdResponse.data);
         } else {
            setTextContent("해당하는 마크다운 파일이 없습니다.");
            console.log("마크다운 파일이 존재하지 않습니다.");
         }
      } catch (error) {
         console.error('Error fetching pages:', error);
         alert('데이터를 불러오는 중 오류가 발생했습니다.');
      } finally {
         setIsLoading(false);
      }
   };

   const handleShare = async () => {
      try {
         const result = await Share.share({
            message: textContent,
         });
         if (result.action === Share.sharedAction && result.activityType) {
            console.log('shared with activity type of', result.activityType);
         }
      } catch (error) {
         alert(error.message);
      }
   };

   const handleTTSPress = async () => {
      try {
         await handleTTS(isSpeaking, setIsSpeaking, { formattedContent: [{ text: textContent }] }, settings);
      } catch (error) {
         console.error("TTS 처리 중 오류:", error);
         alert("TTS 처리 중 오류가 발생했습니다.");
      }
   };

   // 요약을 처리하는 함수
   const showSummary = async () => {
      try {
         // handleSummaryGemini 함수를 호출하여 요약 텍스트를 가져옵니다.
         const summary = await handleSummaryGemini({ formattedContent: [{ text: textContent, type: "text" }] });

         // summaryText 상태에 요약 결과를 저장하여 모달에 표시
         setSummaryText([summary]);  // 배열로 저장하여 기존 코드를 수정하지 않고 사용 가능하게 함
         setCurrentSummary(0);
         setSummaryModalVisible(true);
      } catch (error) {
         console.error("요약 처리 중 오류:", error);
         setSummaryText(["요약에 실패했습니다. 다시 시도해주세요."]);
         setSummaryModalVisible(true);
      }
   };

   const renderPageView = () => (
      <View style={{ flex: 1 }}>
         <ScrollView
            ref={pageViewRef}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            style={styles.pageViewScrollContainer}
         >
            {pages.map((page, index) => (
               <PinchGestureHandler
                  key={index}
                  onGestureEvent={(event) => handlePinchGesture(event, index)}
                  onHandlerStateChange={(event) => handlePinchGestureStateChange(event, index)}
               >
                  <ScrollView
                     style={styles.pageContainer}
                     contentContainerStyle={styles.pageContentContainer}
                     maximumZoomScale={3}
                     minimumZoomScale={1}
                     showsVerticalScrollIndicator={false}
                  >
                     <Image
                        source={page}
                        placeholder={{ thumbhash: thumbhashList[index] }}
                        style={[
                           styles.pageImage,
                           { transform: [{ scale: scaleStates[index] || 1 }] }, // scaleStates가 정의된 경우에만 값 사용
                        ]}
                        contentFit="contain"
                        transition={1000}
                     />
                  </ScrollView>
               </PinchGestureHandler>
            ))}
         </ScrollView>

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
               <Image source={{ uri: page }} style={styles.thumbnailImage} placeholder={{ thumbhash: thumbhashList[index] }} resizeMode="contain" />
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

   const handlePagePress = (index) => {
      setCurrentPage(index + 1);
      setIsPageViewMode(true);
      setTimeout(() => {
         if (pageViewRef.current) {
            pageViewRef.current.scrollTo({ x: width * index, animated: false });
         }
      }, 0);
   };

   // 페이지 뷰 모드에서 닫기 버튼을 누르면 원래 화면으로 돌아가도록 수정
   const handleBackToThumbnails = () => {
      setIsPageViewMode(false);
   };

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
                        <TouchableOpacity style={styles.iconButton} onPress={handleTTSPress}>
                           <MaterialIcons name={isSpeaking ? "volume-off" : "volume-up"} size={24} color={isDarkMode ? "#fff" : "black"} />
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.iconButton} onPress={showSummary}>
                           <MaterialIcons name="summarize" size={24} color={isDarkMode ? "#fff" : "black"} />
                        </TouchableOpacity>
                     </View>
                  )}
               </View>

               {activeTab === 'image' ? (isPageViewMode ? renderPageView() : renderScrollView()) : (
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
                           <Button key={index} mode="outlined" onPress={() => goToPage(index + 1)} style={styles.pageButton}>
                              Page {index + 1}
                           </Button>
                        ))}
                     </ScrollView>
                     <Button mode="contained" onPress={() => setModalVisible(false)} style={styles.closeButton}>Close</Button>
                  </Modal>

                  <Modal visible={summaryModalVisible} onDismiss={() => setSummaryModalVisible(false)} contentContainerStyle={styles.modalContent}>
                     <Text style={styles.modalTitle}>요약 결과</Text>
                     <ScrollView style={styles.summaryContainer}>
                        {loading ? (
                           <ActivityIndicator size="large" color="#0000ff" /> // 로딩 애니메이션
                        ) : (
                           <Markdown style={markdownStyles}>
                              {summaryText[currentSummary] || '요약이 없습니다.'}
                           </Markdown>
                        )}
                     </ScrollView>
                     <Button onPress={() => setSummaryModalVisible(false)} style={styles.closeButton}>닫기</Button>
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