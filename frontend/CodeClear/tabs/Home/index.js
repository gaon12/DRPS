import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, Dimensions, Image } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons'; // 아이콘 사용을 위한 import
import { useNavigation } from '@react-navigation/native';

// Function to determine the banner size based on device type and screen dimensions
const getBannerSize = () => {
    const screenWidth = Dimensions.get('window').width;
    if (screenWidth >= 1440) {
        return { width: 1440, height: 360 }; // PC size
    } else if (screenWidth >= 800) {
        return { width: 800, height: 280 }; // Tablet size
    } else {
        return { width: screenWidth, height: (screenWidth / 375) * 150 }; // Mobile size
    }
};

// Function to determine the device type based on screen width
const getDeviceType = () => {
    const screenWidth = Dimensions.get('window').width;
    if (screenWidth >= 1440) {
        return 'pc';
    } else if (screenWidth >= 800) {
        return 'tablet';
    } else {
        return 'mobile';
    }
};

const App = () => {
    const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
    const [imageError, setImageError] = useState([]); 
    const [bannerSize, setBannerSize] = useState(getBannerSize()); 
    const scrollViewRef = useRef(null);
    const slideInterval = useRef(null);
    const deviceType = getDeviceType();

    // Function to get the correct local default image based on the device type
    const getDefaultImage = () => {
        const images = {
            pc: require('./imgs/pc_default_banner.png'),
            tablet: require('./imgs/tablet_default_banner.png'),
            mobile: require('./imgs/mobile_default_banner.png'),
        };
        return images[deviceType] || images.mobile;
    };

    useEffect(() => {
        // Update banner size when the screen dimensions change
        const handleResize = () => setBannerSize(getBannerSize());
        const subscription = Dimensions.addEventListener('change', handleResize);

        return () => subscription?.remove();
    }, []);

    useEffect(() => {
        // Auto slide functionality with interval set to 5 seconds
        slideInterval.current = setInterval(() => {
            const nextIndex = (currentSlideIndex + 1) % slides.length;
            scrollViewRef.current?.scrollTo({
                x: bannerSize.width * nextIndex,
                animated: true,
            });
            setCurrentSlideIndex(nextIndex);
        }, 5000); // Auto-slide interval set to 5 seconds

        return () => clearInterval(slideInterval.current);
    }, [currentSlideIndex, bannerSize.width]);

    // 로컬 이미지 파일을 사용하여 슬라이드 정의
    const slides = [
        { title: 'CODECLEAR', subtitle: '프로젝트 파이팅.', imageUrl: require('./imgs/tem_1.webp') },
        { title: '슬라이드 2', subtitle: '추가적인 설명을 여기에 입력하세요.', imageUrl: require('./imgs/tem_2.png') },
        { title: '슬라이드 3', subtitle: '이 부분도 사용자 정의 가능합니다.', imageUrl: require('./imgs/tem_3.png') },
    ];

    const handleScroll = (event) => {
        const slideWidth = bannerSize.width;
        const contentOffsetX = event.nativeEvent.contentOffset.x;
        const newIndex = Math.floor(contentOffsetX / slideWidth);
        setCurrentSlideIndex(newIndex);
    };

    const handleImageError = (index) => {
        setImageError((prev) => {
            const newErrors = [...prev];
            newErrors[index] = true;
            return newErrors;
        });
    };

    const isColor = (str) => /^#[0-9A-F]{6}$/i.test(str);

    return (
        <View style={styles.container}>
            <ScrollView ref={scrollViewRef} style={styles.scrollView}>
                <View style={[styles.bannerContainer, { height: bannerSize.height }]}>
                    <ScrollView
                        horizontal
                        pagingEnabled
                        showsHorizontalScrollIndicator={false}
                        onScroll={handleScroll}
                        scrollEventThrottle={16}
                        ref={scrollViewRef} // Ensure ref is set correctly
                    >
                        {slides.map((slide, index) => (
                            <View
                                key={index}
                                style={[
                                    styles.slide,
                                    bannerSize,
                                    isColor(slide.imageUrl) ? { backgroundColor: slide.imageUrl } : {},
                                ]}
                            >
                                {!isColor(slide.imageUrl) && !imageError[index] ? (
                                    <Image
                                        source={slide.imageUrl} // 로컬 이미지일 경우 바로 사용
                                        style={[styles.bannerImage, bannerSize]}
                                        onError={() => handleImageError(index)}
                                        resizeMode="contain"
                                    />
                                ) : imageError[index] ? (
                                    <Image
                                        source={getDefaultImage()}
                                        style={[styles.bannerImage, bannerSize]}
                                        resizeMode="contain"
                                    />
                                ) : (
                                    <View style={[styles.bannerPlaceholder, bannerSize]}>
                                        <Text style={styles.slideTitle}>{slide.title}</Text>
                                        <Text style={styles.slideSubtitle}>{slide.subtitle}</Text>
                                    </View>
                                )}
                                <Text style={styles.pageIndicator}>
                                    {index + 1} / {slides.length}
                                </Text>
                            </View>
                        ))}
                    </ScrollView>
                </View>

                {/* Other scrollable content */}
                <View style={styles.locationInfo}>
                    <TouchableOpacity style={styles.smallLocationButton}>
                        <Text style={styles.buttonText}>현재 위치를 알 수 없거나 도외입니다</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.smallLocationButton}>
                        <Text style={styles.buttonText}>지역 설정</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.smallLocationButton}>
                        <Text style={styles.buttonText}>설정 지역에 관한 간단한 재난정보</Text>
                    </TouchableOpacity>
                </View>

                <Text style={styles.sectionTitle}>재난 정보 확인</Text>
                
                {/* 가로 스크롤 가능한 재난 정보 확인 탭 */}
                <ScrollView 
                    horizontal 
                    showsHorizontalScrollIndicator={false} 
                    contentContainerStyle={styles.gridHorizontal}
                >
                    <TouchableOpacity style={styles.card}>
						<Icon name="earth-outline" size={40} color="#A0D6E0" /> 
                        <Text style={styles.cardText}>자연 재난</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.card}>
						<Icon name="alert-circle-outline" size={40} color="#FFD700" /> 
                        <Text style={styles.cardText}>사회 재난</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.card}>
						<Icon name="sunny-outline" size={40} color="#82E682" /> 
                        <Text style={styles.cardText}>생활 재난</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.card}>
						<Icon name="medical-outline" size={40} color="#FFB6C1" /> 
                        <Text style={styles.cardText}>비상 재난</Text>
                    </TouchableOpacity>
                </ScrollView>

                <Text style={[styles.sectionTitle, { paddingTop: 20 }]}>평소에 대비하기</Text>
                <View style={styles.grid}>
                    <TouchableOpacity style={styles.card}>
                        <Text style={styles.cardText}>체크 리스트</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.card}>
                        <Text style={styles.cardText}>피난 시뮬레이션</Text>
                    </TouchableOpacity>
                </View>

                <Text style={styles.sectionTitle}>기타</Text>
                <ScrollView 
                    horizontal 
                    showsHorizontalScrollIndicator={false} 
                    contentContainerStyle={styles.gridHorizontal}
                >
                <View style={styles.grid}>
                    <TouchableOpacity style={styles.card}>
                        <Text style={styles.cardText}>행정안전부 바로가기</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.card}>
                        <Text style={styles.cardText}>공지사항</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.card}>
                        <Text style={styles.cardText}>업데이트 내역</Text>
                    </TouchableOpacity>
                </View>
                </ScrollView>
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    scrollView: {
        flex: 1,
    },
    bannerContainer: {
        width: '100%',
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
    },
    slide: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    bannerImage: {
        resizeMode: 'contain',
        alignSelf: 'center',
    },
    bannerPlaceholder: {
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#003f88',
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
    pageIndicator: {
        position: 'absolute',
        bottom: 10,
        right: 10,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        color: 'white',
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 15,
        fontSize: 12,
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
    // 가로 스크롤 가능한 그리드 스타일
    gridHorizontal: {
        flexDirection: 'row',
        paddingHorizontal: 20,
    },
    card: {
        backgroundColor: '#E8F0F8',
        padding: 20,
        borderRadius: 10,
        width: 150, // 가로 슬라이드를 위해 너비를 적절히 설정
        height: 120,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 15, // 카드들 사이에 간격을 줌
    },
    cardText: {
        fontSize: 14,
		marginTop: 10,
		fontWeight: 'bold',
    },
    grid: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        padding: 20,
    },
});

export default App;
