"use strict";
const { pendingCounts } = require("./updatesQueue");
const { isPreflight, response } = require("./apiHelpers");

exports.handler = async (event) => {
  if (isPreflight(event)) return response(200, {});
  try {
    const counts = await pendingCounts();
    return response(200, counts);
  } catch (error) {
    console.log(error);
    return response(400, { error: error.message });
  }
};
