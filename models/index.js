const DBHelper = require('../shared/dbHelper');
const bcrypt = require('bcryptjs')
const config = require("../config")
var jwt = require('jsonwebtoken');
const request = require('request');


exports.signup = (conn, data) => {
    let res = {}
    return new Promise((resolve, reject) => {
        let obj = {};
        obj.email = data.email;
        obj.name = data.name;
        obj.password = bcrypt.hashSync(data.password);
        let query = `select * from user where email ='${data.email}'`
        DBHelper.getSql(conn, query)
            .then((userDetails) => {
                if (userDetails && userDetails.length) {
                    res.status = 400;
                    res.message = 'User already exist please login';
                    reject(res);
                } else {
                    let sqlObjInsert = DBHelper.genInsert('user', obj);
                    DBHelper.getSql(conn, sqlObjInsert.sql, sqlObjInsert.valueArr)
                        .then((data) => {
                            res.status = 201;
                            res.message = 'Successfully Signed Up';
                            resolve(res);
                        }).catch((error) => {
                            res.status = 500;
                            res.message = 'Something went Wrong';
                            reject(res);
                        })
                }
            }).catch(() => {
                res.status = 500;
                res.message = 'Something went Wrong';
                reject(res);
            })
    })
}

exports.login = (conn, data) => {
    let res = {}
    return new Promise((resolve, reject) => {
        let query = `select * from user where email ='${data.email}'`
        DBHelper.getSql(conn, query)
            .then((userDetails) => {
                if (userDetails && userDetails.length) {
                    bcrypt.compare(data.password, userDetails[0].password, async (error, result) => {
                        if (error) {
                            res.status = 500;
                            res.message = 'Something went wrong';
                            reject(res);
                        } else if (!result) {
                            res.status = 401;
                            res.message = 'Invalid password';
                            reject(res);
                        } else {
                            let payload = {
                                user_id: userDetails[0].user_id,
                                email: userDetails[0].email,
                            }
                            let token = await generateAuthToken(payload);
                            let result = {
                                email: userDetails[0].email,
                                token
                            }
                            res.status = 200;
                            res.data = result;
                            res.message = 'Logged in Successfully';
                            resolve(res);
                        }
                    })
                } else {
                    res.status = 404;
                    res.message = 'Invalid email user does not exist';
                    reject(res);
                }
            }).catch(error => {
                res.status = 500;
                res.message = 'Something went Wrong';
                reject(res);
            })
    })
}


exports.getUserDetails = (conn, data) => {
    let res = {}
    let payload = data.headers.payload;
    return new Promise((resolve, reject) => {
        let query = `select * from user where user_id ='${payload.user_id}'`
        DBHelper.getSql(conn, query)
            .then((userDetails) => {
                res.status = 200;
                res.data = userDetails;
                res.message = 'Get User Details Successfully';
                resolve(res);
            }).catch(() => {
                res.status = 500;
                res.message = 'Something went Wrong';
                reject(res);
            })


    })
}

function generateAuthToken(payload) {
    return new Promise((resolve, reject) => {
        jwt.sign(payload, config.application.secretKey, { expiresIn: config.application.expiresIn }, function (err, token) {
            if (err) {
                reject(err);
            }
            resolve(token);
        });
    })
}


exports.createChatRoom = (conn, data) => {
    let res = {}
    return new Promise((resolve, reject) => {
        let obj = {};
        obj.chatroom_id = data.body.chatRoomId;
        obj.user_id = data.headers.payload.user_id;
        let sqlObjInsert = DBHelper.genInsert('chatgroup', obj);
        DBHelper.getSql(conn, sqlObjInsert.sql, sqlObjInsert.valueArr)
            .then(() => {
                res.status = 201;
                res.data = data.body.chatRoomId;
                res.message = 'Chat Group Created Successfully';
                resolve(res);
            }).catch(() => {
                res.status = 500;
                res.message = 'Something went Wrong';
                reject(res);
            })
    })
}

exports.getChatRoom = (conn, data) => {
    let res = {}
    return new Promise((resolve, reject) => {
        let query = `select chatroom_id from chatgroup `
        if (data.query.me) {
            query += `where user_id = '${data.headers.payload.user_id}' `
        }
        query += `group by chatroom_id`
        DBHelper.getSql(conn, query)
            .then((userDetails) => {
                res.status = 200;
                res.data = userDetails;
                res.message = 'Get Chat Room List Successfully';
                resolve(res);
            }).catch(error => {
                res.status = 500;
                res.message = 'Something went Wrong';
                reject(res);
            })
    })

}

exports.getMessage = (conn, data) => {
    let res = {}
    return new Promise((resolve, reject) => {
        let query = `SELECT M1.message_id, M1.content, M1.user_id, M1.chatroom_id, M2.name
        FROM (select * from messages where chatroom_id = '${data.params.chatRoomId}') AS M1
        JOIN (SELECT * from user) AS M2
        ON M1.user_id = M2.user_id`
        DBHelper.getSql(conn, query)
            .then((userDetails) => {
                res.status = 200;
                res.data = userDetails;
                res.message = 'Get Message Successfully';
                resolve(res);
            }).catch(error => {
                res.status = 500;
                res.message = 'Something went Wrong';
                reject(res);
            })
    })
}

exports.addContact = (conn, data) => {
    let res = {}
    let url = `${config.messageBird.baseUrl}${data.body.mobile}`
    return new Promise((resolve, reject) => {
        var options = {
            method: 'GET',
            url,
            headers: {
                authorization: `AccessKey ${config.messageBird.accessKey}`
            },
            json: true
        }
        request(options, (err, result, body) => {
            if (err) {
                res.status = 500;
                res.message = 'Something went Wrong';
                return reject(res);
            } else {
                if (body && body.errors) {
                    res.status = 400;
                    res.message = 'Invalid Phone Number';
                    res.data = body.errors;
                    return reject(res);
                } else {
                    let obj = {};
                    obj.mobile = data.body.mobile;
                    obj.name = data.body.name;
                    obj.user_id = data.headers.payload.user_id;
                    let sqlObjInsert = DBHelper.genInsert('contacts', obj);
                    DBHelper.getSql(conn, sqlObjInsert.sql, sqlObjInsert.valueArr)
                        .then(() => {
                            res.status = 201;
                            res.message = 'Contact Added Successfully';
                            resolve(res);
                        }).catch(() => {
                            res.status = 500;
                            res.message = 'Something went Wrong';
                            reject(res);
                        })
                }
            }

        })

    })
}
