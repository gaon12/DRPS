# Server Connection Check
The `/ai/detect_malcomment_v1` path is a route for checking if there are malicious (hateful) expressions contained in the text. Since it is `v1`, the performance is lower, but the judgment is fast.

## Request
| HTTP                                                           |
| -------------------------------------------------------------- |
| `GET` / `POST` http://{address}:{port}/ai/detect_malcomment_v1 |

### Request Body
| Field Name | Required | Type     | Description                       |
| ---------- | -------- | -------- | --------------------------------- |
| `text`     | `N`      | `String` | Text to be checked for maliciousness |

### Response
#### Response Body
| Field Name              | Data Type | Description                      |
| ----------------------- | --------- | -------------------------------- |
| `StatusCode`            | `Int`     | Status code                      |
| `message`               | `String`  | Response message                 |
| `data`                  | `Object`  | Object containing the result of the maliciousness check |
| `data > is_malcomment`  | `String`  | Result of the maliciousness check |
| `RequestTime`           | `String`  | Request time                     |

* Any parameter values other than the `format` parameter do not affect the output.
* Both `GET` and `POST` request results are the same.

### Request Example
#### GET Request
```url
http://{address}:{port}/ai/detect_malcomment_v1?text=Hello
```

#### POST Request
```json
{
  "text": "Hello"
}
```

### Response Example
```JSON
{
  "StatusCode": 200,
  "message": "Success to detect is malcomment",
  "data": {
    "is_malcomment": "False"
  },
  "RequestTime": "2024-06-23T10:57:03.379381"
}
```

### Errors
#### Error Example - Detection Failure
```json
{
  "StatusCode": 5007,
  "message": "Cannot detect malcomment"
}
```

#### Error Example - Missing Required Parameter (text)
```json
{
  "StatusCode": 4001,
  "message": "Cannot find required parameter(s): text"
}
```