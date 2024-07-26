# 미세먼지 정보
`/air/quality` 경로는 에어코리아로부터 얻은 미세먼지 정보를 출력합니다.

## 요청
|HTTP|
|--|
| `GET` / `POST` http://{address}:{port}/air/quality |

### 요청 바디
|필드명|필수 여부|타입|설명|
|--|--|--|--|
| `stationname` | `N` | `String` | 측정소명 |
| `stationcode` | `N` | `String` | 측정소 고유 코드 |
| `lat` | `N` | `Float` | 위도값 |
| `lon` | `N` | `Float` | 경도값 |
| `distance` | `N` | `Int` | 범위, 단위는 km |

* `stationname`과 `stationcode`, (`lat`, `lon`, `distance`) 중 하나는 반드시 있어야 합니다.
* `distance`는 1~10 사이어야 하며, 범위를 벗어난 경우, 5로 간주합니다.

### 응답
#### 응답 바디
|필드 이름|데이터 타입|설명|
|--|--|--|
|`StatusCode`|`Int`|상태 코드|
|`message`|`String`|응답 메시지|
| `data`  | `Object`    | 미세먼지 정보가 담긴 객체 |
| `data > stationName` | 측정소명 |
| `data > stationCode` | 측정소 고유 코드 |
| `data > mangName` | 측정망 정보 |
| `data > sidoName` | 시도명 |
| `data > dataTime` | 측정일시 |
| `data > so2Value` | 아황산가스 농도 |
| `data > coValue` | 일산화탄소 농도 |
| `data > o3Value` | 오존 농도 |
| `data > no2Value` | 이산화질소 농도 |
| `data > pm10Value` | 미세먼지(PM10) 농도 |
| `data > pm10Value24` | 미세먼지(PM10) 24시간 예측 이동 농도 |
| `data > pm25Value` | 미세먼지(PM2.5) 농도 |
| `data > pm25Value24` | 미세먼지(PM2.5) 24시간 예측 이동 농도 |
| `data > khaiValue` | 통합대기환경수치 |
| `data > khaiGrade` | 통합대기환경지수 |
| `data > so2Grade` | 아황산가스 지수 |
| `data > coGrade` | 일산화탄소 지수 |
| `data > o3Grade` | 오존 지수 |
| `data > no2Grade` | 이산화질소 지수 |
| `data > pm10Grade` | 미세먼지(PM10) 24시간 등급자료 |
| `data > pm25Grade` | 미세먼지(PM2.5) 24시간 등급자료 |
| `data > pm10Grade1h` | 미세먼지(PM10) 1시간 등급자료 |
| `data > pm25Grade1h` | 미세먼지(PM2.5) 1시간 등급자료 |
| `data > so2Flag` | 아황산가스 플래그 |
| `data > coFlag` | 일산화탄소 플래그 |
| `data > o3Flag` | 오존 플래그 |
| `data > no2Flag` | 이산화질소 플래그 |
| `data > pm10Flag` | 미세먼지(PM10) 플래그 |
| `data > pm25Flag` | 미세먼지(PM2.5) 플래그 |
| `data > api_update_date` | API로부터 가져온 날짜 및 시간 |
| `data > distance` | 좌표 및 범위로 검색 시, 해당 좌표로부터 떨어진 거리 |
| `notice` | 라이선스 및 알림 |

* 더 자세한 정보는 [공공데이터포털 한국환경공단_에어코리아_대기오염정보](https://www.data.go.kr/data/15073861/openapi.do) 페이지를 확인하세요!
* `format` 파라미터를 제외한 어떠한 파라미터값을 붙히더라도, 출력에는 영향이 없습니다.
* `GET` 요청 결과와 `POST` 요청 결과 모두 동일합니다.

### 요청 예시
#### GET 요청 - 측정소명 지정
```url
http://{address}:{port}/air/quality?stationname=문창동
```

#### POST 요청 - 측정소명 지정
```json
{
  "stationname": "문창동"
}
```

#### GET 요청 - 측정소 고유 코드 지정
```url
http://{address}:{port}/air/quality?stationcode=525121
```

#### POST 요청 - 측정소 고유 코드 지정
```json
{
  "stationcode": 525121
}
```

#### 응답 예시 - 측정소 고유 코드 지정
```JSON
{
  "statusCode": 200,
  "message": "Data found.",
  "data": [
    {
      "stationName": "문창동",
      "stationCode": "525121",
      "mangName": "도시대기",
      "sidoName": "대전",
      "dataTime": "2024-07-25T16:00:00",
      "so2Value": "0.002600",
      "coValue": "0.2600",
      "o3Value": "0.02600",
      "no2Value": "0.00650",
      "pm10Value": 19,
      "pm10Value24": 12,
      "pm25Value": 6,
      "pm25Value24": 4,
      "khaiValue": 43,
      "khaiGrade": 1,
      "so2Grade": 1,
      "coGrade": 1,
      "o3Grade": 1,
      "no2Grade": 1,
      "pm10Grade": 1,
      "pm25Grade": 1,
      "pm10Grade1h": 1,
      "pm25Grade1h": 1,
      "so2Flag": null,
      "coFlag": null,
      "o3Flag": null,
      "no2Flag": null,
      "pm10Flag": null,
      "pm25Flag": null,
      "api_update_date": "2024-07-25T16:38:38"
    }
  ],
  "notice": "라이선스: 공공누리 제 2유형(https://www.data.go.kr/data/15073861/openapi.do) / 데이터 오류가능성 존재"
}
```

#### GET 요청 - 위경도 및 범위(km) 지정
```url
http://{address}:{port}/air/quality?lat=35.9630420&lon=129.376848&distance=1
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
  "message": "Data found.",
  "data": [
    {
      "stationName": "3공단",
      "stationCode": "437116",
      "mangName": "도시대기",
      "sidoName": "경북",
      "dataTime": "2024-07-25T16:00:00",
      "so2Value": "0.003100",
      "coValue": "0.2900",
      "o3Value": "0.04180",
      "no2Value": "0.02010",
      "pm10Value": 18,
      "pm10Value24": 22,
      "pm25Value": 12,
      "pm25Value24": 10,
      "khaiValue": 61,
      "khaiGrade": 2,
      "so2Grade": 1,
      "coGrade": 1,
      "o3Grade": 2,
      "no2Grade": 1,
      "pm10Grade": 1,
      "pm25Grade": 1,
      "pm10Grade1h": 1,
      "pm25Grade1h": 1,
      "so2Flag": null,
      "coFlag": null,
      "o3Flag": null,
      "no2Flag": null,
      "pm10Flag": null,
      "pm25Flag": null,
      "api_update_date": "2024-07-25T16:38:38",
      "distance": 0
    }
  ],
  "notice": "라이선스: 공공누리 제 2유형(https://www.data.go.kr/data/15073861/openapi.do) / 데이터 오류가능성 존재"
}
```

### 오류
#### 파라미터 없음
```json
{
  "statusCode": 400,
  "message": "Require parameter 'stationname' or 'stationcode' or '(lat, lon, distance)'"
}
```

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