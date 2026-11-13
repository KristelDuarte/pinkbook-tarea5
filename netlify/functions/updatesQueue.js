"use strict";
/**
 * Cola de actualizaciones diferidas.
 *
 * Todas las operaciones de escritura (libros, autores y editoriales) se registran
 * como un elemento JSON dentro de la lista de Redis llamada `bookstore`.
 * Cada función *Tasks (bookTasks, authorTasks, publisherTasks) recorre esa lista,
 * toma los mensajes de su entidad y llama a la función *Batch correspondiente.
 *
 * Formato de cada elemento de la lista:
 *   { "entity": "book", "method": "INSERT", "data": { ... } }
 */
const redis = require("./redisDB");

const LIST = process.env.UPDATES_LIST || "bookstore";
const ERRORS_LIST = `${LIST}_errors`;

async function pushUpdate(entity, method, data) {
  const message = JSON.stringify({ entity, method, data });
  await redis.rpush(LIST, message);
  return message;
}

async function pendingCounts() {
  const [pending, errors] = await Promise.all([
    redis.llen(LIST),
    redis.llen(ERRORS_LIST),
  ]);
  return { pending, errors };
}

/**
 * Recorre la lista y procesa únicamente los mensajes de la entidad indicada.
 * Los mensajes de las otras entidades se vuelven a encolar (rotan al final),
 * de manera que bookTasks no consume las actualizaciones de autores/editoriales.
 *
 * Se usa un candado con expiración para evitar que dos invocaciones concurrentes
 * procesen el mismo mensaje.
 */
async function drain(entity, onUpdate) {
  const lockKey = `tasks_lock:${entity}`;
  const token = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  const acquired = await redis.set(lockKey, token, "EX", 60, "NX");
  if (!acquired) {
    return { processed: 0, failed: 0, busy: true };
  }

  let processed = 0;
  let failed = 0;
  try {
    const total = await redis.llen(LIST);
    for (let i = 0; i < total; i++) {
      const raw = await redis.lpop(LIST);
      if (raw == null) break;

      let update;
      try {
        update = JSON.parse(raw);
      } catch (error) {
        failed++;
        await redis.rpush(ERRORS_LIST, raw);
        continue;
      }

      if (!update || update.entity !== entity) {
        await redis.rpush(LIST, raw);
        continue;
      }

      try {
        await onUpdate(update);
        processed++;
      } catch (error) {
        failed++;
        await redis.rpush(ERRORS_LIST, raw);
        console.log(`Error procesando ${entity} ${update.method}:`, error.message);
      }
    }
    return { processed, failed, busy: false };
  } finally {
    if ((await redis.get(lockKey)) === token) {
      await redis.del(lockKey);
    }
  }
}

module.exports = { LIST, ERRORS_LIST, pushUpdate, pendingCounts, drain };
