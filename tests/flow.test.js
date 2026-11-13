"use strict";
/**
 * Pruebas del flujo diferido completo:
 *   escritura -> lista `bookstore` -> *Tasks -> *Batch -> Redis
 *
 * Se usa ioredis-mock en lugar de Redis Cloud y se intercepta fetch para
 * invocar directamente los handlers de las funciones *Batch.
 *
 * Ejecutar con: npm test
 */
const { test, beforeEach } = require("node:test");
const assert = require("node:assert/strict");
const path = require("node:path");
const RedisMock = require("ioredis-mock");

const FUNCTIONS_DIR = path.join(__dirname, "..", "netlify", "functions");
const BASE_URL = "http://localhost:8888";

const mockRedis = new RedisMock();
const redisModulePath = require.resolve(path.join(FUNCTIONS_DIR, "redisDB.js"));
require.cache[redisModulePath] = {
  id: redisModulePath,
  filename: redisModulePath,
  loaded: true,
  exports: mockRedis,
};

process.env.URL = BASE_URL;

const handlers = new Map();
function handler(name) {
  if (!handlers.has(name)) {
    handlers.set(name, require(path.join(FUNCTIONS_DIR, `${name}.js`)).handler);
  }
  return handlers.get(name);
}

function makeEvent(name, method, options = {}) {
  const { id, body, headers } = options;
  return {
    httpMethod: method,
    path:
      id === undefined
        ? `/.netlify/functions/${name}`
        : `/.netlify/functions/${name}/${id}`,
    headers: headers || {},
    body:
      body === undefined
        ? null
        : typeof body === "string"
          ? body
          : JSON.stringify(body),
    queryStringParameters: null,
  };
}

async function call(name, method = "GET", options = {}) {
  const result = await handler(name)(makeEvent(name, method, options), {});
  return {
    statusCode: result.statusCode,
    body: result.body ? JSON.parse(result.body) : undefined,
  };
}

global.fetch = async (url, options = {}) => {
  const prefix = `${BASE_URL}/.netlify/functions/`;
  assert.ok(url.startsWith(prefix), `URL inesperada: ${url}`);
  const name = url.slice(prefix.length);
  const result = await handler(name)(
    {
      httpMethod: options.method || "GET",
      path: `/.netlify/functions/${name}`,
      headers: options.headers || {},
      body: options.body === undefined ? null : options.body,
      queryStringParameters: null,
    },
    {}
  );
  return {
    ok: result.statusCode >= 200 && result.statusCode < 300,
    status: result.statusCode,
    json: async () => JSON.parse(result.body || "null"),
  };
};

beforeEach(async () => {
  await mockRedis.flushall();
  const seeded = await call("dbCreate");
  assert.equal(seeded.statusCode, 200);
});

test("dbCreate siembra libros, autores y editoriales", async () => {
  const books = await call("bookFindAll");
  const authors = await call("authorFindAll");
  const publishers = await call("publisherFindAll");

  assert.equal(books.body.length, 4);
  assert.equal(authors.body.length, 2);
  assert.equal(publishers.body.length, 2);
  assert.equal(books.body[0].title, "Operating System Concepts");
  assert.equal(authors.body[0].author, "Abraham Silberschatz");
  assert.equal(publishers.body[0].publisher, "John Wiley & Sons");
  assert.equal(await mockRedis.llen("bookstore"), 0);
});

test("bookInsert encola el alta y bookTasks la aplica", async () => {
  const queued = await call("bookInsert", "POST", {
    body: {
      title: "Distributed Systems",
      author: "Maarten van Steen",
      publisher: "Independently published",
      edition: "4th",
      copyright: 2023,
      language: "ENGLISH",
      pages: 700,
    },
  });

  assert.equal(queued.statusCode, 202);
  assert.equal(queued.body.queued, true);
  assert.equal(await mockRedis.llen("bookstore"), 1);

  const message = JSON.parse(await mockRedis.lindex("bookstore", 0));
  assert.equal(message.entity, "book");
  assert.equal(message.method, "INSERT");

  // Aún no se ha aplicado el cambio
  let books = await call("bookFindAll");
  assert.equal(books.body.length, 4);

  const tasks = await call("bookTasks", "POST");
  assert.equal(tasks.statusCode, 200);
  assert.equal(tasks.body.processed, 1);
  assert.equal(await mockRedis.llen("bookstore"), 0);

  books = await call("bookFindAll");
  assert.equal(books.body.length, 5);
  assert.equal(books.body[4].id, 5);
  assert.equal(books.body[4].title, "Distributed Systems");
});

test("bookUpdate y bookDelete también se aplican mediante bookTasks", async () => {
  const books = await call("bookFindAll");
  const book = books.body[0];

  await call("bookUpdate", "PUT", {
    id: book.id,
    body: { ...book, title: "Operating Systems Concepts (10th)" },
  });
  await call("bookDelete", "DELETE", { id: 2 });
  assert.equal(await mockRedis.llen("bookstore"), 2);

  const tasks = await call("bookTasks", "POST");
  assert.equal(tasks.body.processed, 2);

  const updated = await call("bookFind", "GET", { id: 1 });
  assert.equal(updated.body[0].title, "Operating Systems Concepts (10th)");

  const remaining = await call("bookFindAll");
  assert.deepEqual(
    remaining.body.map((item) => item.id),
    [1, 3, 4]
  );
});

test("los ids no se reutilizan después de eliminar registros", async () => {
  await call("bookDelete", "DELETE", { id: 2 });
  await call("bookInsert", "POST", { body: { title: "Nuevo libro" } });
  await call("bookTasks", "POST");

  const books = await call("bookFindAll");
  const created = books.body.find((item) => item.title === "Nuevo libro");
  assert.equal(created.id, 5);
  assert.equal(books.body.length, 4);
});

test("las actualizaciones de autores no las consume bookTasks", async () => {
  await call("authorInsert", "POST", {
    body: {
      author: "Martin Kleppmann",
      nationality: "British",
      birth_year: 1982,
      fields: "Distributed systems, Data engineering",
    },
  });
  await call("publisherInsert", "POST", {
    body: {
      publisher: "O'Reilly Media",
      country: "United States",
      founded: 1978,
      genre: "Technical",
    },
  });
  assert.equal(await mockRedis.llen("bookstore"), 2);

  const bookTasks = await call("bookTasks", "POST");
  assert.equal(bookTasks.body.processed, 0);
  assert.equal(await mockRedis.llen("bookstore"), 2);

  const authorTasks = await call("authorTasks", "POST");
  assert.equal(authorTasks.body.processed, 1);
  assert.equal(await mockRedis.llen("bookstore"), 1);

  const publisherTasks = await call("publisherTasks", "POST");
  assert.equal(publisherTasks.body.processed, 1);
  assert.equal(await mockRedis.llen("bookstore"), 0);

  const authors = await call("authorFindAll");
  assert.equal(authors.body.length, 3);
  assert.equal(authors.body[2].id, 3);
  assert.equal(authors.body[2].author, "Martin Kleppmann");

  const publishers = await call("publisherFindAll");
  assert.equal(publishers.body.length, 3);
  assert.equal(publishers.body[2].publisher, "O'Reilly Media");
});

test("authorUpdate y authorDelete se aplican mediante authorTasks", async () => {
  await call("authorUpdate", "PUT", {
    id: 2,
    body: {
      id: 2,
      author: "Andrew S. Tanenbaum",
      nationality: "Dutch / American",
      birth_year: 1944,
      fields: "Distributed computing, Computer networks",
    },
  });
  await call("authorDelete", "DELETE", { id: 1 });
  await call("authorTasks", "POST");

  const authors = await call("authorFindAll");
  assert.equal(authors.body.length, 1);
  assert.equal(authors.body[0].id, 2);
  assert.equal(
    authors.body[0].fields,
    "Distributed computing, Computer networks"
  );
});

test("publisherUpdate y publisherDelete se aplican mediante publisherTasks", async () => {
  await call("publisherUpdate", "PUT", {
    id: 1,
    body: {
      id: 1,
      publisher: "John Wiley & Sons, Inc.",
      country: "United States",
      founded: 1807,
      genre: "Academic",
    },
  });
  await call("publisherDelete", "DELETE", { id: 2 });
  await call("publisherTasks", "POST");

  const publishers = await call("publisherFindAll");
  assert.equal(publishers.body.length, 1);
  assert.equal(publishers.body[0].publisher, "John Wiley & Sons, Inc.");
});

test("updatesPending informa las actualizaciones encoladas", async () => {
  await call("bookInsert", "POST", { body: { title: "Libro A" } });
  await call("authorInsert", "POST", { body: { author: "Autor A" } });
  await call("publisherInsert", "POST", { body: { publisher: "Editorial A" } });

  const counts = await call("updatesPending");
  assert.equal(counts.body.pending, 3);
  assert.equal(counts.body.errors, 0);
});

test("un cuerpo que no es JSON se rechaza con 400", async () => {
  const result = await call("bookInsert", "POST", { body: "{no es json" });
  assert.equal(result.statusCode, 400);
  assert.equal(await mockRedis.llen("bookstore"), 0);
});

test("los mensajes corruptos se mueven a bookstore_errors", async () => {
  await mockRedis.rpush("bookstore", "{mensaje corrupto");
  const tasks = await call("bookTasks", "POST");

  assert.equal(tasks.body.processed, 0);
  assert.equal(tasks.body.failed, 1);
  assert.equal(await mockRedis.llen("bookstore"), 0);
  assert.equal(await mockRedis.llen("bookstore_errors"), 1);
});

test("bookFind devuelve un arreglo vacío para un id inexistente", async () => {
  const result = await call("bookFind", "GET", { id: 999 });
  assert.equal(result.statusCode, 200);
  assert.deepEqual(result.body, []);
});
