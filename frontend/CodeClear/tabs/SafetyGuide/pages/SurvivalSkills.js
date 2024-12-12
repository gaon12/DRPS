import React, { useState } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, ScrollView, LayoutAnimation, Platform, UIManager } from 'react-native';
import { useNavigation } from '@react-navigation/native';

// LayoutAnimation 활성화 (안드로이드에서)
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const MyCustomCard = ({ id, title, description, expanded, onPress, onNavigate, imageSource }) => (
  <View style={styles.cardWrapper}>
    <TouchableOpacity onPress={() => onPress(id)} style={styles.card}>
      <Image style={styles.cardImage} source={imageSource} />
      <View style={styles.cardContent}>
        <Text style={styles.cardTitle}>{title}</Text>
        {expanded && (
          <>
            <Text style={styles.cardDescription}>{description}</Text>
            <TouchableOpacity style={styles.button} onPress={onNavigate}>
              <Text style={styles.buttonText}>바로가기</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </TouchableOpacity>
  </View>
);

const MyCardGrid = () => {
  const [expandedCard, setExpandedCard] = useState(null);
  const navigation = useNavigation();

  const handleCardPress = (id) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedCard(expandedCard === id ? null : id);
  };

  const handleNavigate = (title) => {
    return () => {
      switch (title) {
        case '식수 확보':
          navigation.navigate('ExamplePage2');
          break;
        case '불 피우기':
          navigation.navigate('ExamplePage3');
          break;
        default:
          navigation.navigate('ExamplePage');
          break;
      }
    };
  };
  
  const renderCards = () => {
    return cardData.map((card, index) => (
      <MyCustomCard
        key={index}
        id={index}
        title={card.title}
        description={card.description}
        expanded={expandedCard === index}
        onPress={handleCardPress}
        onNavigate={handleNavigate(card.title)} // 클릭 이벤트에 맞춰 실행되도록 수정
        imageSource={card.image}
      />
    ));
  };
  
  

  const cardData = [
    { title: '매듭법', description: '다양한 상황에 맞는 매듭법.', image: require('./icon_pic/SurvivalSkills/rope.webp') },
    { title: '식수 확보', description: '깨끗한 물을 찾고 정화하기.', image: require('./icon_pic/SurvivalSkills/water.webp') },
    { title: '불 피우기', description: '불을 피우고 유지하는 방법.', image: require('./icon_pic/SurvivalSkills/fire.webp') },
    { title: '응급 처치', description: '기본적인 응급 처치 방법.', image: require('./icon_pic/SurvivalSkills/emergencybag.webp') },
    { title: '방향 찾기', description: '길을 찾는 기본적인 기술.', image: require('./icon_pic/SurvivalSkills/direction.webp') },
    { title: '식품 보관', description: '음식을 안전하게 보관하기.', image: require('./icon_pic/SurvivalSkills/food.webp') },
    { title: '대피소 제작', description: '안전한 대피소 만드는 법.', image: require('./icon_pic/SurvivalSkills/shelter.webp') },
    { title: '구조 신호', description: '구조 신호 보내는 방법.', image: require('./icon_pic/SurvivalSkills/sos.webp') },
  ];

  

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.grid}>
        {renderCards()}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 10,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  cardWrapper: {
    width: '48%',
    marginBottom: 20,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
    overflow: 'hidden',
  },
  cardImage: {
    width: '100%',
    height: 150,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  cardContent: {
    padding: 10,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  cardDescription: {
    fontSize: 13,
    marginBottom: 10,
    color: '#444',
  },
  button: {
    backgroundColor: '#007bff',
    paddingVertical: 8,
    borderRadius: 5,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default MyCardGrid;
