const mongoose = require("mongoose");
const Reserva = require("../modelos/reserva");

const salasPermitidas = ["Sala Norte", "Sala Sur", "Sala Multimedia"];

const turnosPermitidos = ["Mañana", "Tarde", "Noche"];

function crearServicioReservas() {
  async function listar(sala) {
    const criterio = {};

    if (sala !== undefined) {
      criterio.sala = sala;
    }

    const reservas = await Reserva.find(criterio).lean();

    return reservas.map(convertirReserva);
  }

  async function buscarPorId(id) {
    if (!mongoose.isObjectIdOrHexString(id)) {
      const error = new Error("El identificador no tiene un formato válido.");
      error.status = 400;
      throw error;
    }

    const reserva = await Reserva.findById(id).lean();

    return reserva ? convertirReserva(reserva) : null;
  }

  async function contar() {
    return Reserva.countDocuments({});
  }

  async function crear(datos) {
    const nuevaReserva = new Reserva({
      estudiante: datos.estudiante,
      email: datos.email,
      sala: datos.sala,
      fecha: datos.fecha,
      turno: datos.turno,
      personas: datos.personas,
    });

    const reservaGuardada = await nuevaReserva.save();

    return convertirReserva(reservaGuardada.toObject());
  }

  function obtenerSalasPermitidas() {
    return salasPermitidas;
  }

  function obtenerTurnosPermitidos() {
    return turnosPermitidos;
  }

  return {
    listar,
    buscarPorId,
    contar,
    crear,
    obtenerSalasPermitidas,
    obtenerTurnosPermitidos,
  };
}

function convertirReserva(documento) {
  return {
    id: documento._id.toString(),
    estudiante: documento.estudiante,
    email: documento.email,
    sala: documento.sala,
    fecha: documento.fecha,
    turno: documento.turno,
    personas: documento.personas,
    estado: documento.estado,
  };
}

module.exports = crearServicioReservas;
