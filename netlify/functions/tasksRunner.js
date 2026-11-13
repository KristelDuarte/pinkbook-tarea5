"use strict";
const { drain } = require("./updatesQueue");
const { isPreflight, response } = require("./apiHelpers");

const ROUTES = {
  book: {
    INSERT: ["bookInsertBatch", "POST"],
    UPDATE: ["bookUpdateBatch", "PUT"],
    DELETE: ["bookDeleteBatch", "DELETE"],
  },
  author: {
    INSERT: ["authorInsertBatch", "POST"],
    UPDATE: ["authorUpdateBatch", "PUT"],
    DELETE: ["authorDeleteBatch", "DELETE"],
  },
  publisher: {
    INSERT: ["publisherInsertBatch", "POST"],
    UPDATE: ["publisherUpdateBatch", "PUT"],
    DELETE: ["publisherDeleteBatch", "DELETE"],
  },
};

function baseUrl() {
  return (
    process.env.URL ||
    process.env.DEPLOY_PRIME_URL ||
    "http://localhost:8888"
  ).replace(/\/+$/, "");
}

async function callBatch(functionName, method, payload) {
  const headers = { "Content-Type": "application/json" };
  if (process.env.BATCH_TOKEN) {
    headers["x-batch-token"] = process.env.BATCH_TOKEN;
  }
  const res = await fetch(`${baseUrl()}/.netlify/functions/${functionName}`, {
    method,
    headers,
    body: payload === undefined ? undefined : JSON.stringify(payload),
  });
  if (!res.ok) {
    throw new Error(`${functionName} respondió con estado ${res.status}`);
  }
  return res;
}

function makeTasksHandler(entity) {
  return async function handler(event) {
    if (isPreflight(event)) return response(200, {});
    try {
      const result = await drain(entity, async (update) => {
        const route = ROUTES[entity][update.method];
        if (!route) {
          throw new Error(`Método desconocido: ${update.method}`);
        }
        await callBatch(route[0], route[1], update.data);
      });
      return response(200, { entity, ...result });
    } catch (error) {
      console.log(error);
      return response(422, { error: error.message });
    }
  };
}

module.exports = { makeTasksHandler, callBatch, ROUTES };
