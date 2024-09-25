import React from 'react';
import { ScrollView, TouchableOpacity, View, Text, StyleSheet } from 'react-native';
import { Card, Title, Paragraph, Divider } from 'react-native-paper';
import { Ionicons, FontAwesome5 } from '@expo/vector-icons'; // 아이콘 패키지 가져오기

const ActionGuidelines = ({ navigation }) => {
  const guidelines = [
    {
      id: 1,
      title: '자연 재난',
      description: '지진, 홍수 등 자연 재난에 대한 국민행동요령',
      backgroundColor: '#B0E0E6',
      icon: 'earth-outline', 
      screen: 'NaturalDisasters', // 연결할 스크린
    },
    {
      id: 2,
      title: '사회 재난',
      description: '화재, 산업재해 등 사회 재난에 대한 국민행동요령',
      backgroundColor: '#FFD700',
      icon: 'alert-circle-outline',
      screen: 'SocialDisasters', 
    },
    {
      id: 3,
      title: '생활 재난',
      description: '폭염, 한파 등 생활 재난에 대한 국민행동요령',
      backgroundColor: '#98FB98',
      icon: 'sunny-outline',
      screen: 'LifeDisasters', 
    },
    {
      id: 4,
      title: '비상 재난',
      description: '테러, 전쟁 등 비상 재난에 대한 국민행동요령',
      backgroundColor: '#FFB6C1',
      icon: 'medical-outline',
      screen: 'EmergencyDisasters', 
    },
  ];

  return (
    <ScrollView style={{ padding: 10 }}>
      {guidelines.map((guideline) => (
        <TouchableOpacity
          key={guideline.id}
          onPress={() => navigation.navigate(guideline.screen)}
        >
          <Card style={{ marginVertical: 10, backgroundColor: guideline.backgroundColor }}>
            <Card.Content style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Ionicons name={guideline.icon} size={30} color="black" style={{ marginRight: 10 }} />
              <View>
                <Title style={{ fontWeight: 'bold' }}>{guideline.title}</Title>
                <Paragraph>{guideline.description}</Paragraph>
              </View>
            </Card.Content>
          </Card>
          {/* 비상 재난 항목 밑에만 구분선과 버튼을 추가 */}
          {guideline.id === 4 && (
            <View>
              {/* 점선 구분선 */}
              <Divider style={{ marginVertical: 10, borderWidth: 1, borderStyle: 'dashed', borderColor: '#000' }} />
              
              {/* 버튼 2개를 가로로 배치 */}
              <View style={styles.buttonContainer}>
                {/* 재난 체크 리스트 버튼 (MaterialIcons의 backpack 아이콘 사용) */}
                <TouchableOpacity
                  style={styles.button}
                  onPress={() => console.log('재난 체크 리스트')}
                >
                  <FontAwesome5 name="suitcase-rolling" size={40} color="white" />
                  <Text style={styles.buttonText}>재난 체크 리스트</Text>
                </TouchableOpacity>

                {/* 피난 시뮬레이션 버튼 */}
                <TouchableOpacity
                  style={styles.button}
                  onPress={() => console.log('피난 시뮬레이션')}
                >
                  <FontAwesome5 name="running" size={40} color="white" />
                  <Text style={styles.buttonText}>피난 시뮬레이션</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 10,
  },
  button: {
    flex: 1,
    paddingVertical: 15, // 버튼 세로 크기 증가
    marginHorizontal: 12,
    backgroundColor: '#B57EDC',
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
    height: 120, // 버튼 높이 지정
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 18, // 버튼 텍스트 크기 증가
    marginTop: 10, // 아이콘과 텍스트 간격
  },
});

export default ActionGuidelines;
