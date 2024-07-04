# 대피소 검색
`/shelters` 경로는 대피소 검색 기능을 제공합니다.

## 요청
|HTTP|
|--|
| `GET` / `POST` http://{address}:{port}/shelters|

### 요청 바디
|필드명|필수 여부|타입|설명|
|--|--|--|--|
| `shelter_type` | `Y` | `String` | 대피소 종류 |
| `lat` | `N` | `Float` | 위도값 |
| `lon` | `N` | `Float` | 경도값 |
| `distance` | `N` | `String` | 범위. 단위는 km이며, 1 ~ 10 사이의 자연수여야 함. 생략 시 `5` |
| `address` | `N` | `String` | 주소 |
| `pageno` | `N` | `String` | 페이지 번호 |

* `pageno` 생략 시 `1`로 간주합니다.

### 응답
#### 응답 바디
##### shelter_type이 CivilDefenseShelters인 경우
|필드 이름|데이터 타입|설명|
|--|--|--|
|`StatusCode`|`Int`|상태 코드|
|`message`|`String`|응답 메시지|
| `data` | `Array` | 민방위 대피소 정보가 담긴 배열 |
| `data > management_number` | `String` | 대피소 관리번호 |
| `data > designation_date` | `String` | 대피소 지정일자 |
| `data > release_date` | `String` | 대피소 해제일자 |
| `data > operational_status` | `String` | 대피소 운영상태 |
| `data > facility_name` | `String` | 대피소 시설명 |
| `data > facility_type` | `String` | 대피소 시설구분 |
| `data > road_address` | `String` | 대피소 도로명 주소 |
| `data > full_address` | `String` | 대피소 지번 주소 |
| `data > postal_code` | `Int` | 대피소 우편번호 |
| `data > location` | `String` | 대피소 지상/지하 여부 |
| `data > facility_area` | `Int` | 대피소 시설면적(㎡) |
| `data > max_capacity` | `Int` | 대피소 최대수용인원 |
| `data > last_updated` | `String` | 최종 수정시점 |
| `data > data_update_type` | `String` | 대피소 정보 업데이트 여부 |
| `data > data_update_date` | `String` | 대피소 정보를 마지막으로 업데이트한 날짜 |
| `data > lat` | `Float` | 대피소의 위도값 |
| `data > lon` | `Float` | 대피소의 경도값 |
| `RequestTime` | `String` | 요청 시간 |

* `data > data_update_type`이 `I`이면 새로 추가된 대피소, `U`이면 업데이트(최신화)한 대피소 정보입니다.
* `format` 파라미터를 제외한 어떠한 파라미터값을 붙히더라도, 출력에는 영향이 없습니다.
* `GET` 요청 결과와 `POST` 요청 결과 모두 동일합니다.

##### shelter_type이 EarthquakeShelters 경우
|필드 이름|데이터 타입|설명|
|--|--|--|
|`StatusCode`|`Int`|상태 코드|
|`message`|`String`|응답 메시지|
| `data` | `Array` | 지진 대피소 정보가 담긴 배열 |
| `data > arcd` | `String` | 대피소 지역코드 |
| `data > acmdfclty_sn` | `String` | 대피소 시설 일련번호 |
| `data > ctprvn_nm` | `String` | 대피소 시도명 |
| `data > sgg_nm` | `String` | 대피소 시군구명 |
| `data > vt_acmdfclty_nm` | `String` | 대피소 시설명 |
| `data > rdnmadr_cd` | `String` | 대피소 도로명 주소 코드 |
| `data > bdong_cd` | `String` | 대피소 법정동 코드 |
| `data > hdong_cd` | `String` | 대피소 행정동 코드 |
| `data > dtl_adres` | `Int` | 대피소 상세주소 |
| `data > fclty_ar` | `String` | 대피소 시설면적(㎡) |
| `data > lat` | `Int` | 대피소의 위도값 |
| `data > lon` | `Int` | 대피소의 경도값 |
| `data > mngps_nm` | `String` | 대피소 관리기관명 |
| `data > mngps_telno` | `String` | 대피소 관리기관 전화번호 |
| `data > vt_acmd_psbl_nmpr` | `String` | 대피소 최대 수용인원 수 |
| `data > acmdfclty_se_nm` | `Float` | 지진 옥외 대피 장소 유형 구분 |
| `data > rn_adres` | `Float` | 대피소의 도로명 주소 |
| `RequestTime` | `String` | 요청 시간 |

* `format` 파라미터를 제외한 어떠한 파라미터값을 붙히더라도, 출력에는 영향이 없습니다.
* `GET` 요청 결과와 `POST` 요청 결과 모두 동일합니다.

##### shelter_type이 EarthquakeShelters 경우
|필드 이름|데이터 타입|설명|
|--|--|--|
|`StatusCode`|`Int`|상태 코드|
|`message`|`String`|응답 메시지|
| `data` | `Array` | 지진 대피소 정보가 담긴 배열 |
| `data > id` | `String` | 대피소 일련 번호 |
| `data > sido_name` | `String` | 대피소 시도명 |
| `data > sigungu_name` | `String` | 대피소 시군구명 |
| `data > remarks` | `String` | 지진해일 대피지구명 |
| `data > shel_nm` | `String` | 지진해일 긴급대피장소명 |
| `data > address` | `String` | 대피소 지번 주소 |
| `data > lat` | `Int` | 대피소의 위도값 |
| `data > lon` | `Int` | 대피소의 경도값 |
| `data > shel_av` | `Int` | 대피소 최대 수용인원 수 |
| `data > lenth` | `String` | 해안선 이격 거리(m) |
| `data > shel_div_type` | `String` | 지진해일 긴급대피장소 구분 |
| `data > seismic` | `String` | 내진 적용 여부 |
| `data > height` | `String` | 대피소 해발 높이 |
| `data > tel` | `Float` | 대피소 관리기관 전화번호 |
| `data > new_address` | `Float` | 대피소의 도로명 주소 |
| `data > manage_gov_nm` | `Float` | 대피소 관리 기관명 |
| `RequestTime` | `String` | 요청 시간 |

* `format` 파라미터를 제외한 어떠한 파라미터값을 붙히더라도, 출력에는 영향이 없습니다.
* `GET` 요청 결과와 `POST` 요청 결과 모두 동일합니다.

### 요청 예시
#### GET - 지진 대피소
```url
http://{address}:{port}/shelters?shelter_type=EarthquakeShelters
```

#### POST - 지진 대피소
```json
{
  "shelter_type": "EarthquakeShelters"
}
```

#### GET - 지진해일 대피소
```url
http://{address}:{port}/shelters?shelter_type=TsunamiShelters
```

#### POST - 지진해일 대피소
```json
{
  "shelter_type": "TsunamiShelters"
}
```

#### GET - 민방위 대피소
```url
http://{address}:{port}/shelters?shelter_type=CivilDefenseShelters
```

#### POST - 민방위 대피소
```json
{
  "shelter_type": "CivilDefenseShelters"
}
```

### 응답 예시
#### 지진 대피소
```JSON
{
  "statusCode": 200,
  "message": "Shelters found.",
  "data": [
    {
      "arcd": "1111000000",
      "acmdfclty_sn": 4,
      "ctprvn_nm": "서울특별시",
      "sgg_nm": "종로구",
      "vt_acmdfclty_nm": "대신고등학교 운동장",
      "rdnmadr_cd": "1111018100101710176019692",
      "bdong_cd": "1111018100",
      "hdong_cd": "1111058000",
      "dtl_adres": "서울특별시 종로구 행촌동 171-1",
      "fclty_ar": 4424,
      "lat": 37.5731,
      "lon": 126.962,
      "mngps_nm": "배준열",
      "mngps_telno": "02-2148-3008",
      "vt_acmd_psbl_nmpr": 5362,
      "acmdfclty_se_nm": "학교운동장",
      "rn_adres": "서울특별시 종로구 사직로 11(행촌동)"
    },
    {
      "arcd": "1111000000",
      "acmdfclty_sn": 11,
      "ctprvn_nm": "서울특별시",
      "sgg_nm": "종로구",
      "vt_acmdfclty_nm": "청운초등학교 운동장",
      "rdnmadr_cd": "1111010100101230000031525",
      "bdong_cd": "1111010100",
      "hdong_cd": "1111051500",
      "dtl_adres": "서울특별시 종로구 청운동 123-0",
      "fclty_ar": 1993,
      "lat": 37.5856,
      "lon": 126.97,
      "mngps_nm": "배준열",
      "mngps_telno": "02-2148-3008",
      "vt_acmd_psbl_nmpr": 2416,
      "acmdfclty_se_nm": "학교운동장",
      "rn_adres": "서울특별시 종로구 자하문로 105(청운동)"
    },
    {
      "arcd": "1111000000",
      "acmdfclty_sn": 12,
      "ctprvn_nm": "서울특별시",
      "sgg_nm": "종로구",
      "vt_acmdfclty_nm": "서울농학교 운동장",
      "rdnmadr_cd": "1111010200100010001031476",
      "bdong_cd": "1111010200",
      "hdong_cd": "1111051500",
      "dtl_adres": "서울특별시 종로구 신교동 1-1",
      "fclty_ar": 4144,
      "lat": 37.5844,
      "lon": 126.969,
      "mngps_nm": "배준열",
      "mngps_telno": "02-2148-3008",
      "vt_acmd_psbl_nmpr": 5023,
      "acmdfclty_se_nm": "학교운동장",
      "rn_adres": "서울특별시 종로구 필운대로 103(신교동)"
    },
    {
      "arcd": "1111000000",
      "acmdfclty_sn": 14,
      "ctprvn_nm": "서울특별시",
      "sgg_nm": "종로구",
      "vt_acmdfclty_nm": "청운중학교 운동장",
      "rdnmadr_cd": "1111010100100890143031481",
      "bdong_cd": "1111010100",
      "hdong_cd": "1111051500",
      "dtl_adres": "서울특별시 종로구 청운동 89-142",
      "fclty_ar": 4133,
      "lat": 37.5888,
      "lon": 126.971,
      "mngps_nm": "배준열",
      "mngps_telno": "02-2148-3008",
      "vt_acmd_psbl_nmpr": 5010,
      "acmdfclty_se_nm": "학교운동장",
      "rn_adres": "서울특별시 종로구 창의문로 51(청운동)"
    },
    {
      "arcd": "1111000000",
      "acmdfclty_sn": 15,
      "ctprvn_nm": "서울특별시",
      "sgg_nm": "종로구",
      "vt_acmdfclty_nm": "경복고등학교 운동장",
      "rdnmadr_cd": "1111010100100890009031463",
      "bdong_cd": "1111010100",
      "hdong_cd": "1111051500",
      "dtl_adres": "서울특별시 종로구 청운동 89-9",
      "fclty_ar": 11577,
      "lat": 37.587,
      "lon": 126.971,
      "mngps_nm": "배준열",
      "mngps_telno": "02-2148-3008",
      "vt_acmd_psbl_nmpr": 14033,
      "acmdfclty_se_nm": "학교운동장",
      "rn_adres": "서울특별시 종로구 자하문로28가길 9(청운동)"
    },
    {
      "arcd": "1111000000",
      "acmdfclty_sn": 16,
      "ctprvn_nm": "서울특별시",
      "sgg_nm": "종로구",
      "vt_acmdfclty_nm": "경기상업고등학교 운동장",
      "rdnmadr_cd": "1111010100100890003031307",
      "bdong_cd": "1111010100",
      "hdong_cd": "1111051500",
      "dtl_adres": "서울특별시 종로구 청운동 89-3",
      "fclty_ar": 10629,
      "lat": 37.5882,
      "lon": 126.97,
      "mngps_nm": "배준열",
      "mngps_telno": "02-2148-3008",
      "vt_acmd_psbl_nmpr": 12884,
      "acmdfclty_se_nm": "학교운동장",
      "rn_adres": "서울특별시 종로구 자하문로 136(청운동)"
    },
    {
      "arcd": "1111000000",
      "acmdfclty_sn": 18,
      "ctprvn_nm": "서울특별시",
      "sgg_nm": "종로구",
      "vt_acmdfclty_nm": "매동초등학교 운동장",
      "rdnmadr_cd": "1111011300100320000028641",
      "bdong_cd": "1111011300",
      "hdong_cd": "1111053000",
      "dtl_adres": "서울특별시 종로구 필운동 32-0",
      "fclty_ar": 2593,
      "lat": 37.5772,
      "lon": 126.967,
      "mngps_nm": "배준열",
      "mngps_telno": "02-2148-3008",
      "vt_acmd_psbl_nmpr": 3143,
      "acmdfclty_se_nm": "학교운동장",
      "rn_adres": "서울특별시 종로구 사직로9길 19(필운동)"
    },
    {
      "arcd": "1111000000",
      "acmdfclty_sn": 19,
      "ctprvn_nm": "서울특별시",
      "sgg_nm": "종로구",
      "vt_acmdfclty_nm": "배화여자고등학교 운동장",
      "rdnmadr_cd": "1111011000101490000030476",
      "bdong_cd": "1111011300",
      "hdong_cd": "1111051500",
      "dtl_adres": "서울특별시 종로구 필운동 12-0",
      "fclty_ar": 2432,
      "lat": 37.5782,
      "lon": 126.968,
      "mngps_nm": "배준열",
      "mngps_telno": "02-2148-3008",
      "vt_acmd_psbl_nmpr": 2947,
      "acmdfclty_se_nm": "학교운동장",
      "rn_adres": "서울특별시 종로구 필운대로1길 34(필운동)"
    },
    {
      "arcd": "1111000000",
      "acmdfclty_sn": 20,
      "ctprvn_nm": "서울특별시",
      "sgg_nm": "종로구",
      "vt_acmdfclty_nm": "사직공원",
      "rdnmadr_cd": "1111011500100010028028702",
      "bdong_cd": "1111011500",
      "hdong_cd": "1111053000",
      "dtl_adres": "서울특별시 종로구 사직동 1-28",
      "fclty_ar": 26523,
      "lat": 37.5757,
      "lon": 126.968,
      "mngps_nm": "배준열",
      "mngps_telno": "02-2148-3008",
      "vt_acmd_psbl_nmpr": 32148,
      "acmdfclty_se_nm": "공원",
      "rn_adres": "서울특별시 종로구 사직로 89(사직동)"
    },
    {
      "arcd": "1111000000",
      "acmdfclty_sn": 21,
      "ctprvn_nm": "서울특별시",
      "sgg_nm": "종로구",
      "vt_acmdfclty_nm": "내수1근린공원",
      "rdnmadr_cd": null,
      "bdong_cd": "1111011800",
      "hdong_cd": "1111053000",
      "dtl_adres": "서울특별시 종로구 내수동 71-2",
      "fclty_ar": 2703,
      "lat": 37.5736,
      "lon": 126.971,
      "mngps_nm": "배준열",
      "mngps_telno": "02-2148-3008",
      "vt_acmd_psbl_nmpr": 3277,
      "acmdfclty_se_nm": "공원",
      "rn_adres": null
    }
  ],
  "RequestTime": "2024-07-02T20:41:08.072379"
}
```

#### 지진해일 대피소
```json
{
  "statusCode": 200,
  "message": "Shelters found.",
  "data": [
    {
      "id": 4,
      "sido_name": "부산광역시",
      "sigungu_name": "기장군",
      "remarks": "공수지구",
      "shel_nm": "공수마을 뒷산(멍두산)",
      "address": "부산광역시 기장군 기장읍 시랑리 689",
      "lat": "35.1841057",
      "lon": "129.2087057",
      "shel_av": 400,
      "lenth": 550,
      "shel_div_type": "공터",
      "seismic": null,
      "height": "20.00",
      "tel": "051-709-5427",
      "new_address": "부산 기장군 기장읍 시랑리 690-3",
      "manage_gov_nm": "기장군청"
    },
    {
      "id": 5,
      "sido_name": "부산광역시",
      "sigungu_name": "기장군",
      "remarks": "공수지구",
      "shel_nm": "당사마을 정자 앞 도로",
      "address": "부산광역시 기장군 기장읍 당사리 507",
      "lat": "35.1860857",
      "lon": "129.2098600",
      "shel_av": 400,
      "lenth": 300,
      "shel_div_type": "도로변",
      "seismic": null,
      "height": "15.00",
      "tel": "051-709-5427",
      "new_address": "부산 기장군 기장읍 당사리 510",
      "manage_gov_nm": "기장군청"
    },
    {
      "id": 6,
      "sido_name": "부산광역시",
      "sigungu_name": "기장군",
      "remarks": "대변지구",
      "shel_nm": "대항교회",
      "address": "부산광역시 기장군 기장읍 대변리 383",
      "lat": "35.2262860",
      "lon": "129.2286640",
      "shel_av": 300,
      "lenth": 350,
      "shel_div_type": "민간건축물",
      "seismic": "미적용",
      "height": "15.00",
      "tel": "051-709-5427",
      "new_address": "부산광역시 기장군 기장읍 대변로 149",
      "manage_gov_nm": "기장군청"
    },
    {
      "id": 7,
      "sido_name": "부산광역시",
      "sigungu_name": "기장군",
      "remarks": "대변지구",
      "shel_nm": "대변항 입구 교차로",
      "address": "부산광역시 기장군 기장읍 대변리 450",
      "lat": "35.2237340",
      "lon": "129.2262900",
      "shel_av": 300,
      "lenth": 75,
      "shel_div_type": "도로변",
      "seismic": null,
      "height": "20.00",
      "tel": "051-709-5427",
      "new_address": "부산 기장군 기장읍 대변리 450",
      "manage_gov_nm": "기장군청"
    },
    {
      "id": 8,
      "sido_name": "부산광역시",
      "sigungu_name": "기장군",
      "remarks": "대변지구",
      "shel_nm": "힐타운 앞 도로",
      "address": "부산광역시 기장군 기장읍 대변리 266-5",
      "lat": "35.2229540",
      "lon": "129.2313060",
      "shel_av": 270,
      "lenth": 60,
      "shel_div_type": "도로변",
      "seismic": null,
      "height": "15.00",
      "tel": "051-709-5427",
      "new_address": "부산 기장군 기장읍 대변리 266-5",
      "manage_gov_nm": "기장군청"
    },
    {
      "id": 9,
      "sido_name": "부산광역시",
      "sigungu_name": "기장군",
      "remarks": "동백지구",
      "shel_nm": "부경대수산과학연구소 앞 야산",
      "address": "부산광역시 기장군 일광면 동백리 251-5",
      "lat": "35.2851790",
      "lon": "129.2566073",
      "shel_av": 650,
      "lenth": 320,
      "shel_div_type": "공터",
      "seismic": null,
      "height": "17.00",
      "tel": "051-709-5427",
      "new_address": "부산 기장군 일광면 동백리 241-3",
      "manage_gov_nm": "기장군청"
    },
    {
      "id": 10,
      "sido_name": "부산광역시",
      "sigungu_name": "기장군",
      "remarks": "동암지구",
      "shel_nm": "국립수산과학원 정문 앞 도로",
      "address": "부산광역시 기장군 기장읍 시랑리 170-14",
      "lat": "35.1946844",
      "lon": "129.2212906",
      "shel_av": 500,
      "lenth": 500,
      "shel_div_type": "도로변",
      "seismic": null,
      "height": "20.00",
      "tel": "051-709-5427",
      "new_address": "부산 기장군 기장읍 시랑리 408-1",
      "manage_gov_nm": "기장군청"
    },
    {
      "id": 11,
      "sido_name": "부산광역시",
      "sigungu_name": "기장군",
      "remarks": "동암지구",
      "shel_nm": "힐튼호텔 앞 도로",
      "address": "부산광역시 기장군 기장읍 시랑리 708",
      "lat": "35.1976062",
      "lon": "129.2251825",
      "shel_av": 200,
      "lenth": 300,
      "shel_div_type": "도로변",
      "seismic": null,
      "height": "15.00",
      "tel": "051-709-5427",
      "new_address": "부산 기장군 기장읍 시랑리 704",
      "manage_gov_nm": "기장군청"
    },
    {
      "id": 12,
      "sido_name": "부산광역시",
      "sigungu_name": "기장군",
      "remarks": "서암-신암지구",
      "shel_nm": "서암마을 뒤 신도로",
      "address": "부산광역시 기장군 기장읍 연화리 507",
      "lat": "35.2154544",
      "lon": "129.2222428",
      "shel_av": 300,
      "lenth": 500,
      "shel_div_type": "도로변",
      "seismic": null,
      "height": "17.00",
      "tel": "051-709-5427",
      "new_address": "부산 기장군 기장읍 연화리 507",
      "manage_gov_nm": "기장군청"
    },
    {
      "id": 13,
      "sido_name": "부산광역시",
      "sigungu_name": "기장군",
      "remarks": "서암-신암지구",
      "shel_nm": "신암마을 뒤 신도로1",
      "address": "부산광역시 기장군 기장읍 연화리 276-3",
      "lat": "35.2166980",
      "lon": "129.2236470",
      "shel_av": 500,
      "lenth": 500,
      "shel_div_type": "도로변",
      "seismic": null,
      "height": "28.00",
      "tel": "051-709-5427",
      "new_address": "부산 기장군 기장읍 연화리 284-32",
      "manage_gov_nm": "기장군청"
    }
  ],
  "RequestTime": "2024-07-02T20:46:24.293917"
}
```

#### 민방위 대피소
```json
{
  "statusCode": 200,
  "message": "Shelters found.",
  "data": [
    {
      "management_number": "3000000-S200700001",
      "designation_date": "2009-12-15",
      "release_date": null,
      "operational_status": "사용중",
      "facility_name": "현대빌딩 본관 지하2층",
      "facility_type": "공공용시설",
      "road_address": "서울특별시 종로구 율곡로 75, 현대빌딩 (계동)",
      "full_address": "서울특별시 종로구 계동 140-2 현대빌딩",
      "postal_code": "30580",
      "location": "지하",
      "facility_area": "5330.16",
      "max_capacity": 6460,
      "last_updated": "2024-01-02T11:52:47",
      "data_update_type": "U",
      "data_update_date": "2024-01-04",
      "lat": "37.57747341738085",
      "lon": "126.98751965704348"
    },
    {
      "management_number": "3000000-S200700004",
      "designation_date": "2009-12-15",
      "release_date": null,
      "operational_status": "사용중",
      "facility_name": "대동세무고등학교 본관 지하1층",
      "facility_type": "공공용시설",
      "road_address": "서울특별시 종로구 계동길 84-10, 대동세무고등학교 (계동)",
      "full_address": "서울특별시 종로구 계동 35 대동세무고등학교",
      "postal_code": "30570",
      "location": "지하",
      "facility_area": "183.36",
      "max_capacity": 222,
      "last_updated": "2024-01-02T11:53:16",
      "data_update_type": "U",
      "data_update_date": "2024-01-04",
      "lat": "37.58105628545779",
      "lon": "126.98748260017110"
    },
    {
      "management_number": "3000000-S200700005",
      "designation_date": "2009-12-15",
      "release_date": null,
      "operational_status": "사용중",
      "facility_name": "서울농학교 청각언어훈련센터 지하1층",
      "facility_type": "공공용시설",
      "road_address": "서울특별시 종로구 필운대로 103, 국립서울농학교 청각언어훈련센터동 지하1층 (신교동)",
      "full_address": "서울특별시 종로구 신교동 1-1 국립서울농학교",
      "postal_code": "30320",
      "location": "지하",
      "facility_area": "198.00",
      "max_capacity": 240,
      "last_updated": "2024-05-22T17:51:59",
      "data_update_type": "U",
      "data_update_date": "2024-05-24",
      "lat": "37.58413718522873",
      "lon": "126.96884140648686"
    },
    {
      "management_number": "3000000-S200700006",
      "designation_date": "2009-12-15",
      "release_date": null,
      "operational_status": "사용중",
      "facility_name": "서울맹학교 초등교육관 지하1층",
      "facility_type": "공공용시설",
      "road_address": "서울특별시 종로구 필운대로 97, 국립서울맹학교 초등교육관동 지하1층 (신교동)",
      "full_address": "서울특별시 종로구 신교동 1-4 국립서울맹학교",
      "postal_code": "30320",
      "location": "지하",
      "facility_area": "312.00",
      "max_capacity": 378,
      "last_updated": "2024-05-22T17:50:56",
      "data_update_type": "U",
      "data_update_date": "2024-05-24",
      "lat": "37.58419964577799",
      "lon": "126.96822659927734"
    },
    {
      "management_number": "3000000-S200700007",
      "designation_date": "2009-12-15",
      "release_date": "2023-06-15",
      "operational_status": "사용중지",
      "facility_name": "청운효자동주민센터 지하1층",
      "facility_type": "공공용시설",
      "road_address": "서울특별시 종로구 자하문로 92, 청운효자동주민센터 지하1층 (궁정동)",
      "full_address": "서울특별시 종로구 궁정동 12-1 청운효자동주민센터",
      "postal_code": "30470",
      "location": "지하",
      "facility_area": "146.61",
      "max_capacity": 177,
      "last_updated": "2023-06-15T09:13:08",
      "data_update_type": "I",
      "data_update_date": "2023-07-28",
      "lat": "37.58404621793672",
      "lon": "126.97061436144106"
    },
    {
      "management_number": "3000000-S200700010",
      "designation_date": "2009-12-15",
      "release_date": null,
      "operational_status": "사용중",
      "facility_name": "유림회관 지하1층",
      "facility_type": "공공용시설",
      "road_address": "서울특별시 종로구 성균관로 31 (명륜3가, 유림회관)",
      "full_address": "서울특별시 종로구 명륜3가 53번지",
      "postal_code": "30630",
      "location": "지하",
      "facility_area": "3159.53",
      "max_capacity": 3829,
      "last_updated": "2023-01-11T09:06:53",
      "data_update_type": "I",
      "data_update_date": "2023-07-28",
      "lat": "37.58555951495042",
      "lon": "126.99684028752560"
    },
    {
      "management_number": "3000000-S200700016",
      "designation_date": "2009-12-15",
      "release_date": "2023-06-15",
      "operational_status": "사용중지",
      "facility_name": "구기터널",
      "facility_type": "공공용시설",
      "road_address": "서울특별시 종로구 진흥로 419, 구기터널관리사무소 (구기동)",
      "full_address": "서울특별시 종로구 구기동 117-41 구기터널관리사무소",
      "postal_code": "30000",
      "location": "지상",
      "facility_area": "1781.00",
      "max_capacity": 2158,
      "last_updated": "2023-06-15T09:10:05",
      "data_update_type": "I",
      "data_update_date": "2023-07-28",
      "lat": "37.60878995094593",
      "lon": "126.95553788094333"
    },
    {
      "management_number": "3000000-S200700020",
      "designation_date": "2009-12-15",
      "release_date": null,
      "operational_status": "사용중",
      "facility_name": "서울대학교병원 융합의학기술원(정림빌딩)지하2층 강당",
      "facility_type": "공공용시설",
      "road_address": "서울특별시 종로구 율곡로 214 (연건동, 정림빌딩)",
      "full_address": "서울특별시 종로구 연건동 187번지 1호",
      "postal_code": "31220",
      "location": "지하",
      "facility_area": "405.00",
      "max_capacity": 490,
      "last_updated": "2024-04-26T13:07:32",
      "data_update_type": "U",
      "data_update_date": "2024-04-28",
      "lat": "37.57594076238934",
      "lon": "127.00263963295400"
    },
    {
      "management_number": "3000000-S200700024",
      "designation_date": "2009-12-15",
      "release_date": "2023-06-15",
      "operational_status": "사용중지",
      "facility_name": "창신2동주민센터 지하1층",
      "facility_type": "공공용시설",
      "road_address": "서울특별시 종로구 창신길 62 (창신동, 창신제2동주민센터)",
      "full_address": "서울특별시 종로구 창신동 583번지 3호",
      "postal_code": "31020",
      "location": "지하",
      "facility_area": "255.00",
      "max_capacity": 309,
      "last_updated": "2023-06-15T09:13:30",
      "data_update_type": "I",
      "data_update_date": "2023-07-28",
      "lat": "37.57440128293274",
      "lon": "127.01078907130506"
    },
    {
      "management_number": "3000000-S200700025",
      "designation_date": "2009-12-15",
      "release_date": null,
      "operational_status": "사용중",
      "facility_name": "창신2동 동대문맨션 지하1층",
      "facility_type": "공공용시설",
      "road_address": "서울특별시 종로구 창신길 20 (창신동, 동대문맨션)",
      "full_address": "서울특별시 종로구 창신동 578번지 5호",
      "postal_code": "31060",
      "location": "지하",
      "facility_area": "209.00",
      "max_capacity": 253,
      "last_updated": "2024-01-24T14:12:55",
      "data_update_type": "U",
      "data_update_date": "2024-01-26",
      "lat": "37.57247163953407",
      "lon": "127.01077666363857"
    }
  ],
  "RequestTime": "2024-07-02T20:46:50.198319"
}
```

### 오류
#### 오류 예시 - 데이터베이스 연결 실패
```json
{
  "statusCode": 500,
  "message": "Database connection failed",
  "RequestTime": "2024-07-02T12:02:02.373141"
}
```