import React, { useState } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, ScrollView, LayoutAnimation, Platform, UIManager } from 'react-native';

// LayoutAnimation을 활성화 (안드로이드에서)
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const MyCustomCard = ({ id, title, description, expanded, onPress }) => (
  <View style={styles.cardWrapper}>
    <TouchableOpacity onPress={() => onPress(id)} style={styles.card}>
      {/* 이미지를 다시 사용 */}
      <Image style={styles.cardImage} source={{ uri: 'https://picsum.photos/700' }} />
      <View style={styles.cardContent}>
        <Text style={styles.cardTitle}>{title}</Text>
        {expanded && (
          <>
            <Text style={styles.cardDescription}>{description}</Text>
            <TouchableOpacity style={styles.button}>
              <Text style={styles.buttonText}>Action</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </TouchableOpacity>
  </View>
);

const MyCardGrid = () => {
  const [expandedCard, setExpandedCard] = useState(null);

  const handleCardPress = (id) => {
    // 애니메이션 시작
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedCard(expandedCard === id ? null : id);
  };

  // 카드 제목과 설명을 배열로 설정
  const cardData = [
    { title: '매듭법', description: 'This is description for card 1.' },
    { title: '식수 확보', description: 'This is description for card 2.' },
    { title: '불 피우기', description: 'This is description for card 3.' },
    { title: '응급 처치', description: 'This is description for card 4.' },
    { title: '방향 찾기', description: 'This is description for card 5.' },
    { title: '식품 보관', description: 'This is description for card 6.' },
    { title: '대피소 제작', description: 'This is description for card 7.' },
    { title: '~', description: 'This is description for card 8.' },
  ];

  const renderCards = () => {
    return cardData.map((card, index) => (
      <MyCustomCard
        key={index}
        id={index}
        title={card.title}
        description={card.description}
        expanded={expandedCard === index}
        onPress={handleCardPress}
      />
    ));
  };

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
