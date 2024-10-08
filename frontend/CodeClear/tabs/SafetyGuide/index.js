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
      icon: 'earth-outline',
      screen: 'NaturalDisasters',
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
          key={`guideline-${guideline.id}`}
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
          {guideline.id === 4 && (
            <View>
              <Divider style={{ marginVertical: 10, borderWidth: 1, borderStyle: 'dashed', borderColor: '#000' }} />
              <View style={styles.buttonContainer}>
                <TouchableOpacity
                  style={styles.button}
                  onPress={() => navigation.navigate('CheckList')} // '재난 체크 리스트' 페이지로 이동
                >
                  <FontAwesome5 name="suitcase-rolling" size={40} color="white" />
                  <Text style={styles.buttonText}>재난 체크 리스트</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.button}
                  onPress={() => navigation.navigate('EvacMain')} // '피난 시뮬레이션' 페이지로 이동
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