import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, TextInput, ScrollView } from 'react-native';
import { FontAwesome, MaterialIcons } from '@expo/vector-icons';
import { Calendar } from 'react-native-calendars';

const ChecklistItem = ({ title }) => {
  const [checked, setChecked] = useState(false);
  const [isMemoVisible, setMemoVisible] = useState(false);  // 메모 모달 상태
  const [memoText, setMemoText] = useState('');  // 메모 텍스트 상태
  const [isMemoSaved, setMemoSaved] = useState(false);  // 메모 저장 여부
  const [isCalendarVisible, setCalendarVisible] = useState(false);  // 캘린더 모달 상태
  const [dueDate, setDueDate] = useState(null);  // 기한 설정 상태
  const [selectedDate, setSelectedDate] = useState(null);  // 선택한 날짜
  const [currentTitle, setCurrentTitle] = useState('');  // 현재 메모를 편집 중인 리스트 제목

  const today = new Date().toISOString().split('T')[0];  // 오늘 날짜

  // 날짜 차이를 계산하는 함수
  const calculateDateDifference = (selectedDate) => {
    const todayDate = new Date(today);
    const selected = new Date(selectedDate);
    const differenceInTime = selected.getTime() - todayDate.getTime();
    return Math.ceil(differenceInTime / (1000 * 3600 * 24));  // 일 단위로 변환
  };

  // 메모 저장 핸들러
  const handleMemoSave = () => {
    if (memoText.trim().length > 0) {
      setMemoSaved(true);
    } else {
      setMemoSaved(false);
    }
    setMemoVisible(false);
  };

  // 메모 열기 핸들러
  const openMemoModal = (title) => {
    setCurrentTitle(title);
    setMemoVisible(true);
  };

  // 캘린더 핸들러
  const handleDayPress = (day) => {
    setSelectedDate(day.dateString);  // 선택한 날짜 저장 (파란색 유지)
  };

  // 캘린더 초기화 핸들러
  const handleResetDate = () => {
    setDueDate(null);
    setSelectedDate(null);
    setCalendarVisible(false);
  };

  // '확인' 버튼 클릭 시 설정된 날짜 적용
  const handleConfirmDate = () => {
    setDueDate(selectedDate);  // 선택한 날짜를 적용
    setCalendarVisible(false);
  };

  // 날짜에 따른 색상 및 텍스트 설정
  const getDateText = () => {
    if (!dueDate) return '기한 미설정';

    const daysDifference = calculateDateDifference(dueDate);

    if (daysDifference === 0) {
      return '기한 만료';  // 오늘 날짜와 같은 경우
    }

    return dueDate;  // 그 외는 날짜 출력
  };

  // 날짜에 따른 스타일 설정
  const getDateStyle = () => {
    if (!dueDate) return { backgroundColor: '#f0f0f0', textColor: 'gray', iconColor: 'gray' };

    const daysDifference = calculateDateDifference(dueDate);

    if (daysDifference === 0) {
      // 기한 만료인 경우: 버튼 전체 배경을 빨간색으로, 텍스트는 흰색, 아이콘은 회색으로
      return {
        backgroundColor: 'red',    // 버튼 전체 배경을 빨간색으로
        textColor: 'white',        // 텍스트는 흰색
        iconColor: 'gray'          // 아이콘은 회색
      };
    }

    // 30일 이하 빨간색 텍스트, 30일 초과 초록색 텍스트
    return {
      backgroundColor: '#f0f0f0',  // 기본 배경 색상
      textColor: daysDifference <= 30 ? 'red' : 'green',  // 날짜에 따라 텍스트 색상 변경
      iconColor: daysDifference <= 30 ? 'red' : 'green'   // 날짜에 따라 아이콘 색상 변경
    };
  };

  const dateStyle = getDateStyle();  // 텍스트 및 아이콘 스타일을 가져오기

  return (
    <View style={styles.checklistItem}>
      <View style={styles.row}>
        <TouchableOpacity onPress={() => setChecked(!checked)}>
          <FontAwesome
            name={checked ? 'check-square-o' : 'square-o'}
            size={24}
            color="black"
          />
        </TouchableOpacity>
        <Text style={styles.title}>{title}</Text>
        <TouchableOpacity style={styles.iconButton}>
          <FontAwesome name="question-circle" size={24} color="gray" />
        </TouchableOpacity>
      </View>

      <View style={styles.buttonRow}>
        <TouchableOpacity
          style={styles.memoButton}
          onPress={() => openMemoModal(title)}
        >
          <MaterialIcons
            name="edit"
            size={20}
            color={isMemoSaved ? 'blue' : 'gray'}  // 메모가 저장되면 파란색으로 변경
          />
          <Text style={[styles.buttonText, isMemoSaved && { color: 'blue' }]}>메모 편집</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.deadlineButton, { backgroundColor: dateStyle.backgroundColor }]}  // 버튼 자체의 배경색 변경
          onPress={() => setCalendarVisible(true)}
        >
          <Text style={[styles.buttonText, { color: dateStyle.textColor }]}>
            {getDateText()}
          </Text>
          <MaterialIcons name="calendar-today" size={20} color={dateStyle.iconColor} />
        </TouchableOpacity>
      </View>

      <Modal visible={isMemoVisible} animationType="slide" transparent={true}>
        <View style={styles.modalContainer}>
          <View style={styles.memoModal}>
            <Text style={styles.modalTitle}>메모 편집</Text>
            <Text style={styles.currentListTitle}>{currentTitle}</Text>
            <TextInput
              style={styles.memoInput}
              value={memoText}
              onChangeText={(text) => setMemoText(text)}
              placeholder="메모를 입력하세요"
            />
            <View style={styles.memoActions}>
              <TouchableOpacity onPress={() => setMemoVisible(false)}>
                <Text style={styles.cancelButton}>취소</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleMemoSave}>
                <Text style={styles.saveButton}>저장</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal visible={isCalendarVisible} animationType="slide" transparent={true}>
        <TouchableOpacity style={styles.modalContainer} activeOpacity={1} onPressOut={() => setCalendarVisible(false)}>
          <TouchableOpacity activeOpacity={1} style={styles.largeCalendarModal}>
            <Text style={styles.modalTitle}>기한 설정</Text>
            <Calendar
              onDayPress={handleDayPress}  // 날짜 선택 핸들러
              markedDates={selectedDate ? { [selectedDate]: { selected: true, marked: true, selectedColor: 'blue' } } : {}}  // 선택한 날짜 파란색으로 유지
              style={styles.fixedCalendarSize}  // 캘린더 크기 고정
              theme={{
                selectedDayBackgroundColor: 'blue',  // 선택된 날짜 배경 파란색
                todayTextColor: 'blue',  // 오늘 날짜 텍스트 색상
                arrowColor: 'blue',  // 화살표 색상 파란색
                monthTextColor: 'black',  // 월 텍스트 색상 설정
                textMonthFontSize: 20,  // 월 텍스트 크기 고정
                textMonthFontWeight: 'bold',  // 월 텍스트 굵기 설정
                textMonthFontFamily: 'Arial',  // 폰트 설정 (필요 시 다른 폰트 적용 가능)
                'stylesheet.calendar.header': {
                  header: {
                    flexDirection: 'row',
                    justifyContent: 'center',  // 월/년도를 가운데 정렬
                    alignItems: 'center',  // 수직 가운데 정렬
                    paddingHorizontal: 0,  // 양쪽 여백 제거
                    paddingVertical: 10,  // 상하 여백 설정
                    height: 50,  // 높이 고정
                    width: '100%',  // 가로 크기 고정
                  },
                  monthText: {
                    fontSize: 18,
                    fontWeight: 'bold',
                    width: 200,  // 가로 크기를 고정
                    textAlign: 'center',  // 텍스트 가운데 정렬
                  },
                  arrow: {
                    padding: 10,  // 화살표 크기 조정
                  },
                },
              }}
            />
            <View style={styles.calendarActions}>
              <TouchableOpacity onPress={handleResetDate}>
                <Text style={styles.resetButton}>초기화</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleConfirmDate}>
                <Text style={styles.confirmButton}>확인</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const AccordionItem = ({ sectionTitle, checklistItems }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <View style={styles.accordionContainer}>
      <TouchableOpacity onPress={() => setIsOpen(!isOpen)} style={styles.accordionHeader}>
        <Text style={styles.accordionTitle}>{sectionTitle}</Text>
        <FontAwesome name={isOpen ? 'minus' : 'plus'} size={24} color="black" />
      </TouchableOpacity>

      {isOpen && (
        <View style={styles.checklistContainer}>
          {checklistItems.map((item, index) => (
            <ChecklistItem key={index} title={item} />
          ))}
        </View>
      )}
    </View>
  );
};

const ImportantObjects = () => {
  const sections = [
    {
      title: '가방에 넣어두면 편리',
      items: ['들고 이동하기 편한 가방', '항상 여행에 가져가는 물건'],
    },
    {
      title: '귀가 곤란을 상정한 대비',
      items: ['비상약', '응급 처치 도구'],
    },
    {
      title: '안전성이 높은 외출 스타일',
      items: ['야광 조끼', '안전화'],
    },
    {
      title: '임신 중에 필요한 아이템',
      items: ['임산부 안전벨트', '필수 영양제'],
    },
    {
      title: '아기와의 외출',
      items: ['아기용품 가방', '기저귀', '젖병'],
    },
    {
      title: '6',
      items: ['장난감', '간식'],
    },
  ];

  return (
    <ScrollView style={styles.container}>
      {sections.map((section, index) => (
        <AccordionItem
          key={index}
          sectionTitle={section.title}
          checklistItems={section.items}
        />
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    backgroundColor: '#f0f0f0',
  },
  accordionContainer: {
    marginBottom: 10,
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 1,
    elevation: 2,
  },
  accordionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
  },
  accordionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  checklistContainer: {
    marginTop: 10,
  },
  checklistItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 16,
    flex: 1,
    marginLeft: 10,
  },
  iconButton: {
    padding: 5,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  memoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    padding: 10,
    borderRadius: 10,
    width: '48%',
  },
  deadlineButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    padding: 10,
    borderRadius: 10,
    width: '48%',
    justifyContent: 'space-between',
  },
  buttonText: {
    marginLeft: 5,
    color: 'gray',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  largeCalendarModal: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    width: '90%',
    height: 'auto',
    alignItems: 'center',
  },
  fixedCalendarSize: {
    width: '100%',
    height: 330,
    backgroundColor: 'transparent',
  },
  calendarActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    width: '100%',
    paddingHorizontal: 20,
    marginTop: 10,
  },
  resetButton: {
    color: 'blue',
    marginRight: 20,
  },
});

export default ImportantObjects;
