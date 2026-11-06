function crearControladorReservas(servicio) {
  function inicio(req, res) {
    res.render("inicio", {
      titulo: "Reservas de salas de estudio",
    });
  }

  async function estado(req, res) {
    const cantidad = await servicio.contar();

    return res.json({
      servicio: "activo",
      reservas: cantidad,
      solicitudId: res.locals.solicitudId,
    });
  }

  async function listar(req, res) {
    const reservas = await servicio.listar();

    return res.render("reservas/lista", {
      titulo: "Reservas registradas",
      reservas,
    });
  }

  function nueva(req, res) {
    return res.render("reservas/nueva", {
      titulo: "Nueva reserva",
      errores: [],
      valores: {},
      salasPermitidas: servicio.obtenerSalasPermitidas(),
      turnosPermitidos: servicio.obtenerTurnosPermitidos(),
    });
  }

  async function detalle(req, res) {
    const id = req.params.id;

    if (!/^[a-fA-F0-9]{24}$/.test(id)) {
      return res.status(400).render("no-encontrado", {
        titulo: "Identificador inválido",
        mensaje: "El identificador de la reserva no es válido.",
      });
    }

    const reserva = await servicio.buscarPorId(id);

    if (!reserva) {
      return res.status(404).render("no-encontrado", {
        titulo: "Reserva no encontrada",
        mensaje: "La reserva solicitada no existe.",
      });
    }

    return res.render("reservas/detalle", {
      titulo: "Detalle de la reserva",
      reserva,
    });
  }

  async function crear(req, res) {
    await servicio.crear(req.reservaValidada);

    return res.redirect(302, "/reservas");
  }

  return {
    inicio,
    estado,
    listar,
    nueva,
    detalle,
    crear,
  };
}

module.exports = crearControladorReservas;
