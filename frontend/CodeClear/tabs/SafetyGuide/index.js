import React from 'react';
import { ScrollView, TouchableOpacity, View, Text, StyleSheet } from 'react-native';
import { Card, Title, Paragraph, Divider } from 'react-native-paper';
import { Ionicons, FontAwesome5 } from '@expo/vector-icons';

const ActionGuidelines = ({ navigation }) => {
  const guidelines = [
    {
      id: 1,
      title: '자연 재난',
      description: '지진, 홍수 등 자연 재난에 대한 국민행동요령',
      backgroundColor: '#B0E0E6',
      iconType: 'Ionicons', // 아이콘 타입을 명시적으로 구분
      icon: 'earth-outline',
      screen: 'NaturalDisasters',
    },
    {
      id: 2,
      title: '사회 재난',
      description: '화재, 산업재해 등 사회 재난에 대한 국민행동요령',
      backgroundColor: '#FFD700',
      iconType: 'Ionicons',
      icon: 'alert-circle-outline',
      screen: 'SocialDisasters',
    },
    {
      id: 3,
      title: '생활 재난',
      description: '폭염, 한파 등 생활 재난에 대한 국민행동요령',
      backgroundColor: '#98FB98',
      iconType: 'Ionicons',
      icon: 'sunny-outline',
      screen: 'LifeDisasters',
    },
    {
      id: 4,
      title: '비상 재난',
      description: '테러, 전쟁 등 비상 재난에 대한 국민행동요령',
      backgroundColor: '#FFB6C1',
      iconType: 'Ionicons',
      icon: 'medical-outline',
      screen: 'EmergencyDisasters',
    },
    {
      id: 5,
      title: '생존 기술',
      description: '생존에 필요한 기술들',
      backgroundColor: '#FFA07A',
      iconType: 'FontAwesome5', // 아이콘 타입 변경
      icon: 'hand-holding-medical', // FontAwesome5 아이콘
      screen: 'SurvivalSkills',
    },
  ];

  return (
    <ScrollView style={{ padding: 10 }}>
      {guidelines.map((guideline) => (
        <View key={`guideline-${guideline.id}`}>
          <TouchableOpacity
            onPress={() => navigation.navigate(guideline.screen)}
          >
            <Card style={{ marginVertical: 10, backgroundColor: guideline.backgroundColor }}>
              <Card.Content style={{ flexDirection: 'row', alignItems: 'center' }}>
                {guideline.iconType === 'Ionicons' ? (
                  <Ionicons name={guideline.icon} size={30} color="black" style={{ marginRight: 10 }} />
                ) : (
                  <FontAwesome5 name={guideline.icon} size={30} color="black" style={{ marginRight: 10 }} />
                )}
                <View>
                  <Title style={{ fontWeight: 'bold' }}>{guideline.title}</Title>
                  <Paragraph>{guideline.description}</Paragraph>
                </View>
              </Card.Content>
            </Card>
          </TouchableOpacity>

          {guideline.id === 5 && (
            <View>
              <Divider style={{ marginVertical: 10, borderWidth: 1, borderStyle: 'dashed', borderColor: '#000' }} />
              <View style={styles.buttonContainer}>
                <TouchableOpacity
                  style={styles.button}
                  onPress={() => navigation.navigate('CList')} // '재난 체크 리스트' 페이지로 이동
                >
                  <FontAwesome5 name="suitcase-rolling" size={40} color="white" />
                  <Text style={styles.buttonText}>재난 체크 리스트</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.button}
                  onPress={() => navigation.navigate('Map')} // '피난 시뮬레이션' 페이지로 이동
                >
                  <FontAwesome5 name="running" size={40} color="white" />
                  <Text style={styles.buttonText}>피난 경로 확인</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>
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
    paddingVertical: 15,
    marginHorizontal: 12,
    backgroundColor: '#B57EDC',
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
    height: 120,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 18,
    marginTop: 10,
  },
});

export default ActionGuidelines;
