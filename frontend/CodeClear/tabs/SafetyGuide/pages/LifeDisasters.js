import React, { useState } from 'react';
import { Image, View, Text, TextInput, TouchableOpacity, FlatList, Modal, ScrollView, TouchableWithoutFeedback, StyleSheet } from 'react-native';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import styles from './DisasterGuideStyle';

const images = {
	'03001.png': require('./icon_pic/LifeDisasters/03001.png'),
	'03002.png': require('./icon_pic/LifeDisasters/03002.png'),
	'03003.png': require('./icon_pic/LifeDisasters/03003.png'),
	'03004.png': require('./icon_pic/LifeDisasters/03004.png'),
	'03005.png': require('./icon_pic/LifeDisasters/03005.png'),
	'03006.png': require('./icon_pic/LifeDisasters/03006.png'),
	'03007.png': require('./icon_pic/LifeDisasters/03007.png'),
	'03008.png': require('./icon_pic/LifeDisasters/03008.png'),
	'03009.png': require('./icon_pic/LifeDisasters/03009.png'),
	'03010.png': require('./icon_pic/LifeDisasters/03010.png'),
	'03011.png': require('./icon_pic/LifeDisasters/03011.png'),
	'03012.png': require('./icon_pic/LifeDisasters/03012.png'),
	'03013.png': require('./icon_pic/LifeDisasters/03013.png'),
	'03014.png': require('./icon_pic/LifeDisasters/03014.png'),
	'03015.png': require('./icon_pic/LifeDisasters/03015.png'),
	'03016.png': require('./icon_pic/LifeDisasters/03016.png'),
	'03017.png': require('./icon_pic/LifeDisasters/03017.png'),
	'03018.png': require('./icon_pic/LifeDisasters/03018.png'),
	'03019.png': require('./icon_pic/LifeDisasters/03019.png'),
};

const LifeDisasters = ({ navigation }) => {
  const [showList, setShowList] = useState(false); // 전체보기 리스트 표시 여부
  const [showModal, setShowModal] = useState(false); // 모달 표시 상태
  const [searchText, setSearchText] = useState('');
  const [selectedDisasters, setSelectedDisasters] = useState({
    bigButton1: '교통사고',
    bigButton2: '미세먼지',
    bigButton3: '식중독',
    bigButton4: '응급처치',
  });
  const [activeDisasters, setActiveDisasters] = useState(['교통사고', '미세먼지', '식중독', '응급처치']);

  // 재난 정보와 매핑되는 ID 리스트
  const modalDataList = [
    { id: '1', mappingId: '03001', title: '가정 안전점검', imgName: '03001.png' },
    { id: '2', mappingId: '03002', title: '가정 폭력 예방', imgName: '03002.png' },
    { id: '3', mappingId: '03003', title: '교통사고', imgName: '03003.png' },
    { id: '4', mappingId: '03004', title: '미세먼지', imgName: '03004.png' },
    { id: '5', mappingId: '03005', title: '붉은불개미', imgName: '03005.png' },
    { id: '6', mappingId: '03006', title: '산행안전사고', imgName: '03006.png' },
    { id: '7', mappingId: '03007', title: '석유제품 사고', imgName: '03007.png' },
    { id: '8', mappingId: '03008', title: '성폭력 예방', imgName: '03008.png' },
    { id: '9', mappingId: '03009', title: '소화기사용법', imgName: '03009.png' },
    { id: '10', mappingId: '03010', title: '소화전사용법', imgName: '03010.png' },
    { id: '11', mappingId: '03011', title: '승강기 안전사고', imgName: '03011.png' },
    { id: '12', mappingId: '03012', title: '식중독', imgName: '03012.png' },
    { id: '13', mappingId: '03013', title: '실종유괴 예방', imgName: '03013.png' },
    { id: '14', mappingId: '03014', title: '심폐소생술', imgName: '03014.png' },
    { id: '15', mappingId: '03015', title: '어린이 놀이시설 안전사고', imgName: '03015.png' },
    { id: '16', mappingId: '03016', title: '억류 및 납치', imgName: '03016.png' },
    { id: '17', mappingId: '03017', title: '응급처치', imgName: '03017.png' },
    { id: '18', mappingId: '03018', title: '학교 폭력 예방', imgName: '03018.png' },
    { id: '19', mappingId: '03019', title: '해파리피해', imgName: '03019.png' },
];


  const getImageSource = (imgName) => {
    if (images[imgName]) {
      return images[imgName];
    } else {
      console.warn(`Image not found for: ${imgName}`);
      return null;
    }
  };

  const allDisastersList = modalDataList.map(({ id, title }) => ({ id, title }));

  // 재난의 선택 상태를 관리
  const handleDisasterSelection = (title) => {
    const updatedDisasters = { ...selectedDisasters };
    if (Object.values(updatedDisasters).includes(title)) {
      for (let key in updatedDisasters) {
        if (updatedDisasters[key] === title) {
          updatedDisasters[key] = '';
        }
      }
    } else {
      for (let key in updatedDisasters) {
        if (!updatedDisasters[key]) {
          updatedDisasters[key] = title;
          break;
        }
      }
    }
    setSelectedDisasters(updatedDisasters);
    setActiveDisasters(Object.values(updatedDisasters).filter(item => item));
  };

  // ApiScreen으로 이동하면서 mappingId 전달하는 함수
  const handleItemPress = (title) => {
    const selectedDisaster = modalDataList.find((item) => item.title === title);
    if (selectedDisaster) {
      navigation.navigate('ApiScreen', { mappingId: selectedDisaster.mappingId, category: 'lifesafety' });
    }
  };

  const getButtonStyle = (title) => {
    return activeDisasters.includes(title) ? { backgroundColor: '#98FB98' } : { backgroundColor: '#f0f0f0' };
  };

  const renderHeader = () => (
    <>
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="검색어를 입력하세요"
          value={searchText}
          onChangeText={(text) => setSearchText(text)}
        />
        <MaterialIcons name="search" size={24} color="black" style={styles.searchIcon} />
      </View>

      <TouchableOpacity style={styles.settingsButton} onPress={() => setShowModal(true)}>
        <Ionicons name="settings-sharp" size={24} color="black" />
        <Text style={styles.settingsButtonText}>재난 설정</Text>
      </TouchableOpacity>

      <View style={styles.buttonRow}>
        <TouchableOpacity
          style={[styles.bigButton_l, getButtonStyle(selectedDisasters.bigButton1)]}
          onPress={() => handleItemPress(selectedDisasters.bigButton1)}
        >
          <Image
            source={getImageSource(
              modalDataList.find((item) => item.title === selectedDisasters.bigButton1)?.imgName
            )}
            style={styles.bigButtonImage} // 이미지 스타일 추가
          />
          <Text style={styles.buttonText}>{selectedDisasters.bigButton1}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.bigButton_l, getButtonStyle(selectedDisasters.bigButton2)]}
          onPress={() => handleItemPress(selectedDisasters.bigButton2)}
        >
          <Image
            source={getImageSource(
              modalDataList.find((item) => item.title === selectedDisasters.bigButton2)?.imgName
            )}
            style={styles.bigButtonImage}
          />
          <Text style={styles.buttonText}>{selectedDisasters.bigButton2}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.buttonRow}>
        <TouchableOpacity
          style={[styles.bigButton_l, getButtonStyle(selectedDisasters.bigButton3)]}
          onPress={() => handleItemPress(selectedDisasters.bigButton3)}
        >
          <Image
            source={getImageSource(
              modalDataList.find((item) => item.title === selectedDisasters.bigButton3)?.imgName
            )}
            style={styles.bigButtonImage}
          />
          <Text style={styles.buttonText}>{selectedDisasters.bigButton3}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.bigButton_l, getButtonStyle(selectedDisasters.bigButton4)]}
          onPress={() => handleItemPress(selectedDisasters.bigButton4)}
        >
          <Image
            source={getImageSource(
              modalDataList.find((item) => item.title === selectedDisasters.bigButton4)?.imgName
            )}
            style={styles.bigButtonImage}
          />
          <Text style={styles.buttonText}>{selectedDisasters.bigButton4}</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.showAllButton} onPress={() => setShowList(!showList)}>
        <Text style={styles.showAllButtonText}>전체보기</Text>
      </TouchableOpacity>
    </>
  );

  return (
    <View style={{ flex: 1, backgroundColor: '#fff' }}>
      <FlatList
        style={{ flex: 1, paddingHorizontal: 15 }}
        data={showList ? allDisastersList : []}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.listItemButton} onPress={() => handleItemPress(item.title)}>
            <Text style={styles.cellText}>{item.title}</Text>
            <MaterialIcons name="chevron-right" size={24} color="black" />
          </TouchableOpacity>
        )}
        numColumns={3}
        ListHeaderComponent={renderHeader}
      />

      {/* 모달 */}
      <Modal visible={showModal} transparent={true} animationType="slide" onRequestClose={() => setShowModal(false)}>
        <TouchableWithoutFeedback onPress={() => setShowModal(false)}>
          <View style={styles.modalContainer}>
            <TouchableWithoutFeedback>
              <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>재난 설정</Text>
                <ScrollView contentContainerStyle={styles.iconGrid}>
                  {modalDataList.map((item) => (
                    <TouchableOpacity
                      key={item.id}
                      style={[styles.iconButton, getButtonStyle(item.title)]}
                      onPress={() => handleDisasterSelection(item.title)}
                    >
                      <Image
                        source={getImageSource(item.imgName)}
                        style={styles.modalImage} // 이미지 스타일 추가
                      />
                      <Text style={styles.iconText}>{item.title}</Text>
                      {activeDisasters.includes(item.title) && (
                        <Text style={styles.positionIndicator}>{activeDisasters.indexOf(item.title) + 1}</Text>
                      )}
                    </TouchableOpacity>
                  ))}
                </ScrollView>
                <TouchableOpacity style={styles.closeButton} onPress={() => setShowModal(false)}>
                  <Text style={styles.closeButtonText}>닫기</Text>
                </TouchableOpacity>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
};

export default LifeDisasters;
