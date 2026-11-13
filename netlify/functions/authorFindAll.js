"use strict";
const { makeFindAllHandler } = require("./crudHandlers");

exports.handler = makeFindAllHandler("author");

