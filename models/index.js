const DBHelper = require('../shared/dbHelper');
const bcrypt = require('bcryptjs')
const config = require("../config")
var jwt = require('jsonwebtoken');


exports.signup = (conn, data) => {
    let res = {}
    return new Promise((resolve, reject) => {
        let obj = {};
        obj.email = data.email;
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
            }).catch((error) => {
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