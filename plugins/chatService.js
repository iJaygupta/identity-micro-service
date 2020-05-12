const config = require('../config');
var jwt = require('jsonwebtoken');
const DBHelper = require('../shared/dbHelper');
const conn = require("../shared/mysql").mysqlConnection();



module.exports = function (app) {

    var sockets = {}

    const socketIO = require('socket.io');

    const io = socketIO(app);

    io.use((socket, next) => {
        if (!parseSocketToken(socket)) {
            return next(new Error(JSON.stringify({ "error": true, msg: "Unauthorized access" })));
        } else {
            return next();
        }
    });

    function parseSocketToken(socket) {
        if (socket.handshake.query && socket.handshake.query.token) {
            try {
                var data = jwt.decode(socket.handshake.query.token, config.application.secretKey);
                socket.handshake.headers = {};
                socket.handshake.headers.user_id = data.user_id;
                return true;
            } catch (e) {
                return false;
            }
        }
        return false;
    };

    io.sockets.on('connection', (socket) => {

        onConnect(socket.handshake.headers.user_id, socket.id)

        socket.on('join-chat-room', function (chatRoomData) {
            joinChatRoom(socket, chatRoomData)
        });

        socket.on('disconnect', function (username) {
            onDisconnect(socket.handshake.headers.user_id, socket.id)
        })

        socket.on('chat-message', async function (data) {
            acceptMessage(socket, data);
            broadCastMessage(socket, data);
        });

    });


    function onConnect(userId, socketId) {
        if (!sockets[userId]) {
            sockets[userId] = [socketId]
        } else {
            sockets[userId].push(socketId)
        }
    }

    function onDisconnect(userId, socketId) {
        if (sockets[userId].length > 1) {
            sockets[userId].splice(sockets[userId].indexOf(socketId), 1);
        } else {
            delete sockets[userId];
        }
    }

    function acceptMessage(socket, messageData) {
        const userDetails = socket.handshake.headers;
        let messageObj = {};
        messageObj.user_id = userDetails.user_id;
        messageObj.content = messageData.messageText;
        messageObj.chatroom_id = messageData.chatRoomId;
        let sqlObjInsert = DBHelper.genInsert('messages', messageObj);
        DBHelper.getSql(conn, sqlObjInsert.sql, sqlObjInsert.valueArr)
    }

    async function broadCastMessage(socket, messageData) {
        let chatUsers = await getChatUsers(messageData.chatRoomId);

        chatUsers.map((user) => {
            if (socket.handshake.headers.user_id != user.user_id && sockets[user.user_id]) {
                sockets[user.user_id].map(socketId => {
                    io.to(socketId).emit('getMessage', {
                        "error": false,
                        "chatRoomId": messageData.chatRoomId,
                        "displayName": messageData.senderName,
                        "uid": socket.handshake.headers.user_id,
                        "message": messageData.messageText,
                        "timeStamp": Date.now(),
                    });
                })
            }
        })
    }

    function joinChatRoom(socket, chatRoomId) {
        let query = `INSERT INTO chatgroup (chatroom_id, user_id)
        SELECT * FROM (SELECT '${chatRoomId}', '${socket.handshake.headers.user_id}') AS tmp
        WHERE NOT EXISTS (
            SELECT user_id, chatroom_id FROM chatgroup WHERE user_id = '${socket.handshake.headers.user_id}' and chatroom_id = '${chatRoomId}'
        ) LIMIT 1;`
        DBHelper.getSql(conn, query)
    }

    function getChatUsers(chatRoomId) {
        return new Promise((resolve, reject) => {
            let query = `SELECT  M1.user_id, M2.name
            FROM (select user_id from chatgroup where chatroom_id ='${chatRoomId}') AS M1
            JOIN (SELECT * from user) AS M2
            ON M1.user_id = M2.user_id`
            DBHelper.getSql(conn, query)
                .then((data) => {
                    resolve(data)
                }).catch((error) => {
                    reject(error)
                })
        })
    }
}




