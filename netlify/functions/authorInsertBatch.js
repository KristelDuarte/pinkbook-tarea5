"use strict";
// Asigna el id con INCR y guarda el registro en Redis.
const { makeInsertBatchHandler } = require("./crudHandlers");

exports.handler = makeInsertBatchHandler("author");

