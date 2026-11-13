"use strict";
// To enable CORS
module.exports = {
  "Access-Control-Allow-Origin": process.env.CORS_ORIGIN || "*",
  "Access-Control-Allow-Headers": "Content-Type, Accept, x-batch-token",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
};
