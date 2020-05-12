var jwt = require('jsonwebtoken');
const config = require("../config")



exports.authenticate = function (request, response, next) {
    let token = request.headers['authorization'];
    if (!token)
        return response.status(401).send({ auth: false, message: 'No token provided.' });

    verifyAuthToken(request, response, next);
}


function verifyAuthToken(request, response, next) {
    let token = request.headers['authorization'];
    jwt.verify(token, config.application.secretKey, function (err, data) {
        if (err && err.name === 'TokenExpiredError')
            return response.status(401).send({ error: true, code: 'TokenExpiredError', message: 'The token has been expired.' })

        if (err && err.name != 'TokenExpiredError')
            return response.status(401).send({ error: true, message: 'Unauthorized Access.' })
        request.headers.payload = data;
        next();
    })
}