"use strict";
// Elimina el registro de Redis.
const { makeDeleteBatchHandler } = require("./crudHandlers");

exports.handler = makeDeleteBatchHandler("publisher");

