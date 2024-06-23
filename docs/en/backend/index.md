# Languages and Frameworks Used
The backend utilizes different languages and frameworks for each feature.

* Main functionality: Node.js Express
* AI functionality: Python FastAPI
* OpenAPI data DB storage: PHP

# Value Return
## Basic Return Format
When returning values from the API, they are generally returned in the following format:

```json
{
  "StatusCode": 200,
  "message": "Pong!",
  "RequestTime": "2024-06-21T04:52:35.487Z"
}
```

* `StatusCode`: Indicates success, failure, or error codes. This is used internally within the project and is based on the `HTTP status code`. However, `StatusCode` does not always match the `HTTP status code`. In case of errors, the `message` may change, so it is recommended to write code based on the `StatusCode`.
* `message`: Contains the result message of the request. The result is not always included in the `message`, so please refer to the documentation for each route (functionality). It is also not recommended to handle errors based on the content of the `message`.
* `RequestTime`: Outputs the request time. Although generally unnecessary, if the recent request time is needed, it can be used for comparison, etc. This is based on `Coordinated Universal Time (UTC)`.

## Setting Return Format
You can request the return value in one of the following formats: `XML`, `JSON`, `TOML`, or `YAML`.

```
http://{domain}/{path}?format={format}
```

By entering one of `XML`, `JSON`, `TOML`, `YAML` in the `{format}` part, the return value will be in that format.

* If the `format` parameter is missing or entered incorrectly, the return value will be in `JSON`.

# SQL File
We use MySQL for the database, and the database and tables must exist. For more details, refer to the [sql file](sql/index.md) documentation!

--------

# API Route Documentation by Path
## Main Server API
### Server Connection Check
* [/ping](routes/ping/index.md) - Server connection check (`GET` / `POST`)

### Service Version Check
* [/version](routes/version/index.md) - Service version check (`GET` / `POST`)

### Disaster Message Search
* [/disaster_msg](routes/disaster_msg/index.md) - Disaster message search (`GET` / `POST`)

## AI Server API
### Server Connection Check
* [/ping](routes/ping/index.md) - Server connection check ( `GET` / `POST` )

### Detect malcomment v1
* [/ai/detect_malcomment_v1](routes/ai/detect_malcomment_v1/index.md) - Detect malcomment v1 ( `GET` / `POST` )