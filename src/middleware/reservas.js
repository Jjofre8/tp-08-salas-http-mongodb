const salasPermitidas = ["Sala Norte", "Sala Sur", "Sala Multimedia"];

const turnosPermitidos = ["Mañana", "Tarde", "Noche"];

function prepararAreaReservas(req, res, next) {
  res.locals.seccion = "Reservas de salas de estudio";
  next();
}

function validarDatosReserva(datos) {
  const errores = [];

  const entrada =
    datos !== null && typeof datos === "object" && !Array.isArray(datos)
      ? datos
      : {};

  function leerTexto(campo, etiqueta) {
    const valor = entrada[campo];

    if (typeof valor !== "string") {
      errores.push(`${etiqueta} debe ser un texto.`);
      return "";
    }

    return valor.trim();
  }

  const estudiante = leerTexto("estudiante", "El estudiante");
  const email = leerTexto("email", "El correo electrónico");
  const sala = leerTexto("sala", "La sala");
  const fecha = leerTexto("fecha", "La fecha");
  const turno = leerTexto("turno", "El turno");

  const personasOriginal = entrada.personas;
  let personas;

  if (
    typeof personasOriginal === "number" &&
    Number.isInteger(personasOriginal)
  ) {
    personas = personasOriginal;
  } else if (
    typeof personasOriginal === "string" &&
    /^[0-9]+$/.test(personasOriginal.trim())
  ) {
    personas = Number(personasOriginal.trim());
  }

  if (!estudiante) {
    errores.push("El nombre del estudiante es obligatorio.");
  }

  if (!email || !email.includes("@")) {
    errores.push("El correo electrónico debe contener @.");
  }

  if (!salasPermitidas.includes(sala)) {
    errores.push("La sala seleccionada no es válida.");
  }

  if (!fecha) {
    errores.push("La fecha es obligatoria.");
  }

  if (!turnosPermitidos.includes(turno)) {
    errores.push("El turno seleccionado no es válido.");
  }

  if (!Number.isInteger(personas) || personas < 1 || personas > 6) {
    errores.push(
      "La cantidad de personas debe ser un número entero entre 1 y 6."
    );
  }

  return {
    errores,
    reserva: {
      estudiante,
      email,
      sala,
      fecha,
      turno,
      personas,
    },
  };
}

function validarReserva(req, res, next) {
  const resultado = validarDatosReserva(req.body);

  if (resultado.errores.length > 0) {
    const valores =
      req.body && typeof req.body === "object" && !Array.isArray(req.body)
        ? req.body
        : {};

    const valoresFormulario = {};

    for (const campo of [
      "estudiante",
      "email",
      "sala",
      "fecha",
      "turno",
      "personas",
    ]) {
      valoresFormulario[campo] =
        typeof valores[campo] === "string" || typeof valores[campo] === "number"
          ? String(valores[campo])
          : "";
    }

    return res.status(400).render("reservas/nueva", {
      titulo: "Nueva reserva",
      errores: resultado.errores,
      valores: valoresFormulario,
      salasPermitidas,
      turnosPermitidos,
    });
  }

  req.reservaValidada = resultado.reserva;

  return next();
}

function validarReservaApi(req, res, next) {
  const resultado = validarDatosReserva(req.body);

  if (resultado.errores.length > 0) {
    return res.status(400).json({
      error: "Datos de reserva inválidos.",
      detalles: resultado.errores,
    });
  }

  req.reservaValidada = resultado.reserva;

  return next();
}

module.exports = {
  prepararAreaReservas,
  validarReserva,
  validarReservaApi,
  validarDatosReserva,
  salasPermitidas,
  turnosPermitidos,
};
