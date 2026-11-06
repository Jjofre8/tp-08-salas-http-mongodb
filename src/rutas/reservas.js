const express = require("express");

const {
  prepararAreaReservas,
  validarReserva,
} = require("../middleware/reservas");

function crearRouterReservas(controlador) {
  const router = express.Router();

  router.use(prepararAreaReservas);

  router.get("/", controlador.listar);

  router.get("/nueva", controlador.nueva);

  router.get("/:id", controlador.detalle);

  router.post("/", validarReserva, controlador.crear);

  return router;
}

module.exports = crearRouterReservas;
