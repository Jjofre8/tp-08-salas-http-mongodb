const { URL } = require("node:url");

function crearControladorReservasApi(servicio) {
  async function listar(req, res) {
    const url = new URL(req.originalUrl, "http://localhost");

    const parametros = url.searchParams;

    for (const nombre of parametros.keys()) {
      if (nombre !== "sala") {
        return res.status(400).json({
          error: "Solo se permite filtrar por sala.",
        });
      }
    }

    const salas = parametros.getAll("sala");

    if (salas.length > 1) {
      return res.status(400).json({
        error: "El parámetro sala no puede repetirse.",
      });
    }

    let sala;

    if (salas.length === 1) {
      sala = salas[0];

      if (sala.trim() === "") {
        return res.status(400).json({
          error: "El filtro sala no puede estar vacío.",
        });
      }
    }

    const reservas = await servicio.listar(sala);

    return res.status(200).json(reservas);
  }

  async function detalle(req, res) {
    const id = req.params.id;

    if (!/^[a-fA-F0-9]{24}$/.test(id)) {
      return res.status(400).json({
        error: "El identificador de la reserva no es válido.",
      });
    }

    const reserva = await servicio.buscarPorId(id);

    if (!reserva) {
      return res.status(404).json({
        error: "La reserva solicitada no existe.",
      });
    }

    return res.status(200).json(reserva);
  }

  async function crear(req, res) {
    const reserva = await servicio.crear(req.reservaValidada);

    res.location(`/api/reservas/${reserva.id}`);

    return res.status(201).json(reserva);
  }

  return {
    listar,
    detalle,
    crear,
  };
}

module.exports = crearControladorReservasApi;
