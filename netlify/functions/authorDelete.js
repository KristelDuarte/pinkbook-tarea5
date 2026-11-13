"use strict";
// Registra la eliminacion en la lista `bookstore` (actualizacion diferida).
const { makeDeleteHandler } = require("./crudHandlers");

exports.handler = makeDeleteHandler("author");

