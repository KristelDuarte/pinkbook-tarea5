"use strict";
const headers = require("./headersCORS");

function isPreflight(event) {
  return !event || event.httpMethod === "OPTIONS";
}

function response(statusCode, payload) {
  return {
    statusCode,
    headers,
    body: payload === undefined ? "" : JSON.stringify(payload),
  };
}

function badRequest(message) {
  const error = new Error(message);
  error.statusCode = 400;
  return error;
}

function parseBody(event) {
  if (!event || !event.body) return {};
  const raw = event.isBase64Encoded
    ? Buffer.from(event.body, "base64").toString("utf8")
    : event.body;
  if (!raw) return {};
  try {
    return JSON.parse(raw);
  } catch (error) {
    throw badRequest("El cuerpo de la petición no es un JSON válido");
  }
}

/**
 * Obtiene el id desde el final del path (por ejemplo /.netlify/functions/bookUpdate/3)
 * o desde el query string (?id=3).
 */
function pathId(event) {
  const segments = (event.path || "").split("/").filter(Boolean);
  const last = segments[segments.length - 1];
  const fromQuery =
    event.queryStringParameters && event.queryStringParameters.id;
  const rawId = last && !last.startsWith("book") && !last.startsWith("author") && !last.startsWith("publisher")
    ? last
    : fromQuery;
  const id = Number(rawId);
  if (!Number.isInteger(id) || id <= 0) {
    throw badRequest("Se requiere un id numérico válido en el URL");
  }
  return id;
}

function batchTokenValid(event) {
  const expected = process.env.BATCH_TOKEN;
  if (!expected) return true;
  const incoming = event.headers || {};
  const provided = incoming["x-batch-token"] || incoming["X-Batch-Token"] || "";
  return provided === expected;
}

module.exports = {
  headers,
  isPreflight,
  response,
  parseBody,
  pathId,
  batchTokenValid,
};
