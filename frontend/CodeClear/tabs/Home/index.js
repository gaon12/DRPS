import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, Dimensions } from 'react-native';

export default function App() {
  const [isEnglish, setIsEnglish] = useState(false);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0); // 현재 슬라이드 인덱스 관리
  const scrollViewRef = useRef(null); // ScrollView 참조
  const slideInterval = useRef(null); // 슬라이드 자동 전환 타이머

  const texts = {
    korean: {
      title: 'CODECLEAR',
      subtitle: '프로젝트 파이팅.',
      locationInfo: '현재 위치를 알 수 없거나 도외입니다',
      box1: '지역 설정',
      box2: '설정 지역에 관한 간단한 재난정보',
      section1Title: '재난 정보 확인',
      section2Title: '평소에 대비하기',
      card1: '자연 재난',
      card2: '사회 재난',
      card3: '체크 리스트',
      card4: '피난 시뮬레이션',
      translateButton: '영어로 번역',
    },
    english: {
      title: 'CODECLEAR',
      subtitle: 'Nil desperandum.',
      locationInfo: 'Current location',
      box1: 'New Box 1',
      box2: 'New Box 2',
      section1Title: 'Check Disaster Information',
      section2Title: 'Prepare in Advance',
      card1: 'Natural Disasters',
      card2: 'Social Disasters',
      card3: 'Checklist',
      card4: 'Evacuation Simulation',
      translateButton: 'Translate to Korean',
    },
  };

  const currentText = isEnglish ? texts.english : texts.korean;

  const toggleLanguage = () => {
    setIsEnglish(!isEnglish);
  };

  const slides = [
    { title: currentText.title, subtitle: currentText.subtitle },
    { title: '슬라이드 2', subtitle: '추가적인 설명을 여기에 입력하세요.' },
    { title: '슬라이드 3', subtitle: '이 부분도 사용자 정의 가능합니다.' },
  ];

  const handleScroll = (event) => {
    const slideWidth = Dimensions.get('window').width;
    const contentOffsetX = event.nativeEvent.contentOffset.x;
    const newIndex = Math.floor(contentOffsetX / slideWidth);
    setCurrentSlideIndex(newIndex); // 슬라이드 인덱스 업데이트
  };

  // 자동 슬라이드 기능
  useEffect(() => {
    slideInterval.current = setInterval(() => {
      const nextIndex = (currentSlideIndex + 1) % slides.length; // 다음 슬라이드 인덱스
      scrollViewRef.current.scrollTo({
        x: Dimensions.get('window').width * nextIndex,
        animated: true,
      });
      setCurrentSlideIndex(nextIndex); // 슬라이드 인덱스 업데이트
    }, 1500); // 1.5초마다 슬라이드 이동

    return () => {
      clearInterval(slideInterval.current); // 컴포넌트가 언마운트 될 때 타이머 정리
    };
  }, [currentSlideIndex]);

  return (
    <View style={styles.container}>
      {/* 상단 로고 및 타이틀 슬라이드 */}
      <ScrollView
        ref={scrollViewRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll} // 스크롤 이벤트 핸들러
        scrollEventThrottle={16} // 스크롤 이벤트 빈도 설정
      >
        {slides.map((slide, index) => (
          <View key={index} style={styles.slide}>
            <Text style={styles.slideTitle}>{slide.title}</Text>
            <Text style={styles.slideSubtitle}>{slide.subtitle}</Text>
            {/* 슬라이드 내부에 페이지 인덱스 표시 */}
            <Text style={styles.pageIndicator}>{index + 1} / {slides.length}</Text>
          </View>
        ))}
      </ScrollView>

     

      {/* 위치 설정 및 정보 영역 */}
      <ScrollView style={styles.content}>
        <View style={styles.locationInfo}>
          <TouchableOpacity style={styles.smallLocationButton}>
            <Text style={styles.buttonText}>{currentText.locationInfo}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.smallLocationButton}>
            <Text style={styles.buttonText}>{currentText.box1}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.smallLocationButton}>
            <Text style={styles.buttonText}>{currentText.box2}</Text>
          </TouchableOpacity>
        </View>

        {/* 방재 배우기 섹션 */}
        <Text style={styles.sectionTitle}>{currentText.section1Title}</Text>
        <View style={styles.grid}>
          <TouchableOpacity style={styles.card}>
            <Text style={styles.cardText}>{currentText.card1}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.card}>
            <Text style={styles.cardText}>{currentText.card2}</Text>
          </TouchableOpacity>
        </View>

        {/* 평소에 대비하기 섹션 */}
        <Text style={styles.sectionTitle}>{currentText.section2Title}</Text>
        <View style={styles.grid}>
          <TouchableOpacity style={styles.card}>
            <Text style={styles.cardText}>{currentText.card3}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.card}>
            <Text style={styles.cardText}>{currentText.card4}</Text>
          </TouchableOpacity>
        </View>

        {/* 하단 메뉴: 영어 번역 버튼 */}
        <View style={styles.footer}>
          <TouchableOpacity style={styles.translateButton} onPress={toggleLanguage}>
            <Text style={styles.translateButtonText}>{currentText.translateButton}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  slide: {
    width: Dimensions.get('window').width,
    backgroundColor: '#003f88',
    height: 150,
    justifyContent: 'center',
    alignItems: 'center',
  },
  slideTitle: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
  },
  slideSubtitle: {
    color: 'white',
    fontSize: 14,
    marginTop: 10,
  },
  slideIndicator: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 15,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  slideIndicatorText: {
    color: 'white', // 인덱스 텍스트 색상 흰색으로 설정
    fontSize: 12,
  },
  pageIndicator: {
    position: 'absolute',
    bottom: 10, // 슬라이드 하단에 배치
    right: 10, // 오른쪽에 배치
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // 배경을 반투명으로 설정
    color: 'white', // 글자 색상을 흰색으로 설정
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 15,
    fontSize: 12,
  },
  content: {
    paddingTop: 20,
  },
  locationInfo: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 20,
  },
  smallLocationButton: {
    backgroundColor: '#f0f0f0',
    padding: 15,
    borderRadius: 10,
    width: '30%',
    height: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    fontSize: 12,
    color: '#000',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    padding: 10,
  },
  grid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 20,
  },
  card: {
    backgroundColor: '#f0f0f0',
    padding: 20,
    borderRadius: 10,
    width: '45%',
    height: 120,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardText: {
    fontSize: 14,
  },
  footer: {
    padding: 20,
    backgroundColor: '#003f88',
    alignItems: 'center',
  },
  translateButton: {
    backgroundColor: '#ffd700',
    padding: 15,
    borderRadius: 10,
    width: '90%',
    alignItems: 'center',
  },
  translateButtonText: {
    fontSize: 18,
    color: '#000',
    fontWeight: 'bold',
  },
});
