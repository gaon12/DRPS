# Disaster Message Search
The `/disaster_msg` route performs the function of searching for disaster messages.

## Request
| HTTP |
|--|
| `GET` / `POST` http://{address}:{port}/disaster_msg |

### Request Body
| Field Name | Required | Type | Description |
|--|--|--|--|
| `md101_sn` | `N` | `Int` | Unique disaster message number |
| `location_id` | `N` | `Int` | Unique number of the disaster message broadcast area |
| `location_name` | `N` | `String` | Name of the disaster message broadcast area |

* At least one of `md101_sn`, `location_id`, `location_name` must be provided.
* If multiple parameters are sent, `md101_sn` has the highest priority[^id1].
* For `location_name`, for example, if you search for `Seoul`, results will include `Gangnam-gu, Seoul`. Conversely, searching for `Gangnam-gu, Seoul` will not include `Seoul` in the results[^id2].

### Response
#### Response Body
| Field Name | Data Type | Description |
|--|--|--|
| `StatusCode` | `Int` | Status code |
| `message` | `String` | Response message |
| `data` | `Array` | Array containing disaster messages |
| `data > create_date` | `String` | Date of disaster message broadcast |
| `data > location_id` | `String` | Unique number of the disaster message broadcast area |
| `data > location_name` | `String` | Name of the disaster message broadcast area |
| `data > md101_sn` | `Int` | Unique disaster message number |
| `data > msg` | `String` | Content of the disaster message |
| `data > send_platform` | `String` | Method of broadcasting the disaster message |
| `data > category` | `String` | Category of the disaster message |
| `RequestTime` | `String` | Request time |

* Both `GET` and `POST` request results are identical.
* The `data > category` field will be automatically classified by AI in the future. If not classified, it will return `na`.
* When requesting by `location_id` or `location_name`, a maximum of 10 results will be returned.

### Request Examples
#### Search by Unique Disaster Message Number
##### GET Request
```url
http://{address}:{port}/disaster_msg?md101_sn=212388
```

##### POST Request
```json
{
  "md101_sn": 212388
}
```

#### Search by Unique Disaster Message Broadcast Area Number
##### GET Request
```url
http://{address}:{port}/disaster_msg?location_id=91
```

##### POST Request
```json
{
  "location_id": 91
}
```

#### Search by Disaster Message Broadcast Area Name
##### GET Request
```url
http://{address}:{port}/disaster_msg?location_name=Jeju
```

##### POST Request
```json
{
  "location_name": "Jeju"
}
```

### Response Examples
##### Search by Unique Disaster Message Number
```json
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

##### Search by Unique Disaster Message Broadcast Area Number
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

##### Search by Disaster Message Broadcast Area Name
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

### Errors
#### Error Example - Missing or Incorrect Parameters
```json
{
  "statusCode": 400,
  "message": "Invalid request parameters.",
  "RequestTime": "2024-06-22T03:33:45.570Z"
}
```

#### Error Example - No Results for md101_sn Search
```json
{
  "statusCode": 404,
  "message": "Disaster message not found.",
  "RequestTime": "2024-06-22T03:35:01.655Z"
}
```

#### Error Example - No Results for location_id Search
```json
{
  "statusCode": 404,
  "message": "No disaster messages found for the specified location_id.",
  "RequestTime": "2024-06-22T03:46:37.746Z"
}
```

#### Error Example - No Results for location_name Search
```json
{
  "statusCode": 404,
  "message": "No disaster messages found for the specified location_name.",
  "RequestTime": "2024-06-22T03:39:00.732Z"
}
```

# Footnotes
[^id1]: Because `md101_sn` is a unique value.
[^id2]:
    This corresponds to a **'containment relationship'**.

    For example:<br>
      1. When searching for "Seoul", results include "Gangnam-gu, Seoul" because "Gangnam-gu, Seoul" is a subset of "Seoul".<br>
      2. Conversely, when searching for "Gangnam-gu, Seoul", "Seoul" is not included in the results because "Seoul" is not a subset of "Gangnam-gu, Seoul".
