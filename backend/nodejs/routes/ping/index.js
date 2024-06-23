// routes/ping/index.js

// 공통 응답 처리 함수
const createResponse = (statusCode, message, httpStatusCode = 200) => {
    return {
        StatusCode: statusCode,
        message: message,
        httpStatusCode: httpStatusCode
    };
};

module.exports = { createResponse };
