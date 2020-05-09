/*
to load all plugins one by one and push all service in an object
*/
module.exports = function () {
  var normalizedPath = require("path").join(__dirname, "plugins");
  var plugins = {};

  require("fs").readdirSync(normalizedPath).forEach((file) => {
    tmp = require("./plugins/" + file);
    Object.keys(tmp).map(function (key) {
      plugins[key] = tmp[key];
    });
  });
  return plugins;
};
