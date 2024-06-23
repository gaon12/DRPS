// routes/disaster_msg/index.js

const mysql = require('mysql2/promise');
const dbConfig = require('../../db/db_config');

// 공통 응답 처리 함수
const createResponse = (statusCode, message, httpStatusCode = 200, data) => {
    const response = {
        statusCode,
        message,
        httpStatusCode
    };
    if (data !== undefined && data !== null && !(Array.isArray(data) && data.length === 0)) {
        response.data = data;
    }
    return response;
};

// DB 연결 함수
const getDbConnection = async () => {
    const connection = await mysql.createConnection(dbConfig);
    return connection;
};

// md101_sn으로 재난문자 정보 조회
const getDisasterMessageByMd101Sn = async (md101_sn) => {
    const connection = await getDbConnection();
    const [rows] = await connection.execute('SELECT * FROM disaster_msg WHERE md101_sn = ?', [md101_sn]);
    await connection.end();
    return rows.length ? rows[0] : null;
};

// location_id로 최근 10개의 재난문자 정보 조회
const getDisasterMessagesByLocationId = async (location_id) => {
    const connection = await getDbConnection();
    const query = `
        SELECT * FROM disaster_msg 
        WHERE FIND_IN_SET(?, location_id) 
        ORDER BY create_date DESC 
        LIMIT 10
    `;
    const [rows] = await connection.execute(query, [location_id]);
    await connection.end();
    return rows.length ? rows : null;
};

// location_name으로 최근 10개의 재난문자 정보 조회
const getDisasterMessagesByLocationName = async (location_name) => {
    const connection = await getDbConnection();
    const query = `
        SELECT * FROM disaster_msg 
        WHERE location_name LIKE ? 
        ORDER BY create_date DESC 
        LIMIT 10
    `;
    const [rows] = await connection.execute(query, [`%${location_name}%`]);
    await connection.end();
    return rows.length ? rows : null;
};

// 요청 처리 함수
const handleRequest = async (params) => {
    const { md101_sn, location_id, location_name } = params;

    if (md101_sn) {
        const message = await getDisasterMessageByMd101Sn(md101_sn);
        if (message) {
            return createResponse(200, 'Disaster message found.', 200, message);
        } else {
            return createResponse(404, 'Disaster message not found.', 404);
        }
    } else if (location_id) {
        const messages = await getDisasterMessagesByLocationId(location_id);
        if (messages) {
            return createResponse(200, 'Disaster messages found.', 200, messages);
        } else {
            return createResponse(404, 'No disaster messages found for the specified location_id.', 404);
        }
    } else if (location_name) {
        const messages = await getDisasterMessagesByLocationName(location_name);
        if (messages) {
            return createResponse(200, 'Disaster messages found.', 200, messages);
        } else {
            return createResponse(404, 'No disaster messages found for the specified location_name.', 404);
        }
    } else {
        return createResponse(400, 'Invalid request parameters.', 400);
    }
};

module.exports = { createResponse, handleRequest };
