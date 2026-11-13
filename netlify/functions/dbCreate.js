"use strict";
/**
 * Inicializa la base de datos de Redis con libros, autores y editoriales.
 * También elimina la lista `bookstore` y la lista de errores para empezar limpio.
 *
 * Invocar una sola vez (o cuando se quiera reiniciar el contenido):
 *   https://<sitio>.netlify.app/.netlify/functions/dbCreate
 */
const redis = require("./redisDB");
const { LIST, ERRORS_LIST } = require("./updatesQueue");
const { isPreflight, response } = require("./apiHelpers");

const books = [
  {
    id: 1,
    title: "Operating System Concepts",
    edition: "9th",
    copyright: 2012,
    language: "ENGLISH",
    pages: 976,
    author: "Abraham Silberschatz",
    author_id: 1,
    publisher: "John Wiley & Sons",
    publisher_id: 1,
  },
  {
    id: 2,
    title: "Database System Concepts",
    edition: "6th",
    copyright: 2010,
    language: "ENGLISH",
    pages: 1376,
    author: "Abraham Silberschatz",
    author_id: 1,
    publisher: "John Wiley & Sons",
    publisher_id: 1,
  },
  {
    id: 3,
    title: "Computer Networks",
    edition: "5th",
    copyright: 2010,
    language: "ENGLISH",
    pages: 960,
    author: "Andrew S. Tanenbaum",
    author_id: 2,
    publisher: "Pearson Education",
    publisher_id: 2,
  },
  {
    id: 4,
    title: "Modern Operating Systems",
    edition: "4th",
    copyright: 2014,
    language: "ENGLISH",
    pages: 1136,
    author: "Andrew S. Tanenbaum",
    author_id: 2,
    publisher: "Pearson Education",
    publisher_id: 2,
  },
];

const authors = [
  {
    id: 1,
    author: "Abraham Silberschatz",
    nationality: "Israelis / American",
    birth_year: 1952,
    fields: "Database Systems, Operating Systems",
  },
  {
    id: 2,
    author: "Andrew S. Tanenbaum",
    nationality: "Dutch / American",
    birth_year: 1944,
    fields: "Distributed computing, Operating Systems",
  },
];

const publishers = [
  {
    id: 1,
    publisher: "John Wiley & Sons",
    country: "United States",
    founded: 1807,
    genre: "Academic",
  },
  {
    id: 2,
    publisher: "Pearson Education",
    country: "United Kingdom",
    founded: 1844,
    genre: "Education",
  },
];

// Borra los registros por id (sin usar KEYS, restringido en algunos planes de Redis Cloud).
// Los ids siempre son consecutivos desde 1 y el contador nunca decrece, así que
// basta con recorrer hasta el mayor valor conocido.
async function reset(prefix, counter, records) {
  const current = parseInt((await redis.get(counter)) || "0", 10);
  const limit = Math.max(Number.isFinite(current) ? current : 0, records.length);
  const pipeline = redis.pipeline();
  for (let i = 1; i <= limit; i++) {
    pipeline.del(prefix + i);
  }
  for (const record of records) {
    pipeline.set(prefix + record.id, JSON.stringify(record));
  }
  pipeline.set(counter, records.length);
  await pipeline.exec();
}

exports.handler = async (event) => {
  if (isPreflight(event)) return response(200, {});
  try {
    await Promise.all([
      reset("book_", "book_N", books),
      reset("author_", "author_N", authors),
      reset("publisher_", "publisher_N", publishers),
    ]);
    await redis.del(LIST, ERRORS_LIST);
    return response(200, {
      message: "Base de datos inicializada",
      books: books.length,
      authors: authors.length,
      publishers: publishers.length,
    });
  } catch (error) {
    console.log(error);
    return response(400, { error: error.message });
  }
};
