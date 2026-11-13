"use strict";
// Registra la modificacion en la lista `bookstore` (actualizacion diferida).
const { makeUpdateHandler } = require("./crudHandlers");

exports.handler = makeUpdateHandler("publisher");

