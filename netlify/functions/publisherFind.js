"use strict";
const { makeFindHandler } = require("./crudHandlers");

exports.handler = makeFindHandler("publisher");

