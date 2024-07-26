# 미세먼지 측정소 정보
`/air/station` 경로는 에어코리아가 미세먼지 수집을 목적으로 설치한 미세먼지 측정소의 정보를 출력합니다.

## 요청
|HTTP|
|--|
| `GET` / `POST` http://{address}:{port}/air/station |

### 요청 바디
|필드명|필수 여부|타입|설명|
|--|--|--|--|
| `address` | `N` | `String` | 측정소 주소 |
| `measurenet` | `N` | `String` | 측정망 이름 |
| `measurelist` | `N` | `String` | 측정 항목 리스트 |
| `lat` | `N` | `Float` | 위도값 |
| `lon` | `N` | `Float` | 경도값 |
| `distance` | `N` | `Int` | 범위, 단위는 km |
| `pageno` | `N` | `Int` | 페이지 번호(기본값 1) |

* `address`와 `measurenet`, `measurelist`, (`lat`, `lon`, `distance`) 중 하나는 사용하는 것을 권장합니다. 없는 경우 모든 검색 결과를 반환합니다.
* `distance`는 1~10 사이어야 하며, 범위를 벗어난 경우, 5로 간주합니다.

### 응답
#### 응답 바디
|필드 이름|데이터 타입|설명|
|--|--|--|
|`StatusCode`|`Int`|상태 코드|
|`message`|`String`|응답 메시지|
| `data`  | `Object`    | 미세먼지 측정소 정보가 담긴 객체 |
| `data > stationName` | 측정소명 |
| `data > addr` | 측정소 주소 |
| `data > dmX` | 측정소 위도 |
| `data > dmY` | 측정소 경도 |
| `data > mangName` | 측정망 |
| `data > item` | 측정 항목 |
| `data > year` | 설치 연도 |
| `data > api_update_date` | API로부터 가져온 날짜 및 시간 |
| `data > distance` | 좌표 및 범위로 검색 시, 해당 좌표로부터 떨어진 거리 |
| `notice` | 라이선스 및 알림 |

* 더 자세한 정보는 [공공데이터포털 한국환경공단_에어코리아_대기오염정보](https://www.data.go.kr/data/15073877/openapi.do) 페이지를 확인하세요!
* `address`의 경우, 정확한 주소 대신 `서울`과 같이 일부만 입력해도 검색됩니다.
* `measurelist`의 경우, 여러개를 측정하는 경우, 하나만 입력해도 검색됩니다. 대소문자 구분하지 않습니다. 예: `SO2`
* `format` 파라미터를 제외한 어떠한 파라미터값을 붙히더라도, 출력에는 영향이 없습니다.
* `GET` 요청 결과와 `POST` 요청 결과 모두 동일합니다.

### 요청 예시
#### GET 요청 - 측정소 주소 검색
```url
http://{address}:{port}/air/station?address=서울
```

#### POST 요청 - 측정소 주소 검색
```json
{
  "address": "서울"
}
```

#### GET 요청 - 측정망 검색
```url
http://{address}:{port}/air/station?measurenet=도시대기
```

#### POST 요청 - 측정망 검색
```json
{
  "measurenet": "도시대기"
}
```

#### GET 요청 - 측정 항목 검색
```url
http://{address}:{port}/air/station?measurelist=SO2
```

#### POST 요청 - 측정 항목 검색
```json
{
  "measurelist": "SO2"
}
```

#### 응답 예시 - 좌표 검색을 제외한 나머지 방식
```JSON
{
  "statusCode": 200,
  "message": "Stations found.",
  "data": [
    {
      "stationName": "3공단",
      "addr": "경북 포항시 남구 대송면 철강산단로130번길 29 3공단 배수지",
      "dmX": "35.9630420",
      "dmY": "129.3768480",
      "mangName": "도시대기",
      "item": "SO2, CO, O3, NO2, PM10, PM2.5",
      "year": 2010,
      "api_update_date": "2024-07-18T13:40:44"
    },
    {
      "stationName": "4공단",
      "addr": "경북 구미시 산동읍 첨단기업1로 17 구미전자정보기술원 혁신관 옥상",
      "dmX": "36.1416410",
      "dmY": "128.4386850",
      "mangName": "도시대기",
      "item": "SO2, CO, O3, NO2, PM10, PM2.5",
      "year": 2010,
      "api_update_date": "2024-07-18T13:40:44"
    },
    {
      "stationName": "가거도",
      "addr": "전남 신안군 흑산면 가거도리 산 4 가거도 등대부지 내",
      "dmX": "34.0766770",
      "dmY": "125.0922760",
      "mangName": "국가배경농도",
      "item": "SO2, CO, O3, NO2, PM10, PM2.5",
      "year": 2020,
      "api_update_date": "2024-07-18T13:40:45"
    },
    {
      "stationName": "가남읍",
      "addr": "경기도 여주시 가남읍 태평중앙1길 20 가남읍행정복지센터 옥상",
      "dmX": "37.2017390",
      "dmY": "127.5451350",
      "mangName": "도시대기",
      "item": "SO2, CO, O3, NO2, PM10, PM2.5",
      "year": 2020,
      "api_update_date": "2024-07-18T13:40:44"
    },
    {
      "stationName": "가덕면",
      "addr": "충북 청주시 상당구 가덕면 보청대로 4650 가덕면사무소 앞쪽 부지",
      "dmX": "36.5503440",
      "dmY": "127.5503330",
      "mangName": "도시대기",
      "item": "SO2, CO, O3, NO2, PM10, PM2.5",
      "year": 2020,
      "api_update_date": "2024-07-18T13:40:44"
    }
  ],
  "notice": "라이선스: 공공누리 제 2유형(https://www.data.go.kr/data/15073877/openapi.do) / 데이터 오류가능성 존재"
}
```

#### GET 요청 - 위경도 및 범위(km) 지정
```url
http://{address}:{port}/air/station?lat=35.9630420&lon=129.376848&distance=1
```

#### POST 요청 - 위경도 및 범위(km) 지정
```json
{
  "lat": 35.9630420,
  "lon": 129.376848,
  "distance": 1
}
```

#### 응답 예시 - 위경도 및 범위(km) 지정
```JSON
{
  "statusCode": 200,
  "message": "Stations found.",
  "data": [
    {
      "stationName": "3공단",
      "addr": "경북 포항시 남구 대송면 철강산단로130번길 29 3공단 배수지",
      "dmX": "35.9630420",
      "dmY": "129.3768480",
      "mangName": "도시대기",
      "item": "SO2, CO, O3, NO2, PM10, PM2.5",
      "year": 2010,
      "api_update_date": "2024-07-18T13:40:44",
      "distance": 0
    }
  ],
  "notice": "라이선스: 공공누리 제 2유형(https://www.data.go.kr/data/15073877/openapi.do) / 데이터 오류가능성 존재"
}
```

### 오류
#### 검색 결과 없음
```json
{
  "statusCode": 404,
  "message": "No data found."
}
```

#### 데이터베이스 연결 실패
```json
{
  "statusCode": 500,
  "message": "Database connection failed"
}
```