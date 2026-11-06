const express = require("express");

const { validarReservaApi } = require("../middleware/reservas");

function crearRouterReservasApi(controlador) {
  const router = express.Router();

  router.get("/", controlador.listar);

  router.get("/:id", controlador.detalle);

  router.post("/", validarReservaApi, controlador.crear);

  return router;
}

module.exports = crearRouterReservasApi;
