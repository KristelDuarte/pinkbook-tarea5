"use strict";
// Recorre la lista `bookstore`, toma las actualizaciones de esta entidad
// e invoca las funciones *Batch correspondientes.
const { makeTasksHandler } = require("./tasksRunner");

exports.handler = makeTasksHandler("author");

