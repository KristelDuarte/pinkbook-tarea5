"use strict";
// Registra la creacion en la lista `bookstore` (actualizacion diferida).
const { makeInsertHandler } = require("./crudHandlers");

exports.handler = makeInsertHandler("publisher");

