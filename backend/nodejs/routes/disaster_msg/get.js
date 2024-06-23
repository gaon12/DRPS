// routes/disaster_msg/get.js

const { handleRequest } = require('./index');

module.exports = async (params) => {
    return await handleRequest(params);
};
