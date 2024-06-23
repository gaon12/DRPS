const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const xmlbuilder = require('xmlbuilder');
const yaml = require('js-yaml');
const tomlify = require('tomlify-j0.4');

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Load routes dynamically
const loadRoute = (path, method) => {
    try {
        const routeHandler = require(`./routes${path}/${method}`);
        return routeHandler;
    } catch (error) {
        console.error(`Failed to load route for path: ${path}, method: ${method}`, error);
        return null;
    }
};

// Response formatter
const responseFormat = (data, statusCode = 200, contentType = 'application/json') => {
    let response;
    try {
        if (contentType === 'application/xml') {
            response = xmlbuilder.create({ response: data }).end({ pretty: true });
        } else if (contentType === 'application/x-yaml') {
            response = yaml.dump(data);
        } else if (contentType === 'application/toml') {
            response = tomlify.toToml(data, { space: 2 });
        } else {
            response = data;
        }
    } catch (error) {
        console.error(`Error formatting response: ${error}`);
        response = { StatusCode: 500, message: 'Internal Server Error', RequestTime: new Date().toISOString() };
        statusCode = 500;
        contentType = 'application/json';
    }
    return { response, statusCode, contentType };
};

// Determine response content type
const getContentType = (req) => {
    const format = req.query.format ? req.query.format.toLowerCase() : 'json';
    if (format === 'xml') return 'application/xml';
    if (format === 'yaml') return 'application/x-yaml';
    if (format === 'toml') return 'application/toml';
    return 'application/json';
};

// Handle requests
const handleRequest = async (req, res, path, method) => {
    const contentType = getContentType(req);
    const routeHandler = loadRoute(path, method.toLowerCase());

    if (!routeHandler) {
        const { response, statusCode } = responseFormat({ StatusCode: 404, message: `Endpoint ${path} with method ${method} not found.` }, 404, contentType);
        return res.status(statusCode).type(contentType).send(response);
    }

    try {
        let data;
        if (method === 'GET') {
            data = await routeHandler(req.query);
        } else if (method === 'POST') {
            data = await routeHandler(req.body);
        } else {
            const { response, statusCode } = responseFormat({ StatusCode: 405, message: `Method ${method} not allowed.` }, 405, contentType);
            return res.status(statusCode).type(contentType).send(response);
        }

        // Extract HTTP status code and remove it from data
        const httpStatusCode = data.httpStatusCode || 200;
        delete data.httpStatusCode;

        // Add request time
        data.RequestTime = new Date().toISOString();

        const { response } = responseFormat(data, httpStatusCode, contentType);
        return res.status(httpStatusCode).type(contentType).send(response);
    } catch (error) {
        console.error(`Error handling request for path: ${path}, method: ${method}`, error);
        const { response, statusCode } = responseFormat({ StatusCode: 500, message: 'Internal Server Error', RequestTime: new Date().toISOString() }, 500, contentType);
        return res.status(statusCode).type(contentType).send(response);
    }
};

// Define routes
app.get('/ping', (req, res) => handleRequest(req, res, '/ping', 'GET'));
app.post('/ping', (req, res) => handleRequest(req, res, '/ping', 'POST'));

// Get Disaster Message(s)
app.get('/disaster_msg', (req, res) => handleRequest(req, res, '/disaster_msg', 'GET'));
app.post('/disaster_msg', (req, res) => handleRequest(req, res, '/disaster_msg', 'POST'));

// Get Version info
app.get('/version', (req, res) => handleRequest(req, res, '/version', 'GET'));
app.post('/version', (req, res) => handleRequest(req, res, '/version', 'POST'));

// Catch-all for undefined routes
app.use('*', (req, res) => {
    const contentType = getContentType(req);
    const { response, statusCode } = responseFormat({ StatusCode: 404, message: 'Endpoint not found.', RequestTime: new Date().toISOString() }, 404, contentType);
    return res.status(statusCode).type(contentType).send(response);
});

// Start the server
const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
