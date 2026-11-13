"use strict";
/**
 * Fábricas de handlers para las tres entidades (book, author, publisher).
 *
 * Flujo diferido:
 *   CRUD (frontend)  ->  push a la lista `bookstore`  ->  *Tasks  ->  *Batch  ->  Redis (book_N, book_<id>)
 */
const redis = require("./redisDB");
const { pushUpdate } = require("./updatesQueue");
const {
  isPreflight,
  response,
  parseBody,
  pathId,
  batchTokenValid,
} = require("./apiHelpers");

const CONFIG = {
  book: { counter: "book_N", prefix: "book_" },
  author: { counter: "author_N", prefix: "author_" },
  publisher: { counter: "publisher_N", prefix: "publisher_" },
};

function config(entity) {
  const cfg = CONFIG[entity];
  if (!cfg) throw new Error(`Entidad desconocida: ${entity}`);
  return cfg;
}

function wrap(fn) {
  return async function handler(event) {
    if (isPreflight(event)) return response(200, {});
    try {
      return await fn(event);
    } catch (error) {
      if (!error.statusCode) console.log(error);
      return response(error.statusCode || 422, { error: error.message });
    }
  };
}

async function findAll(entity) {
  const { counter, prefix } = config(entity);
  const n = parseInt((await redis.get(counter)) || "0", 10);
  if (!Number.isFinite(n) || n <= 0) return [];
  const keys = [];
  for (let i = 1; i <= n; i++) keys.push(prefix + i);
  const values = await redis.mget(keys);
  const items = [];
  for (const value of values) {
    if (value != null) items.push(JSON.parse(value));
  }
  return items;
}

async function findOne(entity, id) {
  const { prefix } = config(entity);
  const value = await redis.get(prefix + id);
  return value == null ? [] : [JSON.parse(value)];
}

function makeFindAllHandler(entity) {
  return wrap(async () => response(200, await findAll(entity)));
}

function makeFindHandler(entity) {
  return wrap(async (event) => response(200, await findOne(entity, pathId(event))));
}

function makeInsertHandler(entity) {
  return wrap(async (event) => {
    const data = parseBody(event);
    delete data.id; // el id real lo asigna *InsertBatch con INCR
    await pushUpdate(entity, "INSERT", data);
    return response(202, { queued: true, entity, method: "INSERT" });
  });
}

function makeUpdateHandler(entity) {
  return wrap(async (event) => {
    const id = pathId(event);
    const data = { ...parseBody(event), id };
    await pushUpdate(entity, "UPDATE", data);
    return response(202, { queued: true, entity, method: "UPDATE", id });
  });
}

function makeDeleteHandler(entity) {
  return wrap(async (event) => {
    const id = pathId(event);
    await pushUpdate(entity, "DELETE", { id });
    return response(202, { queued: true, entity, method: "DELETE", id });
  });
}

function guardBatch(event) {
  return batchTokenValid(event)
    ? null
    : response(401, { error: "Token de lote inválido" });
}

function makeInsertBatchHandler(entity) {
  return wrap(async (event) => {
    const unauthorized = guardBatch(event);
    if (unauthorized) return unauthorized;
    const { counter, prefix } = config(entity);
    const data = parseBody(event);
    delete data.id;
    const id = await redis.incr(counter);
    const record = { ...data, id };
    await redis.set(prefix + id, JSON.stringify(record));
    return response(200, { id });
  });
}

function makeUpdateBatchHandler(entity) {
  return wrap(async (event) => {
    const unauthorized = guardBatch(event);
    if (unauthorized) return unauthorized;
    const { prefix } = config(entity);
    const data = parseBody(event);
    const id = Number(data.id);
    if (!Number.isInteger(id) || id <= 0) {
      return response(400, { error: "El registro a actualizar requiere un id válido" });
    }
    data.id = id;
    await redis.set(prefix + id, JSON.stringify(data));
    return response(200, { id });
  });
}

function makeDeleteBatchHandler(entity) {
  return wrap(async (event) => {
    const unauthorized = guardBatch(event);
    if (unauthorized) return unauthorized;
    const { prefix } = config(entity);
    const body = parseBody(event);
    let id = Number(body.id);
    if (!Number.isInteger(id) || id <= 0) {
      id = pathId(event);
    }
    await redis.del(prefix + id);
    return response(200, { id });
  });
}

module.exports = {
  CONFIG,
  findAll,
  findOne,
  makeFindAllHandler,
  makeFindHandler,
  makeInsertHandler,
  makeUpdateHandler,
  makeDeleteHandler,
  makeInsertBatchHandler,
  makeUpdateBatchHandler,
  makeDeleteBatchHandler,
};
