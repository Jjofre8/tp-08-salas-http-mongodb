const readline = require("node:readline/promises");
const { stdin, stdout } = require("node:process");

const {
  conectarBaseDatos,
  desconectarBaseDatos,
} = require("../src/config/base-datos");

const Reserva = require("../src/modelos/reserva");

const reservasEjemplo = [
  {
    estudiante: "Mario Zalazar",
    email: "mariozalazar5@example.com",
    sala: "Sala Sur",
    fecha: "2026-09-22",
    turno: "Tarde",
    personas: 4,
  },
  {
    estudiante: "Silvana Malebran",
    email: "silvanamalebran75@example.com",
    sala: "Sala Norte",
    fecha: "2026-09-23",
    turno: "Noche",
    personas: 3,
  },
  {
    estudiante: "Ludmila Soria",
    email: "ludmisoria1012@example.com",
    sala: "Sala Multimedia",
    fecha: "2026-09-24",
    turno: "Tarde",
    personas: 1,
  },
];

async function cargarReservaManual(rl) {
  console.log("\n=== NUEVA RESERVA ===");

  const estudiante = await rl.question("Estudiante: ");
  const email = await rl.question("Email: ");

  console.log("\nSalas disponibles:");
  console.log("1. Sala Norte");
  console.log("2. Sala Sur");
  console.log("3. Sala Multimedia");

  const salaOpcion = await rl.question("Seleccioná una sala: ");

  const salas = {
    1: "Sala Norte",
    2: "Sala Sur",
    3: "Sala Multimedia",
  };

  const sala = salas[salaOpcion] || salaOpcion;

  const fecha = await rl.question("Fecha (AAAA-MM-DD): ");

  console.log("\nTurnos disponibles:");
  console.log("1. Mañana");
  console.log("2. Tarde");
  console.log("3. Noche");

  const turnoOpcion = await rl.question("Seleccioná un turno: ");

  const turnos = {
    1: "Mañana",
    2: "Tarde",
    3: "Noche",
  };

  const turno = turnos[turnoOpcion] || turnoOpcion;

  const personas = await rl.question("Cantidad de personas (1 a 6): ");

  return {
    estudiante,
    email,
    sala,
    fecha,
    turno,
    personas: personas.trim() === "" ? null : personas,
  };
}

async function seleccionarReserva(rl) {
  console.log("\n===== CREAR RESERVA =====");
  console.log("1. Mario Zalazar");
  console.log("2. Silvana Malebran");
  console.log("3. Ludmila Soria");
  console.log("4. Cargar una reserva nueva");
  console.log("0. Salir");

  const opcion = (await rl.question("\nSeleccioná una opción: ")).trim();

  if (opcion === "0") {
    return null;
  }

  if (opcion === "4") {
    return cargarReservaManual(rl);
  }

  const indice = Number(opcion) - 1;

  if (!["1", "2", "3"].includes(opcion) || !reservasEjemplo[indice]) {
    console.log("Opción no válida. No se creó ninguna reserva.");
    return null;
  }

  return reservasEjemplo[indice];
}

async function main() {
  const rl = readline.createInterface({
    input: stdin,
    output: stdout,
  });

  let conectado = false;

  try {
    const datos = await seleccionarReserva(rl);

    if (!datos) {
      console.log("Programa finalizado sin crear reservas.");
      return;
    }

    // Validamos antes de conectar para evitar escrituras inválidas.
    const nuevaReserva = new Reserva(datos);
    await nuevaReserva.validate();

    await conectarBaseDatos();
    conectado = true;

    const reservaGuardada = await nuevaReserva.save();

    console.log("\nReserva guardada correctamente.");
    console.log("ID:", reservaGuardada._id.toString());
    console.log("Estudiante:", reservaGuardada.estudiante);
    console.log("Sala:", reservaGuardada.sala);
    console.log("Fecha:", reservaGuardada.fecha);
    console.log("Turno:", reservaGuardada.turno);
    console.log("Personas:", reservaGuardada.personas);
  } catch (error) {
    process.exitCode = 1;

    console.error("\nNo se pudo guardar la reserva.");
    console.error("Tipo:", error.name);

    if (error.name === "ValidationError") {
      for (const campo of Object.keys(error.errors)) {
        console.error(`${campo}: ${error.errors[campo].message}`);
      }
    } else {
      if (error.code) {
        console.error("Código:", error.code);
      }

      if (error.syscall) {
        console.error("Operación:", error.syscall);
      }

      console.error("Revisá la configuración o los datos ingresados.");
    }
  } finally {
    rl.close();

    if (conectado) {
      try {
        await desconectarBaseDatos();
      } catch (error) {
        process.exitCode = 1;
        console.error("Error al cerrar MongoDB:", error.name);
      }
    }
  }
}

main();
