// routes/ping/get.js

const { createResponse } = require('./index');

module.exports = async () => {
    return createResponse(200, 'Pong!', 200);
};
