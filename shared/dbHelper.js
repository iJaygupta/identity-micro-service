var Q = require('q');
  /**
   * A generic function to generate an update sql query based on
   * the object provided
   *
   * @param{string} tablename - Tablename for which the update query has to be
   * generated
   * @param{object} obj - The object from which the fieldname and field values to be
   * fetched
   * @returns {object} - generated sql and an array of  values
   *
   */
  function genUpdate(tablename, obj) {

    var names = [];
    var values = [];
    var arr = [];
    for (var prop in obj) {
      names.push(prop);
      values.push(prop + "=?");
      arr.push(obj[prop]);
    }
    var sql = "update " + tablename + " set " + values.join(',');
    return {
      sql: sql,
      valueArr: arr
    };

  }

  /**
   * A generic function to generate an insert sql query based on
   * the object provided
   *
   * @param {string} tablename - Tablename for which the update query has to be
   * generated
   * @param {object} obj - The object from which the fieldname and field values to be
   * @param {array} properties -  properties array which needs to be generated
   * @returns {boolean} - promise with status true or false
   *
   */

  function genInsert(tableName, obj, properties) {
    var props = "";

    var names = [];
    var values = [];
    var arr = [];
    if (!properties) {
      for (var prop in obj) {
        var val = obj[prop];
        if (typeof(val) == "function") {
          names.push(prop);
          values.push(val());
        } else {
          names.push(prop);
          values.push("?");
          arr.push(val);
        }
      }
    } else {
      for (var i = 0; i < properties.length; i++) {
        var prop = properties[i];
        if (obj.hasOwnProperty(prop)) {
          var val = obj[prop];
          if (typeof(val) == "function") {
            names.push(prop);
            values.push(val());
          } else {
            names.push(prop);
            values.push("?");
            arr.push(val);
          }


        }
      }
    }
    var sql = "insert into " + tableName + "(" + names.join(',') + ") values(" + values.join(',') + ")";

    return {
      sql: sql,
      valueArr: arr
    };
  }

  function genInsertOnDupUpdate(tableName, obj, dupField) {
    var props = "";

    var names = [];
    var values = [];
    var arr = [];
    for (var prop in obj) {
      names.push(prop);
      values.push("?");
      arr.push(obj[prop]);
    }
    var sql = "insert into " + tableName + "(" + names.join(',') + ") values(" + values.join(',') + ")";
    if (dupField) {
      sql += " ON DUPLICATE KEY UPDATE";
      for (var prop in obj) {
        if (prop != dupField) {
          sql += " " + prop + " = VALUES(" + prop + "),";
        }
      }
      sql = sql.substring(0, sql.length - 1);


    }

    return {
      sql: sql,
      valueArr: arr
    };
  }
  function getSql(connection, sql, params, rowno) {
    var dfd = Q.defer();
    connection.query(sql, params, function(err, res) {
      if (err) {
        console.log(err);
        return dfd.reject(err);
      }
      if (typeof rowno == 'undefined')
        return dfd.resolve(res);

      if (!res.length){
        console.log("Error: No Rows found", sql, params.join(","));
        return dfd.reject(new Error("No rows found"));
      }

      if (!res[rowno]) {
        console.log("Error: No Row found ", rowno, sql, params.join(","));
        return dfd.reject(new Error("No row found"));
      }
      return dfd.resolve(res[rowno]);
    });
    return dfd.promise;
  }

module.exports= {
  genInsert: genInsert,
  genInsertOnDupUpdate: genInsertOnDupUpdate,
  genUpdate: genUpdate,
  getSql: getSql
}
