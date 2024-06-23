# Server Connection Check
The `/ping` route is used to check the server connection. Before accessing the service, the connection status can be verified by sending a request to this route, or it can be used to check the [server uptime](../../../uptime/index.md).

## Request
| HTTP |
|--|
| `GET` / `POST` http://{address}:{port}/ping |

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
| `RequestTime` | `String` | Request time |

* Adding any parameter values, except for the `format` parameter, does not affect the output.
* Both `GET` and `POST` request results are identical.

### Request Example
```url
http://{address}:{port}/ping
```

### Response Example
```json
{
  "StatusCode": 200,
  "message": "Pong!",
  "RequestTime": "2024-06-22T02:54:31.373Z"
}
```

### Errors
There are no specific error messages.