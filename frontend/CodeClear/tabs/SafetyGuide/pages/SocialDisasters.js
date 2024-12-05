import React, { useState } from 'react';
import { Image, View, Text, TextInput, TouchableOpacity, FlatList, Modal, ScrollView, TouchableWithoutFeedback, StyleSheet } from 'react-native';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import styles from './DisasterGuideStyle';

const images = {
	'02001.png': require('./icon_pic/SocialDisasters/02001.png'),
	'02002.png': require('./icon_pic/SocialDisasters/02002.png'),
	'02003.png': require('./icon_pic/SocialDisasters/02003.png'),
	'02004.png': require('./icon_pic/SocialDisasters/02004.png'),
	'02005.png': require('./icon_pic/SocialDisasters/02005.png'),
	'02006.png': require('./icon_pic/SocialDisasters/02006.png'),
	'02007.png': require('./icon_pic/SocialDisasters/02007.png'),
	'02008.png': require('./icon_pic/SocialDisasters/02008.png'),
	'02009.png': require('./icon_pic/SocialDisasters/02009.png'),
	'02010.png': require('./icon_pic/SocialDisasters/02010.png'),
	'02011.png': require('./icon_pic/SocialDisasters/02011.png'),
	'02012.png': require('./icon_pic/SocialDisasters/02012.png'),
	'02013.png': require('./icon_pic/SocialDisasters/02013.png'),
	'02014.png': require('./icon_pic/SocialDisasters/02014.png'),
	'02015.png': require('./icon_pic/SocialDisasters/02015.png'),
	'02016.png': require('./icon_pic/SocialDisasters/02016.png'),
	'02017.png': require('./icon_pic/SocialDisasters/02017.png'),
	'02018.png': require('./icon_pic/SocialDisasters/02018.png'),
	'02019.png': require('./icon_pic/SocialDisasters/02019.png'),
	'02020.png': require('./icon_pic/SocialDisasters/02020.png'),
	'02021.png': require('./icon_pic/SocialDisasters/02021.png'),
	'02022.png': require('./icon_pic/SocialDisasters/02022.png'),
	'02023.png': require('./icon_pic/SocialDisasters/02023.png'),
	'02024.png': require('./icon_pic/SocialDisasters/02024.png'),
	'02025.png': require('./icon_pic/SocialDisasters/02025.png'),
	'02026.png': require('./icon_pic/SocialDisasters/02026.png'),
	'02027.png': require('./icon_pic/SocialDisasters/02027.png'),
	'02028.png': require('./icon_pic/SocialDisasters/02028.png'),
	'02029.png': require('./icon_pic/SocialDisasters/02029.png'),
	'02030.png': require('./icon_pic/SocialDisasters/02030.png'),
	'02031.png': require('./icon_pic/SocialDisasters/02031.png'),
	'02032.png': require('./icon_pic/SocialDisasters/02032.png'),
	'02033.png': require('./icon_pic/SocialDisasters/02033.png'),
  };
  

const SociallDisasters = ({ navigation }) => {
  const [showList, setShowList] = useState(false); // 전체보기 리스트 표시 여부
  const [showModal, setShowModal] = useState(false); // 모달 표시 상태
  const [searchText, setSearchText] = useState('');
  const [selectedDisasters, setSelectedDisasters] = useState({
    bigButton1: '화재',
    bigButton2: '산불',
    bigButton3: '감염병예방',
    bigButton4: 'gps전파혼신재난',
  });
  const [activeDisasters, setActiveDisasters] = useState(['화재', '산불', '감염병예방', 'gps전파혼신재난']);

  // 재난 정보와 매핑되는 ID 리스트
  const modalDataList = [
    { id: '1', mappingId: '02001', title: '가축질병', imgName: '02001.png' },
    { id: '2', mappingId: '02002', title: '감염병예방', imgName: '02002.png' },
    { id: '3', mappingId: '02003', title: '건축물 붕괴', imgName: '02003.png' },
    { id: '4', mappingId: '02004', title: '경기장 안전', imgName: '02004.png' },
    { id: '5', mappingId: '02005', title: '공동구재난', imgName: '02005.png' },
    { id: '6', mappingId: '02006', title: '공연장 안전', imgName: '02006.png' },
    { id: '7', mappingId: '02007', title: '금융전산', imgName: '02007.png' },
    { id: '8', mappingId: '02008', title: '대규모수질오염', imgName: '02008.png' },
    { id: '9', mappingId: '02009', title: '댐 붕괴', imgName: '02009.png' },
    { id: '10', mappingId: '02010', title: '도로터널사고', imgName: '02010.png' },
    { id: '11', mappingId: '02011', title: '보건의료재난', imgName: '02011.png' },
    { id: '12', mappingId: '02012', title: '사업장대규모인적사고', imgName: '02012.png' },
    { id: '13', mappingId: '02013', title: '산불', imgName: '02013.png' },
    { id: '14', mappingId: '02014', title: '수난사고', imgName: '02014.png' },
    { id: '15', mappingId: '02015', title: '식용수', imgName: '02015.png' },
    { id: '16', mappingId: '02016', title: '원유수급 위기', imgName: '02016.png' },
    { id: '17', mappingId: '02017', title: '원전사고', imgName: '02017.png' },
    { id: '18', mappingId: '02018', title: '유도선 사고', imgName: '02018.png' },
    { id: '19', mappingId: '02019', title: '인공우주물체추락', imgName: '02019.png' },
    { id: '20', mappingId: '02020', title: '전기·가스사고', imgName: '02020.png' },
    { id: '21', mappingId: '02021', title: '전력수급단계별', imgName: '02021.png' },
    { id: '22', mappingId: '02022', title: '정보통신사고', imgName: '02022.png' },
    { id: '23', mappingId: '02023', title: '정전 및 전력부족', imgName: '02023.png' },
    { id: '24', mappingId: '02024', title: '철도,지하철사고', imgName: '02024.png' },
    { id: '25', mappingId: '02025', title: '테러', imgName: '02025.png' },
    { id: '26', mappingId: '02026', title: '폭발', imgName: '02026.png' },
    { id: '27', mappingId: '02027', title: '항공기사고', imgName: '02027.png' },
    { id: '28', mappingId: '02028', title: '해양 선박사고', imgName: '02028.png' },
    { id: '29', mappingId: '02029', title: '해양오염사고', imgName: '02029.png' },
    { id: '30', mappingId: '02030', title: '화생방사고', imgName: '02030.png' },
    { id: '31', mappingId: '02031', title: '화재', imgName: '02031.png' },
    { id: '32', mappingId: '02032', title: '화학물질사고', imgName: '02032.png' },
    { id: '33', mappingId: '02033', title: 'gps전파혼신재난', imgName: '02033.png' },
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
      navigation.navigate('ApiScreen', { mappingId: selectedDisaster.mappingId, category: 'socialdisaster' });
    }
  };

  const getButtonStyle = (title) => {
    return activeDisasters.includes(title) ? { backgroundColor: '#FFD700' } : { backgroundColor: '#f0f0f0' };
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
          style={[styles.bigButton_s, getButtonStyle(selectedDisasters.bigButton1)]}
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
          style={[styles.bigButton_s, getButtonStyle(selectedDisasters.bigButton2)]}
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
          style={[styles.bigButton_s, getButtonStyle(selectedDisasters.bigButton3)]}
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
          style={[styles.bigButton_s, getButtonStyle(selectedDisasters.bigButton4)]}
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

export default SociallDisasters;
