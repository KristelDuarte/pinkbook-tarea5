"use strict";
/**
 * Conexión única a Redis Cloud.
 *
 * Variables de entorno requeridas en Netlify (Site configuration > Environment variables):
 *   REDIS_HOST  Host de la base de datos (sin el puerto).
 *   REDIS_PORT  Puerto de la base de datos.
 *   REDIS_USER  Usuario de la base de datos (Redis Cloud lo llama "username", por defecto "default").
 *   REDIS_PSW   Password de la base de datos (no es la contraseña de la cuenta).
 *   REDIS_TLS   "true" si el endpoint de Redis Cloud exige TLS (recomendado).
 */
const Redis = require("ioredis");

const options = {
  host: process.env.REDIS_HOST || "127.0.0.1",
  port: parseInt(process.env.REDIS_PORT || "6379", 10),
  maxRetriesPerRequest: 3,
  connectTimeout: 10000,
};

if (process.env.REDIS_USER) {
  options.username = process.env.REDIS_USER;
}
if (process.env.REDIS_PSW) {
  options.password = process.env.REDIS_PSW;
}
if (String(process.env.REDIS_TLS).toLowerCase() === "true") {
  options.tls = {};
}

const client = new Redis(options);

client.on("connect", function () {
  console.log("You are now connected to Redis");
});
client.on("error", function (error) {
  console.log("Redis error:", error.message);
});

module.exports = client;
