// routes/version/index.js

const fs = require('fs').promises;
const path = require('path');

// version.txt 파일 읽기 함수
const readVersionFile = async () => {
    const versionFilePath = path.join(__dirname, 'version.txt');
    try {
        const version = await fs.readFile(versionFilePath, 'utf8');
        return version.trim();
    } catch (error) {
        if (error.code === 'ENOENT') {
            return null; // 파일이 존재하지 않으면 null 반환
        } else {
            throw error; // 다른 오류는 그대로 던짐
        }
    }
};

// 공통 응답 처리 함수
const createResponse = async (statusCode, message, httpStatusCode = 200) => {
    const version = await readVersionFile();

    if (version === null) {
        return {
            StatusCode: 5000,
            message: 'Version file does not exist',
            httpStatusCode: 500
        };
    } else if (version === '') {
        return {
            StatusCode: 5001,
            message: 'Version file is empty',
            httpStatusCode: 500
        };
    }

    return {
        StatusCode: statusCode,
        message: message,
        httpStatusCode: httpStatusCode,
        data: {
            version: version
        }
    };
};

module.exports = { createResponse };
