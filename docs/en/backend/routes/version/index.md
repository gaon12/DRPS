# Version Check
The `/version` route is used to check the version of the service.

## Request
| HTTP |
|--|
| `GET` / `POST` http://{address}:{port}/version |

### Request Body
| Field Name | Required | Type | Description |
|--|--|--|--|
| `None` | `None` | `None` | `None` |

### Response
#### Response Body
| Field Name | Data Type | Description |
|--|--|--|
| `StatusCode` | `Int` | Status code |
| `message` | `String` | Response message |
| `data` | `Object` | Object containing version information |
| `data > version` | `String` | Version information |
| `RequestTime` | `String` | Request time |

* Adding any parameter values, except for the `format` parameter, does not affect the output.
* Both `GET` and `POST` request results are identical.

### Request Example
```url
http://{address}:{port}/version
```

### Response Example
```json
{
  "StatusCode": 200,
  "message": "Success to get Version!",
  "data": {
    "version": "0.0.1-alpha"
  },
  "RequestTime": "2024-06-22T11:04:42.845Z"
}
```

### Errors
Any errors returned by this route are server-side issues, as they are not due to client-side problems.

#### Error Example - Version File Missing
```json
{
  "StatusCode": 5000,
  "message": "Version file does not exist",
  "RequestTime": "2024-06-22T11:08:48.157Z"
}
```

#### Error Example - Version File Empty
```json
{
  "StatusCode": 5001,
  "message": "Version file is empty",
  "RequestTime": "2024-06-22T11:09:00.599Z"
}
```