# 재난문자 검색
`/disaster_msg` 경로는 재난문자를 검색하는 기능을 수행하는 라우트 경로입니다.

## 요청
|HTTP|
|--|
| `GET` / `POST` http://{address}:{port}/disaster_msg|

### 요청 바디
|필드명|필수 여부|타입|설명|
|--|--|--|--|
| `md101_sn` | `N` | `Int` | 재난문자 고유번호 |
| `location_id` | `N` | `Int` | 재난문자 송출 지역 고유번호 |
| `location_name` | `N` | `String` | 재난문자 송출 지역 이름 |
| `category` | `N` | `String` | 재난문자 카테고리 |
| `all_msg` | `N` | `String` | 모든 재난문자 출력 여부 |
| `pageno` | `N` | `String` | 페이지 번호 |

* 단 `md101_sn`, `location_id`, `location_name`, `category`, `all_msg` 중 하나만 반드시 입력해야 합니다.
* 여러개의 파라미터를 같이 보낸다면, `all_msg`가 가장 높은 우선순위[^id1]를 갖고, `md101_sn`이 그 다음 우선순위[^id2]를 갖습니다.
* `location_name`의 경우, 예를 들어 `서울특별시`로 검색 시, `서울특별시 강남구` 결과가 포함되며, 반대로 `서울특별시 강남구`로 검색 시, `서울특별시`는 결과에 포함되지 않습니다[^id3].
* `pageno`을 생략한 경우, `1`로 간주합니다.

### 응답
#### 응답 바디
|필드 이름|데이터 타입|설명|
|--|--|--|
|`StatusCode`|`Int`|상태 코드|
|`message`|`String`|응답 메시지|
|`data`|`Array`|재난문자가 담긴 배열|
|`data > create_date`|`String`|재난문자 송출 날짜|
|`data > location_id`|`String`|재난문자 송출 지역 고유번호|
|`data > location_name`|`String`|재난문자 송출 지역 이름|
|`data > md101_sn`|`Int`|재난문자 고유번호|
|`data > msg`|`String`|재난문자 내용|
|`data > send_platform`|`String`|재난문자 송출 방법|
|`data > category`|`String`|재난문자 카테고리|
|`RequestTime`|`String`|요청 시간|

* `GET` 요청 결과와 `POST` 요청 결과 모두 동일합니다.
* `data > category`은 차후 인공지능으로 자동 분류될 예정입니다. 분류되지 않은 경우, `na`라고 반환합니다.
* `location_id`이나 `location_name` 방식으로 요청을 보낸 경우, 최대 10개만 반환합니다.

### 요청 예시
#### 재난문자 고유번호로 검색
##### GET 요청
```url
http://{address}:{port}/disaster_msg?md101_sn=212388
```

##### POST 요청
```json
{
  "md101_sn": 212388
}
```

#### 재난문자 송출 지역 고유번호로 검색
##### GET 요청
```url
http://{address}:{port}/disaster_msg?location_id=91
```

##### POST 요청
```json
{
  "location_id": 91
}
```

#### 재난문자 송출 지역 이름으로 검색
##### GET 요청
```url
http://{address}:{port}/disaster_msg?location_name=제주
```

##### POST 요청
```json
{
  "location_name": "제주"
}
```

#### 재난문자 카테고리로 검색
##### GET 요청
```url
http://{address}:{port}/disaster_msg?category=호우
```

##### POST 요청
```json
{
  "category": "호우"
}
```

#### 재난문자 모든 메시지 반환
##### GET 요청
```url
http://{address}:{port}/disaster_msg?all_msg=true
```

##### POST 요청
```json
{
  "all_msg": "true"
}
```

#### 재난문자 모든 메시지 반환, 2번째 페이지 출력
##### GET 요청
```url
http://{address}:{port}/disaster_msg?all_msg=true&pageno=2
```

##### POST 요청
```json
{
  "all_msg": "true",
  "pageno": 2
}
```

### 응답 예시
##### 재난문자 고유번호로 검색
```JSON
{
  "statusCode": 200,
  "message": "Disaster message found.",
  "data": {
    "create_date": "2024-06-12T04:59:55.000Z",
    "location_id": "98,113,179,202,222,6474",
    "location_name": "광주광역시 전체,대전광역시 전체,전라남도 전체,전북특별자치도 전체,충청남도 전체,세종특별자치시",
    "md101_sn": "212388",
    "msg": "2024-06-12 13:55 전북 부안군 남쪽 4km 지역 M3.1 지진발생/추가 지진 발생상황에 유의 바람 Earthquake[기상청]",
    "send_platform": "cbs_kma",
    "category": "na"
  },
  "RequestTime": "2024-06-22T03:23:20.970Z"
}
```

##### 재난문자 송출 지역 고유번호로 검색
```JSON
{
  "statusCode": 200,
  "message": "Disaster messages found.",
  "data": [
    {
      "create_date": "2024-05-15T21:01:51.000Z",
      "location_id": "91",
      "location_name": "경상북도 울릉군",
      "md101_sn": "211824",
      "msg": "오늘 08:00 강풍경보 발령.야외 활동을 자제하시고, 날아가기 쉬운 입간판 등은 단단히 고정해 주세요.물건이 떨어져서 다치지 않도록 유의하세요.[행정안전부]",
      "send_platform": "cbs",
      "category": "na"
    },
    {
      "create_date": "2024-05-11T08:56:22.000Z",
      "location_id": "91",
      "location_name": "경상북도 울릉군",
      "md101_sn": "211723",
      "msg": "오늘 18:00 강풍경보 발령.야외 활동을 자제하시고, 날아가기 쉬운 입간판 등은 단단히 고정해 주세요.물건이 떨어져서 다치지 않도록 유의하세요.[행정안전부]",
      "send_platform": "cbs",
      "category": "na"
    }
  ],
  "RequestTime": "2024-06-22T03:31:19.139Z"
}
```

##### 재난문자 송출 지역 이름으로 검색
```JSON
{
  "statusCode": 200,
  "message": "Disaster messages found.",
  "data": [
    {
      "create_date": "2024-06-21T10:10:12.000Z",
      "location_id": "217",
      "location_name": "제주특별자치도 전체",
      "md101_sn": "212718",
      "msg": "내일(22일) 새벽부터 제주도에 강한 바람과 많은 비가 예상되오니, 해안가, 새월교, 낙석 위험지역 등에는 출입하지 마시고, 안전에 주의 바랍니다.[제주도]",
      "send_platform": "cbs",
      "category": "na"
    },
    {
      "create_date": "2024-06-21T08:01:45.000Z",
      "location_id": "217",
      "location_name": "제주특별자치도 전체",
      "md101_sn": "212711",
      "msg": "내일(22일) 새벽부터 모레(23일)까지 제주도에 장마전선에 의한 집중호우가 예상되오니 도민께서는 지지대 침수 등 안전에 대비 바랍니다 [제주도]",
      "send_platform": "cbs",
      "category": "na"
    },
    {
      "create_date": "2024-06-20T06:53:18.000Z",
      "location_id": "10449",
      "location_name": "제주특별자치도 서귀포시",
      "md101_sn": "212689",
      "msg": "오늘 대정읍 최남단해안로(상모리 1670-3, 하모리 52-3) 일부 침수로 인한 도로 부분통제 중이오니, 인근 차량들은 우회하여 주시기 바랍니다. [서귀포시]",
      "send_platform": "cbs",
      "category": "na"
    },
    {
      "create_date": "2024-06-20T05:33:44.000Z",
      "location_id": "217",
      "location_name": "제주특별자치도 전체",
      "md101_sn": "212687",
      "msg": "금일(20일) 14:30 추자도를 제외한 전지역에 호우경보가 발효되었으니 도민여러분께서는 저지대, 침수 등 안전에 유의 바랍니다.[제주도]",
      "send_platform": "cbs",
      "category": "na"
    },
    {
      "create_date": "2024-06-20T05:32:33.000Z",
      "location_id": "221",
      "location_name": "제주특별자치도 제주시",
      "md101_sn": "212686",
      "msg": "오늘 14:30 호우경보. 하천 주변, 계곡, 급경사지, 농수로 등 위험 지역에는 가지 마시고, 대피 권고를 받으면 즉시 대피하세요. [행정안전부]",
      "send_platform": "cbs",
      "category": "na"
    },
    {
      "create_date": "2024-06-20T05:00:56.000Z",
      "location_id": "221",
      "location_name": "제주특별자치도 제주시",
      "md101_sn": "212684",
      "msg": "오늘 14:00 호우경보. 하천 주변, 계곡, 급경사지, 농수로 등 위험 지역에는 가지 마시고, 대피 권고를 받으면 즉시 대피하세요. [행정안전부]",
      "send_platform": "cbs",
      "category": "na"
    },
    {
      "create_date": "2024-06-20T04:35:30.000Z",
      "location_id": "217",
      "location_name": "제주특별자치도 전체",
      "md101_sn": "212676",
      "msg": "금일(20일) 13:30 제주도북부,추자도,북부중산간을 제외한 지역에 호우경보가 발효되었으니 도민여러분께서는 저지대, 침수 등 안전에 유의 바랍니다.[제주도]",
      "send_platform": "cbs",
      "category": "na"
    },
    {
      "create_date": "2024-06-20T04:35:00.000Z",
      "location_id": "217",
      "location_name": "제주특별자치도 전체",
      "md101_sn": "212675",
      "msg": "오늘 13:30 호우경보. 하천 주변, 계곡, 급경사지, 농수로 등 위험 지역에는 가지 마시고, 대피 권고를 받으면 즉시 대피하세요. [행정안전부]",
      "send_platform": "cbs",
      "category": "na"
    },
    {
      "create_date": "2024-06-20T03:49:10.000Z",
      "location_id": "217",
      "location_name": "제주특별자치도 전체",
      "md101_sn": "212671",
      "msg": "금일(20일) 12:20 제주도 서부,남부 및 남부중산간 지역 호우경보가 발효되었으니 도민여러분께서는 저지대, 침수 등 안전에 유의 바랍니다. [제주도]",
      "send_platform": "cbs",
      "category": "na"
    },
    {
      "create_date": "2024-06-20T03:25:57.000Z",
      "location_id": "217",
      "location_name": "제주특별자치도 전체",
      "md101_sn": "212668",
      "msg": "오늘 12:20 호우경보. 하천 주변, 계곡, 급경사지, 농수로 등 위험 지역에는 가지 마시고, 대피 권고를 받으면 즉시 대피하세요. [행정안전부]",
      "send_platform": "cbs",
      "category": "na"
    }
  ],
  "RequestTime": "2024-06-22T03:25:28.170Z"
}
```

### 오류
#### 오류 예시 - 파라미터 미제공 또는 올바르지 않은 파라미터 제공
```json
{
  "statusCode": 400,
  "message": "Invalid request parameters.",
  "RequestTime": "2024-06-22T03:33:45.570Z"
}
```

#### 오류 예시 - md101_sn 검색 결과 없음
```json
{
  "statusCode": 404,
  "message": "Disaster message not found.",
  "RequestTime": "2024-06-22T03:35:01.655Z"
}
```

#### 오류 예시 - location_id 검색 결과 없음
```json
{
  "statusCode": 404,
  "message": "No disaster messages found for the specified location_id.",
  "RequestTime": "2024-06-22T03:46:37.746Z"
}
```

#### 오류 예시 - location_name 검색 결과 없음
```json
{
  "statusCode": 404,
  "message": "No disaster messages found for the specified location_name.",
  "RequestTime": "2024-06-22T03:39:00.732Z"
}
```

#### 오류 예시 - 데이터베이스 연결 실패
```json
{
  "statusCode": 500,
  "message": "Database connection failed",
  "RequestTime": "2024-07-01T19:27:13.715361"
}
```


# 각주
[^id1]: `all_msg`는 모든 재난문자를 요청하는 기능이기 때문. 논리적인 이유로 `all_msg`가 가장 높은 우선순위를 갖습니다.
[^id2]: `md101_sn`은 고유값이기 때문.
[^id2]:
    즉, **'포함 관계'**에 해당합니다.

    예를 들어:<br>
      1. "서울특별시"로 검색 시, "서울특별시 강남구"가 결과에 포함되는 것은 "서울특별시 강남구"가 "서울특별시"의 부분집합이기 때문입니다.<br>
      2. 반면 "서울특별시 강남구"로 검색 시, "서울특별시"는 결과에 포함되지 않는 것은 "서울특별시"가 "서울특별시 강남구"의 부분집합이 아니기 때문입니다.