const express = require('express');
const bodyParser = require('body-parser');
const expressJoi = require('express-joi');
const cors = require('cors');
const Joi = expressJoi.Joi;
const app = express();
const http = require('http').Server(app);
const config = require('./config');
const checkAuth = require('./shared/auth').authenticate;


var corsOptions = {
    credentials: true,
    origin: ["http://localhost:3000", "http://localhost:8001"],
    // origin: function (origin, callback) {
    //     callback(null, true)
    // },
    allowedHeaders: "Accept, Origin, X-Requested-With, X-Auth-Token, X-Auth-Userid, Authorization, Content-Type, Cache-Control, X-Session-ID, Access-Control-Allow-Origin, x-app-version, X-GEO-TOKEN, X-Geo-Token, x-geo-token, x-device-token",
};

app.use(cors());
app.options("*", cors());

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

const service = require('./service/index');
require('./plugins/chatService')(http);


app.post('/api/v1/signup', expressJoi.joiValidate({
    email: Joi.string().required(),
    name: Joi.string().required(),
    password: Joi.string().required(),
}), (req, res) => {
    service.signup(req.body).then(function (data) {
        res.status(data.status).json({
            status: data.status,
            message: data.message,
        });
    }).catch(function (error) {
        res.status(error.status).json({
            status: error.status,
            message: error.message,
        });
    });
});

app.post('/api/v1/login', expressJoi.joiValidate({
    email: Joi.string().required(),
    password: Joi.string().required(),
}), (req, res) => {
    service.login(req.body).then(function (data) {
        res.status(data.status).json({
            status: data.status,
            message: data.message,
            data: data.data,
        });
    }).catch(function (error) {
        res.status(error.status).json({
            status: error.status,
            message: error.message,
        });
    });
});

app.get('/api/v1/user', checkAuth, (req, res) => {
    service.getUser(req).then(function (data) {
        res.status(data.status).json({
            status: data.status,
            message: data.message,
            data: data.data,
        });
    }).catch(function (error) {
        res.status(error.status).json({
            status: error.status,
            message: error.message,
        });
    });
});

app.post('/api/v1/chatRoom', checkAuth, expressJoi.joiValidate({
    chatRoomId: Joi.number().required()
}), (req, res) => {
    service.createChatRoom(req).then(function (data) {
        res.status(data.status).json({
            status: data.status,
            message: data.message,
            data: data.data,
        });
    }).catch(function (error) {
        res.status(error.status).json({
            status: error.status,
            message: error.message,
        });
    });
});

app.get('/api/v1/chatRoom', checkAuth, (req, res) => {
    service.getChatRoom(req).then(function (data) {
        res.status(data.status).json({
            status: data.status,
            message: data.message,
            data: data.data,
        });
    }).catch(function (error) {
        res.status(error.status).json({
            status: error.status,
            message: error.message,
        });
    });
});

app.get('/api/v1/message/:chatRoomId', checkAuth, (req, res) => {
    service.getMessage(req).then(function (data) {
        res.status(data.status).json({
            status: data.status,
            message: data.message,
            data: data.data,
        });
    }).catch(function (error) {
        res.status(error.status).json({
            status: error.status,
            message: error.message,
        });
    });
});

http.listen(config.application.port, () => {
    console.log(`Server is up and running on port ${config.application.port}`);
});