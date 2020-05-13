const conn = require("../shared/mysql").mysqlConnection();


let Model = require('../models/index');

exports.signup = (data) => Model.signup(conn,data);
exports.login = (data) => Model.login(conn,data);
exports.getUser = (data) => Model.getUserDetails(conn,data);
exports.createChatRoom = (data) => Model.createChatRoom(conn,data);
exports.getChatRoom = (data) => Model.getChatRoom(conn,data);
exports.getMessage = (data) => Model.getMessage(conn,data);
exports.addContact = (data) => Model.addContact(conn,data);



