"use strict";
// Guarda el registro modificado en Redis.
const { makeUpdateBatchHandler } = require("./crudHandlers");

exports.handler = makeUpdateBatchHandler("book");

