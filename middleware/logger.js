'use strict';

const logRequestInfo = function(req, res, next) {
  const now = new Date();
  console.log(`${now.toLocaleDateString()} ${now.toLocaleTimeString()} ${req.method} ${req.url}`);
};

module.exports = {
  logRequestInfo
};