const conn = require("../shared/mysql").mysqlConnection();


let ReportsModel = require('../models/index');

exports.addRequest = (data) => ReportsModel.signup(conn,data);
exports.getRequest = (data) => ReportsModel.login(conn,data);


