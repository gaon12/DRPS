const imagePaths = {
    crime: [
      { id: 101, text: '교통사고가 났어요', image: require('./img/crime_1.png') },
      { id: 102, text: '싸움이 났어요', image: require('./img/crime_2.png') },
      { id: 103, text: '폭행을 당했어요', image: require('./img/crime_3.png') },
      { id: 104, text: '도둑이 들었어요', image: require('./img/crime_4.png') },
      { id: 105, text: '피싱사기를 당했어요', image: require('./img/crime_5.png') },
      { id: 106, text: '누가 쫓아와요', image: require('./img/crime_6.png') },
      { id: 107, text: '납치를 당했어요', image: require('./img/crime_7.png') },
    ],
    fire: [
      { id: 201, text: '집에 불이 났어요', image: require('./img/fire_1.png') },
      { id: 202, text: '산에 불이 났어요', image: require('./img/fire_2.png') },
      { id: 203, text: '시장에 불이 났어요', image: require('./img/fire_3.png') },
      { id: 204, text: '공장에 불이 났어요', image: require('./img/fire_4.png') },
      { id: 205, text: '차에 불이 났어요', image: require('./img/fire_5.png') },
      { id: 206, text: '담배 불이 났어요', image: require('./img/fire_6.png') },
    ],
    emergency: [
      { id: 301, text: '응급환자가 있어요', image: require('./img/emergency_1.png') },
      { id: 302, text: '사람이 쓰러졌어요', image: require('./img/emergency_2.png') },
      { id: 303, text: '큰 부상을 입었어요', image: require('./img/emergency_3.png') },
      { id: 304, text: '교통사고가 났어요', image: require('./img/emergency_4.png') },
      { id: 305, text: '문이 잠겼어요', image: require('./img/emergency_5.png') },
      { id: 306, text: '엘리베이터에 갇혔어요', image: require('./img/emergency_6.png') },
      { id: 307, text: '산에서 길을 잃었어요', image: require('./img/emergency_7.png') },
    ],
    water: [
      { id: 401, text: '조난당한 사람 있어요', image: require('./img/water_1.png') },
      { id: 402, text: '사람이 바다에 빠졌어요', image: require('./img/water_2.png') },
      { id: 403, text: '배가 침수되고 있어요', image: require('./img/water_3.png') },
      { id: 404, text: '기름이 유출되었어요', image: require('./img/water_4.png') },
      { id: 405, text: '기름이 유출되었어요', image: require('./img/water_5.png') },
      { id: 406, text: '배에 불이 났어요', image: require('./img/water_6.png') },
    ],
  };
  
  export const getImageData = (category) => imagePaths[category] || [];
  