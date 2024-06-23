// routes/disaster_msg/post.js

const { handleRequest } = require('./index');

module.exports = async (params) => {
    return await handleRequest(params);
};